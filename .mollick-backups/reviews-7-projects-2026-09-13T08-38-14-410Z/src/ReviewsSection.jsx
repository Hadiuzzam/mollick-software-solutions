import { memo, useEffect, useRef, useState } from "react";
import "./ReviewsSection.css";

const reviews = [
  {
    id: 1,
    nameEn: "Client Review",
    nameBn: "ক্লায়েন্ট রিভিউ",
    roleEn: "Verified client feedback can be added here",
    roleBn: "এখানে যাচাইকৃত ক্লায়েন্টের মতামত যোগ করা যাবে",
    companyEn: "CLIENT",
    companyBn: "ক্লায়েন্ট",
    quoteEn:
      "Sample review layout. Replace this text with a real client testimonial before publishing.",
    quoteBn:
      "এটি একটি নমুনা রিভিউ লে-আউট। প্রকাশের আগে এখানে বাস্তব ক্লায়েন্টের মতামত বসিয়ে দিন।",
    initials: "CR",
  },
  {
    id: 2,
    nameEn: "Client Review",
    nameBn: "ক্লায়েন্ট রিভিউ",
    roleEn: "Verified client feedback can be added here",
    roleBn: "এখানে যাচাইকৃত ক্লায়েন্টের মতামত যোগ করা যাবে",
    companyEn: "CLIENT",
    companyBn: "ক্লায়েন্ট",
    quoteEn:
      "Sample review layout. Replace this text with a real client testimonial before publishing.",
    quoteBn:
      "এটি একটি নমুনা রিভিউ লে-আউট। প্রকাশের আগে এখানে বাস্তব ক্লায়েন্টের মতামত বসিয়ে দিন।",
    initials: "CR",
  },
  {
    id: 3,
    nameEn: "Client Review",
    nameBn: "ক্লায়েন্ট রিভিউ",
    roleEn: "Verified client feedback can be added here",
    roleBn: "এখানে যাচাইকৃত ক্লায়েন্টের মতামত যোগ করা যাবে",
    companyEn: "CLIENT",
    companyBn: "ক্লায়েন্ট",
    quoteEn:
      "Sample review layout. Replace this text with a real client testimonial before publishing.",
    quoteBn:
      "এটি একটি নমুনা রিভিউ লে-আউট। প্রকাশের আগে এখানে বাস্তব ক্লায়েন্টের মতামত বসিয়ে দিন।",
    initials: "CR",
  },
];

function ReviewsSectionComponent({ lang = "en" }) {
  const isBn = lang === "bn";
  const [active, setActive] = useState(0);
  const sectionRef = useRef(null);

  const previous = () => {
    setActive((current) =>
      current === 0 ? reviews.length - 1 : current - 1
    );
  };

  const next = () => {
    setActive((current) =>
      current === reviews.length - 1 ? 0 : current + 1
    );
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const heading = section.querySelector(".mollick-reviews__heading");
    const card = section.querySelector(".mollick-reviews__card");

    const targets = [heading, card].filter(Boolean);

    targets.forEach((element, index) => {
      element.dataset.reveal = index === 0 ? "text" : "visual";
      if (index === 1) element.dataset.revealDelay = "380";
      element.classList.remove("is-revealed");
    });

    if (!("IntersectionObserver" in window)) {
      targets.forEach((element) =>
        element.classList.add("is-revealed")
      );
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const delay = Number(
            entry.target.dataset.revealDelay || 0
          );

          window.setTimeout(() => {
            entry.target.classList.add("is-revealed");
          }, delay);

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -12% 0px",
      }
    );

    targets.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const review = reviews[active];

  return (
    <section
      ref={sectionRef}
      className="mollick-reviews"
      id="reviews"
      aria-labelledby="mollick-reviews-title"
    >
      <div className="mollick-reviews__heading">
        <span>
          {isBn ? "ক্লায়েন্ট মতামত" : "Testimonials"}
        </span>

        <h2 id="mollick-reviews-title">
          {isBn ? "রিভিউ" : "Reviews"}
        </h2>

        <p>
          {isBn
            ? "আমাদের সাথে কাজ করার অভিজ্ঞতা সম্পর্কে ক্লায়েন্টদের মতামত।"
            : "Hear directly from the clients we've partnered with on their experience working with our team."}
        </p>
      </div>

      <div className="mollick-reviews__card">
        <button
          className="mollick-reviews__arrow is-left"
          type="button"
          onClick={previous}
          aria-label={isBn ? "আগের রিভিউ" : "Previous review"}
        >
          ‹
        </button>

        <div className="mollick-reviews__brand">
          <strong>
            {isBn ? review.companyBn : review.companyEn}
          </strong>
        </div>

        <div className="mollick-reviews__divider" />

        <div className="mollick-reviews__content">
          <div className="mollick-reviews__quote-mark">“</div>

          <blockquote>
            {isBn ? review.quoteBn : review.quoteEn}
          </blockquote>

          <div className="mollick-reviews__person">
            <div className="mollick-reviews__avatar">
              {review.initials}
            </div>

            <div>
              <strong>
                {isBn ? review.nameBn : review.nameEn}
              </strong>
              <span>
                {isBn ? review.roleBn : review.roleEn}
              </span>
            </div>
          </div>
        </div>

        <button
          className="mollick-reviews__arrow is-right"
          type="button"
          onClick={next}
          aria-label={isBn ? "পরের রিভিউ" : "Next review"}
        >
          ›
        </button>
      </div>

      <div className="mollick-reviews__dots" aria-hidden="true">
        {reviews.map((item, index) => (
          <span
            key={item.id}
            className={index === active ? "is-active" : ""}
          />
        ))}
      </div>
    </section>
  );
}

export const ReviewsSection = memo(ReviewsSectionComponent);
