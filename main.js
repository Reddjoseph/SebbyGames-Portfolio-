// =========================
// Theme Toggle + Hamburger Menu + Projects Carousel
// =========================

document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // Mobile Menu Toggle
  // =========================
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      menuToggle.classList.toggle("open");
    });
  }

  // =========================
  // Close mobile menu when link is clicked
  // =========================
  const navLinkItems = document.querySelectorAll(".nav-links a");

  navLinkItems.forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768 && navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
        menuToggle.classList.remove("open");
      }
    });
  });


  // Hamburger animation
  if (menuToggle) {
    const style = document.createElement("style");
    style.textContent = `
      #menuToggle {
        width: 28px;
        height: 20px;
        position: relative;
        cursor: pointer;
        flex-direction: column;
        justify-content: space-between;
      }
      #menuToggle span {
        background: var(--text-color);
        height: 3px;
        width: 100%;
        border-radius: 2px;
        transition: all 0.3s ease;
      }
      #menuToggle.open span:nth-child(1) {
        transform: rotate(45deg) translateY(8px);
      }
      #menuToggle.open span:nth-child(2) {
        opacity: 0;
      }
      #menuToggle.open span:nth-child(3) {
        transform: rotate(-45deg) translateY(-8px);
      }
    `;
    document.head.appendChild(style);
  }
  
  // =========================
  // Light / Dark Theme Toggle
  // =========================
  const themeToggle = document.getElementById("themeToggle");
  const body = document.body;

  // Load saved theme from localStorage
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    body.classList.add("light-mode");
    if (themeToggle) themeToggle.checked = true;
  } else {
    body.classList.remove("light-mode");
    if (themeToggle) themeToggle.checked = false;
  }

  // Listen for toggle changes
  if (themeToggle) {
    themeToggle.addEventListener("change", () => {
      if (themeToggle.checked) {
        body.classList.add("light-mode");
        localStorage.setItem("theme", "light");
      } else {
        body.classList.remove("light-mode");
        localStorage.setItem("theme", "dark");
      }
    });
  }

  // =========================
  // Robust Projects Carousel
  // =========================
  (function () {
    const wrapper = document.querySelector(".projects-wrapper");
    const track = document.querySelector(".projects-track");
    const cards = Array.from(document.querySelectorAll(".project-card"));
    const prevBtn = document.querySelector(".carousel-btn.prev");
    const nextBtn = document.querySelector(".carousel-btn.next");
    const indicatorsContainer = document.getElementById("carouselIndicators");
    if (!wrapper || !track || cards.length === 0) return;

    // determine how many cards is visible based on CSS breakpoints
    const visibleCount = () => {
      const w = window.innerWidth;
      if (w <= 768) return 1;       // mobile
      if (w <= 1024) return 2;      // tablet / small desktop
      return 3;                     // desktop
    };

    let currentPage = 0;
    let totalPages = 1;

    function computeTotals() {
      const perPage = visibleCount();
      totalPages = Math.max(1, Math.ceil(cards.length / perPage));
    }

    function createIndicators() {
      indicatorsContainer.innerHTML = "";
      for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement("span");
        if (i === currentPage) dot.classList.add("active");
        dot.addEventListener("click", () => goToPage(i));
        indicatorsContainer.appendChild(dot);
      }
    }

    function updateIndicators() {
      const dots = indicatorsContainer.querySelectorAll("span");
      dots.forEach((dot, idx) => dot.classList.toggle("active", idx === currentPage));
    }

    // Scroll by exactly the wrapper's visible width
    function goToPage(pageIndex, smooth = true) {
      const perPage = visibleCount();
      // Clamp pageIndex
      pageIndex = Math.max(0, Math.min(pageIndex, totalPages - 1));
      const wrapperWidth = wrapper.clientWidth;
      const left = wrapperWidth * pageIndex;
      wrapper.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
      currentPage = pageIndex;
      updateIndicators();
    }

    // recalc pages/icons and reset view when needed (on load / resize)
    function refresh() {
      const prevPage = currentPage;
      computeTotals();
      createIndicators();
      if (currentPage >= totalPages) currentPage = totalPages - 1;
      goToPage(currentPage, false);
      updateIndicators();
      if (currentPage !== prevPage) updateIndicators();
    }

    // Next / Prev
    nextBtn?.addEventListener("click", () => {
      goToPage((currentPage + 1) % totalPages);
    });
    prevBtn?.addEventListener("click", () => {
      goToPage((currentPage - 1 + totalPages) % totalPages);
    });

    // Update current page while user scrolls (so dots sync when user swipes/drag)
    let scrollDebounce;
    wrapper.addEventListener("scroll", () => {
      clearTimeout(scrollDebounce);
      scrollDebounce = setTimeout(() => {
        const wrapperWidth = wrapper.clientWidth;
        const newPage = Math.round(wrapper.scrollLeft / wrapperWidth);
        if (newPage !== currentPage) {
          currentPage = Math.max(0, Math.min(newPage, totalPages - 1));
          updateIndicators();
        }
      }, 60);
    });

    // Drag / touch support
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let isDragging = false;

    wrapper.addEventListener("mousedown", (e) => {
      isDown = true;
      isDragging = false;
      wrapper.classList.add("dragging");
      startX = e.pageX;
      scrollStart = wrapper.scrollLeft;
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      isDragging = true;
      const dx = startX - e.pageX;
      wrapper.scrollLeft = scrollStart + dx;
    });

    window.addEventListener("mouseup", () => {
      if (!isDown) return;
      isDown = false;
      wrapper.classList.remove("dragging");
      const wrapperWidth = wrapper.clientWidth;
      const nearest = Math.round(wrapper.scrollLeft / wrapperWidth);
      goToPage(nearest);
    });

    // touch
    wrapper.addEventListener("touchstart", (e) => {
      startX = e.touches[0].pageX;
      scrollStart = wrapper.scrollLeft;
    });
    wrapper.addEventListener("touchmove", (e) => {
      const dx = startX - e.touches[0].pageX;
      wrapper.scrollLeft = scrollStart + dx;
    });
    wrapper.addEventListener("touchend", () => {
      const wrapperWidth = wrapper.clientWidth;
      const nearest = Math.round(wrapper.scrollLeft / wrapperWidth);
      goToPage(nearest);
    });

    // recalc on resize (debounced)
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(refresh, 120);
    });

    // initial
    refresh();
  })();

  // ==================== Animated Name Text (Typewriter + Cursor) ====================
  (function () {
    const nameEl = document.getElementById("nameText");
    if (!nameEl) return;

    const names = ["Red!", "RJ.!"];
    let index = 0;
    let charIndex = 0;
    let typing = true;

    function type() {
      const current = names[index];

      if (typing) {
        nameEl.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.length) {
          typing = false;
          setTimeout(type, 2000);
          return;
        }
      } else {
        nameEl.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
          typing = true;
          index = (index + 1) % names.length;
        }
      }
      setTimeout(type, typing ? 140 : 100);
    }

    type();
  })();

  // ==================== Modals (Certificates & Clients) ====================
  (function() {
    const modals = {
      certificates: document.getElementById("certificatesModal"),
      clients: document.getElementById("clientsModal"),
    };

    const buttons = {
      certificates: document.getElementById("certificatesBtn"),
      clients: document.getElementById("clientsBtn"),
    };

    const closeBtns = document.querySelectorAll(".close-btn");

    // Open modals
    buttons.certificates?.addEventListener("click", () => {
      modals.certificates.classList.add("active");
    });
    buttons.clients?.addEventListener("click", () => {
      modals.clients.classList.add("active");
    });

    // Close modals
    closeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        btn.closest(".modal").classList.remove("active");
      });
    });

    // Close when clicking outside modal content
    Object.values(modals).forEach(modal => {
      modal?.addEventListener("click", e => {
        if (e.target === modal) modal.classList.remove("active");
      });
    });
  })();


  // =========================
// Ambient Effects: Subtle Stars + Accent Meteors (Dark) / Detailed Snowflakes (Light)
// =========================
(function () {
  const container = document.getElementById("ambient-bg");
  if (!container) return;

  let canvas, ctx;
  let mode = null;
  let animationId;
  let particles = [];
  let accentColor;
  let meteorTimers = []; // to track setTimeouts

  // --------------------------
  // STAR + METEOR (accent lowkey version)
  // --------------------------
  class Star {
    constructor(w, h) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 1.3 + 0.4;
      this.alpha = Math.random() * 0.3 + 0.3;
      this.twinkleSpeed = Math.random() * 0.01 + 0.005;
    }
    update() {
      this.alpha += this.twinkleSpeed * (Math.random() > 0.5 ? 1 : -1);
      this.alpha = Math.min(Math.max(this.alpha, 0.1), 0.6);
    }
    draw(ctx) {
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  class Meteor {
    constructor(w, h, color) {
      this.color = color;
      this.reset(w, h);
    }
    reset(w, h) {
      this.x = Math.random() * w;
      this.y = -50 - Math.random() * h * 0.5;
      this.len = 70 + Math.random() * 40;
      this.speed = 6 + Math.random() * 3;
      this.angle = Math.PI / 4; // 45° down-right
      this.opacity = 0.4;
    }
    update(w, h) {
      this.x += this.speed * Math.cos(this.angle);
      this.y += this.speed * Math.sin(this.angle);
    }
    isOffscreen(w, h) {
      return this.x > w + this.len || this.y > h + this.len;
    }
    draw(ctx) {
      const xEnd = this.x - this.len * Math.cos(this.angle);
      const yEnd = this.y - this.len * Math.sin(this.angle);
      const gradient = ctx.createLinearGradient(this.x, this.y, xEnd, yEnd);
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, "transparent");
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(xEnd, yEnd);
      ctx.stroke();
    }
  }

  function initStars(w, h) {
    particles = [];
    for (let i = 0; i < 60; i++) particles.push(new Star(w, h));
    scheduleMeteor(w, h);
  }

  // --- Meteor scheduler (controlled & rare) ---
  function scheduleMeteor(w, h) {
    // Clear any pending timeouts before creating new ones
    meteorTimers.forEach(clearTimeout);
    meteorTimers = [];

    const spawn = () => {
      if (mode !== "stars") return;
      if (particles.filter(p => p instanceof Meteor).length < 2) {
        particles.push(new Meteor(w, h, accentColor));
      }
      // Schedule next spawn
      const next = 6000 + Math.random() * 4000; // 6–10 sec
      const t = setTimeout(spawn, next);
      meteorTimers.push(t);
    };
    spawn();
  }

  function drawStars(w, h) {
    ctx.clearRect(0, 0, w, h);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update(w, h);
      p.draw(ctx);
      if (p instanceof Meteor && p.isOffscreen(w, h)) {
        particles.splice(i, 1); // remove old meteors
      }
    }
  }

  // --------------------------
  // SNOWFLAKE BACKGROUND (detailed)
  // --------------------------
  class Snowflake {
    constructor(w, h) {
      this.reset(w, h);
    }
    reset(w, h) {
      this.x = Math.random() * w;
      this.y = Math.random() * -h;
      this.size = 6 + Math.random() * 10;
      this.speedY = 0.4 + Math.random() * 1.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.angle = Math.random() * Math.PI * 2;
      this.spin = (Math.random() - 0.5) * 0.02;
      this.opacity = 0.4 + Math.random() * 0.6;
      this.color = `rgba(${150 + Math.random() * 60}, ${200 + Math.random() * 55}, 255, ${this.opacity})`;
    }
    update(w, h) {
      this.angle += this.spin;
      this.x += Math.sin(this.angle) * 0.6 + this.speedX;
      this.y += this.speedY;
      if (this.y > h + 20) this.reset(w, h);
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      const r = this.size / 2;
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const x = r * Math.cos(a);
        const y = r * Math.sin(a);
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        // side branches
        const bx1 = x * 0.5;
        const by1 = y * 0.5;
        const b1 = a + Math.PI / 6;
        const b2 = a - Math.PI / 6;
        ctx.moveTo(bx1, by1);
        ctx.lineTo(bx1 + Math.cos(b1) * r * 0.3, by1 + Math.sin(b1) * r * 0.3);
        ctx.moveTo(bx1, by1);
        ctx.lineTo(bx1 + Math.cos(b2) * r * 0.3, by1 + Math.sin(b2) * r * 0.3);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  function initSnow(w, h) {
    particles = Array.from({ length: 80 }, () => new Snowflake(w, h));
  }

  function drawSnow(w, h) {
    ctx.clearRect(0, 0, w, h);
    for (const flake of particles) {
      flake.update(w, h);
      flake.draw(ctx);
    }
  }

  // --------------------------
  // Core Control
  // --------------------------
  function initCanvas() {
    canvas = document.createElement("canvas");
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    container.innerHTML = "";
    container.appendChild(canvas);
    ctx = canvas.getContext("2d");
  }

  function animate() {
    const w = canvas.width, h = canvas.height;
    if (mode === "snow") drawSnow(w, h);
    else drawStars(w, h);
    animationId = requestAnimationFrame(animate);
  }

  function startAmbient() {
    cancelAnimationFrame(animationId);
    meteorTimers.forEach(clearTimeout);
    meteorTimers = [];

    accentColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent-color")
      .trim() || "#58a6ff";

    if (!canvas) initCanvas();
    canvas.width = innerWidth;
    canvas.height = innerHeight;

    if (document.body.classList.contains("light-mode")) {
      mode = "snow";
      initSnow(canvas.width, canvas.height);
    } else {
      mode = "stars";
      initStars(canvas.width, canvas.height);
    }
    animate();
  }

  startAmbient();
  document.getElementById("themeToggle")?.addEventListener("change", startAmbient);
  window.addEventListener("resize", startAmbient);
})();


// =========================
// Certificates Category Filter
// =========================
(function() {
  const select = document.getElementById("categorySelect");
  const cards = document.querySelectorAll(".certificate-card");

  if (!select || cards.length === 0) return;

  select.addEventListener("change", () => {
    const value = select.value;
    cards.forEach(card => {
      const category = card.dataset.category;
      card.style.display = (value === "all" || category === value) ? "block" : "none";
    });
  });
})();


});
