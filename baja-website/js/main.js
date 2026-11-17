/* =========================================================
   Galactus Racing — main.js
   1. DATA (edit content here)   2. RENDER   3. INTERACTIONS
   ========================================================= */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ph = (w, h, text, bg = "16161a", fg = "8a8f98") =>
    `https://placehold.co/${w}x${h}/${bg}/${fg}?text=${encodeURIComponent(text)}&font=oswald`;

  /* ---------------------------------------------------------
     1. DATA — REPLACE all placeholder values with real content
     --------------------------------------------------------- */
  // Cars: current car first. `images` = carousel; `specs` = modal + comparison table.
  const CARS = [
    {
      name: "GR-26 Valkyrie", year: 2026, current: true,
      desc: "Our lightest and stiffest car yet. A redesigned 4130 chromoly frame, in-house tuned CVT and a 4-wheel independent setup built to survive the full four-hour endurance race.",
      images: [ph(1200, 750, "GR-26 FRONT 3/4"), ph(1200, 750, "GR-26 SIDE"), ph(1200, 750, "GR-26 REAR")],
      specs: {
        "Engine": "Briggs & Stratton 10 HP Vanguard, 305 cc",
        "Transmission": "CVT + 2-stage fixed gearbox, 9.2:1",
        "Suspension": "Double wishbone front, trailing arm rear",
        "Brakes": "Hydraulic disc, inboard rear, dual circuit",
        "Chassis material": "AISI 4130 chromoly, 25.4 mm OD",
        "Weight": "158 kg",
        "Top speed": "58 km/h",
        "Tyre size": "23 × 7 – 10 front / 22 × 10 – 10 rear",
        "Steering": "Rack and pinion, 1.6 turns lock-to-lock",
        "Safety features": "5-point harness, roll cage, kill switches, firewall",
      },
    },
    {
      name: "GR-25 Raptor", year: 2025,
      desc: "The car that took P1 in endurance at MEGA ATV. Zero DNFs across the season.",
      images: [ph(900, 560, "GR-25"), ph(900, 560, "GR-25 TRACK")],
      specs: {
        "Engine": "Briggs & Stratton 10 HP Vanguard, 305 cc",
        "Transmission": "CVT + single reduction, 8.4:1",
        "Suspension": "Double wishbone front, semi-trailing rear",
        "Brakes": "Hydraulic disc, outboard, dual circuit",
        "Chassis material": "AISI 4130 chromoly, 25.4 mm OD",
        "Weight": "172 kg",
        "Top speed": "55 km/h",
        "Tyre size": "23 × 7 – 10 / 22 × 10 – 10",
        "Steering": "Rack and pinion, 2 turns lock-to-lock",
        "Safety features": "5-point harness, roll cage, kill switches",
      },
    },
    {
      name: "GR-24 Titan", year: 2024,
      desc: "First car with a fully in-house gearbox. P2 overall at the ATV Championship.",
      images: [ph(900, 560, "GR-24"), ph(900, 560, "GR-24 PIT")],
      specs: {
        "Engine": "Briggs & Stratton 10 HP, 305 cc",
        "Transmission": "Gaged CVT + chain drive",
        "Suspension": "Double wishbone front, H-arm rear",
        "Brakes": "Hydraulic disc, outboard",
        "Chassis material": "AISI 1018 steel",
        "Weight": "188 kg",
        "Top speed": "52 km/h",
        "Tyre size": "23 × 7 – 10 / 22 × 10 – 10",
        "Steering": "Rack and pinion",
        "Safety features": "5-point harness, roll cage, kill switch",
      },
    },
  ];
  // Evolution timeline (older cars that don't need full cards can live here only)
  const EVOLUTION = [
    { year: 2009, name: "GR-01", note: "First car. Steel frame, solid rear axle." },
    { year: 2013, name: "GR-05", note: "First independent front suspension." },
    { year: 2017, name: "GR-09", note: "Switched to CVT drivetrain." },
    { year: 2020, name: "GR-12", note: "First chromoly chassis, -22 kg." },
    { year: 2024, name: "GR-24 Titan", note: "In-house gearbox. P2 overall." },
    { year: 2025, name: "GR-25 Raptor", note: "Endurance champions." },
    { year: 2026, name: "GR-26 Valkyrie", note: "Current car. 158 kg." },
  ];
  // Numeric spec rows where lower/higher is better (for highlighting in the comparison)
  const BETTER = { "Weight": "low", "Top speed": "high" };

  // Gallery: cat = race | workshop | team | testing
  const GALLERY = [
    { cat: "race", cap: "Endurance start, MEGA ATV 2025", w: 800, h: 1000 },
    { cat: "workshop", cap: "Welding the GR-26 roll cage", w: 800, h: 560 },
    { cat: "team", cap: "Full team after technical inspection", w: 800, h: 560 },
    { cat: "testing", cap: "Suspension testing on campus track", w: 800, h: 900 },
    { cat: "race", cap: "Hill climb, SAE BAJA India", w: 800, h: 560 },
    { cat: "workshop", cap: "CVT tuning on the dyno rig", w: 800, h: 1000 },
    { cat: "testing", cap: "Night test session", w: 800, h: 560 },
    { cat: "team", cap: "Design presentation to judges", w: 800, h: 700 },
    { cat: "race", cap: "Rock crawl section", w: 800, h: 700 },
  ];

  // Team
  const LEADS = [
    { name: "Prof. [Name]", role: "Faculty Advisor", bio: "Department of Mechanical Engineering. Guiding the team since 2015." },
    { name: "[Captain Name]", role: "Team Captain", bio: "Final-year Mechanical. Driver and overall vehicle integration." },
    { name: "[Vice Captain]", role: "Vice Captain", bio: "Final-year Mechanical. Leads testing and validation." },
    { name: "[Technical Head]", role: "Technical Head", bio: "Owns the design review and FEA sign-off for every part." },
  ];
  const SUBTEAMS = [
    { id: "chassis", name: "Chassis", desc: "Designs and fabricates the roll cage: tube selection, FEA, jigs and welding. Every other system bolts onto their work.",
      members: [["[Name]", "Chassis Lead"], ["[Name]", "Design Engineer"], ["[Name]", "Fabrication"]] },
    { id: "power", name: "Powertrain", desc: "Engine mounting, CVT tuning and gearbox design. They turn 10 HP into acceleration and hill-climb performance.",
      members: [["[Name]", "Powertrain Lead"], ["[Name]", "CVT Tuning"], ["[Name]", "Gearbox Design"]] },
    { id: "susp", name: "Suspension", desc: "Geometry, shocks and knuckles. They decide how the car handles jumps, ruts and rocks.",
      members: [["[Name]", "Suspension Lead"], ["[Name]", "Kinematics"], ["[Name]", "Knuckle Design"]] },
    { id: "brakes", name: "Brakes", desc: "Hydraulic brake system, rotors and calipers. The car must lock all four wheels at inspection, every time.",
      members: [["[Name]", "Brakes Lead"], ["[Name]", "Rotor Design"]] },
    { id: "elec", name: "Electrical", desc: "Kill switches, brake lights, wiring harness and data logging sensors for testing.",
      members: [["[Name]", "Electrical Lead"], ["[Name]", "DAQ & Sensors"]] },
    { id: "mfg", name: "Manufacturing", desc: "Machining, CNC, process planning and quality checks. They turn CAD into parts on time.",
      members: [["[Name]", "Manufacturing Lead"], ["[Name]", "CNC & Machining"], ["[Name]", "Quality"]] },
    { id: "biz", name: "Business & Marketing", desc: "Sponsorship, cost report, business presentation, social media and this website.",
      members: [["[Name]", "Business Head"], ["[Name]", "Marketing"], ["[Name]", "Cost Report"]] },
  ];

  // Budget (₹). REPLACE with real figures.
  const BUDGET = {
    goal: 1200000, raised: 780000,
    split: [
      { label: "Materials & parts", value: 420000, color: "#ff4d00" },
      { label: "Testing & tooling", value: 220000, color: "#ffc400" },
      { label: "Travel & logistics", value: 240000, color: "#f5f5f5" },
      { label: "Registration fees", value: 180000, color: "#8a8f98" },
      { label: "Safety gear", value: 140000, color: "#e10600" },
    ],
  };

  const MARQUEE = ["Title Sponsor", "Gold Partner", "Silver Partner", "Supporter", "Your Brand Here"]; // REPLACE: sponsor names

  // Form endpoint. Set to your Formspree URL (e.g. "https://formspree.io/f/abcd1234") to send real enquiries.
  const FORM_ENDPOINT = "";

  /* ---------------------------------------------------------
     2. RENDER
     --------------------------------------------------------- */
  const inr = (n) => "₹" + n.toLocaleString("en-IN");

  function renderCars() {
    $("#carGrid").innerHTML = CARS.map((c, i) => {
      const q = c.specs;
      return `
      <article class="card car reveal ${c.current ? "is-current" : ""}" data-tilt>
        <!-- REPLACE: car photos in CARS data -->
        <div class="car-media" data-carousel>
          <img src="${c.images[0]}" alt="${c.name}, ${c.year}" loading="lazy">
          ${c.images.length > 1 ? `
            <button class="car-nav prev" aria-label="Previous photo of ${c.name}"><i data-lucide="chevron-left"></i></button>
            <button class="car-nav next" aria-label="Next photo of ${c.name}"><i data-lucide="chevron-right"></i></button>
            <div class="car-dots">${c.images.map((_, j) => `<button aria-label="Photo ${j + 1}" class="${j ? "" : "is-active"}"></button>`).join("")}</div>` : ""}
        </div>
        <div class="car-body">
          <span class="car-tag ${c.current ? "" : "old"}">${c.current ? "Current Car" : "Season"} · ${c.year}</span>
          <h3>${c.name}</h3>
          <p>${c.desc}</p>
          ${c.current ? `<div class="car-quick">
            <div><b>${q["Weight"].split(" ")[0]}</b><span>kg</span></div>
            <div><b>${q["Top speed"].split(" ")[0]}</b><span>km/h top</span></div>
            <div><b>10</b><span>HP</span></div></div>` : ""}
          <button class="btn ${c.current ? "" : "btn-ghost"} btn-sm" data-specs="${i}">View Specs</button>
        </div>
      </article>`;
    }).join("");

    $("#evo").innerHTML = EVOLUTION.map((e) =>
      `<li><span class="evo-year">${e.year}</span><strong>${e.name}</strong><p>${e.note}</p></li>`).join("");
  }

  function renderCompare(a, b) {
    const A = CARS[a], B = CARS[b];
    const num = (s) => parseFloat(s);
    const rows = Object.keys(A.specs).map((k) => {
      let ca = "", cb = "";
      if (BETTER[k]) {
        const x = num(A.specs[k]), y = num(B.specs[k]);
        const aWins = BETTER[k] === "low" ? x < y : x > y;
        if (x !== y) aWins ? (ca = "better") : (cb = "better");
      }
      return `<tr><th scope="row">${k}</th><td class="${ca}">${A.specs[k]}</td><td class="${cb}">${B.specs[k]}</td></tr>`;
    }).join("");
    $("#compareTable").innerHTML =
      `<thead><tr><th scope="col">Spec</th><th scope="col">${A.name}</th><th scope="col">${B.name}</th></tr></thead><tbody>${rows}</tbody>`;
  }

  function renderGallery() {
    $("#masonry").innerHTML = GALLERY.map((g, i) => `
      <button class="tile reveal" data-cat="${g.cat}" data-index="${i}" aria-label="Open image: ${g.cap}">
        <!-- REPLACE: gallery photo -->
        <img loading="lazy" src="${ph(g.w, g.h, g.cap.split(",")[0].toUpperCase())}" alt="${g.cap}" width="${g.w}" height="${g.h}">
        <figcaption>${g.cap}</figcaption>
      </button>`).join("");
  }

  const memberCard = (name, role, bio = "") => `
    <article class="member reveal" tabindex="0">
      <div class="member-inner">
        <div class="member-face member-front">
          <!-- REPLACE: member photo -->
          <img loading="lazy" src="${ph(400, 400, "PHOTO", "1f1f25", "8a8f98")}" alt="${name}, ${role}">
          <div class="m-meta"><p class="m-name">${name}</p><p class="m-role">${role}</p></div>
        </div>
        <div class="member-face member-back">
          <p class="m-name">${name}</p>
          <p>${bio || role}</p>
          <div class="m-social">
            <a href="#" aria-label="${name} on LinkedIn"><i data-lucide="linkedin"></i></a>
            <a href="#" aria-label="${name} on Instagram"><i data-lucide="instagram"></i></a>
          </div>
        </div>
      </div>
    </article>`;

  function renderTeam() {
    $("#leadGrid").innerHTML = LEADS.map((m) => memberCard(m.name, m.role, m.bio)).join("");
    $("#subTabs").innerHTML = SUBTEAMS.map((s, i) =>
      `<button class="tab" role="tab" id="tab-${s.id}" aria-selected="${i === 0}" aria-controls="subGrid" tabindex="${i === 0 ? 0 : -1}" data-sub="${i}">${s.name}</button>`).join("");
    showSub(0);
  }

  function showSub(i) {
    const s = SUBTEAMS[i];
    $$(".tab").forEach((t, j) => { t.setAttribute("aria-selected", j === i); t.tabIndex = j === i ? 0 : -1; });
    $("#subGrid").setAttribute("aria-labelledby", `tab-${s.id}`);
    $("#subDesc").textContent = s.desc;
    $("#subGrid").innerHTML = s.members.map(([n, r]) => memberCard(n, r, `${s.name} sub-team`)).join("");
    $$("#subGrid .reveal").forEach((el) => el.classList.add("is-in"));
    icons();
  }

  function renderMarquee() {
    const items = MARQUEE.map((m) => `<span>${m}</span>`).join("");
    $("#marquee").innerHTML = items + items + items + items; // duplicated for seamless loop
  }

  function renderBudget() {
    const total = BUDGET.split.reduce((s, x) => s + x.value, 0);
    const C = 2 * Math.PI * 78;
    let offset = 0;
    $("#donut").innerHTML = `<circle cx="100" cy="100" r="78" stroke="rgba(255,255,255,.06)"></circle>` +
      BUDGET.split.map((s) => {
        const len = (s.value / total) * C;
        const el = `<circle cx="100" cy="100" r="78" stroke="${s.color}" stroke-dasharray="0 ${C}" stroke-dashoffset="${-offset}" data-len="${len - 2}" data-c="${C}"></circle>`;
        offset += len;
        return el;
      }).join("");
    $("#bars").innerHTML = BUDGET.split.map((s) => `
      <li>
        <div class="bar-top"><span><span class="bar-dot" style="background:${s.color}"></span>${s.label}</span><span>${inr(s.value)} · ${Math.round((s.value / total) * 100)}%</span></div>
        <div class="bar-track"><span class="bar-fill" style="background-color:${s.color}" data-w="${(s.value / total) * 100}"></span></div>
      </li>`).join("");
  }

  function animateBudget() {
    $$("#donut circle[data-len]").forEach((c) => c.setAttribute("stroke-dasharray", `${c.dataset.len} ${c.dataset.c}`));
    $$(".bar-fill").forEach((b) => (b.style.width = b.dataset.w + "%"));
    countTo($("#raised"), BUDGET.raised, (v) => inr(v));
  }

  /* ---------------------------------------------------------
     3. INTERACTIONS
     --------------------------------------------------------- */
  const icons = () => window.lucide && window.lucide.createIcons();

  // Preloader: five red lights, then GO
  function preloader() {
    const pre = $("#preloader");
    const done = () => { pre.classList.add("is-done"); document.body.classList.remove("is-loading"); };
    if (reduceMotion) return done();
    document.body.classList.add("is-loading");
    const lights = $$(".lights span");
    lights.forEach((l, i) => setTimeout(() => l.classList.add("on"), 250 + i * 280));
    setTimeout(() => $(".lights").classList.add("go"), 250 + lights.length * 280 + 200);
    setTimeout(done, 250 + lights.length * 280 + 750);
  }

  // Custom cursor
  function cursor() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const c = $("#cursor");
    document.body.classList.add("has-cursor");
    let x = 0, y = 0, cx = 0, cy = 0;
    window.addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; });
    const loop = () => { cx += (x - cx) * .25; cy += (y - cy) * .25; c.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener("mouseover", (e) => c.classList.toggle("is-big", !!e.target.closest("a, button, [tabindex='0']")));
  }

  // Navbar: scroll state, burger, scroll-spy
  function nav() {
    const burger = $("#burger"), links = $("#navLinks");
    const close = () => { links.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Open menu"); };
    burger.addEventListener("click", () => {
      const open = links.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open);
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    links.addEventListener("click", (e) => e.target.closest("a") && close());
    document.addEventListener("keydown", (e) => e.key === "Escape" && close());

    const navAnchors = $$(".nav-links a");
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navAnchors.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id && !a.classList.contains("btn")));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach((s) => spy.observe(s));
  }

  // Scroll-driven: progress bar, nav bg, parallax, rev meter, back-to-top
  function scrollFx() {
    const bar = $("#progress"), navEl = $("#nav"), top = $("#toTop");
    const fill = $("#revFill"), needle = $("#revNeedle"), num = $("#revNum");
    const par = $$("[data-parallax]");
    let ticking = false, last = window.scrollY, rpm = 0;
    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? y / max : 0;
      bar.style.transform = `scaleX(${p})`;
      navEl.classList.toggle("is-scrolled", y > 40);
      top.classList.toggle("is-visible", y > innerHeight);
      $("#rev").classList.toggle("is-visible", y > innerHeight * .8);
      if (!reduceMotion && y < innerHeight * 1.2) par.forEach((el) => (el.style.transform = `translate3d(0, ${y * el.dataset.parallax}px, 0)`));
      // Rev meter: position sets the base, scroll speed adds a kick
      const speed = Math.min(Math.abs(y - last) / 40, 1);
      last = y;
      rpm = Math.min(1, p * .7 + speed * .3);
      fill.style.strokeDashoffset = 157.08 * (1 - rpm);
      needle.style.transform = `rotate(${-90 + rpm * 180}deg)`;
      num.textContent = (rpm * 12).toFixed(1);
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    // Let the needle settle back when scrolling stops
    let idle;
    window.addEventListener("scroll", () => { clearTimeout(idle); idle = setTimeout(update, 180); }, { passive: true });
    update();
    top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
  }

  // Count-up numbers
  function countTo(el, target, fmt = (v) => v) {
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = fmt(target) + suffix; return; }
    const t0 = performance.now(), dur = 1600;
    const step = (t) => {
      const k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(Math.round(target * e)) + suffix;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Reveal + counters + budget on enter
  function observers() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        if (el.dataset.count) countTo(el, +el.dataset.count);
        else if (el.id === "donut") animateBudget();
        else el.classList.add("is-in");
        io.unobserve(el);
      });
    }, { threshold: .15, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal, [data-count], #donut").forEach((el) => io.observe(el));
  }

  // Cars: 3D tilt, carousels, spec modal, comparison toggle
  function cars() {
    if (!reduceMotion && matchMedia("(hover: hover)").matches) {
      $$("[data-tilt]").forEach((card) => {
        card.addEventListener("mousemove", (e) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
          card.style.transform = `rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
        });
        card.addEventListener("mouseleave", () => (card.style.transform = ""));
      });
    }
    $$("[data-carousel]").forEach((box, ci) => {
      const imgs = CARS[ci].images, img = $("img", box), dots = $$(".car-dots button", box);
      let i = 0;
      const go = (n) => { i = (n + imgs.length) % imgs.length; img.src = imgs[i]; dots.forEach((d, j) => d.classList.toggle("is-active", j === i)); };
      box.addEventListener("click", (e) => {
        if (e.target.closest(".prev")) go(i - 1);
        else if (e.target.closest(".next")) go(i + 1);
        else if (e.target.closest(".car-dots button")) go(dots.indexOf(e.target.closest("button")));
      });
    });

    const modal = $("#specModal");
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-specs]");
      if (!b) return;
      const c = CARS[+b.dataset.specs];
      $("#specYear").textContent = `${c.current ? "Current car" : "Season"} · ${c.year}`;
      $("#specTitle").textContent = c.name;
      $("#specList").innerHTML = Object.entries(c.specs).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
      modal.showModal();
    });
    modal.addEventListener("click", (e) => { if (e.target === modal || e.target.closest("[data-close]")) modal.close(); });

    renderCompare(0, 1);
    $$(".toggle-btn").forEach((btn) => btn.addEventListener("click", () => {
      $$(".toggle-btn").forEach((b) => { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-pressed", b === btn); });
      const [a, b] = btn.dataset.compare.split(",").map(Number);
      renderCompare(a, b);
    }));
  }

  // Gallery filter + lightbox + lazy YouTube
  function gallery() {
    $$(".filter").forEach((f) => f.addEventListener("click", () => {
      $$(".filter").forEach((x) => { x.classList.toggle("is-active", x === f); x.setAttribute("aria-pressed", x === f); });
      $$(".tile").forEach((t) => {
        t.classList.toggle("is-hidden", f.dataset.filter !== "all" && t.dataset.cat !== f.dataset.filter);
        t.classList.add("is-in");
      });
    }));

    const lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap");
    let idx = 0, opener = null;
    const visible = () => $$(".tile:not(.is-hidden)");
    const show = (n) => {
      const list = visible();
      idx = (n + list.length) % list.length;
      const t = list[idx], img = $("img", t);
      lbImg.src = img.src; lbImg.alt = img.alt; lbCap.textContent = `${$("figcaption", t).textContent} (${idx + 1}/${list.length})`;
    };
    const open = (tile) => { opener = tile; lb.hidden = false; show(visible().indexOf(tile)); $(".lb-close", lb).focus(); document.body.style.overflow = "hidden"; };
    const close = () => { lb.hidden = true; document.body.style.overflow = ""; opener && opener.focus(); };
    $("#masonry").addEventListener("click", (e) => { const t = e.target.closest(".tile"); t && open(t); });
    lb.addEventListener("click", (e) => {
      const a = e.target.closest("[data-lb]");
      if (a) ({ close, prev: () => show(idx - 1), next: () => show(idx + 1) })[a.dataset.lb]();
      else if (e.target === lb) close();
    });
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });

    $$(".video").forEach((v) => v.addEventListener("click", () => {
      const id = v.dataset.yt;
      if (!id || id.startsWith("VIDEO_ID")) { $(".video-cap", v).textContent = "Add a YouTube ID in index.html"; return; }
      v.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1" title="${v.getAttribute("aria-label")}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    }));
  }

  // Team tabs (click + arrow keys)
  function team() {
    const tabs = $("#subTabs");
    tabs.addEventListener("click", (e) => { const t = e.target.closest(".tab"); t && showSub(+t.dataset.sub); });
    tabs.addEventListener("keydown", (e) => {
      if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
      const cur = $$(".tab").findIndex((t) => t.getAttribute("aria-selected") === "true");
      const n = (cur + (e.key === "ArrowRight" ? 1 : -1) + SUBTEAMS.length) % SUBTEAMS.length;
      showSub(n); $$(".tab")[n].focus();
    });
  }

  // Package buttons prefill the form; validation + submit
  function form() {
    const f = $("#enquiryForm"), err = $("#formError"), ok = $("#formSuccess");
    $$("[data-pkg]").forEach((b) => b.addEventListener("click", () => ($("#interest").value = b.dataset.pkg)));
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      err.textContent = "";
      $$(".is-invalid", f).forEach((x) => x.classList.remove("is-invalid"));
      const bad = $$("input, select, textarea", f).filter((x) => !x.checkValidity());
      if (bad.length) {
        bad.forEach((x) => { x.classList.add("is-invalid"); x.setAttribute("aria-invalid", "true"); });
        err.textContent = bad[0].type === "email" && bad[0].value ? "Please enter a valid email address." : "Please fill in the required fields marked *.";
        bad[0].focus();
        return;
      }
      const btn = $("button[type=submit]", f);
      btn.disabled = true; btn.textContent = "Sending…";
      try {
        // BACKEND: if FORM_ENDPOINT is set, POST to it (Formspree format). Otherwise simulate success.
        if (FORM_ENDPOINT) {
          const res = await fetch(FORM_ENDPOINT, { method: "POST", body: new FormData(f), headers: { Accept: "application/json" } });
          if (!res.ok) throw new Error("Request failed");
        } else {
          await new Promise((r) => setTimeout(r, 700));
        }
        f.reset(); ok.hidden = false;
      } catch {
        err.textContent = "Something went wrong. Please email us directly.";
      } finally {
        btn.disabled = false; btn.textContent = "Send Enquiry";
      }
    });
  }

  // Engine rev sound, synthesised with Web Audio. Only on click, never autoplay.
  function sound() {
    const btn = $("#sound");
    let ctx;
    btn.addEventListener("click", () => {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator(), osc2 = ctx.createOscillator(), gain = ctx.createGain(), lp = ctx.createBiquadFilter();
      osc.type = "sawtooth"; osc2.type = "square";
      lp.type = "lowpass"; lp.frequency.setValueAtTime(600, t); lp.frequency.linearRampToValueAtTime(2200, t + .7); lp.frequency.linearRampToValueAtTime(500, t + 1.8);
      [osc, osc2].forEach((o, i) => {
        const m = i ? .5 : 1;
        o.frequency.setValueAtTime(45 * m, t);
        o.frequency.exponentialRampToValueAtTime(210 * m, t + .7);
        o.frequency.exponentialRampToValueAtTime(60 * m, t + 1.8);
        o.connect(lp); o.start(t); o.stop(t + 1.9);
      });
      gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(.18, t + .08); gain.gain.linearRampToValueAtTime(.14, t + 1.2); gain.gain.linearRampToValueAtTime(0, t + 1.9);
      lp.connect(gain).connect(ctx.destination);
      btn.setAttribute("aria-pressed", "true");
      btn.innerHTML = `<i data-lucide="volume-2"></i><span>Revving</span>`; icons();
      setTimeout(() => { btn.setAttribute("aria-pressed", "false"); btn.innerHTML = `<i data-lucide="volume-x"></i><span>Rev it</span>`; icons(); }, 1900);
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    $("#year").textContent = new Date().getFullYear();
    renderCars(); renderGallery(); renderTeam(); renderMarquee(); renderBudget();
    icons();
    preloader(); cursor(); nav(); scrollFx(); observers(); cars(); gallery(); team(); form(); sound();
  });
})();
