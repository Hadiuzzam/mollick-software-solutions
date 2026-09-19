const fs = require("fs");
const path = require("path");

const root = process.cwd();
const publicDir = path.join(root, "public");

if (!fs.existsSync(publicDir)) {
  console.error("ERROR: public folder not found.");
  process.exit(1);
}

const scriptDir = __dirname;
const imageNames = ["what1.webp", "what2.webp", "what3.webp"];

for (const name of imageNames) {
  const source = path.join(scriptDir, name);
  if (!fs.existsSync(source)) {
    console.error(`ERROR: Missing ${name} beside this script.`);
    process.exit(1);
  }
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = path.join(
  root,
  ".mollick-backups",
  `what-we-do-images-${stamp}`
);

fs.mkdirSync(backupDir, { recursive: true });

for (const name of imageNames) {
  const destination = path.join(publicDir, name);

  if (fs.existsSync(destination)) {
    fs.copyFileSync(destination, path.join(backupDir, name));
    console.log(`Backup: public/${name}`);
  }

  fs.copyFileSync(path.join(scriptDir, name), destination);
  console.log(`Updated: public/${name}`);
}

console.log("\nSUCCESS!");
console.log("Replaced all 3 What We Do images.");
console.log("No JSX/CSS/text/layout was changed.");
console.log(`Backup folder: ${backupDir}`);
console.log("\nImage mapping:");
console.log("what1.webp -> Combine multiple apps to one");
console.log("what2.webp -> Built from scratch");
console.log("what3.webp -> Custom dashboards");
console.log("\nNow run:");
console.log("npm run dev -- --host");
