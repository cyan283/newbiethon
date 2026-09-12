import os
import requests
import pandas as pd
from datetime import datetime
from dateutil.relativedelta import relativedelta


API_KEY = os.getenv("DATA_GO_KR_API_KEY")

CANDIDATE_FILE = "data/candidates_with_transit.csv"
OUTPUT_FILE = "data/rents.csv"


# 단독/다가구 전월세 실거래가 API
API_URL = (
    "https://apis.data.go.kr/1613000/RTMSDataSvcSHRent/"
    "getRTMSDataSvcSHRent"
)


def get_recent_months(n=3):
    """
    최근 n개월을 YYYYMM 형태로 반환
    """
    today = datetime.today()

    months = []

    for i in range(n):
        target = today - relativedelta(months=i)
        months.append(target.strftime("%Y%m"))

    return months


def fetch_rent_data(lawd_cd, deal_ymd):
    url = (
        "https://apis.data.go.kr/1613000/RTMSDataSvcSHRent/"
        "getRTMSDataSvcSHRent"
        f"?serviceKey={API_KEY}"
        f"&LAWD_CD={lawd_cd}"
        f"&DEAL_YMD={deal_ymd}"
        "&numOfRows=999"
        "&pageNo=1"
    )

    response = requests.get(
        url,
        timeout=30
    )

    response.raise_for_status()

    return response.text

def main():
    if not API_KEY:
        raise ValueError(
            "DATA_GO_KR_API_KEY 환경변수가 설정되지 않았습니다."
        )

    # 후보 동네 파일 읽기
    candidates = pd.read_csv(CANDIDATE_FILE)

    # legal_code가 없기 때문에
    # regions.csv와 연결해서 법정동 코드를 붙임
    regions = pd.read_csv("data/regions.csv")

    merged = candidates.merge(
        regions[
            [
                "region",
                "gu",
                "legal_code"
            ]
        ],
        on=["region", "gu"],
        how="left"
    )

    # 시군구 코드 = 법정동코드 앞 5자리
    merged["lawd_cd"] = (
        merged["legal_code"]
        .astype(str)
        .str[:5]
    )

    # 실제로 필요한 구 코드만 추출
    lawd_codes = (
        merged["lawd_cd"]
        .dropna()
        .unique()
        .tolist()
    )

    months = get_recent_months(3)

    print("조회할 시군구 코드:")
    print(lawd_codes)

    print()
    print("조회할 계약월:")
    print(months)

    rows = []

    for lawd_cd in lawd_codes:

        for month in months:

            print(
                f"{lawd_cd} / {month} 조회 중..."
            )

            try:
                xml_text = fetch_rent_data(
                    lawd_cd,
                    month
                )

                rows.append({
                    "lawd_cd": lawd_cd,
                    "deal_ymd": month,
                    "raw_xml": xml_text
                })

                print("  성공")

            except Exception as error:
                print(f"  오류: {error}")

    result = pd.DataFrame(rows)

    result.to_csv(
        OUTPUT_FILE,
        index=False,
        encoding="utf-8-sig"
    )

    print()
    print("완료!")
    print(
        f"원본 응답 {len(result)}건을 "
        f"{OUTPUT_FILE}에 저장했습니다."
    )


if __name__ == "__main__":
    main()