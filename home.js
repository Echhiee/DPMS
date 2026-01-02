// home.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("home.js running");

  // Smooth scrolling for nav links
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

  // Mobile nav toggle
  const navToggle = document.getElementById("navToggle");
  const nav = document.querySelector(".nav");

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isShown = nav.style.display === "flex";
      nav.style.display = isShown ? "none" : "flex";
    });
  }

  // Reveal-on-scroll
  const revealEls = document.querySelectorAll(".reveal");
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
  } else {
    revealEls.forEach((el) => el.classList.add("revealed"));
  }

  // Auth modal (simple)
  const authModal = document.getElementById("authModal");
  const btnTopStart = document.getElementById("btnTopStart");
  const btnStart = document.getElementById("btnStart");

  function openAuth() {
    if (!authModal) return;
    if (typeof authModal.showModal === "function") {
      authModal.showModal();
    } else {
      authModal.setAttribute("open", "true");
    }
  }

  if (btnTopStart) {
    btnTopStart.addEventListener("click", (e) => {
      e.preventDefault();
      openAuth();
    });
  }

  if (btnStart) {
    btnStart.addEventListener("click", (e) => {
      e.preventDefault();
      openAuth();
    });
  }

  // Clicking backdrop closes dialog
  if (authModal && typeof authModal.showModal === "function") {
    authModal.addEventListener("click", (e) => {
      const rect = authModal.getBoundingClientRect();
      const inDialog =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!inDialog) {
        authModal.close();
      }
    });
  }

  // Simple cookie helpers
  function setCookie(name, value, days) {
    const maxAge = days ? days * 24 * 60 * 60 : 0;
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};path=/;max-age=${maxAge}`;
  }

  function getCookie(name) {
    const key = encodeURIComponent(name) + "=";
    const parts = document.cookie.split(";");
    for (let p of parts) {
      p = p.trim();
      if (p.indexOf(key) === 0) return decodeURIComponent(p.substring(key.length));
    }
    return null;
  }

  function deleteCookie(name) {
    document.cookie = `${encodeURIComponent(name)}=;path=/;max-age=0`;
  }

  // If already authenticated (cookie), redirect to dashboard
  try {
    if (getCookie("auth") === "1") {
      const role = getCookie("user") || "doctor";
      if (role === "patient") {
        window.location.href = "patient.html";
      } else {
        window.location.href = "doctor.html";
      }
      return;
    }
  } catch (e) {
    // ignore
  }

  // Handle sign-in submit (hardcoded admin/admin)
  const authSubmit = document.getElementById("authSubmit");
  if (authSubmit) {
    authSubmit.addEventListener("click", (e) => {
      e.preventDefault();
      const emailEl = document.getElementById("email");
      const passEl = document.getElementById("password");
      const email = (emailEl && emailEl.value || "").trim();
      const password = (passEl && passEl.value || "").trim();

      // hardcoded demo credentials
      // doctor: admin / admin
      // patient: patient / patient
      if (email === "admin" && password === "admin") {
        setCookie("auth", "1", 7); // keep for 7 days
        setCookie("user", "doctor", 7);
        if (authModal && typeof authModal.close === "function") authModal.close();
        window.location.href = "doctor.html";
      } else if (email === "patient" && password === "patient") {
        setCookie("auth", "1", 7);
        setCookie("user", "patient", 7);
        if (authModal && typeof authModal.close === "function") authModal.close();
        window.location.href = "patient.html";
      } else {
        // basic feedback for invalid creds
        alert("Invalid credentials. Use admin/admin for doctor or patient/patient for patient demo.");
      }
    });
  }

  // Demo buttons fill values quickly
  document.querySelectorAll("[data-demo]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const demo = btn.getAttribute("data-demo");
      const emailEl = document.getElementById("email");
      const passEl = document.getElementById("password");
      if (demo === "doctor") {
        if (emailEl) emailEl.value = "admin";
        if (passEl) passEl.value = "admin";
      } else if (demo === "patient") {
        if (emailEl) emailEl.value = "patient";
        if (passEl) passEl.value = "patient";
      }
    });
  });
});
