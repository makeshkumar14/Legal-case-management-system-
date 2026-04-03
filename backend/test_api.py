import urllib.request, json, urllib.error
data = json.dumps({'name': 'Test Citizen 3', 'aadhaarNumber': '999988887777', 'phone': '0987654321'}).encode('utf-8')
req = urllib.request.Request('http://127.0.0.1:5000/api/auth/citizen/register', data=data, headers={'Content-Type': 'application/json'})
try:
    res = urllib.request.urlopen(req)
    with open('test_out.txt', 'w') as f:
        f.write("OK: " + str(res.status) + "\n" + res.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    with open('test_out.txt', 'w') as f:
        f.write("ERROR: " + str(e.code) + "\n" + e.read().decode('utf-8'))
