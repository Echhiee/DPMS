document.addEventListener("DOMContentLoaded", () => {
  const authModal = document.getElementById("authModal");
  const btnTopStart = document.getElementById("btnTopStart");
  const btnStart = document.getElementById("btnStart");

  const tabBtns = document.querySelectorAll(".seg__btn[data-tab]");
  const nameRow = document.querySelector('[data-field="name"]');
  const submitBtn = document.getElementById("authSubmit");

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");

  let mode = "signin";

  function openAuth() {
    if (!authModal) return;
    if (typeof authModal.showModal === "function") authModal.showModal();
    else authModal.setAttribute("open", "true");
  }

  btnTopStart?.addEventListener("click", (e) => { e.preventDefault(); openAuth(); });
  btnStart?.addEventListener("click", (e) => { e.preventDefault(); openAuth(); });

  async function api(path, options = {}) {
    const res = await fetch(path, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) throw new Error(data?.error || "Request failed");
    return data.data;
  }

  function setMode(next) {
    mode = next;
    tabBtns.forEach(b => b.classList.toggle("seg__btn--active", b.dataset.tab === next));
    if (nameRow) nameRow.hidden = (mode !== "signup");
    if (submitBtn) submitBtn.textContent = (mode === "signup") ? "Create Account" : "Sign In";
    if (passInput) passInput.value = "";
  }

  tabBtns.forEach(btn => btn.addEventListener("click", () => setMode(btn.dataset.tab)));

  (async () => {
    try {
      const me = await api("api/me.php");
      if (me?.role === "doctor") window.location.href = "doctor.html";
      if (me?.role === "patient") window.location.href = "patient.html";
    } catch (_) {}
  })();

  submitBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const name = (nameInput?.value || "").trim();
    const email = (emailInput?.value || "").trim();
    const password = (passInput?.value || "").trim();

    try {
      if (mode === "signup") {
        await api("api/auth_register.php", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });
        authModal?.close?.();
        window.location.href = "patient.html";
      } else {
        const me = await api("api/auth_login.php", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        authModal?.close?.();
        window.location.href = me.role === "doctor" ? "doctor.html" : "patient.html";
      }
    } catch (err) {
      alert(err.message);
    }
  });

  setMode("signin");
});
