const crypto = require('crypto');
// Assuming you have an httpClient setup, or you can require 'axios' directly if you have it installed.
const axios = require('axios'); 

// JioSaavn's secret DES key used to encrypt/decrypt media URLs
const DES_KEY = '38346591'; 

/**
 * Decrypts JioSaavn's encrypted_media_url into a playable direct stream link.
 */
function decryptUrl(encryptedMediaUrl) {
    if (!encryptedMediaUrl) return "";
    
    try {
        const key = Buffer.from(DES_KEY, 'utf-8');
        const decipher = crypto.createDecipheriv('des-ecb', key, Buffer.alloc(0));
        decipher.setAutoPadding(false);
        
        let decrypted = decipher.update(encryptedMediaUrl, 'base64', 'utf-8');
        decrypted += decipher.final('utf-8');
        
        // Remove padding characters
        let url = decrypted.replace(/\0/g, '').trim();
        
        // Upgrade the quality from 96kbps to 320kbps (optional but recommended)
        url = url.replace('_96.mp4', '_320.mp4'); 
        url = url.replace('_96_p.mp4', '_320.mp4');
        
        // Ensure it routes over HTTPS
        url = url.replace('http:', 'https:');
        
        return url;
    } catch (err) {
        console.error("Failed to decrypt URL:", err.message);
        return "";
    }
}

/**
 * Formats the raw JioSaavn song object into a clean JSON structure
 */
function formatSong(song) {
    // JioSaavn nests data differently depending on the endpoint, so we check multiple paths
    const encryptedUrl = song.encrypted_media_url || (song.more_info && song.more_info.encrypted_media_url);
    const subtitle = song.subtitle || (song.more_info && song.more_info.singers);
    
    // Format the image URL to fetch the high-resolution 500x500 cover art
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
        // Apply the decryption function here to ensure the url field is populated
        url: decryptUrl(encryptedUrl) 
    };
}

/**
 * Searches for songs on JioSaavn based on a query string
 */
async function searchSongs(query) {
    try {
        const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&q=${encodeURIComponent(query)}&n=20&p=1&_format=json&_marker=0&ctx=web6dot0`;
        
        // Replace this with your custom utils/httpClient if needed: e.g., const response = await httpClient.get(url);
        const response = await axios.get(url);
        
        // Safely parse the response data (JioSaavn sometimes returns weird strings)
        let data = response.data;
        if (typeof data === 'string') {
            data = JSON.parse(data.trim());
        }

        // If no results, return an empty array
        if (!data || !data.results) {
            return [];
        }

        // Map the raw results through our formatter which includes the decryption
        return data.results.map(formatSong);

    } catch (error) {
        console.error("Error fetching data from JioSaavn:", error.message);
        throw new Error("Failed to fetch songs from JioSaavn");
    }
}

module.exports = {
    searchSongs,
    formatSong,
    decryptUrl
};
