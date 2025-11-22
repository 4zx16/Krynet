const https = require("https");

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(JSON.parse(data)));
    }).on("error", reject);
  });
}

export default async function handler(req, res) {
  const { url } = req.query;
  if(!url) return res.status(400).send("No URL provided.");

  const decodedURL = decodeURIComponent(url);
  let embedHTML = "";
  let title = "Embedded Content";
  let thumb = "";
  let type = "website";

  try {
    // --- Known media types ---
    if(decodedURL.includes("youtube.com") || decodedURL.includes("youtu.be")) {
      const id = decodedURL.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)[1];
      embedHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}" allowfullscreen></iframe>`;
      thumb = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      title = `YouTube Video ${id}`;
      type = "video.other";
    }
    else if(decodedURL.includes("vimeo.com")) {
      const id = decodedURL.match(/vimeo.com\/(\d+)/)[1];
      embedHTML = `<iframe src="https://player.vimeo.com/video/${id}" allowfullscreen></iframe>`;
      title = `Vimeo Video ${id}`;
      type = "video.other";
    }
    else if(decodedURL.includes("soundcloud.com")) {
      embedHTML = `<iframe src="https://w.soundcloud.com/player/?url=${encodeURIComponent(decodedURL)}" allowfullscreen></iframe>`;
      title = "SoundCloud Track";
      type = "music.song";
    }
    else if(decodedURL.match(/\.(mp4|webm)$/)) {
      embedHTML = `<video controls src="${decodedURL}" style="max-width:90vw; max-height:80vh;"></video>`;
      title = "Video File";
      type = "video.other";
    }
    else if(decodedURL.match(/\.(mp3|wav)$/)) {
      embedHTML = `<audio controls src="${decodedURL}" style="max-width:90vw;"></audio>`;
      title = "Audio File";
      type = "music.song";
    }
    // --- Fallback to Iframely ---
    else {
      const IFRA_KEY = "f3c7705c1575176127f4ae";
      const apiURL = `https://iframe.ly/api/iframely?url=${encodeURIComponent(decodedURL)}&api_key=${IFRA_KEY}`;
      const data = await fetchJSON(apiURL);

      if(data.html) embedHTML = data.html;
      if(data.meta && data.meta.title) title = data.meta.title;
      if(data.links && data.links.thumbnail) thumb = data.links.thumbnail.href;
      type = (data.meta && data.meta.type) || "website";
    }

    // --- Generate HTML ---
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>

<meta property="og:type" content="${type}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="Embedded via Krynet">
<meta property="og:image" content="${thumb}">
<meta property="og:video" content="${decodedURL}">
<meta property="og:video:type" content="text/html">

<meta name="twitter:card" content="player">
<meta name="twitter:player" content="${decodedURL}">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="Embedded via Krynet">
<meta name="twitter:image" content="${thumb}">

<style>
body { margin:0; display:flex; justify-content:center; align-items:center; height:100vh; background:#111; color:#fff; }
iframe, video, audio { max-width:90vw; max-height:80vh; border:none; border-radius:8px; }
</style>
</head>
<body>
  ${embedHTML}
</body>
</html>
    `;

    res.setHeader('Content-Type','text/html');
    res.status(200).send(html);

  } catch(e) {
    console.error(e);
    res.status(500).send("Error generating embed.");
  }
}
