/* ==========================================================================
   NETRADARPAN HOSPITAL - MASTER JAVASCRIPT ENGINE
   Includes: Appointment Booking Wizard, Doctor Catalog, Patient Portal,
   Feedback System, Admin Queue Manager, Toast Alerts
   ========================================================================== */

// 1. DOCTOR DATA CATALOG
const DOCTORS = [
    {
        id: 'doc-1',
        name: 'Dr. Manas Kr. Pal',
        specialty: 'Cataract',
        deptLabel: 'Consultant Eye Surgeon',
        degrees: 'M.B.B.S, M.S. (Hons), D.O. (RIO), M.S. (OPHTHAL)',
        regNo: '59053 (WBMC)',
        email: '',
        branch: 'Bhadreswar Main Hospital',
        timing: 'Mon, Wed, Fri (10:00 AM – 2:00 PM)',
        slots: ['10:00 AM', '10:45 AM', '11:30 AM', '12:15 PM', '01:00 PM', '01:30 PM']
    },
    {
        id: 'doc-2',
        name: 'Dr. Avijit Roy',
        specialty: 'Cataract',
        deptLabel: 'Consultant Eye Surgeon',
        degrees: 'M.B.B.S. (NRS), M.S. (Eye) NRS',
        regNo: 'WBMC 76886',
        email: 'dravijitroy1960@gmail.com',
        branch: 'Bhadreswar Main Hospital',
        timing: 'Tue, Thu, Sat (10:30 AM – 3:30 PM)',
        slots: ['10:30 AM', '11:15 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM']
    },
    {
        id: 'doc-3',
        name: 'Dr. Anamika Paul',
        specialty: 'Glaucoma',
        deptLabel: 'Fellow in Glaucoma (Aravind Eye Hospital, Chennai)',
        degrees: 'M.B.B.S (SSKM), M.S (R.I.O)',
        regNo: '80637 (WBMC)',
        email: '',
        branch: 'Bhadreswar Main Hospital',
        timing: 'Every Thursday (6:00 PM – 8:00 PM) (By Appointment)',
        slots: ['06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM']
    },
    {
        id: 'doc-4',
        name: 'Dr. Q Shehnaz Waheed',
        specialty: 'Cornea',
        deptLabel: 'Eye Surgeon',
        degrees: 'M.B.B.S, M.S (K.O.L)',
        regNo: 'WBMC 67494',
        email: '',
        branch: 'Bhadreswar Main Hospital',
        timing: 'Mon, Wed, Fri (2:00 PM – 6:00 PM)',
        slots: ['02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM']
    },
    {
        id: 'doc-5',
        name: 'Dr. Souvik Ganguly',
        specialty: 'Retina',
        deptLabel: 'Consultant Eye Surgeon & Retina Specialist',
        degrees: 'M.B.B.S, M.S. (OPHTH)',
        regNo: '75148 (WBMC)',
        email: '',
        branch: 'Bhadreswar Main Hospital',
        timing: 'Wed: 12:00 PM – 2:00 PM | Fri, Sat: 7:00 PM – 9:00 PM',
        slots: ['12:00 PM', '01:00 PM', '07:00 PM', '07:45 PM', '08:30 PM']
    },
    {
        id: 'doc-6',
        name: 'Dr. Abhisek Chaubey',
        specialty: 'Pediatric',
        deptLabel: 'Consultant Ophthalmologist',
        degrees: 'MBBS, MS',
        regNo: 'WBMC 67997',
        email: '',
        branch: 'Bhadreswar Main Hospital',
        timing: 'Every Thursday (11:00 AM – 4:00 PM)',
        slots: ['11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM']
    }
];

// 2. APPOINTMENTS STORE (LocalStorage)
let appointments = JSON.parse(localStorage.getItem('netradarpan_appointments')) || [
    {
        reference: 'ND-2026-10482',
        patientName: 'Subhas Chandra Das',
        patientPhone: '9830011223',
        patientAge: 62,
        patientGender: 'Male',
        doctorName: 'Dr. Manas Kr. Pal',
        specialty: 'Cataract',
        appointmentDate: '2026-09-02',
        slotTime: '11:30 AM',
        branch: '1, Jagadhatripally, Bhadreswar',
        status: 'confirmed',
        symptoms: 'Blurred vision in right eye for 3 months',
        createdDate: '2026-08-30'
    },
    {
        reference: 'ND-2026-10483',
        patientName: 'Ananya Mukherjee',
        patientPhone: '9874561230',
        patientAge: 45,
        patientGender: 'Female',
        doctorName: 'Dr. Souvik Ganguly',
        specialty: 'Retina',
        appointmentDate: '2026-09-04',
        slotTime: '07:00 PM',
        branch: '1, Jagadhatripally, Bhadreswar',
        status: 'pending',
        symptoms: 'Diabetic eye screening & laser checkup',
        createdDate: '2026-08-30'
    }
];

function saveAppointments() {
    localStorage.setItem('netradarpan_appointments', JSON.stringify(appointments));
    updateAdminStats();
}

// 3. FEEDBACK DATA STORE (LocalStorage)
let patientFeedbacks = JSON.parse(localStorage.getItem('netradarpan_feedbacks')) || [
    {
        name: 'Bijoy Kumar Ghosh',
        rating: 5,
        service: 'Cataract Phaco Surgery',
        comment: 'I had my cataract surgery performed under Dr. Manas Kr. Pal. The painless micro-incision procedure and caring nursing staff at Bhadreswar gave me crystal clear vision back. Highly recommended!',
        date: '2026-08-15'
    },
    {
        name: 'Sunita Banerjee',
        rating: 5,
        service: 'Ayushman Bharat Beneficiary',
        comment: 'Completely cashless and dignified eye treatment under the Ayushman Bharat PM-JAY desk. From registration to post-op drops, everything was handled smoothly.',
        date: '2026-08-10'
    },
    {
        name: 'Pranab Mukherjee',
        rating: 5,
        service: 'Glaucoma Diagnostics',
        comment: 'Very advanced computerized perimetry and IOP machines. The doctors take time to explain reports in simple terms.',
        date: '2026-07-28'
    }
];

function saveFeedbacks() {
    localStorage.setItem('netradarpan_feedbacks', JSON.stringify(patientFeedbacks));
}

// 4. FEEDBACK RENDERING & SUBMISSION
function renderFeedbacks() {
    const container = document.getElementById('feedbackGridContainer');
    if (!container) return;

    container.innerHTML = patientFeedbacks.map(f => {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            starsHtml += `<i class="fa-solid fa-star ${i <= f.rating ? 'active' : ''}" style="color: ${i <= f.rating ? 'var(--brand-amber)' : '#cbd5e1'};"></i> `;
        }
        const initials = f.name.split(' ').map(n => n[0]).join('').substring(0, 2);

        return `
            <div class="feedback-card">
                <div>
                    <div class="feedback-stars">${starsHtml}</div>
                    <p class="feedback-text">“${f.comment}”</p>
                </div>
                <div class="feedback-author">
                    <div class="feedback-avatar">${initials}</div>
                    <div>
                        <div style="font-weight: 700; font-size: 14.5px; color: var(--brand-dark);">${f.name}</div>
                        <div style="font-size: 12px; color: var(--brand-crimson); font-weight: 600;">${f.service} • Verified Patient</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

let selectedRating = 5;
function setStarRating(rating) {
    selectedRating = rating;
    const stars = document.querySelectorAll('.star-rating-select .fa-star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
            star.style.color = 'var(--brand-amber)';
        } else {
            star.classList.remove('active');
            star.style.color = '#cbd5e1';
        }
    });
}

function handleFeedbackSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('fbName').value.trim();
    const service = document.getElementById('fbService').value;
    const comment = document.getElementById('fbComment').value.trim();

    if (!name || !comment) {
        showToast('Please enter your name and feedback comments.', 'error');
        return;
    }

    const newFeedback = {
        name,
        service,
        comment,
        rating: selectedRating,
        date: new Date().toISOString().split('T')[0]
    };

    patientFeedbacks.unshift(newFeedback);
    saveFeedbacks();
    renderFeedbacks();
    document.getElementById('feedbackForm').reset();
    setStarRating(5);
    showToast('Thank you! Your feedback has been published.', 'success');
}

// 5. APPOINTMENT BOOKING WIZARD LOGIC
function openBookingWizard(prefilledDoctorId = null, prefilledSpecialty = null) {
    closeModals();
    const modal = document.getElementById('bookingModal');
    if (!modal) return;
    modal.classList.add('active');

    // Default date: tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        dateInput.value = tomorrow.toISOString().split('T')[0];
        dateInput.min = new Date().toISOString().split('T')[0];
    }

    if (prefilledSpecialty) {
        const specSelect = document.getElementById('bookingSpecialty');
        if (specSelect) specSelect.value = prefilledSpecialty;
    }

    updateDoctorDropdown();

    if (prefilledDoctorId) {
        const docSelect = document.getElementById('bookingDoctor');
        if (docSelect) docSelect.value = prefilledDoctorId;
    }

    goToStep(1);
}

function updateDoctorDropdown() {
    const specialtyEl = document.getElementById('bookingSpecialty');
    const docSelect = document.getElementById('bookingDoctor');
    if (!specialtyEl || !docSelect) return;

    const specialty = specialtyEl.value;
    const matchedDocs = specialty === 'General' 
        ? DOCTORS 
        : DOCTORS.filter(d => d.specialty === specialty);

    docSelect.innerHTML = (matchedDocs.length > 0 ? matchedDocs : DOCTORS).map(d => `
        <option value="${d.id}">${d.name} (${d.deptLabel})</option>
    `).join('');

    generateAvailableSlots();
}

function generateAvailableSlots() {
    const docSelect = document.getElementById('bookingDoctor');
    const dateInput = document.getElementById('bookingDate');
    const slotContainer = document.getElementById('slotContainer');
    if (!docSelect || !dateInput || !slotContainer) return;

    const docId = docSelect.value;
    const selectedDate = dateInput.value;
    const doc = DOCTORS.find(d => d.id === docId) || DOCTORS[0];

    const bookedSlots = appointments
        .filter(a => a.doctorName === doc.name && a.appointmentDate === selectedDate && a.status !== 'cancelled')
        .map(a => a.slotTime);

    slotContainer.innerHTML = doc.slots.map(slot => {
        const isBooked = bookedSlots.includes(slot);
        return `
            <button type="button" 
                    class="slot-btn ${isBooked ? 'disabled' : ''}" 
                    ${isBooked ? 'disabled' : ''}
                    onclick="selectSlot('${slot}', this)">
                ${slot} ${isBooked ? '(Full)' : ''}
            </button>
        `;
    }).join('');

    const sel = document.getElementById('selectedSlot');
    if (sel) sel.value = '';
}

function selectSlot(slot, btn) {
    document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    const sel = document.getElementById('selectedSlot');
    if (sel) sel.value = slot;
}

function goToStep(step) {
    for (let i = 1; i <= 4; i++) {
        const el = document.getElementById(`wizardStep${i}`);
        const ind = document.getElementById(`stepIndicator${i}`);
        if (el) el.style.display = i === step ? 'block' : 'none';
        if (ind) {
            ind.classList.remove('active');
            if (i === step) ind.classList.add('active');
            if (i < step) ind.classList.add('completed');
        }
    }
}

function validateStep2AndProceed() {
    const slot = document.getElementById('selectedSlot')?.value;
    const date = document.getElementById('bookingDate')?.value;

    if (!date) {
        showToast('Please select an appointment date.', 'error');
        return;
    }
    if (!slot) {
        showToast('Please select an available consultation slot.', 'error');
        return;
    }
    goToStep(3);
}

function confirmAppointmentBooking() {
    const name = document.getElementById('patientName')?.value.trim();
    const phone = document.getElementById('patientPhone')?.value.trim();
    const age = document.getElementById('patientAge')?.value.trim();
    const gender = document.getElementById('patientGender')?.value;
    const symptoms = document.getElementById('patientSymptoms')?.value.trim();
    const branch = document.getElementById('bookingBranch')?.value || '1, Jagadhatripally, Bhadreswar';
    const specialty = document.getElementById('bookingSpecialty')?.value;
    const doctorId = document.getElementById('bookingDoctor')?.value;
    const date = document.getElementById('bookingDate')?.value;
    const slot = document.getElementById('selectedSlot')?.value;

    if (!name || !phone || !age) {
        showToast('Please enter all mandatory patient details.', 'error');
        return;
    }
    if (phone.length < 10) {
        showToast('Please enter a valid 10-digit phone number.', 'error');
        return;
    }

    const doc = DOCTORS.find(d => d.id === doctorId);
    const refCode = `ND-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newAppointment = {
        reference: refCode,
        patientName: name,
        patientPhone: phone,
        patientAge: parseInt(age, 10),
        patientGender: gender,
        doctorName: doc ? doc.name : 'Consultant Ophthalmologist',
        specialty: specialty,
        appointmentDate: date,
        slotTime: slot,
        branch: branch,
        status: 'confirmed',
        symptoms: symptoms || 'General OPD Consult',
        createdDate: new Date().toISOString().split('T')[0]
    };

    appointments.unshift(newAppointment);
    saveAppointments();

    // Populate Printable Slip
    const refEl = document.getElementById('slipRefCode');
    if (refEl) refEl.innerText = refCode;
    const pName = document.getElementById('slipPatientName');
    if (pName) pName.innerText = name;
    const pPhone = document.getElementById('slipPatientPhone');
    if (pPhone) pPhone.innerText = phone;
    const pDoc = document.getElementById('slipDoctorName');
    if (pDoc) pDoc.innerText = newAppointment.doctorName;
    const pSpec = document.getElementById('slipSpecialty');
    if (pSpec) pSpec.innerText = specialty;
    const pDt = document.getElementById('slipDateTime');
    if (pDt) pDt.innerText = `${date} at ${slot}`;
    const pBr = document.getElementById('slipBranch');
    if (pBr) pBr.innerText = branch;

    goToStep(4);
    showToast('Appointment confirmed! Registration slip ready.', 'success');
}

// 6. PATIENT PORTAL SEARCH
function openPatientPortal() {
    closeModals();
    const modal = document.getElementById('portalModal');
    if (modal) {
        modal.classList.add('active');
        searchPatientAppointments();
    } else {
        window.location.href = 'patient-portal.html#portal-appointments';
    }
}

function searchPatientAppointments() {
    const input = document.getElementById('lookupQuery');
    const container = document.getElementById('patientResultsContainer');
    if (!container) return;

    const query = input ? input.value.trim().toLowerCase() : '';
    let matched = appointments;

    if (query) {
        matched = appointments.filter(a => 
            a.patientPhone.includes(query) || 
            a.reference.toLowerCase().includes(query) ||
            a.patientName.toLowerCase().includes(query)
        );
    }

    if (matched.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 24px; color: var(--text-muted);">
                <i class="fa-solid fa-circle-exclamation" style="font-size: 24px; color: var(--brand-amber); margin-bottom: 8px;"></i>
                <p>No appointment records found for "${query}".</p>
            </div>
        `;
        return;
    }

    container.innerHTML = matched.map(a => `
        <div style="border: 1px solid var(--brand-border); border-radius: var(--radius-sm); padding: 16px; margin-bottom: 12px; background: white;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-weight: 700; color: var(--brand-primary); font-family: monospace;">${a.reference}</span>
                <span class="status-badge" style="padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: ${a.status === 'confirmed' ? '#d1fae5' : a.status === 'cancelled' ? '#fee2e2' : '#fef3c7'}; color: ${a.status === 'confirmed' ? '#065f46' : a.status === 'cancelled' ? '#991b1b' : '#92400e'};">${a.status}</span>
            </div>
            <div style="font-size: 14px; font-weight: 700; margin-bottom: 4px;">${a.patientName} (${a.patientGender}, ${a.patientAge} yrs)</div>
            <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">
                <i class="fa-solid fa-user-doctor"></i> ${a.doctorName} • ${a.specialty}
            </div>
            <div style="font-size: 13px; color: var(--brand-primary); font-weight: 600;">
                <i class="fa-solid fa-clock"></i> ${a.appointmentDate} at ${a.slotTime} (${a.branch})
            </div>
            <div style="display: flex; gap: 8px; margin-top: 12px;">
                <button class="btn btn-outline" style="padding: 4px 10px; font-size: 12px;" onclick="printSingleSlip('${a.reference}')">
                    <i class="fa-solid fa-print"></i> View Slip
                </button>
                ${a.status !== 'cancelled' ? `
                    <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 12px; color: var(--danger);" onclick="cancelAppointment('${a.reference}')">
                        <i class="fa-solid fa-ban"></i> Cancel
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function cancelAppointment(ref) {
    if (confirm(`Are you sure you want to cancel appointment ${ref}?`)) {
        const app = appointments.find(a => a.reference === ref);
        if (app) {
            app.status = 'cancelled';
            saveAppointments();
            searchPatientAppointments();
            showToast(`Appointment ${ref} cancelled.`, 'success');
        }
    }
}

function printSingleSlip(ref) {
    const a = appointments.find(x => x.reference === ref);
    if (!a) return;
    openBookingWizard();
    
    document.getElementById('slipRefCode').innerText = a.reference;
    document.getElementById('slipPatientName').innerText = a.patientName;
    document.getElementById('slipPatientPhone').innerText = a.patientPhone;
    document.getElementById('slipDoctorName').innerText = a.doctorName;
    document.getElementById('slipSpecialty').innerText = a.specialty;
    document.getElementById('slipDateTime').innerText = `${a.appointmentDate} at ${a.slotTime}`;
    document.getElementById('slipBranch').innerText = a.branch;

    goToStep(4);
}

// 7. ADMIN DASHBOARD (PIN: admin123)
function openAdminModal() {
    closeModals();
    const modal = document.getElementById('adminModal');
    if (modal) modal.classList.add('active');
}

function authenticateAdmin() {
    const pin = document.getElementById('adminPin')?.value;
    if (pin === 'admin123' || pin === 'admin') {
        document.getElementById('adminLoginSection').style.display = 'none';
        document.getElementById('adminDashboardSection').style.display = 'block';
        renderAdminAppointments();
        updateAdminStats();
    } else {
        showToast('Invalid PIN. Use "admin123" for demo.', 'error');
    }
}

function logoutAdmin() {
    document.getElementById('adminLoginSection').style.display = 'block';
    document.getElementById('adminDashboardSection').style.display = 'none';
    if (document.getElementById('adminPin')) document.getElementById('adminPin').value = '';
}

function updateAdminStats() {
    const total = appointments.length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const pending = appointments.filter(a => a.status === 'pending').length;

    const elTotal = document.getElementById('statTotalBookings');
    const elConf = document.getElementById('statConfirmed');
    const elPend = document.getElementById('statPending');

    if (elTotal) elTotal.innerText = total;
    if (elConf) elConf.innerText = confirmed;
    if (elPend) elPend.innerText = pending;
}

function renderAdminAppointments() {
    const body = document.getElementById('adminAppointmentsBody');
    if (!body) return;

    body.innerHTML = appointments.map(a => `
        <tr>
            <td style="font-weight: 700; font-family: monospace; color: var(--brand-primary);">${a.reference}</td>
            <td>
                <strong>${a.patientName}</strong><br>
                <span style="font-size: 11px; color: var(--text-muted);">${a.patientPhone}</span>
            </td>
            <td>${a.doctorName}</td>
            <td>${a.appointmentDate}<br><span style="font-size: 11px; color: var(--text-muted);">${a.slotTime}</span></td>
            <td><span style="padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: ${a.status === 'confirmed' ? '#d1fae5' : a.status === 'cancelled' ? '#fee2e2' : '#fef3c7'}; color: ${a.status === 'confirmed' ? '#065f46' : a.status === 'cancelled' ? '#991b1b' : '#92400e'};">${a.status}</span></td>
            <td>
                <select onchange="updateAppointmentStatus('${a.reference}', this.value)" style="padding: 4px; font-size: 12px; border-radius: 4px; border: 1px solid var(--brand-border);">
                    <option value="confirmed" ${a.status === 'confirmed' ? 'selected' : ''}>Confirm</option>
                    <option value="completed" ${a.status === 'completed' ? 'selected' : ''}>Complete</option>
                    <option value="pending" ${a.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="cancelled" ${a.status === 'cancelled' ? 'selected' : ''}>Cancel</option>
                </select>
            </td>
        </tr>
    `).join('');
}

function updateAppointmentStatus(ref, newStatus) {
    const app = appointments.find(a => a.reference === ref);
    if (app) {
        app.status = newStatus;
        saveAppointments();
        renderAdminAppointments();
        showToast(`Appointment ${ref} updated to ${newStatus}.`, 'success');
    }
}

function exportAppointmentsCSV() {
    let csv = 'Reference,Patient Name,Phone,Age,Gender,Doctor,Specialty,Date,Slot,Status\n';
    appointments.forEach(a => {
        csv += `"${a.reference}","${a.patientName}","${a.patientPhone}",${a.patientAge},"${a.patientGender}","${a.doctorName}","${a.specialty}","${a.appointmentDate}","${a.slotTime}","${a.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Netradarpan_Appointments_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
}

// 8. DOCTOR DIRECTORY
function renderDoctors(filter = 'all') {
    const container = document.getElementById('doctorContainer');
    if (!container) return;

    const filtered = filter === 'all' 
        ? DOCTORS 
        : DOCTORS.filter(d => d.specialty.toLowerCase() === filter.toLowerCase());

    container.innerHTML = filtered.map(doc => `
        <div class="doctor-card">
            <div class="doctor-header">
                <div class="doctor-avatar">
                    <i class="fa-solid fa-user-doctor"></i>
                </div>
                <h4>${doc.name}</h4>
                <span class="doctor-dept">${doc.deptLabel}</span>
            </div>
            <div class="doctor-info">
                <div class="doctor-degrees">${doc.degrees}</div>
                ${doc.regNo ? `
                    <div style="border-top: 1px solid var(--brand-border); padding-top: 10px; font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
                        <i class="fa-solid fa-id-card" style="color: var(--brand-crimson); margin-right: 6px;"></i> Reg. No: <strong style="color: var(--text-heading);">${doc.regNo}</strong>
                    </div>
                ` : '<div style="border-top: 1px solid var(--brand-border); padding-top: 10px;"></div>'}
                ${doc.email ? `
                    <div style="font-size: 11.5px; color: var(--brand-primary); margin-bottom: 8px; word-break: break-all;">
                        <i class="fa-solid fa-envelope" style="color: var(--brand-amber); margin-right: 6px;"></i> <a href="mailto:${doc.email}" style="color: inherit; text-decoration: none; font-weight: 600;">${doc.email}</a>
                    </div>
                ` : ''}
                <div style="font-size: 12px; color: var(--brand-primary); background: var(--brand-light); padding: 8px 10px; border-radius: 6px; margin-bottom: 14px; font-weight: 600; line-height: 1.45;">
                    <i class="fa-solid fa-calendar-days" style="margin-right: 5px;"></i> ${doc.timing}
                </div>
                <button class="btn btn-primary" onclick="openBookingWizard('${doc.id}', '${doc.specialty}')" style="width: 100%;">
                    <i class="fa-solid fa-calendar-check"></i> Book OPD Slot
                </button>
            </div>
        </div>
    `).join('');
}

function filterDoctors(category, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderDoctors(category);
}

// 9. GENERAL UTILITIES
function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        closeModals();
    }
};

function toggleMobileNav() {
    const nav = document.getElementById('navLinks');
    if (nav) nav.classList.toggle('show');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toastNotification');
    const msgSpan = document.getElementById('toastMessage');
    if (!toast || !msgSpan) return;

    toast.className = `toast ${type}`;
    msgSpan.innerText = message;
    toast.style.display = 'flex';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3500);
}

function handleInquirySubmit(e) {
    e.preventDefault();
    showToast('Thank you! Your query has been sent to our Bhadreswar care desk.', 'success');
    e.target.reset();
}

// DOM INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    renderDoctors('all');
    renderFeedbacks();
    updateAdminStats();

    // Mobile dropdown toggle on click for touch devices
    document.querySelectorAll('.nav-item-dropdown > a').forEach(dropdownAnchor => {
        dropdownAnchor.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                // If clicked on arrow or in mobile view, toggle menu if not already open
                const parent = this.parentElement;
                if (!parent.classList.contains('mobile-open')) {
                    e.preventDefault();
                    parent.classList.toggle('mobile-open');
                }
            }
        });
    });

    // About Us Subnav active pill scroll spy
    const subnavLinks = document.querySelectorAll('.about-subnav-links a');
    if (subnavLinks.length > 0) {
        const sections = Array.from(subnavLinks).map(link => {
            const id = link.getAttribute('href').replace('#', '');
            return document.getElementById(id);
        }).filter(Boolean);

        window.addEventListener('scroll', () => {
            let current = '';
            const scrollPos = window.scrollY + 140;

            sections.forEach(section => {
                if (section && section.offsetTop <= scrollPos) {
                    current = section.getAttribute('id');
                }
            });

            if (current) {
                subnavLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${current}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
});
