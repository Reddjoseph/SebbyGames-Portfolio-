document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // 📱 Mobile menu toggle
  // =========================
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }

  // =========================
  // ✨ Animated name switch
  // =========================
  const nameText = document.getElementById("nameText");
  const names = ["Red!", "RJ!"];
  let currentIndex = 0;

  if (nameText) {
    setInterval(() => {
      nameText.classList.remove("glow");
      nameText.style.opacity = 0;

      setTimeout(() => {
        currentIndex = (currentIndex + 1) % names.length;
        nameText.textContent = names[currentIndex];
        nameText.style.opacity = 1;
        nameText.classList.add("glow");

        setTimeout(() => {
          nameText.classList.remove("glow");
        }, 800);
      }, 500);
    }, 2000);
  }

  // =========================
  // 🌗 Theme toggle switch
  // =========================
  const themeToggle = document.getElementById("themeToggle");
  const body = document.body;
  const currentTheme = localStorage.getItem("theme");

  // Apply saved theme on load
  if (currentTheme === "light") {
    body.classList.add("light-mode");
    themeToggle.checked = true;
  } else {
    themeToggle.checked = false;
  }

  // Toggle theme on switch
  themeToggle.addEventListener("change", () => {
    if (themeToggle.checked) {
      body.classList.add("light-mode");
      localStorage.setItem("theme", "light");
    } else {
      body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
    }
  });
});
