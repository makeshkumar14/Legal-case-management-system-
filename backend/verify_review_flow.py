from app import create_app
from models.case import Case
from models.user import User


def auth_header(token):
    return {"Authorization": f"Bearer {token}"}


def main():
    app = create_app()
    with app.app_context():
        client = app.test_client()

        # 1) Citizen OTP login
        aadhaar = "123456789012"
        send = client.post("/api/auth/citizen/send-otp", json={"aadhaarNumber": aadhaar})
        assert send.status_code == 200, send.get_json()
        otp = send.get_json().get("otp")
        verify = client.post(
            "/api/auth/citizen/verify-otp",
            json={"aadhaarNumber": aadhaar, "otp": otp},
        )
        assert verify.status_code == 200, verify.get_json()
        citizen_token = verify.get_json()["token"]
        citizen_name = verify.get_json()["user"]["name"]

        # 2) Advocate + Court login
        adv_login = client.post(
            "/api/auth/advocate/login",
            json={"barCouncilId": "BCI/MAH/2019/4521", "password": "password123"},
        )
        assert adv_login.status_code == 200, adv_login.get_json()
        adv_token = adv_login.get_json()["token"]

        court_login = client.post(
            "/api/auth/admin/login",
            json={"adminId": "ADMIN001", "password": "admin123"},
        )
        assert court_login.status_code == 200, court_login.get_json()
        court_token = court_login.get_json()["token"]

        # 3) Verify case visibility
        citizen_cases_resp = client.get("/api/cases", headers=auth_header(citizen_token))
        assert citizen_cases_resp.status_code == 200, citizen_cases_resp.get_json()
        citizen_cases = citizen_cases_resp.get_json()
        print(f"Citizen '{citizen_name}' cases visible: {len(citizen_cases)}")

        advocate_cases_resp = client.get("/api/cases", headers=auth_header(adv_token))
        assert advocate_cases_resp.status_code == 200, advocate_cases_resp.get_json()
        advocate_cases = advocate_cases_resp.get_json()
        print(f"Advocate cases visible: {len(advocate_cases)}")

        court_cases_resp = client.get("/api/cases", headers=auth_header(court_token))
        assert court_cases_resp.status_code == 200, court_cases_resp.get_json()
        court_cases = court_cases_resp.get_json()
        print(f"Court cases visible: {len(court_cases)}")

        # 4) Status update flow check: pick one citizen case if present.
        changed_ok = False
        target = Case.query.filter_by(petitioner=citizen_name).first()
        if target:
            before = target.status
            new_status = "in_progress" if before != "in_progress" else "judgment_reserved"
            update = client.put(
                f"/api/cases/{target.id}",
                headers=auth_header(court_token),
                json={"status": new_status},
            )
            assert update.status_code == 200, update.get_json()

            # Citizen reads list again and should see new status
            citizen_cases_after = client.get("/api/cases", headers=auth_header(citizen_token))
            assert citizen_cases_after.status_code == 200, citizen_cases_after.get_json()
            rows = citizen_cases_after.get_json()
            matched = [c for c in rows if c.get("caseNumber") == target.case_number]
            if matched and matched[0].get("status") == new_status:
                changed_ok = True
            print(
                f"Status update check on {target.case_number}: "
                f"{before} -> {new_status} | citizen sees update={changed_ok}"
            )
        else:
            print("No citizen-linked case found for status-change assertion.")

        print("VERIFY_OK", changed_ok)


if __name__ == "__main__":
    main()
