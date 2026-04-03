from app import create_app
from models import db
from sqlalchemy import inspect


def main():
    app = create_app()
    with app.app_context():
        insp = inspect(db.engine)
        model_tables = db.metadata.tables

        print("TABLE_CHECK_START")
        for table_name, table in model_tables.items():
            if not insp.has_table(table_name):
                print(f"MISSING_TABLE {table_name}")
                continue

            existing_columns = {col["name"] for col in insp.get_columns(table_name)}
            model_columns = {col.name for col in table.columns}
            missing_columns = sorted(model_columns - existing_columns)
            if missing_columns:
                print(f"MISSING_COLUMNS {table_name} {missing_columns}")
        print("TABLE_CHECK_END")


if __name__ == "__main__":
    main()
