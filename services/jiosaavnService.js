const crypto = require('crypto');
const httpClient = require('../utils/httpClient.js');

const DES_KEY = '38346591'; // Standard JioSaavn DES Key

/**
 * Generates an array of streaming URLs in various qualities.
 */
function generateMediaUrls(decryptedUrl) {
    if (!decryptedUrl) return [];
    
    // Normalize protocol
    let url = decryptedUrl.replace('http:', 'https:');
    
    // Remove the existing bitrate suffix (e.g., _96.mp4, _96_p.mp4, _320.mp4) to extract the base URL
    const baseUrl = url.replace(/_\d+(_p)?\.(mp4|mp3)/i, '');

    const qualities = [
        { id: '12kbps', suffix: '_12.mp4' },
        { id: '48kbps', suffix: '_48.mp4' },
        { id: '96kbps', suffix: '_96.mp4' },
        { id: '160kbps', suffix: '_160.mp4' },
        { id: '320kbps', suffix: '_320.mp4' }
    ];

    return qualities.map(q => ({
        quality: q.id,
        url: `${baseUrl}${q.suffix}`
    }));
}

/**
 * Decrypts JioSaavn's encrypted_media_url string using DES-ECB.
 */
function decryptUrl(encryptedMediaUrl) {
    if (!encryptedMediaUrl) return [];
    
    try {
        const key = Buffer.from(DES_KEY, 'utf-8');
        const decipher = crypto.createDecipheriv('des-ecb', key, Buffer.alloc(0));
        decipher.setAutoPadding(false);
        
        let decrypted = decipher.update(encryptedMediaUrl, 'base64', 'utf-8');
        decrypted += decipher.final('utf-8');
        
        // Remove null padding bytes
        const cleanUrl = decrypted.replace(/\0/g, '').trim();
        
        return generateMediaUrls(cleanUrl);
    } catch (err) {
        console.error("[DEBUG] Failed to decrypt URL:", err.message);
        return [];
    }
}

/**
 * Parses and maps raw JioSaavn song data into a standardized JSON format.
 */
function formatSong(song) {
    if (!song) return null;

    const moreInfo = song.more_info || {};
    
    // API fields change frequently. We check multiple possible locations.
    const encryptedUrl = song.encrypted_media_url || moreInfo.encrypted_media_url || moreInfo.vlink || "";

    // Parse hi-res image
    let image = song.image || "";
    if (image.includes('150x150')) image = image.replace('150x150', '500x500');
    else if (image.includes('50x50')) image = image.replace('50x50', '500x500');

    // Decode HTML entities in title
    const title = (song.title || "").replace(/&quot;/g, '"').replace(/&amp;/g, '&');

    return {
        id: song.id,
        title: title,
        subtitle: song.subtitle || moreInfo.singers || "",
        album: moreInfo.album || song.album || "",
        artist: moreInfo.singers || song.subtitle || "",
        image: image,
        duration: moreInfo.duration || "",
        language: song.language || moreInfo.language || "",
        year: song.year || moreInfo.year || "",
        explicit: (moreInfo.is_explicit === "true" || moreInfo.explicit_content === "1"),
        downloadUrl: decryptUrl(encryptedUrl) 
    };
}

/**
 * Searches for songs and immediately fetches their full details to ensure downloadUrls are present.
 */
async function searchSongs(query) {
    try {
        // Step 1: Perform the search
        const searchResponse = await httpClient.get('', {
            params: {
                __call: 'search.getResults',
                q: query,
                n: 20,
                p: 1,
                _format: 'json',
                _marker: 0,
                api_version: 4,
                ctx: 'web6dot0'
            }
        });
        
        let searchData = searchResponse.data;
        if (typeof searchData === 'string') searchData = JSON.parse(searchData.trim());

        if (!searchData || !searchData.results || searchData.results.length === 0) {
            return [];
        }

        // Step 2: Extract IDs to redesign the flow. 
        // The search endpoint drops the encrypted URL in v4. We must fetch by ID.
        const songIds = searchData.results.map(song => song.id).join(',');
        console.log(`[DEBUG] Search found IDs: ${songIds}`);

        // Step 3: Fetch full details for all extracted IDs in one bulk request
        const detailsResponse = await httpClient.get('', {
            params: {
                __call: 'song.getDetails',
                pids: songIds,
                _format: 'json',
                _marker: 0,
                api_version: 4,
                ctx: 'web6dot0'
            }
        });

        let detailsData = detailsResponse.data;
        if (typeof detailsData === 'string') detailsData = JSON.parse(detailsData.trim());

        // Step 4: Format the enriched response
        const formattedSongs = [];
        for (const key in detailsData) {
            if (detailsData[key]) {
                formattedSongs.push(formatSong(detailsData[key]));
            }
        }

        return formattedSongs;

    } catch (error) {
        console.error("[ERROR] Service searchSongs:", error.message);
        throw new Error("Failed to fetch search results from JioSaavn");
    }
}

/**
 * Fetches the full details of a specific song.
 */
async function getSongDetails(songId) {
    try {
        const response = await httpClient.get('', {
            params: {
                __call: 'song.getDetails',
                pids: songId,
                _format: 'json',
                _marker: 0,
                api_version: 4,
                ctx: 'web6dot0'
            }
        });
        
        let data = response.data;
        if (typeof data === 'string') data = JSON.parse(data.trim());
        
        const songData = data[songId];
        if (!songData) return null;

        return formatSong(songData);

    } catch (error) {
        console.error("[ERROR] Service getSongDetails:", error.message);
        throw new Error("Failed to fetch song details from JioSaavn");
    }
}

module.exports = {
    searchSongs,
    getSongDetails,
    formatSong,
    decryptUrl
};
