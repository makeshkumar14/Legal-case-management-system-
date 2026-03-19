from app import create_app
from models.user import User

app = create_app()
with app.app_context():
    users = User.query.all()
    for u in users:
        print(f"ID: {u.id}, Email: {u.email}, Role: {u.role}")
