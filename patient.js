// patient.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("patient.js running");

  const navButtons = document.querySelectorAll(".dash-nav__item[data-p-view]");
  const views = document.querySelectorAll(".p-view");
  const signOutBtn = document.getElementById("btnSignOutPatient");

  // helper to show one section by name
  function showSection(name) {
    // show/hide sections
    views.forEach((v) => {
      const sectionName = v.getAttribute("data-p-section");
      if (sectionName === name) {
        v.classList.remove("is-hidden");
      } else {
        v.classList.add("is-hidden");
      }
    });

    // update sidebar active state
    navButtons.forEach((btn) => {
      if (btn.dataset.pView === name) {
        btn.classList.add("dash-nav__item--active");
      } else {
        btn.classList.remove("dash-nav__item--active");
      }
    });
  }

  // clicks on sidebar nav
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.pView;
      if (target) showSection(target);
    });
  });

  // links inside cards that should switch views (e.g. "View All", "Back")
  document.querySelectorAll("[data-p-view-link]").forEach((el) => {
    el.addEventListener("click", () => {
      const target = el.getAttribute("data-p-view-link");
      if (target) showSection(target);
    });
  });

  // default view
  showSection("dashboard");

  // sign out
  if (signOutBtn) {
    function deleteCookie(name) {
      document.cookie = encodeURIComponent(name) + "=;path=/;max-age=0";
    }

    signOutBtn.addEventListener("click", () => {
      deleteCookie("auth");
      deleteCookie("user");
      window.location.href = "index.html";
    });
  }
});
