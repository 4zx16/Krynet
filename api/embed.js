import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { url } = req.query;
  if(!url) return res.status(400).send("No URL provided.");

  const decodedURL = decodeURIComponent(url);

  let embedHTML = "";
  let title = "Embedded Content";
  let thumb = "";
  let type = "website";

  try {
    // Check YouTube/Vimeo/SoundCloud/direct video first (same as before)
    if(decodedURL.includes("youtube.com") || decodedURL.includes("youtu.be")){
      const id = decodedURL.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)[1];
      embedHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}" allowfullscreen></iframe>`;
      thumb = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      title = `YouTube Video ${id}`;
      type = "video.other";
    }
    // Fallback to Iframely for any other site
    else {
      const IFRA_KEY = "f3c7705c1575176127f4ae";
      const apiURL = `https://iframe.ly/api/iframely?url=${encodeURIComponent(decodedURL)}&api_key=${IFRA_KEY}`;
      const data = await fetch(apiURL).then(r => r.json());

      if(data.html) embedHTML = data.html;
      if(data.meta.title) title = data.meta.title;
      if(data.links.thumbnail) thumb = data.links.thumbnail.href;
      type = data.meta.type || "website";
    }

    // Generate HTML with OG + Twitter meta
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

  } catch(e){
    console.error(e);
    res.status(500).send("Error generating embed.");
  }
}
