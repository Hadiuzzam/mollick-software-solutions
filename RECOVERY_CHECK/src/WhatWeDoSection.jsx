import { memo } from "react";
import "./WhatWeDoSection.css";

const asset = (name) => `${import.meta.env.BASE_URL}${name}`;

const serviceItems = [
  {
    id: "combine-apps",
    en: {
      title: "Combine multiple apps to one",
      description:
        "When your team is stitching together spreadsheets and off-the-shelf tools that were never meant to work together, things fall through the cracks. We replace that patchwork with a single custom app built around your workflow, so everything lives in one place.",
      imageAlt: "A product team planning a custom mobile application",
      label: "Production-ready engineering",
    },
    bn: {
      title: "একাধিক অ্যাপকে এক জায়গায় আনুন",
      description:
        "আপনার টিম যখন আলাদা আলাদা স্প্রেডশিট ও প্রস্তুত টুল ব্যবহার করে কাজ সামলায়, তখন গুরুত্বপূর্ণ তথ্য সহজেই ছড়িয়ে যায়। আমরা আপনার কাজের ধরণ অনুযায়ী একটি কাস্টম অ্যাপে সবকিছু এক জায়গায় এনে দিই, যাতে পুরো প্রক্রিয়াটি হয় আরও সহজ ও নিয়ন্ত্রিত।",
      imageAlt: "একটি কাস্টম মোবাইল অ্যাপ্লিকেশন পরিকল্পনা করছে প্রোডাক্ট টিম",
      label: "প্রোডাকশন-রেডি ইঞ্জিনিয়ারিং",
    },
    image: "what1.webp",
  },
  {
    id: "built-from-scratch",
    en: {
      title: "Built from scratch",
      description:
        "You bring the idea, we build the app. From the first sketch to a working product, we design and engineer it properly from day one no templates, no guesswork, just software made to do exactly what you need.",
      imageAlt: "A customer testing a newly built mobile application",
      label: "Tested with real users",
    },
    bn: {
      title: "শুরু থেকে আপনার জন্য তৈরি",
      description:
        "আপনি আইডিয়া দিন, আমরা সেটিকে বাস্তব সফটওয়্যারে রূপ দিই। প্রথম স্কেচ থেকে সম্পূর্ণ কার্যকর প্রোডাক্ট পর্যন্ত—কোনো প্রস্তুত টেমপ্লেট নয়, কোনো অনুমান নয়; আপনার প্রয়োজন অনুযায়ী শুরু থেকেই সঠিকভাবে ডিজাইন ও ডেভেলপ করা হয়।",
      imageAlt: "নতুন তৈরি মোবাইল অ্যাপ্লিকেশন পরীক্ষা করছেন একজন ব্যবহারকারী",
      label: "বাস্তব ব্যবহারকারীর মাধ্যমে পরীক্ষিত",
    },
    image: "what2.webp",
  },
  {
    id: "custom-dashboards",
    en: {
      title: "Custom dashboards",
      description:
        "Custom dashboards and internal tools that bring your data together and turn it into something your team can act on, built to match how you make decisions rather than forcing you into a generic reporting template.",
      imageAlt: "A team using a custom business dashboard",
      label: "Built for growth",
    },
    bn: {
      title: "কাস্টম ড্যাশবোর্ড",
      description:
        "আপনার গুরুত্বপূর্ণ ডাটা এক জায়গায় এনে এমন কাস্টম ড্যাশবোর্ড ও ইন্টারনাল টুল তৈরি করি, যেগুলো আপনার টিমকে দ্রুত সিদ্ধান্ত নিতে সাহায্য করে। সাধারণ রিপোর্টিং টেমপ্লেটের বদলে এটি তৈরি হয় আপনার ব্যবসার সিদ্ধান্ত গ্রহণের ধরণ অনুযায়ী।",
      imageAlt: "একটি কাস্টম বিজনেস ড্যাশবোর্ড ব্যবহার করছে একটি টিম",
      label: "ব্যবসার প্রবৃদ্ধির জন্য তৈরি",
    },
    image: "what3.webp",
  },
];

function WhatWeDoSectionComponent({ lang = "en" }) {
  const isBn = lang === "bn";

  return (
    <section
      id="services"
      className="mollick-services"
      aria-labelledby="mollick-services-title"
    >
      <header className="mollick-services__heading">
        <span>{isBn ? "আমরা কী করি" : "What We Do"}</span>
        <h2 id="mollick-services-title">
          {isBn ? "আমরা কাস্টম সফটওয়্যার তৈরি করি" : "We build custom Software"}
        </h2>
        <p>
          {isBn
            ? "আপনার ব্যবসার কাজের ধরণ অনুযায়ী কাস্টম অ্যাপ ও ড্যাশবোর্ড তৈরি করি।"
            : "Custom apps and dashboards built around how your business."}
        </p>
      </header>

      <div className="mollick-services__list">
        {serviceItems.map((item, index) => {
          const copy = isBn ? item.bn : item.en;

          return (
            <article
              className={
                "mollick-services__row" +
                (index % 2 === 1 ? " is-reversed" : "")
              }
              key={item.id}
            >
              <div className="mollick-services__copy">
                <h3>{copy.title}</h3>
                <p>{copy.description}</p>
              </div>

              <figure className="mollick-services__visual">
                <img
                  src={asset(item.image)}
                  alt={copy.imageAlt}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>{copy.label}</figcaption>
              </figure>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export const WhatWeDoSection = memo(WhatWeDoSectionComponent);
