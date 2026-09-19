const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src", "App.jsx");

if (!fs.existsSync(file)) {
  console.error("ERROR: src/App.jsx not found.");
  process.exit(1);
}

const original = fs.readFileSync(file, "utf8");
let updated = original;

const replacements = [
  {
    from: '"We build software that grow"',
    to: '"Your plan,"'
  },
  {
    from: '"your business."',
    to: '"our responsibility to bring it to life."'
  },
  {
    from: '"আমরা এমন সফটওয়্যার তৈরি করি,"',
    to: '"পরিকল্পনা আপনার,"'
  },
  {
    from: '"যা আপনার ব্যবসাকে এগিয়ে নিয়ে যায়।"',
    to: '"বাস্তবায়নের দায়িত্ব আমাদের।"'
  }
];

let changed = 0;

for (const { from, to } of replacements) {
  if (updated.includes(from)) {
    updated = updated.replace(from, to);
    changed++;
    console.log(`Updated: ${from} -> ${to}`);
  } else {
    console.warn(`Not found: ${from}`);
  }
}

if (changed === 0) {
  console.error("\nNothing was changed.");
  process.exit(1);
}

const backupDir = path.join(process.cwd(), ".mollick-backups");
fs.mkdirSync(backupDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupFile = path.join(
  backupDir,
  `App-before-hero-title-${stamp}.jsx`
);

fs.writeFileSync(backupFile, original, "utf8");
fs.writeFileSync(file, updated, "utf8");

console.log("\nSUCCESS!");
console.log(`Changed ${changed} hero text item(s).`);
console.log(`Backup: ${backupFile}`);
console.log("\nBangla:");
console.log("পরিকল্পনা আপনার,");
console.log("বাস্তবায়নের দায়িত্ব আমাদের।");
console.log("\nEnglish:");
console.log("Your plan,");
console.log("our responsibility to bring it to life.");
console.log("\nNow run: npm run dev -- --host");
