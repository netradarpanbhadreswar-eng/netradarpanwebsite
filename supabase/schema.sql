-- ============================================================================
-- NETRADARPAN EYE HOSPITAL - DATABASE SCHEMA & INITIAL SEED DATA
-- Target DB: PostgreSQL / Supabase Database Engine
-- ============================================================================

-- 1. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    dept_label TEXT NOT NULL,
    degrees TEXT,
    reg_no TEXT,
    email TEXT,
    branch TEXT NOT NULL DEFAULT '148/1, R.B. Avenue Bye Lane,(Park Maidan), Govt.Colony, Bhadreswar',
    timing TEXT NOT NULL,
    slots JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT UNIQUE NOT NULL,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    patient_age INT NOT NULL,
    patient_gender TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    slot_time TEXT NOT NULL,
    branch TEXT NOT NULL DEFAULT '148/1, R.B. Avenue Bye Lane,(Park Maidan), Govt.Colony, Bhadreswar',
    status TEXT NOT NULL DEFAULT 'confirmed',
    symptoms TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FEEDBACKS TABLE
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    service TEXT NOT NULL,
    comment TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GALLERY TABLE
CREATE TABLE IF NOT EXISTS public.gallery (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    img_url TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    number TEXT NOT NULL,
    description TEXT NOT NULL,
    drive_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CAMPS TABLE
CREATE TABLE IF NOT EXISTS public.camps (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    date TEXT NOT NULL,
    patients TEXT NOT NULL,
    details TEXT NOT NULL,
    drive_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR SPEED AND EFFICIENT SEARCHING
CREATE INDEX IF NOT EXISTS idx_appointments_reference ON public.appointments(reference);
CREATE INDEX IF NOT EXISTS idx_appointments_phone ON public.appointments(patient_phone);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON public.doctors(specialty);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures API and public client queries can safely read and create records
-- ============================================================================
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camps ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access for all tables
CREATE POLICY "Allow public read access on doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Allow public read access on appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Allow public read access on feedbacks" ON public.feedbacks FOR SELECT USING (true);
CREATE POLICY "Allow public read access on gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Allow public read access on achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Allow public read access on camps" ON public.camps FOR SELECT USING (true);

-- Allow Public Insert Access for interactive features (Appointments & Feedbacks)
CREATE POLICY "Allow public insert on appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on feedbacks" ON public.feedbacks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on appointments" ON public.appointments FOR UPDATE USING (true);

-- Allow Full Access for API / Service Role / Anon on Management tables
CREATE POLICY "Allow full access on gallery" ON public.gallery FOR ALL USING (true);
CREATE POLICY "Allow full access on achievements" ON public.achievements FOR ALL USING (true);
CREATE POLICY "Allow full access on camps" ON public.camps FOR ALL USING (true);
CREATE POLICY "Allow full access on doctors" ON public.doctors FOR ALL USING (true);

-- ============================================================================
-- SEED DATA INSERTIONS
-- ============================================================================

INSERT INTO public.doctors (id, name, specialty, dept_label, degrees, reg_no, email, branch, timing, slots)
VALUES 
('doc-1', 'Dr. Manas Kr. Pal', 'Cataract', 'Consultant Eye Surgeon', 'M.B.B.S, M.S. (Hons), D.O. (RIO), M.S. (OPHTHAL)', '59053 (WBMC)', '', 'Bhadreswar Main Hospital', 'Mon, Wed, Fri (10:00 AM – 2:00 PM)', '["10:00 AM", "10:45 AM", "11:30 AM", "12:15 PM", "01:00 PM", "01:30 PM"]'::jsonb),
('doc-2', 'Dr. Avijit Roy', 'Cataract', 'Consultant Eye Surgeon', 'M.B.B.S. (NRS), M.S. (Eye) NRS', 'WBMC 76886', 'dravijitroy1960@gmail.com', 'Bhadreswar Main Hospital', 'Tue, Thu, Sat (10:30 AM – 3:30 PM)', '["10:30 AM", "11:15 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM"]'::jsonb),
('doc-3', 'Dr. Anamika Paul', 'Glaucoma', 'Fellow in Glaucoma', 'M.B.B.S (SSKM), M.S (R.I.O)', '80637 (WBMC)', '', 'Bhadreswar Main Hospital', 'Every Thursday (6:00 PM – 8:00 PM) (By Appointment)', '["06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM"]'::jsonb),
('doc-4', 'Dr. Q Shehnaz Waheed', 'Cornea', 'Eye Surgeon', 'M.B.B.S, M.S (K.O.L)', 'WBMC 67494', '', 'Bhadreswar Main Hospital', 'Mon, Wed, Fri (2:00 PM – 6:00 PM)', '["02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"]'::jsonb),
('doc-6', 'Dr. Abhisek Chaubey', 'Pediatric', 'Consultant Eye Surgeon', 'MBBS, MS', 'WBMC 67997', '', 'Bhadreswar Main Hospital', 'Every Thursday (11:00 AM – 4:00 PM)', '["11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM"]'::jsonb),
('doc-7', 'Opt. Kanchan Chatterjee', 'Senior Optometrist', 'Senior Optometrist', 'Primary Eye Check-up & Refraction Contact Lens Assessment & Training Based Practice', '', '', 'Bhadreswar Main Hospital', 'Mon-Sun (10:00 AM – 9:00 PM)', '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.appointments (reference, patient_name, patient_phone, patient_age, patient_gender, doctor_name, specialty, appointment_date, slot_time, branch, status, symptoms)
VALUES 
('ND-2026-10482', 'Subhas Chandra Das', '9830011223', 62, 'Male', 'Dr. Manas Kr. Pal', 'Cataract', '2026-09-02', '11:30 AM', '148/1, R.B. Avenue Bye Lane,(Park Maidan), Govt.Colony, Bhadreswar', 'confirmed', 'Blurred vision in right eye for 3 months')
ON CONFLICT (reference) DO NOTHING;

INSERT INTO public.feedbacks (name, rating, service, comment, date)
VALUES 
('Bijoy Kumar Ghosh', 5, 'Cataract Phaco Surgery', 'I had my cataract surgery performed under Dr. Manas Kr. Pal. The painless micro-incision procedure and caring nursing staff at Bhadreswar gave me crystal clear vision back. Highly recommended!', '2026-08-15'),
('Sunita Banerjee', 5, 'Ayushman Bharat Beneficiary', 'Completely cashless and dignified eye treatment under the Ayushman Bharat PM-JAY desk. From registration to post-op drops, everything was handled smoothly.', '2026-08-10'),
('Pranab Mukherjee', 5, 'Glaucoma Diagnostics', 'Very advanced computerized perimetry and IOP machines. The doctors take time to explain reports in simple terms.', '2026-07-28')
ON CONFLICT DO NOTHING;

INSERT INTO public.gallery (id, title, category, img_url, description)
VALUES 
('gal-1', 'Advanced Micro-Incision Phaco OT Suite', 'Operation Theatre', 'images/hospital.jpg', 'Ultra-sterile HEPA filtered Ophthalmic Operation Theatre with Carl Zeiss microscope.'),
('gal-2', 'Computerized Diagnostic Refraction Clinic', 'Diagnostics', 'images/banner-hospital.jpg', 'Auto-refractometers, non-contact tonometer, and digital perimetry equipment.'),
('gal-3', 'Free Village Vision Screening Drive', 'Community Camp', 'images/hero-bg.jpg', 'Clinical team evaluating rural patients in Hooghly district.'),
('gal-4', 'School Eye Health Screening Initiative', 'Pediatric Care', 'images/logo.png', 'Free amblyopia screening and corrective eyewear distribution in primary schools.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.achievements (id, title, number, description, drive_url)
VALUES 
('ach-1', '150,000+ Screenings', '150,000+', 'Individuals screened in rural Bengal through free outreach camps since 2009.', ''),
('ach-2', '35,000+ Cataract Surgeries', '35,000+', 'Successful sutureless Phaco surgeries performed with foldable IOLs.', ''),
('ach-3', '500+ Rural Camps', '500+', 'Diagnostic camps organized across Hooghly, Howrah, and Burdwan.', ''),
('ach-4', '100% Cashless Ayushman Partner', 'PM-JAY Partner', 'Empanelled healthcare provider delivering zero out-of-pocket cataract surgeries.', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.camps (id, title, location, date, patients, details, drive_url)
VALUES 
('camp-1', 'Singur Mega Vision Screening Camp', 'Singur Panchayat Hall, Hooghly', 'Upcoming Sunday', '250+ Expected Patients', 'Free eye refraction, blood sugar screening, and cataract surgery registration.', ''),
('camp-2', 'Bhadreswar Primary School Sight Drive', 'Primary School, Bhadreswar', 'Next Wednesday', '180+ Students', 'Pediatric refractive error assessment & free corrective spectacle distribution.', '')
ON CONFLICT (id) DO NOTHING;
