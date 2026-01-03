// patient.js (DB/API) - REPLACE YOUR FULL FILE WITH THIS
document.addEventListener("DOMContentLoaded", () => {
  console.log("patient.js (DB/API)");

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

  // ===== Auth guard =====
  async function requirePatient() {
    const me = await apiGET("api/me.php");
    if (!me || me.role !== "patient") {
      window.location.href = "index.html";
      return null;
    }
    return me;
  }

  // ===== Navigation (your existing pattern) =====
  const navButtons = document.querySelectorAll(".dash-nav__item[data-p-view]");
  const views = document.querySelectorAll(".p-view");

  function showSection(name) {
    views.forEach((v) => {
      const sectionName = v.getAttribute("data-p-section");
      v.classList.toggle("is-hidden", sectionName !== name);
    });

    navButtons.forEach((btn) => {
      btn.classList.toggle("dash-nav__item--active", btn.dataset.pView === name);
    });
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.pView;
      if (target) showSection(target);
    });
  });

  document.querySelectorAll("[data-p-view-link]").forEach((el) => {
    el.addEventListener("click", () => {
      const target = el.getAttribute("data-p-view-link");
      if (target) showSection(target);
    });
  });

  showSection("dashboard");

  // ===== Sign out =====
  document.getElementById("btnSignOutPatient")?.addEventListener("click", async () => {
    try { await apiPOST("api/auth_logout.php", {}); } catch (_) {}
    window.location.href = "index.html";
  });

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (m) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[m]));

  // ===== Dashboard elements =====
  const welcomeTitle = document.querySelector(".dash-main__title");
  const upcomingList = document.querySelector(".list--appointments");
  const todaysMedsList = document.querySelector(".list--meds");

  // ===== Booking elements =====
  const doctorSearchInput = document.querySelector(".appt-search input");
  const specialtySelect = document.querySelector(".appt-search select");
  const doctorGrid = document.querySelector(".appt-grid");

  // ===== Symptoms elements =====
  const symSaveBtn = document.querySelector(".sym-submit");
  const symSlider = document.querySelector(".sym-slider");
  const symDateInput = document.querySelector('input[type="date"]');
  const symTimeInput = document.querySelector('input[type="time"]');
  const symNotes = document.querySelector(".input--textarea");
  const symRecentList = document.querySelector(".sym-log-list");

  // ===== Medications elements =====
  const medScheduleList = document.querySelector(".med-schedule-list");
  const medStatsValues = document.querySelectorAll(".med-stat-value");
  const medTableBody = document.querySelector(".med-table tbody");

  // ===== Prescriptions elements (if you show it) =====
  const rxList = document.querySelector(".rx-list"); // optional if you have

  async function loadDashboard() {
    const dash = await apiGET("api/patient_dashboard.php");
    if (welcomeTitle) welcomeTitle.textContent = `Welcome back, ${dash.welcomeName || "Patient"}!`;

    if (upcomingList) {
      upcomingList.innerHTML = "";
      if (dash.nextAppointment) {
        const a = dash.nextAppointment;
        upcomingList.innerHTML = `
          <li class="list-item list-item--appointment">
            <div class="list-item__main">
              <span class="list-item__title">${esc(a.doctorName)}</span>
              <span class="list-item__subtitle">${esc(a.apptType)}</span>
            </div>
            <div class="list-item__meta">
              <span class="pill pill--soft-icon">📅 ${esc(a.apptDate)}</span>
              <span class="pill pill--soft-icon">⏰ ${esc(a.apptTime)}</span>
            </div>
          </li>
        `;
      } else {
        upcomingList.innerHTML = `<li class="muted small">No upcoming appointments.</li>`;
      }
    }

    // show a few meds from today schedule
    const meds = await apiGET("api/patient_medications.php");
    if (todaysMedsList) {
      todaysMedsList.innerHTML = "";
      meds.todaySchedule.slice(0, 3).forEach((d) => {
        const statusClass =
          d.doseStatus === "taken" ? "badge--success" :
          d.doseStatus === "missed" ? "badge--danger" : "badge--warning";
        const label =
          d.doseStatus === "taken" ? "taken" :
          d.doseStatus === "missed" ? "missed" : "pending";

        todaysMedsList.innerHTML += `
          <li class="list-item list-item--med">
            <div class="list-item__main">
              <span class="list-item__title">${esc(d.name)}</span>
              <span class="list-item__subtitle">${esc(d.dosage)} · ${esc(d.frequency)}</span>
            </div>
            <span class="badge ${statusClass}">${label}</span>
          </li>
        `;
      });
      if (!meds.todaySchedule.length) {
        todaysMedsList.innerHTML = `<li class="muted small">No medication doses scheduled today.</li>`;
      }
    }
  }

  async function loadDoctors() {
    if (!doctorGrid) return;

    const q = encodeURIComponent((doctorSearchInput?.value || "").trim());
    const speciality =
      specialtySelect?.value && specialtySelect.value !== "All Specialties"
        ? encodeURIComponent(specialtySelect.value)
        : "all";

    const doctors = await apiGET(`api/patient_doctors.php?q=${q}&speciality=${speciality}`);

    doctorGrid.innerHTML = "";
    doctors.forEach((d, idx) => {
      doctorGrid.innerHTML += `
        <article class="card appt-card">
          <div class="appt-card__main">
            <div class="appt-avatar ${idx % 2 === 0 ? "appt-avatar--img1" : "appt-avatar--img2"}"></div>
            <div>
              <h2 class="appt-name">${esc(d.name)}</h2>
              <p class="appt-spec">${esc(d.speciality)}</p>
              <p class="appt-meta">📍 ${esc(d.clinic || "—")} · 🧑‍⚕️ ${esc(d.experienceYears || "—")} yrs</p>
              <div style="display:flex; gap:.5rem; flex-wrap:wrap; margin-top:.5rem">
                <input class="input" type="date" data-date="${d.id}" />
                <input class="input" type="time" data-time="${d.id}" />
                <input class="input" placeholder="Reason" data-reason="${d.id}" />
              </div>
            </div>
          </div>
          <div class="appt-card__side">
            <button class="btn btn--primary btn--block" data-book="${d.id}">Book Appointment</button>
          </div>
        </article>
      `;
    });

    doctorGrid.querySelectorAll("[data-book]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const doctorId = btn.getAttribute("data-book");
        const date = doctorGrid.querySelector(`[data-date="${doctorId}"]`)?.value;
        const time = doctorGrid.querySelector(`[data-time="${doctorId}"]`)?.value;
        const reason = doctorGrid.querySelector(`[data-reason="${doctorId}"]`)?.value || "";

        try {
          await apiPOST("api/patient_appointment_create.php", {
            doctor_id: Number(doctorId),
            date,
            time,
            type: "Consultation",
            reason,
          });
          alert("Appointment booked ✅");
          await loadDashboard();
        } catch (e) {
          alert(e.message);
        }
      });
    });
  }

  async function loadSymptoms() {
    if (!symRecentList) return;
    const logs = await apiGET("api/patient_symptoms.php");

    symRecentList.innerHTML = "";
    logs.slice(0, 10).forEach((s, idx) => {
      const dot =
        idx % 3 === 0 ? "sym-log-dot--yellow" :
        idx % 3 === 1 ? "sym-log-dot--orange" :
        "sym-log-dot--red";

      symRecentList.innerHTML += `
        <li class="sym-log-item">
          <div class="sym-log-dot ${dot}"></div>
          <div>
            <strong>${esc(s.symptom)}</strong>
            <div class="muted small">Severity: ${esc(s.severity)}/10 · ${esc(s.occurredAt)}</div>
          </div>
        </li>
      `;
    });

    if (!logs.length) symRecentList.innerHTML = `<li class="muted small">No symptom logs yet.</li>`;
  }

  symSaveBtn?.addEventListener("click", async () => {
    try {
      const activeChip = document.querySelector(".sym-chip.is-active");
      const symptom = activeChip?.textContent?.trim() || "General";
      const severity = Number(symSlider?.value || 5);

      const date = symDateInput?.value;
      const time = symTimeInput?.value || "00:00";
      if (!date) return alert("Pick a date first");

      const occurred_at = `${date} ${time}:00`;
      const notes = symNotes?.value || "";

      await apiPOST("api/patient_symptom_create.php", { symptom, severity, occurred_at, notes });
      alert("Symptom saved ✅");
      await loadSymptoms();
      await loadDashboard();
    } catch (e) {
      alert(e.message);
    }
  });

  document.querySelectorAll(".sym-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".sym-chip").forEach(c => c.classList.remove("is-active"));
      chip.classList.add("is-active");
    });
  });

  async function loadMedications() {
    try {
      const data = await apiGET("api/patient_medications.php");
      console.log("Loaded medications:", data);

      if (medStatsValues.length >= 4) {
        const total = data.allMedications.length;
        const dueToday = data.todaySchedule.filter(d => d.doseStatus === "pending").length;
        const taken = data.todaySchedule.filter(d => d.doseStatus === "taken").length;
        const missed = data.todaySchedule.filter(d => d.doseStatus === "missed").length;
        medStatsValues[0].textContent = total;
        medStatsValues[1].textContent = dueToday;
        medStatsValues[2].textContent = taken;
        medStatsValues[3].textContent = missed;
      }

    if (medScheduleList) {
      medScheduleList.innerHTML = "";

      data.todaySchedule.forEach((d) => {
        // Determine pill color and action buttons based on status
        let pillClass = "med-pill--yellow";
        if (d.doseStatus === "taken") pillClass = "med-pill--green";
        if (d.doseStatus === "missed") pillClass = "med-pill--red";

        // Build action buttons based on current status
        let actionButtons = "";
        if (d.doseStatus === "pending") {
          actionButtons = `
            <button class="tag tag--success" data-dose="${d.doseId}" data-status="taken">✓ Taken</button>
            <button class="tag tag--danger" data-dose="${d.doseId}" data-status="missed">✗ Missed</button>
          `;
        } else if (d.doseStatus === "taken") {
          actionButtons = `
            <button class="tag tag--danger" data-dose="${d.doseId}" data-status="missed">✗ Missed</button>
            <button class="tag tag--secondary" data-dose="${d.doseId}" data-status="pending">↺ Reset</button>
          `;
        } else if (d.doseStatus === "missed") {
          actionButtons = `
            <button class="tag tag--success" data-dose="${d.doseId}" data-status="taken">✓ Taken</button>
            <button class="tag tag--secondary" data-dose="${d.doseId}" data-status="pending">↺ Reset</button>
          `;
        }

        medScheduleList.innerHTML += `
          <li class="med-schedule-item">
            <div class="med-schedule-main">
              <span class="med-pill ${pillClass}"></span>
              <div>
                <div><strong>${esc(d.name)}</strong></div>
                <div class="muted small">${esc(d.dosage)} · ${esc(d.frequency)} ${d.doseTime ? "· " + esc(d.doseTime) : ""}</div>
              </div>
            </div>
            <div class="med-actions">
              ${actionButtons}
            </div>
          </li>
        `;
      });

      if (!data.todaySchedule.length) {
        medScheduleList.innerHTML = `<li class="muted small">No doses scheduled today.</li>`;
      }

      // Attach event listeners to all action buttons
      medScheduleList.querySelectorAll("[data-dose]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const doseId = Number(btn.getAttribute("data-dose"));
          const status = btn.getAttribute("data-status");
          
          console.log(`Updating dose ${doseId} to status: ${status}`);
          
          // Disable button to prevent double-clicks
          btn.disabled = true;
          const originalText = btn.textContent;
          btn.textContent = "...";

          try {
            await apiPOST("api/patient_medication_update.php", {
              dose_id: doseId,
              status: status,
            });
            console.log("Medication updated successfully");
            // Reload to show updated status
            await loadMedications();
            await loadDashboard();
          } catch (e) {
            console.error("Error updating medication:", e);
            alert("Error updating medication: " + e.message);
            // Re-enable button on error
            btn.disabled = false;
            btn.textContent = originalText;
          }
        });
      });
    }

    // Render All Medications Table with status update buttons
    if (medTableBody) {
      medTableBody.innerHTML = "";
      
      // Get today's date to find today's doses
      const today = data.today || new Date().toISOString().split('T')[0];
      
      data.allMedications.forEach((med) => {
        // Find today's dose for this medication
        const todayDose = data.todaySchedule.find(d => d.medicationId === med.id);
        
        // Build status buttons based on today's dose status
        let statusButtons = '';
        if (todayDose) {
          const doseStatus = todayDose.doseStatus;
          if (doseStatus === "pending") {
            statusButtons = `
              <div class="med-actions">
                <button class="tag tag--success" data-med-dose="${todayDose.doseId}" data-med-status="taken">✓ Taken</button>
                <button class="tag tag--danger" data-med-dose="${todayDose.doseId}" data-med-status="missed">✗ Missed</button>
              </div>
            `;
          } else if (doseStatus === "taken") {
            statusButtons = `
              <div class="med-actions">
                <span class="badge badge--success">✓ Taken</span>
                <button class="tag tag--danger" data-med-dose="${todayDose.doseId}" data-med-status="missed">✗ Missed</button>
                <button class="tag tag--secondary" data-med-dose="${todayDose.doseId}" data-med-status="pending">↺</button>
              </div>
            `;
          } else if (doseStatus === "missed") {
            statusButtons = `
              <div class="med-actions">
                <button class="tag tag--success" data-med-dose="${todayDose.doseId}" data-med-status="taken">✓ Taken</button>
                <span class="badge badge--danger">✗ Missed</span>
                <button class="tag tag--secondary" data-med-dose="${todayDose.doseId}" data-med-status="pending">↺</button>
              </div>
            `;
          }
        } else {
          statusButtons = '<span class="muted small">No dose today</span>';
        }
        
        medTableBody.innerHTML += `
          <tr>
            <td>
              <strong>${esc(med.name)}</strong>
              ${med.instructions ? `<div class="muted tiny">${esc(med.instructions)}</div>` : ''}
            </td>
            <td>${esc(med.dosage)}</td>
            <td>${esc(med.frequency)}</td>
            <td>${esc(med.startDate || '—')} to ${esc(med.endDate || '—')}</td>
            <td>${statusButtons}</td>
          </tr>
        `;
      });

      if (!data.allMedications.length) {
        medTableBody.innerHTML = `<tr><td colspan="5" class="muted small" style="text-align:center;">No medications found.</td></tr>`;
      }

      // Attach event listeners for status update buttons in the table
      medTableBody.querySelectorAll("[data-med-dose]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const doseId = Number(btn.getAttribute("data-med-dose"));
          const status = btn.getAttribute("data-med-status");
          
          console.log(`Updating dose ${doseId} to status: ${status} from table`);
          
          btn.disabled = true;
          const originalText = btn.textContent;
          btn.textContent = "...";

          try {
            await apiPOST("api/patient_medication_update.php", {
              dose_id: doseId,
              status: status,
            });
            console.log("Medication status updated successfully from table");
            await loadMedications();
            await loadDashboard();
          } catch (e) {
            console.error("Error updating medication:", e);
            alert("Error updating medication: " + e.message);
            btn.disabled = false;
            btn.textContent = originalText;
          }
        });
      });
    }
  } catch (e) {
    console.error("Error loading medications:", e);
    alert("Error loading medications: " + e.message);
  }
}

  async function loadPrescriptionsOptional() {
    // Only works if you create a place to show it (optional)
    if (!rxList) return;
    const rx = await apiGET("api/patient_prescriptions.php");
    rxList.innerHTML = "";
    rx.forEach(r => {
      rxList.innerHTML += `
        <li class="list-item">
          <div class="list-item__main">
            <span class="list-item__title">${esc(r.name)}</span>
            <span class="list-item__subtitle">${esc(r.dosage || "—")} · ${esc(r.frequency || "—")} · ${esc(r.status)}</span>
          </div>
          <div class="muted small">${esc(r.doctorName || "Doctor")} · ${esc(r.startDate || "—")} → ${esc(r.endDate || "—")}</div>
        </li>
      `;
    });
    if (!rx.length) rxList.innerHTML = `<li class="muted small">No prescriptions yet.</li>`;
  }

  // ===== INIT =====
  (async () => {
    try {
      await requirePatient();
      await loadDashboard();
      await loadDoctors();
      await loadSymptoms();
      await loadMedications();
      await loadPrescriptionsOptional();
    } catch (e) {
      alert(e.message);
    }
  })();

  doctorSearchInput?.addEventListener("input", () => loadDoctors().catch((e) => alert(e.message)));
  specialtySelect?.addEventListener("change", () => loadDoctors().catch((e) => alert(e.message)));
});
