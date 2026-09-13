import { memo } from "react";
import "./HomeAboutSection.css";

const asset = (name) => `${import.meta.env.BASE_URL}${name}`;

const PROCESS_CARDS = [
  {
    id: 1,
    image: "about_us_1.webp",
    en: "Product Strategy",
    bn: "প্রোডাক্ট স্ট্র্যাটেজি",
  },
  {
    id: 2,
    image: "about_us_3.webp",
    en: "UX & Design",
    bn: "ইউএক্স ও ডিজাইন",
  },
  {
    id: 3,
    image: "about_us_4.webp",
    en: "Engineering & Development",
    bn: "ইঞ্জিনিয়ারিং ও ডেভেলপমেন্ট",
  },
  {
    id: 4,
    image: "about_us_2.webp",
    en: "Launch & Support",
    bn: "লঞ্চ ও সাপোর্ট",
  },
];

export const HomeAboutSection = memo(function HomeAboutSection({
  lang = "en",
}) {
  const isBn = lang === "bn";

  return (
    <section
      id="about"
      className="mollick-process-section"
      aria-labelledby="mollick-process-title"
    >
      <div className="mollick-process-section__heading">
        <span>{isBn ? "আমরা যেভাবে কাজ করি" : "How we work"}</span>

        <h2 id="mollick-process-title">
          {isBn ? "আমাদের কাজের প্রক্রিয়া" : "Our Process"}
        </h2>

        <p>
          {isBn
            ? "আমাদের টিম ক্লায়েন্টের সাথে ঘনিষ্ঠভাবে কাজ করে আইডিয়াকে পরিপূর্ণ করে, চিন্তাশীল ডিজাইন তৈরি করে এবং বাস্তবে কার্যকর কাস্টম অ্যাপ ও সিস্টেম ডেভেলপ করে।"
            : "Our team works alongside clients to shape ideas, design thoughtful experiences, and build bespoke apps and systems that perform in the real world."}
        </p>
      </div>

      <div className="mollick-process-grid">
        {PROCESS_CARDS.map((item) => (
          <article
            className="mollick-process-card"
            key={item.id}
            aria-label={isBn ? item.bn : item.en}
          >
            <img
              className="mollick-process-card__image"
              src={asset(item.image)}
              alt={isBn ? item.bn : item.en}
              loading="lazy"
              decoding="async"
            />

            <span
              className="mollick-process-card__overlay"
              aria-hidden="true"
            />

            <div className="mollick-process-card__content">
              <span className="mollick-process-card__number" aria-hidden="true">
                {item.id}
              </span>

              <h3>{isBn ? item.bn : item.en}</h3>

              <span
                aria-hidden="true"
                className="mollick-process-card__arrow"
              >
                →
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
});
