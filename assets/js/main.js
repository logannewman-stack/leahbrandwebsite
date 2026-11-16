/* Leah Roling — site interactions. No dependencies. */
(() => {
  "use strict";

  // ---- Config -------------------------------------------------------------
  // To receive form messages in an inbox instead of opening the visitor's email
  // app, paste a Formspree (or similar) endpoint here, e.g. "https://formspree.io/f/abcd1234".
  const CONFIG = {
    contactEmail: "leahtfl@gmail.com",
    formEndpoint: "",
    socials: [
      { name: "Instagram", url: "https://www.instagram.com/leahrolingcoaching/", icon: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r=".9" fill="currentColor" stroke="none"/>' },
      { name: "LinkedIn", url: "https://www.linkedin.com/in/leahroling/", icon: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10.5V17M8 7.2v.1M12 17v-3.6a2.2 2.2 0 0 1 4.4 0V17M12 10.5V17"/>' },
      { name: "YouTube", url: "https://www.youtube.com/@leahrolingcoaching", icon: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10.4 9.4l4.4 2.6-4.4 2.6z" fill="currentColor"/>' },
      { name: "TikTok", url: "https://www.tiktok.com/@leahrolingcoach", icon: '<path d="M14 3.5v11a3.5 3.5 0 1 1-3.5-3.5M14 3.5c.5 2.6 2.3 4.2 5 4.4"/>' },
      { name: "Apple Podcasts", url: "https://podcasts.apple.com/us/podcast/the-becoming-you-show-with-leah-roling-from-potential/id1608085445", icon: '<circle cx="12" cy="10.5" r="2.2"/><path d="M12 13v8M8.2 15.2a5.4 5.4 0 1 1 7.6 0M5.6 18a9 9 0 1 1 12.8 0"/>' },
    ],
  };

  const doc = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  // ---- Socials --------------------------------------------------------------
  $$("[data-socials]").forEach((wrap) => {
    wrap.innerHTML = CONFIG.socials
      .map(
        (s) =>
          `<a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.name}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${s.icon}</svg></a>`
      )
      .join("");
  });

  // ---- Intro / ready state --------------------------------------------------
  const preloader = $(".preloader");
  const ready = () => body.classList.add("is-ready");
  if (doc.classList.contains("no-preload") || !preloader) {
    requestAnimationFrame(ready);
  } else {
    const done = () => {
      preloader.classList.add("is-done");
      setTimeout(ready, 260);
    };
    const minTime = new Promise((r) => setTimeout(r, 1250));
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.all([minTime, fonts]).then(done);
    setTimeout(done, 3200); // never block longer than this
  }

  // ---- Header: scrolled / hide on scroll down -------------------------------
  const header = $(".header");
  const progress = $(".progress");
  const sticky = $(".sticky-cta");
  const hero = $(".hero");
  const contact = $("#contact");
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const max = doc.scrollHeight - window.innerHeight;
    header.classList.toggle("is-scrolled", y > 24);
    if (!body.classList.contains("menu-open")) {
      header.classList.toggle("is-hidden", y > lastY && y > 480);
    }
    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (sticky && hero && contact) {
      const pastHero = y > hero.offsetHeight * 0.85;
      const atContact = contact.getBoundingClientRect().top < window.innerHeight * 0.9;
      sticky.classList.toggle("is-visible", pastHero && !atContact);
    }
    parallax();
    lastY = y;
    ticking = false;
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  // ---- Parallax (subtle) ----------------------------------------------------
  const parallaxEls = reduceMotion ? [] : $$("[data-parallax]");
  function parallax() {
    if (!parallaxEls.length || window.innerWidth < 960) return;
    parallaxEls.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.05;
      const r = el.getBoundingClientRect();
      const offset = (r.top + r.height / 2 - window.innerHeight / 2) * -speed;
      const img = el.querySelector("img");
      if (img) img.style.translate = `0 ${offset.toFixed(1)}px`;
    });
  }
  onScroll();

  // ---- Mobile menu ----------------------------------------------------------
  const menuBtn = $(".menu-btn");
  const menu = $("#mobile-menu");
  function setMenu(open) {
    body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.setAttribute("aria-hidden", String(!open));
    header.classList.remove("is-hidden");
    if (open) setTimeout(() => $("a", menu)?.focus({ preventScroll: true }), 350);
  }
  menuBtn?.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && body.classList.contains("menu-open")) {
      setMenu(false);
      menuBtn.focus();
    }
  });
  window.matchMedia("(min-width: 1080px)").addEventListener("change", (e) => e.matches && setMenu(false));

  // Swap header logo for the light version while the dark menu is open
  const brandImg = $(".brand img");
  if (brandImg) {
    const light = brandImg.getAttribute("src");
    const dark = light.replace("lockup.svg", "lockup-reverse.svg");
    new Image().src = dark;
    new MutationObserver(() => {
      brandImg.src = body.classList.contains("menu-open") ? dark : light;
    }).observe(body, { attributes: true, attributeFilter: ["class"] });
  }

  // ---- Reveal on scroll -----------------------------------------------------
  const revealEls = $$("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-in"));
  } else {
    // Clip-path reveals start fully clipped, which IntersectionObserver treats as
    // invisible, so we observe their parent and reveal the child.
    const targets = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (targets.get(entry.target) || []).forEach((el) => el.classList.add("is-in"));
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach((el) => {
      const clipped = el.dataset.reveal === "arch" || el.dataset.reveal === "clip";
      const watch = clipped ? el.parentElement : el;
      if (!targets.has(watch)) targets.set(watch, []);
      targets.get(watch).push(el);
      io.observe(watch);
    });
  }

  // ---- Active nav link ------------------------------------------------------
  const navLinks = $$(".nav a");
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const navIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === `#${entry.target.id}`)));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => navIO.observe(s));
  }

  // ---- Roles tabs (WAI-ARIA tabs pattern) -----------------------------------
  const tabs = $$('.role-tab[role="tab"]');
  function selectTab(tab, focus) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      if (!panel) return;
      if (on) {
        panel.hidden = false;
        panel.classList.remove("is-entering");
        void panel.offsetWidth; // restart animation
        panel.classList.add("is-entering");
      } else {
        panel.hidden = true;
      }
    });
    if (focus) tab.focus();
    // keep the active chip visible in the horizontal (mobile) list
    tab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab));
    if (finePointer) {
      let t;
      tab.addEventListener("mouseenter", () => {
        t = setTimeout(() => tab.getAttribute("aria-selected") !== "true" && selectTab(tab), 140);
      });
      tab.addEventListener("mouseleave", () => clearTimeout(t));
    }
    tab.addEventListener("keydown", (e) => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (e.key in keys) {
        e.preventDefault();
        selectTab(tabs[(i + keys[e.key] + tabs.length) % tabs.length], true);
      } else if (e.key === "Home") {
        e.preventDefault();
        selectTab(tabs[0], true);
      } else if (e.key === "End") {
        e.preventDefault();
        selectTab(tabs[tabs.length - 1], true);
      }
    });
  });

  // ---- Count-up numbers -----------------------------------------------------
  const counters = $$("[data-count]");
  const fmt = (el, v) => `${el.dataset.prefix || ""}${v}${el.dataset.suffix || ""}`;
  if (!reduceMotion && "IntersectionObserver" in window) {
    counters.forEach((el) => (el.textContent = fmt(el, 0)));
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.dataset.count);
          const dur = 1600;
          const t0 = performance.now();
          const step = (now) => {
            const p = Math.min(1, (now - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 4);
            el.textContent = fmt(el, Math.round(target * eased));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          cio.unobserve(el);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => cio.observe(el));
  }

  // ---- 3D book tilt ---------------------------------------------------------
  const book = $("[data-tilt]");
  if (book && finePointer && !reduceMotion) {
    const stage = book.parentElement;
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      book.style.setProperty("--ry", `${-26 + x * 30}deg`);
      book.style.setProperty("--rx", `${4 - y * 14}deg`);
    });
    stage.addEventListener("pointerleave", () => {
      book.style.setProperty("--ry", "-26deg");
      book.style.setProperty("--rx", "4deg");
    });
  }

  // ---- Magnetic buttons -----------------------------------------------------
  if (finePointer && !reduceMotion) {
    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });
  }

  // ---- Preselect form interest from CTA links -------------------------------
  $$("[data-interest]").forEach((a) =>
    a.addEventListener("click", () => {
      const input = $(`#contact-form input[name="interest"][value="${a.dataset.interest}"]`);
      if (input) input.checked = true;
    })
  );

  // ---- Contact form ---------------------------------------------------------
  const form = $("#contact-form");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const nameEl = $("#f-name");
    const emailEl = $("#f-email");
    if (!name) return nameEl.focus();
    if (!email || !emailEl.checkValidity()) return emailEl.focus();

    if (CONFIG.formEndpoint) {
      try {
        const res = await fetch(CONFIG.formEndpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("send failed");
        form.classList.add("is-sent");
        return;
      } catch (err) {
        /* fall through to email */
      }
    }
    const interest = data.get("interest");
    const subject = `${interest}: note from ${name}`;
    const msg = `${data.get("message") || ""}\n\n— ${name}\n${email}`;
    window.location.href = `mailto:${CONFIG.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`;
    form.classList.add("is-sent");
  });

  // ---- Footer year ----------------------------------------------------------
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
