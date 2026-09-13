const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const APP = path.join(ROOT, "src", "App.jsx");
const CSS = path.join(ROOT, "src", "styles.css");
const SOURCE_IMAGES = path.join(__dirname, "mollick-package-images");
const DEST_IMAGES = path.join(ROOT, "public", "mollick-package-images");

function fail(message) {
  console.error("");
  console.error("ERROR:", message);
  console.error("Nothing was changed.");
  console.error("");
  process.exit(1);
}

if (!fs.existsSync(APP)) fail("src/App.jsx was not found. Run this script from the Mollick website project root.");
if (!fs.existsSync(CSS)) fail("src/styles.css was not found.");
if (!fs.existsSync(SOURCE_IMAGES)) fail("mollick-package-images folder is missing beside this script.");

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

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = path.join(ROOT, ".mollick-backups", `package-card-redesign-${stamp}`);
fs.mkdirSync(backupDir, { recursive: true });
fs.copyFileSync(APP, path.join(backupDir, "App.jsx"));
fs.copyFileSync(CSS, path.join(backupDir, "styles.css"));

let app = fs.readFileSync(APP, "utf8").replace(/\r\n/g, "\n");
let css = fs.readFileSync(CSS, "utf8").replace(/\r\n/g, "\n");

if (!app.includes("const softwarePackages = [")) {
  fail("softwarePackages array was not found. Source structure is different from the verified version.");
}

if ((app.match(/className="software-package-card"/g) || []).length < 2) {
  fail("Expected package-card render blocks were not found. Source structure is different from the verified version.");
}

const newPackages = `const softwarePackages = [
  {
    en: "Hospital Management System",
    bn: "হাসপাতাল ম্যানেজমেন্ট সিস্টেম",
    image: asset("mollick-package-images/hospital-management.webp"),
    altEn: "Hospital management software dashboard",
    altBn: "হাসপাতাল ম্যানেজমেন্ট সফটওয়্যার ড্যাশবোর্ড",
  },
  {
    en: "ERP System",
    bn: "ERP সিস্টেম",
    image: asset("mollick-package-images/erp-system.webp"),
    altEn: "ERP business management dashboard",
    altBn: "ERP ব্যবসা ব্যবস্থাপনা ড্যাশবোর্ড",
  },
  {
    en: "School, College, Madrasa Website",
    bn: "স্কুল, কলেজ ও মাদ্রাসা ওয়েবসাইট",
    image: asset("mollick-package-images/education-website.webp"),
    altEn: "Education website and learning portal",
    altBn: "শিক্ষা প্রতিষ্ঠান ওয়েবসাইট ও লার্নিং পোর্টাল",
  },
  {
    en: "Business Management System",
    bn: "বিজনেস ম্যানেজমেন্ট সিস্টেম",
    image: asset("mollick-package-images/business-management.webp"),
    altEn: "Business management analytics workspace",
    altBn: "বিজনেস ম্যানেজমেন্ট অ্যানালিটিক্স ওয়ার্কস্পেস",
  },
  {
    en: "Club & Organisation Websites",
    bn: "ক্লাব ও সংগঠন ওয়েবসাইট",
    image: asset("mollick-package-images/club-organisation.webp"),
    altEn: "Club and organisation community website",
    altBn: "ক্লাব ও সংগঠনের কমিউনিটি ওয়েবসাইট",
  },
  {
    en: "Mobile Application Android",
    bn: "অ্যান্ড্রয়েড মোবাইল অ্যাপ্লিকেশন",
    image: asset("mollick-package-images/android-app.webp"),
    altEn: "Premium Android mobile application interface",
    altBn: "প্রিমিয়াম অ্যান্ড্রয়েড মোবাইল অ্যাপ্লিকেশন",
  },
  {
    en: "Mobile Application iOS",
    bn: "iOS মোবাইল অ্যাপ্লিকেশন",
    image: asset("mollick-package-images/ios-app.webp"),
    altEn: "Premium iOS mobile application interface",
    altBn: "প্রিমিয়াম iOS মোবাইল অ্যাপ্লিকেশন",
  },
  {
    en: "Introducing Website",
    bn: "পরিচিতিমূলক ওয়েবসাইট",
    image: asset("mollick-package-images/introducing-website.webp"),
    altEn: "Corporate introduction website",
    altBn: "কর্পোরেট পরিচিতিমূলক ওয়েবসাইট",
  },
  {
    en: "Online News Portal",
    bn: "অনলাইন নিউজ পোর্টাল",
    image: asset("mollick-package-images/online-news.webp"),
    altEn: "Online news portal and digital newsroom",
    altBn: "অনলাইন নিউজ পোর্টাল ও ডিজিটাল নিউজরুম",
  },
  {
    en: "E-commerce Website",
    bn: "ই-কমার্স ওয়েবসাইট",
    image: asset("mollick-package-images/ecommerce-website.webp"),
    altEn: "Premium e-commerce shopping website",
    altBn: "প্রিমিয়াম ই-কমার্স শপিং ওয়েবসাইট",
  },
];`;

const arrayRegex = /const softwarePackages = \[[\s\S]*?\n\];(?=\nconst copy =)/;
if (!arrayRegex.test(app)) {
  fail("Could not safely locate the complete softwarePackages array.");
}
app = app.replace(arrayRegex, newPackages);

function replaceArticle(source, keyNeedle, replacement) {
  const keyPos = source.indexOf(keyNeedle);
  if (keyPos === -1) fail(`Could not find package-card key marker: ${keyNeedle}`);

  const articleStart = source.lastIndexOf("<article", keyPos);
  if (articleStart === -1) fail("Could not locate opening <article>.");

  const articleEnd = source.indexOf("</article>", keyPos);
  if (articleEnd === -1) fail("Could not locate closing </article>.");

  return source.slice(0, articleStart) + replacement + source.slice(articleEnd + "</article>".length);
}

const heroCard = `<article
                    className="software-package-card"
                    key={\`hero-\${pkg.en}-\${index}\`}
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

const mainCard = `<article
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

app = replaceArticle(app, 'key={`hero-${pkg.en}-${index}`}', heroCard);
app = replaceArticle(app, 'key={`${pkg.en}-${index}`}', mainCard);

const START = "/* === MOLLICK PREMIUM IMAGE PACKAGE CARDS START === */";
const END = "/* === MOLLICK PREMIUM IMAGE PACKAGE CARDS END === */";

const styleBlock = `${START}

/* New structure: image -> title -> Book Now. Existing moving animation is preserved. */
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

/* Cancel old hero-only absolute button positioning. */
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

const oldBlockRegex = new RegExp(
  START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
    "[\\s\\S]*?" +
    END.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  "m"
);

if (oldBlockRegex.test(css)) {
  css = css.replace(oldBlockRegex, styleBlock);
} else {
  css = css.trimEnd() + "\n\n" + styleBlock + "\n";
}

fs.mkdirSync(DEST_IMAGES, { recursive: true });
for (const file of requiredImages) {
  fs.copyFileSync(path.join(SOURCE_IMAGES, file), path.join(DEST_IMAGES, file));
}

fs.writeFileSync(APP, app, "utf8");
fs.writeFileSync(CSS, css, "utf8");

console.log("");
console.log("Mollick premium package-card redesign applied successfully.");
console.log("");
console.log("Updated:");
console.log("  - src/App.jsx");
console.log("  - src/styles.css");
console.log("  - public/mollick-package-images/ (10 WebP images)");
console.log("");
console.log("Preserved:");
console.log("  - Moving carousel animation");
console.log("  - Hero/package section positions");
console.log("  - Section headings and widths");
console.log("  - Language switching");
console.log("");
console.log("Removed from cards:");
console.log("  - 01/02/03 numbering");
console.log("  - Amount / price / Custom Quote");
console.log("");
console.log("Backup:");
console.log("  " + backupDir);
console.log("");
console.log("Now run: npm run dev -- --host");
console.log("");
