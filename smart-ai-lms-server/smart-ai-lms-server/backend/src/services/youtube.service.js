const axios = require("axios");
const cheerio = require("cheerio");

exports.searchYouTube = async (query) => {
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

    const { data } = await axios.get(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const videoIds = [];
    const regex = /"videoId":"(.*?)"/g;

    let match;
    while ((match = regex.exec(data)) !== null) {
      if (!videoIds.includes(match[1])) {
        videoIds.push(match[1]);
      }
      if (videoIds.length >= 10) break;
    }

    const videos = videoIds.map((id) => ({
      videoId: id,
      url: `https://www.youtube.com/watch?v=${id}`,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    }));

    return videos;
  } catch (error) {
    console.error("YouTube Scraping Error:", error.message);
    throw new Error("Failed to fetch YouTube videos");
  }
};
