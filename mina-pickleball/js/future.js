/* MINA — Future page: panel reveals, chapter label, progress bar. */

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  /* Panel enter states + fixed chapter label */
  const label = document.getElementById("chapterLabel");
  const panelIO = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-seen");
          if (label && entry.target.dataset.label) label.textContent = entry.target.dataset.label;
        }
      }
    },
    { threshold: 0.35 }
  );
  $$("[data-label]").forEach((p) => panelIO.observe(p));

  /* Generic reveals */
  const revealIO = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealIO.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.2 }
  );
  $$(".reveal").forEach((el) => revealIO.observe(el));

  /* Scroll progress bar (rAF-throttled) */
  const bar = document.getElementById("progressBar");
  if (bar && !prefersReducedMotion) {
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }
})();
