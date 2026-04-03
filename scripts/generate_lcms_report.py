from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Inches, Pt


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_TEMPLATE = Path(r"c:\Users\MAKESH\OneDrive\Desktop\MAX\DBMS REPORT .docx")
DEFAULT_OUTPUT = ROOT / "Legal_Case_Management_DBMS_Report.docx"
ASSET_DIR = ROOT / "report_assets"


ABBREVIATIONS = [
    "API : Application Programming Interface",
    "DBMS : Database Management System",
    "ER : Entity Relationship",
    "JWT : JSON Web Token",
    "LCMS : Legal Case Management System",
    "ORM : Object Relational Mapper",
    "OTP : One Time Password",
    "RDBMS : Relational Database Management System",
    "SQL : Structured Query Language",
    "UI : User Interface",
]


FIGURES = [
    ("Fig. 3.1", "ER Diagram of LCMS"),
    ("Fig. 3.2", "Use Case Diagram of LCMS"),
    ("Fig. 3.3", "Architecture Diagram of LCMS"),
    ("Fig. 5.1", "Role-Based Dashboard Overview"),
    ("Fig. 5.2", "Case Processing Workflow"),
]


REFERENCES = [
    "Project source files: backend/app.py, backend/schema.sql, backend/routes/*.py, src/App.jsx, src/services/api.js.",
    "Flask Documentation. Pallets Projects. https://flask.palletsprojects.com/",
    "SQLAlchemy Documentation. https://docs.sqlalchemy.org/",
    "React Documentation. https://react.dev/",
    "Vite Guide. https://vite.dev/guide/",
    "MySQL Reference Manual. https://dev.mysql.com/doc/",
    "Flask-JWT-Extended Documentation. https://flask-jwt-extended.readthedocs.io/",
]


TABLE_DATA = [
    ("users", "Stores citizens, advocates, and court admins with role-specific identifiers."),
    ("otp_codes", "Keeps time-bound OTPs for citizen authentication."),
    ("courtrooms", "Tracks room status, judge, and active courtroom details."),
    ("cases", "Maintains case metadata, parties, advocate assignment, hearing date, and status."),
    ("hearings", "Stores hearing schedule, type, timing, notes, and location."),
    ("case_timeline", "Captures major events in each case lifecycle."),
    ("documents", "Stores evidence and case file metadata, uploader, size, and verification status."),
    ("tasks", "Tracks advocate task items linked to a case."),
    ("case_notes", "Stores internal notes made by advocates or court staff."),
    ("notifications", "Keeps alerts for hearings, updates, and reminders."),
    ("messages", "Stores direct communication between users."),
]


OBJECTIVES = [
    "To design a centralized Legal Case Management System that replaces fragmented and manual case handling.",
    "To provide secure role-based access for citizens, advocates, and court administrators.",
    "To maintain accurate case, hearing, document, note, and task records in a relational database.",
    "To improve transparency by allowing citizens to track their cases and upcoming hearings digitally.",
    "To support advocates with evidence management, case notes, pending tasks, and performance analytics.",
    "To help court administrators monitor pendency, hearing schedules, courtroom activity, and advocate workloads.",
    "To ensure data consistency and controlled access through MySQL, SQLAlchemy relationships, JWT authentication, and validation logic.",
]


EXISTING_LIMITATIONS = [
    "Case records are often distributed across paper files, spreadsheets, and disconnected software, making search and retrieval slow.",
    "Citizens have limited visibility into the latest status of their cases and must rely on manual follow-up.",
    "Hearing schedules, case notes, and evidence tracking are difficult to coordinate when different stakeholders maintain separate records.",
    "Lack of centralized notifications increases the chance of missed hearings, delayed submissions, and inconsistent communication.",
    "Manual workflows introduce duplication, update delays, and errors in status tracking, advocate assignment, and courtroom planning.",
]


MODULES = [
    ("Authentication and Identity", "Supports citizen OTP login, advocate credential login, court admin login, and shared profile management."),
    ("Case Management", "Creates, updates, filters, and searches cases with role-based visibility and QR-based lookup support."),
    ("Hearing Scheduler", "Schedules hearings, updates next-hearing details, and exposes calendar-friendly event data."),
    ("Document Management", "Uploads evidence and legal files, stores metadata, and supports verification workflows."),
    ("Task and Notes Module", "Lets advocates and staff maintain case-specific tasks and structured notes."),
    ("Messaging and Notifications", "Delivers in-app notifications, read/unread states, direct user messaging, and optional email alerts."),
    ("Courtroom and Analytics", "Shows courtroom status, dashboard summaries, pendency, case mix, hearing trends, and advocate performance."),
]


FUNCTIONAL_RESULTS = [
    "Citizens can register with Aadhaar details, receive a demo OTP, verify the OTP, and view only their own cases.",
    "Advocates can log in with a Bar Council ID, view assigned cases, manage documents, tasks, notes, and messaging data.",
    "Court admins can view all cases, create and update case records, schedule hearings, manage courtroom data, and monitor system analytics.",
    "Updating a case can automatically create hearing entries, timeline events, and notifications for relevant users.",
    "The application exposes filtered dashboard metrics such as total cases, pending matters, hearing counts, evidence totals, and advocate performance.",
]


FUTURE_ENHANCEMENTS = [
    "Replace demo OTP responses with real SMS gateway integration.",
    "Add production-grade audit logs for every critical database change.",
    "Introduce document versioning and cloud object storage for large evidence files.",
    "Add judge-wise scheduling conflict detection and courtroom slot optimization.",
    "Support e-filing workflows, digital signatures, and PDF report export.",
    "Strengthen production security with refresh tokens, stronger secret management, and role-based permission matrices.",
]


def get_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = []
    if bold:
        candidates.extend(["arialbd.ttf", "calibrib.ttf"])
    else:
        candidates.extend(["arial.ttf", "calibri.ttf"])

    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    return ImageFont.load_default()


def clear_document(document: Document) -> None:
    body = document._body._element
    for child in list(body):
        if child.tag.endswith("sectPr"):
            continue
        body.remove(child)


def add_paragraph(document: Document, text: str = "", style: str = "Body Text", align=None):
    paragraph = document.add_paragraph(style=style)
    if align is not None:
        paragraph.alignment = align
    if text:
        paragraph.add_run(text)
    return paragraph


def add_body(document: Document, text: str) -> None:
    for chunk in [part.strip() for part in text.split("\n\n") if part.strip()]:
        add_paragraph(document, chunk, style="Body Text")


def add_list(document: Document, items: list[str]) -> None:
    for item in items:
        add_paragraph(document, item, style="List Paragraph")


def add_title(document: Document, text: str, size: int = 18) -> None:
    p = add_paragraph(document, style="Normal", align=WD_ALIGN_PARAGRAPH.CENTER)
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(size)


def add_cover_page(document: Document) -> None:
    add_title(document, "LEGAL CASE MANAGEMENT SYSTEM", 20)
    add_paragraph(document, "", style="Body Text")
    add_paragraph(document, "Submitted by", style="Body Text", align=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(
        document,
        "[Student Name 1]  [Register No.]\n[Student Name 2]  [Register No.]\n[Student Name 3]  [Register No.]",
        style="Normal",
        align=WD_ALIGN_PARAGRAPH.CENTER,
    )
    add_paragraph(document, "", style="Body Text")
    add_paragraph(document, "Under the guidance of [Guide Name]", style="Normal", align=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(
        document,
        "(Guide designation / Department)",
        style="Normal",
        align=WD_ALIGN_PARAGRAPH.CENTER,
    )
    add_paragraph(document, "", style="Body Text")
    add_paragraph(
        document,
        "DATABASE MANAGEMENT SYSTEM PROJECT REPORT",
        style="Normal",
        align=WD_ALIGN_PARAGRAPH.CENTER,
    )
    add_paragraph(document, "COMPUTER SCIENCE AND ENGINEERING", style="Normal", align=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(document, "FACULTY OF ENGINEERING AND TECHNOLOGY", style="Body Text", align=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(document, "", style="Body Text")
    add_paragraph(
        document,
        "SRM INSTITUTE OF SCIENCE AND TECHNOLOGY\nRAMAPURAM, CHENNAI",
        style="Heading 1",
        align=WD_ALIGN_PARAGRAPH.CENTER,
    )
    add_paragraph(document, "APRIL 2026", style="Body Text", align=WD_ALIGN_PARAGRAPH.CENTER)
    document.add_page_break()


def add_certificate(document: Document) -> None:
    add_paragraph(document, "SRM INSTITUTE OF SCIENCE AND TECHNOLOGY", style="Normal", align=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(document, "(Deemed to be University U/S 3 of UGC Act, 1956)", style="Normal", align=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(document, "", style="Body Text")
    add_title(document, "BONAFIDE CERTIFICATE", 16)
    add_body(
        document,
        "Certified that this project report titled \"LEGAL CASE MANAGEMENT SYSTEM\" is the bonafide work of "
        "[Student Name 1], [Student Name 2], and [Student Name 3] who carried out the project work under my "
        "supervision.\n\n"
        "Certified further that, to the best of my knowledge, the work reported herein does not form part of any "
        "other project report or dissertation on the basis of which a degree or award was conferred on any other "
        "candidate."
    )
    add_paragraph(document, "", style="Body Text")
    add_paragraph(document, "SIGNATURE", style="Normal")
    add_paragraph(document, "[Guide Name]\nGuide / Faculty", style="Normal")
    add_paragraph(document, "", style="Body Text")
    add_paragraph(document, "SIGNATURE", style="Normal")
    add_paragraph(document, "[Head of Department]\nProfessor and Head", style="Normal")
    add_paragraph(document, "", style="Body Text")
    add_paragraph(
        document,
        "Submitted for the project viva-voce held on __________ at SRM Institute of Science and Technology, Ramapuram, Chennai.",
        style="Normal",
    )
    document.add_page_break()


def add_declaration(document: Document) -> None:
    add_paragraph(
        document,
        "SRM INSTITUTE OF SCIENCE AND TECHNOLOGY\nRAMAPURAM, CHENNAI",
        style="Normal",
        align=WD_ALIGN_PARAGRAPH.CENTER,
    )
    add_title(document, "DECLARATION", 16)
    add_body(
        document,
        "We hereby declare that the entire work contained in this project report titled \"LEGAL CASE MANAGEMENT "
        "SYSTEM\" has been carried out by [Student Name 1], [Student Name 2], and [Student Name 3] under the "
        "guidance of [Guide Name], Department of Computer Science and Engineering.\n\n"
        "The content presented in this report is original to this project except where due acknowledgment has been "
        "made. The report has been prepared for academic submission in the Database Management System course."
    )
    add_paragraph(document, "Place : Chennai", style="Normal")
    add_paragraph(document, "Date  : __________", style="Normal")
    add_paragraph(document, "", style="Body Text")
    add_paragraph(document, "[Student Name 1]", style="Normal")
    add_paragraph(document, "[Student Name 2]", style="Normal")
    add_paragraph(document, "[Student Name 3]", style="Normal")
    document.add_page_break()


def add_abstract(document: Document) -> None:
    add_title(document, "ABSTRACT", 16)
    add_body(
        document,
        "The Legal Case Management System (LCMS) is a full-stack database-driven application developed to "
        "digitize and streamline case handling for citizens, advocates, and court administrators. The system "
        "addresses common issues in legal workflows such as fragmented records, delayed status updates, poor "
        "communication, and limited public visibility into case progress.\n\n"
        "The proposed system uses a React and Vite frontend, a Flask backend, SQLAlchemy for object-relational "
        "mapping, and MySQL as the central relational database. Core modules include citizen registration and OTP "
        "authentication, advocate and court login, case creation and tracking, hearing scheduling, document "
        "management, case notes, tasks, notifications, messaging, courtroom monitoring, and analytics dashboards.\n\n"
        "A normalized relational schema supports entities such as users, cases, hearings, timelines, documents, "
        "tasks, notes, courtrooms, notifications, and messages. Role-based access ensures that citizens see only "
        "their own matters, advocates see assigned cases, and court administrators retain broad operational "
        "control. The system improves transparency, supports timely hearing coordination, and provides a stronger "
        "foundation for future court digitization."
    )
    document.add_page_break()
