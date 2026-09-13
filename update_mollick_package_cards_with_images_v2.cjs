const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const APP = path.join(ROOT, "src", "App.jsx");
const CSS = path.join(ROOT, "src", "styles.css");
const SOURCE_IMAGES = path.join(ROOT, "mollick-package-images");
const DEST_IMAGES = path.join(ROOT, "public", "mollick-package-images");

function fail(message) {
  console.error("");
  console.error("ERROR:", message);
  console.error("Nothing was changed.");
  console.error("");
  process.exit(1);
}

if (!fs.existsSync(APP)) fail("src/App.jsx was not found.");
if (!fs.existsSync(CSS)) fail("src/styles.css was not found.");
if (!fs.existsSync(SOURCE_IMAGES)) {
  fail("mollick-package-images folder was not found in the project root.");
}

const requiredImages = [
  "hospital-management.webp",
  "erp-system.webp",
  "education-website.webp",
  "business-management.webp",
  "club-organisation.webp",
  "android-app.webp",
  "ios-app.webp",
  "introducing-website.webp",
  "online-news.webp",
  "ecommerce-website.webp",
];

for (const file of requiredImages) {
  if (!fs.existsSync(path.join(SOURCE_IMAGES, file))) {
    fail(`Missing image: mollick-package-images/${file}`);
  }
}

let app = fs.readFileSync(APP, "utf8").replace(/\r\n/g, "\n");
let css = fs.readFileSync(CSS, "utf8").replace(/\r\n/g, "\n");

// ------------------------------------------------------------
// 1) Robustly locate the softwarePackages array using bracket
//    balancing. This does NOT depend on what comes after it.
// ------------------------------------------------------------
function findArrayRange(source, declaration) {
  const declPos = source.indexOf(declaration);
  if (declPos === -1) return null;

  const eqPos = source.indexOf("=", declPos + declaration.length);
  if (eqPos === -1) return null;

  const openPos = source.indexOf("[", eqPos);
  if (openPos === -1) return null;

  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = openPos; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i++;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === "/" && next === "/") {
      lineComment = true;
      i++;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      i++;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "[") depth++;
    if (ch === "]") {
      depth--;
      if (depth === 0) {
        let end = i + 1;
        while (end < source.length && /\s/.test(source[end])) end++;
        if (source[end] === ";") end++;
        return { start: declPos, end };
      }
    }
  }

  return null;
}

const arrayRange = findArrayRange(app, "const softwarePackages");
if (!arrayRange) {
  fail("Could not locate the softwarePackages array.");
}

const newPackages = `const softwarePackages = [
  {
    en: "Hospital Management System",
    bn: "হাসপাতাল ম্যানেজমেন্ট সিস্টেম",
    image: \`\${import.meta.env.BASE_URL}mollick-package-images/hospital-management.webp\`,
    altEn: "Hospital management software dashboard",
    altBn: "হাসপাতাল ম্যানেজমেন্ট সফটওয়্যার ড্যাশবোর্ড",
  },
  {
    en: "ERP System",
    bn: "ERP সিস্টেম",
    image: \`\${import.meta.env.BASE_URL}mollick-package-images/erp-system.webp\`,
    altEn: "ERP business management dashboard",
    altBn: "ERP ব্যবসা ব্যবস্থাপনা ড্যাশবোর্ড",
  },
  {
    en: "School, College, Madrasa Website",
    bn: "স্কুল, কলেজ ও মাদ্রাসা ওয়েবসাইট",
    image: \`\${import.meta.env.BASE_URL}mollick-package-images/education-website.webp\`,
    altEn: "Education website and learning portal",
    altBn: "শিক্ষা প্রতিষ্ঠান ওয়েবসাইট ও লার্নিং পোর্টাল",
  },
  {
    en: "Business Management System",
    bn: "বিজনেস ম্যানেজমেন্ট সিস্টেম",
    image: \`\${import.meta.env.BASE_URL}mollick-package-images/business-management.webp\`,
    altEn: "Business management analytics workspace",
    altBn: "বিজনেস ম্যানেজমেন্ট অ্যানালিটিক্স ওয়ার্কস্পেস",
  },
  {
    en: "Club & Organisation Websites",
    bn: "ক্লাব ও সংগঠন ওয়েবসাইট",
    image: \`\${import.meta.env.BASE_URL}mollick-package-images/club-organisation.webp\`,
    altEn: "Club and organisation community website",
    altBn: "ক্লাব ও সংগঠনের কমিউনিটি ওয়েবসাইট",
  },
  {
    en: "Mobile Application Android",
    bn: "অ্যান্ড্রয়েড মোবাইল অ্যাপ্লিকেশন",
    image: \`\${import.meta.env.BASE_URL}mollick-package-images/android-app.webp\`,
    altEn: "Premium Android mobile application interface",
    altBn: "প্রিমিয়াম অ্যান্ড্রয়েড মোবাইল অ্যাপ্লিকেশন",
  },
  {
    en: "Mobile Application iOS",
    bn: "iOS মোবাইল অ্যাপ্লিকেশন",
    image: \`\${import.meta.env.BASE_URL}mollick-package-images/ios-app.webp\`,
    altEn: "Premium iOS mobile application interface",
    altBn: "প্রিমিয়াম iOS মোবাইল অ্যাপ্লিকেশন",
  },
  {
    en: "Introducing Website",
    bn: "পরিচিতিমূলক ওয়েবসাইট",
    image: \`\${import.meta.env.BASE_URL}mollick-package-images/introducing-website.webp\`,
    altEn: "Corporate introduction website",
    altBn: "কর্পোরেট পরিচিতিমূলক ওয়েবসাইট",
  },
  {
    en: "Online News Portal",
    bn: "অনলাইন নিউজ পোর্টাল",
    image: \`\${import.meta.env.BASE_URL}mollick-package-images/online-news.webp\`,
    altEn: "Online news portal and digital newsroom",
    altBn: "অনলাইন নিউজ পোর্টাল ও ডিজিটাল নিউজরুম",
  },
  {
    en: "E-commerce Website",
    bn: "ই-কমার্স ওয়েবসাইট",
    image: \`\${import.meta.env.BASE_URL}mollick-package-images/ecommerce-website.webp\`,
    altEn: "Premium e-commerce shopping website",
    altBn: "প্রিমিয়াম ই-কমার্স শপিং ওয়েবসাইট",
  },
];`;

const appAfterArray =
  app.slice(0, arrayRange.start) +
  newPackages +
  app.slice(arrayRange.end);

// ------------------------------------------------------------
// 2) Replace the two existing package-card article templates.
//    We look for article blocks that contain both
//    software-package-card and pkg.en.
// ------------------------------------------------------------
function findPackageArticleRanges(source) {
  const ranges = [];
  let searchFrom = 0;

  while (true) {
    const start = source.indexOf("<article", searchFrom);
    if (start === -1) break;

    const endTag = source.indexOf("</article>", start);
    if (endTag === -1) break;

    const end = endTag + "</article>".length;
    const block = source.slice(start, end);

    if (
      block.includes('className="software-package-card"') &&
      block.includes("pkg.en")
    ) {
      ranges.push({ start, end });
    }

    searchFrom = end;
  }

  return ranges;
}

let working = appAfterArray;
const ranges = findPackageArticleRanges(working);

if (ranges.length < 2) {
  fail(
    `Found only ${ranges.length} package-card template(s). Expected at least 2.`
  );
}

const replacement = `<article
                  className="software-package-card"
                  key={\`\${pkg.en}-\${index}\`}
                >
                  <div className="software-package-media">
                    <img
                      src={pkg.image}
                      alt={lang === "en" ? pkg.altEn : pkg.altBn}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <h3>{lang === "en" ? pkg.en : pkg.bn}</h3>

                  <button
                    type="button"
                    className="software-package-book"
                    onClick={() => scrollTo("contact")}
                  >
                    {lang === "en" ? "Book Now" : "এখনই বুক করুন"}
                    <Icon name="arrow" size={16} />
                  </button>
                </article>`;

// Replace from end to start so indexes remain valid.
for (const range of ranges.slice(0, 2).sort((a, b) => b.start - a.start)) {
  working =
    working.slice(0, range.start) +
    replacement +
    working.slice(range.end);
}

// ------------------------------------------------------------
// 3) Add/replace targeted CSS override.
// ------------------------------------------------------------
const START = "/* === MOLLICK PREMIUM IMAGE PACKAGE CARDS START === */";
const END = "/* === MOLLICK PREMIUM IMAGE PACKAGE CARDS END === */";

const styleBlock = `${START}

.software-package-card {
  width: 330px;
  min-height: 390px;
  padding: 0 !important;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid rgba(6, 20, 47, 0.12);
  border-radius: 16px;
  box-shadow: 0 16px 38px rgba(6, 20, 47, 0.09);
}

.software-package-card::before {
  display: none !important;
}

.software-package-media {
  width: 100%;
  height: 205px;
  flex: 0 0 205px;
  overflow: hidden;
  background: #06142F;
}

.software-package-media img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
  transform: scale(1.001);
  transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
}

.software-package-card:hover .software-package-media img {
  transform: scale(1.045);
}

.software-package-card h3 {
  min-height: 66px;
  margin: 0 !important;
  padding: 22px 22px 12px;
  display: flex;
  align-items: flex-start;
  color: #06142F;
  font-size: 20px;
  line-height: 1.35;
  letter-spacing: -0.02em;
}

.software-package-number,
.software-package-amount {
  display: none !important;
}

.software-package-book {
  min-height: 44px;
  margin: auto 22px 22px !important;
  padding: 0 18px;
  align-self: flex-start;
  border-radius: 8px;
  background: #06142F;
  border-color: #06142F;
  color: #ffffff;
  white-space: nowrap;
}

.software-package-book:hover {
  background: #000000;
  border-color: #000000;
}

.hero-package-flow .software-package-card {
  width: 320px;
  min-height: 372px;
  padding: 0 !important;
}

.hero-package-flow .software-package-media {
  height: 190px;
  flex-basis: 190px;
}

.hero-package-flow .software-package-book,
.hero-package-flow .software-package-book:hover {
  position: static !important;
  left: auto !important;
  bottom: auto !important;
  margin: auto 22px 22px !important;
  transform: none !important;
}

@media (max-width: 760px) {
  .software-package-card,
  .hero-package-flow .software-package-card {
    width: 286px;
    min-height: 350px;
  }

  .software-package-media,
  .hero-package-flow .software-package-media {
    height: 175px;
    flex-basis: 175px;
  }

  .software-package-card h3 {
    min-height: 62px;
    padding: 18px 18px 10px;
    font-size: 18px;
  }

  .software-package-book,
  .hero-package-flow .software-package-book,
  .hero-package-flow .software-package-book:hover {
    margin: auto 18px 18px !important;
  }
}

${END}`;

const startPos = css.indexOf(START);
const endPos = css.indexOf(END);

if (startPos !== -1 && endPos !== -1 && endPos > startPos) {
  css =
    css.slice(0, startPos) +
    styleBlock +
    css.slice(endPos + END.length);
} else {
  css = css.trimEnd() + "\n\n" + styleBlock + "\n";
}

// ------------------------------------------------------------
// 4) Only now create backup and write changes.
// ------------------------------------------------------------
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = path.join(
  ROOT,
  ".mollick-backups",
  `package-card-redesign-v2-${stamp}`
);

fs.mkdirSync(backupDir, { recursive: true });
fs.copyFileSync(APP, path.join(backupDir, "App.jsx"));
fs.copyFileSync(CSS, path.join(backupDir, "styles.css"));

fs.mkdirSync(DEST_IMAGES, { recursive: true });
for (const file of requiredImages) {
  fs.copyFileSync(
    path.join(SOURCE_IMAGES, file),
    path.join(DEST_IMAGES, file)
  );
}

fs.writeFileSync(APP, working, "utf8");
fs.writeFileSync(CSS, css, "utf8");

console.log("");
console.log("SUCCESS: Mollick package cards updated.");
console.log("");
console.log("Applied:");
console.log("  - 10 premium images");
console.log("  - Removed package numbering");
console.log("  - Removed price / Custom Quote area");
console.log("  - Image -> Title -> Book Now layout");
console.log("  - Existing moving package flow preserved");
console.log("");
console.log("Backup:");
console.log("  " + backupDir);
console.log("");
console.log("Next:");
console.log("  npm run dev -- --host");
console.log("");
