import { useEffect, useMemo, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithCustomToken,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query as firestoreQuery,
  where,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { WhatWeDoSection } from "./WhatWeDoSection";
import { HomeAboutSection } from "./HomeAboutSection";
import * as realtimeDatabase from 'firebase/database'
import { onSnapshot as firestoreOnSnapshot } from 'firebase/firestore'

const HOTLINE = "01617083892";
const MAP_URL = "https://maps.app.goo.gl/zE8xQNJQC1UEsmGC9?g_st=aw";
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyAXLwJGm-5JkXFU44eGUi28Fm0o1ykWXzA",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "brighthospital-46154.firebaseapp.com",
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    "https://brighthospital-46154-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "brighthospital-46154",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "brighthospital-46154.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "71552807441",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:71552807441:web:bd28f03813a3ed36a8b7b0",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-PP7JYQEB3V",
};
const firebaseApp = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const firebaseDb = getFirestore(firebaseApp);
const firebaseFunctions = getFunctions(firebaseApp, "asia-southeast1");
const HOSPITAL_ID = import.meta.env.VITE_HOSPITAL_ID || "bright_hospital";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://bright-hospital-otp-server.onrender.com";
const asset = (path) => `${import.meta.env.BASE_URL}${path}`;


const formatClinicalDate = (value, lang = "en") => {
  if (!value) return "-";

  const date = new Date(
    String(value).length <= 10
      ? String(value) + "T00:00:00"
      : value
  );

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(
    lang === "bn"
      ? "bn-BD"
      : "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
};


const downloadClinicalNotePdf = async ({
  note,
  booking,
  patientName,
  doctorName,
  lang,
}) => {
  if (!note) return;

  const root =
    document.createElement("div");

  root.style.cssText = [
    "position:fixed",
    "left:-10000px",
    "top:0",
    "width:820px",
    "background:#ffffff",
    "color:#102a43",
    'font-family:"Noto Sans Bengali","Segoe UI","Nirmala UI",Arial,sans-serif',
    "z-index:-10"
  ].join(";");


  const medicines =
    Array.isArray(
      note.prescriptionItems
    )
      ? note.prescriptionItems
      : [];


  const safe = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");


  const medicinesHtml =
    medicines.length
      ? medicines
          .map(
            (item, index) => `
              <div style="
                padding:15px 0;
                border-bottom:1px solid #d9e8e1;
              ">
                <div style="
                  color:#082c52;
                  font-size:17px;
                  font-weight:800;
                  margin-bottom:6px;
                ">
                  ${index + 1}. ${safe(
                    item.medicine ||
                    "Medicine"
                  )}
                </div>

                <div style="
                  color:#536b61;
                  font-size:14px;
                  line-height:1.7;
                ">
                  ${item.dose
                    ? "<b>Dose:</b> " +
                      safe(item.dose) +
                      "<br>"
                    : ""
                  }

                  ${item.frequency
                    ? "<b>Frequency:</b> " +
                      safe(item.frequency) +
                      "<br>"
                    : ""
                  }

                  ${item.duration
                    ? "<b>Duration:</b> " +
                      safe(item.duration) +
                      "<br>"
                    : ""
                  }

                  ${item.instruction
                    ? "<b>Instruction:</b> " +
                      safe(item.instruction)
                    : ""
                  }
                </div>
              </div>
            `
          )
          .join("")
      : `
          <div style="
            padding:12px 0;
            color:#718492;
          ">
            No medicines listed.
          </div>
        `;


  root.innerHTML = `
    <div style="
      padding:46px 52px;
      background:#ffffff;
    ">

      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:30px;
        padding-bottom:22px;
        border-bottom:3px solid #0b8656;
      ">

        <div style="
          display:flex;
          align-items:center;
          gap:16px;
        ">

          <img
            id="clinical-pdf-logo"
            src="${asset("bright-health-logo.png")}"
            style="
              width:78px;
              height:78px;
              object-fit:contain;
            "
          >

          <div>

            <div style="
              color:#082c52;
              font-size:23px;
              font-weight:900;
            ">
              BRIGHT HEALTH
            </div>

            <div style="
              margin-top:4px;
              color:#607787;
              font-size:11px;
              font-weight:800;
              letter-spacing:.08em;
            ">
              SPECIALIZED HOSPITAL
            </div>

          </div>

        </div>


        <div style="
          text-align:right;
        ">

          <div style="
            color:#0b8656;
            font-size:12px;
            font-weight:900;
          ">
            DOCTOR PRESCRIPTION
          </div>

          <div style="
            margin-top:5px;
            color:#082c52;
            font-size:22px;
            font-weight:900;
          ">
            Prescription
          </div>

        </div>

      </div>


      <div style="
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:12px;
        margin-top:26px;
      ">

        <div style="
          padding:14px;
          background:#f3f8f6;
          border-radius:10px;
        ">

          <small style="
            color:#718492;
            font-weight:800;
          ">
            PATIENT
          </small>

          <div style="
            margin-top:4px;
            color:#082c52;
            font-weight:800;
          ">
            ${safe(
              patientName ||
              "Patient"
            )}
          </div>

        </div>


        <div style="
          padding:14px;
          background:#f3f8f6;
          border-radius:10px;
        ">

          <small style="
            color:#718492;
            font-weight:800;
          ">
            DOCTOR
          </small>

          <div style="
            margin-top:4px;
            color:#082c52;
            font-weight:800;
          ">
            ${safe(
              note.doctorName ||
              doctorName ||
              "Doctor"
            )}
          </div>

        </div>


        <div style="
          padding:14px;
          background:#f3f8f6;
          border-radius:10px;
        ">

          <small style="
            color:#718492;
            font-weight:800;
          ">
            DATE
          </small>

          <div style="
            margin-top:4px;
            color:#082c52;
            font-weight:800;
          ">
            ${safe(
              formatClinicalDate(
                booking?.appointmentDate,
                lang
              )
            )}
          </div>

        </div>


        <div style="
          padding:14px;
          background:#f3f8f6;
          border-radius:10px;
        ">

          <small style="
            color:#718492;
            font-weight:800;
          ">
            TIME
          </small>

          <div style="
            margin-top:4px;
            color:#082c52;
            font-weight:800;
          ">
            ${safe(
              booking?.appointmentTime ||
              "-"
            )}
          </div>

        </div>

      </div>


      ${note.diagnosis
        ? `
          <div style="
            margin-top:25px;
          ">

            <b style="
              color:#0b8656;
            ">
              Diagnosis
            </b>

            <div style="
              margin-top:6px;
              font-size:16px;
              line-height:1.7;
            ">
              ${safe(
                note.diagnosis
              )}
            </div>

          </div>
        `
        : ""
      }


      ${note.symptoms
        ? `
          <div style="
            margin-top:20px;
          ">

            <b style="
              color:#0b8656;
            ">
              Symptoms
            </b>

            <div style="
              margin-top:6px;
              color:#536b61;
              line-height:1.7;
            ">
              ${safe(
                note.symptoms
              )}
            </div>

          </div>
        `
        : ""
      }


      <div style="
        margin-top:26px;
        padding:20px;
        background:#edf8f3;
        border-left:4px solid #0b8656;
        border-radius:12px;
      ">

        <div style="
          color:#082c52;
          font-size:19px;
          font-weight:900;
          margin-bottom:5px;
        ">
          Medicines
        </div>

        ${medicinesHtml}

      </div>


      ${note.prescription
        ? `
          <div style="
            margin-top:22px;
          ">

            <b style="
              color:#0b8656;
            ">
              Additional note
            </b>

            <div style="
              margin-top:6px;
              color:#536b61;
              line-height:1.7;
            ">
              ${safe(
                note.prescription
              )}
            </div>

          </div>
        `
        : ""
      }


      ${note.advice
        ? `
          <div style="
            margin-top:22px;
          ">

            <b style="
              color:#0b8656;
            ">
              Doctor advice
            </b>

            <div style="
              margin-top:6px;
              color:#536b61;
              line-height:1.7;
            ">
              ${safe(
                note.advice
              )}
            </div>

          </div>
        `
        : ""
      }


      ${note.followUpDate
        ? `
          <div style="
            margin-top:24px;
            padding:14px 16px;
            background:#fff4cd;
            border-radius:10px;
          ">

            <b style="
              color:#8a6500;
            ">
              Follow-up:
            </b>

            <span style="
              margin-left:8px;
              color:#082c52;
              font-weight:800;
            ">
              ${safe(
                formatClinicalDate(
                  note.followUpDate,
                  lang
                )
              )}
            </span>

          </div>
        `
        : ""
      }


      <div style="
        display:flex;
        justify-content:space-between;
        gap:20px;
        margin-top:32px;
        padding-top:16px;
        border-top:1px solid #d9e8e1;
        color:#718492;
        font-size:11px;
      ">

        <span>
          Reference:
          ${safe(
            booking?.id ||
            note.appointmentId ||
            "-"
          )}
        </span>

        <span>
          Bright Health Specialized Hospital
        </span>

      </div>

    </div>
  `;


  document.body.appendChild(
    root
  );


  try {

    if (
      document.fonts?.ready
    ) {
      await document.fonts.ready;
    }


    const logo =
      root.querySelector(
        "#clinical-pdf-logo"
      );


    if (
      logo &&
      !logo.complete
    ) {

      await new Promise(
        (resolve) => {

          logo.onload =
            resolve;

          logo.onerror =
            resolve;

          setTimeout(
            resolve,
            2000
          );

        }
      );

    }


    const canvas =
      await html2canvas(
        root,
        {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        }
      );


    const pdf =
      new jsPDF(
        "p",
        "mm",
        "a4"
      );


    const pageWidth =
      pdf.internal.pageSize
        .getWidth();


    const pageHeight =
      pdf.internal.pageSize
        .getHeight();


    const margin = 8;


    const contentWidth =
      pageWidth -
      margin * 2;


    const contentHeight =
      pageHeight -
      margin * 2;


    const pxPerMm =
      canvas.width /
      contentWidth;


    const sliceHeight =
      Math.floor(
        contentHeight *
        pxPerMm
      );


    let offset = 0;
    let page = 0;


    while (
      offset <
      canvas.height
    ) {

      const currentHeight =
        Math.min(
          sliceHeight,
          canvas.height -
          offset
        );


      const slice =
        document.createElement(
          "canvas"
        );


      slice.width =
        canvas.width;


      slice.height =
        currentHeight;


      const ctx =
        slice.getContext(
          "2d"
        );


      ctx.drawImage(
        canvas,
        0,
        offset,
        canvas.width,
        currentHeight,
        0,
        0,
        canvas.width,
        currentHeight
      );


      if (
        page > 0
      ) {
        pdf.addPage();
      }


      pdf.addImage(
        slice.toDataURL(
          "image/jpeg",
          .96
        ),
        "JPEG",
        margin,
        margin,
        contentWidth,
        currentHeight /
          pxPerMm,
        undefined,
        "FAST"
      );


      offset +=
        currentHeight;


      page += 1;
    }


    const fileDate =
      String(
        booking?.appointmentDate ||
        note.followUpDate ||
        "prescription"
      )
        .replace(
          /[^0-9A-Za-z-]/g,
          "-"
        );


    pdf.save(
      "Bright-Health-Prescription-" +
      fileDate +
      ".pdf"
    );

  }
  finally {

    root.remove();

  }
};


const normalizePhoneNumber = (value) =>
  String(value || "")
    .replace(/\D/g, "")
    .slice(0, 11);
const isValidBDPhone = (value) =>
  /^01[3-9]\d{8}$/.test(normalizePhoneNumber(value));
const displayPhone = (phoneKey) => phoneKey || "";
const bdPhoneToKey = (value) => normalizePhoneNumber(value);
const phoneInputProps = {
  type: "tel",
  inputMode: "numeric",
  maxLength: 11,
  pattern: "01[3-9][0-9]{8}",
  placeholder: "01XXXXXXXXX",
  title: "Enter an 11 digit Bangladesh mobile number starting with 01",
};

const softwarePackages = [
  {
    en: "Hospital Management System",
    bn: "হাসপাতাল ম্যানেজমেন্ট সিস্টেম",
    amountEn: "Custom Quote",
    amountBn: "আলোচনা সাপেক্ষ",
  },
  {
    en: "ERP System",
    bn: "ERP সিস্টেম",
    amountEn: "Custom Quote",
    amountBn: "আলোচনা সাপেক্ষ",
  },
  {
    en: "School, College, Madrasa Website",
    bn: "স্কুল, কলেজ ও মাদ্রাসা ওয়েবসাইট",
    amountEn: "Custom Quote",
    amountBn: "আলোচনা সাপেক্ষ",
  },
  {
    en: "Business Management System",
    bn: "বিজনেস ম্যানেজমেন্ট সিস্টেম",
    amountEn: "Custom Quote",
    amountBn: "আলোচনা সাপেক্ষ",
  },
  {
    en: "Club & Organisation Websites",
    bn: "ক্লাব ও সংগঠন ওয়েবসাইট",
    amountEn: "Custom Quote",
    amountBn: "আলোচনা সাপেক্ষ",
  },
  {
    en: "Mobile Application Android",
    bn: "অ্যান্ড্রয়েড মোবাইল অ্যাপ্লিকেশন",
    amountEn: "Custom Quote",
    amountBn: "আলোচনা সাপেক্ষ",
  },
  {
    en: "Mobile Application iOS",
    bn: "iOS মোবাইল অ্যাপ্লিকেশন",
    amountEn: "Custom Quote",
    amountBn: "আলোচনা সাপেক্ষ",
  },
  {
    en: "Introducing Website",
    bn: "পরিচিতিমূলক ওয়েবসাইট",
    amountEn: "Custom Quote",
    amountBn: "আলোচনা সাপেক্ষ",
  },
  {
    en: "Online News Portal",
    bn: "অনলাইন নিউজ পোর্টাল",
    amountEn: "2,00,000 Tk",
    amountBn: "২,০০,০০০ টাকা",
  },
  {
    en: "E-commerce Website",
    bn: "ই-কমার্স ওয়েবসাইট",
    amountEn: "Custom Quote",
    amountBn: "আলোচনা সাপেক্ষ",
  },
];

const copy = {
  en: {
    language: "বাংলা",
    nav: ["Services", "Doctors", "Packages", "About"],
    appointment: "Book appointment",
    portal: "Patient portal",
    open: "Open 24 hours · 7 days a week",
    noticeLabel: "Latest notices",
    notices: [
      "Online appointment booking is now available through the website.",
      "24/7 emergency support is available for patients and families.",
      "Please bring previous prescriptions and reports when visiting a specialist.",
    ],
    heroA: "Specialist care,",
    heroB: "made human.",
    heroP:
      "Experienced doctors, thoughtful care and modern diagnostics—together, under one roof.",
    findDoctor: "Find a doctor",
    call: "National emergency: 999",
    trusted: "Trusted by families across the community",
    years: "years of care",
    specialists: "specialist doctors",
    support: "emergency support",
    quickTitle: "How can we help today?",
    quickP: "Start with what you need. We’ll guide you from there.",
    services: [
      ["Find a doctor", "Search by name or specialty", "user"],
      ["Book an appointment", "Choose a convenient time", "calendar"],
      ["Patient portal", "Reports, records & follow-ups", "folder"],
      ["Emergency care", "Immediate help, day or night", "pulse"],
    ],
    careEyebrow: "Care for every stage of life",
    careTitle: "Specialized services, centered around you.",
    careP:
      "From prevention and diagnosis to treatment and recovery, our clinical teams work together for clearer answers and better outcomes.",
    departments: [
      ["Cardiology", "Advanced heart care"],
      ["Obstetrics & Gynaecology", "Compassionate women’s care"],
      ["Paediatrics", "Specialist care for children"],
      ["Medicine", "Complete adult medical care"],
      ["Orthopaedics", "Movement, injury & joint care"],
      ["Diagnostics", "Reliable tests, faster answers"],
    ],
    explore: "Explore all services",
    doctorsEyebrow: "Meet our specialists",
    doctorsTitle: "Experienced hands. Reassuring hearts.",
    doctorsP:
      "Search our specialist team and find the right doctor for your needs.",
    search: "Search doctor or specialty",
    available: "Available today",
    next: "Next: Tomorrow",
    view: "View profile",
    book: "Book now",
    noDoctors: "No matching doctor found.",
    packageEyebrow: "Preventive health",
    packageTitle: "Know more. Worry less.",
    packageP:
      "Thoughtfully designed health checks for every age and stage—clear, convenient, and clinically reviewed.",
    packageButton: "View health packages",
    starts: "Packages start from",
    currency: "৳1,500",
    reports: "Digital reports",
    tests: "Essential tests",
    review: "Doctor review",
    whyEyebrow: "Why Bright Health",
    whyTitle: "Care you can feel confident about.",
    whyP: "We combine experienced specialists, attentive teams and dependable technology to make each visit calmer and more informed.",
    reasons: [
      [
        "Specialist-led care",
        "Your care plan is guided by experienced clinical teams.",
      ],
      [
        "Clear communication",
        "We explain your options so you can decide with confidence.",
      ],
      [
        "Modern diagnostics",
        "Reliable technology helps deliver timely, accurate answers.",
      ],
    ],
    locationEyebrow: "Visit us",
    locationTitle: "Quality care, close to home.",
    address: "Bright Health Specialized Hospital\nBangladesh",
    directions: "Open map",
    contact: "Book a callback",
    always: "24/7 Emergency",
    alwaysP:
      "For a life-threatening emergency, call the national emergency service.",
    emergencyCall: "Call 999",
    footerP: "Specialist care with skill, clarity and compassion.",
    footerHeadings: ["Hospital", "Patient care"],
    hospitalLinks: ['Home', 'About us', 'Our doctors', 'Services', 'Contact'],
    patientLinks: [
      "Appointments",
      "Health packages",
      "Patient portal",
      "Emergency",
    ],
    copyright:
      "© 2026 Mollick Software Solutions. All rights reserved.",
    modalTitle: "Book an appointment",
    modalP:
      "Leave your details and our care team will call to confirm your appointment.",
    name: "Patient name",
    phone: "Mobile number",
    specialty: "Choose specialty",
    submit: "Request appointment",
    sent: "Request received. We’ll call you shortly.",
    close: "Close",
  },
  bn: {
    language: "ENG",
    nav: ["সেবাসমূহ", "ডাক্তার", "হেলথ প্যাকেজ", "আমাদের সম্পর্কে"],
    appointment: "অ্যাপয়েন্টমেন্ট নিন",
    portal: "পেশেন্ট পোর্টাল",
    open: "সপ্তাহের ৭ দিন · ২৪ ঘণ্টা খোলা",
    noticeLabel: "চলমান নোটিশ",
    notices: [
      "ওয়েবসাইটের মাধ্যমে অনলাইন অ্যাপয়েন্টমেন্ট বুকিং এখন চালু রয়েছে।",
      "রোগী ও স্বজনদের জন্য ২৪/৭ জরুরি সেবা চালু রয়েছে।",
      "বিশেষজ্ঞ চিকিৎসকের কাছে আসার সময় পূর্বের প্রেসক্রিপশন ও রিপোর্ট সঙ্গে আনুন।",
    ],
    heroA: "বিশেষজ্ঞ সেবা,",
    heroB: "আন্তরিক যত্ন।",
    heroP:
      "অভিজ্ঞ ডাক্তার, আন্তরিক সেবা ও আধুনিক ডায়াগনস্টিক—সবকিছু একই ছাদের নিচে।",
    findDoctor: "ডাক্তার খুঁজুন",
    call: "জাতীয় জরুরি সেবা: ৯৯৯",
    trusted: "এই অঞ্চলের অসংখ্য পরিবারের বিশ্বস্ত স্বাস্থ্যসেবা",
    years: "বছরের সেবা",
    specialists: "বিশেষজ্ঞ ডাক্তার",
    support: "জরুরি সেবা",
    quickTitle: "আজ কীভাবে সাহায্য করতে পারি?",
    quickP: "আপনার প্রয়োজন দিয়ে শুরু করুন। পরের ধাপে আমরা পাশে আছি।",
    services: [
      ["ডাক্তার খুঁজুন", "নাম বা বিভাগ দিয়ে খুঁজুন", "user"],
      ["অ্যাপয়েন্টমেন্ট নিন", "সুবিধাজনক সময় বেছে নিন", "calendar"],
      ["পেশেন্ট পোর্টাল", "রিপোর্ট, রেকর্ড ও ফলো-আপ", "folder"],
      ["জরুরি সেবা", "দিন-রাত তাৎক্ষণিক সহায়তা", "pulse"],
    ],
    careEyebrow: "জীবনের প্রতিটি পর্যায়ের যত্ন",
    careTitle: "আপনাকে ঘিরেই বিশেষায়িত সেবা।",
    careP:
      "প্রতিরোধ ও রোগ নির্ণয় থেকে চিকিৎসা ও সুস্থতা—স্পষ্ট উত্তর ও উন্নত ফলাফলের জন্য আমাদের চিকিৎসক দল একসাথে কাজ করে।",
    departments: [
      ["হৃদরোগ", "উন্নত হৃদরোগ চিকিৎসা"],
      ["প্রসূতি ও স্ত্রীরোগ", "নারীর জন্য আন্তরিক সেবা"],
      ["শিশু বিভাগ", "শিশুদের বিশেষায়িত যত্ন"],
      ["মেডিসিন", "প্রাপ্তবয়স্কদের পূর্ণাঙ্গ চিকিৎসা"],
      ["অর্থোপেডিকস", "হাড়, জয়েন্ট ও আঘাতের চিকিৎসা"],
      ["ডায়াগনস্টিকস", "নির্ভরযোগ্য পরীক্ষা, দ্রুত ফলাফল"],
    ],
    explore: "সব সেবা দেখুন",
    doctorsEyebrow: "আমাদের বিশেষজ্ঞগণ",
    doctorsTitle: "অভিজ্ঞ হাত। আশ্বস্ত হৃদয়।",
    doctorsP: "আপনার প্রয়োজন অনুযায়ী সঠিক বিশেষজ্ঞ ডাক্তার খুঁজে নিন।",
    search: "ডাক্তার বা বিভাগ খুঁজুন",
    available: "আজ পাওয়া যাবে",
    next: "পরবর্তী: আগামীকাল",
    view: "প্রোফাইল দেখুন",
    book: "বুক করুন",
    noDoctors: "কোনো ডাক্তার পাওয়া যায়নি।",
    packageEyebrow: "প্রতিরোধমূলক স্বাস্থ্যসেবা",
    packageTitle: "আরও জানুন। দুশ্চিন্তা কমান।",
    packageP:
      "সব বয়সের জন্য পরিকল্পিত স্বাস্থ্য পরীক্ষা—সহজ, সুবিধাজনক এবং চিকিৎসক কর্তৃক পর্যালোচিত।",
    packageButton: "হেলথ প্যাকেজ দেখুন",
    starts: "প্যাকেজ শুরু",
    currency: "৳১,৫০০",
    reports: "ডিজিটাল রিপোর্ট",
    tests: "প্রয়োজনীয় পরীক্ষা",
    review: "ডাক্তারের পরামর্শ",
    whyEyebrow: "কেন ব্রাইট হেলথ",
    whyTitle: "যে সেবায় নিশ্চিন্ত থাকা যায়।",
    whyP: "আপনার প্রতিটি ভিজিটকে স্বস্তিদায়ক ও ফলপ্রসূ করতে অভিজ্ঞ বিশেষজ্ঞ, আন্তরিক টিম ও নির্ভরযোগ্য প্রযুক্তি একসাথে কাজ করে।",
    reasons: [
      [
        "বিশেষজ্ঞ-নেতৃত্বাধীন সেবা",
        "অভিজ্ঞ চিকিৎসক দল আপনার চিকিৎসা পরিকল্পনা করেন।",
      ],
      [
        "স্পষ্ট যোগাযোগ",
        "সিদ্ধান্ত নিতে আমরা প্রতিটি বিকল্প সহজভাবে বুঝিয়ে দিই।",
      ],
      ["আধুনিক ডায়াগনস্টিক", "নির্ভরযোগ্য প্রযুক্তিতে দ্রুত ও নির্ভুল ফলাফল।"],
    ],
    locationEyebrow: "আমাদের ঠিকানা",
    locationTitle: "মানসম্মত সেবা, আপনার কাছেই।",
    address: "ব্রাইট হেলথ স্পেশালাইজড হাসপাতাল\nবাংলাদেশ",
    directions: "ম্যাপ দেখুন",
    contact: "কলব্যাক বুক করুন",
    always: "২৪/৭ জরুরি সেবা",
    alwaysP: "জীবন-হুমকির জরুরি পরিস্থিতিতে জাতীয় জরুরি সেবায় কল করুন।",
    emergencyCall: "৯৯৯-এ কল করুন",
    footerP: "দক্ষতা, স্বচ্ছতা ও আন্তরিকতার সাথে বিশেষজ্ঞ সেবা।",
    footerHeadings: ["হাসপাতাল", "পেশেন্ট সেবা"],
    hospitalLinks: ['হোম', 'আমাদের সম্পর্কে', 'ডাক্তারগণ', 'সেবাসমূহ', 'যোগাযোগ'],
    patientLinks: [
      "অ্যাপয়েন্টমেন্ট",
      "হেলথ প্যাকেজ",
      "পেশেন্ট পোর্টাল",
      "জরুরি সেবা",
    ],
    copyright: "© ২০২৬ Mollick Software Solutions. সর্বস্বত্ব সংরক্ষিত।",
    modalTitle: "অ্যাপয়েন্টমেন্ট নিন",
    modalP: "আপনার তথ্য দিন, আমাদের টিম ফোন করে সময় নিশ্চিত করবে।",
    name: "রোগীর নাম",
    phone: "মোবাইল নম্বর",
    specialty: "বিভাগ বেছে নিন",
    submit: "অ্যাপয়েন্টমেন্ট অনুরোধ",
    sent: "অনুরোধ পেয়েছি। শীঘ্রই আপনাকে কল করা হবে।",
    close: "বন্ধ করুন",
  },
};

const doctors = [
  {
    initials: "HI",
    name: { en: "Dr. Homayara Islam", bn: "ডা. হোমায়ারা ইসলাম" },
    role: { en: "Surgery Specialist", bn: "সার্জারি বিশেষজ্ঞ" },
    exp: "MBBS, BCS (Health), FCPS (Surgery), MCPS (Surgery)",
    schedule: {
      en: "Sun, Mon & Tue from 3 PM",
      bn: "রবি, সোম ও মঙ্গলবার দুপুর ৩টা হতে",
    },
    services: {
      en: "Gallstone, appendix, hernia, piles, fistula and soft tissue tumor surgery",
      bn: "পিত্তথলির পাথর, অ্যাপেন্ডিক্স, হার্নিয়া, পাইলস, ফিস্টুলা ও টিউমার অপারেশন",
    },
    time: "available",
  },
  {
    initials: "SS",
    name: { en: "Dr. Shah Sohel", bn: "ডা. শাহ সোহেল" },
    role: {
      en: "ENT Specialist & Head-Neck Surgeon",
      bn: "নাক, কান, গলা রোগ বিশেষজ্ঞ ও হেড-নেক সার্জন",
    },
    exp: "MBBS, BCS (Health), MS (ENT)",
    schedule: {
      en: "Daily from 4 PM (Fri & Tue closed)",
      bn: "প্রতিদিন বিকাল ৪টা হতে (শুক্র ও মঙ্গলবার বন্ধ)",
    },
    services: {
      en: "Ear pain, hearing loss, sinusitis, tonsil, throat and neck problems",
      bn: "কান ব্যথা, কম শোনা, সাইনাস, টনসিল, গলা ও ঘাড়ের সমস্যা",
    },
    time: "available",
  },
  {
    initials: "AM",
    name: {
      en: "Dr. Md. Abdullah Al Mamun",
      bn: "ডা. মোঃ আব্দুল্লাহ আল মামুন",
    },
    role: {
      en: "Diabetes, Medicine, Mother & Child Disease Specialist",
      bn: "ডায়াবেটিস, মেডিসিন এবং মা ও শিশু রোগ অভিজ্ঞ",
    },
    exp: "MBBS, PGT (Medicine), CCD (Diabetes), CMU (Ultra)",
    schedule: {
      en: "Daily 9 AM - 3 PM (Saturday closed)",
      bn: "প্রতিদিন সকাল ৯টা হতে দুপুর ৩টা পর্যন্ত (শনিবার বন্ধ)",
    },
    services: {
      en: "Diabetes, blood pressure, respiratory illness, mother and child care",
      bn: "ডায়াবেটিস, উচ্চ রক্তচাপ, শ্বাসকষ্ট, মা ও শিশু, মেডিসিন সেবা",
    },
    time: "available",
  },
  {
    initials: "KA",
    name: { en: "Dr. Md. Abdul Kalam Azad", bn: "ডা. মোঃ আব্দুল কালাম আজাদ" },
    role: {
      en: "Skin & Venereal Disease Specialist",
      bn: "চর্ম ও যৌনরোগ বিশেষজ্ঞ",
    },
    exp: "MBBS, BCS (Health), MD (Skin & VD)",
    schedule: {
      en: "Tue & Wed, 7 PM - 9 PM",
      bn: "প্রতি মঙ্গলবার ও বুধবার সন্ধ্যা ৭টা হতে রাত ৯টা পর্যন্ত",
    },
    services: {
      en: "Skin disease, allergy, acne, eczema, hair and sexual health problems",
      bn: "চুলকানি, দাউদ, অ্যালার্জি, ত্বকের দাগ, ব্রণ, চুল ও যৌন সমস্যা",
    },
    time: "next",
  },
  {
    initials: "AL",
    name: {
      en: "Dr. Md. Abdullah Al Lihin",
      bn: "ডা. মোঃ আব্দুল্লাহ আল লিহিন",
    },
    role: { en: "ENT Specialist", bn: "নাক, কান ও গলা রোগ অভিজ্ঞ" },
    exp: "MBBS, PGT (ENT), CMU (Ultra)",
    schedule: {
      en: "Daily 9 AM - 2 PM; Friday 9 AM - 9 PM",
      bn: "প্রতিদিন সকাল ৯টা থেকে দুপুর ২টা; শুক্রবার সকাল ৯টা থেকে রাত ৯টা",
    },
    services: {
      en: "Ear, nose and throat care, sinus, tonsil, allergy and gastritis-related throat issues",
      bn: "কান, নাক ও গলা, সাইনাস, টনসিল, অ্যালার্জি ও গলা সমস্যা",
    },
    time: "available",
  },
  {
    initials: "SH",
    name: { en: "Dr. Md. Shamim Hossain", bn: "ডা. মোঃ শামীম হোসেন" },
    role: {
      en: "Orthopedic Specialist & Trauma Surgeon",
      bn: "হাড় ভাঙ্গা-জোড়া, মেরুদণ্ড ও বাত ব্যথা বিশেষজ্ঞ",
    },
    exp: "MBBS (DU), D-Ortho (BSMMU)",
    schedule: {
      en: "Thu 10 AM - 3 PM; Fri 3 PM - 8 PM",
      bn: "বৃহস্পতিবার সকাল ১০টা থেকে বিকাল ৩টা; শুক্রবার ৩টা থেকে ৮টা",
    },
    services: {
      en: "Bone fracture, osteoporosis, spine, hand, foot and injury-related pain",
      bn: "হাড় ক্ষয়, ব্যথা, অস্টিওপোরোসিস, ফ্র্যাকচার, হাত-পা ও মেরুদণ্ড সমস্যা",
    },
    time: "next",
  },
  {
    initials: "SG",
    name: {
      en: "Dr. Md. Shamsul Huda Sarkar (Sagar)",
      bn: "ডা. মোঃ শামসুল হুদা সরকার (সাগর)",
    },
    role: {
      en: "Dermatology, Allergy & Dermatosurgeon",
      bn: "চর্ম, এলার্জি, যৌনরোগ বিশেষজ্ঞ ও ডার্মাটোসার্জন",
    },
    exp: "MBBS, BCS (Health), DDV (BSMMU), CCD (BIRDEM)",
    schedule: {
      en: "Mon - Thu from 2 PM",
      bn: "প্রতি সোম থেকে বৃহস্পতিবার দুপুর ২টা হতে",
    },
    services: {
      en: "Acne, eczema, allergy, psoriasis, skin spots, hair and cosmetic dermatology",
      bn: "ব্রণ, মেছতা, চুলকানি, একজিমা, এলার্জি, চুল পড়া ও ত্বকের সমস্যা",
    },
    time: "available",
  },
  {
    initials: "ZH",
    name: { en: "Dr. K M Zakir Hasan", bn: "ডা. কে এম জাকির হাসান" },
    role: { en: "Child & Adolescent Specialist", bn: "শিশু ও কিশোর বিশেষজ্ঞ" },
    exp: "MBBS, BCS (Health), DCH (Pediatrics), PGPN (Boston University)",
    schedule: {
      en: "Sat, Sun & Tue, 3 PM - 8 PM",
      bn: "প্রতি শনি, রবি ও মঙ্গলবার বিকাল ৩টা থেকে রাত ৮টা পর্যন্ত",
    },
    services: {
      en: "Newborn care, child fever, cough, nutrition, kidney disease and development concerns",
      bn: "নবজাতক, শিশু জ্বর, কাশি, পুষ্টি, কিডনি রোগ ও মানসিক-শারীরিক বিকাশ সমস্যা",
    },
    time: "available",
  },
  {
    initials: "AA",
    name: { en: "Dr. Arifa Ahmed", bn: "ডা. আরিফা আহমেদ" },
    role: {
      en: "Gynecology & Obstetrics Specialist",
      bn: "প্রসূতি ও গাইনি রোগ বিশেষজ্ঞ",
    },
    exp: "MBBS, BCS (Health), MS (Gynae & Obs)",
    schedule: {
      en: "Daily 4 PM - 8 PM (Fri & Sat closed)",
      bn: "প্রতিদিন বিকাল ৪টা হতে রাত ৮টা পর্যন্ত (শুক্র ও শনিবার বন্ধ)",
    },
    services: {
      en: "Pregnancy care, infertility, menstrual disorders, urinary issues and gynecological surgery",
      bn: "গর্ভবতী মায়ের চিকিৎসা, সন্তান না হওয়া, তলপেট ব্যথা, সাদা স্রাব ও গাইনি অপারেশন",
    },
    time: "next",
  },
  {
    initials: "RH",
    name: { en: "Dr. Md. Rafiqul Hasan", bn: "ডা. মোঃ রাফিকুল হাসান" },
    role: { en: "Neuromedicine Specialist", bn: "নিউরোমেডিসিন বিশেষজ্ঞ" },
    exp: "MBBS, BCS (Health), MD (Neurology)",
    schedule: {
      en: "Friday 9 AM - 6 PM",
      bn: "প্রতি শুক্রবার সকাল ৯টা হতে সন্ধ্যা ৬টা",
    },
    services: {
      en: "Headache, stroke, paralysis, epilepsy, Parkinson’s, nerve and brain problems",
      bn: "মাথা ব্যথা, স্ট্রোক, প্যারালাইসিস, মৃগী, পারকিনসন, ব্রেইন ও নার্ভ সমস্যা",
    },
    time: "next",
  },
  {
    initials: "MZ",
    name: { en: "Dr. Md. Mamunuzzaman", bn: "ডা. মোঃ মামুনুজ্জামান" },
    role: { en: "Cardiology Specialist", bn: "হৃদরোগ বিশেষজ্ঞ" },
    exp: "MBBS, BCS (Health), MD (Cardiology)",
    schedule: {
      en: "Mon, Tue & Wed from 9 PM",
      bn: "প্রতি সোম, মঙ্গল ও বুধবার রাত ৯টা হতে",
    },
    services: {
      en: "Hypertension, chest pain, heart valve issues, arrhythmia, congenital heart disease",
      bn: "উচ্চ রক্তচাপ, বুকে ব্যথা, হার্টের ভাল্বের সমস্যা, অনিয়মিত হৃদস্পন্দন ও হৃদরোগ",
    },
    time: "available",
  },
  {
    initials: "TL",
    name: { en: "Dr. Talha Bin Lufar", bn: "ডা. তালহা বিন লুফার" },
    role: {
      en: "Trauma, Spine, Hand & Arthroplasty Surgeon",
      bn: "ট্রমা, স্পাইন, হ্যান্ড ও অর্থোপ্লাস্টি সার্জন",
    },
    exp: "MBBS, D-Ortho",
    schedule: {
      en: "Sat, Mon, Wed, Thu & Fri 7-9 AM and 2:30-9 PM; Sun & Tue from 7 PM",
      bn: "শনি, সোম, বুধ, বৃহস্পতি ও শুক্রবার সকাল ৭-৯টা এবং দুপুর ২:৩০-রাত ৯টা; রবি ও মঙ্গলবার সন্ধ্যা ৭টা হতে",
    },
    services: {
      en: "Fracture, ligament, joint replacement, arthritis, spine and injury-related pain",
      bn: "হাড় ভাঙ্গা, লিগামেন্ট, জয়েন্ট প্রতিস্থাপন, বাত ব্যথা, স্পাইন ও আঘাতজনিত সমস্যা",
    },
    time: "available",
  },
  {
    initials: "SR",
    name: { en: "Dr. Sumon Kumar Roy", bn: "ডা. সুমন কুমার রায়" },
    role: {
      en: "Medicine & Cardiology Specialist",
      bn: "মেডিসিন ও হৃদরোগ বিশেষজ্ঞ",
    },
    exp: "MBBS, BCS (Health), MD (Internal Medicine)",
    schedule: {
      en: "Daily from 4 PM (Friday closed)",
      bn: "প্রতিদিন বিকাল ৪টা হতে (শুক্রবার বন্ধ)",
    },
    services: {
      en: "Medicine care, diabetes, blood pressure, arthritis, headache, asthma, allergy and liver problems",
      bn: "মেডিসিন, ডায়াবেটিস, উচ্চ রক্তচাপ, বাত-ব্যথা, মাথা ব্যথা, শ্বাসকষ্ট, এলার্জি ও লিভার সমস্যা",
    },
    time: "available",
  },
  {
    initials: "MH",
    name: { en: "Dr. Mohammad Mehdi Hasan", bn: "ডা. মোহাম্মদ মেহেদী হাসান" },
    role: {
      en: "Physical Medicine & Rehabilitation Specialist",
      bn: "ফিজিক্যাল মেডিসিন এন্ড রিহ্যাবিলিটেশন বিশেষজ্ঞ",
    },
    exp: "MBBS, MD (Physical Medicine & Rehabilitation), BCS (Health), CCD (BIRDEM)",
    schedule: {
      en: "Sun, Mon & Tue from 4:30 PM",
      bn: "প্রতি রবি, সোম ও মঙ্গলবার বিকাল ৪:৩০ মিনিট থেকে",
    },
    services: {
      en: "Back pain, joint pain, neck pain, stroke, paralysis, Bell’s palsy, PRP and nerve block therapy",
      bn: "কোমর ব্যথা, ঘাড় ব্যথা, জয়েন্ট ব্যথা, স্ট্রোক, প্যারালাইসিস, বেলস পালসি, PRP ও নার্ভ ব্লক",
    },
    time: "next",
  },
  {
    initials: "JA",
    name: { en: "Dr. Md. Joynal Abedin", bn: "ডা. মোঃ জয়নাল আবেদীন" },
    role: {
      en: "ENT Specialist & Head-Neck Surgeon",
      bn: "নাক, কান, গলা রোগ বিশেষজ্ঞ এবং হেড-নেক সার্জন",
    },
    exp: "MBBS, BCS (Health), DLO, MCPS (ENT)",
    schedule: { en: "Sat & Sun from 2 PM", bn: "শনি ও রবিবার দুপুর ২টা হতে" },
    services: {
      en: "Ear pain, hearing problems, sinus, tonsil, throat, thyroid and ENT surgery",
      bn: "কান ব্যথা, কম শোনা, সাইনাস, টনসিল, গলা, থাইরয়েড ও ইএনটি সার্জারি",
    },
    time: "available",
  },
];

const appointmentDepartments = [
  {
    id: "medicine",
    name: { en: "Medicine", bn: "মেডিসিন" },
    doctors: ["AM", "SR", "MZ"],
  },
  {
    id: "ent",
    name: { en: "ENT / Head-Neck", bn: "নাক, কান, গলা / হেড-নেক" },
    doctors: ["SS", "JA", "AL"],
  },
  { id: "surgery", name: { en: "Surgery", bn: "সার্জারি" }, doctors: ["HI"] },
  {
    id: "gynecology",
    name: { en: "Gynecology & Obstetrics", bn: "প্রসূতি ও গাইনি" },
    doctors: ["AA"],
  },
  {
    id: "pediatrics",
    name: { en: "Child & Adolescent", bn: "শিশু ও কিশোর" },
    doctors: ["ZH"],
  },
  {
    id: "skin",
    name: { en: "Skin & Allergy", bn: "চর্ম ও এলার্জি" },
    doctors: ["KA", "SG"],
  },
  {
    id: "orthopedic",
    name: { en: "Orthopedic / Trauma", bn: "অর্থোপেডিক / ট্রমা" },
    doctors: ["SH", "TL"],
  },
  {
    id: "neuro",
    name: { en: "Neuro / Rehabilitation", bn: "নিউরো / রিহ্যাবিলিটেশন" },
    doctors: ["RH", "MH"],
  },
];


const dayLabels = {
  en: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ],

  bn: [
    'রবিবার',
    'সোমবার',
    'মঙ্গলবার',
    'বুধবার',
    'বৃহস্পতিবার',
    'শুক্রবার',
    'শনিবার'
  ]
}


const scheduleDayMap = {
  sun: 0,
  sunday: 0,

  mon: 1,
  monday: 1,

  tue: 2,
  tues: 2,
  tuesday: 2,

  wed: 3,
  wednesday: 3,

  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,

  fri: 5,
  friday: 5,

  sat: 6,
  saturday: 6
}


const scheduleDateValue = date => {
  const year = date.getFullYear()

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, '0')

  const day =
    String(
      date.getDate()
    ).padStart(2, '0')

  return `${year}-${month}-${day}`
}


const normalizeDoctorSchedule = value =>
  String(value || '')
    .replace(/–|—/g, '-')
    .replace(/\s+/g, ' ')
    .trim()


const parseScheduleDay = value => {

  const key =
    String(value || '')
      .toLowerCase()
      .replace(/[^a-z]/g, '')


  return Object.prototype
    .hasOwnProperty.call(
      scheduleDayMap,
      key
    )
      ? scheduleDayMap[key]
      : null
}


const parseScheduleDays = value => {

  let text =
    String(value || '')
      .toLowerCase()
      .replace(/\bevery\b/g, ' ')
      .trim()


  if (/\bdaily\b/.test(text)) {

    return [
      0, 1, 2, 3, 4, 5, 6
    ]

  }


  const result = []


  /*
     Mon - Thu
  */

  const rangePattern =
    /\b(sun(?:day)?|mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday|ursday)?|fri(?:day)?|sat(?:urday)?)\s*-\s*(sun(?:day)?|mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday|ursday)?|fri(?:day)?|sat(?:urday)?)\b/i


  const rangeMatch =
    text.match(
      rangePattern
    )


  if (rangeMatch) {

    const start =
      parseScheduleDay(
        rangeMatch[1]
      )

    const end =
      parseScheduleDay(
        rangeMatch[2]
      )


    if (
      start !== null &&
      end !== null
    ) {

      let current =
        start


      for (
        let i = 0;
        i < 7;
        i += 1
      ) {

        if (
          !result.includes(
            current
          )
        ) {
          result.push(
            current
          )
        }


        if (
          current === end
        ) {
          break
        }


        current =
          (current + 1) % 7
      }
    }


    text =
      text.replace(
        rangeMatch[0],
        ' '
      )
  }


  /*
     Sun, Mon & Tue
  */

  const matches =
    text.match(
      /\b(?:sun(?:day)?|mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday|ursday)?|fri(?:day)?|sat(?:urday)?)\b/gi
    ) || []


  matches.forEach(token => {

    const day =
      parseScheduleDay(
        token
      )


    if (
      day !== null &&
      !result.includes(day)
    ) {
      result.push(day)
    }

  })


  return result
}


const parseClockMinutes = (
  value,
  inheritedMeridiem = ''
) => {

  const match =
    String(value || '')
      .trim()
      .match(
        /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i
      )


  if (!match) {
    return null
  }


  let hour =
    Number(
      match[1]
    )


  const minute =
    Number(
      match[2] || 0
    )


  const meridiem =
    String(
      match[3] ||
      inheritedMeridiem ||
      ''
    ).toUpperCase()


  if (
    hour < 1 ||
    hour > 12 ||
    minute < 0 ||
    minute > 59 ||
    !['AM', 'PM'].includes(
      meridiem
    )
  ) {
    return null
  }


  if (
    meridiem === 'AM' &&
    hour === 12
  ) {
    hour = 0
  }


  if (
    meridiem === 'PM' &&
    hour !== 12
  ) {
    hour += 12
  }


  return (
    hour * 60 +
    minute
  )
}


const formatClockMinutes = minutes => {

  const hour24 =
    Math.floor(
      minutes / 60
    )


  const minute =
    minutes % 60


  const meridiem =
    hour24 >= 12
      ? 'PM'
      : 'AM'


  let hour12 =
    hour24 % 12


  if (hour12 === 0) {
    hour12 = 12
  }


  return (
    `${hour12}:${String(minute).padStart(2, '0')} ${meridiem}`
  )
}


const buildThirtyMinuteSlots = (
  start,
  end
) => {

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    end < start
  ) {
    return []
  }


  const result = []


  for (
    let current = start;
    current <= end;
    current += 30
  ) {

    result.push(
      formatClockMinutes(
        current
      )
    )

  }


  return result
}


const parseSingleTimeWindow = value => {

  const text =
    String(value || '')
      .replace(/,/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()


  /*
     "from 3 PM"

     No ending time exists,
     so we must not guess one.
  */

  const fromMatch =
    text.match(
      /^from\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))$/i
    )


  if (fromMatch) {

    const minutes =
      parseClockMinutes(
        fromMatch[1]
      )


    return Number.isFinite(minutes)
      ? [
          formatClockMinutes(
            minutes
          )
        ]
      : []
  }


  /*
     4 PM - 8 PM
     7-9 AM
     2:30-9 PM
  */

  const rangeMatch =
    text.match(
      /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i
    )


  if (rangeMatch) {

    const endMeridiem =
      (
        rangeMatch[2]
          .match(/(am|pm)/i) ||
        []
      )[1] || ''


    const start =
      parseClockMinutes(
        rangeMatch[1],
        endMeridiem
      )


    const end =
      parseClockMinutes(
        rangeMatch[2]
      )


    return buildThirtyMinuteSlots(
      start,
      end
    )
  }


  /*
     One exact visiting time
  */

  const oneTime =
    text.match(
      /(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i
    )


  if (!oneTime) {
    return []
  }


  const minutes =
    parseClockMinutes(
      oneTime[1]
    )


  return Number.isFinite(minutes)
    ? [
        formatClockMinutes(
          minutes
        )
      ]
    : []
}


const parseScheduleTimes = value => {

  const parts =
    String(value || '')
      .split(
        /\s+and\s+/i
      )
      .map(
        item =>
          item.trim()
      )
      .filter(Boolean)


  return [
    ...new Set(
      parts.flatMap(
        parseSingleTimeWindow
      )
    )
  ]
}


const getClosedDays = schedule => {

  const result =
    new Set()


  const closedNotes =
    String(schedule || '')
      .match(
        /\([^)]*closed[^)]*\)/gi
      ) || []


  closedNotes
    .forEach(note => {

      parseScheduleDays(
        note
      ).forEach(day => {
        result.add(day)
      })

    })


  return result
}


const parseDoctorVisitingSchedule = doctor => {

  const result =
    new Map()


  if (!doctor) {
    return result
  }


  /*
     Prefer structured schedule data
     if admin provides it in future.
  */

  if (
    Array.isArray(
      doctor.appointmentSlots
    ) &&
    doctor.appointmentSlots.length
  ) {

    doctor.appointmentSlots
      .forEach(rule => {

        const days =
          Array.isArray(rule?.days)
            ? rule.days
                .map(Number)
                .filter(
                  day =>
                    Number.isInteger(day) &&
                    day >= 0 &&
                    day <= 6
                )
            : []


        const times =
          Array.isArray(rule?.times)
            ? [
                ...new Set(
                  rule.times
                    .map(time =>
                      String(
                        time ||
                        ''
                      ).trim()
                    )
                    .filter(Boolean)
                )
              ]
            : []


        days.forEach(day => {

          result.set(
            day,
            [...times]
          )

        })

      })


    if (result.size) {
      return result
    }
  }


  /*
     Current uploaded doctors already expose
     schedule.en through mapPublicDoctorForWebsite.
  */

  const raw =
    normalizeDoctorSchedule(
      doctor.schedule?.en ||
      doctor.scheduleEn ||
      doctor.schedule ||
      ''
    )


  if (!raw) {
    return result
  }


  const closedDays =
    getClosedDays(
      raw
    )


  const clean =
    raw
      .replace(
        /\([^)]*closed[^)]*\)/gi,
        ''
      )
      .trim()


  const segments =
    clean
      .split(';')
      .map(item =>
        item.trim()
      )
      .filter(Boolean)


  segments.forEach(segment => {

    /*
       Split between weekday area
       and the first clock.
    */

    const firstClock =
      segment.search(
        /\d{1,2}(?::\d{2})?\s*(?:am|pm)?/i
      )


    if (
      firstClock === -1
    ) {
      return
    }


    let dayPart =
      segment
        .slice(
          0,
          firstClock
        )
        .trim()


    let timePart =
      segment
        .slice(
          firstClock
        )
        .trim()


    /*
       Preserve:
       "Sun, Mon & Tue from 3 PM"
    */

    if (
      /\bfrom\s*$/i.test(
        dayPart
      )
    ) {

      dayPart =
        dayPart.replace(
          /\bfrom\s*$/i,
          ''
        )

      timePart =
        'from ' +
        timePart
    }


    const days =
      parseScheduleDays(
        dayPart
      )


    const times =
      parseScheduleTimes(
        timePart
      )


    if (
      !days.length ||
      !times.length
    ) {
      return
    }


    /*
       Specific later schedule overwrites
       Daily schedule for that weekday.

       Example:
       Daily 9 AM - 2 PM;
       Friday 9 AM - 9 PM
    */

    days.forEach(day => {

      result.set(
        day,
        [...times]
      )

    })

  })


  closedDays.forEach(day => {

    result.delete(day)

  })


  return result
}


const appointmentTimeMinutes = value => {

  const minutes =
    parseClockMinutes(
      String(value || '')
    )


  return Number.isFinite(minutes)
    ? minutes
    : -1
}


const getUpcomingAppointmentDates = (
  doctor,
  lang = 'en'
) => {

  if (!doctor) {
    return []
  }


  const schedule =
    parseDoctorVisitingSchedule(
      doctor
    )


  /*
     Critical rule:

     If we cannot understand the doctor's
     schedule, NEVER fall back to every day.
  */

  if (!schedule.size) {
    return []
  }


  const now =
    new Date()


  const locale =
    lang === 'bn'
      ? 'bn-BD'
      : 'en-US'


  const result = []


  /*
     Search up to next 60 days
     and return next 10 valid visiting dates.
  */

  for (
    let offset = 0;
    offset < 60 &&
    result.length < 10;
    offset += 1
  ) {

    const date =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + offset
      )


    const weekday =
      date.getDay()


    let timeSlots =
      [
        ...(
          schedule.get(
            weekday
          ) || []
        )
      ]


    /*
       Today:
       remove already passed slots.
    */

    if (offset === 0) {

      const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes()


      timeSlots =
        timeSlots.filter(
          time =>
            appointmentTimeMinutes(
              time
            ) >
            currentMinutes
        )

    }


    if (!timeSlots.length) {
      continue
    }


    timeSlots.sort(
      (a, b) =>
        appointmentTimeMinutes(a) -
        appointmentTimeMinutes(b)
    )


    result.push({

      value:
        scheduleDateValue(
          date
        ),

      label:
        `${dayLabels[lang][weekday]}, ${date.toLocaleDateString(
          locale,
          {
            month: 'long',
            day: 'numeric'
          }
        )}`,

      timeSlots:
        [
          ...new Set(
            timeSlots
          )
        ]

    })

  }


  return result
}


const isDoctorAppointmentValid = (
  doctor,
  date,
  time
) => {

  if (
    !doctor ||
    !date ||
    !time
  ) {
    return false
  }


  const availableDates =
    getUpcomingAppointmentDates(
      doctor,
      'en'
    )


  const validDate =
    availableDates.find(
      item =>
        item.value === date
    )


  if (!validDate) {
    return false
  }


  return validDate.timeSlots
    .includes(
      time
    )
}


const getDoctorDepartmentId = doctorInitials =>
  appointmentDepartments.find(
    department =>
      department.doctors.includes(
        doctorInitials
      )
  )?.id ||
  appointmentDepartments[0].id


const getDoctorsByDepartment = departmentId => {

  const initials =
    appointmentDepartments.find(
      department =>
        department.id ===
        departmentId
    )?.doctors ||
    []


  return doctors.filter(
    doctor =>
      initials.includes(
        doctor.initials
      )
  )
}


const icons = {
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4m8-4v4M3 10h18m-9 4v4m-2-2h4" />
    </>
  ),
  folder: (
    <>
      <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M8 13h8m-4-3v6" />
    </>
  ),
  pulse: <path d="M3 12h4l2-5 4 10 2-5h6" />,
  phone: (
    <path d="M21 16.8v3a2 2 0 0 1-2.2 2 19.7 19.7 0 0 1-8.6-3.1 19.2 19.2 0 0 1-6-6 19.7 19.7 0 0 1-3.1-8.6A2 2 0 0 1 3.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.9.7 2.8a2 2 0 0 1-.5 2.1L7 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.4 1.9.6 2.8.7a2 2 0 0 1 1.8 2Z" />
  ),
  arrow: (
    <>
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6A2 2 0 0 0 12 14a2 2 0 0 0 1.4-.6" />
      <path d="M9.9 5.2A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2" />
      <path d="M6.1 6.7A17.5 17.5 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4-.8" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
};

function Icon({ name, size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function CountUpStat({ value, suffix = "", label, delay = 0 }) {
  const [node, setNode] = useState(null);
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!node || started) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, started]);

  useEffect(() => {
    if (!started) return;

    let frame = 0;
    const duration = 1500;
    const startTime = performance.now() + delay;

    const tick = (now) => {
      if (now < startTime) {
        frame = requestAnimationFrame(tick);
        return;
      }

      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(value * eased));

      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, value, delay]);

  return (
    <div className="stat-card" ref={setNode}>
      <strong>
        {count}
        {suffix}
      </strong>
      <span>{label}</span>
    </div>
  );
}

async function callServer(path, data = {}, idToken = "") {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify(data),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success === false) {
    throw new Error(result.message || "Bright Hospital service unavailable");
  }
  return result;
}

const callFunction = (name) => httpsCallable(firebaseFunctions, name);

function mapPublicDoctorForWebsite(item) {
  const initials = item.initials || item.id?.slice(0, 2)?.toUpperCase() || "DR";
  const nameEn = item.nameEn || item.name || item.doctorName || "Doctor";
  const nameBn = item.nameBn || item.doctorNameBn || nameEn;
  const specializationEn =
    item.specializationEn ||
    item.specialization ||
    item.roleEn ||
    "Specialist Doctor";
  const specializationBn =
    item.specializationBn || item.roleBn || specializationEn;
  const scheduleEn =
    item.scheduleEn ||
    item.schedule ||
    "Schedule will be confirmed by hospital";
  const scheduleBn = item.scheduleBn || scheduleEn;

  return {
    ...item,
    id: item.id || initials,
    initials,
    name: { en: nameEn, bn: nameBn },
    role: { en: specializationEn, bn: specializationBn },
    exp: item.exp || item.qualifications || "",
    schedule: { en: scheduleEn, bn: scheduleBn },
    services: {
      en: item.servicesEn || item.services || specializationEn,
      bn: item.servicesBn || specializationBn,
    },
    time: item.time || "available",
    departmentId:
      item.departmentId ||
      item.appointmentTypeId ||
      item.departmentKey ||
      getDoctorDepartmentId(initials),
    consultationFee: Number(item.consultationFee || 0),
    scheduleSlots: Array.isArray(item.scheduleSlots) ? item.scheduleSlots : [],
  };
}

const doctorPortraitSrc = (doctor) =>
  doctor.imageSourceType === "portrait" && doctor.imageUrl ? doctor.imageUrl : "";

const doctorMonogram = (doctor) => {
  const name = doctor.name?.en || doctor.name || "";
  const words = name.replace(/^dr\.?\s*/i, "").trim().split(/\s+/).filter(Boolean);
  return (words.slice(0, 2).map((word) => word[0]).join("") || doctor.initials || "DR")
    .slice(0, 2)
    .toUpperCase();
};

function DoctorPortrait({ doctor, alt }) {
  const [failed, setFailed] = useState(false);
  const src = doctorPortraitSrc(doctor);
  if (!src || failed) {
    return <span className="doctor-photo-fallback"><b>{doctorMonogram(doctor)}</b></span>;
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}

async function loadPatientProfileAndData(uid) {
  const patientRef = doc(firebaseDb, "hospitals", HOSPITAL_ID, "patients", uid);
  const patientSnapshot = await getDoc(patientRef);
  if (!patientSnapshot.exists()) {
    return { patient: null, bookings: [], reports: [], invoices: [] };
  }

  const patient = { uid, id: uid, ...patientSnapshot.data() };
  const bookingsResult = await callFunction("getPatientBookings")({
    hospitalId: HOSPITAL_ID,
  });
  const reportsSnapshot = await getDocs(
    firestoreQuery(
      collection(firebaseDb, "hospitals", HOSPITAL_ID, "patientFiles"),
      where("patientUid", "==", uid)
    )
  );
  const invoicesSnapshot = await getDocs(
    firestoreQuery(
      collection(firebaseDb, "hospitals", HOSPITAL_ID, "invoices"),
      where("patientUid", "==", uid)
    )
  );

  const sortDesc = (a, b) =>
    Number(b.updatedAt || b.createdAt || 0) -
    Number(a.updatedAt || a.createdAt || 0);
  const bookings = (bookingsResult.data?.bookings || []).sort(sortDesc);
  const reports = reportsSnapshot.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
    .sort(sortDesc);
  const invoices = invoicesSnapshot.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
    .sort(sortDesc);
  return { patient, bookings, reports, invoices };
}

async function saveAppointmentRequest(appointment) {
  const result = await callFunction("createWebsiteAppointment")({
    hospitalId: HOSPITAL_ID,
    ...appointment,
  });
  return { name: result.data?.appointmentId || result.data?.id };
}

export default function App() {
  const [lang, setLang] = useState('bn');
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingMode, setBookingMode] = useState("general");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedDoctorInitials, setSelectedDoctorInitials] = useState("");
  const [selectedAppointmentDate, setSelectedAppointmentDate] = useState("");
  const [lastAppointment, setLastAppointment] = useState(null);
  const [doctorListOpen, setDoctorListOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [portalOpen, setPortalOpen] = useState(false);
  const [portalMode, setPortalMode] = useState("login");
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState("");
  const [portalNotice, setPortalNotice] = useState("");
  const [currentPatient, setCurrentPatient] = useState(null);
  const [patientBookings, setPatientBookings] = useState([]);
  const [patientReports, setPatientReports] = useState([]);
  const [patientInvoices, setPatientInvoices] = useState([]);
  const [patientClinicalNotes, setPatientClinicalNotes] = useState([]);
  const [otpSent, setOtpSent] = useState(false);
  const [liveDoctors, setLiveDoctors] = useState([]);
  const [showPortalPassword, setShowPortalPassword] = useState(false);
  const t = copy[lang];
  const displayDoctors = (liveDoctors.length ? liveDoctors : doctors).filter(
    (doctor) => doctor.initials !== "RH" && doctor.id !== "RH"
  );
  const filteredDoctors = useMemo(
    () =>
      displayDoctors.filter((d) =>
        `${d.name?.[lang] || d.name?.en || d.name || ""} ${
          d.role?.[lang] || d.specialization || ""
        } ${d.exp || ""} ${d.services?.[lang] || ""} ${
          d.schedule?.[lang] || ""
        }`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [displayDoctors, query, lang]
  );
  const flowDoctors = filteredDoctors.length
    ? [...filteredDoctors, ...filteredDoctors]
    : [];
  const departmentDoctors = useMemo(
    () =>
      selectedDepartmentId
        ? displayDoctors.filter(
            (doctor) =>
              (doctor.departmentId ||
                getDoctorDepartmentId(doctor.initials)) ===
                selectedDepartmentId ||
              appointmentDepartments
                .find((department) => department.id === selectedDepartmentId)
                ?.doctors?.includes(doctor.initials)
          )
        : [],
    [displayDoctors, selectedDepartmentId]
  );
  const selectedDoctor =
    displayDoctors.find(
      (doctor) =>
        doctor.initials === selectedDoctorInitials ||
        doctor.id === selectedDoctorInitials
    ) || null;
  const selectedDepartment =
    appointmentDepartments.find(
      (department) => department.id === selectedDepartmentId
    ) || null;
  const appointmentDates = useMemo(
    () => {
      if (!selectedDoctor) {
        return []
      }

      return getUpcomingAppointmentDates(
        selectedDoctor,
        lang
      )
    },
    [
      selectedDoctor,
      lang
    ]
  )
  const selectedDateOption =
    appointmentDates.find((date) => date.value === selectedAppointmentDate) ||
    null;
  const selectedTimeSlots = selectedDateOption?.timeSlots || [];

  useEffect(() => {
    const hasDoctorInDepartment = departmentDoctors.some(
      (doctor) => doctor.initials === selectedDoctorInitials
    );
    if (
      bookingMode === "general" &&
      selectedDepartmentId &&
      selectedDoctorInitials &&
      !hasDoctorInDepartment
    ) {
      setSelectedDoctorInitials("");
      setSelectedAppointmentDate("");
    }
  }, [
    bookingMode,
    departmentDoctors,
    selectedDepartmentId,
    selectedDoctorInitials,
  ]);

  useEffect(() => {
    if (
      selectedAppointmentDate &&
      !appointmentDates.some((date) => date.value === selectedAppointmentDate)
    ) {
      setSelectedAppointmentDate("");
    }
  }, [appointmentDates, selectedAppointmentDate]);


  // BRIGHT_SCROLL_REVEAL_START
  useEffect(() => {
    const markedElements = [];

    const mark = (
      selector,
      type = "text",
      delay = 0
    ) => {
      document
        .querySelectorAll(selector)
        .forEach((element, index) => {
          if (element.dataset.reveal) {
            markedElements.push(element);
            return;
          }

          element.dataset.reveal = type;

          const resolvedDelay =
            typeof delay === "function"
              ? delay(index, element)
              : delay;

          if (resolvedDelay > 0) {
            element.dataset.revealDelay =
              String(resolvedDelay);
          }

          markedElements.push(element);
        });
    };


    // -----------------------------------------
    // How can we help
    // -----------------------------------------

    mark(
      ".quick > .section-intro",
      "text"
    );

    mark(
      ".quick-grid .quick-card",
      "visual",
      (index) => index * 400
    );


    // -----------------------------------------
    // Doctors
    // -----------------------------------------

    mark(
      ".doctor-heading .section-intro",
      "text"
    );

    mark(
      ".doctor-flow",
      "visual",
      520
    );


    // -----------------------------------------
    // Specialized services
    // -----------------------------------------

    mark(
      ".care > .section-intro",
      "text"
    );

    mark(
      ".department-grid .department",
      "visual",
      (index) => (index % 3) * 380
    );


    // -----------------------------------------
    // Health package
    // -----------------------------------------

    mark(
      ".package-copy",
      "text"
    );

    mark(
      ".package-art",
      "visual",
      560
    );


    // -----------------------------------------
    // Mobile app
    // -----------------------------------------

    mark(
      ".app-copy",
      "text"
    );

    mark(
      ".app-visual",
      "visual",
      560
    );


    // -----------------------------------------
    // Mollick What We Do
    // Use the website's existing slow premium fade reveal
    // -----------------------------------------

    mark(
      ".mollick-services__heading",
      "text"
    );

    mark(
      ".mollick-services__row .mollick-services__copy",
      "text"
    );

    mark(
      ".mollick-services__row .mollick-services__visual",
      "visual",
      480
    );


    // -----------------------------------------
    // Mollick Our Process
    // Existing premium fade/reveal system
    // -----------------------------------------

    mark(
      ".mollick-process-section__heading",
      "text"
    );

    mark(
      ".mollick-process-card",
      "visual",
      360
    );


    // -----------------------------------------
    // Why Bright Health
    // Image first -> text second
    // -----------------------------------------

    mark(
      ".why-visual",
      "visual"
    );

    mark(
      ".why-copy",
      "text",
      560
    );


    // -----------------------------------------
    // Contact
    // -----------------------------------------

    mark(
      ".contact-heading",
      "text"
    );

    mark(
      ".contact-info",
      "visual",
      320
    );

    const contactFields =
      document.querySelectorAll(
        ".contact-form input, .contact-form textarea"
      );

    contactFields.forEach((field, index) => {
      if (field.dataset.reveal) {
        markedElements.push(field);
        return;
      }

      field.dataset.reveal = "text";

      field.dataset.revealDelay =
        String(520 + index * 420);

      markedElements.push(field);
    });


    // -----------------------------------------
    // Footer
    // Column 1 -> 2 -> 3 -> 4
    // -----------------------------------------

    const footerColumns =
      document.querySelectorAll(
        ".footer-main > div"
      );

    footerColumns.forEach((column, index) => {
      if (column.dataset.reveal) {
        markedElements.push(column);
        return;
      }

      column.dataset.reveal = "visual";

      column.dataset.revealDelay =
        String(index * 400);

      markedElements.push(column);
    });


    // -----------------------------------------
    // Reduced motion
    // -----------------------------------------

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    if (reducedMotion) {
      markedElements.forEach((element) => {
        element.classList.add("is-revealed");
      });

      return undefined;
    }


    // Mobile should not make users wait too long
    const delayScale =
      window.matchMedia(
        "(max-width: 640px)"
      ).matches
        ? 0.55
        : 1;


    const timers = new Set();


    // -----------------------------------------
    // Intersection observer
    // -----------------------------------------

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const element = entry.target;

            const delay =
              Math.round(
                Number(
                  element.dataset.revealDelay || 0
                ) * delayScale
              );

            const timer =
              window.setTimeout(() => {
                element.classList.add(
                  "is-revealed"
                );

                timers.delete(timer);
              }, delay);

            timers.add(timer);

            // Reveal ONCE only
            observer.unobserve(element);
          });
        },
        {
          threshold: 0.12,
          rootMargin:
            "0px 0px -12% 0px",
        }
      );


    markedElements.forEach((element) => {
      observer.observe(element);
    });


    return () => {
      observer.disconnect();

      timers.forEach((timer) => {
        window.clearTimeout(timer);
      });
    };
  }, []);
  // BRIGHT_SCROLL_REVEAL_END


  // DOCTOR_SCREEN_DYNAMIC_REVEAL_START
  useEffect(() => {
    if (!doctorListOpen) return undefined;

    let observer = null;
    const timers = new Set();

    const frame = window.requestAnimationFrame(() => {
      const screen =
        document.querySelector(".doctor-screen");

      if (!screen) return;


      const heading =
        screen.querySelector(
          ".doctor-screen-head > div"
        );

      const cards =
        Array.from(
          screen.querySelectorAll(
            ".doctor-full-card"
          )
        );


      const targets = [
        ...(heading ? [heading] : []),
        ...cards,
      ];


      if (!targets.length) return;


      // Apply existing global reveal classes dynamically
      if (heading) {
        heading.dataset.reveal = "text";
        heading.classList.remove(
          "is-revealed"
        );
      }


      cards.forEach((card) => {
        card.dataset.reveal = "visual";

        card.classList.remove(
          "is-revealed"
        );
      });


      const reducedMotion =
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;


      if (reducedMotion) {
        targets.forEach((element) => {
          element.classList.add(
            "is-revealed"
          );
        });

        return;
      }


      const mobile =
        window.matchMedia(
          "(max-width: 640px)"
        ).matches;


      const stagger =
        mobile ? 220 : 380;


      observer =
        new IntersectionObserver(
          (entries) => {

            const visible =
              entries
                .filter(
                  (entry) =>
                    entry.isIntersecting &&
                    !entry.target.classList.contains(
                      "is-revealed"
                    )
                )
                .sort((a, b) => {

                  const aRect =
                    a.target.getBoundingClientRect();

                  const bRect =
                    b.target.getBoundingClientRect();


                  // top row first
                  if (
                    Math.abs(
                      aRect.top - bRect.top
                    ) > 40
                  ) {
                    return (
                      aRect.top -
                      bRect.top
                    );
                  }


                  // then left -> right
                  return (
                    aRect.left -
                    bRect.left
                  );
                });


            visible.forEach(
              (entry, index) => {

                const element =
                  entry.target;


                const isHeading =
                  element === heading;


                const delay =
                  isHeading
                    ? 0
                    : (index + 1) *
                      stagger;


                const timer =
                  window.setTimeout(
                    () => {

                      element.classList.add(
                        "is-revealed"
                      );

                      timers.delete(
                        timer
                      );

                    },
                    delay
                  );


                timers.add(timer);

                // reveal only once
                observer.unobserve(
                  element
                );
              }
            );
          },
          {
            threshold: 0.12,
            rootMargin:
              "0px 0px -12% 0px",
          }
        );


      targets.forEach((element) => {
        observer.observe(element);
      });

    });


    return () => {

      window.cancelAnimationFrame(
        frame
      );


      if (observer) {
        observer.disconnect();
      }


      timers.forEach((timer) => {
        window.clearTimeout(timer);
      });

    };

  }, [doctorListOpen]);
  // DOCTOR_SCREEN_DYNAMIC_REVEAL_END



  useEffect(() => {
    document.documentElement.lang = lang === "bn" ? "bn" : "en";
    document.body.classList.toggle(
      "modal-open",
      modal || doctorListOpen || portalOpen
    );
    return () => document.body.classList.remove("modal-open");
  }, [lang, modal, doctorListOpen, portalOpen]);

  useEffect(() => {
    let alive = true;
    callFunction("getPublicDoctors")({ hospitalId: HOSPITAL_ID })
      .then((result) => {
        if (!alive) return;
        const nextDoctors = (result.data?.doctors || []).map(
          mapPublicDoctorForWebsite
        );
        if (nextDoctors.length) setLiveDoctors(nextDoctors);
      })
      .catch(() => {
        // Keep the premium static doctor list as a safe public fallback if the backend is not deployed yet.
      });
    return () => {
      alive = false;
    };
  }, []);

  
  // PATIENT_PORTAL_REALTIME_START
  useEffect(() => {

    let unsubscribePatient = null
    let unsubscribeBookings = null
    let unsubscribeReports = null
    let unsubscribeInvoices = null
    let unsubscribeClinicalNotes = null


    const stopRealtimeListeners = () => {

      if (unsubscribePatient) {
        unsubscribePatient()
        unsubscribePatient = null
      }

      if (unsubscribeBookings) {
        unsubscribeBookings()
        unsubscribeBookings = null
      }

      if (unsubscribeReports) {
        unsubscribeReports()
        unsubscribeReports = null
      }

      if (unsubscribeInvoices) {
        unsubscribeInvoices()
        unsubscribeInvoices = null
      }

      if (unsubscribeClinicalNotes) {
        unsubscribeClinicalNotes()
        unsubscribeClinicalNotes = null
      }

    }


    const clearPatientData = () => {

      setCurrentPatient(null)
      setPatientBookings([])
      setPatientReports([])
      setPatientInvoices([])
      setPatientClinicalNotes([])

    }


    const timestampValue = value => {

      if (!value) return 0

      if (
        typeof value === 'number'
      ) {
        return value
      }

      if (
        typeof value?.toMillis ===
        'function'
      ) {
        return value.toMillis()
      }

      if (
        typeof value?.seconds ===
        'number'
      ) {
        return (
          value.seconds * 1000
        )
      }

      const parsed =
        Date.parse(value)

      return Number.isNaN(parsed)
        ? 0
        : parsed

    }


    const sortDesc = (a, b) => {

      const aTime =
        timestampValue(
          a.updatedAt ||
          a.createdAt
        )

      const bTime =
        timestampValue(
          b.updatedAt ||
          b.createdAt
        )

      return bTime - aTime

    }


    const snapshotToArray =
      snapshot =>
        snapshot.docs
          .map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          }))
          .sort(sortDesc)


    const unsubscribeAuth =
      onAuthStateChanged(
        firebaseAuth,
        user => {

          // Auth changed:
          // stop listeners from previous user.
          stopRealtimeListeners()


          if (
            !user ||
            user.isAnonymous
          ) {

            clearPatientData()
            return

          }


          const uid = user.uid


          // ============================================
          // PATIENT PROFILE - REALTIME
          // ============================================

          const patientRef =
            doc(
              firebaseDb,
              'hospitals',
              HOSPITAL_ID,
              'patients',
              uid
            )


          unsubscribePatient =
            firestoreOnSnapshot(
              patientRef,

              snapshot => {

                if (
                  !snapshot.exists()
                ) {

                  clearPatientData()
                  return

                }


                setCurrentPatient({
                  uid,
                  id: uid,
                  ...snapshot.data()
                })

              },

              error => {

                console.error(
                  'Patient realtime listener failed:',
                  error
                )

              }
            )


          // ============================================
          // BOOKINGS - REALTIME
          // ============================================

          const bookingsQuery =
            firestoreQuery(
              collection(
                firebaseDb,
                'hospitals',
                HOSPITAL_ID,
                'appointments'
              ),

              where(
                'patientUid',
                '==',
                uid
              )
            )


          unsubscribeBookings =
            firestoreOnSnapshot(
              bookingsQuery,

              snapshot => {

                setPatientBookings(
                  snapshotToArray(
                    snapshot
                  )
                )

              },

              error => {

                console.error(
                  'Booking realtime listener failed:',
                  error
                )

              }
            )


          // ============================================
          // REPORTS - REALTIME
          // ============================================

          const reportsQuery =
            firestoreQuery(
              collection(
                firebaseDb,
                'hospitals',
                HOSPITAL_ID,
                'patientFiles'
              ),

              where(
                'patientUid',
                '==',
                uid
              )
            )


          unsubscribeReports =
            firestoreOnSnapshot(
              reportsQuery,

              snapshot => {

                setPatientReports(
                  snapshotToArray(
                    snapshot
                  )
                )

              },

              error => {

                console.error(
                  'Report realtime listener failed:',
                  error
                )

              }
            )


          // PATIENT_CLINICAL_NOTES_REALTIME
          // ============================================
          // PRESCRIPTIONS - REALTIME
          // ============================================

          const clinicalNotesQuery =
            firestoreQuery(
              collection(
                firebaseDb,
                'hospitals',
                HOSPITAL_ID,
                'clinicalNotes'
              ),

              where(
                'patientUid',
                '==',
                uid
              )
            )


          unsubscribeClinicalNotes =
            firestoreOnSnapshot(
              clinicalNotesQuery,

              snapshot => {

                setPatientClinicalNotes(
                  snapshotToArray(
                    snapshot
                  )
                )

              },

              error => {

                console.error(
                  'Prescription realtime listener failed:',
                  error
                )

              }
            )


          // ============================================
          // INVOICES - REALTIME
          // ============================================

          const invoicesQuery =
            firestoreQuery(
              collection(
                firebaseDb,
                'hospitals',
                HOSPITAL_ID,
                'invoices'
              ),

              where(
                'patientUid',
                '==',
                uid
              )
            )


          unsubscribeInvoices =
            firestoreOnSnapshot(
              invoicesQuery,

              snapshot => {

                setPatientInvoices(
                  snapshotToArray(
                    snapshot
                  )
                )

              },

              error => {

                console.error(
                  'Invoice realtime listener failed:',
                  error
                )

              }
            )

        }
      )


    return () => {

      unsubscribeAuth()

      stopRealtimeListeners()

    }

  }, [])
  // PATIENT_PORTAL_REALTIME_END

  const openPortal = () => {
    setPortalError("");
    setPortalNotice("");
    setOtpSent(false);
    setPortalMode(currentPatient ? "dashboard" : "login");
    setPortalOpen(true);
    setMenu(false);
  };

  const refreshPatientBookings = async (uid) => {
    const { bookings, reports, invoices } = await loadPatientProfileAndData(
      uid
    );
    setPatientBookings(bookings);
    setPatientReports(reports);
    setPatientInvoices(invoices);
  };

  const handlePatientAuth = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const mode = String(form.get("mode") || portalMode);
    const phoneKey = bdPhoneToKey(form.get("phone"));
    const otp = String(form.get("otp") || "").trim();

    if (!isValidBDPhone(phoneKey)) {
      setPortalError(
        lang === "en"
          ? "Please enter a valid Bangladesh mobile number."
          : "সঠিক বাংলাদেশি মোবাইল নম্বর দিন।"
      );
      return;
    }

    setPortalLoading(true);
    setPortalError("");
    setPortalNotice("");
    try {
      if (!otpSent) {
        if (mode === "register") {
          const patientName = String(form.get("patientName") || "").trim();
          if (!patientName) {
            setPortalError(
              lang === "en"
                ? "Patient name is required before sending OTP."
                : "OTP পাঠানোর আগে রোগীর নাম প্রয়োজন।"
            );
            return;
          }
        }
        await callServer("/send-otp", {
          hospitalId: HOSPITAL_ID,
          phone: phoneKey,
          mode,
        });
        setOtpSent(true);
        setPortalNotice(
          lang === "en"
            ? `OTP sent to ${phoneKey}. Enter the 6 digit code below.`
            : `${phoneKey} নম্বরে OTP পাঠানো হয়েছে। নিচে ৬ সংখ্যার কোডটি লিখুন।`
        );
        return;
      }

      if (!/^\d{6}$/.test(otp)) {
        setPortalError(
          lang === "en"
            ? "Please enter the 6 digit OTP."
            : "৬ সংখ্যার OTP লিখুন।"
        );
        return;
      }

      const profile =
        mode === "register"
          ? {
              name: String(form.get("patientName") || "").trim(),
              email: String(form.get("email") || "").trim(),
              dateOfBirth: String(form.get("dateOfBirth") || "").trim(),
              address: String(form.get("address") || "").trim(),
              emergencyContact: String(
                form.get("emergencyContact") || ""
              ).trim(),
            }
          : {};

      if (
        mode === "register" &&
        (!profile.name ||
          !profile.dateOfBirth ||
          !profile.address ||
          !profile.emergencyContact)
      ) {
        setPortalError(
          lang === "en"
            ? "Name, date of birth, address and emergency number are required."
            : "নাম, জন্ম তারিখ, ঠিকানা এবং জরুরি নম্বর প্রয়োজন।"
        );
        return;
      }

      const result = await callFunction("verifyPatientOtp")({
        hospitalId: HOSPITAL_ID,
        phone: phoneKey,
        otp,
        mode,
        profile,
        source: "website",
      });
      if (!result.data?.customToken) throw new Error("No token returned");
      const credential = await signInWithCustomToken(
        firebaseAuth,
        result.data.customToken
      );
      const { patient, bookings, reports, invoices } =
        await loadPatientProfileAndData(credential.user.uid);
      setCurrentPatient(patient);
      setPatientBookings(bookings);
      setPatientReports(reports);
      setPatientInvoices(invoices);
      setOtpSent(false);
      setPortalMode("dashboard");
    } catch (error) {
      setPortalNotice("");
      setPortalError(
        error?.message ||
          (lang === "en"
            ? "Could not complete this request. Check the number and OTP."
            : "অনুরোধ সম্পন্ন হয়নি। নম্বর ও OTP চেক করুন।")
      );
    } finally {
      setPortalLoading(false);
    }
  };

  const handlePortalLogout = async () => {
    await signOut(firebaseAuth);
    setCurrentPatient(null);
    setPatientBookings([]);
    setPatientReports([]);
    setPatientInvoices([]);
    setPatientClinicalNotes([]);
    setOtpSent(false);
    setPortalMode("login");
  };

  const openBooking = (doctor, requestedDepartmentId = "") => {
    if (!currentPatient) {
      setPortalMode("login");
      setPortalError("");
      setPortalNotice(
        lang === "en"
          ? "Please log in or create an account before booking an appointment."
          : "অ্যাপয়েন্টমেন্ট বুক করতে আগে লগ ইন করুন বা অ্যাকাউন্ট তৈরি করুন।"
      );
      setOtpSent(false);
      setPortalOpen(true);
      setDoctorListOpen(false);
      setMenu(false);
      return;
    }
    const isSpecificDoctor = Boolean(doctor?.initials);
    const nextDepartmentId = isSpecificDoctor
      ? doctor.departmentId || getDoctorDepartmentId(doctor.initials)
      : requestedDepartmentId;
    const nextDoctorInitials = isSpecificDoctor ? doctor.initials : "";

    setBookingMode(isSpecificDoctor ? "doctor" : "general");
    setSelectedDepartmentId(nextDepartmentId);
    setSelectedDoctorInitials(nextDoctorInitials);
    setSelectedAppointmentDate("");
    setLastAppointment(null);
    setSent(false);
    setSubmitting(false);
    setBookingError("");
    setDoctorListOpen(false);
    setModal(true);
    setMenu(false);
  };
  const scrollTo = id => {
    const section =
      document.getElementById(id)

    if (!section) {
      setMenu(false)
      return
    }

    // Doctors needs a more precise target because
    // the section has large top padding.
    if (id === 'doctors') {

      const target =
        section.querySelector(
          '.doctor-heading'
        ) || section

      const header =
        document.querySelector(
          '.header'
        )

      let offset = 28

      if (header) {
        const position =
          window
            .getComputedStyle(header)
            .position

        if (
          position === 'fixed' ||
          position === 'sticky'
        ) {
          offset =
            header.offsetHeight + 20
        }
      }

      const top =
        target
          .getBoundingClientRect()
          .top +
        window.scrollY -
        offset

      window.scrollTo({
        top: Math.max(0, top),
        behavior: 'smooth'
      })

    } else {

      // Every other section keeps
      // the existing behaviour.
      section.scrollIntoView({
        behavior: 'smooth'
      })

    }

    setMenu(false)
  }

  const doctorImageStyle = (doctor) => {
    const imageIndexByDoctor = {
      HI: 3,
      AA: 9,
      SS: 0,
      AM: 2,
      KA: 5,
      AL: 7,
      SH: 8,
      SG: 10,
      ZH: 13,
      RH: 15,
      MZ: 0,
      TL: 2,
      SR: 5,
      MH: 7,
      JA: 8,
    };
    const imageIndex = imageIndexByDoctor[doctor.initials] ?? 0;
    const keepAsIs = new Set(["HI", "SS", "AM", "MZ", "TL"]);
    const yBase = Math.floor(imageIndex / 4) * 33.333333;
    const yLiftByDoctor = {
      KA: 5,
      AL: 7,
      SH: 10,
      SG: 10,
      ZH: 12,
      RH: 8,
      SR: 6,
      MH: 7,
      JA: 7,
      AA: 8,
    };
    const yPosition = keepAsIs.has(doctor.initials)
      ? yBase
      : Math.max(0, yBase - (yLiftByDoctor[doctor.initials] ?? 8));
    return {
      backgroundImage: `url(${asset("ai-doctors-sheet.png")})`,
      backgroundPosition: `${(imageIndex % 4) * 33.333333}% ${yPosition}%`,
    };
  };
  const handleAppointmentSubmit = async (event) => {
    event.preventDefault();
    if (!currentPatient) {
      setModal(false);
      setPortalMode("login");
      setPortalNotice(
        lang === "en"
          ? "Please log in or create an account before booking an appointment."
          : "অ্যাপয়েন্টমেন্ট বুক করতে আগে লগ ইন করুন বা অ্যাকাউন্ট তৈরি করুন।"
      );
      setPortalOpen(true);
      return;
    }
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const patientName = String(form.get("patientName") || "").trim();
    const departmentId = String(form.get("department") || "").trim();
    const doctorInitials = String(form.get("doctor") || "").trim();
    const appointmentDate = String(form.get("appointmentDate") || "").trim();
    const appointmentTime = String(form.get("appointmentTime") || "").trim();
    const paymentMethod = String(form.get("paymentMethod") || "").trim();
    const rawPhone = String(form.get("phone") || "").trim();
    const normalizedPhone = normalizePhoneNumber(rawPhone);
    const doctor = displayDoctors.find(
      (item) => item.initials === doctorInitials || item.id === doctorInitials
    );
    const department = appointmentDepartments.find(
      (item) => item.id === departmentId
    );

    if (
      !patientName ||
      !departmentId ||
      !doctorInitials ||
      !appointmentDate ||
      !appointmentTime ||
      !paymentMethod
    ) {
      setBookingError(
        lang === "en"
          ? "Please complete all booking fields first."
          : "অনুগ্রহ করে সব বুকিং তথ্য পূরণ করুন।"
      );
      return;
    }

    if (!doctor || !department) {
      setBookingError(
        lang === "en"
          ? "Please choose a valid department and doctor."
          : "সঠিক বিভাগ ও ডাক্তার সিলেক্ট করুন।"
      );
      return;
    }

    if (
      !isDoctorAppointmentValid(
        doctor,
        appointmentDate,
        appointmentTime
      )
    ) {

      setBookingError(
        lang === 'en'
          ? 'The selected date or time is outside this doctor\'s visiting schedule.'
          : 'নির্বাচিত তারিখ বা সময় এই ডাক্তারের ভিজিটিং সময়ের মধ্যে নেই।'
      )

      return
    }


    if (!isValidBDPhone(rawPhone)) {
      setBookingError(
        lang === "en"
          ? "Please enter a valid Bangladesh mobile number."
          : "সঠিক বাংলাদেশি মোবাইল নম্বর দিন।"
      );
      return;
    }

    if (
      currentPatient &&
      normalizedPhone !==
        (currentPatient.phoneKey || normalizePhoneNumber(currentPatient.phone))
    ) {
      setBookingError(
        lang === "en"
          ? "Use your registered mobile number for this booking."
          : "এই বুকিংয়ের জন্য আপনার রেজিস্টার্ড মোবাইল নম্বর ব্যবহার করুন।"
      );
      return;
    }

    const appointment = {
      patientName,
      phone: normalizedPhone,
      phoneDisplay: displayPhone(normalizedPhone),
      patientId: currentPatient?.uid || "",
      patientUid: currentPatient?.uid || "",
      ownerUid: currentPatient?.uid || "",
      patientPhone: displayPhone(normalizedPhone),
      patientRegistered: Boolean(currentPatient),
      bookingType: bookingMode,
      departmentId,
      departmentName: department.name.en,
      departmentNameBn: department.name.bn,
      doctorId: doctor.id || doctor.initials,
      doctorInitials,
      doctorName: doctor.name.en,
      doctorNameBn: doctor.name.bn,
      specialty: doctor.role.en,
      specialtyBn: doctor.role.bn,
      schedule: doctor.schedule.en,
      scheduleBn: doctor.schedule.bn,
      appointmentDate,
      appointmentTime,
      date: appointmentDate,
      time: appointmentTime,
      appointmentTypeId: departmentId,
      paymentMethod,
      paymentStatus:
        paymentMethod === "pay-at-hospital"
          ? "pay_at_hospital_demo"
          : "demo_payment_pending",
      language: lang,
    };

    setSubmitting(true);
    setBookingError("");
    try {
      await saveAppointmentRequest(appointment);
      setLastAppointment(appointment);
      formElement.reset();
      setSent(true);
    } catch (error) {
      setBookingError(
        lang === "en"
          ? "Could not send the request. Please try again or call the hotline."
          : "অনুরোধ পাঠানো যায়নি। আবার চেষ্টা করুন অথবা হটলাইনে কল করুন।"
      );
    } finally {
      setSubmitting(false);
    }
  };
  const footerHospitalTargets = ["about", "doctors", "services", "contact"];
  const footerPatientActions = [
    openBooking,
    () => scrollTo("packages"),
    openPortal,
    () => scrollTo("contact"),
  ];

  return (
    <div className="site-shell">
      <header className="header">
        <a className="brand" href="#home" aria-label="Mollick Software Solutions home">
          <img src={asset("mollick-icon-white.png")} alt="Mollick Software Solutions logo" />
          <span>
            <strong>MOLLICK</strong>
            <small>SOFTWARE SOLUTIONS</small>
          </span>
        </a>
        <nav
          className={menu ? "nav open" : "nav"}
          aria-label={lang === "en" ? "Main navigation" : "প্রধান নেভিগেশন"}
        >
          {[
            ["home", lang === "en" ? "Home" : "হোম"],
            ["packages", lang === "en" ? "Our Package" : "আমাদের প্যাকেজ"],
            ["services", lang === "en" ? "What We Do" : "আমরা কী করি"],
            ["about", lang === "en" ? "Our Process" : "কাজের প্রক্রিয়া"],
            ["faq", lang === "en" ? "FAQ" : "প্রশ্নোত্তর"],
          ].map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)}>
              {label}
            </button>
          ))}

          <button className="nav-book" onClick={() => scrollTo("contact")}>
            {lang === "en" ? "Contact Us" : "যোগাযোগ করুন"}
          </button>
        </nav>
        <div className="header-actions">
          <button
            className="language"
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            aria-label={lang === "en" ? "Switch to Bangla" : "ইংরেজিতে পরিবর্তন করুন"}
          >
            {t.language}
          </button>

          <button className="book-small" onClick={() => scrollTo("contact")}>
            {lang === "en" ? "Contact Us" : "যোগাযোগ করুন"}
            <Icon name="arrow" size={17} />
          </button>

          <button
            className="menu"
            onClick={() => setMenu(!menu)}
            aria-label={lang === "en" ? "Toggle menu" : "মেনু খুলুন বা বন্ধ করুন"}
          >
            <Icon name={menu ? "close" : "menu"} />
          </button>
        </div>
      </header>

      <main id="home">
<section
          className="mollick-boom-hero"
          aria-labelledby="mollick-hero-title"
        >
          <div className="mollick-boom-hero-inner reveal">
            <div className="mollick-boom-badge">
              <span className="mollick-boom-dot" aria-hidden="true" />
              <span>
                {lang === "en"
                  ? "5+ YEARS OF TRUSTED SOFTWARE DEVELOPMENT"
                  : "৫+ বছরের বিশ্বস্ত সফটওয়্যার ডেভেলপমেন্ট"}
              </span>
            </div>

            <h1
              id="mollick-hero-title"
              className={lang === "bn" ? "hero-title-bn" : "hero-title-en"}
            >
              <span>
                {lang === "en"
                  ? "We build software that grow"
                  : "আমরা এমন সফটওয়্যার তৈরি করি,"}
              </span>
              <strong>
                {lang === "en"
                  ? "your business."
                  : "যা আপনার ব্যবসাকে এগিয়ে নিয়ে যায়।"}
              </strong>
            </h1>

            <p>
              {lang === "en"
                ? "We listen, we design, we engineer, turning ideas into high-performance products for businesses that cannot afford to get it wrong."
                : "আমরা শুনি, ডিজাইন করি এবং তৈরি করি—আপনার আইডিয়াকে রূপ দিই নির্ভরযোগ্য, উচ্চমানের ডিজিটাল প্রোডাক্টে, যা ব্যবসাকে এগিয়ে নিতে তৈরি।"}
            </p>

            <button
              type="button"
              className="mollick-boom-cta"
              onClick={() => scrollTo("contact")}
            >
              {lang === "en" ? "Book a call" : "কল বুক করুন"}
              <Icon name="arrow" size={18} />
            </button>
            <div
              className="hero-package-flow software-package-flow"
              aria-label={
                lang === "en"
                  ? "Scrolling software package list"
                  : "চলমান সফটওয়্যার প্যাকেজ তালিকা"
              }
            >
              <div className="software-package-track">
                {[...softwarePackages, ...softwarePackages].map((pkg, index) => (
                  <article
                    className="software-package-card"
                    key={`hero-${pkg.en}-${index}`}
                  >
                    <div className="software-package-number">
                      {String((index % softwarePackages.length) + 1).padStart(2, "0")}
                    </div>

                    <h3>{lang === "en" ? pkg.en : pkg.bn}</h3>

                    <div className="software-package-amount">
                      <small>{lang === "en" ? "Amount" : "মূল্য"}</small>
                      <strong>
                        {lang === "en" ? pkg.amountEn : pkg.amountBn}
                      </strong>
                    </div>

                    <button
                      type="button"
                      className="software-package-book"
                      onClick={() => scrollTo("contact")}
                    >
                      {lang === "en" ? "Book Now" : "এখনই বুক করুন"}
                      <Icon name="arrow" size={16} />
                    </button>
                  </article>
                ))}
              </div>
            </div>

          </div>
        </section>
        <div className="mollick-what-we-do-wrap">
          <WhatWeDoSection lang={lang} />
        </div>

        <div className="mollick-process-wrap">
          <HomeAboutSection lang={lang} />
        </div>

        <section className="doctor-section section-pad" id="doctors">
          <div className="doctor-heading">
            <div className="section-intro">
              <span className="kicker">{t.doctorsEyebrow}</span>
              <h2>{t.doctorsTitle}</h2>
              <p>{t.doctorsP}</p>
            </div>
            <div className="doctor-tools">
              <button
                className="see-list"
                onClick={() => setDoctorListOpen(true)}
              >
                {lang === "en" ? "See full list" : "সম্পূর্ণ তালিকা"}
                <Icon name="arrow" size={17} />
              </button>
            </div>
          </div>
          <div className="doctor-flow" aria-label="Scrolling doctor list">
            <div className="doctor-track">
              {flowDoctors.map((doctor, index) => (
                <article
                  className="doctor-flow-card"
                  key={`${doctor.initials}-${index}`}
                >
                  <div className="doctor-photo">
                    <DoctorPortrait doctor={doctor} alt={doctor.name[lang]} />
                  </div>
                  <div className="doctor-card-top">
                    <span>{doctor.initials}</span>
                    <b>{doctor.schedule[lang]}</b>
                  </div>
                  <h3>{doctor.name[lang]}</h3>
                  <p>{doctor.role[lang]}</p>
                  <small>{doctor.exp}</small>
                  <em>{doctor.services[lang]}</em>
                  <button
                    className="doctor-book"
                    onClick={() => openBooking(doctor)}
                  >
                    {t.book}
                    <Icon name="arrow" size={16} />
                  </button>
                </article>
              ))}
            </div>
          </div>
          {!filteredDoctors.length && (
            <p className="no-results">{t.noDoctors}</p>
          )}
        </section>

        <section className="care section-pad">
          <div className="section-intro">
            <span className="kicker">{t.careEyebrow}</span>
            <h2>{t.careTitle}</h2>
            <p>{t.careP}</p>
          </div>
          <div className="department-grid">
            {t.departments.map(([title, sub], index) => (
              <button className="department" key={title} type="button" onClick={() => {
                const ids = ["cardiology", "gynecology", "pediatrics", "medicine", "orthopedic", "diagnostics"];
                openBooking(null, ids[index]);
              }}>
                <span className={`dept-symbol d${index}`}>
                  {["♥", "✦", "☀", "＋", "⌁", "◉"][index]}
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{sub}</p>
                </div>
                <Icon name="arrow" size={18} />
              </button>
            ))}
          </div>
          <button className="text-link">
            {t.explore}
            <Icon name="arrow" size={18} />
          </button>
        </section>

        <section className="software-package-section section-pad" id="packages">
          <div className="software-package-heading">
            <div className="section-intro">
              <span className="kicker">
                {lang === "en" ? "Our Packages" : "আমাদের প্যাকেজসমূহ"}
              </span>
              <h2>
                {lang === "en"
                  ? "Choose the right solution for your business."
                  : "আপনার প্রয়োজন অনুযায়ী সঠিক সমাধান বেছে নিন।"}
              </h2>
              <p>
                {lang === "en"
                  ? "Ready-to-start software, website and mobile application packages designed for growing organisations."
                  : "ব্যবসা ও প্রতিষ্ঠানের জন্য প্রস্তুত সফটওয়্যার, ওয়েবসাইট এবং মোবাইল অ্যাপ্লিকেশন প্যাকেজ।"}
              </p>
            </div>
          </div>

          <div
            className="software-package-flow"
            aria-label={
              lang === "en"
                ? "Scrolling software package list"
                : "চলমান সফটওয়্যার প্যাকেজ তালিকা"
            }
          >
            <div className="software-package-track">
              {[...softwarePackages, ...softwarePackages].map((pkg, index) => (
                <article
                  className="software-package-card"
                  key={`${pkg.en}-${index}`}
                >
                  <div className="software-package-number">
                    {String((index % softwarePackages.length) + 1).padStart(2, "0")}
                  </div>

                  <h3>{lang === "en" ? pkg.en : pkg.bn}</h3>

                  <div className="software-package-amount">
                    <small>{lang === "en" ? "Amount" : "মূল্য"}</small>
                    <strong>
                      {lang === "en" ? pkg.amountEn : pkg.amountBn}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="software-package-book"
                    onClick={() => scrollTo("contact")}
                  >
                    {lang === "en" ? "Book Now" : "এখনই বুক করুন"}
                    <Icon name="arrow" size={16} />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="app-section section-pad" id="app">
          <div className="app-copy">
            <span className="app-pill">
              <i />
              {lang === "en"
                ? "Bright Health mobile app"
                : "ব্রাইট হেলথ মোবাইল অ্যাপ"}
            </span>
            <h2>
              {lang === "en"
                ? "Hospital care, closer than ever."
                : "হাসপাতালের সেবা, আরও কাছে।"}
            </h2>
            <p>
              {lang === "en"
                ? "Book appointments, check reports, explore health packages and stay connected with Bright Health from your phone."
                : "ফোন থেকেই অ্যাপয়েন্টমেন্ট বুকিং, রিপোর্ট দেখা, হেলথ প্যাকেজ ও ব্রাইট হেলথের সাথে দ্রুত যোগাযোগ করুন।"}
            </p>
            <div className="store-buttons">
              <button aria-label="Download on the App Store">
                <img
                  src={asset("app-store-badge.webp")}
                  alt="Download on the App Store"
                />
              </button>
              <button aria-label="Get it on Google Play">
                <img
                  src={asset("google-play-badge.webp")}
                  alt="Get it on Google Play"
                />
              </button>
            </div>
          </div>
          <div className="app-visual">
            <img
              src={asset("app-phones.webp")}
              alt="Bright Health app preview"
              loading="lazy"
            />
          </div>
        </section>

        <section className="contact-section section-pad" id="contact">
          <div className="contact-heading">
            <span className="kicker light">Contact</span>
            <h2>
              Get in <em>Touch</em>
            </h2>
          </div>
          <div className="contact-layout">
            <div className="contact-info">
              <a href={`tel:${HOTLINE}`}>
                <Icon name="phone" size={21} />
                <span>
                  {HOTLINE}{" "}
                  <small>{lang === "en" ? "Hotline" : "হটলাইন"}</small>
                </span>
              </a>
              <a href={MAP_URL} target="_blank" rel="noreferrer">
                <Icon name="pin" size={21} />
                <span>{t.address}</span>
              </a>
              <div className="contact-map-card">
                <div className="mini-map" aria-hidden="true">
                  <span className="map-road main" />
                  <span className="map-road cross" />
                  <span className="map-dot">
                    <Icon name="pin" size={18} />
                  </span>
                </div>
                <div>
                  <strong>
                    {lang === "en"
                      ? "Find us on Google Map"
                      : "গুগল ম্যাপে দেখুন"}
                  </strong>
                  <p>{t.address}</p>
                  <a href={MAP_URL} target="_blank" rel="noreferrer">
                    {t.directions}
                    <Icon name="arrow" size={16} />
                  </a>
                </div>
              </div>
            </div>
            <form
            className="contact-form"
            onSubmit={async event => {
              event.preventDefault()

              const form =
                event.currentTarget

              const feedback =
                form.querySelector(
                  '[data-contact-feedback]'
                )

              const submitButton =
                form.querySelector(
                  'button[type="submit"]'
                )

              const formData =
                new FormData(form)


              const name =
                String(
                  formData.get('name') || ''
                ).trim()


              const phone =
                String(
                  formData.get('phone') || ''
                )
                  .replace(/\D/g, '')
                  .slice(0, 11)


              const message =
                String(
                  formData.get('message') || ''
                ).trim()


              const showFeedback = (
                type,
                text
              ) => {

                if (!feedback) return

                feedback.textContent =
                  text

                feedback.className =
                  `contact-feedback ${type}`
              }


              // ======================================
              // REQUIRED VALIDATION
              // ======================================

              if (
                !name ||
                !phone ||
                !message
              ) {

                showFeedback(
                  'error',
                  lang === 'en'
                    ? 'Please complete all three fields.'
                    : 'অনুগ্রহ করে তিনটি ঘরই পূরণ করুন।'
                )

                return
              }


              // Bangladesh mobile:
              // exactly 11 digits
              // 013 - 019

              if (
                !/^01[3-9]\d{8}$/.test(phone)
              ) {

                showFeedback(
                  'error',
                  lang === 'en'
                    ? 'Please enter a valid 11 digit mobile number.'
                    : 'সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন।'
                )

                return
              }


              if (name.length > 100) {

                showFeedback(
                  'error',
                  lang === 'en'
                    ? 'Name is too long.'
                    : 'নামটি অনেক বড় হয়েছে।'
                )

                return
              }


              if (message.length > 2000) {

                showFeedback(
                  'error',
                  lang === 'en'
                    ? 'Message is too long.'
                    : 'মেসেজটি অনেক বড় হয়েছে।'
                )

                return
              }


              if (submitButton) {
                submitButton.disabled =
                  true
              }


              showFeedback(
                'sending',
                lang === 'en'
                  ? 'Submitting...'
                  : 'পাঠানো হচ্ছে...'
              )


              try {

                const database =
                  realtimeDatabase.getDatabase(
                    firebaseApp
                  )


                const submissionsRef =
                  realtimeDatabase.ref(
                    database,
                    'Get_in_touch'
                  )


                await realtimeDatabase.push(
                  submissionsRef,
                  {
                    name,
                    phone,
                    message,
                    language: lang,
                    createdAt: realtimeDatabase.serverTimestamp()
                  }
                )


                form.reset()


                // Clear old inline feedback
                if (feedback) {
                  feedback.textContent = ''
                  feedback.className =
                    'contact-feedback'
                }


                // ======================================
                // PREMIUM SUCCESS TOAST
                // ======================================

                let toast =
                  document.getElementById(
                    'contact-success-toast'
                  )


                if (!toast) {

                  toast =
                    document.createElement(
                      'div'
                    )

                  toast.id =
                    'contact-success-toast'

                  toast.className =
                    'contact-success-toast'

                  toast.setAttribute(
                    'role',
                    'status'
                  )

                  toast.setAttribute(
                    'aria-live',
                    'polite'
                  )

                  document.body.appendChild(
                    toast
                  )

                }


                toast.innerHTML =
                  '<span class="contact-success-toast__icon">✓</span>' +
                  '<span class="contact-success-toast__copy">' +
                    '<strong>' +
                      (
                        lang === 'en'
                          ? 'Message sent successfully'
                          : 'বার্তা সফলভাবে পাঠানো হয়েছে'
                      ) +
                    '</strong>' +
                    '<small>' +
                      (
                        lang === 'en'
                          ? 'Thank you for contacting Bright Health. We will get back to you soon.'
                          : 'ব্রাইট হেলথের সাথে যোগাযোগ করার জন্য ধন্যবাদ। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।'
                      ) +
                    '</small>' +
                  '</span>'


                // Restart animation if needed
                toast.classList.remove(
                  'is-visible'
                )

                void toast.offsetWidth

                toast.classList.add(
                  'is-visible'
                )


                // Clear previous timers
                if (
                  window
                    .__brightHealthContactToastTimer
                ) {
                  window.clearTimeout(
                    window
                      .__brightHealthContactToastTimer
                  )
                }


                if (
                  window
                    .__brightHealthContactScrollTimer
                ) {
                  window.clearTimeout(
                    window
                      .__brightHealthContactScrollTimer
                  )
                }


                // ======================================
                // SHOW TOAST FIRST,
                // THEN SMOOTH SCROLL HOME
                // ======================================

                window
                  .__brightHealthContactScrollTimer =
                    window.setTimeout(
                      () => {

                        window.scrollTo({
                          top: 0,
                          left: 0,
                          behavior: 'smooth'
                        })

                      },
                      700
                    )


                // ======================================
                // AUTO HIDE TOAST
                // ======================================

                window
                  .__brightHealthContactToastTimer =
                    window.setTimeout(
                      () => {

                        toast.classList.remove(
                          'is-visible'
                        )


                        window.setTimeout(
                          () => {

                            if (
                              toast &&
                              toast.parentNode
                            ) {
                              toast.remove()
                            }

                          },
                          350
                        )

                      },
                      3800
                    )
              } catch (error) {

                console.error(
                  'Get_in_touch submission failed:',
                  error
                )


                showFeedback(
                  'error',
                  lang === 'en'
                    ? 'Could not submit your message. Please try again.'
                    : 'বার্তাটি পাঠানো যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।'
                )

              } finally {

                if (submitButton) {
                  submitButton.disabled =
                    false
                }

              }
            }}
          >

            <input
              name="name"
              required
              maxLength={100}
              autoComplete="name"
              placeholder={t.name}
              aria-required="true"
            />


            <input
              name="phone"
              type="tel"
              inputMode="numeric"
              required
              minLength={11}
              maxLength={11}
              pattern="01[3-9][0-9]{8}"
              autoComplete="tel"
              placeholder={t.phone}
              aria-required="true"

              onInput={event => {
                event.currentTarget.value =
                  String(
                    event.currentTarget.value ||
                    ''
                  )
                    .replace(/\D/g, '')
                    .slice(0, 11)
              }}
            />


            <textarea
              name="message"
              required
              maxLength={2000}
              placeholder={
                lang === 'en'
                  ? 'Message'
                  : 'মেসেজ'
              }
              aria-required="true"
            />


            <button
              className="button yellow"
              type="submit"
            >
              {lang === 'en'
                ? 'Submit'
                : 'সাবমিট'}
            </button>


            <p
              className="contact-feedback"
              data-contact-feedback
              aria-live="polite"
            />

          </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <a className="brand inverted" href="#home" aria-label="Mollick Software Solutions home">
              <img src={asset("mollick-icon-white.png")} alt="" />
              <span>
                <strong>MOLLICK</strong>
                <small>SOFTWARE SOLUTIONS</small>
              </span>
            </a>
            <p>{t.footerP}</p>
            <a href={`tel:${HOTLINE}`}>{HOTLINE}</a>
          </div>
          <div>
            <h3>{t.footerHeadings[0]}</h3>
            {t.hospitalLinks.map((x, i) => (
              <button
                key={x}
                onClick={() => i === 0 ? window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }) : scrollTo(footerHospitalTargets[i - 1])}
              >
                {x}
              </button>
            ))}
          </div>
          <div>
            <h3>{t.footerHeadings[1]}</h3>
            {t.patientLinks.map((x, i) => (
              <button key={x} onClick={footerPatientActions[i]}>
                {x}
              </button>
            ))}
          </div>
          <div className="footer-cta">
            <h3>{t.always}</h3>
            <p>{t.alwaysP}</p>
            <a href={`tel:${HOTLINE}`}>
              <Icon name="phone" size={17} />
              {HOTLINE}
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{t.copyright}</span>
          <button onClick={() => setLang(lang === "en" ? "bn" : "en")}>
            {t.language}
          </button>
        </div>
      </footer>

      {doctorListOpen && (
        <div
          className="doctor-screen"
          role="dialog"
          aria-modal="true"
          aria-labelledby="doctor-list-title"
        >
          <div className="doctor-screen-head">
            <div>
              <span className="kicker">{t.doctorsEyebrow}</span>
              <h2 id="doctor-list-title">
                {lang === "en"
                  ? "Full specialist list"
                  : "সম্পূর্ণ ডাক্তার তালিকা"}
              </h2>
            </div>
            <button
              className="modal-close"
              onClick={() => setDoctorListOpen(false)}
              aria-label={t.close}
            >
              <Icon name="close" />
            </button>
          </div>
          <div className="doctor-full-grid">
            {filteredDoctors.map((doctor, index) => (
              <article className="doctor-full-card" key={doctor.initials}>
                <div className="doctor-full-photo">
                  <DoctorPortrait doctor={doctor} alt={doctor.name[lang]} />
                </div>
                <div>
                  <h3>{doctor.name[lang]}</h3>
                  <p>{doctor.role[lang]}</p>
                  <small>{doctor.exp}</small>
                  <b>{doctor.schedule[lang]}</b>
                  <em>{doctor.services[lang]}</em>
                  <button
                    className="doctor-book"
                    onClick={() => openBooking(doctor)}
                  >
                    {t.book}
                    <Icon name="arrow" size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {modal && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(e) => e.target === e.currentTarget && setModal(false)}
        >
          <div
            className="modal appointment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
          >
            <button
              className="modal-close"
              onClick={() => setModal(false)}
              aria-label={t.close}
            >
              <Icon name="close" />
            </button>
            {sent ? (
              <div className="success appointment-success">
                <span>
                  <Icon name="check" size={34} />
                </span>
                <h2>
                  {lang === "en"
                    ? "Appointment request received"
                    : "অ্যাপয়েন্টমেন্ট অনুরোধ নেওয়া হয়েছে"}
                </h2>
                {lastAppointment && (
                  <div className="success-details">
                    <p>
                      <b>{lang === "en" ? "Department" : "বিভাগ"}</b>
                      <span>
                        {
                          lastAppointment[
                            lang === "en"
                              ? "departmentName"
                              : "departmentNameBn"
                          ]
                        }
                      </span>
                    </p>
                    <p>
                      <b>{lang === "en" ? "Doctor" : "ডাক্তার"}</b>
                      <span>
                        {
                          lastAppointment[
                            lang === "en" ? "doctorName" : "doctorNameBn"
                          ]
                        }
                      </span>
                    </p>
                    <p>
                      <b>{lang === "en" ? "Date" : "তারিখ"}</b>
                      <span>{lastAppointment.appointmentDate}</span>
                    </p>
                    <p>
                      <b>{lang === "en" ? "Time" : "সময়"}</b>
                      <span>{lastAppointment.appointmentTime}</span>
                    </p>
                    <p>
                      <b>{lang === "en" ? "Payment" : "পেমেন্ট"}</b>
                      <span>
                        {lastAppointment.paymentMethod === "pay-at-hospital"
                          ? lang === "en"
                            ? "Pay at hospital - demo"
                            : "হাসপাতালে পেমেন্ট - ডেমো"
                          : lang === "en"
                          ? "Demo online payment selected"
                          : "ডেমো অনলাইন পেমেন্ট সিলেক্টেড"}
                      </span>
                    </p>
                  </div>
                )}
                <p className="success-note">
                  {lang === "en"
                    ? "Our team will call the patient to confirm the final serial. Portal login is optional for viewing reports later."
                    : "ফাইনাল সিরিয়াল নিশ্চিত করতে আমাদের টিম রোগীকে কল করবে। পরে রিপোর্ট দেখতে পোর্টাল লগইন করা যাবে।"}
                </p>
                <button
                  className="button primary"
                  onClick={() => setModal(false)}
                >
                  {t.close}
                </button>
              </div>
            ) : (
              <>
                <span className="kicker">
                  {bookingMode === "doctor"
                    ? lang === "en"
                      ? "Doctor appointment"
                      : "ডাক্তার অ্যাপয়েন্টমেন্ট"
                    : t.appointment}
                </span>
                <h2 id="booking-title">{t.modalTitle}</h2>
                <p>
                  {bookingMode === "doctor"
                    ? lang === "en"
                      ? "This doctor is already selected. Choose a date and time from the visiting schedule."
                      : "এই ডাক্তার আগে থেকেই সিলেক্ট করা আছে। ভিজিটিং সময় অনুযায়ী তারিখ ও সময় বেছে নিন।"
                    : lang === "en"
                    ? "Select a department first. Then choose an available doctor, date and time."
                    : "প্রথমে বিভাগ সিলেক্ট করুন। এরপর সেই বিভাগের ডাক্তার, তারিখ ও সময় বেছে নিন।"}
                </p>
                <form onSubmit={handleAppointmentSubmit}>
                  <div className="booking-grid">
                    <label>
                      {t.name}
                      <input name="patientName" required autoFocus />
                    </label>
                    <label>
                      {t.phone}
                      <input
                        name="phone"
                        required
                        {...phoneInputProps}
                        defaultValue={currentPatient?.phone || ""}
                        readOnly={Boolean(currentPatient)}
                      />
                    </label>
                    {bookingMode === "general" ? (
                      <>
                        <label>
                          {lang === "en" ? "Department" : "বিভাগ"}
                          <select
                            name="department"
                            required
                            value={selectedDepartmentId}
                            onChange={(event) => {
                              const nextDepartmentId = event.target.value;
                              setSelectedDepartmentId(nextDepartmentId);
                              setSelectedDoctorInitials("");
                              setSelectedAppointmentDate("");
                            }}
                          >
                            <option value="" disabled>
                              {lang === "en"
                                ? "Select department"
                                : "বিভাগ সিলেক্ট করুন"}
                            </option>
                            {appointmentDepartments.map((department) => (
                              <option key={department.id} value={department.id}>
                                {department.name[lang]}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          {lang === "en" ? "Doctor" : "ডাক্তার"}
                          <select
                            name="doctor"
                            required
                            value={selectedDoctorInitials}
                            disabled={!selectedDepartmentId}
                            onChange={(event) => {
                              setSelectedDoctorInitials(event.target.value);
                              setSelectedAppointmentDate("");
                            }}
                          >
                            <option value="" disabled>
                              {selectedDepartmentId
                                ? lang === "en"
                                  ? "Select doctor"
                                  : "ডাক্তার সিলেক্ট করুন"
                                : lang === "en"
                                ? "Select department first"
                                : "আগে বিভাগ সিলেক্ট করুন"}
                            </option>
                            {departmentDoctors.map((doctor) => (
                              <option
                                key={doctor.initials}
                                value={doctor.initials}
                              >
                                {doctor.name[lang]}
                              </option>
                            ))}
                          </select>
                        </label>
                      </>
                    ) : (
                      <div className="selected-doctor-note full">
                        <small>{selectedDepartment?.name[lang] || ""}</small>
                        <strong>{selectedDoctor?.name[lang] || ""}</strong>
                        <span>{selectedDoctor?.role[lang] || ""}</span>
                        <input
                          type="hidden"
                          name="department"
                          value={selectedDepartmentId}
                        />
                        <input
                          type="hidden"
                          name="doctor"
                          value={selectedDoctorInitials}
                        />
                      </div>
                    )}
                    <label>
                      {lang === "en" ? "Appointment date" : "তারিখ"}
                      <select
                        name="appointmentDate"
                        required
                        value={selectedAppointmentDate}
                        disabled={!selectedDoctorInitials}
                        onChange={(event) =>
                          setSelectedAppointmentDate(event.target.value)
                        }
                      >
                        <option value="" disabled>
                          {selectedDoctorInitials
                            ? lang === "en"
                              ? "Select date"
                              : "তারিখ সিলেক্ট করুন"
                            : lang === "en"
                            ? "Select doctor first"
                            : "আগে ডাক্তার সিলেক্ট করুন"}
                        </option>
                        {appointmentDates.map((date) => (
                          <option key={date.value} value={date.value}>
                            {date.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      {lang === "en" ? "Time slot" : "সময়"}
                      <select
                        name="appointmentTime"
                        required
                        key={`${selectedDoctorInitials}-${selectedAppointmentDate}`}
                        disabled={!selectedAppointmentDate}
                      >
                        <option value="" disabled>
                          {selectedAppointmentDate
                            ? lang === "en"
                              ? "Select time"
                              : "সময় সিলেক্ট করুন"
                            : lang === "en"
                            ? "Select date first"
                            : "আগে তারিখ সিলেক্ট করুন"}
                        </option>
                        {selectedTimeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {selectedDoctor && (
                    <div className="selected-doctor-note">
                      <strong>{selectedDoctor.name[lang]}</strong>
                      <span>{selectedDoctor.schedule[lang]}</span>
                    </div>
                  )}
                  <div className="payment-demo">
                    <b>{lang === "en" ? "Demo payment" : "ডেমো পেমেন্ট"}</b>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="demo-online"
                        required
                      />
                      <span>
                        {lang === "en"
                          ? "Demo online payment, real gateway will be added later"
                          : "ডেমো অনলাইন পেমেন্ট, পরে আসল গেটওয়ে যুক্ত হবে"}
                      </span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="pay-at-hospital"
                      />
                      <span>
                        {lang === "en"
                          ? "Pay at hospital counter"
                          : "হাসপাতাল কাউন্টারে পেমেন্ট"}
                      </span>
                    </label>
                  </div>
                  {bookingError && <p className="form-error">{bookingError}</p>}
                  <button
                    className="button primary"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting
                      ? lang === "en"
                        ? "Booking..."
                        : "বুকিং হচ্ছে..."
                      : t.submit}
                    <Icon name="arrow" size={18} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
      {portalOpen && (
        <div
          className="patient-page-backdrop"
        >
          <div
            className="patient-page-shell"
            aria-labelledby="patient-portal-title"
          >
            <header className="patient-page-header">
              <button className="patient-page-back" onClick={() => setPortalOpen(false)} aria-label={t.close}>
                <Icon name="arrow" size={18} />
                <span>{lang === "en" ? "Back to website" : "ওয়েবসাইটে ফিরুন"}</span>
              </button>
              <div><span className="kicker">{t.portal}</span><h2 id="patient-portal-title">{lang === "en" ? "My Bright Hospital" : "আমার ব্রাইট হাসপাতাল"}</h2></div>
              <img src={asset("bright-health-logo.png")} alt="Bright Hospital" />
            </header>
            <main className="patient-page-content">
            {currentPatient && portalMode === "dashboard" ? (
              <div className="patient-dashboard">
                <div className="patient-card">
                  <div className="patient-card-copy">
                    <b>
                      {currentPatient?.name ||
                        (lang === "en" ? "Patient" : "রোগী")}
                    </b>
                    <span>{currentPatient.phone}</span>
                    <small>
                      {lang === "en"
                        ? `Date of birth: ${currentPatient.dateOfBirth || "-"}`
                        : `জন্ম তারিখ: ${currentPatient.dateOfBirth || "-"}`}
                    </small>
                    <div className="patient-profile-grid">
                      <span><small>Email</small><strong>{currentPatient.email || "Not provided"}</strong></span>
                      <span><small>Emergency number</small><strong>{currentPatient.emergencyContact || "Not provided"}</strong></span>
                      <span className="full"><small>Address</small><strong>{currentPatient.address || "Not provided"}</strong></span>
                    </div>
                  </div>
                  <button type="button" onClick={handlePortalLogout}>
                    {lang === "en" ? "Log out" : "লগ আউট"}
                  </button>
                </div>
                <div className="portal-panel">
                  <h3>{lang === "en" ? "My bookings" : "আমার বুকিং"}</h3>
                  {patientBookings.length ? (
                    <div className="booking-list">
                      {patientBookings.map((booking) => {
                        const doctor = displayDoctors.find((item) => item.id === booking.doctorId || item.initials === booking.doctorInitials);
                        const doctorName = booking[lang === "en" ? "doctorName" : "doctorNameBn"] || booking.doctorName || doctor?.name?.[lang] || doctor?.name?.en || "Doctor";
                        const department = booking[lang === "en" ? "departmentName" : "departmentNameBn"] || booking.departmentName || booking.specialty || "General consultation";
                        const status = booking.status || "requested";

                        const clinicalNote =
                          patientClinicalNotes.find(
                            (note) =>
                              String(
                                note.appointmentId || ""
                              ) ===
                              String(
                                booking.id || ""
                              )
                          );
                        return (
                          <article className="portal-booking-card" key={booking.id}>
                            <div className="portal-booking-head">
                              <div className="portal-booking-avatar">
                                {doctor ? <DoctorPortrait doctor={doctor} alt={doctorName} /> : <span className="doctor-photo-fallback"><b>{doctorName.replace(/^Dr\.?\s*/i, "").split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase()}</b></span>}
                              </div>
                              <div className="portal-booking-doctor"><small>Appointment with</small><strong>{doctorName}</strong><span>{department}</span></div>
                              <b className={`portal-booking-status status-${status}`}>{status === "requested" ? "Waiting" : status.replaceAll("_", " ")}</b>
                            </div>
                            <div className="portal-booking-time"><span>{booking.appointmentDate || "Date pending"}</span><b>{booking.appointmentTime || "Time pending"}</b></div>
                            <div className="portal-booking-meta">
                              <span><small>Reference</small><b>{booking.id}</b></span>
                              <span><small>Payment</small><b>{(booking.paymentStatus || "pay at hospital").replaceAll("_", " ")}</b></span>
                            </div>

                             {clinicalNote && (
                               <div className="portal-prescription-card">

                                 <div className="portal-prescription-heading">

                                   <div className="portal-prescription-symbol">
                                     ✣
                                   </div>

                                   <div>

                                     <small>
                                       {lang === "en"
                                         ? "Clinical note"
                                         : "চিকিৎসকের নোট"}
                                     </small>

                                     <strong>
                                       {lang === "en"
                                         ? "Doctor prescription"
                                         : "ডাক্তারের প্রেসক্রিপশন"}
                                     </strong>

                                   </div>

                                 </div>


                                 {clinicalNote.diagnosis && (
                                   <p className="portal-prescription-line">

                                     <b>
                                       {lang === "en"
                                         ? "Diagnosis:"
                                         : "রোগ নির্ণয়:"}
                                     </b>

                                     {" "}

                                     {clinicalNote.diagnosis}

                                   </p>
                                 )}


                                 {clinicalNote.symptoms && (
                                   <p className="portal-prescription-line">

                                     <b>
                                       {lang === "en"
                                         ? "Symptoms:"
                                         : "উপসর্গ:"}
                                     </b>

                                     {" "}

                                     {clinicalNote.symptoms}

                                   </p>
                                 )}


                                 {Array.isArray(
                                   clinicalNote.prescriptionItems
                                 ) &&
                                   clinicalNote.prescriptionItems.length > 0 && (

                                     <div className="portal-prescription-medicines">

                                       {clinicalNote.prescriptionItems.map(
                                         (item, index) => (

                                           <div
                                             className="portal-prescription-medicine"
                                             key={
                                               clinicalNote.id +
                                               "-medicine-" +
                                               index
                                             }
                                           >

                                             <strong>
                                               {index + 1}.{" "}
                                               {item.medicine ||
                                                 (lang === "en"
                                                   ? "Medicine"
                                                   : "ওষুধ")}
                                             </strong>


                                             <span>
                                               {[
                                                 item.dose,
                                                 item.frequency,
                                                 item.duration,
                                               ]
                                                 .filter(Boolean)
                                                 .join(" · ")}
                                             </span>


                                             {item.instruction && (
                                               <b>
                                                 {item.instruction}
                                               </b>
                                             )}

                                           </div>

                                         )
                                       )}

                                     </div>

                                   )}


                                 {clinicalNote.prescription && (
                                   <p className="portal-prescription-line">

                                     <b>
                                       {lang === "en"
                                         ? "Note:"
                                         : "অতিরিক্ত নোট:"}
                                     </b>

                                     {" "}

                                     {clinicalNote.prescription}

                                   </p>
                                 )}


                                 {clinicalNote.advice && (
                                   <p className="portal-prescription-line">

                                     <b>
                                       {lang === "en"
                                         ? "Advice:"
                                         : "পরামর্শ:"}
                                     </b>

                                     {" "}

                                     {clinicalNote.advice}

                                   </p>
                                 )}


                                 {clinicalNote.followUpDate && (
                                   <div className="portal-prescription-followup">

                                     <b>
                                       {lang === "en"
                                         ? "Follow-up:"
                                         : "ফলো-আপ:"}
                                     </b>

                                     <span>
                                       {formatClinicalDate(
                                         clinicalNote.followUpDate,
                                         lang
                                       )}
                                     </span>

                                   </div>
                                 )}


                                 <button
                                   type="button"
                                   className="portal-prescription-download"
                                   onClick={() =>
                                     downloadClinicalNotePdf({
                                       note: clinicalNote,
                                       booking,

                                       patientName:
                                         currentPatient?.name ||
                                         (lang === "en"
                                           ? "Patient"
                                           : "রোগী"),

                                       doctorName,
                                       lang,
                                     })
                                   }
                                 >

                                   <span>
                                     ↓
                                   </span>

                                   {lang === "en"
                                     ? "Download prescription PDF"
                                     : "প্রেসক্রিপশন PDF ডাউনলোড করুন"}

                                 </button>

                               </div>
                             )}

                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <p>
                      {lang === "en"
                        ? "No bookings are linked with this account yet."
                        : "এই একাউন্টে এখনো কোনো বুকিং যুক্ত নেই।"}
                    </p>
                  )}
                </div>
                <div className="portal-panel muted">
                  <h3>{lang === "en" ? "Reports" : "রিপোর্ট"}</h3>
                  {patientReports.length ? (
                    <div className="booking-list">
                      {patientReports.map((report) => (
                        <article key={report.id}>
                          <strong>
                            {report.fileName || report.category || "Report"}
                          </strong>
                          <span>
                            {report.category || "file"} · {report.note || ""}
                          </span>
                          {report.fileUrl && (
                            <a
                              href={report.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {lang === "en" ? "Open report" : "রিপোর্ট খুলুন"}
                            </a>
                          )}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p>
                      {lang === "en"
                        ? "Reports will appear here after the hospital uploads them."
                        : "হাসপাতাল রিপোর্ট আপলোড করলে এখানে দেখা যাবে।"}
                    </p>
                  )}
                </div>
                <div className="portal-panel muted">
                  <h3>{lang === "en" ? "Account details" : "একাউন্ট বিবরণ"}</h3>
                  {patientInvoices.length ? (
                    <div className="booking-list">
                      {patientInvoices.map((invoice) => (
                        <article key={invoice.id}>
                          <strong>
                            {invoice.type || "Invoice"} · Tk{" "}
                            {invoice.total || 0}
                          </strong>
                          <span>
                            {invoice.status || "due"} · Paid Tk{" "}
                            {invoice.paid || 0} · Due Tk {invoice.due || 0}
                          </span>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p>
                      {lang === "en"
                        ? "No invoice is linked with this account yet."
                        : "এই একাউন্টে এখনো কোনো ইনভয়েস নেই।"}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <section className="portal-auth-card">
                <div className="portal-auth-heading">
                  <span className="kicker">Secure patient access</span>
                  <h3>{portalMode === "login" ? "Welcome back" : "Create your patient account"}</h3>
                <p>
                  {lang === "en"
                    ? "Register or login with your mobile number using OTP."
                    : "মোবাইল নম্বর দিয়ে OTP ব্যবহার করে রেজিস্ট্রেশন বা লগ ইন করুন।"}
                </p>
                </div>
                <div className="portal-tabs">
                  <button
                    className={portalMode === "login" ? "active" : ""}
                    type="button"
                    onClick={() => {
                      setPortalMode("login");
                      setPortalError("");
                      setPortalNotice("");
                      setOtpSent(false);
                    }}
                  >
                    {lang === "en" ? "Login" : "লগ ইন"}
                  </button>
                  <button
                    className={portalMode === "register" ? "active" : ""}
                    type="button"
                    onClick={() => {
                      setPortalMode("register");
                      setPortalError("");
                      setPortalNotice("");
                      setOtpSent(false);
                    }}
                  >
                    {lang === "en" ? "Register" : "রেজিস্ট্রেশন"}
                  </button>
                </div>
                <form onSubmit={handlePatientAuth}>
                  <input type="hidden" name="mode" value={portalMode} />
                  {portalMode === "register" && (
                    <div className="booking-grid">
                      <label>
                        {t.name}
                        <input name="patientName" required />
                      </label>
                      <label>
                        {lang === "en" ? "Date of birth" : "জন্ম তারিখ"}
                        <input
                          name="dateOfBirth"
                          required
                          type="date"
                          max={new Date().toISOString().slice(0, 10)}
                        />
                      </label>
                      <label>
                        {lang === "en" ? "Email" : "ইমেইল"}
                        <input
                          name="email"
                          type="email"
                          placeholder="optional@email.com"
                        />
                      </label>
                      <label>
                        {lang === "en" ? "Emergency number" : "জরুরি নম্বর"}
                        <input
                          name="emergencyContact"
                          required
                          {...phoneInputProps}
                        />
                      </label>
                      <label className="full">
                        {lang === "en" ? "Address" : "ঠিকানা"}
                        <input
                          name="address"
                          required
                          placeholder={
                            lang === "en" ? "Patient address" : "রোগীর ঠিকানা"
                          }
                        />
                      </label>
                    </div>
                  )}
                  <label>
                    {t.phone}
                    <input name="phone" required {...phoneInputProps} />
                  </label>
                  {otpSent && (
                    <label>
                      {lang === "en" ? "OTP code" : "OTP কোড"}
                      <input
                        name="otp"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength="6"
                        required
                        autoFocus
                        placeholder={
                          lang === "en"
                            ? "Enter 6 digit OTP"
                            : "৬ সংখ্যার OTP লিখুন"
                        }
                      />
                    </label>
                  )}
                  {portalNotice && (
                    <p className="form-notice">{portalNotice}</p>
                  )}
                  {portalError && <p className="form-error">{portalError}</p>}
                  <button
                    className="button primary"
                    type="submit"
                    disabled={portalLoading}
                  >
                    {portalLoading
                      ? lang === "en"
                        ? "Please wait..."
                        : "অপেক্ষা করুন..."
                      : otpSent
                      ? lang === "en"
                        ? "Verify OTP"
                        : "OTP যাচাই করুন"
                      : lang === "en"
                      ? "Send OTP"
                      : "OTP পাঠান"}
                    <Icon name="arrow" size={18} />
                  </button>
                </form>
              </section>
            )}
            </main>
            {portalLoading && (
              <div className="portal-loader" role="status" aria-live="polite">
                <div className="portal-loader-card">
                  <img src={asset("bright-health-logo.png")} alt="" />
                  <span className="portal-spinner" />
                  <strong>{otpSent ? (lang === "en" ? "Verifying your OTP..." : "আপনার OTP যাচাই করা হচ্ছে...") : (lang === "en" ? "Sending your OTP..." : "আপনার OTP পাঠানো হচ্ছে...")}</strong>
                  <small>{lang === "en" ? "Please keep this page open" : "অনুগ্রহ করে এই পেজটি খোলা রাখুন"}</small>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <a className="mobile-emergency" href={`tel:${HOTLINE}`}>
        <Icon name="phone" size={18} />
        {HOTLINE}
      </a>
    </div>
  );
}
