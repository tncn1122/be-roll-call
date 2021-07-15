import xlrd
import requests

fileLink = "DS.xlsx"
url = "http://localhost:3000/api/users/"
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGVjMzc2OTZiNmQzNDM4YjhmYWYwYjQiLCJpYXQiOjE2MjYwOTM0MTd9.KSJt1eYUcTzRLnzjTGZx55MaOsDdc1E1hpTCn220gmw"

def create_account(filename):
    loc = (filename)
    #open Workbook
    wb = xlrd.open_workbook(loc)
    sheet = wb.sheet_by_index(0)

    for index in range (3, sheet.nrows):
        student_id = sheet.cell(index, 1).value
        name = sheet.cell(index, 2).value + " " + sheet.cell(index, 3).value
        email = sheet.cell(index, 7).value
        post_account(student_id, name, email)


def post_account(student_id, name, email):
    print(student_id, name, email)
    body = {
    "id": student_id,
    "name": name,
    "email": email,
    "password": student_id,
    "role": "student",
    }
    headers = {
        "Authorization": "Bearer " + token
    }
    res = requests.post(url, data = body, headers = headers)
    print(res.status_code)



create_account(fileLink)