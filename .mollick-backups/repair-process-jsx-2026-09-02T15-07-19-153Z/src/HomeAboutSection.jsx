import { memo, useEffect, useRef } from "react";
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
    image: "about_us_2.webp",
    en: "UX & Design",
    bn: "ইউএক্স ও ডিজাইন",
  },
  {
    id: 3,
    image: "about_us_3.webp",
    en: "Engineering & Development",
    bn: "ইঞ্জিনিয়ারিং ও ডেভেলপমেন্ট",
  },
  {
    id: 4,
    image: "about_us_4.webp",
    en: "Launch & Support",
    bn: "লঞ্চ ও সাপোর্ট",
  },
];

export const HomeAboutSection = memo(function HomeAboutSection({
  lang = "en",
}) {
  const isBn = lang === "bn";

  // MOLLICK_PROCESS_LOCAL_REVEAL_START
  // Uses the website's EXISTING [data-reveal] / .is-revealed animation CSS.
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const heading = section.querySelector(
      ".mollick-process-section__heading"
    );

    const cards = Array.from(
      section.querySelectorAll(".mollick-process-card")
    );

    const targets = [
      ...(heading ? [heading] : []),
      ...cards,
    ];

    if (!targets.length) return undefined;

    if (heading) {
      heading.dataset.reveal = "text";
      heading.classList.remove("is-revealed");
    }

    cards.forEach((card, index) => {
      card.dataset.reveal = "visual";
      card.dataset.revealDelay = String((index + 1) * 320);
      card.classList.remove("is-revealed");
    });

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach((element) => {
        element.classList.add("is-revealed");
      });
      return undefined;
    }

    const timers = new Set();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target;
          const delay = Number(
            element.dataset.revealDelay || 0
          );

          const timer = window.setTimeout(() => {
            element.classList.add("is-revealed");
            timers.delete(timer);
          }, delay);

          timers.add(timer);
          observer.unobserve(element);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -12% 0px",
      }
    );

    targets.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);
  // MOLLICK_PROCESS_LOCAL_REVEAL_END

  return (
    <section
      ref={sectionRef}
      id="about"
      className="mollick-process-section"
      aria-labelledby="mollick-process-title"
    >
      <div className="mollick-process-section__heading">
            </div>
          </article>
        ))}
      </div>
    </section>
  );
});
