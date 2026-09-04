/* ==========================================================================
   NETRADARPAN HOSPITAL - MASTER JAVASCRIPT ENGINE (REST API / SUPABASE INTEGRATED)
   Includes: Appointment Booking Wizard, Doctor Catalog, Patient Portal,
   Feedback System, Dynamic Gallery, CSR Camps, Milestones & Admin Queue Manager
   ========================================================================== */

const API_BASE = '/api';

// GLOBAL DATA STORES
let DOCTORS = [];
let appointments = [];
let patientFeedbacks = [];
let galleryItems = [];
let achievementItems = [];
let campItems = [];

// ==========================================================================
// 1. DATA FETCHING & SYNCHRONIZATION WITH EXPRESS BACKEND
// ==========================================================================
async function fetchDoctors() {
    try {
        const res = await fetch(`${API_BASE}/doctors`);
        if (res.ok) {
            DOCTORS = await res.json();
            renderDoctors('all');
        }
    } catch (err) {
        console.error('Error loading doctors:', err);
    }
}

async function fetchAppointments(query = '') {
    try {
        const res = await fetch(`${API_BASE}/appointments${query ? '?query=' + encodeURIComponent(query) : ''}`);
        if (res.ok) {
            appointments = await res.json();
            // Standardize field names for UI
            appointments = appointments.map(a => ({
                reference: a.reference,
                patientName: a.patient_name || a.patientName,
                patientPhone: a.patient_phone || a.patientPhone,
                patientAge: a.patient_age || a.patientAge,
                patientGender: a.patient_gender || a.patientGender,
                doctorName: a.doctor_name || a.doctorName,
                specialty: a.specialty,
                appointmentDate: a.appointment_date || a.appointmentDate,
                slotTime: a.slot_time || a.slotTime,
                branch: a.branch,
                status: a.status,
                symptoms: a.symptoms,
                createdDate: a.created_at ? a.created_at.split('T')[0] : ''
            }));
            updateAdminStats();
            renderAdminAppointments();
        }
    } catch (err) {
        console.error('Error fetching appointments:', err);
    }
}

async function fetchFeedbacks() {
    try {
        const res = await fetch(`${API_BASE}/feedbacks`);
        if (res.ok) {
            patientFeedbacks = await res.json();
            renderFeedbacks();
        }
    } catch (err) {
        console.error('Error loading feedbacks:', err);
    }
}

async function fetchGallery() {
    try {
        const res = await fetch(`${API_BASE}/gallery`);
        if (res.ok) {
            const raw = await res.json();
            galleryItems = raw.map(g => ({
                id: g.id,
                title: g.title,
                category: g.category,
                imgUrl: g.img_url || g.imgUrl,
                description: g.description
            }));
            renderGallery();
            renderAdminGallery();
        }
    } catch (err) {
        console.error('Error loading gallery:', err);
    }
}

async function fetchAchievements() {
    try {
        const res = await fetch(`${API_BASE}/achievements`);
        if (res.ok) {
            const raw = await res.json();
            achievementItems = raw.map(a => ({
                id: a.id,
                title: a.title,
                number: a.number,
                description: a.description,
                driveUrl: a.drive_url || a.driveUrl
            }));
            renderAchievements();
            renderAdminAchievements();
        }
    } catch (err) {
        console.error('Error loading achievements:', err);
    }
}

async function fetchCamps() {
    try {
        const res = await fetch(`${API_BASE}/camps`);
        if (res.ok) {
            const raw = await res.json();
            campItems = raw.map(c => ({
                id: c.id,
                title: c.title,
                location: c.location,
                date: c.date,
                patients: c.patients,
                details: c.details,
                driveUrl: c.drive_url || c.driveUrl
            }));
            renderCamps();
            renderAdminCamps();
        }
    } catch (err) {
        console.error('Error loading camps:', err);
    }
}

// ==========================================================================
// 2. FEEDBACK RENDERING & SUBMISSION
// ==========================================================================
function renderFeedbacks() {
    const container = document.getElementById('feedbackGridContainer');
    if (!container) return;

    container.innerHTML = patientFeedbacks.map(f => {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            starsHtml += `<i class="fa-solid fa-star ${i <= f.rating ? 'active' : ''}" style="color: ${i <= f.rating ? 'var(--brand-amber)' : '#cbd5e1'};"></i> `;
        }
        const initials = f.name ? f.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'PT';

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

async function handleFeedbackSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('fbName')?.value.trim();
    const service = document.getElementById('fbService')?.value;
    const comment = document.getElementById('fbComment')?.value.trim();

    if (!name || !comment) {
        showToast('Please enter your name and feedback comments.', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/feedbacks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, service, comment, rating: selectedRating })
        });

        if (res.ok) {
            await fetchFeedbacks();
            document.getElementById('feedbackForm').reset();
            setStarRating(5);
            showToast('Thank you! Your feedback has been published.', 'success');
        } else {
            showToast('Failed to save feedback.', 'error');
        }
    } catch (err) {
        showToast('Network error while posting feedback.', 'error');
    }
}

// ==========================================================================
// 3. APPOINTMENT BOOKING WIZARD LOGIC
// ==========================================================================
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

    const list = matchedDocs.length > 0 ? matchedDocs : DOCTORS;

    docSelect.innerHTML = list.map(d => `
        <option value="${d.id}">${d.name} (${d.dept_label || d.deptLabel || 'Eye Specialist'})</option>
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

    const slots = doc.slots || [];

    slotContainer.innerHTML = slots.map(slot => {
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

async function confirmAppointmentBooking() {
    const name = document.getElementById('patientName')?.value.trim();
    const phone = document.getElementById('patientPhone')?.value.trim();
    const age = document.getElementById('patientAge')?.value.trim();
    const gender = document.getElementById('patientGender')?.value;
    const symptoms = document.getElementById('patientSymptoms')?.value.trim();
    const branch = document.getElementById('bookingBranch')?.value || '148/1, R.B. Avenue Bye Lane,(Park Maidan), Govt.Colony, Bhadreswar';
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
    const doctorName = doc ? doc.name : 'Consultant Ophthalmologist';

    try {
        const res = await fetch(`${API_BASE}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patientName: name,
                patientPhone: phone,
                patientAge: age,
                patientGender: gender,
                doctorName: doctorName,
                specialty: specialty,
                appointmentDate: date,
                slotTime: slot,
                branch: branch,
                symptoms: symptoms
            })
        });

        if (res.ok) {
            const data = await res.json();
            const refCode = data.reference;

            await fetchAppointments();

            // Populate Printable Slip
            const refEl = document.getElementById('slipRefCode');
            if (refEl) refEl.innerText = refCode;
            const pName = document.getElementById('slipPatientName');
            if (pName) pName.innerText = name;
            const pPhone = document.getElementById('slipPatientPhone');
            if (pPhone) pPhone.innerText = phone;
            const pDoc = document.getElementById('slipDoctorName');
            if (pDoc) pDoc.innerText = doctorName;
            const pSpec = document.getElementById('slipSpecialty');
            if (pSpec) pSpec.innerText = specialty;
            const pDt = document.getElementById('slipDateTime');
            if (pDt) pDt.innerText = `${date} at ${slot}`;
            const pBr = document.getElementById('slipBranch');
            if (pBr) pBr.innerText = branch;

            goToStep(4);
            showToast('Appointment confirmed! Registration slip ready.', 'success');
        } else {
            showToast('Failed to create appointment booking.', 'error');
        }
    } catch (err) {
        showToast('Error connecting to backend server.', 'error');
    }
}

// ==========================================================================
// 4. PATIENT PORTAL SEARCH
// ==========================================================================
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

async function searchPatientAppointments() {
    const input = document.getElementById('lookupQuery');
    const container = document.getElementById('patientResultsContainer');
    if (!container) return;

    const query = input ? input.value.trim() : '';

    await fetchAppointments(query);
    const matched = appointments;

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

async function cancelAppointment(ref) {
    if (confirm(`Are you sure you want to cancel appointment ${ref}?`)) {
        try {
            const res = await fetch(`${API_BASE}/appointments/${ref}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'cancelled' })
            });
            if (res.ok) {
                await searchPatientAppointments();
                showToast(`Appointment ${ref} cancelled.`, 'success');
            }
        } catch (err) {
            showToast('Error cancelling appointment.', 'error');
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

// ==========================================================================
// 5. ADMIN DASHBOARD
// ==========================================================================
function openAdminModal() {
    closeModals();
    const modal = document.getElementById('adminModal');
    if (modal) modal.classList.add('active');
}

async function authenticateAdmin() {
    const pin = document.getElementById('adminPin')?.value;
    try {
        const res = await fetch(`${API_BASE}/auth/admin-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin })
        });
        const data = await res.json();
        if (data.success) {
            document.getElementById('adminLoginSection').style.display = 'none';
            document.getElementById('adminDashboardSection').style.display = 'block';
            await fetchAppointments();
            renderAdminAppointments();
            updateAdminStats();
        } else {
            showToast('Invalid PIN access code.', 'error');
        }
    } catch (err) {
        showToast('Authentication error.', 'error');
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

async function updateAppointmentStatus(ref, newStatus) {
    try {
        const res = await fetch(`${API_BASE}/appointments/${ref}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
            await fetchAppointments();
            showToast(`Appointment ${ref} updated to ${newStatus}.`, 'success');
        }
    } catch (err) {
        showToast('Failed to update status.', 'error');
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

// ==========================================================================
// 6. DOCTOR DIRECTORY RENDERING
// ==========================================================================
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
                <span class="doctor-dept">${doc.dept_label || doc.deptLabel || 'Consultant Surgeon'}</span>
            </div>
            <div class="doctor-info">
                <div class="doctor-degrees">${doc.degrees || ''}</div>
                ${(doc.reg_no || doc.regNo) ? `
                    <div style="border-top: 1px solid var(--brand-border); padding-top: 10px; font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
                        <i class="fa-solid fa-id-card" style="color: var(--brand-crimson); margin-right: 6px;"></i> Reg. No: <strong style="color: var(--text-heading);">${doc.reg_no || doc.regNo}</strong>
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

// ==========================================================================
// 7. DYNAMIC GALLERY MANAGMENT
// ==========================================================================
let tempUploadedGalleryDataUrl = '';

function previewGalleryFile(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            tempUploadedGalleryDataUrl = e.target.result;
            const prevContainer = document.getElementById('admGalPreviewContainer');
            const prevImg = document.getElementById('admGalPreviewImg');
            if (prevContainer && prevImg) {
                prevImg.src = tempUploadedGalleryDataUrl;
                prevContainer.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }
}

async function addGalleryItem(title, category, imgUrl, description) {
    try {
        const res = await fetch(`${API_BASE}/gallery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, category, imgUrl, description })
        });
        if (res.ok) {
            await fetchGallery();
            showToast('Gallery image added successfully!', 'success');
        }
    } catch (err) {
        showToast('Error adding gallery image.', 'error');
    }
}

async function deleteGalleryItem(id) {
    try {
        const res = await fetch(`${API_BASE}/gallery/${id}`, { method: 'DELETE' });
        if (res.ok) {
            await fetchGallery();
            showToast('Gallery item deleted.', 'success');
        }
    } catch (err) {
        showToast('Error deleting gallery item.', 'error');
    }
}

function renderGallery() {
    const container = document.getElementById('galleryContainer');
    if (!container) return;

    container.innerHTML = galleryItems.map(item => `
        <div class="specialty-card-img" style="background: white; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--brand-border); box-shadow: var(--shadow-sm); transition: transform 0.2s ease;">
            <div style="height: 190px; overflow: hidden; background: #1e2460; position: relative;">
                <img src="${item.imgUrl}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='images/hospital.jpg'">
                <span style="position: absolute; top: 10px; right: 10px; background: var(--brand-crimson); color: white; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase;">${item.category}</span>
            </div>
            <div style="padding: 20px;">
                <h3 style="font-size: 16px; font-weight: 800; color: var(--brand-primary); margin-bottom: 8px;">${item.title}</h3>
                <p style="font-size: 13px; color: var(--text-body); line-height: 1.55;">${item.description}</p>
            </div>
        </div>
    `).join('');
}

// ==========================================================================
// 8. DYNAMIC ACHIEVEMENTS / MILESTONES
// ==========================================================================
async function addAchievement(title, number, description, driveUrl) {
    try {
        const res = await fetch(`${API_BASE}/achievements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, number, description, driveUrl })
        });
        if (res.ok) {
            await fetchAchievements();
            showToast('Achievement milestone added!', 'success');
        }
    } catch (err) {
        showToast('Error adding achievement.', 'error');
    }
}

async function deleteAchievement(id) {
    try {
        const res = await fetch(`${API_BASE}/achievements/${id}`, { method: 'DELETE' });
        if (res.ok) {
            await fetchAchievements();
            showToast('Achievement deleted.', 'success');
        }
    } catch (err) {
        showToast('Error deleting achievement.', 'error');
    }
}

function renderAchievements() {
    const container = document.getElementById('achievementsContainer');
    if (!container) return;

    container.innerHTML = achievementItems.map(item => `
        <div class="csr-project-card">
            <div style="font-size: 28px; font-weight: 800; color: var(--brand-crimson); margin-bottom: 6px;">${item.number}</div>
            <h3 style="font-size: 17px; font-weight: 800; color: var(--brand-primary); margin-bottom: 8px;">${item.title}</h3>
            <p style="font-size: 13.5px; color: var(--text-body); line-height: 1.55; margin-bottom: 10px;">${item.description}</p>
            ${item.driveUrl ? `
                <div style="margin-top: 10px; border-top: 1px dashed var(--brand-border); padding-top: 8px;">
                    <a href="${item.driveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="font-size: 11.5px; padding: 4px 10px; border-color: var(--brand-primary); color: var(--brand-primary); text-decoration: none;">
                        <i class="fa-brands fa-google-drive" style="color: #0f9d58;"></i> View Drive Certificate / Link &rarr;
                    </a>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// ==========================================================================
// 9. DYNAMIC CSR CAMPS
// ==========================================================================
async function addCamp(title, location, date, patients, details, driveUrl) {
    try {
        const res = await fetch(`${API_BASE}/camps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, location, date, patients, details, driveUrl })
        });
        if (res.ok) {
            await fetchCamps();
            showToast('Camp schedule added to CSR section!', 'success');
        }
    } catch (err) {
        showToast('Error adding camp schedule.', 'error');
    }
}

async function deleteCamp(id) {
    try {
        const res = await fetch(`${API_BASE}/camps/${id}`, { method: 'DELETE' });
        if (res.ok) {
            await fetchCamps();
            showToast('Camp schedule removed.', 'success');
        }
    } catch (err) {
        showToast('Error removing camp.', 'error');
    }
}

function renderCamps() {
    const section = document.getElementById('dynamicCampsSection');
    const container = document.getElementById('dynamicCampsContainer');
    if (!container) return;

    if (campItems.length > 0 && section) {
        section.style.display = 'block';
    }

    container.innerHTML = campItems.map(camp => `
        <div class="csr-project-card" style="background: white; border-top: 4px solid var(--brand-crimson);">
            <div style="font-size: 24px; color: var(--brand-crimson); margin-bottom: 8px;"><i class="fa-solid fa-tent"></i></div>
            <h3 style="font-size: 16px; font-weight: 800; color: var(--brand-primary); margin-bottom: 6px;">${camp.title}</h3>
            <p style="font-size: 12.5px; color: var(--brand-amber); font-weight: 700; margin-bottom: 6px;"><i class="fa-solid fa-location-dot"></i> ${camp.location} | <i class="fa-solid fa-calendar-day"></i> ${camp.date}</p>
            <p style="font-size: 13px; color: var(--text-body); margin-bottom: 12px; line-height: 1.5;">${camp.details}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
                <span style="font-size: 11px; font-weight: 700; background: var(--brand-light); color: var(--brand-primary); padding: 4px 10px; border-radius: 4px;"><i class="fa-solid fa-users"></i> ${camp.patients}</span>
                ${camp.driveUrl ? `
                    <a href="${camp.driveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="font-size: 11.5px; padding: 4px 10px; border-color: var(--brand-primary); color: var(--brand-primary); text-decoration: none;">
                        <i class="fa-brands fa-google-drive" style="color: #0f9d58;"></i> View Drive Document &rarr;
                    </a>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// ==========================================================================
// 10. ADMIN DASHBOARD TAB SWITCHING & HANDLERS
// ==========================================================================
function switchAdminTab(tabName, btn) {
    document.querySelectorAll('.admin-tab-btn').forEach(b => {
        b.classList.remove('btn-primary', 'active');
        b.classList.add('btn-secondary');
    });
    if (btn) {
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary', 'active');
    }

    document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');

    if (tabName === 'appointments') {
        document.getElementById('adminTabAppointments').style.display = 'block';
        renderAdminAppointments();
    } else if (tabName === 'gallery') {
        document.getElementById('adminTabGallery').style.display = 'block';
        renderAdminGallery();
    } else if (tabName === 'camps') {
        document.getElementById('adminTabCamps').style.display = 'block';
        renderAdminCamps();
    } else if (tabName === 'achievements') {
        document.getElementById('adminTabAchievements').style.display = 'block';
        renderAdminAchievements();
    }
}

function renderAdminGallery() {
    const container = document.getElementById('adminGalleryList');
    if (!container) return;

    if (galleryItems.length === 0) {
        container.innerHTML = '<p style="font-size: 12px; color: var(--text-muted);">No custom gallery images uploaded.</p>';
        return;
    }

    container.innerHTML = galleryItems.map(item => `
        <div style="display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 10px 14px; border: 1px solid var(--brand-border); border-radius: 6px; font-size: 13px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${item.imgUrl}" alt="${item.title}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" onerror="this.src='images/hospital.jpg'">
                <div>
                    <strong>${item.title}</strong> <span style="font-size: 11px; background: var(--brand-light); color: var(--brand-primary); padding: 2px 6px; border-radius: 4px;">${item.category}</span>
                    <div style="font-size: 11.5px; color: var(--text-muted);">${item.description}</div>
                </div>
            </div>
            <button class="btn btn-outline btn-sm" onclick="deleteGalleryItem('${item.id}')" style="color: var(--danger); border-color: var(--danger);"><i class="fa-solid fa-trash"></i> Delete</button>
        </div>
    `).join('');
}

function handleAdminAddGallery(e) {
    e.preventDefault();
    const title = document.getElementById('admGalTitle')?.value;
    const category = document.getElementById('admGalCategory')?.value;
    const urlInput = document.getElementById('admGalUrl') ? document.getElementById('admGalUrl').value : '';
    const desc = document.getElementById('admGalDesc')?.value;

    const imgUrl = tempUploadedGalleryDataUrl || urlInput || 'images/hospital.jpg';

    addGalleryItem(title, category, imgUrl, desc);
    tempUploadedGalleryDataUrl = '';
    const prevContainer = document.getElementById('admGalPreviewContainer');
    if (prevContainer) prevContainer.style.display = 'none';
    const fileInput = document.getElementById('admGalFile');
    if (fileInput) fileInput.value = '';
    e.target.reset();
}

function renderAdminCamps() {
    const container = document.getElementById('adminCampsList');
    if (!container) return;

    if (campItems.length === 0) {
        container.innerHTML = '<p style="font-size: 12px; color: var(--text-muted);">No upcoming camps scheduled.</p>';
        return;
    }

    container.innerHTML = campItems.map(camp => `
        <div style="display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 10px 14px; border: 1px solid var(--brand-border); border-radius: 6px; font-size: 13px;">
            <div>
                <strong>${camp.title}</strong> • <span style="color: var(--brand-crimson); font-weight: 600;">${camp.location}</span>
                <div style="font-size: 11.5px; color: var(--text-muted);">${camp.date} | ${camp.patients} ${camp.driveUrl ? '• <i class="fa-brands fa-google-drive" style="color: #0f9d58;"></i> Drive Link Attached' : ''}</div>
            </div>
            <button class="btn btn-outline btn-sm" onclick="deleteCamp('${camp.id}')" style="color: var(--danger); border-color: var(--danger);"><i class="fa-solid fa-trash"></i> Delete</button>
        </div>
    `).join('');
}

function handleAdminAddCamp(e) {
    e.preventDefault();
    const title = document.getElementById('admCampTitle')?.value;
    const location = document.getElementById('admCampLocation')?.value;
    const date = document.getElementById('admCampDate')?.value;
    const patients = document.getElementById('admCampPatients')?.value;
    const details = document.getElementById('admCampDetails')?.value;
    const driveUrl = document.getElementById('admCampDriveUrl') ? document.getElementById('admCampDriveUrl').value : '';

    addCamp(title, location, date, patients, details, driveUrl);
    e.target.reset();
}

function renderAdminAchievements() {
    const container = document.getElementById('adminAchievementsList');
    if (!container) return;

    if (achievementItems.length === 0) {
        container.innerHTML = '<p style="font-size: 12px; color: var(--text-muted);">No achievements listed.</p>';
        return;
    }

    container.innerHTML = achievementItems.map(item => `
        <div style="display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 10px 14px; border: 1px solid var(--brand-border); border-radius: 6px; font-size: 13px;">
            <div>
                <strong style="color: var(--brand-crimson);">${item.number}</strong> • <strong>${item.title}</strong>
                <div style="font-size: 11.5px; color: var(--text-muted);">${item.description} ${item.driveUrl ? '• <i class="fa-brands fa-google-drive" style="color: #0f9d58;"></i> Drive Link Attached' : ''}</div>
            </div>
            <button class="btn btn-outline btn-sm" onclick="deleteAchievement('${item.id}')" style="color: var(--danger); border-color: var(--danger);"><i class="fa-solid fa-trash"></i> Delete</button>
        </div>
    `).join('');
}

function handleAdminAddAchievement(e) {
    e.preventDefault();
    const title = document.getElementById('admAchTitle')?.value;
    const number = document.getElementById('admAchNumber')?.value;
    const desc = document.getElementById('admAchDesc')?.value;
    const driveUrl = document.getElementById('admAchDriveUrl') ? document.getElementById('admAchDriveUrl').value : '';

    addAchievement(title, number, desc, driveUrl);
    e.target.reset();
}

// ==========================================================================
// 11. GENERAL UTILITIES
// ==========================================================================
function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

window.onclick = function (event) {
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

// ==========================================================================
// DOM INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
    // Initial fetch from backend API
    await fetchDoctors();
    await fetchAppointments();
    await fetchFeedbacks();
    await fetchGallery();
    await fetchAchievements();
    await fetchCamps();

    // Mobile dropdown toggle on click for touch devices
    document.querySelectorAll('.nav-item-dropdown > a').forEach(dropdownAnchor => {
        dropdownAnchor.addEventListener('click', function (e) {
            if (window.innerWidth <= 768) {
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
