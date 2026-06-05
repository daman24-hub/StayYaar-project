const https = require("https");

const ACCESS_KEY = "gm5NX1SJghhrMSlx4A-uU7eLH0o6K1JcmBDAU0BuBP4";
const queries = ["hotel", "resort", "villa", "beach", "cabin", "castle", "pool"];
let allUrls = [];

async function fetchImages() {
  for (let query of queries) {
    const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=15&orientation=landscape&client_id=${ACCESS_KEY}`;
    
    const data = await new Promise((resolve) => {
      https.get(url, { headers: { "Accept-Version": "v1" } }, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve(JSON.parse(body)));
      });
    });

    data.results.forEach((photo) => {
      allUrls.push(`"${photo.urls.regular}"`);
    });
  }

  console.log("const placeImages = [");
  console.log(allUrls.slice(0, 100).join(",\n"));
  console.log("];");
}

fetchImages();