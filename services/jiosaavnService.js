const crypto = require('crypto');
const axios = require('axios'); 

// Secret DES key used by JioSaavn for URL encryption
const DES_KEY = '38346591'; 

/**
 * Decrypts JioSaavn's encrypted_media_url string into a direct playable MP3/MP4 link
 */
function decryptUrl(encryptedMediaUrl) {
    if (!encryptedMediaUrl) return "";
    
    try {
        const key = Buffer.from(DES_KEY, 'utf-8');
        const decipher = crypto.createDecipheriv('des-ecb', key, Buffer.alloc(0));
        decipher.setAutoPadding(false);
        
        let decrypted = decipher.update(encryptedMediaUrl, 'base64', 'utf-8');
        decrypted += decipher.final('utf-8');
        
        let url = decrypted.replace(/\0/g, '').trim();
        url = url.replace('_96.mp4', '_320.mp4'); 
        url = url.replace('_96_p.mp4', '_320.mp4');
        url = url.replace('http:', 'https:');
        
        return url;
    } catch (err) {
        console.error("Failed to decrypt URL:", err.message);
        return "";
    }
}

/**
 * Formats raw JioSaavn song data into a clean structure
 */
function formatSong(song) {
    const encryptedUrl = song.encrypted_media_url || (song.more_info && song.more_info.encrypted_media_url);
    const subtitle = song.subtitle || (song.more_info && song.more_info.singers);
    
    let image = song.image || "";
    if (image.includes('150x150')) {
        image = image.replace('150x150', '500x500');
    }

    return {
        id: song.id,
        title: song.title ? song.title.replace(/&quot;/g, '"') : "",
        subtitle: subtitle,
        type: song.type || "song",
        image: image,
        url: decryptUrl(encryptedUrl) 
    };
}

/**
 * Search songs by query
 */
async function searchSongs(query) {
    try {
        const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&q=${encodeURIComponent(query)}&n=20&p=1&_format=json&_marker=0&ctx=web6dot0`;
        const response = await axios.get(url);
        
        let data = response.data;
        if (typeof data === 'string') {
            data = JSON.parse(data.trim());
        }

        if (!data || !data.results) {
            return [];
        }

        return data.results.map(formatSong);

    } catch (error) {
        console.error("Error fetching search results from JioSaavn:", error.message);
        throw new Error("Failed to fetch songs from JioSaavn");
    }
}

/**
 * Fetch detailed song data including the decrypted audio stream link
 */
async function getSongDetails(songId) {
    try {
        const detailsUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&pids=${songId}&_format=json&ctx=web6dot0`;
        const detailsResponse = await axios.get(detailsUrl);
        
        let data = detailsResponse.data;
        if (typeof data === 'string') {
            data = JSON.parse(data.trim());
        }
        
        const songData = data[songId];
        if (!songData) return null;

        const encryptedUrl = songData.encrypted_media_url || (songData.more_info && songData.more_info.encrypted_media_url);
        const playableUrl = decryptUrl(encryptedUrl);

        return {
            id: songData.id,
            title: songData.title ? songData.title.replace(/&quot;/g, '"') : "",
            subtitle: songData.subtitle || (songData.more_info && songData.more_info.singers),
            type: songData.type || "song",
            image: songData.image ? songData.image.replace('150x150', '500x500') : "",
            url: playableUrl
        };

    } catch (error) {
        console.error("Error fetching song details:", error.message);
        throw new Error("Failed to fetch song details");
    }
}

module.exports = {
    searchSongs,
    getSongDetails,
    formatSong,
    decryptUrl
};
