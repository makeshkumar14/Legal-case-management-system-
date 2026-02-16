"""
Seed the database with mock data matching the frontend's mockData.js.
Run:  python seed.py
"""

from app import create_app
from models import db
from models.user import User
from models.case import Case, Hearing, CaseTimeline
from models.document import Document
from models.task import Task
from models.case_note import CaseNote
from models.notification import Notification
from models.message import Message
from models.courtroom import Courtroom
from datetime import date, datetime, timedelta


def seed():
    app = create_app()
    with app.app_context():
        # Clear existing data (order matters for foreign keys)
        print("Clearing existing data...")
        Message.query.delete()
        Notification.query.delete()
        CaseNote.query.delete()
        Task.query.delete()
        Document.query.delete()
        CaseTimeline.query.delete()
        Hearing.query.delete()
        Case.query.delete()
        Courtroom.query.delete()
        User.query.delete()
        db.session.commit()

        # ═══════════════════════════════════════════════════════════
        # 1. USERS
        # ═══════════════════════════════════════════════════════════
        print("Seeding users...")
        users = [
            User(name="Rajesh Kumar", email="rajesh@example.com", role="public",
                 citizen_id="CIT-2024-7842", phone="9876543210"),
            User(name="Adv. Priya Sharma", email="priya@example.com", role="advocate",
                 bar_council_id="BCI/MAH/2019/4521", specialization="Civil & Family Law",
                 experience="8 years", rating=4.8, phone="9876543211"),
            User(name="Court Admin", email="court@example.com", role="court",
                 court_name="District Court, Mumbai", phone="9876543212"),
            User(name="Adv. Vikram Singh", email="vikram@example.com", role="advocate",
                 bar_council_id="BCI/DEL/2015/3210", specialization="Criminal Law",
                 experience="12 years", rating=4.5, phone="9876543213"),
            User(name="Meena Devi", email="meena@example.com", role="public",
                 citizen_id="CIT-2024-1234", phone="9876543214"),
            User(name="Adv. Anita Desai", email="anita@example.com", role="advocate",
                 bar_council_id="BCI/KAR/2017/5678", specialization="Consumer Law",
                 experience="6 years", rating=4.2, phone="9876543215"),
        ]
        for u in users:
            u.set_password("password123")
        db.session.add_all(users)
        db.session.flush()

        advocate_priya = users[1]
        advocate_vikram = users[3]
        advocate_anita = users[5]
        public_rajesh = users[0]
        public_meena = users[4]
        court_admin = users[2]

        # ═══════════════════════════════════════════════════════════
        # 2. COURTROOMS
        # ═══════════════════════════════════════════════════════════
        print("Seeding courtrooms...")
        courtrooms = [
            Courtroom(name="Court Room 1", judge="Justice R. Krishnan", status="in_session",
                      current_case="CIV-2024-1842", case_title="Property Dispute - Sharma vs Patel",
                      start_time="10:00 AM", case_type="Civil"),
            Courtroom(name="Court Room 2", judge="Justice S. Mehta", status="available"),
            Courtroom(name="Court Room 3", judge="Justice P. Iyer", status="in_session",
                      current_case="CRM-2024-0923", case_title="State vs Rajan Kumar",
                      start_time="11:00 AM", case_type="Criminal"),
            Courtroom(name="Court Room 4", judge="Justice A. Khan", status="recess",
                      current_case="FAM-2024-0445", case_title="Divorce Proceedings - Gupta",
                      start_time="10:30 AM", case_type="Family"),
            Courtroom(name="Court Room 5", judge="Justice M. Reddy", status="available"),
            Courtroom(name="Court Room 6", judge="Justice K. Pillai", status="in_session",
                      current_case="WRT-2024-0267", case_title="Writ Petition - Environmental",
                      start_time="10:15 AM", case_type="Writ"),
            Courtroom(name="Mediation Room", judge="Justice T. Das", status="in_session",
                      current_case="CIV-2024-2341", case_title="Mediation - Land Dispute",
                      start_time="09:30 AM", case_type="Civil"),
            Courtroom(name="MACT Hall", judge="Justice V. Nair", status="in_session",
                      current_case="MACT-2024-0156", case_title="Accident Claim - Kumar Family",
                      start_time="11:30 AM", case_type="MACT"),
            Courtroom(name="Family Court Hall", judge="Justice L. Bose", status="closed"),
            Courtroom(name="Court Room 12", judge="Justice D. Sharma", status="in_session",
                      current_case="CNS-2024-0891", case_title="Consumer Fraud - Patel vs Electronics Ltd",
                      start_time="10:45 AM", case_type="Consumer"),
        ]
        db.session.add_all(courtrooms)
        db.session.flush()

        # ═══════════════════════════════════════════════════════════
        # 3. CASES
        # ═══════════════════════════════════════════════════════════
        print("Seeding cases...")
        cases = [
            Case(case_number="CIV-2024-1842", title="Property Dispute - Sharma vs Patel",
                 description="Civil dispute regarding ownership of commercial property at MG Road, Mumbai.",
                 case_type="Civil", status="hearing_scheduled", priority="high",
                 petitioner="Rajesh Kumar", respondent="Patel Industries Ltd.",
                 advocate_id=advocate_priya.id, judge="Justice R. Krishnan",
                 court_room_name="Court Room 1",
                 next_hearing=datetime(2025, 2, 20, 10, 0), filing_date=date(2024, 3, 15)),
            Case(case_number="CRM-2024-0923", title="State vs Rajan Kumar - Theft Case",
                 description="Criminal case involving theft of valuable artifacts from the city museum.",
                 case_type="Criminal", status="in_progress", priority="high",
                 petitioner="State of Maharashtra", respondent="Rajan Kumar",
                 advocate_id=advocate_vikram.id, judge="Justice P. Iyer",
                 court_room_name="Court Room 3",
                 next_hearing=datetime(2025, 2, 22, 11, 0), filing_date=date(2024, 6, 1)),
            Case(case_number="FAM-2024-0445", title="Gupta vs Gupta - Divorce Proceedings",
                 description="Mutual consent divorce with agreed terms on alimony and child custody.",
                 case_type="Family", status="under_review", priority="medium",
                 petitioner="Meena Devi", respondent="Suresh Gupta",
                 advocate_id=advocate_priya.id, judge="Justice A. Khan",
                 court_room_name="Court Room 4",
                 next_hearing=datetime(2025, 3, 5, 10, 30), filing_date=date(2024, 7, 20)),
            Case(case_number="WRT-2024-0267", title="Environmental Writ - River Pollution",
                 description="Public interest litigation on industrial pollution in Yamuna river basin.",
                 case_type="Writ", status="filed", priority="high",
                 petitioner="Environmental Trust of India", respondent="Industrial Board",
                 advocate_id=advocate_anita.id, judge="Justice K. Pillai",
                 court_room_name="Court Room 6",
                 next_hearing=datetime(2025, 2, 28, 10, 15), filing_date=date(2024, 9, 10)),
            Case(case_number="CNS-2024-0891", title="Consumer Fraud - Patel vs Electronics Ltd",
                 description="Consumer complaint regarding defective electronic goods and refund denial.",
                 case_type="Consumer", status="hearing_scheduled", priority="medium",
                 petitioner="Rajesh Kumar", respondent="Super Electronics Ltd.",
                 advocate_id=advocate_anita.id, judge="Justice D. Sharma",
                 court_room_name="Court Room 12",
                 next_hearing=datetime(2025, 3, 10, 10, 45), filing_date=date(2024, 10, 5)),
            Case(case_number="CIV-2024-2341", title="Land Dispute - Village Boundary",
                 description="Dispute over agricultural land boundaries between two villages.",
                 case_type="Civil", status="judgment_reserved", priority="low",
                 petitioner="Village Panchayat A", respondent="Village Panchayat B",
                 advocate_id=advocate_vikram.id, judge="Justice T. Das",
                 court_room_name="Mediation Room",
                 filing_date=date(2024, 4, 25)),
            Case(case_number="CRM-2024-1150", title="Cybercrime - Online Fraud Investigation",
                 description="Investigation into a large-scale online financial fraud operation.",
                 case_type="Criminal", status="in_progress", priority="high",
                 petitioner="State Cyber Cell", respondent="Unknown Accused",
                 advocate_id=advocate_vikram.id, judge="Justice S. Mehta",
                 court_room_name="Court Room 2",
                 next_hearing=datetime(2025, 3, 15, 11, 0), filing_date=date(2024, 11, 1)),
            Case(case_number="FAM-2025-0078", title="Child Custody - Singh Family",
                 description="Contested custody case following divorce proceedings.",
                 case_type="Family", status="filed", priority="medium",
                 petitioner="Anjali Singh", respondent="Ramesh Singh",
                 advocate_id=advocate_priya.id, judge="Justice L. Bose",
                 court_room_name="Family Court Hall",
                 next_hearing=datetime(2025, 3, 20, 10, 0), filing_date=date(2025, 1, 15)),
        ]
        db.session.add_all(cases)
        db.session.flush()

        # ═══════════════════════════════════════════════════════════
        # 4. HEARINGS
        # ═══════════════════════════════════════════════════════════
        print("Seeding hearings...")
        hearings = [
            # Case 1 hearings
            Hearing(case_id=cases[0].id, date=date(2024, 5, 10), type="First Hearing",
                    status="completed", notes="Case admitted. Respondent served notice.",
                    location="Court Room 1"),
            Hearing(case_id=cases[0].id, date=date(2024, 8, 15), type="Arguments",
                    status="completed", notes="Petitioner presented property documents.",
                    location="Court Room 1"),
            Hearing(case_id=cases[0].id, date=date(2025, 2, 20), type="Cross Examination",
                    status="scheduled", location="Court Room 1",
                    start_time=datetime(2025, 2, 20, 10, 0), end_time=datetime(2025, 2, 20, 12, 0)),
            # Case 2 hearings
            Hearing(case_id=cases[1].id, date=date(2024, 7, 1), type="Bail Hearing",
                    status="completed", notes="Bail denied. Accused remanded to custody.",
                    location="Court Room 3"),
            Hearing(case_id=cases[1].id, date=date(2025, 2, 22), type="Evidence Presentation",
                    status="scheduled", location="Court Room 3",
                    start_time=datetime(2025, 2, 22, 11, 0), end_time=datetime(2025, 2, 22, 13, 0)),
            # Case 3 hearings
            Hearing(case_id=cases[2].id, date=date(2024, 9, 5), type="Mediation",
                    status="completed", notes="Parties agreed on terms in principle.",
                    location="Court Room 4"),
            Hearing(case_id=cases[2].id, date=date(2025, 3, 5), type="Final Review",
                    status="scheduled", location="Court Room 4",
                    start_time=datetime(2025, 3, 5, 10, 30), end_time=datetime(2025, 3, 5, 11, 30)),
            # Case 4 hearings
            Hearing(case_id=cases[3].id, date=date(2025, 2, 28), type="First Hearing",
                    status="scheduled", location="Court Room 6",
                    start_time=datetime(2025, 2, 28, 10, 15), end_time=datetime(2025, 2, 28, 11, 15)),
            # Case 5 hearings
            Hearing(case_id=cases[4].id, date=date(2024, 11, 15), type="First Hearing",
                    status="completed", notes="Complaint noted. Respondent to file reply.",
                    location="Court Room 12"),
            Hearing(case_id=cases[4].id, date=date(2025, 3, 10), type="Arguments",
                    status="scheduled", location="Court Room 12",
                    start_time=datetime(2025, 3, 10, 10, 45), end_time=datetime(2025, 3, 10, 12, 0)),
        ]
        db.session.add_all(hearings)

        # ═══════════════════════════════════════════════════════════
        # 5. CASE TIMELINE
        # ═══════════════════════════════════════════════════════════
        print("Seeding case timelines...")
        timelines = [
            CaseTimeline(case_id=cases[0].id, date=date(2024, 3, 15),
                         event="Case Filed", description="Case registered with Court Registry"),
            CaseTimeline(case_id=cases[0].id, date=date(2024, 3, 20),
                         event="Advocate Assigned", description="Adv. Priya Sharma assigned to the case"),
            CaseTimeline(case_id=cases[0].id, date=date(2024, 5, 10),
                         event="First Hearing", description="Case admitted, respondent served notice"),
            CaseTimeline(case_id=cases[0].id, date=date(2024, 8, 15),
                         event="Document Submission", description="Property documents submitted by petitioner"),
            CaseTimeline(case_id=cases[1].id, date=date(2024, 6, 1),
                         event="FIR Registered", description="Case filed based on museum theft FIR"),
            CaseTimeline(case_id=cases[1].id, date=date(2024, 7, 1),
                         event="Bail Denied", description="Bail application rejected by court"),
            CaseTimeline(case_id=cases[2].id, date=date(2024, 7, 20),
                         event="Petition Filed", description="Divorce petition filed by mutual consent"),
            CaseTimeline(case_id=cases[2].id, date=date(2024, 9, 5),
                         event="Mediation", description="Parties reached agreement on terms"),
        ]
        db.session.add_all(timelines)

        # ═══════════════════════════════════════════════════════════
        # 6. DOCUMENTS (Evidence)
        # ═══════════════════════════════════════════════════════════
        print("Seeding documents...")
        documents = [
            Document(case_id=cases[0].id, uploaded_by=advocate_priya.id,
                     title="Property Deed - MG Road", doc_type="Document",
                     file_type="pdf", file_size="2.4 MB", verified=True),
            Document(case_id=cases[0].id, uploaded_by=advocate_priya.id,
                     title="Land Survey Map", doc_type="Image",
                     file_type="jpg", file_size="5.1 MB", verified=True),
            Document(case_id=cases[0].id, uploaded_by=advocate_priya.id,
                     title="Tax Receipts 2020-2024", doc_type="Document",
                     file_type="pdf", file_size="1.8 MB", verified=False),
            Document(case_id=cases[1].id, uploaded_by=advocate_vikram.id,
                     title="CCTV Footage - Museum", doc_type="Video",
                     file_type="mp4", file_size="156 MB", verified=True),
            Document(case_id=cases[1].id, uploaded_by=advocate_vikram.id,
                     title="FIR Copy", doc_type="Document",
                     file_type="pdf", file_size="0.5 MB", verified=True),
            Document(case_id=cases[4].id, uploaded_by=advocate_anita.id,
                     title="Product Receipt", doc_type="Document",
                     file_type="pdf", file_size="0.3 MB", verified=True),
            Document(case_id=cases[4].id, uploaded_by=advocate_anita.id,
                     title="Defect Photos", doc_type="Image",
                     file_type="jpg", file_size="3.2 MB", verified=False),
        ]
        db.session.add_all(documents)

        # ═══════════════════════════════════════════════════════════
        # 7. TASKS
        # ═══════════════════════════════════════════════════════════
        print("Seeding tasks...")
        tasks = [
            Task(case_id=cases[0].id, user_id=advocate_priya.id,
                 title="Prepare cross-examination questions", completed=False,
                 priority="high", due_date=date(2025, 2, 19)),
            Task(case_id=cases[0].id, user_id=advocate_priya.id,
                 title="Review property survey reports", completed=True,
                 priority="medium", due_date=date(2025, 2, 15)),
            Task(case_id=cases[2].id, user_id=advocate_priya.id,
                 title="Draft final settlement agreement", completed=False,
                 priority="high", due_date=date(2025, 3, 1)),
            Task(case_id=cases[1].id, user_id=advocate_vikram.id,
                 title="Arrange expert witness testimony", completed=False,
                 priority="high", due_date=date(2025, 2, 21)),
            Task(case_id=cases[1].id, user_id=advocate_vikram.id,
                 title="File supplementary charge sheet", completed=True,
                 priority="medium", due_date=date(2025, 2, 10)),
            Task(case_id=cases[4].id, user_id=advocate_anita.id,
                 title="Collect product testing report", completed=False,
                 priority="medium", due_date=date(2025, 3, 8)),
        ]
        db.session.add_all(tasks)

        # ═══════════════════════════════════════════════════════════
        # 8. CASE NOTES
        # ═══════════════════════════════════════════════════════════
        print("Seeding case notes...")
        notes = [
            CaseNote(case_id=cases[0].id, user_id=advocate_priya.id,
                     content="Client confirmed property purchase in 2018. Original deed available."),
            CaseNote(case_id=cases[0].id, user_id=advocate_priya.id,
                     content="Respondent's counsel requested adjournment — denied by judge."),
            CaseNote(case_id=cases[1].id, user_id=advocate_vikram.id,
                     content="CCTV footage clearly shows accused entering museum at 2:15 AM."),
        ]
        db.session.add_all(notes)

        # ═══════════════════════════════════════════════════════════
        # 9. NOTIFICATIONS
        # ═══════════════════════════════════════════════════════════
        print("Seeding notifications...")
        notifications = [
            Notification(user_id=public_rajesh.id, type="hearing", title="Upcoming Hearing",
                         message="Your case CIV-2024-1842 has a hearing on 20 Feb 2025.",
                         priority="high"),
            Notification(user_id=public_rajesh.id, type="update", title="Case Status Updated",
                         message="Case CIV-2024-1842 status changed to Hearing Scheduled.",
                         priority="medium", is_read=True),
            Notification(user_id=public_rajesh.id, type="document", title="Document Verified",
                         message="Property Deed has been verified by the court.",
                         priority="low", is_read=True),
            Notification(user_id=advocate_priya.id, type="reminder", title="Task Due Tomorrow",
                         message="Prepare cross-examination questions for CIV-2024-1842.",
                         priority="high"),
            Notification(user_id=advocate_priya.id, type="hearing", title="Hearing Reminder",
                         message="Hearing in CIV-2024-1842 scheduled for 20 Feb 2025 at 10:00 AM.",
                         priority="high"),
            Notification(user_id=court_admin.id, type="system", title="New Case Filed",
                         message="Case FAM-2025-0078 has been filed and requires assignment.",
                         priority="medium"),
            Notification(user_id=advocate_vikram.id, type="hearing", title="Hearing Tomorrow",
                         message="Evidence presentation in CRM-2024-0923 at Court Room 3.",
                         priority="high"),
        ]
        db.session.add_all(notifications)

        # ═══════════════════════════════════════════════════════════
        # 10. MESSAGES
        # ═══════════════════════════════════════════════════════════
        print("Seeding messages...")
        messages = [
            Message(sender_id=public_rajesh.id, receiver_id=advocate_priya.id,
                    content="Good morning, any update on my property case?"),
            Message(sender_id=advocate_priya.id, receiver_id=public_rajesh.id,
                    content="Hello Rajesh! The hearing is scheduled for 20th Feb. I'll need the original deed by then."),
            Message(sender_id=public_rajesh.id, receiver_id=advocate_priya.id,
                    content="Sure, I will bring it to your office tomorrow."),
            Message(sender_id=advocate_priya.id, receiver_id=court_admin.id,
                    content="Requesting early hearing date for case FAM-2024-0445."),
            Message(sender_id=court_admin.id, receiver_id=advocate_priya.id,
                    content="Noted. Will check availability and revert."),
            Message(sender_id=advocate_vikram.id, receiver_id=court_admin.id,
                    content="Need permission to present additional evidence in CRM-2024-0923."),
            Message(sender_id=court_admin.id, receiver_id=advocate_vikram.id,
                    content="Please file an application for the same. Will be taken up in next hearing."),
        ]
        db.session.add_all(messages)

        db.session.commit()
        print("\n✅ Database seeded successfully!")
        print(f"   Users:         {User.query.count()}")
        print(f"   Courtrooms:    {Courtroom.query.count()}")
        print(f"   Cases:         {Case.query.count()}")
        print(f"   Hearings:      {Hearing.query.count()}")
        print(f"   Timeline:      {CaseTimeline.query.count()}")
        print(f"   Documents:     {Document.query.count()}")
        print(f"   Tasks:         {Task.query.count()}")
        print(f"   Case Notes:    {CaseNote.query.count()}")
        print(f"   Notifications: {Notification.query.count()}")
        print(f"   Messages:      {Message.query.count()}")


if __name__ == "__main__":
    seed()
