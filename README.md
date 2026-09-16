# Attendance AI v2

A Vercel-ready Next.js + Supabase web app for the supplied BCS 2A/2B/2C/2D workbook.

## Features
- Teacher login with Supabase Auth
- Full Excel workbook import (all four Attendance sheets and all four Marks sheets)
- Excel-style attendance table with date columns, P/A, Total Attended, Total Held and Overall Percentage
- Excel-style marks table with assessment values, top-five LIA(10), calculated LIA(16), LAB, VIVA and Total
- Daily attendance photo upload
- Browser OCR with Tesseract.js for the last 4 Student-ID digits
- Batch-restricted matching and manual verification
- Saving P/A for every student on the selected date (unlisted students become A)
- Excel export
- Responsive dashboard

## 1. Supabase
1. Create a Supabase project.
2. SQL Editor -> New query.
3. Paste the complete `supabase/schema.sql` and Run.
4. Authentication -> Users -> Add user -> create the teacher account.
5. Settings -> API Keys -> copy the Project URL and Publishable key.

## 2. Local environment
Create `.env.local` in the project root:

NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_KEY

Do not put a Supabase secret/service-role key in frontend code.

## 3. Run
npm install
npm run dev

Open http://localhost:3000

## 4. Import the supplied workbook
Login -> Dashboard -> Import Complete Excel -> choose the workbook.
The app imports students, existing P/A attendance, marks, and the detected assessment headers.

## 5. Vercel
Push this folder to GitHub, import the repository into Vercel, then add the same two environment variables under Project Settings -> Environment Variables. Redeploy.

## Important OCR limitation
Tesseract.js runs in the user's browser. Handwritten digits can be difficult for generic OCR. Always use the verification table before saving. If your actual attendance sheet has a consistent handwriting/layout, the OCR can later be upgraded with image preprocessing or a dedicated handwriting model.
