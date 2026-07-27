const httpClient = require('../utils/httpClient');

const BASE_PARAMS = {
  _format: 'json',
  _marker: '0',
  api_version: '4',
  ctx: 'web6dot0'
};

// Helper to format JioSaavn's encrypted media URLs to direct streaming URLs
const formatMediaUrl = (url) => {
  if (!url) return '';
  let formattedUrl = url.replace('preview.saavncdn.com', 'aac.saavncdn.com');
  formattedUrl = formattedUrl.replace('_96_p', '_320');
  formattedUrl = formattedUrl.replace('_96_p.mp4', '_320.mp4');
  return formattedUrl;
};

const formatSongData = (song) => ({
  id: song.id,
  title: song.title || song.song,
  subtitle: song.subtitle,
  type: song.type,
  image: song.image ? song.image.replace('150x150', '500x500') : '',
  url: formatMediaUrl(song.media_preview_url),
  duration: song.duration,
  has_lyrics: song.has_lyrics,
  primary_artists: song.primary_artists,
  album: song.album
});

const getTrending = async () => {
  const { data } = await httpClient.get('', {
    params: { ...BASE_PARAMS, __call: 'webapi.getLaunchData' }
  });
  
  const trendingSongs = data.new_trending || [];
  return trendingSongs.filter(item => item.type === 'song').map(formatSongData);
};

const searchSongs = async (query) => {
  const { data } = await httpClient.get('', {
    params: { ...BASE_PARAMS, __call: 'search.getResults', q: query, n: 20, p: 1 }
  });
  
  if (!data.results) return [];
  return data.results.map(formatSongData);
};

const getSongDetails = async (id) => {
  const { data } = await httpClient.get('', {
    params: { ...BASE_PARAMS, __call: 'song.getDetails', pids: id }
  });
  
  const songData = data[id] || (data.songs && data.songs[0]);
  if (!songData) throw new Error('Song not found');
  
  return formatSongData(songData);
};

const getLyrics = async (id) => {
  const { data } = await httpClient.get('', {
    params: { ...BASE_PARAMS, __call: 'lyrics.getLyrics', lyrics_id: id }
  });
  return data;
};

module.exports = {
  getTrending,
  searchSongs,
  getSongDetails,
  getLyrics
};
