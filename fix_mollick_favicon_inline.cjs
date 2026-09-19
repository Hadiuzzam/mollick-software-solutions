const fs = require("fs");
const path = require("path");

const root = process.cwd();
const indexFile = path.join(root, "index.html");

if (!fs.existsSync(indexFile)) {
  console.error("ERROR: index.html not found.");
  process.exit(1);
}

const original = fs.readFileSync(indexFile, "utf8");
let updated = original;

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = path.join(root, ".mollick-backups", `favicon-inline-${stamp}`);
fs.mkdirSync(backupDir, { recursive: true });
fs.writeFileSync(path.join(backupDir, "index.html"), original, "utf8");

// Remove all existing favicon / shortcut-icon / apple-touch-icon links
updated = updated.replace(
  /\s*<link\b[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*>\s*/gi,
  "\n"
);

const faviconBlock = `
    <!-- Mollick favicon: inline to avoid path/base/cache problems -->
    <link rel="icon" type="image/png" href="data:image/png;base64,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" />
    <link rel="shortcut icon" type="image/png" href="data:image/png;base64,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" />
`;

const titlePos = updated.indexOf("<title>");

if (titlePos >= 0) {
  updated =
    updated.slice(0, titlePos) +
    faviconBlock +
    "\n    " +
    updated.slice(titlePos);
} else {
  updated = updated.replace("</head>", faviconBlock + "\n  </head>");
}

fs.writeFileSync(indexFile, updated, "utf8");

console.log("");
console.log("SUCCESS!");
console.log("Inline Mollick favicon added directly inside index.html.");
console.log("This does not depend on /public path or GitHub Pages base path.");
console.log(`Backup: ${backupDir}`);
console.log("");
console.log("IMPORTANT:");
console.log("1. Stop the Vite server.");
console.log("2. Start again: npm run dev -- --host");
console.log("3. Close the old browser tab completely.");
console.log("4. Open the site in a NEW tab.");
