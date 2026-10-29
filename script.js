(() => {
  const root = document.documentElement;
  root.classList.add("js");

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  // Jahr im Footer
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  // Animation der Hero-Grafik bei reduzierter Bewegung anhalten
  if (reduce) {
    const svg = $(".sheet svg");
    if (svg && svg.pauseAnimations) svg.pauseAnimations();
  }

  // Mobile Navigation
  const burger = $(".burger");
  const setNav = (open) => {
    root.classList.toggle("nav-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
  };
  burger.addEventListener("click", () => setNav(!root.classList.contains("nav-open")));
  $$("#nav a").forEach((a) => a.addEventListener("click", () => setNav(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });

  // Einblenden beim Scrollen
  const reveals = $$(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach((el) => io.observe(el));
  }

  // Zähler "25"
  const counter = $("[data-count]");
  if (counter && !reduce && "IntersectionObserver" in window) {
    const target = Number(counter.dataset.count);
    const cio = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      cio.disconnect();
      const t0 = Date.now(), dur = 1100;
      counter.textContent = "0";
      const timer = setInterval(() => {
        const k = Math.min(1, (Date.now() - t0) / dur);
        counter.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
        if (k >= 1) clearInterval(timer);
      }, 30);
    });
    cio.observe(counter);
  }

  // Scroll-gesteuert: Fortschrittsbalken, Meldeschleife, aktive Navigation
  const list = $("#loop-list");
  const nodes = $$(".svc .node");
  const sections = $$("main section[id]");
  const navLinks = $$("#nav a[href^='#']:not(.btn)");

  const update = () => {
    const vh = window.innerHeight;
    const max = root.scrollHeight - vh;
    root.style.setProperty("--sp", max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0);

    if (list) {
      const r = list.getBoundingClientRect();
      const probe = vh * 0.62;
      const p = Math.max(0, Math.min(1, (probe - r.top) / r.height));
      list.style.setProperty("--p", p.toFixed(4));
      nodes.forEach((n) => n.classList.toggle("on", n.getBoundingClientRect().top + 11 < probe));
    }

    let current = "";
    sections.forEach((s) => { if (s.getBoundingClientRect().top <= vh * 0.35) current = s.id; });
    navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
  };
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();

  // E-Mail kopieren
  const copyBtn = $(".copy");
  if (copyBtn) {
    const use = $("use", copyBtn);
    const idleLabel = copyBtn.getAttribute("aria-label");
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(copyBtn.dataset.copy);
        copyBtn.classList.add("done");
        use.setAttribute("href", "#i-check");
        copyBtn.setAttribute("aria-label", "E-Mail-Adresse kopiert");
      } catch (_) {
        copyBtn.setAttribute("aria-label", "Kopieren nicht möglich");
      }
      setTimeout(() => {
        copyBtn.classList.remove("done");
        use.setAttribute("href", "#i-copy");
        copyBtn.setAttribute("aria-label", idleLabel);
      }, 1800);
    });
  }

  // Anfrage → vorbereiteter E-Mail-Entwurf (kein Server nötig)
  const form = $("#anfrage");
  const note = $("#form-note");
  const MAIL = "fas.techassist.synergy@gmail.com";
  const defaultNote = note.textContent;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    $$("[required]", form).forEach((f) => {
      const bad = !f.value.trim();
      f.classList.toggle("invalid", bad);
      f.setAttribute("aria-invalid", String(bad));
      if (bad) ok = false;
    });
    if (!ok) {
      note.classList.remove("ok");
      note.textContent = "Bitte Name und Ihr Vorhaben ausfüllen.";
      return;
    }
    const d = new FormData(form);
    const lines = [
      "Guten Tag Herr Kesek,", "",
      String(d.get("nachricht")).trim(), "",
      "Bereich: " + d.get("bereich"),
      "Name: " + String(d.get("name")).trim(),
    ];
    if (String(d.get("firma")).trim()) lines.push("Firma: " + String(d.get("firma")).trim());
    if (String(d.get("rueck")).trim()) lines.push("Erreichbar unter: " + String(d.get("rueck")).trim());
    const href = "mailto:" + MAIL +
      "?subject=" + encodeURIComponent("Projektanfrage: " + d.get("bereich")) +
      "&body=" + encodeURIComponent(lines.join("\r\n"));
    window.location.href = href;
    note.classList.add("ok");
    note.innerHTML = "Ihr E-Mail-Programm sollte sich jetzt mit dem Entwurf öffnen. Falls nicht, schreiben Sie direkt an <a href=\"mailto:" + MAIL + "\">" + MAIL + "</a>.";
  });

  $$("input, textarea", form).forEach((f) => f.addEventListener("input", () => {
    f.classList.remove("invalid");
    f.removeAttribute("aria-invalid");
    if (!$(".invalid", form)) { note.classList.remove("ok"); note.textContent = defaultNote; }
  }));
})();
