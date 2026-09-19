const fs = require("fs");
const path = require("path");

const root = process.cwd();
const srcDir = path.join(root, "src");
const stylesFile = path.join(srcDir, "styles.css");

if (!fs.existsSync(srcDir) || !fs.existsSync(stylesFile)) {
  console.error("ERROR: src/styles.css was not found.");
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupRoot = path.join(
  root,
  ".mollick-backups",
  `english-inter-font-${stamp}`
);

fs.mkdirSync(backupRoot, { recursive: true });

function walk(dir) {
  let files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files = files.concat(walk(full));
    } else if (/\.(css|jsx|js|tsx|ts)$/i.test(entry.name)) {
      files.push(full);
    }
  }

  return files;
}

function backupFile(file, original) {
  const rel = path.relative(root, file);
  const backupPath = path.join(backupRoot, rel);

  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.writeFileSync(backupPath, original, "utf8");
}

let changedFiles = 0;
let weightChanges = 0;

/*
 * 1) English-only heavy weights:
 *    850 / 900 become 800 in English.
 *    Bangla keeps the original 850 / 900 values through CSS variables.
 */
for (const file of walk(srcDir)) {
  const original = fs.readFileSync(file, "utf8");
  let updated = original;

  updated = updated.replace(
    /font-weight\s*:\s*900(\s*!important)?\s*;/g,
    (_, important = "") => {
      weightChanges++;
      return `font-weight: var(--mollick-fw-900, 900)${important};`;
    }
  );

  updated = updated.replace(
    /font-weight\s*:\s*850(\s*!important)?\s*;/g,
    (_, important = "") => {
      weightChanges++;
      return `font-weight: var(--mollick-fw-850, 850)${important};`;
    }
  );

  if (updated !== original) {
    backupFile(file, original);
    fs.writeFileSync(file, updated, "utf8");
    changedFiles++;
  }
}

/*
 * 2) Load Inter together with the existing Bengali font.
 *    This keeps the current Noto Sans Bengali setup intact.
 */
let styles = fs.readFileSync(stylesFile, "utf8");
const stylesBeforeTypography = styles;

const combinedGoogleFont =
  "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700;800&display=swap');";

const googleImportRegex =
  /@import\s+url\(['"]https:\/\/fonts\.googleapis\.com\/css2\?family=Noto\+Sans\+Bengali:[^'"]+['"]\);?/;

if (googleImportRegex.test(styles)) {
  styles = styles.replace(googleImportRegex, combinedGoogleFont);
} else if (!styles.includes("family=Inter")) {
  styles = combinedGoogleFont + "\n" + styles;
}

/*
 * 3) English-only font override.
 *    Bangla is deliberately untouched.
 */
const START = "/* === MOLLICK ENGLISH INTER TYPOGRAPHY START === */";
const END = "/* === MOLLICK ENGLISH INTER TYPOGRAPHY END === */";

const typographyBlock = `
${START}

/*
  English website typography only.
  Bangla remains on the existing Bengali font.
*/
html[lang="en"] {
  --mollick-fw-850: 800;
  --mollick-fw-900: 800;
}

html[lang="bn"] {
  --mollick-fw-850: 850;
  --mollick-fw-900: 900;
}

html[lang="en"] body,
html[lang="en"] body * {
  font-family: "Inter", sans-serif !important;
}

/* Hero: cleaner premium weight, not too heavy */
html[lang="en"] .mollick-boom-hero h1,
html[lang="en"] .mollick-boom-hero h1 span,
html[lang="en"] .mollick-boom-hero h1 strong {
  font-family: "Inter", sans-serif !important;
  font-weight: 700 !important;
}

/* Keep strong section headings within the requested maximum */
html[lang="en"] h1,
html[lang="en"] h2,
html[lang="en"] h3,
html[lang="en"] h4,
html[lang="en"] h5,
html[lang="en"] h6 {
  font-family: "Inter", sans-serif !important;
}

${END}
`.trim();

const blockRegex = new RegExp(
  START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
    "[\\s\\S]*?" +
    END.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  "m"
);

if (blockRegex.test(styles)) {
  styles = styles.replace(blockRegex, typographyBlock);
} else {
  styles = styles.trimEnd() + "\n\n" + typographyBlock + "\n";
}

if (styles !== stylesBeforeTypography) {
  // Backup styles.css only if it wasn't already backed up above.
  const backupStylesPath = path.join(
    backupRoot,
    path.relative(root, stylesFile)
  );

  if (!fs.existsSync(backupStylesPath)) {
    backupFile(stylesFile, stylesBeforeTypography);
  }

  fs.writeFileSync(stylesFile, styles, "utf8");
}

console.log("");
console.log("SUCCESS!");
console.log("");
console.log("English font: Inter");
console.log("English hero weight: 700");
console.log("English maximum converted heavy weight: 800");
console.log("Bangla font and Bangla heavy weights: unchanged");
console.log("");
console.log(`Heavy weight declarations updated: ${weightChanges}`);
console.log(`Backup folder: ${backupRoot}`);
console.log("");
console.log("Now run:");
console.log("npm run dev -- --host");
