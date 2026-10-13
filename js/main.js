// ============================================================
// NFLS STUDENTS' NEWS AGENCY - OFFICIAL PORTAL SCRIPT
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  // Register GSAP plugins if available
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Global State
  let activitiesData = window.ACTIVITIES_DATA || [];
  let membersData = window.MEMBERS_DATA || [];
  let currentEventIndex = 0;
  let activeFilter = "all";

  // Load JSON Data (with fallback if running offline / file:// protocol)
  try {
    const [actRes, memRes] = await Promise.all([
      fetch("assets/data/activities.json"),
      fetch("assets/data/members.json")
    ]);
    if (actRes.ok) activitiesData = await actRes.json();
    if (memRes.ok) membersData = await memRes.json();
  } catch (err) {
    console.log("Loaded bundled offline data successfully.");
  }

  // ============================================================
  // 1. HERO ANIMATIONS (GSAP & PARALLAX)
  // ============================================================
  function initHeroAnimations() {
    if (typeof gsap === "undefined") return;

    // Initial states
    gsap.set("#nav", { opacity: 0, y: -20 });
    gsap.set(".small-team .word > span", { y: "105%" });
    gsap.set(".big-results .letter", { y: 80, opacity: 0 });
    gsap.set("#subline", { opacity: 0, y: 20 });
    gsap.set(".stats-inner", { opacity: 0 });

    // Apply cards rest rotation & off-screen entrance
    document.querySelectorAll(".card").forEach((card) => {
      const rot = parseFloat(card.dataset.rot) || 0;
      card.dataset.restRot = rot;
      gsap.set(card, { y: -700, rotation: rot + 20, opacity: 0, scale: 0.7 });
    });

    // Intro entrance timeline
    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
    intro
      .to("#nav", { opacity: 1, y: 0, duration: 0.8 }, 0.1)
      .to(
        ".small-team .word > span",
        {
          y: "0%",
          duration: 0.9,
          stagger: 0.08,
          ease: "power3.out"
        },
        0.3
      )
      .to(
        ".big-results .letter",
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.04,
          ease: "back.out(1.5)"
        },
        0.5
      )
      .to(
        ".card",
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotation: (i, el) => parseFloat(el.dataset.restRot) || 0,
          duration: 1.1,
          stagger: { each: 0.07, from: "center" },
          ease: "back.out(1.3)"
        },
        0.75
      )
      .to("#subline", { opacity: 1, y: 0, duration: 0.8 }, 1.5);

    // Continuous floating movement
    document.querySelectorAll(".card").forEach((card, i) => {
      const rot = parseFloat(card.dataset.restRot) || 0;
      gsap.to(card, {
        y: `+=${8 + (i % 3) * 4}`,
        rotation: rot + (i % 2 === 0 ? 1.5 : -1.5),
        duration: 3 + (i % 4) * 0.5,
        delay: 1.6 + i * 0.1,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });
    });

    // Mouse Parallax on Hero
    const hero = document.querySelector(".hero");
    let mx = 0, my = 0, tx = 0, ty = 0;
    if (hero) {
      hero.addEventListener("mousemove", (e) => {
        const r = hero.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      });
      hero.addEventListener("mouseleave", () => {
        mx = 0;
        my = 0;
      });

      function parallaxLoop() {
        tx += (mx - tx) * 0.05;
        ty += (my - ty) * 0.05;
        document.querySelectorAll(".card").forEach((card) => {
          const d = parseFloat(card.dataset.depth) || 8;
          card.style.translate = `${tx * d}px ${ty * d * 0.5}px`;
        });
        requestAnimationFrame(parallaxLoop);
      }
      parallaxLoop();
    }

    // 3D Tilt on Hover for Cards
    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, {
          rotateX: -py * 16,
          rotateY: px * 16,
          scale: 1.12,
          zIndex: 25,
          duration: 0.35,
          ease: "power2.out",
          transformPerspective: 700,
          overwrite: "auto"
        });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          zIndex: "",
          duration: 0.7,
          ease: "elastic.out(1, 0.6)",
          overwrite: "auto"
        });
      });

      // Clicking hero card triggers the corresponding event modal
      card.addEventListener("click", () => {
        const targetEventId = card.dataset.eventId;
        if (targetEventId) {
          const idx = activitiesData.findIndex((ev) => ev.id === targetEventId);
          if (idx !== -1) openEventModal(idx);
        }
      });
    });

    // ScrollTrigger: cards fan out as user scrolls down
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.create({
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.8,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(".big-results", { scale: 1 + 0.12 * p, opacity: 1 - 0.4 * p });
          gsap.set(".small-team", { y: -50 * p, opacity: 1 - p * 1.5 });
          const moves = [
            { x: -240, y: -30, rot: -22 },
            { x: -180, y: 20, rot: -16 },
            { x: -110, y: 70, rot: -8 },
            { x: -35, y: 100, rot: -4 },
            { x: 35, y: 100, rot: 4 },
            { x: 110, y: 70, rot: 10 },
            { x: 180, y: 20, rot: 18 },
            { x: 240, y: -30, rot: 24 }
          ];
          document.querySelectorAll(".card").forEach((card, i) => {
            const m = moves[i] || { x: 0, y: 0, rot: 0 };
            const rest = parseFloat(card.dataset.restRot) || 0;
            gsap.set(card, {
              x: m.x * p,
              y: m.y * p,
              rotation: rest + m.rot * p
            });
          });
          gsap.set("#subline", { opacity: 1 - p * 2 });
        }
      });
    }

    // Big results interactive hover
    const brWrap = document.querySelector(".big-results-wrap");
    if (brWrap) {
      brWrap.addEventListener("mouseenter", () => {
        gsap.to(".big-results .letter", {
          y: -6,
          color: "var(--orange-1)",
          duration: 0.4,
          stagger: 0.03,
          ease: "back.out(1.6)"
        });
      });
      brWrap.addEventListener("mouseleave", () => {
        gsap.to(".big-results .letter", {
          y: 0,
          color: "var(--ghost)",
          duration: 0.6,
          stagger: 0.03,
          ease: "elastic.out(1, 0.6)"
        });
      });
    }
  }

  // ============================================================
  // 2. STATS COUNTER ANIMATION
  // ============================================================
  function initStatsCounter() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.to(".stats-inner", {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".stats", start: "top 80%" }
    });

    ScrollTrigger.create({
      trigger: ".stats",
      start: "top 75%",
      once: true,
      onEnter: () => {
        document.querySelectorAll(".stat-block .num").forEach((el) => {
          const target = parseFloat(el.dataset.count);
          const span = el.querySelector("span");
          gsap.to(
            { v: 0 },
            {
              v: target,
              duration: 2,
              ease: "power2.out",
              onUpdate: function () {
                span.textContent = Math.floor(this.targets()[0].v);
              }
            }
          );
        });
      }
    });
  }

  // ============================================================
  // 3. TIMELINE & ACTIVITIES (SCHEME 2)
  // ============================================================
  function renderTimeline(events) {
    const grid = document.getElementById("eventsGrid");
    if (!grid) return;
    grid.innerHTML = "";

    events.forEach((ev, idx) => {
      const card = document.createElement("article");
      card.className = "event-card";
      card.dataset.id = ev.id;
      card.dataset.index = idx;

      const photoCount = ev.photos ? ev.photos.length : 0;
      const title = ev.title_en || ev.title;
      const category = ev.category_en || ev.category;
      const date = ev.date_en || ev.date;
      const summary = ev.summary_en || ev.summary || ev.description;
      const cover = ev.cover || (ev.photos && ev.photos[0] ? ev.photos[0].path : "");


      card.innerHTML = `
        <div class="event-cover-wrap">
          <img src="${cover}" alt="${title}" loading="lazy" />
          <span class="event-badge">${category}</span>
          <span class="event-photo-count">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            ${photoCount} Photos
          </span>
        </div>
        <div class="event-body">
          <div class="event-meta-row">
            <span class="event-date">${date}</span>
          </div>
          <h3 class="event-title">${title}</h3>
          <p class="event-summary">${summary}</p>
          <div class="event-footer">
            <span class="event-open-cta">
              Explore Gallery
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="7" y1="17" x2="17" y2="7"/>
                <polyline points="7 7 17 7 17 17"/>
              </svg>
            </span>
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        openEventModal(ev.id);
      });

      grid.appendChild(card);
    });
  }

  function initTimelineFilters() {
    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeFilter = btn.dataset.filter;

        let filtered = activitiesData;
        if (activeFilter === "2023") {
          filtered = activitiesData.filter((ev) => ev.year === 2023);
        } else if (activeFilter === "2024") {
          filtered = activitiesData.filter((ev) => ev.year === 2024);
        } else if (activeFilter === "2025") {
          filtered = activitiesData.filter((ev) => ev.year === 2025);
        } else if (activeFilter === "2026") {
          filtered = activitiesData.filter((ev) => ev.year === 2026);
        } else if (activeFilter === "merchandise") {
          filtered = activitiesData.filter((ev) => ev.id === "event-merchandise");
        }

        renderTimeline(filtered);
      });
    });
  }

  // ============================================================
  // 4. MEMBERS & LEADERSHIP SUCCESSION SECTION
  // ============================================================
  function renderMembers(members) {
    const tabsContainer = document.getElementById("termTabs");
    const grid = document.getElementById("teamGrid");
    if (!tabsContainer || !grid) return;

    tabsContainer.innerHTML = "";
    members.forEach((term, idx) => {
      const btn = document.createElement("button");
      btn.className = `term-tab-btn ${idx === 0 ? "active" : ""}`;
      btn.textContent = term.term_en || term.term;
      btn.dataset.index = idx;
      btn.addEventListener("click", () => {
        document.querySelectorAll(".term-tab-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        displayTermMembers(term);
      });
      tabsContainer.appendChild(btn);
    });

    if (members.length > 0) {
      displayTermMembers(members[0]);
    }
  }

  function displayTermMembers(term) {
    const grid = document.getElementById("teamGrid");
    if (!grid) return;
    grid.innerHTML = "";

    const leaders = term.leadership || [];
    leaders.forEach((member) => {
      const card = document.createElement("div");
      card.className = "t-card";

      const name = member.name_en ? `${member.name_en} (${member.name})` : member.name;
      const role = member.role_en || member.role;
      const desc = member.desc_en || member.desc || "Dedicated contributor to agency journalism and archives.";

      let avatarHtml = `<div class="t-placeholder-avatar">${(member.name_en || member.name)[0]}</div>`;
      if (member.avatar) {
        avatarHtml = `<img src="${member.avatar}" alt="${name}" loading="lazy" />`;
      }

      card.innerHTML = `
        <div class="t-avatar-wrap">
          ${avatarHtml}
        </div>
        <div class="t-meta">
          <div class="t-name">${name}</div>
          <div class="t-role">${role}</div>
          <p class="t-desc">${desc}</p>
        </div>
      `;
      grid.appendChild(card);
    });

    // Render cards directly without fade-out or opacity flicker
  }

  // ============================================================
  // 5. IMMERSIVE EVENT GALLERY MODAL (SCHEME 2)
  // ============================================================
  const modal = document.getElementById("immersiveModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalTag = document.getElementById("modalTag");
  const modalDate = document.getElementById("modalDate");
  const modalHeadline = document.getElementById("modalHeadline");
  const modalDesc = document.getElementById("modalDesc");
  const modalKeyPersons = document.getElementById("modalKeyPersons");
  const modalPhotoCount = document.getElementById("modalPhotoCount");
  const modalCanvas = document.getElementById("modalCanvas");
  const modalPrevBtn = document.getElementById("modalPrevBtn");
  const modalNextBtn = document.getElementById("modalNextBtn");
  const modalCloseBtn = document.getElementById("modalCloseBtn");

  function openEventModal(target) {
    if (!activitiesData || activitiesData.length === 0) return;
    let idx = -1;
    if (typeof target === "number") {
      idx = target;
    } else if (typeof target === "string") {
      idx = activitiesData.findIndex((item) => item.id === target);
    }
    if (idx === -1) idx = 0;
    currentEventIndex = Math.max(0, Math.min(idx, activitiesData.length - 1));
    const ev = activitiesData[currentEventIndex];

    const title = ev.title_en || ev.title;
    const category = ev.category_en || ev.category;
    const date = ev.date_en || ev.date;
    const desc = ev.description || ev.summary_en || ev.summary;
    const photos = ev.photos || [];
    const articleLink = document.getElementById("modalArticleLink");

    modalTitle.textContent = title;
    modalTag.textContent = category;
    modalDate.textContent = date;
    modalHeadline.textContent = title;
    modalDesc.textContent = desc;
    if (articleLink) {
      articleLink.href = ev.articleUrl || "";
      articleLink.hidden = !ev.articleUrl;
    }

    if (modalKeyPersons) {
      modalKeyPersons.textContent =
        ev.keyPersons && ev.keyPersons.length > 0 ? ev.keyPersons.join(", ") : "All Agency Members";
    }

    if (modalPhotoCount) {
      modalPhotoCount.textContent = `${photos.length} High-Res Frames`;
    }

    // Build Horizontal Photo Canvas
    modalCanvas.innerHTML = "";
    photos.forEach((p, pIdx) => {
      const item = document.createElement("div");
      const isHoriz = p.orientation === "horizontal";

      // Alternate sizes for artistic visual rhythm
      let sizeClass = "-normal";
      if (pIdx % 3 === 0) sizeClass = "-big";
      else if (pIdx % 3 === 2) sizeClass = "-small";
      if (isHoriz) sizeClass += " -horizontal";

      item.className = `g-item ${sizeClass}`;
      item.innerHTML = `
        <img src="${p.path}" alt="${p.title}" loading="lazy" />
        <div class="g-item-info">
          <div class="g-item-title">${p.title || `Archive #${pIdx + 1}`}</div>
          <div class="g-item-desc">${p.description || "Official agency visual archive."}</div>
        </div>
      `;

      item.addEventListener("click", () => {
        openLightbox(p.path, p.title, p.description);
      });

      modalCanvas.appendChild(item);
    });

    // Reset scroll to start
    modalCanvas.scrollLeft = 0;

    // Update navigation buttons
    modalPrevBtn.disabled = currentEventIndex === 0;
    modalNextBtn.disabled = currentEventIndex === activitiesData.length - 1;

    // Open Modal
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeEventModal() {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function initImmersiveModal() {
    modalCloseBtn.addEventListener("click", closeEventModal);
    modalPrevBtn.addEventListener("click", () => {
      if (currentEventIndex > 0) openEventModal(currentEventIndex - 1);
    });
    modalNextBtn.addEventListener("click", () => {
      if (currentEventIndex < activitiesData.length - 1) openEventModal(currentEventIndex + 1);
    });

    // Keyboard navigation
    window.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("is-open")) return;
      if (e.key === "Escape") closeEventModal();
      else if (e.key === "ArrowLeft" && currentEventIndex > 0) openEventModal(currentEventIndex - 1);
      else if (e.key === "ArrowRight" && currentEventIndex < activitiesData.length - 1) openEventModal(currentEventIndex + 1);
    });

    // Horizontal Mouse Wheel Scrolling on Canvas
    modalCanvas.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        modalCanvas.scrollLeft += e.deltaY * 1.5;
      }
    }, { passive: false });

    // Drag-to-Scroll on Canvas
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    modalCanvas.addEventListener("mousedown", (e) => {
      isDown = true;
      startX = e.pageX - modalCanvas.offsetLeft;
      scrollLeft = modalCanvas.scrollLeft;
    });
    modalCanvas.addEventListener("mouseleave", () => { isDown = false; });
    modalCanvas.addEventListener("mouseup", () => { isDown = false; });
    modalCanvas.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - modalCanvas.offsetLeft;
      const walk = (x - startX) * 1.8;
      modalCanvas.scrollLeft = scrollLeft - walk;
    });

    // Merchandise quick link button in banner
    const merchBtn = document.getElementById("exploreMerchBtn");
    if (merchBtn) {
      merchBtn.addEventListener("click", () => {
        const mIdx = activitiesData.findIndex((ev) => ev.id === "event-merchandise");
        if (mIdx !== -1) openEventModal(mIdx);
      });
    }
  }

  // ============================================================
  // 6. LIGHTBOX FOR HIGH-RES PREVIEWS
  // ============================================================
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");

  function openLightbox(src, title, desc) {
    lightboxImg.src = src;
    lightboxCaption.textContent = desc ? `${title} — ${desc}` : title;
    lightbox.classList.add("is-open");
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightboxImg.src = "";
  }

  function initLightbox() {
    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // ============================================================
  // 7. SMOOTH NAVIGATION SCROLL
  // ============================================================
  function initSmoothScrollNav() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  }

  // Initialize UI only after the DOM references and component functions are ready.
  initHeroAnimations();
  initStatsCounter();
  renderTimeline(activitiesData);
  initTimelineFilters();
  renderMembers(membersData);
  initImmersiveModal();
  initLightbox();
  initSmoothScrollNav();
});
