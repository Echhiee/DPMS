// doctor.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("doctor.js running");

  // ========== SIGN OUT ==========
  const signOutBtn = document.getElementById("btnSignOutDoctor");
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

  // ========== DEMO DATA (static for project) ==========
  const patients = [
    {
      id: "P001",
      name: "John Smith",
      age: 45,
      gender: "Male",
      condition: "Type 2 Diabetes",
      risk: "low",
      lastVisit: "2024-02-10",
      nextAppointment: "2024-02-15",
      medicationsCount: 3,
      lastLabs: "2024-02-08",
      allergies: ["Penicillin"],
      medications: [
        { name: "Metformin", dose: "500 mg", frequency: "2x / day" },
        { name: "Atorvastatin", dose: "20 mg", frequency: "1x / day" }
      ],
      vitals: { bp: "130/80", hr: "72 bpm", weight: "82 kg" },
      notes: [
        { date: "2024-02-10", text: "Doing well, continue current regimen." },
        { date: "2024-01-05", text: "Discussed diet and exercise plan." }
      ]
    },
    {
      id: "P002",
      name: "Sarah Johnson",
      age: 38,
      gender: "Female",
      condition: "Hypertension",
      risk: "medium",
      lastVisit: "2024-02-08",
      nextAppointment: "2024-02-20",
      medicationsCount: 2,
      lastLabs: "2024-02-06",
      allergies: [],
      medications: [
        { name: "Amlodipine", dose: "5 mg", frequency: "1x / day" }
      ],
      vitals: { bp: "150/95", hr: "80 bpm", weight: "70 kg" },
      notes: [
        { date: "2024-02-08", text: "BP elevated, monitoring closely." }
      ]
    },
    {
      id: "P003",
      name: "Michael Chen",
      age: 52,
      gender: "Male",
      condition: "Heart Disease",
      risk: "high",
      lastVisit: "2024-02-05",
      nextAppointment: "2024-02-14",
      medicationsCount: 4,
      lastLabs: "2024-02-03",
      allergies: ["Aspirin"],
      medications: [
        { name: "Beta-blocker", dose: "50 mg", frequency: "2x / day" }
      ],
      vitals: { bp: "160/100", hr: "88 bpm", weight: "90 kg" },
      notes: [
        { date: "2024-02-05", text: "High risk, stressed need for follow-up." }
      ]
    },
    {
      id: "P004",
      name: "Emily Rodriguez",
      age: 29,
      gender: "Female",
      condition: "Anxiety",
      risk: "low",
      lastVisit: "2024-02-12",
      nextAppointment: "2024-03-01",
      medicationsCount: 1,
      lastLabs: "2024-02-01",
      allergies: [],
      medications: [
        { name: "Sertraline", dose: "50 mg", frequency: "1x / day" }
      ],
      vitals: { bp: "118/76", hr: "70 bpm", weight: "60 kg" },
      notes: [
        { date: "2024-02-12", text: "Symptoms improving, continue therapy." }
      ]
    }
  ];

  const appointments = [
    {
      id: "A1",
      time: "09:00 AM",
      patientId: "P001",
      type: "Follow-up",
      status: "scheduled",
      reason: "Diabetes follow-up",
      notes: "Review sugar log and adjust meds if needed."
    },
    {
      id: "A2",
      time: "10:30 AM",
      patientId: "P002",
      type: "Consultation",
      status: "scheduled",
      reason: "High BP review",
      notes: "Check adherence and recent headaches."
    },
    {
      id: "A3",
      time: "02:00 PM",
      patientId: "P003",
      type: "Check-up",
      status: "scheduled",
      reason: "Post-hospital check-up",
      notes: "Assess chest pain and exertion."
    }
  ];

  const prescriptions = [
    {
      id: "RX1",
      patientId: "P001",
      medication: "Metformin",
      dosage: "500 mg",
      frequency: "Twice daily",
      startDate: "2024-01-01",
      endDate: "2024-04-01",
      status: "active",
      instructions: "Take with meals. Monitor blood sugar.",
      refills: 2
    },
    {
      id: "RX2",
      patientId: "P002",
      medication: "Amlodipine",
      dosage: "5 mg",
      frequency: "Once daily",
      startDate: "2023-11-10",
      endDate: "2024-02-10",
      status: "expired",
      instructions: "Take in the morning.",
      refills: 0
    },
    {
      id: "RX3",
      patientId: "P003",
      medication: "Beta-blocker",
      dosage: "50 mg",
      frequency: "Twice daily",
      startDate: "2024-01-15",
      endDate: "2024-05-15",
      status: "active",
      instructions: "Do not stop suddenly.",
      refills: 1
    },
    {
      id: "RX4",
      patientId: "P004",
      medication: "Sertraline",
      dosage: "50 mg",
      frequency: "Once daily",
      startDate: "2024-01-20",
      endDate: "2024-04-20",
      status: "active",
      instructions: "Take at night. Do not skip doses.",
      refills: 3
    }
  ];

  // ========== DOCTOR PROFILE DATA (for Profile tab) ==========
  const doctorProfile = {
    id: "D001",
    name: "Dr. Anderson",
    role: "Consultant Physician",
    speciality: "Internal Medicine & Diabetes Care",
    email: "dr.anderson@example.com",
    phone: "+977-9800000000",
    regNo: "NMC-12345",
    clinic: "MediTrack Community Clinic, Pokhara",
    experienceYears: 8,
    languages: ["English", "Nepali", "Hindi"],
    about:
      "Focuses on preventive care and long-term management of chronic conditions like diabetes and hypertension.",
    visitingHours: [
      { day: "Sun – Tue", time: "09:00 AM – 01:00 PM" },
      { day: "Thu – Fri", time: "03:00 PM – 06:00 PM" }
    ]
  };

  // helpers
  const getPatientById = (id) => patients.find((p) => p.id === id);
  const riskLabel = (risk) => {
    if (risk === "high") return "High risk · critical";
    if (risk === "medium") return "Medium risk · monitoring";
    return "Low risk · stable";
  };

  // ========== TAB SWITCHING ==========
  const navButtons = document.querySelectorAll(".dash-nav__item[data-section]");
  const tabSections = document.querySelectorAll(".tab-section");

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.dataset.section;
      if (!section) return;

      navButtons.forEach((b) => b.classList.remove("dash-nav__item--active"));
      btn.classList.add("dash-nav__item--active");

      tabSections.forEach((sec) => {
        if (sec.dataset.section === section) {
          sec.classList.add("tab-section--active");
        } else {
          sec.classList.remove("tab-section--active");
        }
      });
    });
  });

  // ========== DASHBOARD RENDERING ==========
  const statTotalPatientsEl = document.getElementById("statTotalPatients");
  const statTodayAppointmentsEl = document.getElementById(
    "statTodayAppointments"
  );
  const statCriticalPatientsEl = document.getElementById("statCriticalPatients");
  const statPrescriptionsEl = document.getElementById("statPrescriptions");
  const dashPatientList = document.getElementById("dashPatientList");
  const dashPatientSearch = document.getElementById("dashPatientSearch");
  const dashScheduleList = document.getElementById("dashScheduleList");
  const dashAlertList = document.getElementById("dashAlertList");

  function renderDashboardStats() {
    if (statTotalPatientsEl) statTotalPatientsEl.textContent = patients.length;
    if (statTodayAppointmentsEl)
      statTodayAppointmentsEl.textContent = appointments.length;
    if (statCriticalPatientsEl) {
      const criticalCount = patients.filter((p) => p.risk === "high").length;
      statCriticalPatientsEl.textContent = criticalCount;
    }
    if (statPrescriptionsEl)
      statPrescriptionsEl.textContent = prescriptions.length;
  }

  function createRiskBadge(risk) {
    const span = document.createElement("span");
    span.classList.add("doc-risk");
    if (risk === "high") span.classList.add("doc-risk--high");
    if (risk === "medium") span.classList.add("doc-risk--medium");
    if (risk === "low") span.classList.add("doc-risk--low");
    span.textContent = riskLabel(risk);
    return span;
  }

  function renderDashboardPatients(filterText = "") {
    if (!dashPatientList) return;
    dashPatientList.innerHTML = "";

    const query = filterText.trim().toLowerCase();

    patients
      .filter((p) => {
        if (!query) return true;
        return (
          p.name.toLowerCase().includes(query) ||
          p.condition.toLowerCase().includes(query)
        );
      })
      .forEach((patient, index) => {
        const row = document.createElement("div");
        row.className = "doc-patient-row";

        const main = document.createElement("div");
        main.className = "doc-patient-main";

        const avatar = document.createElement("div");
        avatar.className = `doc-patient-avatar doc-patient-avatar--img${
          (index % 4) + 1
        }`;

        const infoWrap = document.createElement("div");
        const nameEl = document.createElement("div");
        nameEl.className = "doc-patient-name";
        nameEl.textContent = patient.name;

        const infoEl = document.createElement("div");
        infoEl.className = "doc-patient-info";
        infoEl.innerHTML = `
          ${patient.condition} · Age ${patient.age}<br/>
          <span class="muted tiny">Last visit: ${patient.lastVisit}</span>
        `;

        infoWrap.appendChild(nameEl);
        infoWrap.appendChild(infoEl);

        main.appendChild(avatar);
        main.appendChild(infoWrap);

        const meta = document.createElement("div");
        meta.className = "doc-patient-meta";

        const riskSpan = createRiskBadge(patient.risk);
        const actions = document.createElement("div");
        actions.className = "doc-patient-actions";
        actions.innerHTML = `
          <button class="link-icon">📝</button>
          <button class="link-icon">📄</button>
        `;

        meta.appendChild(riskSpan);
        meta.appendChild(actions);

        row.appendChild(main);
        row.appendChild(meta);

        dashPatientList.appendChild(row);
      });
  }

  function renderDashboardSchedule() {
    if (!dashScheduleList) return;
    dashScheduleList.innerHTML = "";

    appointments.forEach((appt) => {
      const li = document.createElement("li");
      li.className = "doc-schedule-item";

      const main = document.createElement("div");
      main.className = "doc-schedule-main";

      const icon = document.createElement("span");
      icon.className = "doc-schedule-icon";
      icon.textContent = "🕑";

      const textWrap = document.createElement("div");
      const patient = getPatientById(appt.patientId);
      const name = document.createElement("div");
      name.className = "doc-schedule-name";
      name.textContent = patient ? patient.name : "Unknown patient";

      const meta = document.createElement("div");
      meta.className = "muted tiny";
      meta.textContent = `${appt.type} · ${appt.time} · 30 min`;

      textWrap.appendChild(name);
      textWrap.appendChild(meta);

      main.appendChild(icon);
      main.appendChild(textWrap);

      const startBtn = document.createElement("button");
      startBtn.className = "link-sm";
      startBtn.textContent = "Start";
      startBtn.addEventListener("click", () => {
        alert(`Demo: starting visit for ${patient ? patient.name : "patient"}.`);
      });

      li.appendChild(main);
      li.appendChild(startBtn);

      dashScheduleList.appendChild(li);
    });
  }

  function renderDashboardAlerts() {
    if (!dashAlertList) return;
    dashAlertList.innerHTML = "";

    patients
      .filter((p) => p.risk === "high" || p.risk === "medium")
      .forEach((p) => {
        const li = document.createElement("li");
        li.textContent =
          p.risk === "high"
            ? `⚠️ ${p.name} – high risk / missed appointment`
            : `⚠️ ${p.name} – monitoring required`;
        dashAlertList.appendChild(li);
      });
  }

  if (dashPatientList) {
    renderDashboardStats();
    renderDashboardPatients();
    renderDashboardSchedule();
    renderDashboardAlerts();

    if (dashPatientSearch) {
      dashPatientSearch.addEventListener("input", () => {
        renderDashboardPatients(dashPatientSearch.value);
      });
    }
  }

  const dashAddPatientBtn = document.getElementById("dashAddPatientBtn");
  if (dashAddPatientBtn) {
    dashAddPatientBtn.addEventListener("click", () => {
      alert("Demo: open Add Patient form (dashboard).");
    });
  }

  // Quick actions on dashboard
  const qaWritePrescription = document.getElementById("qaWritePrescription");
  const qaScheduleAppointment = document.getElementById(
    "qaScheduleAppointment"
  );
  const qaGenerateReport = document.getElementById("qaGenerateReport");

  if (qaWritePrescription) {
    qaWritePrescription.addEventListener("click", () => {
      alert("Demo: open Write Prescription form.");
    });
  }
  if (qaScheduleAppointment) {
    qaScheduleAppointment.addEventListener("click", () => {
      alert("Demo: open Schedule Appointment form.");
    });
  }
  if (qaGenerateReport) {
    qaGenerateReport.addEventListener("click", () => {
      alert("Demo: generate PDF report.");
    });
  }

  // ========== PATIENTS TAB ==========
  const patientsSearchInput = document.getElementById("patientsSearchInput");
  const patientsListEl = document.getElementById("patientsList");
  const patientDetailName = document.getElementById("patientDetailName");
  const patientDetailMeta = document.getElementById("patientDetailMeta");
  const patientDetailBody = document.getElementById("patientDetailBody");
  const patientFilterChips = document.querySelectorAll(
    ".patient-filters .chip"
  );
  const btnViewFullRecord = document.getElementById("btnViewFullRecord");
  const patientsAddBtn = document.getElementById("patientsAddBtn");

  let currentPatientFilter = "all";

  function renderPatientsList() {
    if (!patientsListEl) return;
    patientsListEl.innerHTML = "";

    const query = (patientsSearchInput?.value || "").trim().toLowerCase();

    patients
      .filter((p) => {
        if (currentPatientFilter !== "all" && p.risk !== currentPatientFilter) {
          return false;
        }
        if (!query) return true;
        return (
          p.name.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query) ||
          p.condition.toLowerCase().includes(query)
        );
      })
      .forEach((patient, index) => {
        const row = document.createElement("div");
        row.className = "patient-row";
        row.dataset.patientId = patient.id;

        const main = document.createElement("div");
        main.className = "patient-row-main";

        const avatar = document.createElement("div");
        avatar.className = `doc-patient-avatar doc-patient-avatar--img${
          (index % 4) + 1
        }`;

        const text = document.createElement("div");
        text.innerHTML = `
          <div class="patient-row-name">${patient.name}</div>
          <div class="patient-row-sub">
            ${patient.condition} · Age ${patient.age}<br/>
            <span class="muted tiny">Last visit: ${patient.lastVisit}</span>
          </div>
        `;

        main.appendChild(avatar);
        main.appendChild(text);

        const meta = document.createElement("div");
        meta.className = "patient-row-meta";

        const riskSpan = document.createElement("span");
        riskSpan.className = "badge";
        riskSpan.textContent =
          patient.risk === "high"
            ? "high risk"
            : patient.risk === "medium"
            ? "medium risk"
            : "low risk";

        const medsSpan = document.createElement("span");
        medsSpan.className = "muted tiny";
        medsSpan.textContent = `${patient.medicationsCount} meds`;

        meta.appendChild(riskSpan);
        meta.appendChild(medsSpan);

        row.appendChild(main);
        row.appendChild(meta);

        row.addEventListener("click", () => {
          // highlight
          document
            .querySelectorAll(".patient-row--active")
            .forEach((r) => r.classList.remove("patient-row--active"));
          row.classList.add("patient-row--active");
          renderPatientDetail(patient);
        });

        patientsListEl.appendChild(row);
      });
  }

  function renderPatientDetail(patient) {
    if (!patientDetailBody) return;

    if (patientDetailName)
      patientDetailName.textContent = `${patient.name} · ${patient.age} yrs · ${patient.gender}`;
    if (patientDetailMeta)
      patientDetailMeta.textContent = `Last visit ${patient.lastVisit} · Next appointment ${patient.nextAppointment}`;

    if (btnViewFullRecord) {
      btnViewFullRecord.disabled = false;
      btnViewFullRecord.onclick = () => {
        alert(`Demo: open full record for ${patient.name}.`);
      };
    }

    patientDetailBody.innerHTML = `
      <section class="patient-summary-grid">
        <div class="summary-item">
          <div class="summary-label">Primary condition</div>
          <div class="summary-value">${patient.condition}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Medications</div>
          <div class="summary-value">${patient.medicationsCount}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Last labs</div>
          <div class="summary-value">${patient.lastLabs}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Risk level</div>
          <div class="summary-value summary-value--${patient.risk}">
            ${riskLabel(patient.risk)}
          </div>
        </div>
      </section>

      <section class="patient-section">
        <h3>Conditions & Allergies</h3>
        <ul>
          <li>${patient.condition}</li>
          ${
            patient.allergies.length
              ? `<li>Allergies: ${patient.allergies.join(", ")}</li>`
              : "<li>No recorded allergies</li>"
          }
        </ul>
      </section>

      <section class="patient-section">
        <h3>Current Medications</h3>
        <table class="table tiny-table">
          <thead>
            <tr>
              <th>Medication</th>
              <th>Dose</th>
              <th>Frequency</th>
            </tr>
          </thead>
          <tbody>
            ${patient.medications
              .map(
                (m) =>
                  `<tr><td>${m.name}</td><td>${m.dose}</td><td>${m.frequency}</td></tr>`
              )
              .join("")}
          </tbody>
        </table>
      </section>

      <section class="patient-section">
        <h3>Recent Vitals</h3>
        <div class="summary-row">
          <div>BP: ${patient.vitals.bp}</div>
          <div>HR: ${patient.vitals.hr}</div>
          <div>Weight: ${patient.vitals.weight}</div>
        </div>
      </section>

      <section class="patient-section">
        <h3>Recent Notes</h3>
        ${
          patient.notes
            .map(
              (n) =>
                `<div class="note-item"><div class="note-date">${n.date}</div><div class="note-text">${n.text}</div></div>`
            )
            .join("") || "<p class='muted tiny'>No notes yet.</p>"
        }
        <button class="btn btn--ghost btn--small" id="btnAddNote">📝 Add Note</button>
        <button class="btn btn--ghost btn--small" id="btnScheduleFollowup">📅 Schedule Follow-up</button>
        <button class="btn btn--ghost btn--small" id="btnExportSummary">📄 Export Summary (PDF)</button>
      </section>
    `;

    const btnAddNote = document.getElementById("btnAddNote");
    const btnScheduleFollowup = document.getElementById("btnScheduleFollowup");
    const btnExportSummary = document.getElementById("btnExportSummary");

    btnAddNote?.addEventListener("click", () => {
      alert(`Demo: add note for ${patient.name}.`);
    });
    btnScheduleFollowup?.addEventListener("click", () => {
      alert(`Demo: schedule follow-up for ${patient.name}.`);
    });
    btnExportSummary?.addEventListener("click", () => {
      alert("Demo: export summary as PDF (disabled).");
    });
  }

  if (patientsListEl) {
    renderPatientsList();

    patientsSearchInput?.addEventListener("input", () => {
      renderPatientsList();
    });

    patientFilterChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        patientFilterChips.forEach((c) => c.classList.remove("chip--active"));
        chip.classList.add("chip--active");
        currentPatientFilter = chip.dataset.filter || "all";
        renderPatientsList();
      });
    });
  }

  if (patientsAddBtn) {
    patientsAddBtn.addEventListener("click", () => {
      alert("Demo: open Add Patient form (patients tab).");
    });
  }

  // ========== APPOINTMENTS TAB ==========
  const appointmentsTableBody = document.getElementById(
    "appointmentsTableBody"
  );
  const appointmentsStatusFilter = document.getElementById(
    "appointmentsStatusFilter"
  );
  const appointmentDetailTitle = document.getElementById(
    "appointmentDetailTitle"
  );
  const appointmentDetailSubtitle = document.getElementById(
    "appointmentDetailSubtitle"
  );
  const appointmentDetailBody = document.getElementById(
    "appointmentDetailBody"
  );
  const viewToggleButtons = document.querySelectorAll(
    ".appointments-controls .chip"
  );
  const btnNewAppointment = document.getElementById("btnNewAppointment");

  let appointmentStatusFilter = "all";

  function renderAppointmentsTable() {
    if (!appointmentsTableBody) return;
    appointmentsTableBody.innerHTML = "";

    appointments
      .filter((appt) => {
        if (appointmentStatusFilter === "all") return true;
        return appt.status === appointmentStatusFilter;
      })
      .forEach((appt) => {
        const patient = getPatientById(appt.patientId);

        const tr = document.createElement("tr");
        tr.dataset.appointmentId = appt.id;

        tr.innerHTML = `
          <td>${appt.time}</td>
          <td>${patient ? patient.name : "Unknown"}</td>
          <td>${appt.type}</td>
          <td><span class="badge badge--${appt.status}">${appt.status}</span></td>
          <td>
            <button class="link-sm js-start">Start</button>
            <button class="link-sm js-complete">Complete</button>
          </td>
        `;

        tr.addEventListener("click", (e) => {
          // ignore clicks on buttons, they have own handlers
          if (e.target.closest("button")) return;
          document
            .querySelectorAll(".appointments-table tr.active")
            .forEach((row) => row.classList.remove("active"));
          tr.classList.add("active");
          renderAppointmentDetail(appt);
        });

        const startBtn = tr.querySelector(".js-start");
        const completeBtn = tr.querySelector(".js-complete");

        startBtn?.addEventListener("click", (e) => {
          e.stopPropagation();
          alert(
            `Demo: starting consultation for ${
              patient ? patient.name : "patient"
            }.`
          );
          renderAppointmentDetail(appt);
        });

        completeBtn?.addEventListener("click", (e) => {
          e.stopPropagation();
          appt.status = "completed";
          renderAppointmentsTable();
          renderAppointmentDetail(appt);
        });

        appointmentsTableBody.appendChild(tr);
      });
  }

  function renderAppointmentDetail(appt) {
    if (!appointmentDetailBody) return;
    const patient = getPatientById(appt.patientId);

    if (appointmentDetailTitle)
      appointmentDetailTitle.textContent = `${
        patient ? patient.name : "Unknown patient"
      } — ${appt.type}`;
    if (appointmentDetailSubtitle)
      appointmentDetailSubtitle.textContent = `${appt.time} · Status: ${appt.status}`;

    appointmentDetailBody.innerHTML = `
      <section class="appointment-section">
        <h3>Reason for visit</h3>
        <p>${appt.reason}</p>
      </section>
      <section class="appointment-section">
        <h3>Notes</h3>
        <p>${appt.notes}</p>
      </section>
      <section class="appointment-section">
        <h3>Actions</h3>
        <button class="btn btn--primary btn--small" id="btnOpenPatientProfile">
          Open patient profile
        </button>
        <button class="btn btn--ghost btn--small" id="btnMarkCompleted">
          Mark as completed
        </button>
        <button class="btn btn--ghost btn--small" id="btnPrintSchedule">
          Print schedule
        </button>
      </section>
    `;

    document
      .getElementById("btnOpenPatientProfile")
      ?.addEventListener("click", () => {
        // switch to patients tab & highlight patient
        const patientsNavBtn = document.querySelector(
          '.dash-nav__item[data-section="patients"]'
        );
        patientsNavBtn?.click();

        setTimeout(() => {
          const row = document.querySelector(
            `.patient-row[data-patient-id="${appt.patientId}"]`
          );
          if (row) row.click();
        }, 50);
      });

    document.getElementById("btnMarkCompleted")?.addEventListener("click", () => {
      appt.status = "completed";
      renderAppointmentsTable();
      renderAppointmentDetail(appt);
    });

    document.getElementById("btnPrintSchedule")?.addEventListener("click", () => {
      alert("Demo: printing today's schedule.");
    });
  }

  if (appointmentsTableBody) {
    renderAppointmentsTable();

    appointmentsStatusFilter?.addEventListener("change", () => {
      appointmentStatusFilter = appointmentsStatusFilter.value;
      renderAppointmentsTable();
    });

    viewToggleButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        viewToggleButtons.forEach((b) => b.classList.remove("chip--active"));
        btn.classList.add("chip--active");
        alert(
          `Demo: ${btn.dataset.view} view is just a visual toggle for now.`
        );
      });
    });
  }

  if (btnNewAppointment) {
    btnNewAppointment.addEventListener("click", () => {
      alert("Demo: open New Appointment modal.");
    });
  }

  // ========== PRESCRIPTIONS TAB ==========
  const prescriptionsTableBody = document.getElementById(
    "prescriptionsTableBody"
  );
  const prescriptionsSearchInput = document.getElementById(
    "prescriptionsSearchInput"
  );
  const prescriptionsStatusFilter = document.getElementById(
    "prescriptionsStatusFilter"
  );
  const prescriptionDetailTitle = document.getElementById(
    "prescriptionDetailTitle"
  );
  const prescriptionDetailSubtitle = document.getElementById(
    "prescriptionDetailSubtitle"
  );
  const prescriptionDetailBody = document.getElementById(
    "prescriptionDetailBody"
  );
  const btnNewPrescription = document.getElementById("btnNewPrescription");

  let prescriptionsFilterStatus = "all";

  function renderPrescriptionsTable() {
    if (!prescriptionsTableBody) return;
    prescriptionsTableBody.innerHTML = "";

    const query = (prescriptionsSearchInput?.value || "")
      .trim()
      .toLowerCase();

    prescriptions
      .filter((rx) => {
        if (
          prescriptionsFilterStatus !== "all" &&
          rx.status !== prescriptionsFilterStatus
        ) {
          return false;
        }
        if (!query) return true;
        const patient = getPatientById(rx.patientId);
        const patientName = patient ? patient.name.toLowerCase() : "";
        return (
          rx.medication.toLowerCase().includes(query) ||
          patientName.includes(query)
        );
      })
      .forEach((rx) => {
        const patient = getPatientById(rx.patientId);
        const tr = document.createElement("tr");
        tr.dataset.prescriptionId = rx.id;

        tr.innerHTML = `
          <td>${patient ? patient.name : "Unknown"}</td>
          <td>${rx.medication}</td>
          <td>${rx.dosage}</td>
          <td>${rx.frequency}</td>
          <td>${rx.startDate} → ${rx.endDate}</td>
          <td><span class="badge badge--${rx.status}">${rx.status}</span></td>
          <td>
            <button class="link-sm js-renew">Renew</button>
            <button class="link-sm js-stop">Stop</button>
          </td>
        `;

        tr.addEventListener("click", (e) => {
          if (e.target.closest("button")) return;
          document
            .querySelectorAll(".prescriptions-table tr.active")
            .forEach((row) => row.classList.remove("active"));
          tr.classList.add("active");
          renderPrescriptionDetail(rx);
        });

        tr.querySelector(".js-renew")?.addEventListener("click", (e) => {
          e.stopPropagation();
          alert(`Demo: renewing prescription ${rx.id}.`);
        });

        tr.querySelector(".js-stop")?.addEventListener("click", (e) => {
          e.stopPropagation();
          rx.status = "stopped";
          renderPrescriptionsTable();
        });

        prescriptionsTableBody.appendChild(tr);
      });
  }

  function renderPrescriptionDetail(rx) {
    if (!prescriptionDetailBody) return;
    const patient = getPatientById(rx.patientId);

    if (prescriptionDetailTitle)
      prescriptionDetailTitle.textContent = `${rx.medication} — ${
        patient ? patient.name : "Unknown"
      }`;
    if (prescriptionDetailSubtitle)
      prescriptionDetailSubtitle.textContent = `${rx.dosage} · ${rx.frequency} · Status: ${rx.status}`;

    prescriptionDetailBody.innerHTML = `
      <section class="prescription-section">
        <h3>Instructions</h3>
        <p>${rx.instructions}</p>
      </section>
      <section class="prescription-section">
        <h3>Dates & Refills</h3>
        <p>Start: ${rx.startDate}<br/>End: ${rx.endDate}<br/>Refills remaining: ${
      rx.refills
    }</p>
      </section>
      <section class="prescription-section">
        <h3>Actions</h3>
        <button class="btn btn--primary btn--small" id="btnRenew3Months">
          Renew for 3 months
        </button>
        <button class="btn btn--ghost btn--small" id="btnPrintRx">
          Print prescription
        </button>
        <button class="btn btn--ghost btn--small" id="btnAddMedNote">
          Add note about medication
        </button>
      </section>
    `;

    document.getElementById("btnRenew3Months")?.addEventListener("click", () => {
      alert("Demo: renewing for 3 months.");
    });

    document.getElementById("btnPrintRx")?.addEventListener("click", () => {
      alert("Demo: print prescription.");
    });

    document.getElementById("btnAddMedNote")?.addEventListener("click", () => {
      alert("Demo: add medication note.");
    });
  }

  if (prescriptionsTableBody) {
    renderPrescriptionsTable();

    prescriptionsSearchInput?.addEventListener("input", () => {
      renderPrescriptionsTable();
    });

    prescriptionsStatusFilter?.addEventListener("change", () => {
      prescriptionsFilterStatus = prescriptionsStatusFilter.value;
      renderPrescriptionsTable();
    });
  }

  if (btnNewPrescription) {
    btnNewPrescription.addEventListener("click", () => {
      alert("Demo: open New Prescription modal.");
    });
  }

  // ========== DOCTOR PROFILE TAB ==========
  const doctorProfileBody = document.getElementById("doctorProfileBody");
  const btnEditDoctorProfile = document.getElementById("btnEditDoctorProfile");
  const doctorGreeting = document.getElementById("doctorGreeting");
  const doctorSubtitle = document.getElementById("doctorSubtitle");

  function renderDoctorHeader() {
    if (doctorGreeting)
      doctorGreeting.textContent = `Good morning, ${doctorProfile.name}!`;
    if (doctorSubtitle)
      doctorSubtitle.textContent = `You have ${appointments.length} appointments today.`;
  }

  function renderDoctorProfile() {
    if (!doctorProfileBody) return;

    const initials = doctorProfile.name
      .split(" ")
      .map((n) => n[0])
      .join("");

    doctorProfileBody.innerHTML = `
      <div class="profile-header">
        <div class="profile-avatar-large">
          <span>${initials}</span>
        </div>
        <div class="profile-header-text">
          <div class="profile-name">${doctorProfile.name}</div>
          <div class="profile-role">${doctorProfile.role}</div>
          <div class="profile-speciality">${doctorProfile.speciality}</div>
          <div class="muted tiny">${doctorProfile.clinic}</div>
        </div>
      </div>

      <div class="profile-grid">
        <section class="profile-section">
          <h3>Contact</h3>
          <div class="profile-two-col">
            <div>
              <div class="profile-label">Email</div>
              <div>${doctorProfile.email}</div>
            </div>
            <div>
              <div class="profile-label">Phone</div>
              <div>${doctorProfile.phone}</div>
            </div>
          </div>
        </section>

        <section class="profile-section">
          <h3>Professional</h3>
          <div class="profile-two-col">
            <div>
              <div class="profile-label">Registration no.</div>
              <div>${doctorProfile.regNo}</div>
            </div>
            <div>
              <div class="profile-label">Experience</div>
              <div>${doctorProfile.experienceYears}+ years</div>
            </div>
            <div>
              <div class="profile-label">Languages</div>
              <div>${doctorProfile.languages.join(", ")}</div>
            </div>
          </div>
        </section>

        <section class="profile-section">
          <h3>Clinic schedule</h3>
          <ul class="profile-schedule-list">
            ${doctorProfile.visitingHours
              .map(
                (slot) =>
                  `<li><strong>${slot.day}</strong> — ${slot.time}</li>`
              )
              .join("")}
          </ul>
        </section>

        <section class="profile-section">
          <h3>About</h3>
          <p>${doctorProfile.about}</p>
        </section>
      </div>
    `;
  }

  if (doctorProfileBody) {
    renderDoctorHeader();
    renderDoctorProfile();
  }

  if (btnEditDoctorProfile) {
    btnEditDoctorProfile.addEventListener("click", () => {
      alert(
        "Demo: In a real system you could edit the doctor's profile details here."
      );
    });
  }
});
