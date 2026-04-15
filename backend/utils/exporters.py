import csv
import re
import textwrap
from io import BytesIO, StringIO

from itsdangerous import BadSignature, URLSafeSerializer


def sanitize_filename(value, fallback="case-report"):
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "-", (value or "").strip()).strip("-._")
    return cleaned or fallback


def build_case_csv(case):
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["Section", "Field", "Value"])

    advocate_name = case.advocate.name if getattr(case, "advocate", None) else "Unassigned"
    advocate_email = case.advocate.email if getattr(case, "advocate", None) else ""

    case_rows = [
        ("Case", "Case Number", case.case_number),
        ("Case", "Title", case.title),
        ("Case", "Description", case.description or ""),
        ("Case", "Type", case.case_type),
        ("Case", "Status", case.status),
        ("Case", "Priority", case.priority),
        ("Case", "Petitioner", case.petitioner),
        ("Case", "Respondent", case.respondent),
        ("Case", "Advocate", advocate_name),
        ("Case", "Advocate Email", advocate_email),
        ("Case", "Judge", case.judge or ""),
        ("Case", "Court Room", case.court_room_name or ""),
        ("Case", "Filing Date", case.filing_date.isoformat() if case.filing_date else ""),
        ("Case", "Next Hearing", case.next_hearing.isoformat() if case.next_hearing else ""),
    ]
    writer.writerows(case_rows)

    hearings = sorted(case.hearings, key=lambda item: ((item.date or 0), (item.start_time or 0)))
    if hearings:
        for index, hearing in enumerate(hearings, start=1):
            writer.writerows(
                [
                    ("Hearing", f"{index}. Date", hearing.date.isoformat() if hearing.date else ""),
                    ("Hearing", f"{index}. Start Time", hearing.start_time.isoformat() if hearing.start_time else ""),
                    ("Hearing", f"{index}. End Time", hearing.end_time.isoformat() if hearing.end_time else ""),
                    ("Hearing", f"{index}. Type", hearing.type),
                    ("Hearing", f"{index}. Status", hearing.status),
                    ("Hearing", f"{index}. Court Room", hearing.location or ""),
                    ("Hearing", f"{index}. Notes", hearing.notes or ""),
                ]
            )
    else:
        writer.writerow(["Hearing", "None", "No hearings recorded"])

    documents = sorted(case.documents, key=lambda item: item.uploaded_at or 0, reverse=True)
    if documents:
        for index, document in enumerate(documents, start=1):
            writer.writerows(
                [
                    ("Document", f"{index}. Title", document.title),
                    ("Document", f"{index}. Type", document.doc_type),
                    ("Document", f"{index}. File Type", document.file_type),
                    ("Document", f"{index}. Size", document.file_size or ""),
                    ("Document", f"{index}. Status", "Verified" if document.verified else "Pending"),
                    ("Document", f"{index}. Uploaded By", document.uploader.name if document.uploader else ""),
                    ("Document", f"{index}. Uploaded At", document.uploaded_at.isoformat() if document.uploaded_at else ""),
                ]
            )
    else:
        writer.writerow(["Document", "None", "No documents uploaded"])

    timeline_items = sorted(case.timeline, key=lambda item: (item.date or 0, item.created_at or 0))
    if timeline_items:
        for index, item in enumerate(timeline_items, start=1):
            writer.writerows(
                [
                    ("Timeline", f"{index}. Date", item.date.isoformat() if item.date else ""),
                    ("Timeline", f"{index}. Event", item.event),
                    ("Timeline", f"{index}. Description", item.description or ""),
                ]
            )
    else:
        writer.writerow(["Timeline", "None", "No timeline entries"])

    return output.getvalue()


def build_case_report_lines(case):
    advocate_name = case.advocate.name if getattr(case, "advocate", None) else "Unassigned"
    advocate_email = case.advocate.email if getattr(case, "advocate", None) else "Not available"

    lines = [
        "Legal Case Management System",
        "Case Report",
        "",
        "Case Details",
        f"Case Number: {case.case_number}",
        f"Title: {case.title}",
        f"Type: {case.case_type}",
        f"Status: {case.status}",
        f"Priority: {case.priority}",
        f"Petitioner: {case.petitioner}",
        f"Respondent: {case.respondent}",
        f"Advocate: {advocate_name}",
        f"Advocate Email: {advocate_email}",
        f"Judge: {case.judge or 'Pending assignment'}",
        f"Court Room: {case.court_room_name or 'Not assigned'}",
        f"Filing Date: {case.filing_date.isoformat() if case.filing_date else 'Not set'}",
        f"Next Hearing: {case.next_hearing.isoformat() if case.next_hearing else 'Not scheduled'}",
        "",
        "Description",
    ]

    description = case.description or "No case description provided."
    lines.extend(_wrap_paragraph(description))
    lines.append("")

    lines.append("Hearings")
    hearings = sorted(case.hearings, key=lambda item: ((item.date or 0), (item.start_time or 0)))
    if hearings:
        for index, hearing in enumerate(hearings, start=1):
            lines.append(
                f"{index}. {hearing.date.isoformat() if hearing.date else 'Unknown date'} | {hearing.type} | {hearing.status}"
            )
            lines.extend(
                _wrap_paragraph(
                    f"Court room: {hearing.location or 'Not assigned'} | Start: "
                    f"{hearing.start_time.isoformat() if hearing.start_time else 'Not set'} | Notes: {hearing.notes or 'None'}",
                    prefix="   ",
                )
            )
    else:
        lines.append("No hearings recorded.")
    lines.append("")

    lines.append("Documents and Evidence")
    documents = sorted(case.documents, key=lambda item: item.uploaded_at or 0, reverse=True)
    if documents:
        for index, document in enumerate(documents, start=1):
            lines.append(
                f"{index}. {document.title} | {document.file_type.upper()} | "
                f"{'Verified' if document.verified else 'Pending'}"
            )
            lines.extend(
                _wrap_paragraph(
                    f"Uploaded by: {document.uploader.name if document.uploader else 'Unknown'} | "
                    f"Size: {document.file_size or 'Unknown'} | "
                    f"Uploaded at: {document.uploaded_at.isoformat() if document.uploaded_at else 'Unknown'}",
                    prefix="   ",
                )
            )
    else:
        lines.append("No documents uploaded.")
    lines.append("")

    lines.append("Timeline")
    timeline_items = sorted(case.timeline, key=lambda item: (item.date or 0, item.created_at or 0))
    if timeline_items:
        for index, item in enumerate(timeline_items, start=1):
            lines.append(f"{index}. {item.date.isoformat() if item.date else 'Unknown date'} | {item.event}")
            lines.extend(_wrap_paragraph(item.description or "No description.", prefix="   "))
    else:
        lines.append("No timeline entries.")

    return lines


def generate_simple_pdf(title, lines):
    wrapped_lines = []
    for line in lines:
        if not line:
            wrapped_lines.append("")
            continue
        wrapped_lines.extend(textwrap.wrap(str(line), width=88) or [""])

    if not wrapped_lines:
        wrapped_lines = ["No content available."]

    lines_per_page = 46
    pages = [wrapped_lines[index:index + lines_per_page] for index in range(0, len(wrapped_lines), lines_per_page)]

    objects = []
    page_refs = []
    font_object_id = 3
    next_object_id = 4

    for page_lines in pages:
        content_stream = _build_pdf_page_content(title, page_lines)
        content_object_id = next_object_id
        page_object_id = next_object_id + 1
        next_object_id += 2

        page_refs.append(f"{page_object_id} 0 R")
        objects.append(
            (
                content_object_id,
                b"<< /Length %d >>\nstream\n%s\nendstream" % (len(content_stream), content_stream),
            )
        )
        objects.append(
            (
                page_object_id,
                (
                    f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
                    f"/Resources << /Font << /F1 {font_object_id} 0 R >> >> "
                    f"/Contents {content_object_id} 0 R >>"
                ).encode("latin-1"),
            )
        )

    pages_object = f"<< /Type /Pages /Count {len(page_refs)} /Kids [{' '.join(page_refs)}] >>".encode("latin-1")
    catalog_object = b"<< /Type /Catalog /Pages 2 0 R >>"
    font_object = b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"

    final_objects = [(1, catalog_object), (2, pages_object), (3, font_object)] + objects
    final_objects.sort(key=lambda item: item[0])

    buffer = BytesIO()
    buffer.write(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = {0: 0}

    for object_id, payload in final_objects:
        offsets[object_id] = buffer.tell()
        buffer.write(f"{object_id} 0 obj\n".encode("latin-1"))
        buffer.write(payload)
        buffer.write(b"\nendobj\n")

    xref_start = buffer.tell()
    max_object_id = max(offsets)
    buffer.write(f"xref\n0 {max_object_id + 1}\n".encode("latin-1"))
    buffer.write(b"0000000000 65535 f \n")
    for object_id in range(1, max_object_id + 1):
        buffer.write(f"{offsets[object_id]:010d} 00000 n \n".encode("latin-1"))

    buffer.write(
        (
            f"trailer\n<< /Size {max_object_id + 1} /Root 1 0 R >>\n"
            f"startxref\n{xref_start}\n%%EOF"
        ).encode("latin-1")
    )
    return buffer.getvalue()


def build_share_token(secret_key, case):
    serializer = URLSafeSerializer(secret_key, salt="legalcms-case-report")
    return serializer.dumps({"case_id": case.id, "case_number": case.case_number})


def load_share_token(secret_key, token):
    serializer = URLSafeSerializer(secret_key, salt="legalcms-case-report")
    try:
        return serializer.loads(token)
    except BadSignature:
        return None


def _wrap_paragraph(text, prefix=""):
    wrapped = textwrap.wrap(str(text), width=max(24, 88 - len(prefix))) or [""]
    return [f"{prefix}{line}" if line else prefix for line in wrapped]


def _build_pdf_page_content(title, lines):
    header = [
        "BT",
        "/F1 12 Tf",
        "50 770 Td",
        "16 TL",
        f"({_escape_pdf_text(title)}) Tj",
        "T*",
        "/F1 10 Tf",
    ]

    body = []
    for line in lines:
        body.append(f"({_escape_pdf_text(line)}) Tj")
        body.append("T*")

    footer = ["ET"]
    return "\n".join(header + body + footer).encode("latin-1", errors="ignore")


def _escape_pdf_text(value):
    text = (value or "").replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
    return "".join(char if 32 <= ord(char) <= 126 else "?" for char in text)
