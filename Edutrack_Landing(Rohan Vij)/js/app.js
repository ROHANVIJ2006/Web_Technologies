/* ======================================
   DOM READY
====================================== */
document.addEventListener("DOMContentLoaded", function () {

  /* ======================================
     BURGER MENU
  ====================================== */
  const burger = document.querySelector("#burger");
  const header = document.querySelector(".site-header");
  const navLinks = document.querySelectorAll(".nav-links a");

  if (burger) {
    burger.addEventListener("click", function () {
      header.classList.toggle("nav-open");
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      header.classList.remove("nav-open");
    });
  });


  /* ======================================
     FAQ ACCORDION (ONE OPEN AT A TIME)
  ====================================== */
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(function (item) {
    const question = item.querySelector(".faq-question");

    question.addEventListener("click", function () {

      // Close all first
      faqItems.forEach(function (i) {
        i.classList.remove("active");
      });

      // Open clicked one
      item.classList.toggle("active");
    });
  });


  /* ======================================
     FORM VALIDATION
  ====================================== */
  const form = document.querySelector("#contactForm");
  const successBanner = document.querySelector("#successBanner");

  if (form) {

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      let isValid = true;

      const name = document.querySelector("#name");
      const email = document.querySelector("#email");
      const phone = document.querySelector("#phone");
      const terms = document.querySelector("#terms");

      const errors = document.querySelectorAll(".error");
      errors.forEach(function (err) {
        err.textContent = "";
      });

      // Name validation
      if (name.value.trim() === "") {
        name.nextElementSibling.textContent = "Name is required";
        isValid = false;
      }

      // Email validation (simple check)
      if (!email.value.includes("@")) {
        email.nextElementSibling.textContent = "Enter valid email";
        isValid = false;
      }

      // Phone validation (10 digits)
      if (phone.value.trim().length !== 10 || isNaN(phone.value)) {
        phone.nextElementSibling.textContent = "Enter 10 digit phone";
        isValid = false;
      }

      // Terms checkbox
      if (!terms.checked) {
        terms.parentElement.nextElementSibling.textContent = "You must accept terms";
        isValid = false;
      }

      // If valid
      if (isValid) {
        successBanner.style.display = "block";
        form.reset();
      } else {
        successBanner.style.display = "none";
      }
    });
  }


  /* ======================================
     THEME TOGGLE (CLASS-BASED)
  ====================================== */
  class ThemeManager {

    constructor(buttonSelector) {
      this.button = document.querySelector(buttonSelector);
      this.body = document.body;
      this.storageKey = "theme";
    }

    init() {
      const savedTheme = localStorage.getItem(this.storageKey);

      if (savedTheme === "dark") {
        this.body.classList.add("dark");
        this.updateButton(true);
      }

      this.button.addEventListener("click", () => {
        this.toggleTheme();
      });
    }

    toggleTheme() {
      const isDark = this.body.classList.toggle("dark");

      localStorage.setItem(this.storageKey, isDark ? "dark" : "light");

      this.updateButton(isDark);
    }

    updateButton(isDark) {
      this.button.textContent = isDark
        ? "☀ Light Mode"
        : "🌙 Dark Mode";
    }
  }

  const theme = new ThemeManager("#themeToggle");
  theme.init();

});