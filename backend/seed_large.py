"""
Generate a massive mock dataset (30-40 cases) for the Legal Case Management System.
Run: python seed_large.py
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
from models.otp import OTPCode
from datetime import date, datetime, timedelta
import random

def random_date(start_date, end_date):
    time_between = end_date - start_date
    days_between = time_between.days
    random_days = random.randrange(days_between)
    return start_date + timedelta(days=random_days)

def seed_large():
    app = create_app()
    with app.app_context():
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
        OTPCode.query.delete()
        User.query.delete()
        db.session.commit()

        # -------------------------------------------------------------
        # 1. GENERATE USERS
        # -------------------------------------------------------------
        print("Generating massive user dataset...")
        
        # 15 Citizens
        citizen_names = [
            "Amit Patel", "Sneha Rao", "Ravi Shankar", "Pooja Desai", "Vikram Singh",
            "Anjali Sharma", "Rahul Verma", "Kavita Iyer", "Suresh Gupta", "Meenakshi Das",
            "Kiran Kumar", "Namrata Joshi", "Ashok Reddy", "Gita Nair", "Deepak Menon"
        ]
        citizens = []
        for i, name in enumerate(citizen_names):
            citizen = User(
                name=name,
                aadhaar_number=f"1111222233{i:02d}",
                phone=f"98765431{i:02d}",
                role="public"
            )
            citizens.append(citizen)

        # 10 Advocates
        advocate_names = [
            "Adv. Kiran Bedi", "Adv. Rakesh Jhunjhunwala", "Adv. Sameer Wankhede", "Adv. Natasha Singh",
            "Adv. Imran Hashmi", "Adv. Pratiksha Patil", "Adv. Devendra Fadnavis", "Adv. Sunita Williams",
            "Adv. Rajeev Chandrasekhar", "Adv. Arundhati Roy"
        ]
        specs = ["Civil Law", "Criminal Law", "Corporate Law", "Family Law", "IPR & Patents", "Constitutional Law"]
        advocates = []
        for i, name in enumerate(advocate_names):
            adv = User(
                name=name,
                email=f"adv{i}@example.com",
                bar_council_id=f"BCI/NAT/201{i}/00{i}",
                specialization=random.choice(specs),
                experience=f"{random.randint(4, 25)} years",
                rating=round(random.uniform(3.5, 4.9), 1),
                phone=f"99887766{i:02d}",
                role="advocate"
            )
            adv.set_password("password123")
            advocates.append(adv)

        # 5 Court Admins
        admins = []
        for i in range(5):
            admin = User(
                name=f"Admin {i+1}",
                email=f"admin{i+1}@example.com",
                admin_id=f"ADMIN{i+1}",
                court_name=f"District Court No. {i+1}",
                phone=f"88776655{i:02d}",
                role="court"
            )
            admin.set_password("admin123")
            admins.append(admin)

        db.session.add_all(citizens + advocates + admins)
        db.session.flush()

        # -------------------------------------------------------------
        # 2. GENERATE COURTROOMS
        # -------------------------------------------------------------
        print("Generating courtrooms...")
        courtrooms = []
        for i in range(10):
            courtrooms.append(
                Courtroom(
                    name=f"Court Room {i+1}",
                    judge=f"Justice {random.choice(['A.', 'P.', 'R.', 'K.', 'V.'])} {random.choice(['Sharma', 'Iyer', 'Khan', 'Reddy', 'Patel'])}",
                    status=random.choice(["available", "in_session", "recess", "closed"])
                )
            )
        db.session.add_all(courtrooms)
        db.session.flush()

        # -------------------------------------------------------------
        # 3. GENERATE 40 CASES
        # -------------------------------------------------------------
        print("Generating 40 mock cases...")
        case_types = ["Civil", "Criminal", "Family", "Consumer", "Writ", "MACT"]
        statuses = ["filed", "under_review", "hearing_scheduled", "in_progress", "judgment_reserved", "closed", "dismissed"]
        priorities = ["low", "medium", "high", "critical"]

        cases = []
        for i in range(40):
            filing = random_date(date(2023, 1, 1), date(2024, 12, 31))
            c_type = random.choice(case_types)
            c_status = random.choice(statuses)
            adv = random.choice(advocates)
            pet = random.choice(citizens)
            
            # 60% chance for a future hearing if the case is active
            next_h = None
            if c_status in ["filed", "hearing_scheduled", "in_progress"]:
                next_h = random_date(datetime.now(), datetime.now() + timedelta(days=90))

            case = Case(
                case_number=f"{c_type[:3].upper()}-{filing.year}-{1000+i}",
                title=f"{pet.name} vs {random.choice(['State', 'Municipal Corp', 'Private Ltd.', 'Opposing Party'])}",
                description=f"Standard {c_type.lower()} dispute procedure involving multiple financial and regulatory facets.",
                case_type=c_type,
                status=c_status,
                priority=random.choice(priorities),
                petitioner=pet.name,
                respondent=f"Respondent #{i}",
                advocate_id=adv.id,
                judge=random.choice(courtrooms).judge,
                court_room_name=random.choice(courtrooms).name,
                next_hearing=next_h,
                filing_date=filing
            )
            cases.append(case)
        
        db.session.add_all(cases)
        db.session.flush()

        # -------------------------------------------------------------
        # 4. GENERATE HEARINGS, TIMELINES, DOCUMENTS, TASKS
        # -------------------------------------------------------------
        print("Populating timelines, hearings, and documents...")
        hearings = []
        timelines = []
        documents = []
        tasks = []
        notes = []
        notifications = []

        for case in cases:
            # Timeline base
            timelines.append(CaseTimeline(case_id=case.id, date=case.filing_date, event="Case Filed", description="Case physically submitted."))
            timelines.append(CaseTimeline(case_id=case.id, date=case.filing_date + timedelta(days=5), event="Advocate Assigned", description="Counsel taken on record."))

            # Hearings
            num_hearings = random.randint(1, 4)
            for h in range(num_hearings):
                h_date = random_date(case.filing_date, date.today() + timedelta(days=60))
                h_status = "completed" if h_date < date.today() else "scheduled"
                hearings.append(
                    Hearing(
                        case_id=case.id,
                        date=h_date,
                        type=random.choice(["First Hearing", "Arguments", "Evidence Presentation", "Cross Examination", "Final Verdict"]),
                        status=h_status,
                        notes="Arguments heard from both sides." if h_status == "completed" else "",
                        location=case.court_room_name,
                        start_time=datetime.combine(h_date, datetime.min.time()) + timedelta(hours=random.randint(9, 15))
                    )
                )

            # Documents
            for d in range(random.randint(1, 3)):
                documents.append(
                    Document(
                        case_id=case.id,
                        uploaded_by=case.advocate_id,
                        title=f"Legal Annexure {d+1}.pdf",
                        doc_type="Document",
                        file_type="pdf",
                        file_size=f"{random.randint(1,10)} MB",
                        verified=random.choice([True, False])
                    )
                )

            # Tasks
            if case.status not in ["closed", "dismissed"]:
                tasks.append(
                    Task(
                        case_id=case.id,
                        user_id=case.advocate_id,
                        title="Draft upcoming petition review",
                        completed=random.choice([True, False]),
                        priority=random.choice(["medium", "high"]),
                        due_date=date.today() + timedelta(days=random.randint(1, 14))
                    )
                )

            # Notes
            notes.append(
                CaseNote(
                    case_id=case.id,
                    user_id=case.advocate_id,
                    content="Client is deeply invested in closing this before the upcoming quarter."
                )
            )

        db.session.add_all(hearings + timelines + documents + tasks + notes)
        
        # -------------------------------------------------------------
        # 5. GENERATE COMMUNICATIONS (NOTIFS & MESSAGES)
        # -------------------------------------------------------------
        print("Generating communication logs...")
        for citizen in citizens[:5]: # just the first 5 to limit
            notifications.append(Notification(user_id=citizen.id, type="update", title="Portal Access Granted", message="Welcome to the Legal Case Management System.", priority="medium"))
            
        db.session.add_all(notifications)

        # Force pre-created review accounts to have fixed credentials so reviewers can easily log in
        # (Overriding the first elements just to ensure exact login matches the previous printouts)
        citizens[0].aadhaar_number = "123456789012"
        citizens[0].phone = "9876543210"

        advocates[0].bar_council_id = "BCI/MAH/2019/4521"
        advocates[0].email = "priya@example.com"
        
        admins[0].admin_id = "ADMIN001"

        db.session.commit()
        
        print("\n✅ MASSIVE DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print(f"   Users:         {User.query.count()}")
        print(f"   Courtrooms:    {Courtroom.query.count()}")
        print(f"   Cases:         {Case.query.count()} (Target: 40)")
        print(f"   Hearings:      {Hearing.query.count()}")
        print(f"   Timeline:      {CaseTimeline.query.count()}")
        print(f"   Documents:     {Document.query.count()}")
        print(f"   Tasks:         {Task.query.count()}")
        print(f"   Case Notes:    {CaseNote.query.count()}")
        print("\n📋 MAIN ACCOUNTS FOR REVIEWER LOGIN:")
        print("   Citizen:  Aadhaar 123456789012, phone 9876543210 (OTP based)")
        print("   Advocate: Bar Council ID BCI/MAH/2019/4521, password: password123")
        print("   Admin:    Admin ID ADMIN001, password: admin123")

if __name__ == "__main__":
    seed_large()
