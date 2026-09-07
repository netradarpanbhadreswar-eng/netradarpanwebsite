-- ============================================================================
-- NETRADARPAN EYE HOSPITAL - DATABASE ALTER SCRIPT FOR DOCTOR SPECIALIZATIONS
-- Target DB: PostgreSQL / Supabase
-- Run this script in your Supabase SQL Editor to update doctor specializations
-- ============================================================================

-- 1. Add specializations column to public.doctors table if it doesn't exist
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS specializations JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 2. Update Dr. Manas Kr. Pal (Cataract & Phaco, Primary Refraction, Pediatric, Comprehensive)
UPDATE public.doctors 
SET specializations = '["Cataract & Phaco Surgery", "Primary Eye Check-up & Refraction (Optometry)", "Pediatric Ophthalmology", "Comprehensive Eyecheckup"]'::jsonb,
    specialty = 'Cataract & Phaco Surgery'
WHERE id = 'doc-1' OR name LIKE '%Manas Kr. Pal%';

-- 3. Update Dr. Abhisek Chaubey (Cataract & Phaco, Primary Refraction, Comprehensive)
UPDATE public.doctors 
SET specializations = '["Cataract & Phaco Surgery", "Primary Eye Check-up & Refraction (Optometry)", "Comprehensive Eyecheckup"]'::jsonb,
    specialty = 'Cataract & Phaco Surgery'
WHERE id = 'doc-6' OR name LIKE '%Abhisek Chaubey%';

-- 4. Update Dr. Anamika Paul (Cataract & Phaco, Primary Refraction, Glaucoma & Laser, Comprehensive)
UPDATE public.doctors 
SET specializations = '["Cataract & Phaco Surgery", "Primary Eye Check-up & Refraction (Optometry)", "Glaucoma & Laser Clinic", "Comprehensive Eyecheckup"]'::jsonb,
    specialty = 'Glaucoma & Laser Clinic'
WHERE id = 'doc-3' OR name LIKE '%Anamika Paul%';

-- 5. Update Dr. Q Shehnaz Waheed (Cataract & Phaco, Primary Refraction, Cornea & Ocular Surface, Comprehensive)
UPDATE public.doctors 
SET specializations = '["Cataract & Phaco Surgery", "Primary Eye Check-up & Refraction (Optometry)", "Cornea & Ocular Surface", "Comprehensive Eyecheckup"]'::jsonb,
    specialty = 'Cornea & Ocular Surface'
WHERE id = 'doc-4' OR name LIKE '%Q Shehnaz Waheed%';

-- 6. Update Dr. Avijit Roy (Primary Refraction, Comprehensive)
UPDATE public.doctors 
SET specializations = '["Primary Eye Check-up & Refraction (Optometry)", "Comprehensive Eyecheckup"]'::jsonb,
    specialty = 'Primary Eye Check-up & Refraction (Optometry)'
WHERE id = 'doc-2' OR name LIKE '%Avijit Roy%';

-- 7. Update Opt. Kanchan Chatterjee (Primary Refraction, Comprehensive)
UPDATE public.doctors 
SET specializations = '["Primary Eye Check-up & Refraction (Optometry)", "Comprehensive Eyecheckup"]'::jsonb,
    specialty = 'Primary Eye Check-up & Refraction (Optometry)'
WHERE id = 'doc-7' OR name LIKE '%Kanchan Chatterjee%';
