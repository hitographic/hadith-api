const fs = require("fs");
const path = require("path");

// ambil semua file json (recursive)
function getAllJsonFiles(dir) {
  let results = [];

  // skip node_modules atau folder tersembunyi
  if (dir.includes("node_modules") || path.basename(dir).startsWith(".")) {
    return [];
  }

  const list = fs.readdirSync(dir);

  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      console.log("📁 Masuk folder:", filePath);
      results = results.concat(getAllJsonFiles(filePath));
    }

    if (file.endsWith(".json")) {
      results.push(filePath);
    }
  });

  return results;
}

// ambil nama perawi dari tanda [ ]
function buildChain(text) {
  if (!text || typeof text !== "string") return [];

  const match = text.match(/\[(.*?)\]/g);
  if (!match) return [];
  return match.map(n => n.replace(/\[|\]/g, "").trim());
}

// folder utama = tempat addchain.js berada
const BASE_DIR = __dirname;

console.log("\n🔍 SCANNING:", BASE_DIR);

const allJsonFiles = getAllJsonFiles(BASE_DIR);

console.log("\n📄 TOTAL FILE JSON:", allJsonFiles.length);

let updated = 0;
let skipped = 0;

allJsonFiles.forEach(filePath => {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);

    if (!data.hadiths || !Array.isArray(data.hadiths)) {
      skipped++;
      return;
    }

    data.hadiths = data.hadiths.map(hadith => ({
      ...hadith,
      chain: buildChain(hadith.text)
    }));

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    updated++;
    console.log("✅ Updated:", filePath);

  } catch (err) {
    console.log("❌ Error:", filePath);
  }
});

console.log("\n🔥 SELESAI");
console.log("✅ Updated:", updated);
console.log("⏭️ Skipped:", skipped);
