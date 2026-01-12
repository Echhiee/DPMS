// doctor.js (DB/API) - FULL FINAL WITH PROFILE EDIT + DYNAMIC DOCTOR NAME (FIXED)
document.addEventListener("DOMContentLoaded", () => {
  console.log("doctor.js (DB/API)");

  // ---------- API helpers ----------
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
    String(s ?? "").replace(/[&<>"']/g, (m) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[m]));

  // ---------- Auth guard ----------
  async function requireDoctor() {
    const me = await apiGET("api/me.php");
    if (!me || me.role !== "doctor") {
      window.location.href = "index.html";
      return null;
    }
    return me;
  }

  // ---------- Greeting name ----------
  async function loadDoctorGreeting() {
    const me = await apiGET("api/me.php");
    const nameEl = document.getElementById("docName");
    if (nameEl) nameEl.textContent = me.name || me.full_name || "Doctor";
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

      // load profile when opening profile tab
      if (section === "profile") {
        loadDoctorProfile().catch((e) => alert(e.message));
      }
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

  // ---------- Profile tab ----------
  const doctorProfileBody = document.getElementById("doctorProfileBody");
  const btnEditDoctorProfile = document.getElementById("btnEditDoctorProfile");

  // ---------- State ----------
  let patients = [];
  let appointments = [];
  let prescriptions = [];
  let selectedRx = null;
  let selectedAppt = null;

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

  // =========================================================
  // PROFILE TAB (VIEW + EDIT + SAVE) ✅ FIXED
  // =========================================================
  async function loadDoctorProfile() {
    if (!doctorProfileBody) return;

    const p = await apiGET("api/doctor_profile.php");

    doctorProfileBody.innerHTML = `
      <div class="profile-grid">
        <div><strong>Name:</strong> ${esc(p.name || "—")}</div>
        <div><strong>Email:</strong> ${esc(p.email || "—")}</div>
        <div><strong>Speciality:</strong> ${esc(p.speciality || "—")}</div>
        <div><strong>Registration No:</strong> ${esc(p.regNo || "—")}</div>
        <div><strong>Clinic:</strong> ${esc(p.clinic || "—")}</div>
        <div><strong>Experience:</strong> ${esc(p.experienceYears ?? "—")} years</div>
        <div><strong>Languages:</strong> ${esc(p.languages || "—")}</div>
        <div><strong>Visiting Hours:</strong> ${esc(p.visitingHours || "—")}</div>
        <div style="grid-column:1/-1">
          <strong>About:</strong>
          <p class="muted">${esc(p.about || "—")}</p>
        </div>
      </div>
    `;
  }

  async function enableDoctorProfileEdit() {
    if (!doctorProfileBody) return;

    const p = await apiGET("api/doctor_profile.php");

    doctorProfileBody.innerHTML = `
      <div class="profile-form">
        <label>Speciality
          <input class="input" id="pfSpeciality" value="${esc(p.speciality || "")}">
        </label>

        <label>Registration No
          <input class="input" id="pfRegNo" value="${esc(p.regNo || "")}">
        </label>

        <label>Clinic
          <input class="input" id="pfClinic" value="${esc(p.clinic || "")}">
        </label>

        <label>Experience (years)
          <input class="input" type="number" id="pfExp" value="${p.experienceYears ?? 0}">
        </label>

        <label>Languages
          <input class="input" id="pfLang" value="${esc(p.languages || "")}">
        </label>

        <label>Visiting Hours
          <input class="input" id="pfVisit" value="${esc(p.visitingHours || "")}">
        </label>

        <label>About
          <textarea class="input" rows="4" id="pfAbout">${esc(p.about || "")}</textarea>
        </label>

        <div style="display:flex; gap:8px; justify-content:flex-end;">
          <button class="btn" id="btnCancelProfileEdit">Cancel</button>
          <button class="btn btn--primary" id="btnSaveProfile">Save Profile</button>
        </div>
      </div>
    `;

    document.getElementById("btnCancelProfileEdit")?.addEventListener("click", () => {
      loadDoctorProfile().catch((e) => alert(e.message));
    });

    document.getElementById("btnSaveProfile")?.addEventListener("click", async () => {
      const payload = {
        speciality: document.getElementById("pfSpeciality")?.value || "",
        reg_no: document.getElementById("pfRegNo")?.value || "",
        clinic: document.getElementById("pfClinic")?.value || "",
        experience_years: Number(document.getElementById("pfExp")?.value || 0),
        languages: document.getElementById("pfLang")?.value || "",
        visiting_hours: document.getElementById("pfVisit")?.value || "",
        about: document.getElementById("pfAbout")?.value || "",
      };

      await apiPOST("api/doctor_profile_update.php", payload);
      alert("Profile updated ✅");
      await loadDoctorProfile();
    });
  }

  btnEditDoctorProfile?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    enableDoctorProfileEdit().catch((err) => alert(err.message));
  });

  // =========================================================
  // PATIENTS TAB (WITH MESSAGING)
  // =========================================================
  const patientsList = document.getElementById("patientsList");
  const patientsSearchInput = document.getElementById("patientsSearchInput");
  const patientDetailCard = document.getElementById("patientDetailCard");
  const patientDetailName = document.getElementById("patientDetailName");
  const patientDetailMeta = document.getElementById("patientDetailMeta");
  const patientDetailBody = document.getElementById("patientDetailBody");
  const patientSymptomsSection = document.getElementById("patientSymptomsSection");
  const patientSymptomsList = document.getElementById("patientSymptomsList");
  const patientMessagingSection = document.getElementById("patientMessagingSection");
  const doctorMessageInput = document.getElementById("doctorMessageInput");
  const btnSendMessage = document.getElementById("btnSendMessage");
  const messageStatus = document.getElementById("messageStatus");

  let allPatients = [];
  let selectedPatient = null;

  async function loadPatientsList() {
    allPatients = await apiGET("api/doctor_patients.php?risk=all&q=");
    renderPatientsList("");
  }

  function renderPatientsList(query) {
    if (!patientsList) return;
    patientsList.innerHTML = "";
    const q = (query || "").trim().toLowerCase();

    allPatients
      .filter(p => !q || p.name.toLowerCase().includes(q) || (p.conditionName || "").toLowerCase().includes(q))
      .forEach((p) => {
        const div = document.createElement("div");
        div.className = "patient-list-item";
        div.style.cssText = "padding: 12px; border-bottom: 1px solid #e0e0e0; cursor: pointer; hover-effect: all 0.2s;";
        div.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600;">${esc(p.name)}</div>
              <div style="font-size: 0.9em; color: #666;">${esc(p.conditionName || "—")} • Age ${esc(p.age ?? "—")}</div>
            </div>
            <span style="padding: 4px 8px; border-radius: 4px; background: ${p.risk === 'high' ? '#ffebee' : p.risk === 'medium' ? '#fff3e0' : '#e8f5e9'}; color: ${p.risk === 'high' ? '#c62828' : p.risk === 'medium' ? '#e65100' : '#2e7d32'}; font-size: 0.85em; font-weight: 600;">${esc(p.risk || "low")}</span>
          </div>
        `;
        div.addEventListener("click", () => {
          selectedPatient = p;
          renderPatientDetail();
        });
        patientsList.appendChild(div);
      });
  }

  async function renderPatientDetail() {
    if (!selectedPatient) return;

    // Update header
    if (patientDetailName) patientDetailName.textContent = selectedPatient.name;
    if (patientDetailMeta) patientDetailMeta.textContent = `${selectedPatient.conditionName || "—"} • Age ${selectedPatient.age ?? "—"} • Risk: ${selectedPatient.risk || "low"}`;

    // Load patient details and symptoms
    try {
      const detail = await apiGET(`api/doctor_patient_detail.php?patient_id=${selectedPatient.id}`);
      
      // Display patient info
      if (patientDetailBody) {
        patientDetailBody.innerHTML = `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <strong>Condition:</strong> ${esc(detail.patient?.conditionName || "—")}<br/>
              <strong>Last Visit:</strong> ${esc(detail.patient?.lastVisit || "—")}<br/>
              <strong>Allergies:</strong> ${esc(detail.patient?.allergies || "—")}<br/>
            </div>
            <div>
              <strong>Email:</strong> ${esc(detail.patient?.email || "—")}<br/>
              <strong>Phone:</strong> ${esc(detail.patient?.phone || "—")}<br/>
              <strong>Last Labs:</strong> ${esc(detail.patient?.lastLabs || "—")}<br/>
            </div>
          </div>
        `;
      }

      // Display symptoms log
      if (patientSymptomsSection && patientSymptomsList) {
        if (detail.recentSymptoms && detail.recentSymptoms.length > 0) {
          patientSymptomsSection.style.display = "block";
          patientSymptomsList.innerHTML = "";
          detail.recentSymptoms.slice(0, 10).forEach((sym) => {
            const div = document.createElement("div");
            div.style.cssText = "padding: 10px; background: #f5f5f5; margin-bottom: 8px; border-radius: 4px; border-left: 3px solid #2F80ED;";
            div.innerHTML = `
              <strong>${esc(sym.symptom)}</strong> <span style="color: #666; font-size: 0.9em;"><strong>Severity:</strong> ${esc(sym.severity)}</span><br/>
              <span style="color: #999; font-size: 0.85em;">📅 ${esc(sym.occurredAt)} ${sym.notes ? '- ' + esc(sym.notes) : ''}</span>
            `;
            patientSymptomsList.appendChild(div);
          });
        } else {
          patientSymptomsSection.style.display = "none";
        }
      }

      // Show messaging section
      if (patientMessagingSection) {
        patientMessagingSection.style.display = "block";
      }
    } catch (e) {
      if (patientDetailBody) patientDetailBody.innerHTML = `<p style="color: red;">Error loading patient details: ${esc(e.message)}</p>`;
    }

    // Clear previous message and focus on input
    if (doctorMessageInput) {
      doctorMessageInput.value = "";
      doctorMessageInput.focus();
    }
    if (messageStatus) messageStatus.innerHTML = "";
  }

  patientsSearchInput?.addEventListener("input", () => renderPatientsList(patientsSearchInput.value));

  // Send message from doctor to patient
  btnSendMessage?.addEventListener("click", async () => {
    if (!selectedPatient) {
      alert("Please select a patient first");
      return;
    }

    const messageText = (doctorMessageInput?.value || "").trim();
    if (!messageText) {
      alert("Please write a message");
      return;
    }

    try {
      if (messageStatus) messageStatus.innerHTML = "Sending...";
      
      await apiPOST("api/doctor_message_send.php", {
        patient_id: selectedPatient.id,
        message_text: messageText,
      });

      if (doctorMessageInput) doctorMessageInput.value = "";
      if (messageStatus) messageStatus.innerHTML = '<span style="color: green;">✓ Message sent successfully!</span>';
      setTimeout(() => {
        if (messageStatus) messageStatus.innerHTML = "";
      }, 3000);
    } catch (e) {
      if (messageStatus) messageStatus.innerHTML = `<span style="color: red;">Error: ${esc(e.message)}</span>`;
    }
  });

  // =========================================================
  // INIT
  // =========================================================
  (async () => {
    try {
      await requireDoctor();
      await loadDoctorGreeting();   // ✅ greeting changes per doctor
      await loadDashboard();
      await loadAppointmentsTab();
      await loadPrescriptionsTab();
      await loadPatientsList();    // Load patients for patients tab
      // Profile loads when profile tab is opened
    } catch (e) {
      alert(e.message);
    }
  })();
});
