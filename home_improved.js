// home_improved.js - Enhanced with better UI/UX and validation

document.addEventListener("DOMContentLoaded", () => {
  console.log("Enhanced home.js running");

  // ========================
  // 1) Smooth scrolling
  // ========================
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // ========================
  // 2) Mobile nav toggle
  // ========================
  const navToggle = document.getElementById("navToggle");
  const nav = document.querySelector(".nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isShown = nav.style.display === "flex";
      nav.style.display = isShown ? "none" : "flex";
    });
  }

  // ========================
  // 3) Reveal-on-scroll
  // ========================
  const revealEls = document.querySelectorAll(".reveal");

  // Make everything visible immediately as a safe fallback
  revealEls.forEach((el) => el.classList.add("revealed"));

  // Then enhance with IntersectionObserver if available
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  // ========================
  // API helpers
  // ========================
  async function apiGET(url) {
    const res = await fetch(url, { credentials: "include" });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) throw new Error(json?.error || "Request failed");
    return json.data;
  }

  async function apiPOST(url, payload) {
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {}),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) throw new Error(json?.error || "Request failed");
    return json.data;
  }

  // ========================
  // 4) Auth modal open/close
  // ========================
  const authModal = document.getElementById("authModal");
  const btnTopStart = document.getElementById("btnTopStart");
  const btnStart = document.getElementById("btnStart");

  function openAuth() {
    if (!authModal) return;
    clearFormErrors();
    authModal.showModal();
  }

  btnTopStart?.addEventListener("click", openAuth);
  btnStart?.addEventListener("click", openAuth);

  // close when clicking outside dialog
  authModal?.addEventListener("click", (e) => {
    const rect = authModal.getBoundingClientRect();
    const inDialog =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (!inDialog) authModal.close();
  });

  // ========================
  // 5) Form elements
  // ========================
  const tabBtns = document.querySelectorAll(".seg__btn[data-tab]");
  const nameRow = document.querySelector('[data-field="name"]');
  const roleRow = document.querySelector('[data-field="role"]');
  const strengthRow = document.querySelector('[data-field="strength"]');
  const authSubmit = document.getElementById("authSubmit");
  const authAlert = document.getElementById("authAlert");
  const authAlertText = document.getElementById("authAlertText");
  const btnText = document.querySelector(".btn-text");
  const btnLoader = document.querySelector(".btn-loader");

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  let mode = "signin"; // signin | signup
  let signupRole = "patient"; // patient | doctor

  // ========================
  // 6) Alert Functions
  // ========================
  function showAlert(message, type = "error") {
    if (!authAlert || !authAlertText) return;
    authAlert.className = `auth__alert auth__alert--${type}`;
    authAlertText.textContent = message;
    authAlert.hidden = false;
  }

  function hideAlert() {
    if (authAlert) authAlert.hidden = true;
  }

  // ========================
  // 7) Form Validation
  // ========================
  function clearFormErrors() {
    document.querySelectorAll(".input-error").forEach((el) => (el.textContent = ""));
    document.querySelectorAll(".input").forEach((el) => el.classList.remove("input--error"));
    hideAlert();
  }

  function showFieldError(field, message) {
    const errorEl = document.querySelector(`[data-error="${field}"]`);
    const inputEl = document.querySelector(`[data-input="${field}"]`);
    if (errorEl) errorEl.textContent = message;
    if (inputEl) inputEl.classList.add("input--error");
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function validateForm() {
    clearFormErrors();
    let isValid = true;

    const name = (nameInput?.value || "").trim();
    const email = (emailInput?.value || "").trim();
    const password = (passwordInput?.value || "").trim();

    if (mode === "signup") {
      if (!name) {
        showFieldError("name", "Name is required");
        isValid = false;
      } else if (name.length < 2) {
        showFieldError("name", "Name must be at least 2 characters");
        isValid = false;
      }
    }

    if (!email) {
      showFieldError("email", "Email is required");
      isValid = false;
    } else if (!validateEmail(email)) {
      showFieldError("email", "Please enter a valid email address");
      isValid = false;
    }

    if (!password) {
      showFieldError("password", "Password is required");
      isValid = false;
    } else if (mode === "signup" && password.length < 6) {
      showFieldError("password", "Password must be at least 6 characters");
      isValid = false;
    }

    return isValid;
  }

  // ========================
  // 8) Password Strength Indicator
  // ========================
  function calculatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    return Math.min(strength, 4);
  }

  function updatePasswordStrength() {
    if (!strengthRow || mode !== "signup") return;

    const password = passwordInput?.value || "";
    const strength = calculatePasswordStrength(password);
    const bars = strengthRow.querySelectorAll(".strength-bar");
    const text = strengthRow.querySelector(".strength-text");

    const labels = ["", "Weak", "Fair", "Good", "Strong"];
    const colors = ["", "#ef4444", "#f59e0b", "#10b981", "#059669"];

    bars.forEach((bar, i) => {
      if (i < strength) {
        bar.style.backgroundColor = colors[strength];
      } else {
        bar.style.backgroundColor = "#e5e7eb";
      }
    });

    if (text) text.textContent = password ? labels[strength] : "";
  }

  passwordInput?.addEventListener("input", updatePasswordStrength);

  // ========================
  // 9) Password Toggle
  // ========================
  const togglePassword = document.querySelector(".toggle-password");
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const type = passwordInput.type === "password" ? "text" : "password";
      passwordInput.type = type;
      togglePassword.style.color = type === "text" ? "var(--primary)" : "inherit";
    });
  }

  // ========================
  // 10) Mode switching (Sign In / Sign Up)
  // ========================
  function setMode(nextMode) {
    mode = nextMode;

    tabBtns.forEach((b) => b.classList.remove("seg__btn--active"));
    document.querySelector(`.seg__btn[data-tab="${mode}"]`)?.classList.add("seg__btn--active");

    if (nameRow) nameRow.hidden = mode !== "signup";
    if (roleRow) roleRow.hidden = mode !== "signup";
    if (strengthRow) strengthRow.hidden = mode !== "signup";

    if (btnText) btnText.textContent = mode === "signup" ? "Create Account" : "Sign In";

    clearFormErrors();
    if (mode === "signup") {
      updatePasswordStrength();
    }
  }

  tabBtns.forEach((b) => {
    b.addEventListener("click", () => setMode(b.dataset.tab));
  });

  setMode("signin");

  // ========================
  // 11) Role Selection
  // ========================
  const roleBtns = document.querySelectorAll(".role-btn");
  roleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const role = btn.dataset.role;
      signupRole = role;

      roleBtns.forEach((b) => b.classList.remove("role-btn--active"));
      btn.classList.add("role-btn--active");
    });
  });

  // ========================
  // 12) Demo Account Buttons
  // ========================
  document.querySelectorAll("[data-demo]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const demo = btn.getAttribute("data-demo");

      if (mode === "signin") {
        // Prefill demo credentials for sign-in
        if (demo === "doctor") {
          if (emailInput) emailInput.value = "doctor@care.com";
          if (passwordInput) passwordInput.value = "123456";
          showAlert("Demo doctor credentials loaded. Click Sign In to continue.", "info");
        } else if (demo === "patient") {
          if (emailInput) emailInput.value = "patient@care.com";
          if (passwordInput) passwordInput.value = "123456";
          showAlert("Demo patient credentials loaded. Click Sign In to continue.", "info");
        }
      } else {
        // For signup, just set the role
        signupRole = demo;
        const roleBtn = document.querySelector(`[data-role="${demo}"]`);
        if (roleBtn) {
          roleBtns.forEach((b) => b.classList.remove("role-btn--active"));
          roleBtn.classList.add("role-btn--active");
        }
      }
    });
  });

  // ========================
  // 13) Form Submit
  // ========================
  authSubmit?.addEventListener("click", async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showAlert("Please fix the errors above", "error");
      return;
    }

    const name = (nameInput?.value || "").trim();
    const email = (emailInput?.value || "").trim();
    const password = (passwordInput?.value || "").trim();

    // Show loading state
    if (authSubmit) authSubmit.disabled = true;
    if (btnText) btnText.hidden = true;
    if (btnLoader) btnLoader.hidden = false;
    hideAlert();

    try {
      if (mode === "signup") {
        await apiPOST("api/auth_register.php", { name, email, password, role: signupRole });
        showAlert("Account created successfully! Redirecting...", "success");
      } else {
        await apiPOST("api/auth_login.php", { email, password });
        showAlert("Login successful! Redirecting...", "success");
      }

      // After login/register, ask server who I am
      const me = await apiGET("api/me.php");

      setTimeout(() => {
        authModal?.close();
        if (me?.role === "doctor") window.location.href = "doctor.html";
        else window.location.href = "patient.html";
      }, 1000);

    } catch (err) {
      showAlert(err.message || "Request failed. Please try again.", "error");

      // Reset button state
      if (authSubmit) authSubmit.disabled = false;
      if (btnText) btnText.hidden = false;
      if (btnLoader) btnLoader.hidden = true;
    }
  });

  // ========================
  // 14) Enter key to submit
  // ========================
  [nameInput, emailInput, passwordInput].forEach((input) => {
    input?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        authSubmit?.click();
      }
    });
  });
});
