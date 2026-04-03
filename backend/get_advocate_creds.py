from app import create_app
from models.user import User

app = create_app()
with app.app_context():
    advocates = User.query.filter_by(role='advocate').all()
    print("--- ADVOCATE CREDENTIALS ---")
    for a in advocates:
        print(f"Name: {a.name} | Email: {a.email} | Bar Council ID: {a.bar_council_id} | Phone: {a.phone}")
