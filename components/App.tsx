"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

import type { User } from "@supabase/supabase-js";

import { createWorker } from "tesseract.js";

import * as XLSX from "xlsx";

import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  Database,
  Download,
  FileSpreadsheet,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Trash2,
  Upload,
  Users,
} from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

type Tab =
  | "dashboard"
  | "setup"
  | "students"
  | "attendance"
  | "reports"
  | "marks";

type Department = {
  id: string;
  name: string;
  code: string | null;
  is_active: boolean;
  created_at?: string;
};

type Batch = {
  id: string;
  department_id: string;
  name: string;
  is_active: boolean;
  created_at?: string;
};

type StudentGroup = {
  id: string;
  batch_id: string;
  name: string;
  is_active: boolean;
  created_at?: string;
};

type Student = {
  id: string;
  student_id: string;
  name: string;
  slr: string | null;
  department_id: string;
  batch_id: string;
  group_id: string;
  attendance_code: string;
  is_active: boolean;
  created_at?: string;
};

type AttendanceStatus = "P" | "A";

type AttendanceRow = {
  student: Student;
  status: AttendanceStatus;
  detected: boolean;
};

type Assessment = {
  id: string;
  department_id: string;
  batch_id: string;
  name: string;
  assessment_type: string;
  max_marks: number;
  assessment_date: string | null;
  is_active: boolean;
  created_at?: string;
};

type Mark = {
  id?: string;
  assessment_id: string;
  student_id: string;
  marks: number | null;
};

type ImportStudent = {
  student_id: string;
  name: string;
  slr: string | null;
  department_id: string;
  batch_id: string;
  group_id: string;
};

type ReportSession = {
  id: string;
  attendance_date: string;
  department_id: string;
  batch_id: string;
  group_id: string;
};

type ReportRecord = {
  id: string;
  session_id: string;
  student_id: string;
  status: "P" | "A";
  detected_code: string | null;
};


/* ============================================================
   MAIN APP
============================================================ */

export default function App({
  user,
}: {
  user: User;
}) {
  const [tab, setTab] = useState<Tab>("dashboard");

  const [departments, setDepartments] = useState<Department[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function notify(text: string) {
    setMessage(text);
    setError("");

    window.setTimeout(() => {
      setMessage("");
    }, 4000);
  }

  function showError(text: string) {
    setError(text);
    setMessage("");

    window.setTimeout(() => {
      setError("");
    }, 6000);
  }

  async function loadAll() {
    setLoading(true);

    const [
      departmentsResult,
      batchesResult,
      groupsResult,
      studentsResult,
      assessmentsResult,
    ] = await Promise.all([
      supabase
        .from("departments")
        .select("*")
        .order("name", {
          ascending: true,
        }),

      supabase
        .from("batches")
        .select("*")
        .order("name", {
          ascending: true,
        }),

      supabase
        .from("student_groups")
        .select("*")
        .order("name", {
          ascending: true,
        }),

      supabase
        .from("students")
        .select("*")
        .order("name", {
          ascending: true,
        }),

      supabase
        .from("assessments")
        .select("*")
        .order("created_at", {
          ascending: false,
        }),
    ]);

    if (departmentsResult.error) {
      showError(departmentsResult.error.message);
    }

    if (batchesResult.error) {
      showError(batchesResult.error.message);
    }

    if (groupsResult.error) {
      showError(groupsResult.error.message);
    }

    if (studentsResult.error) {
      showError(studentsResult.error.message);
    }

    if (assessmentsResult.error) {
      showError(assessmentsResult.error.message);
    }

    setDepartments(
      (departmentsResult.data as Department[]) || []
    );

    setBatches(
      (batchesResult.data as Batch[]) || []
    );

    setGroups(
      (groupsResult.data as StudentGroup[]) || []
    );

    setStudents(
      (studentsResult.data as Student[]) || []
    );

    setAssessments(
      (assessmentsResult.data as Assessment[]) || []
    );

    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <div className="app-shell">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            <CalendarCheck size={25} />
          </div>

          <div>
            <strong>Attendance Portal</strong>
            <span>Academic System</span>
          </div>

        </div>


        <nav className="nav-menu">

          <NavButton
            active={tab === "dashboard"}
            icon={<BarChart3 size={18} />}
            label="Dashboard"
            onClick={() => setTab("dashboard")}
          />

          <NavButton
            active={tab === "setup"}
            icon={<Settings size={18} />}
            label="Academic Setup"
            onClick={() => setTab("setup")}
          />

          <NavButton
            active={tab === "students"}
            icon={<Users size={18} />}
            label="Students"
            onClick={() => setTab("students")}
          />

          <NavButton
            active={tab === "attendance"}
            icon={<CalendarCheck size={18} />}
            label="Take Attendance"
            onClick={() => setTab("attendance")}
          />

          <NavButton
            active={tab === "reports"}
            icon={<ClipboardList size={18} />}
            label="Attendance Report"
            onClick={() => setTab("reports")}
          />

          <NavButton
            active={tab === "marks"}
            icon={<BookOpen size={18} />}
            label="Marks"
            onClick={() => setTab("marks")}
          />

        </nav>


        <div className="sidebar-bottom">

          <div className="user-box">

            <div className="avatar">
              {(user.email || "T")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="user-info">

              <strong>Teacher</strong>

              <span>
                {user.email}
              </span>

            </div>

          </div>


          <button
            className="logout-btn"
            onClick={logout}
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="main-content">

        <header className="topbar">

          <div>

            <h1>
              {tab === "dashboard" &&
                "Dashboard"}

              {tab === "setup" &&
                "Academic Setup"}

              {tab === "students" &&
                "Student Management"}

              {tab === "attendance" &&
                "Take Attendance"}

              {tab === "reports" &&
                "Attendance Report"}

              {tab === "marks" &&
                "Marks Management"}
            </h1>

            <p>
              Manage your academic records efficiently
            </p>

          </div>


          <button
            className="refresh-btn"
            onClick={loadAll}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

        </header>


        {/* ALERT */}

        {message && (
          <div className="success-alert">
            {message}
          </div>
        )}

        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}


        {/* CONTENT */}

        {loading ? (
          <div className="loading-card">

            <div className="loader"></div>

            <p>
              Loading application data...
            </p>

          </div>
        ) : (

          <>
            {tab === "dashboard" && (
              <Dashboard
                departments={departments}
                batches={batches}
                groups={groups}
                students={students}
                assessments={assessments}
                onNavigate={setTab}
              />
            )}


            {tab === "setup" && (
              <Setup
                departments={departments}
                batches={batches}
                groups={groups}
                onReload={loadAll}
                notify={notify}
                showError={showError}
              />
            )}


            {tab === "students" && (
              <StudentsPage
                departments={departments}
                batches={batches}
                groups={groups}
                students={students}
                onReload={loadAll}
                notify={notify}
                showError={showError}
              />
            )}


            {tab === "attendance" && (
              <AttendancePage
                departments={departments}
                batches={batches}
                groups={groups}
                students={students}
                onReload={loadAll}
                notify={notify}
                showError={showError}
              />
            )}


            {tab === "reports" && (
              <ReportsPage
                departments={departments}
                batches={batches}
                groups={groups}
                students={students}
                showError={showError}
              />
            )}


            {tab === "marks" && (
              <MarksPage
                departments={departments}
                batches={batches}
                groups={groups}
                students={students}
                assessments={assessments}
                onReload={loadAll}
                notify={notify}
                showError={showError}
              />
            )}
          </>

        )}

      </main>

    </div>
  );
}


/* ============================================================
   NAV BUTTON
============================================================ */

function NavButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`nav-btn ${
        active ? "active" : ""
      }`}
      onClick={onClick}
    >
      {icon}

      <span>{label}</span>

      {active && (
        <ChevronRight size={16} />
      )}
    </button>
  );
}


/* ============================================================
   DASHBOARD
============================================================ */

function Dashboard({
  departments,
  batches,
  groups,
  students,
  assessments,
  onNavigate,
}: {
  departments: Department[];
  batches: Batch[];
  groups: StudentGroup[];
  students: Student[];
  assessments: Assessment[];
  onNavigate: (tab: Tab) => void;
}) {
  return (
    <div className="page">

      <div className="welcome-card">

        <div>

          <span className="eyebrow">
            Academic Management
          </span>

          <h2>
            Welcome to Attendance Portal
          </h2>

          <p>
            Manage departments, batches,
            students, attendance and marks
            from one place.
          </p>

        </div>

        <CalendarCheck size={90} />

      </div>


      <div className="stats-grid">

        <StatCard
          icon={<Database />}
          value={departments.length}
          label="Departments"
        />

        <StatCard
          icon={<BookOpen />}
          value={batches.length}
          label="Batches"
        />

        <StatCard
          icon={<Users />}
          value={groups.length}
          label="Groups"
        />

        <StatCard
          icon={<Users />}
          value={students.length}
          label="Students"
        />

        <StatCard
          icon={<ClipboardList />}
          value={assessments.length}
          label="Assessments"
        />

      </div>


      <div className="quick-grid">

        <QuickCard
          title="Academic Setup"
          text="Create departments, batches and groups."
          icon={<Settings />}
          onClick={() =>
            onNavigate("setup")
          }
        />

        <QuickCard
          title="Add Students"
          text="Add or import student records."
          icon={<Users />}
          onClick={() =>
            onNavigate("students")
          }
        />

        <QuickCard
          title="Take Attendance"
          text="Upload handwritten attendance photo and verify OCR."
          icon={<CalendarCheck />}
          onClick={() =>
            onNavigate("attendance")
          }
        />

        <QuickCard
          title="Attendance Report"
          text="View present, absent and attendance percentage."
          icon={<BarChart3 />}
          onClick={() =>
            onNavigate("reports")
          }
        />

      </div>

    </div>
  );
}


function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div>

        <strong>{value}</strong>

        <span>{label}</span>

      </div>

    </div>
  );
}


function QuickCard({
  title,
  text,
  icon,
  onClick,
}: {
  title: string;
  text: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className="quick-card"
      onClick={onClick}
    >

      <div className="quick-icon">
        {icon}
      </div>

      <div>

        <h3>{title}</h3>

        <p>{text}</p>

      </div>

      <ChevronRight />

    </button>
  );
}


/* ============================================================
   ACADEMIC SETUP
============================================================ */

function Setup({
  departments,
  batches,
  groups,
  onReload,
  notify,
  showError,
}: {
  departments: Department[];
  batches: Batch[];
  groups: StudentGroup[];
  onReload: () => Promise<void>;
  notify: (text: string) => void;
  showError: (text: string) => void;
}) {

  const [departmentName, setDepartmentName] =
    useState("");

  const [departmentCode, setDepartmentCode] =
    useState("");

  const [batchDepartment, setBatchDepartment] =
    useState("");

  const [batchName, setBatchName] =
    useState("");

  const [groupBatch, setGroupBatch] =
    useState("");

  const [groupName, setGroupName] =
    useState("");


  async function addDepartment() {

    if (!departmentName.trim()) {
      showError(
        "Department name is required."
      );
      return;
    }

    const { error } =
      await supabase
        .from("departments")
        .insert({
          name: departmentName.trim(),
          code:
            departmentCode.trim() ||
            null,
        });

    if (error) {
      showError(error.message);
      return;
    }

    setDepartmentName("");
    setDepartmentCode("");

    notify(
      "Department created successfully."
    );

    await onReload();
  }


  async function addBatch() {

    if (
      !batchDepartment ||
      !batchName.trim()
    ) {
      showError(
        "Select department and enter batch name."
      );
      return;
    }

    const { error } =
      await supabase
        .from("batches")
        .insert({
          department_id:
            batchDepartment,
          name: batchName.trim(),
        });

    if (error) {
      showError(error.message);
      return;
    }

    setBatchName("");

    notify(
      "Batch created successfully."
    );

    await onReload();
  }


  async function addGroup() {

    if (
      !groupBatch ||
      !groupName.trim()
    ) {
      showError(
        "Select batch and enter group name."
      );
      return;
    }

    const { error } =
      await supabase
        .from("student_groups")
        .insert({
          batch_id: groupBatch,
          name: groupName.trim(),
        });

    if (error) {
      showError(error.message);
      return;
    }

    setGroupName("");

    notify(
      "Group created successfully."
    );

    await onReload();
  }


  async function deactivate(
    table:
      | "departments"
      | "batches"
      | "student_groups",
    id: string
  ) {

    const { error } =
      await supabase
        .from(table)
        .update({
          is_active: false,
        })
        .eq("id", id);

    if (error) {
      showError(error.message);
      return;
    }

    notify("Item deactivated.");

    await onReload();
  }


  return (
    <div className="page">

      <div className="section-grid">

        {/* DEPARTMENTS */}

        <div className="panel">

          <div className="panel-header">

            <div>
              <h2>Departments</h2>

              <p>
                Create and manage departments.
              </p>
            </div>

            <Database />

          </div>


          <input
            placeholder="Department name e.g. CSE"
            value={departmentName}
            onChange={(e) =>
              setDepartmentName(
                e.target.value
              )
            }
          />


          <input
            placeholder="Code e.g. CSE"
            value={departmentCode}
            onChange={(e) =>
              setDepartmentCode(
                e.target.value
              )
            }
          />


          <button
            className="primary-btn"
            onClick={addDepartment}
          >
            <Plus size={17} />
            Add Department
          </button>


          <div className="item-list">

            {departments
              .filter(
                (d) => d.is_active
              )
              .map((department) => (

                <div
                  className="list-item"
                  key={department.id}
                >

                  <div>

                    <strong>
                      {department.name}
                    </strong>

                    <span>
                      {department.code ||
                        "No code"}
                    </span>

                  </div>


                  <button
                    className="icon-danger"
                    onClick={() =>
                      deactivate(
                        "departments",
                        department.id
                      )
                    }
                  >
                    <Trash2 size={16} />
                  </button>

                </div>

              ))}

          </div>

        </div>


        {/* BATCHES */}

        <div className="panel">

          <div className="panel-header">

            <div>

              <h2>Batches</h2>

              <p>
                Create batches under departments.
              </p>

            </div>

            <BookOpen />

          </div>


          <select
            value={batchDepartment}
            onChange={(e) =>
              setBatchDepartment(
                e.target.value
              )
            }
          >

            <option value="">
              Select Department
            </option>

            {departments
              .filter(
                (d) => d.is_active
              )
              .map((d) => (

                <option
                  key={d.id}
                  value={d.id}
                >
                  {d.name}
                </option>

              ))}

          </select>


          <input
            placeholder="Batch name e.g. BCS 2A"
            value={batchName}
            onChange={(e) =>
              setBatchName(
                e.target.value
              )
            }
          />


          <button
            className="primary-btn"
            onClick={addBatch}
          >
            <Plus size={17} />
            Add Batch
          </button>


          <div className="item-list">

            {batches
              .filter(
                (b) => b.is_active
              )
              .map((batch) => {

                const department =
                  departments.find(
                    (d) =>
                      d.id ===
                      batch.department_id
                  );

                return (
                  <div
                    className="list-item"
                    key={batch.id}
                  >

                    <div>

                      <strong>
                        {batch.name}
                      </strong>

                      <span>
                        {department?.name ||
                          "-"}
                      </span>

                    </div>


                    <button
                      className="icon-danger"
                      onClick={() =>
                        deactivate(
                          "batches",
                          batch.id
                        )
                      }
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>
                );
              })}

          </div>

        </div>


        {/* GROUPS */}

        <div className="panel">

          <div className="panel-header">

            <div>

              <h2>Groups</h2>

              <p>
                Create groups under batches.
              </p>

            </div>

            <Users />

          </div>


          <select
            value={groupBatch}
            onChange={(e) =>
              setGroupBatch(
                e.target.value
              )
            }
          >

            <option value="">
              Select Batch
            </option>

            {batches
              .filter(
                (b) => b.is_active
              )
              .map((b) => (

                <option
                  key={b.id}
                  value={b.id}
                >
                  {b.name}
                </option>

              ))}

          </select>


          <input
            placeholder="Group name e.g. A"
            value={groupName}
            onChange={(e) =>
              setGroupName(
                e.target.value
              )
            }
          />


          <button
            className="primary-btn"
            onClick={addGroup}
          >
            <Plus size={17} />
            Add Group
          </button>


          <div className="item-list">

            {groups
              .filter(
                (g) => g.is_active
              )
              .map((group) => {

                const batch =
                  batches.find(
                    (b) =>
                      b.id ===
                      group.batch_id
                  );

                return (
                  <div
                    className="list-item"
                    key={group.id}
                  >

                    <div>

                      <strong>
                        Group {group.name}
                      </strong>

                      <span>
                        {batch?.name ||
                          "-"}
                      </span>

                    </div>


                    <button
                      className="icon-danger"
                      onClick={() =>
                        deactivate(
                          "student_groups",
                          group.id
                        )
                      }
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>
                );

              })}

          </div>

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   STUDENT MANAGEMENT
============================================================ */

function StudentsPage({
  departments,
  batches,
  groups,
  students,
  onReload,
  notify,
  showError,
}: {
  departments: Department[];
  batches: Batch[];
  groups: StudentGroup[];
  students: Student[];
  onReload: () => Promise<void>;
  notify: (text: string) => void;
  showError: (text: string) => void;
}) {

  const [department, setDepartment] =
    useState("");

  const [batch, setBatch] =
    useState("");

  const [group, setGroup] =
    useState("");

  const [studentId, setStudentId] =
    useState("");

  const [name, setName] =
    useState("");

  const [slr, setSlr] =
    useState("");

  const [search, setSearch] =
    useState("");

  /* ----------------------------------------------------------
     EXCEL PREVIEW
  ---------------------------------------------------------- */

  const [showImportPreview, setShowImportPreview] =
    useState(false);

  const [importRows, setImportRows] =
    useState<ImportStudent[]>([]);

  const [importFileName, setImportFileName] =
    useState("");

  const [importing, setImporting] =
    useState(false);


  const filteredBatches =
    batches.filter(
      (b) =>
        b.department_id ===
          department &&
        b.is_active
    );


  const filteredGroups =
    groups.filter(
      (g) =>
        g.batch_id === batch &&
        g.is_active
    );


  const filteredStudents =
    students.filter((student) => {

      if (!student.is_active) {
        return false;
      }

      if (
        department &&
        student.department_id !==
          department
      ) {
        return false;
      }

      if (
        batch &&
        student.batch_id !== batch
      ) {
        return false;
      }

      if (
        group &&
        student.group_id !== group
      ) {
        return false;
      }

      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return true;
      }

      return (
        student.student_id
          .toLowerCase()
          .includes(query) ||

        student.name
          .toLowerCase()
          .includes(query) ||

        (student.slr || "")
          .toLowerCase()
          .includes(query)
      );
    });


  /* ----------------------------------------------------------
     ADD SINGLE STUDENT
  ---------------------------------------------------------- */

  async function addStudent() {

    if (
      !studentId.trim() ||
      !name.trim() ||
      !department ||
      !batch ||
      !group
    ) {
      showError(
        "Student ID, Name, Department, Batch and Group are required."
      );

      return;
    }


    const cleanStudentId =
      studentId.trim();


    const { error } =
      await supabase
        .from("students")
        .insert({
          student_id:
            cleanStudentId,

          name:
            name.trim(),

          slr:
            slr.trim() || null,

          department_id:
            department,

          batch_id:
            batch,

          group_id:
            group,
        });


    if (error) {

      showError(
        error.message
      );

      return;
    }


    setStudentId("");
    setName("");
    setSlr("");


    notify(
      "Student added successfully."
    );


    await onReload();
  }


  /* ----------------------------------------------------------
     NORMALIZE EXCEL HEADER
  ---------------------------------------------------------- */

  function normalizeExcelKey(
    key: string
  ) {
    return key
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "");
  }


  /* ----------------------------------------------------------
     GET VALUE FROM MULTIPLE POSSIBLE HEADERS
  ---------------------------------------------------------- */

  function getExcelValue(
    row: Record<string, unknown>,
    possibleKeys: string[]
  ): string {

    const normalizedRow:
      Record<string, string> = {};


    Object.entries(row).forEach(
      ([key, value]) => {

        normalizedRow[
          normalizeExcelKey(key)
        ] =
          String(
            value ?? ""
          ).trim();

      }
    );


    for (
      const key of possibleKeys
    ) {

      const value =
        normalizedRow[
          normalizeExcelKey(key)
        ];

      if (
        value !== undefined &&
        value !== ""
      ) {
        return value;
      }
    }


    return "";
  }


  /* ----------------------------------------------------------
     EXCEL FILE SELECT
  ---------------------------------------------------------- */

  async function handleExcelSelect(
    e: ChangeEvent<HTMLInputElement>
  ) {

    const file =
      e.target.files?.[0];


    if (!file) {
      return;
    }


    /*
     * Department / Batch / Group
     * must be selected from UI.
     */

    if (!department) {

      showError(
        "Please select Department first."
      );

      e.target.value = "";
      return;
    }


    if (!batch) {

      showError(
        "Please select Batch first."
      );

      e.target.value = "";
      return;
    }


    if (!group) {

      showError(
        "Please select Group first."
      );

      e.target.value = "";
      return;
    }


    try {

      const buffer =
        await file.arrayBuffer();


      const workbook =
        XLSX.read(
          buffer,
          {
            type: "array",
            cellDates: false,
          }
        );


      if (
        !workbook.SheetNames.length
      ) {

        showError(
          "Excel file has no sheets."
        );

        e.target.value = "";
        return;
      }


      let selectedSheet = "";

      let excelRows:
        Record<string, unknown>[] =
        [];


      /*
       * Search all sheets.
       */

      for (
        const sheetName
        of workbook.SheetNames
      ) {

        const sheet =
          workbook.Sheets[
            sheetName
          ];


        const rows =
          XLSX.utils.sheet_to_json<
            Record<string, unknown>
          >(
            sheet,
            {
              defval: "",
              raw: false,
            }
          );


        if (!rows.length) {
          continue;
        }


        /*
         * Check headers.
         */

        const firstRow =
          rows[0];


        const headers =
          Object.keys(
            firstRow
          ).map(
            normalizeExcelKey
          );


        const hasStudentId =
          headers.some(
            (header) =>
              [
                "studentid",
                "studentno",
                "studentnumber",
                "studentcode",
                "registrationno",
                "registrationnumber",
                "registrationid",
                "enrollmentno",
                "enrollmentnumber",
                "roll",
                "rollno",
                "rollnumber",
                "id",
              ].includes(header)
          );


        const hasName =
          headers.some(
            (header) =>
              [
                "name",
                "studentname",
                "studentfullname",
                "fullname",
                "student",
              ].includes(header)
          );


        if (
          hasStudentId &&
          hasName
        ) {

          selectedSheet =
            sheetName;

          excelRows =
            rows;

          break;
        }
      }


      if (
        !excelRows.length
      ) {

        showError(
          "No suitable student sheet found. Excel must contain Student ID and Name columns."
        );

        e.target.value = "";
        return;
      }


      /*
       * Convert Excel data.
       */

      const records:
        ImportStudent[] = [];


      for (
        const row
        of excelRows
      ) {

        const studentId =
          getExcelValue(
            row,
            [
              "Student ID",
              "StudentID",
              "Student Id",
              "Student No",
              "Student Number",
              "Student Code",
              "Registration No",
              "Registration Number",
              "Registration ID",
              "Enrollment No",
              "Enrollment Number",
              "Roll No",
              "Roll Number",
              "Roll",
              "ID",
            ]
          );


        const studentName =
          getExcelValue(
            row,
            [
              "Name",
              "Student Name",
              "StudentName",
              "Student Full Name",
              "Full Name",
              "Student",
            ]
          );


        const studentSlr =
          getExcelValue(
            row,
            [
              "SLR",
              "SLR No",
              "SLR Number",
              "SLR/Roll",
              "SLR Roll",
              "Class Roll",
              "Class Roll No",
            ]
          );


        /*
         * Ignore completely empty rows.
         */

        if (
          !studentId &&
          !studentName &&
          !studentSlr
        ) {
          continue;
        }


        /*
         * Invalid row.
         */

        if (
          !studentId ||
          !studentName
        ) {
          continue;
        }


        records.push({
          student_id:
            studentId.trim(),

          name:
            studentName.trim(),

          slr:
            studentSlr.trim() ||
            null,

          /*
           * IMPORTANT:
           * These come from the selected UI.
           */

          department_id:
            department,

          batch_id:
            batch,

          group_id:
            group,
        });
      }


      if (!records.length) {

        showError(
          "No valid student records found."
        );

        e.target.value = "";
        return;
      }


      /*
       * Remove duplicate Student IDs
       */

      const uniqueRecords =
        Array.from(
          new Map(
            records.map(
              (record) => [
                record.student_id,
                record,
              ]
            )
          ).values()
        );


      setImportRows(
        uniqueRecords
      );

      setImportFileName(
        file.name
      );

      setShowImportPreview(
        true
      );


      e.target.value = "";


    } catch (err) {

      console.error(
        "Excel reading error:",
        err
      );


      showError(
        err instanceof Error
          ? err.message
          : "Could not read Excel file."
      );


      e.target.value = "";
    }
  }


  /* ----------------------------------------------------------
     CONFIRM EXCEL IMPORT
  ---------------------------------------------------------- */

  async function confirmExcelImport() {

    if (!importRows.length) {

      showError(
        "There are no students to import."
      );

      return;
    }


    setImporting(true);


    try {

      const chunkSize =
        100;

      let imported =
        0;


      for (
        let i = 0;
        i < importRows.length;
        i += chunkSize
      ) {

        const chunk =
          importRows.slice(
            i,
            i + chunkSize
          );


        const { error } =
          await supabase
            .from("students")
            .upsert(
              chunk,
              {
                onConflict:
                  "student_id",
              }
            );


        if (error) {

          console.error(
            "Supabase import error:",
            error
          );

          showError(
            `Import failed: ${error.message}`
          );

          setImporting(false);

          return;
        }


        imported +=
          chunk.length;
      }


      notify(
        `${imported} student(s) imported successfully from ${importFileName}.`
      );


      setImportRows([]);

      setImportFileName("");

      setShowImportPreview(
        false
      );


      await onReload();


    } catch (err) {

      showError(
        err instanceof Error
          ? err.message
          : "Student import failed."
      );

    } finally {

      setImporting(false);
    }
  }


  /* ----------------------------------------------------------
     DOWNLOAD EXCEL TEMPLATE
  ---------------------------------------------------------- */

  function downloadStudentTemplate() {

    const templateRows = [
      {
        "Student ID":
          "2023012345",

        Name:
          "Student Name",

        SLR:
          "1",
      },
    ];


    const worksheet =
      XLSX.utils.json_to_sheet(
        templateRows
      );


    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Students"
    );


    XLSX.writeFile(
      workbook,
      "student_import_template.xlsx"
    );


    notify(
      "Student Excel template downloaded."
    );
  }


  /* ----------------------------------------------------------
     DEACTIVATE STUDENT
  ---------------------------------------------------------- */

  async function deactivateStudent(
    id: string
  ) {

    const confirmed =
      window.confirm(
        "Deactivate this student?"
      );


    if (!confirmed) {
      return;
    }


    const { error } =
      await supabase
        .from("students")
        .update({
          is_active: false,
        })
        .eq("id", id);


    if (error) {

      showError(
        error.message
      );

      return;
    }


    notify(
      "Student deactivated."
    );


    await onReload();
  }


  return (
    <div className="page">

      {/* ====================================================
          ADD STUDENT
      ===================================================== */}

      <div className="panel">

        <div className="panel-header">

          <div>

            <h2>
              Add Student
            </h2>

            <p>
              Attendance code is automatically
              generated from the last 4 digits
              of Student ID.
            </p>

          </div>

          <Users />

        </div>


        <div className="form-grid">

          {/* Department */}

          <div>

            <label>
              Department
            </label>

            <select
              value={department}
              onChange={(e) => {

                setDepartment(
                  e.target.value
                );

                setBatch("");
                setGroup("");

              }}
            >

              <option value="">
                Select Department
              </option>

              {departments
                .filter(
                  (d) =>
                    d.is_active
                )
                .map((d) => (

                  <option
                    key={d.id}
                    value={d.id}
                  >
                    {d.name}
                  </option>

                ))}

            </select>

          </div>


          {/* Batch */}

          <div>

            <label>
              Batch
            </label>

            <select
              value={batch}
              onChange={(e) => {

                setBatch(
                  e.target.value
                );

                setGroup("");

              }}
            >

              <option value="">
                Select Batch
              </option>

              {filteredBatches.map(
                (b) => (

                  <option
                    key={b.id}
                    value={b.id}
                  >
                    {b.name}
                  </option>

                )
              )}

            </select>

          </div>


          {/* Group */}

          <div>

            <label>
              Group
            </label>

            <select
              value={group}
              onChange={(e) =>
                setGroup(
                  e.target.value
                )
              }
            >

              <option value="">
                Select Group
              </option>

              {filteredGroups.map(
                (g) => (

                  <option
                    key={g.id}
                    value={g.id}
                  >
                    {g.name}
                  </option>

                )
              )}

            </select>

          </div>


          {/* Student ID */}

          <div>

            <label>
              Student ID
            </label>

            <input
              placeholder="e.g. 2023012345"
              value={studentId}
              onChange={(e) =>
                setStudentId(
                  e.target.value
                )
              }
            />

          </div>


          {/* Name */}

          <div>

            <label>
              Name
            </label>

            <input
              placeholder="Student name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
            />

          </div>


          {/* SLR */}

          <div>

            <label>
              SLR / Roll
            </label>

            <input
              placeholder="Optional"
              value={slr}
              onChange={(e) =>
                setSlr(
                  e.target.value
                )
              }
            />

          </div>

        </div>


        <div className="button-row">

          <button
            className="primary-btn"
            onClick={addStudent}
          >
            <Plus size={17} />
            Add Student
          </button>

        </div>

      </div>


      {/* ====================================================
          STUDENT RECORDS
      ===================================================== */}

      <div className="panel">

        <div className="panel-header">

          <div>

            <h2>
              Student Records
            </h2>

            <p>
              {filteredStudents.length}
              {" "}
              active student(s)
            </p>

          </div>


          <div className="button-row">

            {/* TEMPLATE */}

            <button
              className="secondary-btn"
              onClick={
                downloadStudentTemplate
              }
            >
              <Download size={17} />
              Template
            </button>


            {/* IMPORT */}

            <label className="upload-small">

              <Upload size={17} />

              Import Excel

              <input
                type="file"
                accept=".xlsx,.xls"
                hidden
                onChange={
                  handleExcelSelect
                }
              />

            </label>

          </div>

        </div>


        {/* FILTER */}

        <div className="form-grid">

          <div>

            <label>
              Department Filter
            </label>

            <select
              value={department}
              onChange={(e) => {

                setDepartment(
                  e.target.value
                );

                setBatch("");
                setGroup("");

              }}
            >

              <option value="">
                All Departments
              </option>

              {departments
                .filter(
                  (d) =>
                    d.is_active
                )
                .map((d) => (

                  <option
                    key={d.id}
                    value={d.id}
                  >
                    {d.name}
                  </option>

                ))}

            </select>

          </div>


          <div>

            <label>
              Batch Filter
            </label>

            <select
              value={batch}
              onChange={(e) => {

                setBatch(
                  e.target.value
                );

                setGroup("");

              }}
            >

              <option value="">
                All Batches
              </option>

              {filteredBatches.map(
                (b) => (

                  <option
                    key={b.id}
                    value={b.id}
                  >
                    {b.name}
                  </option>

                )
              )}

            </select>

          </div>


          <div>

            <label>
              Group Filter
            </label>

            <select
              value={group}
              onChange={(e) =>
                setGroup(
                  e.target.value
                )
              }
            >

              <option value="">
                All Groups
              </option>

              {filteredGroups.map(
                (g) => (

                  <option
                    key={g.id}
                    value={g.id}
                  >
                    {g.name}
                  </option>

                )
              )}

            </select>

          </div>

        </div>


        <input
          className="search-input"
          placeholder="Search Student ID, Name or SLR..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />


        <div className="table-wrap">

          <table>

            <thead>

              <tr>

                <th>
                  Student ID
                </th>

                <th>
                  Name
                </th>

                <th>
                  SLR
                </th>

                <th>
                  Department
                </th>

                <th>
                  Batch
                </th>

                <th>
                  Group
                </th>

                <th>
                  OCR Code
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredStudents.map(
                (student) => {

                  const department =
                    departments.find(
                      (d) =>
                        d.id ===
                        student.department_id
                    );


                  const batch =
                    batches.find(
                      (b) =>
                        b.id ===
                        student.batch_id
                    );


                  const group =
                    groups.find(
                      (g) =>
                        g.id ===
                        student.group_id
                    );


                  return (

                    <tr
                      key={student.id}
                    >

                      <td>
                        <strong>
                          {
                            student.student_id
                          }
                        </strong>
                      </td>

                      <td>
                        {student.name}
                      </td>

                      <td>
                        {student.slr ||
                          "-"}
                      </td>

                      <td>
                        {
                          department?.name ||
                          "-"
                        }
                      </td>

                      <td>
                        {batch?.name ||
                          "-"}
                      </td>

                      <td>
                        {group?.name ||
                          "-"}
                      </td>

                      <td>

                        <span className="code-pill">
                          {
                            student.attendance_code
                          }
                        </span>

                      </td>

                      <td>

                        <button
                          className="icon-danger"
                          onClick={() =>
                            deactivateStudent(
                              student.id
                            )
                          }
                        >
                          <Trash2
                            size={16}
                          />
                        </button>

                      </td>

                    </tr>

                  );
                }
              )}


              {!filteredStudents.length && (

                <tr>

                  <td
                    colSpan={8}
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "30px",
                    }}
                  >
                    No students found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ====================================================
          IMPORT PREVIEW MODAL
      ===================================================== */}

      {showImportPreview && (

        <div className="modal-overlay">

          <div className="modal-card">

            <div className="modal-header">

              <div>

                <h2>
                  Excel Import Preview
                </h2>

                <p>
                  Review the students before
                  inserting them into Supabase.
                </p>

              </div>

              <button
                className="icon-danger"
                onClick={() =>
                  setShowImportPreview(
                    false
                  )
                }
              >
                X
              </button>

            </div>


            <div className="import-info">

              <div>
                <strong>
                  Department
                </strong>

                <span>
                  {
                    departments.find(
                      (d) =>
                        d.id ===
                        department
                    )?.name ||
                    "-"
                  }
                </span>
              </div>


              <div>
                <strong>
                  Batch
                </strong>

                <span>
                  {
                    batches.find(
                      (b) =>
                        b.id ===
                        batch
                    )?.name ||
                    "-"
                  }
                </span>
              </div>


              <div>
                <strong>
                  Group
                </strong>

                <span>
                  {
                    groups.find(
                      (g) =>
                        g.id ===
                        group
                    )?.name ||
                    "-"
                  }
                </span>
              </div>


              <div>
                <strong>
                  Records
                </strong>

                <span>
                  {
                    importRows.length
                  }
                </span>
              </div>

            </div>


            <div className="table-wrap">

              <table>

                <thead>

                  <tr>

                    <th>
                      #
                    </th>

                    <th>
                      Student ID
                    </th>

                    <th>
                      Name
                    </th>

                    <th>
                      SLR
                    </th>

                    <th>
                      OCR Code
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {importRows
                    .slice(0, 100)
                    .map(
                      (
                        student,
                        index
                      ) => (

                        <tr
                          key={`${student.student_id}-${index}`}
                        >

                          <td>
                            {index + 1}
                          </td>

                          <td>
                            {
                              student.student_id
                            }
                          </td>

                          <td>
                            {
                              student.name
                            }
                          </td>

                          <td>
                            {
                              student.slr ||
                              "-"
                            }
                          </td>

                          <td>

                            <span className="code-pill">
                              {getLastFourDigits(
                                student.student_id
                              )}
                            </span>

                          </td>

                        </tr>

                      )
                    )}

                </tbody>

              </table>

            </div>


            {importRows.length >
              100 && (

              <p className="preview-note">
                Showing first 100 records.
                Total records:
                {" "}
                {importRows.length}
              </p>

            )}


            <div className="modal-actions">

              <button
                className="secondary-btn"
                onClick={() => {

                  setShowImportPreview(
                    false
                  );

                  setImportRows([]);

                }}
                disabled={importing}
              >
                Cancel
              </button>


              <button
                className="primary-btn"
                onClick={
                  confirmExcelImport
                }
                disabled={importing}
              >

                {importing ? (

                  <>
                    <RefreshCw
                      size={17}
                      className="spin"
                    />

                    Importing...

                  </>

                ) : (

                  <>
                    <Upload
                      size={17}
                    />

                    Import{" "}
                    {importRows.length}{" "}
                    Students

                  </>

                )}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


/* ============================================================
   ATTENDANCE PAGE
============================================================ */

function AttendancePage({
  departments,
  batches,
  groups,
  students,
  onReload,
  notify,
  showError,
}: {
  departments: Department[];
  batches: Batch[];
  groups: StudentGroup[];
  students: Student[];
  onReload: () => Promise<void>;
  notify: (text: string) => void;
  showError: (text: string) => void;
}) {

  const [department, setDepartment] =
    useState("");

  const [batch, setBatch] =
    useState("");

  const [group, setGroup] =
    useState("");

  const [date, setDate] =
    useState(
      new Date()
        .toISOString()
        .slice(0, 10)
    );

  const [file, setFile] =
    useState<File | null>(null);

  const [ocrText, setOcrText] =
    useState("");

  const [rows, setRows] =
    useState<AttendanceRow[]>([]);

  const [processing, setProcessing] =
    useState(false);

  const [verified, setVerified] =
    useState(false);


  const filteredBatches =
    batches.filter(
      (b) =>
        b.department_id ===
          department &&
        b.is_active
    );


  const filteredGroups =
    groups.filter(
      (g) =>
        g.batch_id === batch &&
        g.is_active
    );


  const groupStudents =
    students.filter(
      (s) =>
        s.group_id === group &&
        s.is_active
    );


  function resetAttendance() {

    setFile(null);
    setOcrText("");
    setRows([]);
    setVerified(false);

  }


  async function processOCR() {

    if (
      !department ||
      !batch ||
      !group ||
      !date ||
      !file
    ) {

      showError(
        "Select Date, Department, Batch, Group and Attendance Photo."
      );

      return;
    }


    if (!groupStudents.length) {

      showError(
        "No active students found in this group."
      );

      return;
    }


    setProcessing(true);
    setVerified(false);


    try {

      const worker =
        await createWorker(
          "eng"
        );


      const result =
        await worker.recognize(
          file
        );


      await worker.terminate();


      const text =
        result.data.text ||
        "";


      setOcrText(text);


      /*
       * Extract 4-digit numbers.
       */

      const codes =
        text.match(
          /\b\d{4}\b/g
        ) || [];


      const uniqueCodes =
        Array.from(
          new Set(codes)
        );


      const detected =
        new Set(
          uniqueCodes
        );


      const attendanceRows: AttendanceRow[] =
        groupStudents.map(
          (student): AttendanceRow => {

            const isDetected =
              detected.has(
                student.attendance_code
              );

            const status: AttendanceStatus =
              isDetected ? "P" : "A";

            return {
              student,
              status,
              detected: isDetected,
            };
          }
        );


      setRows(
        attendanceRows
      );


      setVerified(true);


      notify(
        `OCR completed. ${uniqueCodes.length} four-digit code(s) detected.`
      );


    } catch (err) {

      console.error(
        "OCR error:",
        err
      );


      showError(
        err instanceof Error
          ? err.message
          : "OCR processing failed."
      );


    } finally {

      setProcessing(false);

    }
  }


  function toggleStatus(
    studentId: string
  ) {

    setRows(
      (current) =>
        current.map(
          (row) => {

            if (
              row.student.id !==
              studentId
            ) {
              return row;
            }


            return {
              ...row,

              status:
                row.status ===
                "P"
                  ? "A"
                  : "P",
            };
          }
        )
    );
  }


  async function saveAttendance() {

    if (!rows.length) {

      showError(
        "Process the attendance photo first."
      );

      return;
    }


    if (!verified) {

      showError(
        "Verify attendance before saving."
      );

      return;
    }


    /*
     * Check existing session.
     */

    const {
      data: existingSession,
      error:
        existingSessionError,
    } =
      await supabase
        .from(
          "attendance_sessions"
        )
        .select("id")
        .eq(
          "attendance_date",
          date
        )
        .eq(
          "group_id",
          group
        )
        .maybeSingle();


    if (
      existingSessionError
    ) {

      showError(
        existingSessionError.message
      );

      return;
    }


    let sessionId =
      existingSession?.id ||
      null;


    /*
     * Existing session
     */

    if (sessionId) {

      const {
        error:
          deleteError,
      } =
        await supabase
          .from(
            "attendance_records"
          )
          .delete()
          .eq(
            "session_id",
            sessionId
          );


      if (deleteError) {

        showError(
          deleteError.message
        );

        return;
      }

    } else {

      /*
       * Create session.
       */

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "attendance_sessions"
          )
          .insert({
            attendance_date:
              date,

            department_id:
              department,

            batch_id:
              batch,

            group_id:
              group,

            source_file_name:
              file?.name ||
              null,

            created_by:
              null,
          })
          .select("id")
          .single();


      if (error) {

        showError(
          error.message
        );

        return;
      }


      sessionId =
        data.id;
    }


    if (!sessionId) {

      showError(
        "Could not create attendance session."
      );

      return;
    }


    /*
     * Prepare records.
     */

    const records =
      rows.map(
        (row) => ({
          session_id:
            sessionId,

          student_id:
            row.student.id,

          status:
            row.status,

          detected_code:
            row.detected
              ? row.student
                  .attendance_code
              : null,
        })
      );


    /*
     * Insert attendance records.
     */

    const {
      error:
        recordsError,
    } =
      await supabase
        .from(
          "attendance_records"
        )
        .insert(records);


    if (recordsError) {

      showError(
        recordsError.message
      );

      return;
    }


    notify(
      "Attendance saved successfully."
    );


    resetAttendance();

    await onReload();
  }


  const present =
    rows.filter(
      (row) =>
        row.status === "P"
    ).length;


  const absent =
    rows.filter(
      (row) =>
        row.status === "A"
    ).length;


  return (
    <div className="page">

      <div className="panel">

        <div className="panel-header">

          <div>

            <h2>
              Attendance Input
            </h2>

            <p>
              Upload a photo containing handwritten
              last-four-digit student codes.
            </p>

          </div>

          <CalendarCheck />

        </div>


        <div className="form-grid">

          {/* DATE */}

          <div>

            <label>
              Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(
                  e.target.value
                )
              }
            />

          </div>


          {/* DEPARTMENT */}

          <div>

            <label>
              Department
            </label>

            <select
              value={department}
              onChange={(e) => {

                setDepartment(
                  e.target.value
                );

                setBatch("");
                setGroup("");

                resetAttendance();

              }}
            >

              <option value="">
                Select Department
              </option>

              {departments
                .filter(
                  (d) =>
                    d.is_active
                )
                .map((d) => (

                  <option
                    key={d.id}
                    value={d.id}
                  >
                    {d.name}
                  </option>

                ))}

            </select>

          </div>


          {/* BATCH */}

          <div>

            <label>
              Batch
            </label>

            <select
              value={batch}
              onChange={(e) => {

                setBatch(
                  e.target.value
                );

                setGroup("");

                resetAttendance();

              }}
            >

              <option value="">
                Select Batch
              </option>

              {filteredBatches.map(
                (b) => (

                  <option
                    key={b.id}
                    value={b.id}
                  >
                    {b.name}
                  </option>

                )
              )}

            </select>

          </div>


          {/* GROUP */}

          <div>

            <label>
              Group
            </label>

            <select
              value={group}
              onChange={(e) => {

                setGroup(
                  e.target.value
                );

                resetAttendance();

              }}
            >

              <option value="">
                Select Group
              </option>

              {filteredGroups.map(
                (g) => (

                  <option
                    key={g.id}
                    value={g.id}
                  >
                    {g.name}
                  </option>

                )
              )}

            </select>

          </div>

        </div>


        {/* PHOTO */}

        <label className="photo-upload">

          <Upload size={30} />

          <strong>

            {file
              ? file.name
              : "Upload Attendance Photo"}

          </strong>

          <span>
            Click to choose an image
          </span>


          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {

              setFile(
                e.target.files?.[0] ||
                  null
              );

              setRows([]);

              setVerified(false);

            }}
          />

        </label>


        <div className="button-row">

          <button
            className="primary-btn"
            onClick={processOCR}
            disabled={processing}
          >

            {processing ? (

              <>
                <RefreshCw
                  size={17}
                  className="spin"
                />

                Reading Photo...

              </>

            ) : (

              <>
                <Upload size={17} />
                Read Attendance
              </>

            )}

          </button>


          {rows.length > 0 && (

            <button
              className="secondary-btn"
              onClick={
                saveAttendance
              }
            >
              <Save size={17} />
              Verify & Save
            </button>

          )}

        </div>

      </div>


      {/* ====================================================
          VERIFICATION
      ===================================================== */}

      {rows.length > 0 && (

        <div className="panel">

          <div className="panel-header">

            <div>

              <h2>
                Attendance Verification
              </h2>

              <p>
                Review OCR result before saving.
                Click status to correct it.
              </p>

            </div>


            <div className="summary-pills">

              <span className="present-pill">
                Present: {present}
              </span>

              <span className="absent-pill">
                Absent: {absent}
              </span>

            </div>

          </div>


          <div className="table-wrap">

            <table>

              <thead>

                <tr>

                  <th>
                    Student ID
                  </th>

                  <th>
                    Name
                  </th>

                  <th>
                    OCR Code
                  </th>

                  <th>
                    Detected
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {rows.map(
                  (row) => (

                    <tr
                      key={
                        row.student.id
                      }
                    >

                      <td>
                        {
                          row.student
                            .student_id
                        }
                      </td>

                      <td>
                        {
                          row.student
                            .name
                        }
                      </td>

                      <td>

                        <span className="code-pill">
                          {
                            row.student
                              .attendance_code
                          }
                        </span>

                      </td>

                      <td>

                        {row.detected ? (

                          <span className="status-present">
                            YES
                          </span>

                        ) : (

                          <span className="status-absent">
                            NO
                          </span>

                        )}

                      </td>

                      <td>

                        <button
                          className={
                            row.status ===
                            "P"
                              ? "status-button present"
                              : "status-button absent"
                          }
                          onClick={() =>
                            toggleStatus(
                              row.student
                                .id
                            )
                          }
                        >

                          {row.status ===
                          "P"
                            ? "PRESENT"
                            : "ABSENT"}

                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>


          <div className="ocr-box">

            <strong>
              Raw OCR Text
            </strong>

            <pre>
              {ocrText ||
                "No OCR text"}
            </pre>

          </div>

        </div>

      )}

    </div>
  );
}


/* ============================================================
   ATTENDANCE REPORT
============================================================ */

function ReportsPage({
  departments,
  batches,
  groups,
  students,
  showError,
}: {
  departments: Department[];
  batches: Batch[];
  groups: StudentGroup[];
  students: Student[];
  showError: (text: string) => void;
}) {

  const [department, setDepartment] =
    useState("");

  const [batch, setBatch] =
    useState("");

  const [group, setGroup] =
    useState("");

  const [sessions, setSessions] =
    useState<ReportSession[]>([]);

  const [records, setRecords] =
    useState<ReportRecord[]>([]);

  const [loading, setLoading] =
    useState(false);


  const filteredBatches =
    batches.filter(
      (b) =>
        b.department_id ===
          department &&
        b.is_active
    );


  const filteredGroups =
    groups.filter(
      (g) =>
        g.batch_id === batch &&
        g.is_active
    );


  async function loadReport() {

    if (!group) {

      showError(
        "Select a group."
      );

      return;
    }


    setLoading(true);


    const {
      data: sessionData,
      error: sessionError,
    } =
      await supabase
        .from(
          "attendance_sessions"
        )
        .select(
          "id,attendance_date,department_id,batch_id,group_id"
        )
        .eq(
          "group_id",
          group
        )
        .order(
          "attendance_date",
          {
            ascending: true,
          }
        );


    if (sessionError) {

      showError(
        sessionError.message
      );

      setLoading(false);

      return;
    }


    const loadedSessions =
      (sessionData ||
        []) as ReportSession[];


    const sessionIds =
      loadedSessions.map(
        (session) =>
          session.id
      );


    let loadedRecords:
      ReportRecord[] =
      [];


    if (sessionIds.length) {

      const {
        data: recordData,
        error: recordError,
      } =
        await supabase
          .from(
            "attendance_records"
          )
          .select(
            "id,session_id,student_id,status,detected_code"
          )
          .in(
            "session_id",
            sessionIds
          );


      if (recordError) {

        showError(
          recordError.message
        );

        setLoading(false);

        return;
      }


      loadedRecords =
        (recordData ||
          []) as ReportRecord[];
    }


    setSessions(
      loadedSessions
    );

    setRecords(
      loadedRecords
    );

    setLoading(false);
  }


  const reportRows =
    students
      .filter(
        (student) =>
          student.group_id ===
            group &&
          student.is_active
      )
      .map((student) => {

        const studentRecords =
          records.filter(
            (record) =>
              record.student_id ===
              student.id
          );


        const held =
          sessions.length;


        const present =
          studentRecords.filter(
            (record) =>
              record.status === "P"
          ).length;


        const absent =
          held - present;


        const percentage =
          held > 0
            ? (present / held) * 100
            : 0;


        return {
          student,
          present,
          absent,
          held,
          percentage,
        };
      });


  function exportReport() {

    if (!reportRows.length) {
      return;
    }


    const rows =
      reportRows.map(
        (row) => ({

          "Student ID":
            row.student.student_id,

          Name:
            row.student.name,

          SLR:
            row.student.slr ||
            "",

          Present:
            row.present,

          Absent:
            row.absent,

          "Total Held":
            row.held,

          "Attendance %":
            Number(
              row.percentage.toFixed(
                2
              )
            ),

        })
      );


    const worksheet =
      XLSX.utils.json_to_sheet(
        rows
      );


    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Attendance Report"
    );


    XLSX.writeFile(
      workbook,
      `attendance_report.xlsx`
    );
  }


  return (
    <div className="page">

      <div className="panel">

        <div className="panel-header">

          <div>

            <h2>
              Attendance Report
            </h2>

            <p>
              Present / Total Held × 100
            </p>

          </div>

          <BarChart3 />

        </div>


        <div className="form-grid">

          <div>

            <label>
              Department
            </label>

            <select
              value={department}
              onChange={(e) => {

                setDepartment(
                  e.target.value
                );

                setBatch("");
                setGroup("");

              }}
            >

              <option value="">
                Select Department
              </option>

              {departments
                .filter(
                  (d) =>
                    d.is_active
                )
                .map((d) => (

                  <option
                    key={d.id}
                    value={d.id}
                  >
                    {d.name}
                  </option>

                ))}

            </select>

          </div>


          <div>

            <label>
              Batch
            </label>

            <select
              value={batch}
              onChange={(e) => {

                setBatch(
                  e.target.value
                );

                setGroup("");

              }}
            >

              <option value="">
                Select Batch
              </option>

              {filteredBatches.map(
                (b) => (

                  <option
                    key={b.id}
                    value={b.id}
                  >
                    {b.name}
                  </option>

                )
              )}

            </select>

          </div>


          <div>

            <label>
              Group
            </label>

            <select
              value={group}
              onChange={(e) =>
                setGroup(
                  e.target.value
                )
              }
            >

              <option value="">
                Select Group
              </option>

              {filteredGroups.map(
                (g) => (

                  <option
                    key={g.id}
                    value={g.id}
                  >
                    {g.name}
                  </option>

                )
              )}

            </select>

          </div>

        </div>


        <div className="button-row">

          <button
            className="primary-btn"
            onClick={loadReport}
            disabled={loading}
          >

            {loading ? (
              <>
                <RefreshCw
                  size={17}
                  className="spin"
                />

                Loading...

              </>
            ) : (
              <>
                <BarChart3
                  size={17}
                />

                Generate Report
              </>
            )}

          </button>


          {reportRows.length >
            0 && (

            <button
              className="secondary-btn"
              onClick={
                exportReport
              }
            >

              <FileSpreadsheet
                size={17}
              />

              Export Excel

            </button>

          )}

        </div>

      </div>


      {!loading &&
        reportRows.length >
          0 && (

          <div className="panel">

            <div className="table-wrap">

              <table>

                <thead>

                  <tr>

                    <th>
                      Student ID
                    </th>

                    <th>
                      Name
                    </th>

                    <th>
                      SLR
                    </th>

                    <th>
                      Present
                    </th>

                    <th>
                      Absent
                    </th>

                    <th>
                      Held
                    </th>

                    <th>
                      Attendance %
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {reportRows.map(
                    (row) => (

                      <tr
                        key={
                          row.student.id
                        }
                      >

                        <td>
                          {
                            row.student
                              .student_id
                          }
                        </td>

                        <td>
                          {
                            row.student.name
                          }
                        </td>

                        <td>
                          {
                            row.student
                              .slr ||
                            "-"
                          }
                        </td>

                        <td>

                          <span className="status-present">
                            {
                              row.present
                            }
                          </span>

                        </td>

                        <td>

                          <span className="status-absent">
                            {
                              row.absent
                            }
                          </span>

                        </td>

                        <td>
                          {row.held}
                        </td>

                        <td>

                          <strong>
                            {
                              row.percentage.toFixed(
                                2
                              )
                            }
                            %
                          </strong>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>


            <div className="date-list">

              <h3>
                Attendance Dates
              </h3>


              {sessions.map(
                (session) => (

                  <span
                    className="date-pill"
                    key={
                      session.id
                    }
                  >
                    {
                      session.attendance_date
                    }
                  </span>

                )
              )}


              {!sessions.length && (
                <p>
                  No attendance sessions found.
                </p>
              )}

            </div>

          </div>

        )}

    </div>
  );
}


/* ============================================================
   MARKS MANAGEMENT
============================================================ */

function MarksPage({
  departments,
  batches,
  groups,
  students,
  assessments,
  onReload,
  notify,
  showError,
}: {
  departments: Department[];
  batches: Batch[];
  groups: StudentGroup[];
  students: Student[];
  assessments: Assessment[];
  onReload: () => Promise<void>;
  notify: (text: string) => void;
  showError: (text: string) => void;
}) {

  const [department, setDepartment] =
    useState("");

  const [batch, setBatch] =
    useState("");

  const [group, setGroup] =
    useState("");

  const [assessmentName, setAssessmentName] =
    useState("");

  const [assessmentType, setAssessmentType] =
    useState("Other");

  const [maxMarks, setMaxMarks] =
    useState("100");

  const [selectedAssessment, setSelectedAssessment] =
    useState("");

  const [marks, setMarks] =
    useState<
      Record<string, string>
    >({});


  const filteredBatches =
    batches.filter(
      (b) =>
        b.department_id ===
          department &&
        b.is_active
    );


  const filteredGroups =
    groups.filter(
      (g) =>
        g.batch_id === batch &&
        g.is_active
    );


  const batchAssessments =
    assessments.filter(
      (assessment) =>
        assessment.batch_id ===
          batch &&
        assessment.is_active
    );


  const groupStudents =
    students.filter(
      (student) =>
        student.group_id ===
          group &&
        student.is_active
    );


  async function createAssessment() {

    if (
      !department ||
      !batch ||
      !assessmentName.trim()
    ) {

      showError(
        "Department, Batch and Assessment Name are required."
      );

      return;
    }


    const max =
      Number(maxMarks);


    if (
      !Number.isFinite(max) ||
      max <= 0
    ) {

      showError(
        "Enter a valid maximum mark."
      );

      return;
    }


    const {
      error,
    } =
      await supabase
        .from("assessments")
        .insert({
          department_id:
            department,

          batch_id:
            batch,

          name:
            assessmentName.trim(),

          assessment_type:
            assessmentType,

          max_marks:
            max,

          assessment_date:
            null,
        });


    if (error) {

      showError(
        error.message
      );

      return;
    }


    setAssessmentName("");

    notify(
      "Assessment created successfully."
    );


    await onReload();
  }


  async function loadMarks(
    assessmentId: string
  ) {

    setSelectedAssessment(
      assessmentId
    );


    const {
      data,
      error,
    } =
      await supabase
        .from("marks")
        .select("*")
        .eq(
          "assessment_id",
          assessmentId
        );


    if (error) {

      showError(
        error.message
      );

      return;
    }


    const map:
      Record<string, string> =
      {};


    (data || []).forEach(
      (item: Mark) => {

        map[
          item.student_id
        ] =
          item.marks === null
            ? ""
            : String(
                item.marks
              );

      }
    );


    setMarks(map);
  }


  async function saveMarks() {

    if (!selectedAssessment) {

      showError(
        "Select an assessment."
      );

      return;
    }


    if (!group) {

      showError(
        "Select a group."
      );

      return;
    }


    const assessment =
      assessments.find(
        (item) =>
          item.id ===
          selectedAssessment
      );


    if (!assessment) {

      showError(
        "Assessment not found."
      );

      return;
    }


    const records =
      groupStudents
        .map((student) => {

          const value =
            marks[
              student.id
            ];


          if (
            value ===
              undefined ||
            value.trim() ===
              ""
          ) {

            return null;
          }


          const numeric =
            Number(value);


          if (
            !Number.isFinite(
              numeric
            ) ||
            numeric < 0 ||
            numeric >
              Number(
                assessment.max_marks
              )
          ) {

            return null;
          }


          return {
            assessment_id:
              selectedAssessment,

            student_id:
              student.id,

            marks:
              numeric,
          };
        })
        .filter(
          (
            item
          ): item is {
            assessment_id: string;
            student_id: string;
            marks: number;
          } =>
            item !== null
        );


    if (!records.length) {

      showError(
        "Enter at least one valid mark."
      );

      return;
    }


    const {
      error,
    } =
      await supabase
        .from("marks")
        .upsert(
          records,
          {
            onConflict:
              "assessment_id,student_id",
          }
        );


    if (error) {

      showError(
        error.message
      );

      return;
    }


    notify(
      "Marks saved successfully."
    );
  }


  function exportMarks() {

    const assessment =
      assessments.find(
        (item) =>
          item.id ===
          selectedAssessment
      );


    if (!assessment) {
      return;
    }


    const rows =
      groupStudents.map(
        (student) => ({

          "Student ID":
            student.student_id,

          Name:
            student.name,

          SLR:
            student.slr ||
            "",

          Assessment:
            assessment.name,

          Type:
            assessment.assessment_type,

          "Max Marks":
            assessment.max_marks,

          Marks:
            marks[
              student.id
            ] || "",

        })
      );


    const worksheet =
      XLSX.utils.json_to_sheet(
        rows
      );


    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Marks"
    );


    XLSX.writeFile(
      workbook,
      `marks_${assessment.name}.xlsx`
    );
  }


  return (
    <div className="page">

      <div className="section-grid">

        {/* CREATE ASSESSMENT */}

        <div className="panel">

          <div className="panel-header">

            <div>

              <h2>
                Create Assessment
              </h2>

              <p>
                LIA, LAB, VIVA, Assignment
                or custom assessment.
              </p>

            </div>

            <BookOpen />

          </div>


          <label>
            Department
          </label>

          <select
            value={department}
            onChange={(e) => {

              setDepartment(
                e.target.value
              );

              setBatch("");
              setGroup("");

            }}
          >

            <option value="">
              Select Department
            </option>

            {departments
              .filter(
                (d) =>
                  d.is_active
              )
              .map((d) => (

                <option
                  key={d.id}
                  value={d.id}
                >
                  {d.name}
                </option>

              ))}

          </select>


          <label>
            Batch
          </label>

          <select
            value={batch}
            onChange={(e) => {

              setBatch(
                e.target.value
              );

              setGroup("");

            }}
          >

            <option value="">
              Select Batch
            </option>

            {filteredBatches.map(
              (b) => (

                <option
                  key={b.id}
                  value={b.id}
                >
                  {b.name}
                </option>

              )
            )}

          </select>


          <label>
            Assessment Name
          </label>

          <input
            placeholder="e.g. LIA 1"
            value={assessmentName}
            onChange={(e) =>
              setAssessmentName(
                e.target.value
              )
            }
          />


          <label>
            Assessment Type
          </label>

          <select
            value={assessmentType}
            onChange={(e) =>
              setAssessmentType(
                e.target.value
              )
            }
          >

            <option value="LIA">
              LIA
            </option>

            <option value="LAB">
              LAB
            </option>

            <option value="VIVA">
              VIVA
            </option>

            <option value="Assignment">
              Assignment
            </option>

            <option value="Internal">
              Internal
            </option>

            <option value="Other">
              Other
            </option>

          </select>


          <label>
            Maximum Marks
          </label>

          <input
            type="number"
            min="1"
            value={maxMarks}
            onChange={(e) =>
              setMaxMarks(
                e.target.value
              )
            }
          />


          <button
            className="primary-btn"
            onClick={
              createAssessment
            }
          >

            <Plus size={17} />

            Create Assessment

          </button>

        </div>


        {/* ASSESSMENTS */}

        <div className="panel">

          <div className="panel-header">

            <div>

              <h2>
                Assessment List
              </h2>

              <p>
                Select an assessment to
                enter marks.
              </p>

            </div>

            <ClipboardList />

          </div>


          {!batch ? (

            <div className="empty">
              Select a batch first.
            </div>

          ) : (

            <div className="assessment-list">

              {batchAssessments.map(
                (assessment) => (

                  <button
                    key={
                      assessment.id
                    }
                    className={
                      selectedAssessment ===
                      assessment.id
                        ? "assessment-item selected"
                        : "assessment-item"
                    }
                    onClick={() =>
                      loadMarks(
                        assessment.id
                      )
                    }
                  >

                    <div>

                      <strong>
                        {
                          assessment.name
                        }
                      </strong>

                      <span>
                        {
                          assessment.assessment_type
                        }
                        {" • "}
                        Max{" "}
                        {
                          assessment.max_marks
                        }
                      </span>

                    </div>

                    <ChevronRight />

                  </button>

                )
              )}


              {!batchAssessments.length && (

                <div className="empty">
                  No assessments for
                  this batch.
                </div>

              )}

            </div>

          )}

        </div>

      </div>


      {/* MARK ENTRY */}

      {selectedAssessment && (

        <div className="panel">

          <div className="panel-header">

            <div>

              <h2>
                Enter Marks
              </h2>

              <p>
                Select group and enter
                marks for each student.
              </p>

            </div>


            <div className="button-row">

              <button
                className="secondary-btn"
                onClick={
                  saveMarks
                }
              >

                <Save size={17} />

                Save Marks

              </button>


              <button
                className="secondary-btn"
                onClick={
                  exportMarks
                }
              >

                <FileSpreadsheet
                  size={17}
                />

                Export Excel

              </button>

            </div>

          </div>


          <label>
            Group
          </label>

          <select
            value={group}
            onChange={(e) =>
              setGroup(
                e.target.value
              )
            }
          >

            <option value="">
              Select Group
            </option>

            {filteredGroups.map(
              (g) => (

                <option
                  key={g.id}
                  value={g.id}
                >
                  {g.name}
                </option>

              )
            )}

          </select>


          {group && (

            <div className="table-wrap">

              <table>

                <thead>

                  <tr>

                    <th>
                      Student ID
                    </th>

                    <th>
                      Name
                    </th>

                    <th>
                      SLR
                    </th>

                    <th>
                      Marks
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {groupStudents.map(
                    (student) => (

                      <tr
                        key={
                          student.id
                        }
                      >

                        <td>
                          {
                            student.student_id
                          }
                        </td>

                        <td>
                          {
                            student.name
                          }
                        </td>

                        <td>
                          {
                            student.slr ||
                            "-"
                          }
                        </td>

                        <td>

                          <input
                            className="marks-input"
                            type="number"
                            min="0"
                            value={
                              marks[
                                student.id
                              ] || ""
                            }
                            onChange={(e) =>
                              setMarks(
                                (
                                  current
                                ) => ({
                                  ...current,

                                  [student.id]:
                                    e
                                      .target
                                      .value,
                                })
                              )
                            }
                          />

                        </td>

                      </tr>

                    )
                  )}


                  {!groupStudents.length && (

                    <tr>

                      <td
                        colSpan={4}
                        style={{
                          textAlign:
                            "center",
                          padding:
                            "30px",
                        }}
                      >
                        No students in
                        this group.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      )}

    </div>
  );
}


/* ============================================================
   HELPER - LAST 4 DIGITS
============================================================ */

function getLastFourDigits(
  studentId: string
): string {

  const numbers =
    studentId.replace(
      /\D/g,
      ""
    );


  if (
    numbers.length >= 4
  ) {
    return numbers.slice(
      -4
    );
  }


  return numbers.padStart(
    4,
    "0"
  );
}