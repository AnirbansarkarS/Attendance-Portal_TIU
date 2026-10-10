"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import "./landing.css";

// ─────────────────────────────────────────────
//  MOCK DATA
// ─────────────────────────────────────────────
const STATS = [
  { value: "94%", label: "Average Attendance Rate", icon: "📊" },
  { value: "1,200+", label: "Active Students", icon: "🎓" },
  { value: "48", label: "Subjects Offered", icon: "📚" },
  { value: "0 mins", label: "Manual Work Saved/Day", icon: "⚡" },
];

const FEATURES = [
  {
    icon: "🔍",
    title: "OCR Attendance",
    desc: "Snap a photo of any handwritten attendance sheet. Our AI engine reads, parses and logs every entry in seconds — even messy handwriting.",
    tag: "Powered by Tesseract AI",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
  },
  {
    icon: "📐",
    title: "Academic Structure Builder",
    desc: "Model your entire university hierarchy — Departments → Programs → Batches → Classes → Subjects → Subject Offerings — in minutes.",
    tag: "Coordinator Tool",
    color: "#0ea5e9",
    bg: "rgba(14,165,233,0.08)",
  },
  {
    icon: "👨‍🏫",
    title: "Teacher Workspace",
    desc: "Teachers see only their assigned subjects and classes. Take attendance, manage marks, upload notes — all from one clean dashboard.",
    tag: "Role-Based Access",
    color: "#450c3f",
    bg: "rgba(69,12,63,0.08)",
  },
  {
    icon: "🎓",
    title: "Student Portal",
    desc: "Students get real-time attendance %, upcoming lectures, subject details, notes and quiz schedules — personalized to their enrolled class.",
    tag: "Student View",
    color: "#0a5cc7",
    bg: "rgba(10,92,199,0.08)",
  },
  {
    icon: "📊",
    title: "Excel Import & Export",
    desc: "Bulk-import student marks and attendance from existing Excel workbooks. Export audit-ready reports in one click.",
    tag: "Zero Migration Pain",
    color: "#059669",
    bg: "rgba(5,150,105,0.08)",
  },
  {
    icon: "🛡️",
    title: "RLS Security",
    desc: "Row Level Security enforced at the database layer. Teachers can't see other teachers' data. Admins have full oversight. No trust issues.",
    tag: "Supabase + PostgreSQL",
    color: "#d97706",
    bg: "rgba(217,119,6,0.08)",
  },
];

const ROLES = [
  {
    role: "Super Admin",
    emoji: "⚡",
    color: "#f59e0b",
    desc: "Verify users, assign roles, monitor the entire institution from a single control panel.",
    actions: ["Approve / Reject / Suspend users", "Change user roles instantly", "System-wide attendance overview"],
    bg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    border: "#fcd34d",
  },
  {
    role: "Coordinator",
    emoji: "👔",
    color: "#3b82f6",
    desc: "Build the academic skeleton — programs, classes, subjects — and link teachers to their classes.",
    actions: ["Create Departments & Programs", "Assign Teachers to Subject Offerings", "Manage Routines & Enrollments"],
    bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    border: "#93c5fd",
  },
  {
    role: "Teacher",
    emoji: "👨‍🏫",
    color: "#450c3f",
    desc: "A focused workspace showing only your assigned subjects, your students, and your schedule.",
    actions: ["OCR Photo Attendance", "Manual Attendance Override", "Marks Management & Excel Export"],
    bg: "linear-gradient(135deg, #fdf4ff 0%, #f5fbda 100%)",
    border: "#b9d175",
  },
  {
    role: "Student",
    emoji: "🎓",
    color: "#1b2cc1",
    desc: "Track attendance, view upcoming classes, access subject materials and grades in one place.",
    actions: ["Live Attendance Percentage", "Subject Cards with Teacher Info", "Today's Class Schedule"],
    bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    border: "#7692ff",
  },
];

const TESTIMONIALS = [
  {
    name: "Dr. Anjali Sharma",
    role: "HOD — Computer Science",
    quote: "Dr. Campus cut our attendance reconciliation time from 3 hours to under 5 minutes per week. The OCR feature alone is worth it.",
    avatar: "AS",
    color: "#450c3f",
  },
  {
    name: "Rahul Mehta",
    role: "Coordinator, TIU",
    quote: "Setting up 12 classes, 40 subjects and assigning all teachers took me 20 minutes. It would have taken days on our old system.",
    avatar: "RM",
    color: "#1b2cc1",
  },
  {
    name: "Priya Bose",
    role: "B.Tech CSE — Semester 5",
    quote: "I can check my attendance for every subject in real time. No more guessing if I'm going to be detained!",
    avatar: "PB",
    color: "#059669",
  },
];

const WORKFLOW_STEPS = [
  { step: "01", title: "Admin Verifies Users", desc: "Coordinators, Teachers and Students register. Super Admin approves in one click.", icon: "✅" },
  { step: "02", title: "Coordinator Builds Structure", desc: "Departments, Classes, Subjects, and Teacher Assignments set up in minutes.", icon: "🏗️" },
  { step: "03", title: "Teachers Take Attendance", desc: "Upload a handwritten sheet photo. OCR auto-fills the roster. Done.", icon: "📸" },
  { step: "04", title: "Students Track Progress", desc: "Live attendance %, schedules and subject pages — all in one dashboard.", icon: "📱" },
];

// ─────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────
export default function LandingPage() {
  const [activeRole, setActiveRole] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [demoStat, setDemoStat] = useState({ students: 0, subjects: 0, teachers: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Count-up animation
  useEffect(() => {
    const targets = { students: 1248, subjects: 48, teachers: 64 };
    const duration = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDemoStat({
        students: Math.round(targets.students * ease),
        subjects: Math.round(targets.subjects * ease),
        teachers: Math.round(targets.teachers * ease),
      });
      if (progress < 1) requestAnimationFrame(tick);
    };
    const t = setTimeout(() => requestAnimationFrame(tick), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="lp-root">
      {/* NAV */}
      <nav className={`lp-nav${scrolled ? " scrolled" : ""}`}>
        <a href="#" className="lp-logo">
          <div className="lp-logo-icon">🎓</div>
          <span className="lp-logo-text">Dr. Campus</span>
        </a>
        <ul className="lp-nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how-it-works">How it works</a></li>
          <li><a href="#roles">Roles</a></li>
          <li><a href="#testimonials">Reviews</a></li>
        </ul>
        <div className="lp-nav-btns">
          <Link href="/" className="lp-btn-ghost">Sign In</Link>
          <Link href="/" className="lp-btn-primary">Get Started Free →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero" ref={heroRef}>
        <div className="hero-glow" />
        <div className="hero-grid" />

        <div className="hero-badge">
          <div className="hero-badge-dot" />
          Now with AI-powered OCR Attendance
        </div>

        <h1 className="hero-title">
          <span className="hero-title-gradient">The OS for your</span>
          <br />
          <span className="hero-title-gradient">entire university</span>
        </h1>

        <p className="hero-sub">
          Dr. Campus connects Super Admin, Coordinators, Teachers and Students in one intelligent academic platform. From OCR attendance to real-time subject tracking — automated, auditable, beautiful.
        </p>

        <div className="hero-ctas">
          <Link href="/" className="hero-cta-primary">
            🚀 Start for Free
          </Link>
          <a href="#features" className="hero-cta-secondary">
            ▶ See Features
          </a>
        </div>

        {/* DASHBOARD MOCKUP */}
        <div className="hero-mockup-wrap">
          <div className="mockup-glow" />
          <div className="mockup-frame">
            <div className="mockup-topbar">
              <div className="mock-dot" style={{ background: "#ff5f57" }} />
              <div className="mock-dot" style={{ background: "#ffbd2e" }} />
              <div className="mock-dot" style={{ background: "#28ca41" }} />
            </div>
            <div className="mockup-body">
              {/* Sidebar */}
              <div className="mock-sidebar">
                <div className="mock-brand">
                  <div className="mock-brand-icon">🎓</div>
                  Dr. Campus
                </div>
                {[
                  { icon: "📊", label: "Dashboard", active: true },
                  { icon: "🏫", label: "Classes" },
                  { icon: "📚", label: "Subjects" },
                  { icon: "👥", label: "Students" },
                  { icon: "📅", label: "Attendance" },
                  { icon: "📈", label: "Reports" },
                  { icon: "⚙️", label: "Settings" },
                ].map((item) => (
                  <div key={item.label} className={`mock-nav-item${item.active ? " active" : ""}`}>
                    <span>{item.icon}</span>
                    {item.label}
                  </div>
                ))}
              </div>

              {/* Main */}
              <div className="mock-main">
                <div className="mock-header-row">
                  <div>
                    <div className="mock-title">Dashboard</div>
                    <div className="mock-subtitle">Academic Overview — Semester 5 · 2026-2027</div>
                  </div>
                  <div className="mock-pill">+ New Session</div>
                </div>

                <div className="mock-stats-row">
                  <div className="mock-stat">
                    <div className="mock-stat-val">{demoStat.students}</div>
                    <div className="mock-stat-label">Students</div>
                  </div>
                  <div className="mock-stat">
                    <div className="mock-stat-val">{demoStat.subjects}</div>
                    <div className="mock-stat-label">Subjects</div>
                  </div>
                  <div className="mock-stat">
                    <div className="mock-stat-val">{demoStat.teachers}</div>
                    <div className="mock-stat-label">Teachers</div>
                  </div>
                  <div className="mock-stat">
                    <div className="mock-stat-val" style={{ color: "#34d399" }}>94%</div>
                    <div className="mock-stat-label">Avg. Attendance</div>
                  </div>
                </div>

                <div className="mock-cards-row">
                  {[
                    { icon: "🗄️", bg: "rgba(99,102,241,0.15)", title: "DBMS", sub: "CS501 · CSE-A · 38 students", pct: 92 },
                    { icon: "⚙️", bg: "rgba(234,179,8,0.15)", title: "Operating Systems", sub: "CS502 · CSE-B · 35 students", pct: 87 },
                    { icon: "🌐", bg: "rgba(5,150,105,0.15)", title: "Computer Networks", sub: "CS503 · CSE-A · 38 students", pct: 96 },
                  ].map((c) => (
                    <div className="mock-card" key={c.title}>
                      <div className="mock-card-header">
                        <div className="mock-card-icon" style={{ background: c.bg }}>{c.icon}</div>
                        <div>
                          <div className="mock-card-title">{c.title}</div>
                          <div className="mock-card-sub">{c.sub}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: "auto" }}>{c.pct}% attendance</div>
                      <div className="mock-bar-track">
                        <div className="mock-bar-fill" style={{ width: `${c.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <div className="stats-band">
        <div className="stats-band-inner">
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div className="stat-item-icon">{s.icon}</div>
              <div className="stat-item-val">{s.value}</div>
              <div className="stat-item-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="lp-divider" />

      {/* FEATURES */}
      <section className="lp-section" id="features">
        <div className="lp-section-label">FEATURES</div>
        <h2 className="lp-section-title">Everything your campus needs.</h2>
        <p className="lp-section-sub">
          From AI attendance to student portals, Dr. Campus replaces a dozen disconnected spreadsheets with one intelligent system.
        </p>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="feat-card"
              style={{ "--feat-color": f.color } as any}
            >
              <div className="feat-icon" style={{ background: f.bg }}>
                {f.icon}
              </div>
              <div
                className="feat-tag"
                style={{ color: f.color, background: f.bg, borderColor: `${f.color}30` }}
              >
                {f.tag}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="lp-divider" />

      {/* HOW IT WORKS */}
      <section className="lp-section" id="how-it-works">
        <div className="lp-section-label">HOW IT WORKS</div>
        <h2 className="lp-section-title">Up and running in one afternoon.</h2>
        <p className="lp-section-sub">
          Four simple steps — and your entire institution is live.
        </p>
        <div className="workflow-grid">
          {WORKFLOW_STEPS.map((w) => (
            <div className="workflow-step" key={w.step}>
              <div className="workflow-step-icon">{w.icon}</div>
              <div className="workflow-step-num">STEP {w.step}</div>
              <h3>{w.title}</h3>
              <p>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE DEMO / ATTENDANCE CARD */}
      <div className="live-demo-section">
        <div className="live-demo-inner">
          <div className="live-demo-text">
            <div className="lp-section-label" style={{ textAlign: "left" }}>LIVE DEMO</div>
            <h2 className="live-demo-title">OCR Attendance — <br />snap, parse, done.</h2>
            <p className="live-demo-sub">
              Upload any handwritten attendance sheet. Dr. Campus reads every student code using AI-powered OCR and auto-marks Present / Absent — in under 30 seconds.
            </p>
            <div className="live-demo-counters">
              <div>
                <div className="counter-item-val">{demoStat.students.toLocaleString()}</div>
                <div className="counter-item-label">Students Tracked</div>
              </div>
              <div>
                <div className="counter-item-val">{demoStat.subjects}</div>
                <div className="counter-item-label">Active Subjects</div>
              </div>
              <div>
                <div className="counter-item-val">{demoStat.teachers}</div>
                <div className="counter-item-label">Teachers</div>
              </div>
            </div>
          </div>
          <div className="live-demo-visual">
            <div className="attendance-card-demo">
              <div className="att-header">
                <div>
                  <div className="att-title">Attendance — DBMS (CS501)</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>CSE-A · Monday 10:00–11:00 · Room 204</div>
                </div>
                <div className="att-badge">✅ Session Active</div>
              </div>
              {[
                { init: "AP", name: "Aarav Patel", id: "BCS24001", status: "P", ocr: true },
                { init: "PB", name: "Priya Bose", id: "BCS24002", status: "P", ocr: true },
                { init: "RK", name: "Rohit Kumar", id: "BCS24003", status: "A", ocr: false },
                { init: "SS", name: "Sneha Sharma", id: "BCS24004", status: "P", ocr: true },
                { init: "AM", name: "Arjun Mehta", id: "BCS24005", status: "P", ocr: true },
              ].map((s) => (
                <div className="att-row" key={s.id}>
                  <div className="att-student">
                    <div className="att-avatar">{s.init}</div>
                    <div>
                      <div className="att-name">{s.name}</div>
                      <div className="att-id">{s.id}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {s.ocr && <div className="att-ocr-tag">OCR</div>}
                    <div className={s.status === "P" ? "att-status-p" : "att-status-a"}>
                      {s.status === "P" ? "Present" : "Absent"}
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(99,102,241,0.08)", borderRadius: 10, color: "#a78bfa", fontSize: 12, fontWeight: 600 }}>
                📊 4/5 Present · 80% · 1 Absent — Save Session
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROLES */}
      <section className="lp-section" id="roles">
        <div className="lp-section-label">ROLE-BASED PORTAL</div>
        <h2 className="lp-section-title">One platform, four powerful views.</h2>
        <p className="lp-section-sub">
          Every user gets a focused, personalized dashboard — no clutter, no confusion.
        </p>
        <div className="roles-tabs">
          {ROLES.map((r, i) => (
            <button
              key={r.role}
              className={`role-tab-btn${activeRole === i ? " active" : ""}`}
              onClick={() => setActiveRole(i)}
            >
              {r.emoji} {r.role}
            </button>
          ))}
        </div>
        {ROLES.map((r, i) =>
          activeRole === i ? (
            <div
              key={r.role}
              className="role-content-card"
              style={{ background: r.bg, border: `1px solid ${r.border}` }}
            >
              <div className="role-content-inner">
                <div className="role-big-emoji">{r.emoji}</div>
                <div>
                  <h3 className="role-title" style={{ color: r.color }}>{r.role}</h3>
                  <p className="role-desc">{r.desc}</p>
                  <ul className="role-actions">
                    {r.actions.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null
        )}
      </section>

      <div className="lp-divider" />

      {/* TESTIMONIALS */}
      <section className="lp-section" id="testimonials">
        <div className="lp-section-label">TESTIMONIALS</div>
        <h2 className="lp-section-title">Loved by educators & students.</h2>
        <p className="lp-section-sub">
          Real voices from institutions running Dr. Campus today.
        </p>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t) => (
            <div className="testimonial-card" key={t.name}>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-quote">"{t.quote}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: t.color }}>
                  {t.avatar}
                </div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <div className="cta-banner">
        <h2 className="cta-banner-title">Ready to modernize your campus?</h2>
        <p className="cta-banner-sub">
          Join hundreds of institutions using Dr. Campus to automate attendance, manage academic structures and empower every stakeholder.
        </p>
        <div className="cta-banner-btns">
          <Link href="/" className="cta-big-btn">
            🚀 Get Started Free
          </Link>
          <a href="#features" className="hero-cta-secondary" style={{ borderColor: "rgba(255,255,255,0.2)", color: "#c7d2fe" }}>
            Learn more →
          </a>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="footer-inner">
          <div>
            <a href="#" className="lp-logo" style={{ textDecoration: "none" }}>
              <div className="lp-logo-icon">🎓</div>
              <span className="lp-logo-text">Dr. Campus</span>
            </a>
            <p className="footer-brand-desc">
              The intelligent academic management platform for universities and colleges. OCR attendance, role-based dashboards, Excel exports and full RLS security.
            </p>
            <div style={{ fontSize: "0.8rem", color: "#334155" }}>
              Built on Next.js · Supabase · PostgreSQL
            </div>
          </div>
          <div>
            <div className="footer-col-title">Product</div>
            <ul className="footer-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How it works</a></li>
              <li><a href="#roles">Role Dashboards</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Platform</div>
            <ul className="footer-links">
              <li><a href="/">Student Portal</a></li>
              <li><a href="/">Teacher Workspace</a></li>
              <li><a href="/">Coordinator Tools</a></li>
              <li><a href="/">Admin Control</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Resources</div>
            <ul className="footer-links">
              <li><a href="#">Documentation</a></li>
              <li><a href="#">API Reference</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Support</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 Dr. Campus. All rights reserved.</div>
          <div className="footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
