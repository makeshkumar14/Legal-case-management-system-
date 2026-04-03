r"""
Non-destructive review seed for demo day.
Creates enough users/cases for role-based login and case-status review.

Run:
    venv\Scripts\python.exe seed_review_data.py
"""

from datetime import date, datetime, timedelta
import random

from app import create_app
from models import db
from models.user import User
from models.case import Case, Hearing, CaseTimeline
from models.courtroom import Courtroom


def ensure_user(name, role, **kwargs):
    if role == "public":
        key = User.query.filter_by(aadhaar_number=kwargs["aadhaar_number"]).first()
        if not key and kwargs.get("phone"):
            key = User.query.filter_by(phone=kwargs["phone"], role="public").first()
    elif role == "advocate":
        key = User.query.filter_by(bar_council_id=kwargs["bar_council_id"]).first()
        if not key and kwargs.get("email"):
            key = User.query.filter_by(email=kwargs["email"], role="advocate").first()
    else:
        key = User.query.filter_by(admin_id=kwargs["admin_id"]).first()
        if not key and kwargs.get("email"):
            key = User.query.filter_by(email=kwargs["email"], role="court").first()

    if key:
        # Keep existing rows usable for review credentials.
        key.name = name
        for field, value in kwargs.items():
            setattr(key, field, value)
        return key, False

    user = User(name=name, role=role, **kwargs)
    return user, True


def seed_review_data():
    app = create_app()
    with app.app_context():
        random.seed(42)

        citizens = []
        advocates = []
        courts = []
        new_users = []

        citizen_specs = [
            ("Amit Patel", "123456789012", "9876543210"),
            ("Sneha Rao", "123456789013", "9876543211"),
            ("Ravi Shankar", "123456789014", "9876543212"),
            ("Pooja Desai", "123456789015", "9876543213"),
            ("Vikram Singh", "123456789016", "9876543214"),
            ("Anjali Sharma", "123456789017", "9876543215"),
            ("Rahul Verma", "123456789018", "9876543216"),
            ("Kavita Iyer", "123456789019", "9876543217"),
            ("Suresh Gupta", "123456789020", "9876543218"),
            ("Meenakshi Das", "123456789021", "9876543219"),
        ]

        for name, aadhaar, phone in citizen_specs:
            user, created = ensure_user(
                name=name,
                role="public",
                aadhaar_number=aadhaar,
                phone=phone,
            )
            citizens.append(user)
            if created:
                new_users.append(user)

        advocate_specs = [
            ("Adv. Priya Menon", "BCI/MAH/2019/4521", "priya@example.com"),
            ("Adv. Arjun Nair", "BCI/DEL/2020/1001", "arjun@example.com"),
            ("Adv. Rakesh Sharma", "BCI/KAR/2018/2002", "rakesh@example.com"),
            ("Adv. Neha Joshi", "BCI/TN/2017/3003", "neha@example.com"),
            ("Adv. Imran Khan", "BCI/GUJ/2021/4004", "imran@example.com"),
            ("Adv. Kavya Reddy", "BCI/AP/2016/5005", "kavya@example.com"),
            ("Adv. Sunil Iyer", "BCI/KER/2015/6006", "sunil@example.com"),
            ("Adv. Pavan Rao", "BCI/UP/2014/7007", "pavan@example.com"),
        ]

        for idx, (name, bar_id, email) in enumerate(advocate_specs):
            user, created = ensure_user(
                name=name,
                role="advocate",
                bar_council_id=bar_id,
                email=email,
                phone=f"99887766{idx:02d}",
                specialization=random.choice(
                    ["Civil Law", "Criminal Law", "Corporate Law", "Family Law"]
                ),
                experience=f"{5 + idx} years",
                rating=round(random.uniform(3.8, 4.9), 1),
            )
            if created:
                user.set_password("password123")
                new_users.append(user)
            else:
                user.set_password("password123")
            advocates.append(user)

        court_specs = [
            ("Court Admin 1", "ADMIN001", "District Court 1"),
            ("Court Admin 2", "ADMIN002", "District Court 2"),
            ("Court Admin 3", "ADMIN003", "District Court 3"),
            ("Court Admin 4", "ADMIN004", "District Court 4"),
        ]

        for idx, (name, admin_id, court_name) in enumerate(court_specs):
            user, created = ensure_user(
                name=name,
                role="court",
                admin_id=admin_id,
                email=f"admin{idx + 1}@example.com",
                phone=f"88776655{idx:02d}",
                court_name=court_name,
            )
            if created:
                user.set_password("admin123")
                new_users.append(user)
            else:
                user.set_password("admin123")
            courts.append(user)

        if new_users:
            db.session.add_all(new_users)
            db.session.flush()

        # Ensure a minimum set of courtrooms exists
        if Courtroom.query.count() < 5:
            to_add = []
            for i in range(5 - Courtroom.query.count()):
                to_add.append(
                    Courtroom(
                        name=f"Court Room {i + 1}",
                        judge=f"Justice {['Sharma', 'Iyer', 'Khan', 'Reddy', 'Patel'][i % 5]}",
                        status="available",
                    )
                )
            db.session.add_all(to_add)
            db.session.flush()

        courtrooms = Courtroom.query.all()

        # Create additional cases up to at least 24 total
        target_case_count = 24
        existing_case_count = Case.query.count()
        to_create = max(0, target_case_count - existing_case_count)
        new_cases = []

        statuses = [
            "filed",
            "under_review",
            "hearing_scheduled",
            "in_progress",
            "judgment_reserved",
            "closed",
            "dismissed",
        ]
        types = ["Civil", "Criminal", "Family", "Consumer", "Writ", "MACT"]
        priorities = ["low", "medium", "high"]

        start_index = existing_case_count + 1
        for i in range(to_create):
            petitioner_user = citizens[i % len(citizens)]
            advocate_user = advocates[i % len(advocates)]
            room = courtrooms[i % len(courtrooms)] if courtrooms else None
            status = statuses[i % len(statuses)]
            filing = date.today() - timedelta(days=(i + 1) * 5)

            case = Case(
                case_number=f"REV-{date.today().year}-{start_index + i:04d}",
                title=f"{petitioner_user.name} vs State #{start_index + i}",
                description="Review mock case for role-based status tracking.",
                case_type=types[i % len(types)],
                status=status,
                priority=priorities[i % len(priorities)],
                petitioner=petitioner_user.name,
                respondent=f"Respondent {start_index + i}",
                advocate_id=advocate_user.id,
                judge=room.judge if room else "Justice Demo",
                courtroom_id=room.id if room else None,
                court_room_name=room.name if room else "Court Room X",
                next_hearing=datetime.now() + timedelta(days=7 + i),
                filing_date=filing,
            )
            new_cases.append(case)

        if new_cases:
            db.session.add_all(new_cases)
            db.session.flush()

            timeline_rows = []
            hearing_rows = []
            for c in new_cases:
                timeline_rows.append(
                    CaseTimeline(
                        case_id=c.id,
                        date=c.filing_date,
                        event="Case Filed",
                        description="Review data seeded for project demo.",
                    )
                )
                timeline_rows.append(
                    CaseTimeline(
                        case_id=c.id,
                        date=min(date.today(), c.filing_date + timedelta(days=2)),
                        event="Advocate Assigned",
                        description="Advocate assignment completed.",
                    )
                )
                hearing_rows.append(
                    Hearing(
                        case_id=c.id,
                        date=date.today() + timedelta(days=10),
                        type="First Hearing",
                        status="scheduled",
                        notes="Auto-generated review hearing.",
                        location=c.court_room_name,
                        start_time=datetime.now() + timedelta(days=10, hours=2),
                    )
                )

            db.session.add_all(timeline_rows + hearing_rows)

        db.session.commit()

        print("Review seed complete.")
        print(f"Users total: {User.query.count()}")
        print(f" - Public:   {User.query.filter_by(role='public').count()}")
        print(f" - Advocate: {User.query.filter_by(role='advocate').count()}")
        print(f" - Court:    {User.query.filter_by(role='court').count()}")
        print(f"Cases total: {Case.query.count()}")
        print("Login test accounts:")
        print(" - Citizen (OTP): Aadhaar 123456789012")
        print(" - Advocate: BCI/MAH/2019/4521 / password123")
        print(" - Court: ADMIN001 / admin123")


if __name__ == "__main__":
    seed_review_data()
