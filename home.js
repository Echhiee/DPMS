// home.js (Frontend UI + API Auth) - REPLACE FULL FILE

document.addEventListener("DOMContentLoaded", () => {
  console.log("home.js running (API)");

  // ----------------------------
  // 1) Smooth scrolling
  // ----------------------------
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

  // ----------------------------
  // 2) Mobile nav toggle
  // ----------------------------
  const navToggle = document.getElementById("navToggle");
  const nav = document.querySelector(".nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isShown = nav.style.display === "flex";
      nav.style.display = isShown ? "none" : "flex";
    });
  }

  // ----------------------------
  // 3) Reveal-on-scroll (IMPORTANT: prevents blank sections)
  // ----------------------------
  const revealEls = document.querySelectorAll(".reveal");

  // Make everything visible immediately as a safe fallback
  // (so even if IntersectionObserver fails, your page won't look blank)
  revealEls.forEach((el) => el.classList.add("revealed"));

  // Then enhance with IntersectionObserver if available (optional)
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

  // ----------------------------
  // API helpers
  // ----------------------------
  async function apiGET(url) {
    const res = await fetch(url, { credentials: "include" });
    let json = null;
    try {
      json = await res.json();
    } catch (e) {
      throw new Error(`Invalid JSON response from ${url}: ${e.message}`);
    }
    if (!res.ok || !json?.ok) {
      throw new Error(json?.error || `Request failed with status ${res.status}`);
    }
    return json.data;
  }

  async function apiPOST(url, payload) {
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {}),
    });
    let json = null;
    try {
      json = await res.json();
    } catch (e) {
      throw new Error(`Invalid JSON response from ${url}: ${e.message}`);
    }
    if (!res.ok || !json?.ok) {
      throw new Error(json?.error || `Request failed with status ${res.status}`);
    }
    return json.data;
  }

  // ----------------------------
  // 4) Auth modal open/close
  // ----------------------------
  const authModal = document.getElementById("authModal");
  const btnTopStart = document.getElementById("btnTopStart");
  const btnStart = document.getElementById("btnStart");

  function openAuth() {
    if (!authModal) return;
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

  // ----------------------------
  // 5) Sign in / Sign up tabs
  // ----------------------------
  const tabBtns = document.querySelectorAll(".seg__btn[data-tab]");
  const nameRow = document.querySelector('[data-field="name"]');
  const authSubmit = document.getElementById("authSubmit");

  let mode = "signin"; // signin | signup
  let signupRole = "patient"; // patient | doctor | admin

  function setMode(nextMode) {
    mode = nextMode;

    tabBtns.forEach((b) => b.classList.remove("seg__btn--active"));
    document.querySelector(`.seg__btn[data-tab="${mode}"]`)?.classList.add("seg__btn--active");

    if (nameRow) nameRow.hidden = mode !== "signup";
    if (authSubmit) authSubmit.textContent = mode === "signup" ? "Create Account" : "Sign In";
  }

  tabBtns.forEach((b) => {
    b.addEventListener("click", () => setMode(b.dataset.tab));
  });

  setMode("signin");

  // Role select using demo buttons
  document.querySelectorAll("[data-demo]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const demo = btn.getAttribute("data-demo");
      if (demo === "doctor") signupRole = "doctor";
      else if (demo === "patient") signupRole = "patient";
      else if (demo === "admin") signupRole = "admin";
    });
  });

  // ----------------------------
  // 6) Submit (real API)
  // ----------------------------
  authSubmit?.addEventListener("click", async (e) => {
    e.preventDefault();

    const name = (document.getElementById("name")?.value || "").trim();
    const email = (document.getElementById("email")?.value || "").trim();
    const password = (document.getElementById("password")?.value || "").trim();

    try {
      if (!email || !password) return alert("Enter email and password.");

      if (mode === "signup") {
        if (!name) return alert("Enter your full name.");
        await apiPOST("api/auth_register.php", { name, email, password, role: signupRole });
      } else {
        await apiPOST("api/auth_login.php", { email, password });
      }

      // After login/register, ask server who I am
      const me = await apiGET("api/me.php");
      authModal?.close();

      if (me?.role === "admin") window.location.href = "admin.html";
      else if (me?.role === "doctor") window.location.href = "doctor.html";
      else window.location.href = "patient.html";
    } catch (err) {
      alert(err.message || "Request failed");
    }
  });
});
