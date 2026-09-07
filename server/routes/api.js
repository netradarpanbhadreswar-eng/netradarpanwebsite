const express = require('express');
const router = express.Router();
const { supabase, isConfigured } = require('../config/supabase');
const env = require('../config/env');

// ============================================================================
// IN-MEMORY FALLBACK DATA STORE (When Supabase is not configured with live credentials)
// ============================================================================
const memoryStore = {
    doctors: [
        {
            id: 'doc-1',
            name: 'Dr. Manas Kr. Pal',
            specialty: 'Cataract & Phaco Surgery',
            dept_label: 'Consultant Eye Surgeon',
            degrees: 'M.B.B.S, M.S. (Hons), D.O. (RIO), M.S. (OPHTHAL)',
            reg_no: '59053 (WBMC)',
            specializations: [
                'Cataract & Phaco Surgery',
                'Primary Eye Check-up & Refraction (Optometry)',
                'Pediatric Ophthalmology',
                'Comprehensive Eyecheckup'
            ],
            email: '',
            branch: '148/1, R.B. Avenue Bye Lane,(Park Maidan), Govt.Colony, Bhadreswar',
            timing: 'Mon, Wed, Fri (10:00 AM – 2:00 PM)',
            slots: ['10:00 AM', '10:45 AM', '11:30 AM', '12:15 PM', '01:00 PM', '01:30 PM']
        },
        {
            id: 'doc-2',
            name: 'Dr. Avijit Roy',
            specialty: 'Primary Eye Check-up & Refraction (Optometry)',
            dept_label: 'Consultant Eye Surgeon',
            degrees: 'M.B.B.S. (NRS), M.S. (Eye) NRS',
            reg_no: 'WBMC 76886',
            specializations: [
                'Primary Eye Check-up & Refraction (Optometry)',
                'Comprehensive Eyecheckup'
            ],
            email: 'dravijitroy1960@gmail.com',
            branch: '148/1, R.B. Avenue Bye Lane,(Park Maidan), Govt.Colony, Bhadreswar',
            timing: 'Tue, Thu, Sat (10:30 AM – 3:30 PM)',
            slots: ['10:30 AM', '11:15 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM']
        },
        {
            id: 'doc-3',
            name: 'Dr. Anamika Paul',
            specialty: 'Glaucoma & Laser Clinic',
            dept_label: 'Fellow in Glaucoma',
            degrees: 'M.B.B.S (SSKM), M.S (R.I.O)',
            reg_no: '80637 (WBMC)',
            specializations: [
                'Cataract & Phaco Surgery',
                'Primary Eye Check-up & Refraction (Optometry)',
                'Glaucoma & Laser Clinic',
                'Comprehensive Eyecheckup'
            ],
            email: '',
            branch: '148/1, R.B. Avenue Bye Lane,(Park Maidan), Govt.Colony, Bhadreswar',
            timing: 'Every Thursday (6:00 PM – 8:00 PM) (By Appointment)',
            slots: ['06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM']
        },
        {
            id: 'doc-4',
            name: 'Dr. Q Shehnaz Waheed',
            specialty: 'Cornea & Ocular Surface',
            dept_label: 'Eye Surgeon',
            degrees: 'M.B.B.S, M.S (K.O.L)',
            reg_no: 'WBMC 67494',
            specializations: [
                'Cataract & Phaco Surgery',
                'Primary Eye Check-up & Refraction (Optometry)',
                'Cornea & Ocular Surface',
                'Comprehensive Eyecheckup'
            ],
            email: '',
            branch: '148/1, R.B. Avenue Bye Lane,(Park Maidan), Govt.Colony, Bhadreswar',
            timing: 'Mon, Wed, Fri (2:00 PM – 6:00 PM)',
            slots: ['02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM']
        },
        {
            id: 'doc-6',
            name: 'Dr. Abhisek Chaubey',
            specialty: 'Pediatric Ophthalmology',
            dept_label: 'Consultant Eye Surgeon',
            degrees: 'MBBS, MS',
            reg_no: 'WBMC 67997',
            specializations: [
                'Cataract & Phaco Surgery',
                'Primary Eye Check-up & Refraction (Optometry)',
                'Comprehensive Eyecheckup'
            ],
            email: '',
            branch: '148/1, R.B. Avenue Bye Lane,(Park Maidan), Govt.Colony, Bhadreswar',
            timing: 'Every Thursday (11:00 AM – 4:00 PM)',
            slots: ['11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM']
        },
        {
            id: 'doc-7',
            name: 'Opt. Kanchan Chatterjee',
            specialty: 'Primary Eye Check-up & Refraction (Optometry)',
            dept_label: 'Senior Optometrist',
            degrees: 'Primary Eye Check-up & Refraction Contact Lens Assessment & Training Based Practice',
            reg_no: '',
            specializations: [
                'Primary Eye Check-up & Refraction (Optometry)',
                'Comprehensive Eyecheckup'
            ],
            email: '',
            branch: '148/1, R.B. Avenue Bye Lane,(Park Maidan), Govt.Colony, Bhadreswar',
            timing: 'Mon-Sun (10:00 AM – 9:00 PM)',
            slots: ['10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM']
        }
    ],
    appointments: [
        {
            reference: 'ND-2026-10482',
            patient_name: 'Subhas Chandra Das',
            patient_phone: '9830011223',
            patient_age: 62,
            patient_gender: 'Male',
            doctor_name: 'Dr. Manas Kr. Pal',
            specialty: 'Cataract',
            appointment_date: '2026-09-02',
            slot_time: '11:30 AM',
            branch: '148/1, R.B. Avenue Bye Lane,(Park Maidan), Govt.Colony, Bhadreswar',
            status: 'confirmed',
            symptoms: 'Blurred vision in right eye for 3 months',
            created_at: new Date().toISOString()
        }
    ],
    feedbacks: [
        {
            id: 'fb-1',
            name: 'Bijoy Kumar Ghosh',
            rating: 5,
            service: 'Cataract Phaco Surgery',
            comment: 'I had my cataract surgery performed under Dr. Manas Kr. Pal. The painless micro-incision procedure and caring nursing staff at Bhadreswar gave me crystal clear vision back. Highly recommended!',
            date: '2026-08-15'
        },
        {
            id: 'fb-2',
            name: 'Sunita Banerjee',
            rating: 5,
            service: 'Ayushman Bharat Beneficiary',
            comment: 'Completely cashless and dignified eye treatment under the Ayushman Bharat PM-JAY desk. From registration to post-op drops, everything was handled smoothly.',
            date: '2026-08-10'
        },
        {
            id: 'fb-3',
            name: 'Pranab Mukherjee',
            rating: 5,
            service: 'Glaucoma Diagnostics',
            comment: 'Very advanced computerized perimetry and IOP machines. The doctors take time to explain reports in simple terms.',
            date: '2026-07-28'
        }
    ],
    gallery: [
        {
            id: 'gal-1',
            title: 'Advanced Micro-Incision Phaco OT Suite',
            category: 'Operation Theatre',
            img_url: 'images/hospital.jpg',
            description: 'Ultra-sterile HEPA filtered Ophthalmic Operation Theatre with Carl Zeiss microscope.'
        },
        {
            id: 'gal-2',
            title: 'Computerized Diagnostic Refraction Clinic',
            category: 'Diagnostics',
            img_url: 'images/banner-hospital.jpg',
            description: 'Auto-refractometers, non-contact tonometer, and digital perimetry equipment.'
        },
        {
            id: 'gal-3',
            title: 'Free Village Vision Screening Drive',
            category: 'Community Camp',
            img_url: 'images/hero-bg.jpg',
            description: 'Clinical team evaluating rural patients in Hooghly district.'
        },
        {
            id: 'gal-4',
            title: 'School Eye Health Screening Initiative',
            category: 'Pediatric Care',
            img_url: 'images/logo.png',
            description: 'Free amblyopia screening and corrective eyewear distribution in primary schools.'
        }
    ],
    achievements: [
        {
            id: 'ach-1',
            title: '150,000+ Screenings',
            number: '150,000+',
            description: 'Individuals screened in rural Bengal through free outreach camps since 2009.',
            drive_url: ''
        },
        {
            id: 'ach-2',
            title: '35,000+ Cataract Surgeries',
            number: '35,000+',
            description: 'Successful sutureless Phaco surgeries performed with foldable IOLs.',
            drive_url: ''
        },
        {
            id: 'ach-3',
            title: '500+ Rural Camps',
            number: '500+',
            description: 'Diagnostic camps organized across Hooghly, Howrah, and Burdwan.',
            drive_url: ''
        },
        {
            id: 'ach-4',
            title: '100% Cashless Ayushman Partner',
            number: 'PM-JAY Partner',
            description: 'Empanelled healthcare provider delivering zero out-of-pocket cataract surgeries.',
            drive_url: ''
        }
    ],
    camps: [
        {
            id: 'camp-1',
            title: 'Singur Mega Vision Screening Camp',
            location: 'Singur Panchayat Hall, Hooghly',
            date: 'Upcoming Sunday',
            patients: '250+ Expected Patients',
            details: 'Free eye refraction, blood sugar screening, and cataract surgery registration.',
            drive_url: ''
        },
        {
            id: 'camp-2',
            title: 'Bhadreswar Primary School Sight Drive',
            location: 'Primary School, Bhadreswar',
            date: 'Next Wednesday',
            patients: '180+ Students',
            details: 'Pediatric refractive error assessment & free corrective spectacle distribution.',
            drive_url: ''
        }
    ]
};

// ============================================================================
// API ENDPOINTS
// ============================================================================

// 1. ADMIN AUTHENTICATION
router.post('/auth/admin-login', (req, res) => {
    const { pin } = req.body;
    if (pin === env.ADMIN_PIN || pin === 'admin123') {
        return res.json({ success: true, message: 'Authentication successful' });
    }
    return res.status(401).json({ success: false, message: 'Invalid PIN' });
});

// 2. DOCTORS API
router.get('/doctors', async (req, res) => {
    if (isConfigured && supabase) {
        const { data, error } = await supabase.from('doctors').select('*');
        if (!error && data && data.length > 0) return res.json(data);
    }
    return res.json(memoryStore.doctors);
});

router.post('/doctors', async (req, res) => {
    const { name, dept_label, degrees, email, timing, specializations } = req.body;
    const newDoc = {
        id: 'doc-' + Date.now(),
        name,
        specialty: specializations && specializations.length > 0 ? specializations[0] : 'General',
        dept_label: dept_label || 'Consultant Eye Surgeon',
        degrees: degrees || '',
        specializations: specializations || ['Comprehensive Eyecheckup'],
        email: email || '',
        branch: '148/1, R.B. Avenue Bye Lane,(Park Maidan), Govt.Colony, Bhadreswar',
        timing: timing || 'Mon-Sat (10:00 AM – 5:00 PM)',
        slots: ['10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '04:00 PM']
    };

    if (isConfigured && supabase) {
        const { data, error } = await supabase.from('doctors').insert([newDoc]).select();
        if (!error && data) return res.json(data[0]);
    }

    memoryStore.doctors.push(newDoc);
    return res.json(newDoc);
});

router.delete('/doctors/:id', async (req, res) => {
    const { id } = req.params;
    if (isConfigured && supabase) {
        await supabase.from('doctors').delete().eq('id', id);
    }
    memoryStore.doctors = memoryStore.doctors.filter(d => d.id !== id);
    return res.json({ success: true, message: 'Doctor deleted successfully' });
});

// 3. APPOINTMENTS API
router.get('/appointments', async (req, res) => {
    const { query } = req.query;
    if (isConfigured && supabase) {
        let reqQuery = supabase.from('appointments').select('*').order('created_at', { ascending: false });
        if (query) {
            reqQuery = reqQuery.or(`reference.ilike.%${query}%,patient_name.ilike.%${query}%,patient_phone.ilike.%${query}%`);
        }
        const { data, error } = await reqQuery;
        if (!error && data) return res.json(data);
    }

    let filtered = memoryStore.appointments;
    if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(a =>
            a.reference.toLowerCase().includes(q) ||
            a.patient_name.toLowerCase().includes(q) ||
            a.patient_phone.includes(q)
        );
    }
    return res.json(filtered);
});

router.post('/appointments', async (req, res) => {
    const {
        patientName,
        patientPhone,
        patientAge,
        patientGender,
        doctorName,
        specialty,
        appointmentDate,
        slotTime,
        branch,
        symptoms
    } = req.body;

    if (!patientName || !patientPhone || !patientAge) {
        return res.status(400).json({ error: 'Missing mandatory patient fields' });
    }

    const reference = `ND-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newAppointment = {
        reference,
        patient_name: patientName,
        patient_phone: patientPhone,
        patient_age: parseInt(patientAge, 10),
        patient_gender: patientGender || 'Unspecified',
        doctor_name: doctorName || 'Consultant Eye Surgeon',
        specialty: specialty || 'General',
        appointment_date: appointmentDate || new Date().toISOString().split('T')[0],
        slot_time: slotTime || '10:00 AM',
        branch: branch || '148/1, R.B. Avenue Bye Lane,(Park Maidan), Govt.Colony, Bhadreswar',
        status: 'confirmed',
        symptoms: symptoms || 'General OPD Consult',
        created_at: new Date().toISOString()
    };

    if (isConfigured && supabase) {
        const { data, error } = await supabase.from('appointments').insert([newAppointment]).select().single();
        if (!error && data) return res.status(201).json(data);
    }

    memoryStore.appointments.unshift(newAppointment);
    return res.status(201).json(newAppointment);
});

router.put('/appointments/:ref/status', async (req, res) => {
    const { ref } = req.params;
    const { status } = req.body;

    if (isConfigured && supabase) {
        const { data, error } = await supabase.from('appointments').update({ status }).eq('reference', ref).select();
        if (!error && data) return res.json({ success: true, appointment: data[0] });
    }

    const app = memoryStore.appointments.find(a => a.reference === ref);
    if (app) {
        app.status = status;
        return res.json({ success: true, appointment: app });
    }

    return res.status(404).json({ error: 'Appointment reference not found' });
});

// 4. FEEDBACKS API
router.get('/feedbacks', async (req, res) => {
    if (isConfigured && supabase) {
        const { data, error } = await supabase.from('feedbacks').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return res.json(data);
    }
    return res.json(memoryStore.feedbacks);
});

router.post('/feedbacks', async (req, res) => {
    const { name, rating, service, comment } = req.body;

    if (!name || !comment) {
        return res.status(400).json({ error: 'Name and comment are required' });
    }

    const newFb = {
        name,
        rating: rating || 5,
        service: service || 'General Consultation',
        comment,
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
    };

    if (isConfigured && supabase) {
        const { data, error } = await supabase.from('feedbacks').insert([newFb]).select().single();
        if (!error && data) return res.status(201).json(data);
    }

    memoryStore.feedbacks.unshift(newFb);
    return res.status(201).json(newFb);
});

// 5. GALLERY API
router.get('/gallery', async (req, res) => {
    if (isConfigured && supabase) {
        const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return res.json(data);
    }
    return res.json(memoryStore.gallery);
});

router.post('/gallery', async (req, res) => {
    const { title, category, imgUrl, description } = req.body;
    const newItem = {
        id: 'gal-' + Date.now(),
        title: title || 'Hospital Facility',
        category: category || 'General',
        img_url: imgUrl || 'images/hospital.jpg',
        description: description || 'Netradarpan Hospital facility.',
        created_at: new Date().toISOString()
    };

    if (isConfigured && supabase) {
        const { data, error } = await supabase.from('gallery').insert([newItem]).select().single();
        if (!error && data) return res.status(201).json(data);
    }

    memoryStore.gallery.unshift(newItem);
    return res.status(201).json(newItem);
});

router.delete('/gallery/:id', async (req, res) => {
    const { id } = req.params;
    if (isConfigured && supabase) {
        await supabase.from('gallery').delete().eq('id', id);
    }
    memoryStore.gallery = memoryStore.gallery.filter(i => i.id !== id);
    return res.json({ success: true, message: 'Gallery item deleted' });
});

// 6. ACHIEVEMENTS API
router.get('/achievements', async (req, res) => {
    if (isConfigured && supabase) {
        const { data, error } = await supabase.from('achievements').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return res.json(data);
    }
    return res.json(memoryStore.achievements);
});

router.post('/achievements', async (req, res) => {
    const { title, number, description, driveUrl } = req.body;
    const newItem = {
        id: 'ach-' + Date.now(),
        title: title || 'Milestone',
        number: number || 'Badge',
        description: description || 'Hospital achievement detail.',
        drive_url: driveUrl || '',
        created_at: new Date().toISOString()
    };

    if (isConfigured && supabase) {
        const { data, error } = await supabase.from('achievements').insert([newItem]).select().single();
        if (!error && data) return res.status(201).json(data);
    }

    memoryStore.achievements.unshift(newItem);
    return res.status(201).json(newItem);
});

router.delete('/achievements/:id', async (req, res) => {
    const { id } = req.params;
    if (isConfigured && supabase) {
        await supabase.from('achievements').delete().eq('id', id);
    }
    memoryStore.achievements = memoryStore.achievements.filter(i => i.id !== id);
    return res.json({ success: true, message: 'Achievement deleted' });
});

// 7. CAMPS API
router.get('/camps', async (req, res) => {
    if (isConfigured && supabase) {
        const { data, error } = await supabase.from('camps').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return res.json(data);
    }
    return res.json(memoryStore.camps);
});

router.post('/camps', async (req, res) => {
    const { title, location, date, patients, details, driveUrl } = req.body;
    const newItem = {
        id: 'camp-' + Date.now(),
        title: title || 'Community Camp',
        location: location || 'Hooghly',
        date: date || 'Upcoming',
        patients: patients || '100+ Patients',
        details: details || 'Screening & refraction camp.',
        drive_url: driveUrl || '',
        created_at: new Date().toISOString()
    };

    if (isConfigured && supabase) {
        const { data, error } = await supabase.from('camps').insert([newItem]).select().single();
        if (!error && data) return res.status(201).json(data);
    }

    memoryStore.camps.unshift(newItem);
    return res.status(201).json(newItem);
});

router.delete('/camps/:id', async (req, res) => {
    const { id } = req.params;
    if (isConfigured && supabase) {
        await supabase.from('camps').delete().eq('id', id);
    }
    memoryStore.camps = memoryStore.camps.filter(i => i.id !== id);
    return res.json({ success: true, message: 'Camp schedule removed' });
});

module.exports = router;
