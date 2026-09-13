const fs = require("fs");
const path = require("path");

const root = process.cwd();
const jsxPath = path.join(root, "src", "ReviewsSection.jsx");
const cssPath = path.join(root, "src", "ReviewsSection.css");

function ensure(file, label) {
  if (!fs.existsSync(file)) throw new Error(`${label} not found: ${file}`);
}

function backup(file, backupRoot) {
  const rel = path.relative(root, file);
  const dest = path.join(backupRoot, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(file, dest);
}

ensure(jsxPath, "ReviewsSection.jsx");
ensure(cssPath, "ReviewsSection.css");

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupRoot = path.join(root, ".mollick-backups", `reviews-7-projects-${stamp}`);
backup(jsxPath, backupRoot);
backup(cssPath, backupRoot);

let jsx = fs.readFileSync(jsxPath, "utf8");
let css = fs.readFileSync(cssPath, "utf8");

const reviewsBlock = `const reviews = [
  {
    id: 1,
    projectEn: "Bright Health",
    projectBn: "ব্রাইট হেলথ",
    nameEn: "Bright Health",
    nameBn: "ব্রাইট হেলথ",
    roleEn: "Project feedback",
    roleBn: "প্রজেক্ট ফিডব্যাক",
    companyEn: "Bright Health",
    companyBn: "ব্রাইট হেলথ",
    logo: "bright-health.png",
    quoteEn: "The team understood our digital healthcare requirements and shaped them into a clear, practical product. Communication was responsive, and the project was handled carefully from planning through implementation.",
    quoteBn: "আমাদের ডিজিটাল হেলথকেয়ার প্রয়োজনগুলো টিমটি ভালোভাবে বুঝে একটি পরিষ্কার ও ব্যবহারিক প্রোডাক্টে রূপ দিয়েছে। পরিকল্পনা থেকে বাস্তবায়ন পর্যন্ত যোগাযোগ ছিল দ্রুত এবং কাজের প্রতিটি ধাপ যত্নের সাথে পরিচালনা করা হয়েছে।",
    initials: "BH",
  },
  {
    id: 2,
    projectEn: "Buniyan Group",
    projectBn: "বুনিয়ান গ্রুপ",
    nameEn: "Buniyan Group",
    nameBn: "বুনিয়ান গ্রুপ",
    roleEn: "Project feedback",
    roleBn: "প্রজেক্ট ফিডব্যাক",
    companyEn: "Buniyan Group",
    companyBn: "বুনিয়ান গ্রুপ",
    logo: "buniyan1.png",
    quoteEn: "Mollick Software Solutions understood our business needs quickly and delivered a clean, organized solution. Their structured communication made the development process straightforward and easy to follow.",
    quoteBn: "Mollick Software Solutions খুব দ্রুত আমাদের ব্যবসার প্রয়োজন বুঝে একটি পরিপাটি ও সুসংগঠিত সমাধান তৈরি করেছে। তাদের পরিকল্পিত যোগাযোগের কারণে পুরো ডেভেলপমেন্ট প্রক্রিয়াটি সহজ ও পরিষ্কার ছিল।",
    initials: "BG",
  },
  {
    id: 3,
    projectEn: "Khedma Tech",
    projectBn: "খেদমা টেক",
    nameEn: "Khedma Tech",
    nameBn: "খেদমা টেক",
    roleEn: "Project feedback",
    roleBn: "প্রজেক্ট ফিডব্যাক",
    companyEn: "Khedma Tech",
    companyBn: "খেদমা টেক",
    logo: "khedma-tech.jpeg",
    quoteEn: "We appreciated the team's structured approach, attention to usability, and willingness to refine important details during development. The final direction matched the goals we had for the platform.",
    quoteBn: "টিমের পরিকল্পিত কাজের ধরণ, ব্যবহারকারীর অভিজ্ঞতার প্রতি গুরুত্ব এবং ডেভেলপমেন্টের সময় প্রয়োজনীয় বিষয়গুলো বারবার পরিমার্জন করার মানসিকতা আমাদের ভালো লেগেছে। প্ল্যাটফর্মটির চূড়ান্ত দিকনির্দেশনা আমাদের লক্ষ্য অনুযায়ী হয়েছে।",
    initials: "KT",
  },
  {
    id: 4,
    projectEn: "Mollick Enterprise",
    projectBn: "মল্লিক এন্টারপ্রাইজ",
    nameEn: "Mollick Enterprise",
    nameBn: "মল্লিক এন্টারপ্রাইজ",
    roleEn: "Project feedback",
    roleBn: "প্রজেক্ট ফিডব্যাক",
    companyEn: "Mollick Enterprise",
    companyBn: "মল্লিক এন্টারপ্রাইজ",
    logo: "Mollick.png",
    quoteEn: "The software was built around real day-to-day business operations, with a strong focus on simplicity, useful reporting, and practical workflows. It has given the business a much clearer digital process.",
    quoteBn: "সফটওয়্যারটি আমাদের দৈনন্দিন ব্যবসায়িক কাজের বাস্তব প্রয়োজনকে কেন্দ্র করে তৈরি করা হয়েছে। সহজ ব্যবহার, প্রয়োজনীয় রিপোর্ট এবং কার্যকর ওয়ার্কফ্লোর কারণে ব্যবসার কাজ এখন অনেক বেশি পরিষ্কারভাবে ডিজিটালভাবে পরিচালনা করা যায়।",
    initials: "ME",
  },
  {
    id: 5,
    projectEn: "Nikahnama",
    projectBn: "নিকাহনামা",
    nameEn: "Nikahnama",
    nameBn: "নিকাহনামা",
    roleEn: "Project feedback",
    roleBn: "প্রজেক্ট ফিডব্যাক",
    companyEn: "Nikahnama",
    companyBn: "নিকাহনামা",
    logo: "Nikahnama.png",
    quoteEn: "The product has been developed with close attention to user experience, privacy, and the needs of its audience. The team has been flexible throughout the project and thoughtful about each important user flow.",
    quoteBn: "প্রোডাক্টটি তৈরি করার সময় ব্যবহারকারীর অভিজ্ঞতা, গোপনীয়তা এবং লক্ষ্য ব্যবহারকারীদের প্রয়োজনকে বিশেষ গুরুত্ব দেওয়া হয়েছে। পুরো প্রজেক্টে টিমটি নমনীয় ছিল এবং প্রতিটি গুরুত্বপূর্ণ ইউজার ফ্লো মনোযোগ দিয়ে তৈরি করেছে।",
    initials: "NK",
  },
  {
    id: 6,
    projectEn: "Opar",
    projectBn: "ওপার",
    nameEn: "Opar",
    nameBn: "ওপার",
    roleEn: "Project feedback",
    roleBn: "প্রজেক্ট ফিডব্যাক",
    companyEn: "Opar",
    companyBn: "ওপার",
    logo: "Opar.png",
    quoteEn: "The team brought the product requirements, interface direction, and technical implementation together in a practical way. Their support during revisions helped us keep the project aligned with the intended experience.",
    quoteBn: "টিমটি প্রোডাক্টের প্রয়োজন, ইন্টারফেসের দিকনির্দেশনা এবং টেকনিক্যাল ইমপ্লিমেন্টেশনকে সুন্দরভাবে একসাথে এনেছে। বিভিন্ন সংশোধনের সময় তাদের সহযোগিতায় প্রজেক্টটি আমাদের কাঙ্ক্ষিত অভিজ্ঞতার সাথে সামঞ্জস্যপূর্ণ রাখা সম্ভব হয়েছে।",
    initials: "OP",
  },
  {
    id: 7,
    projectEn: "JoruriCode",
    projectBn: "জরুরি কোড",
    nameEn: "JoruriCode",
    nameBn: "জরুরি কোড",
    roleEn: "Project feedback",
    roleBn: "প্রজেক্ট ফিডব্যাক",
    companyEn: "JoruriCode",
    companyBn: "জরুরি কোড",
    logo: "JoruriCode.jpeg",
    quoteEn: "JoruriCode required careful thinking around emergency flows, usability, and reliability. The team approached those requirements methodically and kept the experience simple while handling the underlying technical complexity.",
    quoteBn: "JoruriCode প্রজেক্টে জরুরি পরিস্থিতির ফ্লো, সহজ ব্যবহার এবং নির্ভরযোগ্যতা নিয়ে খুব সতর্কভাবে কাজ করা প্রয়োজন ছিল। টিমটি পরিকল্পিতভাবে এসব বিষয় বাস্তবায়ন করেছে এবং ভেতরের টেকনিক্যাল জটিলতা সামলে ব্যবহারকারীর অভিজ্ঞতা সহজ রেখেছে।",
    initials: "JC",
  },
];`;

const reviewsRegex = /const reviews\s*=\s*\[[\s\S]*?\];\s*\n\s*function ReviewsSectionComponent/;
if (!reviewsRegex.test(jsx)) {
  throw new Error("Could not find the reviews data block in src/ReviewsSection.jsx");
}
jsx = jsx.replace(reviewsRegex, `${reviewsBlock}\n\nfunction ReviewsSectionComponent`);

const oldBrandRegex = /<div className="mollick-reviews__brand">[\s\S]*?<\/div>\s*\n\s*<div className="mollick-reviews__divider" \/>/;
if (!oldBrandRegex.test(jsx)) {
  throw new Error("Could not find the review brand block in src/ReviewsSection.jsx");
}

const newBrandBlock = `<div className="mollick-reviews__brand">
          <img
            className="mollick-reviews__logo"
            src={\`\${import.meta.env.BASE_URL}\${review.logo}\`}
            alt={isBn ? review.projectBn : review.projectEn}
            loading="lazy"
            decoding="async"
          />
          <strong>
            {isBn ? review.companyBn : review.companyEn}
          </strong>
        </div>

        <div className="mollick-reviews__divider" />`;

jsx = jsx.replace(oldBrandRegex, newBrandBlock);

const markerStart = "/* === MOLLICK PROJECT REVIEW LOGOS START === */";
const markerEnd = "/* === MOLLICK PROJECT REVIEW LOGOS END === */";
const logoCss = `${markerStart}
.mollick-reviews__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  min-width: 0;
}

.mollick-reviews__logo {
  display: block;
  width: min(250px, 82%);
  height: 190px;
  object-fit: contain;
  object-position: center;
  border-radius: 18px;
  background: #ffffff;
  padding: 14px;
  box-sizing: border-box;
}

.mollick-reviews__brand strong {
  color: #ffffff;
  text-align: center;
  font-size: clamp(18px, 1.7vw, 26px);
  line-height: 1.2;
}

@media (max-width: 820px) {
  .mollick-reviews__logo {
    width: min(220px, 76vw);
    height: 165px;
  }
}
${markerEnd}`;

const start = css.indexOf(markerStart);
const end = css.indexOf(markerEnd);
if (start !== -1 && end !== -1 && end > start) {
  css = css.slice(0, start) + logoCss + css.slice(end + markerEnd.length);
} else {
  css = `${css.trim()}\n\n${logoCss}\n`;
}

fs.writeFileSync(jsxPath, jsx, "utf8");
fs.writeFileSync(cssPath, css, "utf8");

console.log("");
console.log("7 project reviews added successfully.");
console.log("Updated: src/ReviewsSection.jsx + src/ReviewsSection.css");
console.log(`Backup: ${backupRoot}`);
console.log("Now run: npm run dev -- --host");
