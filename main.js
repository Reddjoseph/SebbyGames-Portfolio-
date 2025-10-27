// =========================
// 🌗 Theme Toggle + Hamburger Menu + Projects Carousel
// =========================

document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // 📱 Mobile Menu Toggle
  // =========================
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      menuToggle.classList.toggle("open");
    });
  }

  // Hamburger animation (3-line to X)
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
  // 🌗 Light / Dark Theme Toggle
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
  // 🎯 Robust Projects Carousel (3 / 2 / 1 responsive)
  // =========================
  (function () {
    const wrapper = document.querySelector(".projects-wrapper");
    const track = document.querySelector(".projects-track");
    const cards = Array.from(document.querySelectorAll(".project-card"));
    const prevBtn = document.querySelector(".carousel-btn.prev");
    const nextBtn = document.querySelector(".carousel-btn.next");
    const indicatorsContainer = document.getElementById("carouselIndicators");
    if (!wrapper || !track || cards.length === 0) return;

    // determine how many cards we'd like visible based on CSS breakpoints
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

    // Scroll by exactly the wrapper's visible width (one "page" at a time)
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
        setTimeout(type, 2000); // pause when fully typed
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

});
