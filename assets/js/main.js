(() => {
  "use strict";

  const CONFIG = {
    contactEmail: "leahtfl@gmail.com",
    formEndpoint: "",
  };

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const toggle = $(".bar__toggle");
  const menu = $("#menu");
  let menuTimer = 0;

  const setMenu = (open) => {
    if (!toggle || !menu) return;
    window.clearTimeout(menuTimer);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    root.classList.toggle("menu-open", open);
    if (open) {
      menu.hidden = false;
      window.requestAnimationFrame(() => menu.classList.add("is-open"));
      return;
    }
    menu.classList.remove("is-open");
    menuTimer = window.setTimeout(() => {
      menu.hidden = true;
    }, 260);
  };

  const menuIsOpen = () => toggle?.getAttribute("aria-expanded") === "true";

  toggle?.addEventListener("click", () => setMenu(!menuIsOpen()));

  menu?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuIsOpen()) {
      setMenu(false);
      toggle.focus();
    }
  });

  window.matchMedia("(min-width: 1021px)").addEventListener("change", (event) => {
    if (event.matches) setMenu(false);
  });

  const revealItems = $$("[data-reveal]");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-in"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        let order = 0;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const item = entry.target;
          item.style.setProperty("--d", `${Math.min(order, 6) * 90}ms`);
          order += 1;
          item.classList.add("is-in");
          observer.unobserve(item);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );
    revealItems.forEach((item) => observer.observe(item));
  }

  const pin = $(".pin");
  const pinStage = pin ? $(".pin__stage", pin) : null;
  const pinLines = pin ? $$(".pin__line", pin) : [];
  const canPin = pin && pinStage && pinLines.length > 1 && !reduceMotion && window.CSS && CSS.supports("position", "sticky");
  const smooth = (t) => t * t * (3 - 2 * t);

  const renderPin = () => {
    const count = pinLines.length;
    const rect = pin.getBoundingClientRect();
    const offset = parseFloat(getComputedStyle(pinStage).top) || 0;
    const travel = rect.height - pinStage.offsetHeight;
    const progress = travel > 0 ? clamp((offset - rect.top) / travel, 0, 1) : 0;
    const position = progress * count;

    pinLines.forEach((line, index) => {
      const local = position - index;
      const first = index === 0;
      const last = index === count - 1;
      let opacity = 0;
      let shift = 0;
      if (local >= 0 && local <= 1) {
        const fadeIn = first ? 1 : smooth(clamp(local / 0.24, 0, 1));
        const fadeOut = last ? 1 : 1 - smooth(clamp((local - 0.76) / 0.24, 0, 1));
        opacity = Math.min(fadeIn, fadeOut);
        shift = local < 0.5 ? (1 - fadeIn) * 30 : (fadeOut - 1) * 30;
      }
      line.style.opacity = opacity.toFixed(3);
      line.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
    });

    pinStage.style.setProperty("--p", progress.toFixed(4));
  };

  if (canPin) {
    pin.style.setProperty("--n", pinLines.length);
    pin.classList.add("is-pinned");
    renderPin();
  }

  const toTop = $(".to-top");
  const form = $("#contact-form");
  const messageField = $("#f-message");
  let frame = 0;

  const onScroll = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      toTop?.classList.toggle("is-on", window.scrollY > 700);
      if (canPin) renderPin();
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  if (form && toTop && "IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      toTop.classList.toggle("is-away", entries[0].isIntersecting);
    }).observe(form);
  }

  const navLinks = $$(".bar__nav a");
  const navTargets = navLinks.map((link) => $(link.getAttribute("href"))).filter(Boolean);

  if (navTargets.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = navLinks.find((item) => item.getAttribute("href") === `#${entry.target.id}`);
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach((item) => item.removeAttribute("aria-current"));
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    navTargets.forEach((target) => spy.observe(target));
  }

  $$("[data-interest]").forEach((link) => {
    link.addEventListener("click", () => {
      const choice = $(`#contact-form input[name="interest"][value="${link.dataset.interest}"]`);
      if (choice) choice.checked = true;
      const topic = link.dataset.topic;
      if (topic && messageField && (!messageField.value.trim() || messageField.dataset.filled === "true")) {
        messageField.value = `Talk: ${topic}\nEvent date: \nLocation: `;
        messageField.dataset.filled = "true";
      }
    });
  });

  messageField?.addEventListener("input", () => {
    messageField.dataset.filled = "false";
  });

  if (form) {
    const formBody = $(".form__body", form);
    const formDone = $(".form__done", form);
    const formError = $(".form__error", form);
    const nameField = $("#f-name");
    const emailField = $("#f-email");

    const fail = (field, text) => {
      formError.textContent = text;
      formError.hidden = false;
      field.setAttribute("aria-invalid", "true");
      field.focus();
    };

    const finish = () => {
      formBody.hidden = true;
      formDone.hidden = false;
    };

    form.addEventListener("input", (event) => {
      event.target.removeAttribute("aria-invalid");
      formError.hidden = true;
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();

      if (!name) {
        fail(nameField, "Please add your name.");
        return;
      }
      if (!email || !emailField.checkValidity()) {
        fail(emailField, "Please add an email I can reply to.");
        return;
      }

      if (CONFIG.formEndpoint) {
        const sent = await fetch(CONFIG.formEndpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then((response) => response.ok)
          .catch(() => false);
        if (sent) {
          finish();
          return;
        }
      }

      const subject = `${data.get("interest")}: note from ${name}`;
      const text = `${data.get("message") || ""}\n\n${name}\n${email}`;
      window.location.href = `mailto:${CONFIG.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
      finish();
    });
  }

  $$("[data-year]").forEach((item) => {
    item.textContent = String(new Date().getFullYear());
  });
})();
