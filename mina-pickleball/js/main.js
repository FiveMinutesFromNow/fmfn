/* MINA Pickleball — main.js
   Scroll reveals, parallax, counters, engineering steps,
   reviews rotator, promo rotation, cart + toast, nav. */

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => [...scope.querySelectorAll(sel)];

  /* ---------- Header scrolled state ---------- */
  const header = $("#siteHeader");
  const onScrollHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- Mobile nav ---------- */
  const navToggle = $("#navToggle");
  const navMenu = $("#navMenu");
  navToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  navMenu.addEventListener("click", (e) => {
    if (e.target.matches("a")) {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Promo bar rotation ---------- */
  const promoMessages = [
    "Free U.S. shipping on orders over $35",
    "New: the limited-run Patriot Pack ★ red, white & blue",
    "Clubs & leagues: case pricing on 48+ balls",
  ];
  const promoEl = $("#promoMsg");
  let promoIdx = 0;
  setInterval(() => {
    promoIdx = (promoIdx + 1) % promoMessages.length;
    promoEl.classList.add("is-swapping");
    setTimeout(() => {
      promoEl.textContent = promoMessages[promoIdx];
      promoEl.classList.remove("is-swapping");
    }, 380);
  }, 5000);

  /* ---------- Reveal on scroll ---------- */
  const revealIO = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealIO.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  $$(".reveal").forEach((el) => revealIO.observe(el));

  /* ---------- Hero parallax (rAF-throttled) ---------- */
  const heroImg = $("#heroImg");
  if (heroImg && !prefersReducedMotion) {
    let ticking = false;
    const parallax = () => {
      const y = Math.min(window.scrollY, window.innerHeight);
      heroImg.style.transform = `translate3d(0, ${y * 0.18}px, 0)`;
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(parallax);
        }
      },
      { passive: true }
    );
  }

  /* ---------- Animated counters ---------- */
  const countIO = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        countIO.unobserve(el);
        const target = parseFloat(el.dataset.count);
        const decimals = parseInt(el.dataset.decimals || "0", 10);
        if (prefersReducedMotion) {
          el.textContent = target.toFixed(decimals);
          continue;
        }
        const dur = 1400;
        const t0 = performance.now();
        const tick = (t) => {
          const p = Math.min((t - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(decimals);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    },
    { threshold: 0.6 }
  );
  $$(".count").forEach((el) => countIO.observe(el));

  /* ---------- Engineering scroll steps ---------- */
  const engImgs = $$("#engMedia img");
  const engSteps = $$(".eng-step");
  if (engSteps.length) {
    const setStep = (idx) => {
      engImgs.forEach((img) => img.classList.toggle("is-active", img.dataset.step === String(idx)));
      engSteps.forEach((s) => s.classList.toggle("is-active", s.dataset.step === String(idx)));
    };
    setStep(0);
    const stepIO = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setStep(entry.target.dataset.step);
        }
      },
      { rootMargin: "-42% 0px -42% 0px" }
    );
    engSteps.forEach((s) => stepIO.observe(s));
  }

  /* ---------- Reviews rotator ---------- */
  const reviews = $$("#reviewRotator .review");
  const dots = $$(".review-dots button");
  let reviewIdx = 0;
  let reviewTimer;
  const showReview = (idx) => {
    reviewIdx = idx;
    reviews.forEach((r, i) => r.classList.toggle("is-active", i === idx));
    dots.forEach((d, i) => {
      d.classList.toggle("is-active", i === idx);
      d.setAttribute("aria-selected", String(i === idx));
    });
  };
  const queueReview = () => {
    clearInterval(reviewTimer);
    reviewTimer = setInterval(() => showReview((reviewIdx + 1) % reviews.length), 6000);
  };
  dots.forEach((d, i) =>
    d.addEventListener("click", () => {
      showReview(i);
      queueReview();
    })
  );
  queueReview();

  /* ---------- Cart + toast ---------- */
  const cartCount = $("#cartCount");
  const cartBtn = $("#cartBtn");
  const toast = $("#toast");
  let cart = 0;
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  };
  $$(".add-to-cart").forEach((btn) =>
    btn.addEventListener("click", () => {
      cart += 1;
      cartCount.textContent = cart;
      cartBtn.setAttribute("aria-label", `Cart, ${cart} item${cart === 1 ? "" : "s"}`);
      cartCount.classList.add("is-bumped");
      setTimeout(() => cartCount.classList.remove("is-bumped"), 320);
      const item = btn.closest("[data-name]");
      showToast(`Added ${item ? item.dataset.name : "item"} to your cart ✓`);
    })
  );

  /* ---------- Newsletter ---------- */
  const form = $("#signupForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#signupEmail");
    if (!email.checkValidity()) {
      email.reportValidity();
      return;
    }
    form.reset();
    showToast("You're on the Dink List — check your inbox for 10% off ★");
  });
})();
