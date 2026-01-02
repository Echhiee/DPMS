// doctor.js (DB/API) - REPLACE YOUR FULL FILE WITH THIS
document.addEventListener("DOMContentLoaded", () => {
  console.log("doctor.js (DB/API)");

  // ---------- API helpers ----------
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

  // ---------- Auth guard ----------
  async function requireDoctor() {
    const me = await apiGET("api/me.php");
    if (!me || me.role !== "doctor") {
      window.location.href = "index.html";
      return null;
    }
    return me;
  }

  // ---------- Sign out ----------
  document.getElementById("btnSignOutDoctor")?.addEventListener("click", async () => {
    try { await apiPOST("api/auth_logout.php", {}); } catch (_) {}
    window.location.href = "index.html";
  });

  // ---------- Tab switching ----------
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
    });
  });

  // ---------- Dashboard elements ----------
  const statTotalPatients = document.getElementById("statTotalPatients");
  const statTodayAppointments = document.getElementById("statTodayAppointments");
  const statCriticalPatients = document.getElementById("statCriticalPatients");
  const statPrescriptions = document.getElementById("statPrescriptions");

  const dashPatientList = document.getElementById("dashPatientList");
  const dashPatientSearch = document.getElementById("dashPatientSearch");
  const dashScheduleList = document.getElementById("dashScheduleList");
  const dashAlertList = document.getElementById("dashAlertList");

  // ---------- Appointments tab ----------
  const appointmentsStatusFilter = document.getElementById("appointmentsStatusFilter");
  const appointmentsTableBody = document.getElementById("appointmentsTableBody");
  const appointmentDetailTitle = document.getElementById("appointmentDetailTitle");
  const appointmentDetailSubtitle = document.getElementById("appointmentDetailSubtitle");
  const appointmentDetailBody = document.getElementById("appointmentDetailBody");

  // ---------- Prescriptions tab ----------
  const btnNewPrescription = document.getElementById("btnNewPrescription");
  const prescriptionsSearchInput = document.getElementById("prescriptionsSearchInput");
  const prescriptionsStatusFilter = document.getElementById("prescriptionsStatusFilter");
  const prescriptionsTableBody = document.getElementById("prescriptionsTableBody");
  const prescriptionDetailTitle = document.getElementById("prescriptionDetailTitle");
  const prescriptionDetailSubtitle = document.getElementById("prescriptionDetailSubtitle");
  const prescriptionDetailBody = document.getElementById("prescriptionDetailBody");

  // ---------- State ----------
  let patients = [];
  let appointments = [];
  let prescriptions = [];
  let selectedRx = null;
  let selectedAppt = null;

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (m) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[m]));

  // =========================================================
  // DASHBOARD LOAD
  // =========================================================
  async function loadDashboard() {
    const dash = await apiGET("api/doctor_dashboard.php");
    const stats = dash.stats || {};

    if (statTotalPatients) statTotalPatients.textContent = String(stats.totalPatients ?? 0);
    if (statTodayAppointments) statTodayAppointments.textContent = String(stats.todayAppointments ?? 0);
    if (statCriticalPatients) statCriticalPatients.textContent = String(stats.criticalPatients ?? 0);
    if (statPrescriptions) statPrescriptions.textContent = String(stats.prescriptions ?? 0);

    patients = await apiGET("api/doctor_patients.php?risk=all&q=");
    renderDashPatients("");
    renderDashAlerts();

    appointments = await apiGET("api/doctor_appointments.php?status=scheduled");
    renderDashSchedule();
  }

  function renderDashPatients(query) {
    if (!dashPatientList) return;
    dashPatientList.innerHTML = "";
    const q = (query || "").trim().toLowerCase();

    patients
      .filter(p => !q || p.name.toLowerCase().includes(q) || (p.conditionName||"").toLowerCase().includes(q))
      .slice(0, 10)
      .forEach((p, idx) => {
        const row = document.createElement("div");
        row.className = "doc-patient-row";
        row.innerHTML = `
          <div class="doc-patient-main">
            <div class="doc-patient-avatar doc-patient-avatar--img${(idx % 4) + 1}"></div>
            <div>
              <div class="doc-patient-name">${esc(p.name)}</div>
              <div class="doc-patient-info">
                ${esc(p.conditionName || "—")} · Age ${esc(p.age ?? "—")}<br/>
                <span class="muted tiny">Last visit: ${esc(p.lastVisit ?? "—")}</span>
              </div>
            </div>
          </div>
          <div class="doc-patient-meta">
            <span class="doc-risk doc-risk--${esc(p.risk || "low")}">${esc(p.risk || "low")}</span>
          </div>
        `;
        dashPatientList.appendChild(row);
      });
  }

  function renderDashSchedule() {
    if (!dashScheduleList) return;
    dashScheduleList.innerHTML = "";
    appointments.slice(0, 6).forEach((a) => {
      const li = document.createElement("li");
      li.className = "doc-schedule-item";
      li.innerHTML = `
        <div class="doc-schedule-main">
          <span class="doc-schedule-icon">🕑</span>
          <div>
            <div class="doc-schedule-name">${esc(a.patientName || "Patient")}</div>
            <div class="muted tiny">${esc(a.apptType)} · ${esc(a.apptDate)} · ${esc(a.apptTime)}</div>
          </div>
        </div>
      `;
      dashScheduleList.appendChild(li);
    });
  }

  function renderDashAlerts() {
    if (!dashAlertList) return;
    dashAlertList.innerHTML = "";
    patients
      .filter((p) => p.risk === "high" || p.risk === "medium")
      .slice(0, 6)
      .forEach((p) => {
        const li = document.createElement("li");
        li.textContent =
          p.risk === "high"
            ? `⚠️ ${p.name} – high risk / needs follow-up`
            : `⚠️ ${p.name} – monitoring required`;
        dashAlertList.appendChild(li);
      });
  }

  dashPatientSearch?.addEventListener("input", () => renderDashPatients(dashPatientSearch.value));

  // =========================================================
  // APPOINTMENTS TAB
  // =========================================================
  async function loadAppointmentsTab() {
    const status = appointmentsStatusFilter?.value || "all";
    appointments = await apiGET(`api/doctor_appointments.php?status=${encodeURIComponent(status)}`);
    renderAppointmentsTable();
  }

  function renderAppointmentsTable() {
    if (!appointmentsTableBody) return;
    appointmentsTableBody.innerHTML = "";

    appointments.forEach((a) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${esc(a.apptTime)}</td>
        <td>${esc(a.patientName)}</td>
        <td>${esc(a.apptType)}</td>
        <td><span class="badge">${esc(a.status)}</span></td>
        <td>
          <button class="btn btn--small js-view">View</button>
          <button class="btn btn--small js-complete">Complete</button>
          <button class="btn btn--small btn--danger js-cancel">Cancel</button>
        </td>
      `;

      tr.querySelector(".js-view")?.addEventListener("click", () => {
        selectedAppt = a;
        renderAppointmentDetail();
      });

      tr.querySelector(".js-complete")?.addEventListener("click", async () => {
        await apiPOST("api/doctor_appointment_update.php", { id: a.id, status: "completed" });
        await loadAppointmentsTab();
        await loadDashboard();
      });

      tr.querySelector(".js-cancel")?.addEventListener("click", async () => {
        await apiPOST("api/doctor_appointment_update.php", { id: a.id, status: "cancelled" });
        await loadAppointmentsTab();
        await loadDashboard();
      });

      appointmentsTableBody.appendChild(tr);
    });
  }

  function renderAppointmentDetail() {
    if (!selectedAppt) return;
    if (appointmentDetailTitle) appointmentDetailTitle.textContent = `${selectedAppt.patientName} — ${selectedAppt.apptType}`;
    if (appointmentDetailSubtitle) appointmentDetailSubtitle.textContent = `${selectedAppt.apptDate} · ${selectedAppt.apptTime} · ${selectedAppt.status}`;
    if (appointmentDetailBody) {
      appointmentDetailBody.innerHTML = `
        <p><strong>Reason:</strong> ${esc(selectedAppt.reason || "—")}</p>
        <p><strong>Notes:</strong> ${esc(selectedAppt.notes || "—")}</p>
      `;
    }
  }

  appointmentsStatusFilter?.addEventListener("change", () =>
    loadAppointmentsTab().catch((e) => alert(e.message))
  );

  // =========================================================
  // PRESCRIPTIONS TAB
  // =========================================================
  async function loadPrescriptionsTab() {
    const q = encodeURIComponent((prescriptionsSearchInput?.value || "").trim());
    const st = encodeURIComponent(prescriptionsStatusFilter?.value || "all");
    prescriptions = await apiGET(`api/doctor_prescriptions.php?status=${st}&q=${q}`);
    renderPrescriptionsTable();
  }

  function renderPrescriptionsTable() {
    if (!prescriptionsTableBody) return;
    prescriptionsTableBody.innerHTML = "";

    prescriptions.forEach((rx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${esc(rx.patientName)}</td>
        <td>${esc(rx.medication)}</td>
        <td>${esc(rx.dosage || "—")}</td>
        <td>${esc(rx.frequency || "—")}</td>
        <td>${esc(rx.startDate || "—")} → ${esc(rx.endDate || "—")}</td>
        <td><span class="badge">${esc(rx.status)}</span></td>
        <td>
          <button class="btn btn--small js-view">View</button>
          <button class="btn btn--small btn--danger js-stop">Stop</button>
        </td>
      `;

      tr.querySelector(".js-view")?.addEventListener("click", () => {
        selectedRx = rx;
        renderPrescriptionDetail();
      });

      tr.querySelector(".js-stop")?.addEventListener("click", async () => {
        if (!confirm("Stop this prescription?")) return;
        await apiPOST("api/doctor_prescription_stop.php", { id: rx.id });
        await loadPrescriptionsTab();
        await loadDashboard();
      });

      prescriptionsTableBody.appendChild(tr);
    });
  }

  function renderPrescriptionDetail() {
    if (!selectedRx) return;
    if (prescriptionDetailTitle) prescriptionDetailTitle.textContent = `${selectedRx.medication} — ${selectedRx.patientName}`;
    if (prescriptionDetailSubtitle) prescriptionDetailSubtitle.textContent = `${selectedRx.dosage} · ${selectedRx.frequency} · ${selectedRx.status}`;
    if (prescriptionDetailBody) {
      prescriptionDetailBody.innerHTML = `
        <p><strong>Dates:</strong> ${esc(selectedRx.startDate)} → ${esc(selectedRx.endDate)}</p>
        <p><strong>Instructions:</strong> ${esc(selectedRx.instructions || "—")}</p>
      `;
    }
  }

  prescriptionsSearchInput?.addEventListener("input", () =>
    loadPrescriptionsTab().catch((e) => alert(e.message))
  );
  prescriptionsStatusFilter?.addEventListener("change", () =>
    loadPrescriptionsTab().catch((e) => alert(e.message))
  );

  // ---------- Popup form for new prescription ----------
  function openPrescriptionForm() {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,.45)";
    overlay.style.display = "grid";
    overlay.style.placeItems = "center";
    overlay.style.zIndex = "9999";

    overlay.innerHTML = `
      <div style="width:min(720px, 92vw); background:#fff; border-radius:14px; padding:16px;">
        <h3 style="margin:0 0 10px;">New Prescription</h3>
        <div style="display:grid; gap:10px;">
          <label>Patient
            <select id="rxPatient" class="input" style="width:100%"></select>
          </label>
          <label>Medication
            <input id="rxName" class="input" placeholder="e.g., Paracetamol" />
          </label>
          <div style="display:grid; gap:10px; grid-template-columns: 1fr 1fr;">
            <label>Dosage
              <input id="rxDosage" class="input" placeholder="e.g., 500mg" />
            </label>
            <label>Frequency
              <input id="rxFreq" class="input" placeholder="e.g., 2 times/day" />
            </label>
          </div>
          <div style="display:grid; gap:10px; grid-template-columns: 1fr 1fr;">
            <label>Start Date
              <input id="rxStart" class="input" type="date" />
            </label>
            <label>End Date
              <input id="rxEnd" class="input" type="date" />
            </label>
          </div>
          <label>Instructions
            <textarea id="rxInst" class="input" rows="3" placeholder="After meal, drink water..."></textarea>
          </label>

          <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:8px;">
            <button id="rxCancel" class="btn">Cancel</button>
            <button id="rxSave" class="btn btn--primary">Save</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // fill patients dropdown
    const sel = overlay.querySelector("#rxPatient");
    patients.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      sel.appendChild(opt);
    });

    overlay.querySelector("#rxCancel")?.addEventListener("click", () => overlay.remove());

    overlay.querySelector("#rxSave")?.addEventListener("click", async () => {
      try {
        const payload = {
          patient_id: Number(sel.value),
          name: overlay.querySelector("#rxName").value.trim(),
          dosage: overlay.querySelector("#rxDosage").value.trim(),
          frequency: overlay.querySelector("#rxFreq").value.trim(),
          start_date: overlay.querySelector("#rxStart").value,
          end_date: overlay.querySelector("#rxEnd").value,
          instructions: overlay.querySelector("#rxInst").value.trim(),
        };
        if (!payload.patient_id || !payload.name) return alert("Select patient + medication name");

        await apiPOST("api/doctor_prescription_create.php", payload);
        overlay.remove();
        await loadPrescriptionsTab();
        await loadDashboard();
      } catch (e) {
        alert(e.message);
      }
    });
  }

  btnNewPrescription?.addEventListener("click", () => {
    if (!patients.length) return alert("No patients loaded yet.");
    openPrescriptionForm();
  });

  // =========================================================
  // INIT
  // =========================================================
  (async () => {
    try {
      await requireDoctor();
      await loadDashboard();
      await loadAppointmentsTab();
      await loadPrescriptionsTab();
    } catch (e) {
      alert(e.message);
    }
  })();
});
