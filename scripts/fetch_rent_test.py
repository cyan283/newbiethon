import os
import requests

API_KEY = os.getenv("DATA_GO_KR_API_KEY")

url = (
    "https://apis.data.go.kr/1613000/RTMSDataSvcSHRent/"
    "getRTMSDataSvcSHRent"
    f"?serviceKey={API_KEY}"
    "&LAWD_CD=11680"
    "&DEAL_YMD=202608"
    "&numOfRows=10"
    "&pageNo=1"
)

response = requests.get(
    url,
    timeout=15
)

print("상태코드:", response.status_code)
print(response.text[:2000])