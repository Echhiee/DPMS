// admins.js - Admin Dashboard (renamed from admin.js)
document.addEventListener("DOMContentLoaded", () => {
  console.log("admins.js loaded");

  // API helpers
  async function apiGET(url) {
    const res = await fetch(url, { credentials: "include" });
    let json = null;
    try {
      json = await res.json();
    } catch (e) {
      throw new Error(`Invalid JSON from ${url}: ${e.message}`);
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
      throw new Error(`Invalid JSON from ${url}: ${e.message}`);
    }
    if (!res.ok || !json?.ok) {
      throw new Error(json?.error || `Request failed with status ${res.status}`);
    }
    return json.data;
  }

  const esc = (s) =>
    String(s ?? "").replace(/[&<>\"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[m]));

  // Auth guard
  async function requireAdmin() {
    const me = await apiGET("api/me.php");
    if (!me || me.role !== "admin") {
      window.location.href = "index_improved.html";
      return null;
    }
    return me;
  }

  // Greeting
  async function loadAdminGreeting() {
    const me = await apiGET("api/me.php");
    const greetEl = document.getElementById("adminGreeting");
    if (greetEl) greetEl.textContent = `Welcome, ${esc(me.name || "Admin")}!`;
  }

  // Sign out
  document.getElementById("btnSignOutAdmin")?.addEventListener("click", async () => {
    try {
      await apiPOST("api/auth_logout.php", {});
    } catch (_) {}
    window.location.href = "index_improved.html";
  });

  // Tab navigation
  const navButtons = document.querySelectorAll(".dash-nav__item[data-section]");
  const tabSections = document.querySelectorAll(".tab-section");

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.dataset.section;
      if (!section) return;

      navButtons.forEach((b) => b.classList.remove("dash-nav__item--active"));
      btn.classList.add("dash-nav__item--active");

      tabSections.forEach((sec) => {
        sec.classList.toggle("tab-section--active", sec.dataset.section === section);
      });

      if (section === "registrations") loadRegistrations().catch((e) => alert(e.message));
      if (section === "patients") loadPatients().catch((e) => alert(e.message));
      if (section === "doctors") loadDoctors().catch((e) => alert(e.message));
      if (section === "loginhistory") loadLoginHistory().catch((e) => alert(e.message));
    });
  });

  // Dashboard stats
  const statTotalPatients = document.getElementById("statTotalPatients");
  const statTotalDoctors = document.getElementById("statTotalDoctors");
  const statPendingRequests = document.getElementById("statPendingRequests");
  const statPendingUsers = document.getElementById("statPendingUsers");

  async function loadDashboard() {
    const stats = await apiGET("api/admin_dashboard.php");
    if (statTotalPatients) statTotalPatients.textContent = stats.patients ?? 0;
    if (statTotalDoctors) statTotalDoctors.textContent = stats.doctors ?? 0;
    if (statPendingRequests) statPendingRequests.textContent = stats.pendingRequests ?? 0;
    if (statPendingUsers) statPendingUsers.textContent = stats.pendingUsers ?? 0;
  }

  // Registrations management
  const registrationsTableBody = document.getElementById("registrationsTableBody");
  let registrations = [];
  let rejectingRequestId = null;

  async function loadRegistrations() {
    registrations = await apiGET("api/admin_registration_requests.php");
    renderRegistrationsTable();
  }

  function renderRegistrationsTable() {
    if (!registrationsTableBody) return;
    registrationsTableBody.innerHTML = "";

    if (registrations.length === 0) {
      registrationsTableBody.innerHTML =
        '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #999;">No pending registrations</td></tr>';
      return;
    }

    registrations.forEach((reg) => {
      const tr = document.createElement("tr");
      const date = new Date(reg.requestedAt).toLocaleDateString();

      tr.innerHTML = `
        <td>${esc(reg.name)}</td>
        <td>${esc(reg.email)}</td>
        <td><span class="badge">${esc(reg.requestType)}</span></td>
        <td>${esc(reg.detail || "—")}</td>
        <td>${date}</td>
        <td>
          <button class="btn btn--small js-approve" data-id="${reg.id}">Approve</button>
          <button class="btn btn--small btn--danger js-reject" data-id="${reg.id}">Reject</button>
        </td>
      `;

      tr.querySelector(".js-approve")?.addEventListener("click", async () => {
        if (!confirm("Approve this registration?")) return;
        try {
          await apiPOST("api/admin_approval_action.php", {
            request_id: reg.id,
            action: "approve",
          });
          alert("✓ Registration approved");
          await loadRegistrations();
          await loadDashboard();
        } catch (e) {
          alert("Error: " + e.message);
        }
      });

      tr.querySelector(".js-reject")?.addEventListener("click", () => {
        rejectingRequestId = reg.id;
        document.getElementById("rejectModal").style.display = "block";
      });

      registrationsTableBody.appendChild(tr);
    });
  }

  // Rejection modal
  const rejectModal = document.getElementById("rejectModal");
  const rejectionReason = document.getElementById("rejectionReason");

  document.getElementById("btnCancelReject")?.addEventListener("click", () => {
    rejectModal.style.display = "none";
    rejectionReason.value = "";
    rejectingRequestId = null;
  });

  document.getElementById("btnConfirmReject")?.addEventListener("click", async () => {
    const reason = rejectionReason.value.trim();
    if (!reason) {
      alert("Please enter a rejection reason");
      return;
    }

    try {
      await apiPOST("api/admin_approval_action.php", {
        request_id: rejectingRequestId,
        action: "reject",
        reason: reason,
      });
      alert("✓ Registration rejected");
      rejectModal.style.display = "none";
      rejectionReason.value = "";
      rejectingRequestId = null;
      await loadRegistrations();
      await loadDashboard();
    } catch (e) {
      alert("Error: " + e.message);
    }
  });

  // Patients management
  const patientsTableBody = document.getElementById("patientsTableBody");
  const patientsSearchInput = document.getElementById("patientsSearchInput");
  let allPatients = [];

  async function loadPatients() {
    allPatients = await apiGET("api/admin_patients.php");
    renderPatientsTable("");
  }

  function renderPatientsTable(query) {
    if (!patientsTableBody) return;
    patientsTableBody.innerHTML = "";

    const q = (query || "").toLowerCase();
    const filtered = allPatients.filter(
      (p) => !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      patientsTableBody.innerHTML =
        '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #999;">No patients found</td></tr>';
      return;
    }

    filtered.forEach((patient) => {
      const tr = document.createElement("tr");
      const date = new Date(patient.createdAt).toLocaleDateString();
      const statusColor =
        patient.status === "approved" ? "green" : patient.status === "rejected" ? "red" : "orange";

      tr.innerHTML = `
        <td>${esc(patient.name)}</td>
        <td>${esc(patient.email)}</td>
        <td><span class="badge" style="background: ${statusColor}20; color: ${statusColor};">${esc(
          patient.status
        )}</span></td>
        <td>${esc(patient.bloodType || "—")}</td>
        <td>${date}</td>
        <td>
          ${
            patient.status === "pending"
              ? `<button class="btn btn--small js-approve-patient" data-id="${patient.id}">Approve</button>`
              : ""
          }
          <button class="btn btn--small btn--danger js-delete-patient" data-id="${patient.id}">Delete</button>
        </td>
      `;

      if (patient.status === "pending") {
        tr.querySelector(".js-approve-patient")?.addEventListener("click", async () => {
          if (!confirm("Approve this patient?")) return;
          try {
            await apiPOST("api/admin_patient_action.php", {
              patient_id: patient.id,
              action: "approve",
            });
            alert("✓ Patient approved");
            await loadPatients();
            await loadDashboard();
          } catch (e) {
            alert("Error: " + e.message);
          }
        });
      }

      tr.querySelector(".js-delete-patient")?.addEventListener("click", async () => {
        if (!confirm("Delete this patient? This cannot be undone.")) return;
        try {
          await apiPOST("api/admin_patient_action.php", {
            patient_id: patient.id,
            action: "delete",
          });
          alert("✓ Patient deleted");
          await loadPatients();
          await loadDashboard();
        } catch (e) {
          alert("Error: " + e.message);
        }
      });

      patientsTableBody.appendChild(tr);
    });
  }

  patientsSearchInput?.addEventListener("input", () => renderPatientsTable(patientsSearchInput.value));

  // Doctors management
  const doctorsTableBody = document.getElementById("doctorsTableBody");
  const doctorsSearchInput = document.getElementById("doctorsSearchInput");
  let allDoctors = [];

  async function loadDoctors() {
    allDoctors = await apiGET("api/admin_doctors.php");
    renderDoctorsTable("");
  }

  function renderDoctorsTable(query) {
    if (!doctorsTableBody) return;
    doctorsTableBody.innerHTML = "";

    const q = (query || "").toLowerCase();
    const filtered = allDoctors.filter(
      (d) => !q || d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      doctorsTableBody.innerHTML =
        '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #999;">No doctors found</td></tr>';
      return;
    }

    filtered.forEach((doctor) => {
      const tr = document.createElement("tr");
      const date = new Date(doctor.createdAt).toLocaleDateString();
      const statusColor =
        doctor.status === "approved" ? "green" : doctor.status === "rejected" ? "red" : "orange";

      tr.innerHTML = `
        <td>${esc(doctor.name)}</td>
        <td>${esc(doctor.email)}</td>
        <td>${esc(doctor.speciality || "—")}</td>
        <td><span class="badge" style="background: ${statusColor}20; color: ${statusColor};">${esc(
          doctor.status
        )}</span></td>
        <td>${date}</td>
        <td>
          ${
            doctor.status === "pending"
              ? `<button class="btn btn--small js-approve-doctor" data-id="${doctor.id}">Approve</button>`
              : ""
          }
          <button class="btn btn--small btn--danger js-delete-doctor" data-id="${doctor.id}">Delete</button>
        </td>
      `;

      if (doctor.status === "pending") {
        tr.querySelector(".js-approve-doctor")?.addEventListener("click", async () => {
          if (!confirm("Approve this doctor?")) return;
          try {
            await apiPOST("api/admin_doctor_action.php", {
              doctor_id: doctor.id,
              action: "approve",
            });
            alert("✓ Doctor approved");
            await loadDoctors();
            await loadDashboard();
          } catch (e) {
            alert("Error: " + e.message);
          }
        });
      }

      tr.querySelector(".js-delete-doctor")?.addEventListener("click", async () => {
        if (!confirm("Delete this doctor? This cannot be undone.")) return;
        try {
          await apiPOST("api/admin_doctor_action.php", {
            doctor_id: doctor.id,
            action: "delete",
          });
          alert("✓ Doctor deleted");
          await loadDoctors();
          await loadDashboard();
        } catch (e) {
          alert("Error: " + e.message);
        }
      });

      doctorsTableBody.appendChild(tr);
    });
  }

  doctorsSearchInput?.addEventListener("input", () => renderDoctorsTable(doctorsSearchInput.value));

  // Login history management
  const loginHistoryTableBody = document.getElementById("loginHistoryTableBody");
  const loginHistorySearch = document.getElementById("loginHistorySearch");
  const loginHistoryRoleFilter = document.getElementById("loginHistoryRoleFilter");
  const loginHistoryStatusFilter = document.getElementById("loginHistoryStatusFilter");
  let allLoginHistory = [];

  async function loadLoginHistory() {
    try {
      const response = await apiGET("api/admin_login_history.php?limit=500");
      allLoginHistory = response.records || [];
      renderLoginHistoryTable("");
    } catch (e) {
      if (loginHistoryTableBody) {
        loginHistoryTableBody.innerHTML = `<tr><td colspan="7" style="color: red; text-align: center;">Error loading login history: ${esc(
          e.message
        )}</td></tr>`;
      }
    }
  }

  function renderLoginHistoryTable(query) {
    if (!loginHistoryTableBody) return;
    loginHistoryTableBody.innerHTML = "";

    const q = (query || "").toLowerCase();
    const role = (loginHistoryRoleFilter?.value || "").toLowerCase();
    const status = (loginHistoryStatusFilter?.value || "").toLowerCase();

    const filtered = allLoginHistory.filter((record) => {
      const emailMatch = !q || record.email.toLowerCase().includes(q);
      const roleMatch = !role || record.role.toLowerCase() === role;
      const statusMatch = !status || record.loginStatus.toLowerCase() === status;
      return emailMatch && roleMatch && statusMatch;
    });

    if (filtered.length === 0) {
      loginHistoryTableBody.innerHTML =
        '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #999;">No login records found</td></tr>';
      return;
    }

    filtered.forEach((record) => {
      const tr = document.createElement("tr");
      const loginDate = new Date(record.loginTime);
      const formattedDate =
        loginDate.toLocaleDateString() +
        " " +
        loginDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const statusBadgeColor = record.loginStatus === "success" ? "#4CAF50" : "#f44336";
      const statusBadgeText = record.loginStatus === "success" ? "✓ Success" : "✗ Failed";

      tr.innerHTML = `
        <td>${esc(record.email)}</td>
        <td>${esc(record.userName || "—")}</td>
        <td><span class="badge">${esc(record.role)}</span></td>
        <td><span style="color: ${statusBadgeColor}; font-weight: 600;">${statusBadgeText}</span></td>
        <td>${formattedDate}</td>
        <td><code style="background: #f0f0f0; padding: 4px 8px; border-radius: 3px; font-size: 0.9em;">${esc(
          record.ipAddress || "—"
        )}</code></td>
        <td>${esc(record.failureReason || "—")}</td>
      `;

      loginHistoryTableBody.appendChild(tr);
    });
  }

  loginHistorySearch?.addEventListener("input", () => renderLoginHistoryTable(loginHistorySearch.value));
  loginHistoryRoleFilter?.addEventListener("change", () => renderLoginHistoryTable(loginHistorySearch?.value || ""));
  loginHistoryStatusFilter?.addEventListener("change", () => renderLoginHistoryTable(loginHistorySearch?.value || ""));

  // Initialize
  (async () => {
    try {
      await requireAdmin();
      await loadAdminGreeting();
      await loadDashboard();
    } catch (e) {
      alert(e.message);
    }
  })();
});
