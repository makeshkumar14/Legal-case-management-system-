from app import create_app
from models.user import User


def main():
    app = create_app()
    with app.app_context():
        rows = User.query.filter_by(role="public").order_by(User.id.asc()).all()
        print(f"TOTAL_PUBLIC {len(rows)}")
        for user in rows:
            if user.aadhaar_number:
                print(f"{user.name} | {user.aadhaar_number} | {user.phone}")


if __name__ == "__main__":
    main()
