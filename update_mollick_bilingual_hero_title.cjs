const fs = require("fs");
const path = require("path");

const root = process.cwd();
const file = path.join(root, "src", "App.jsx");

if (!fs.existsSync(file)) {
  console.error("ERROR: src/App.jsx not found.");
  process.exit(1);
}

const source = fs.readFileSync(file, "utf8");
let updated = source;

const replacements = [
  {
    label: "Bangla hero title",
    from: "আমরা এমন সফটওয়্যার তৈরি করি, যা আপনার ব্যবসাকে এগিয়ে নিয়ে যায়।",
    to: "পরিকল্পনা আপনার, বাস্তবায়নের দায়িত্ব আমাদের।",
  },
  {
    label: "English hero title",
    from: "We build software that moves your business forward.",
    to: "Your plan, our responsibility to bring it to life.",
  },
  {
    label: "English hero title alt",
    from: "We build software that takes your business forward.",
    to: "Your plan, our responsibility to bring it to life.",
  },
  {
    label: "English hero title alt 2",
    from: "We create software that moves your business forward.",
    to: "Your plan, our responsibility to bring it to life.",
  }
];

let changes = 0;

for (const item of replacements) {
  if (updated.includes(item.from)) {
    updated = updated.split(item.from).join(item.to);
    console.log(`Updated: ${item.label}`);
    changes++;
  }
}

if (changes === 0) {
  console.error("\nNo matching hero title text was found.");
  console.error("Nothing was changed.");
  console.error("\nSend me the current hero-title code block from src/App.jsx and I will adjust the script.");
  process.exit(1);
}

const backupDir = path.join(root, ".mollick-backups");
fs.mkdirSync(backupDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupFile = path.join(
  backupDir,
  `App-before-hero-title-${stamp}.jsx`
);

fs.writeFileSync(backupFile, source, "utf8");
fs.writeFileSync(file, updated, "utf8");

console.log("\nSUCCESS!");
console.log("Only the bilingual hero title text was updated.");
console.log("Bangla : পরিকল্পনা আপনার, বাস্তবায়নের দায়িত্ব আমাদের।");
console.log("English: Your plan, our responsibility to bring it to life.");
console.log(`Backup: ${backupFile}`);
