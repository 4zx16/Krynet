export default function handler(req, res) {
  const { url } = req.query;
  if(!url){
    res.status(400).send("No URL provided. Use ?url=LINK");
    return;
  }

  const decodedURL = decodeURIComponent(url);
  let title = "Embedded Content";
  let thumb = "";
  let embedHTML = "";
  let type = "website";

  try {
    // YouTube
    const ytMatch = decodedURL.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    if((decodedURL.includes("youtube.com") || decodedURL.includes("youtu.be")) && ytMatch){
      const id = ytMatch[1];
      embedHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}" allowfullscreen></iframe>`;
      thumb = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      title = `YouTube Video ${id}`;
      type = "video.other";
    }
    // Vimeo
    else if(decodedURL.includes("vimeo.com")){
      const vimeoMatch = decodedURL.match(/vimeo.com\/(\d+)/);
      const id = vimeoMatch ? vimeoMatch[1] : null;
      if(id){
        embedHTML = `<iframe src="https://player.vimeo.com/video/${id}" allowfullscreen></iframe>`;
        title = `Vimeo Video ${id}`;
        type = "video.other";
      }
    }
    // SoundCloud
    else if(decodedURL.includes("soundcloud.com")){
      embedHTML = `<iframe src="https://w.soundcloud.com/player/?url=${encodeURIComponent(decodedURL)}" allowfullscreen></iframe>`;
      title = `SoundCloud Track`;
      type = "music.song";
    }
    // Direct video
    else if(decodedURL.match(/\.(mp4|webm)$/)){
      embedHTML = `<video controls src="${decodedURL}"></video>`;
      title = "Video File";
      type = "video.other";
    }
    // Direct audio
    else if(decodedURL.match(/\.(mp3|wav)$/)){
      embedHTML = `<audio controls src="${decodedURL}"></audio>`;
      title = "Audio File";
      type = "music.song";
    }
    // Generic fallback
    else{
      embedHTML = `<iframe src="${decodedURL}" allowfullscreen></iframe>`;
    }

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
<meta property="og:video:width" content="1280">
<meta property="og:video:height" content="720">

<meta name="twitter:card" content="player">
<meta name="twitter:player" content="${decodedURL}">
<meta name="twitter:player:width" content="1280">
<meta name="twitter:player:height" content="720">
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
