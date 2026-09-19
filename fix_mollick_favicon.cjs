const fs = require("fs");
const path = require("path");

const root = process.cwd();
const indexFile = path.join(root, "index.html");
const publicDir = path.join(root, "public");
const scriptDir = __dirname;

if (!fs.existsSync(indexFile)) {
  console.error("ERROR: index.html not found in project root.");
  process.exit(1);
}

if (!fs.existsSync(publicDir)) {
  console.error("ERROR: public folder not found.");
  process.exit(1);
}

const files = ["favicon.png", "favicon.ico", "apple-touch-icon.png"];

for (const name of files) {
  const source = path.join(scriptDir, name);

  if (!fs.existsSync(source)) {
    console.error(`ERROR: Missing ${name} beside this script.`);
    process.exit(1);
  }
}

const original = fs.readFileSync(indexFile, "utf8");
let updated = original;

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = path.join(root, ".mollick-backups", `favicon-${stamp}`);

fs.mkdirSync(backupDir, { recursive: true });
fs.writeFileSync(path.join(backupDir, "index.html"), original, "utf8");

for (const name of files) {
  const destination = path.join(publicDir, name);

  if (fs.existsSync(destination)) {
    fs.copyFileSync(destination, path.join(backupDir, name));
  }

  fs.copyFileSync(path.join(scriptDir, name), destination);
}

/* Remove existing favicon/apple-touch icon tags */
updated = updated.replace(
  /<link\b[^>]*rel=["'](?:shortcut icon|icon|apple-touch-icon)["'][^>]*>\s*/gi,
  ""
);

const faviconTags = `    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="%BASE_URL%favicon.ico?v=4" />
    <link rel="icon" type="image/png" sizes="64x64" href="%BASE_URL%favicon.png?v=4" />
    <link rel="apple-touch-icon" sizes="180x180" href="%BASE_URL%apple-touch-icon.png?v=4" />
`;

const titleIndex = updated.indexOf("<title>");

if (titleIndex !== -1) {
  updated =
    updated.slice(0, titleIndex) +
    faviconTags +
    "\n" +
    updated.slice(titleIndex);
} else {
  updated = updated.replace("</head>", faviconTags + "\n  </head>");
}

fs.writeFileSync(indexFile, updated, "utf8");

console.log("");
console.log("SUCCESS!");
console.log("New Mollick favicon installed.");
console.log("Updated: public/favicon.ico");
console.log("Updated: public/favicon.png");
console.log("Updated: public/apple-touch-icon.png");
console.log("Updated: index.html");
console.log(`Backup: ${backupDir}`);
console.log("");
console.log("Now run:");
console.log("npm run dev -- --host");
console.log("");
console.log("If the old blank icon remains, hard refresh with Ctrl+F5 or reopen the browser tab.");
