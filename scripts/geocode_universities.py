import os
import pandas as pd
import requests


# =====================================================
# 카카오 REST API 키
# =====================================================

KAKAO_REST_API_KEY = os.getenv("KAKAO_REST_API_KEY")


# =====================================================
# 주소를 위도/경도로 변환하는 함수
# =====================================================

def geocode_address(address):
    url = "https://dapi.kakao.com/v2/local/search/address.json"

    headers = {
        "Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"
    }

    params = {
        "query": address
    }

    response = requests.get(
        url,
        headers=headers,
        params=params,
        timeout=10
    )

    response.raise_for_status()

    data = response.json()

    documents = data.get("documents", [])

    if not documents:
        return None, None

    result = documents[0]

    # 카카오 API:
    # x = 경도
    # y = 위도
    longitude = float(result["x"])
    latitude = float(result["y"])

    return latitude, longitude


# =====================================================
# 대학 CSV 읽기
# =====================================================

def main():

    if not KAKAO_REST_API_KEY:
        raise ValueError(
            "KAKAO_REST_API_KEY 환경변수가 설정되지 않았습니다."
        )

    file_path = "data/universities.csv"

    df = pd.read_csv(file_path)

    # 대학 하나씩 주소 변환
    for index, row in df.iterrows():

        university = row["university"]
        address = row["address"]

        print(f"{university} 좌표 검색 중...")

        try:

            latitude, longitude = geocode_address(
                address
            )

            if latitude is None:

                print(
                    f"  실패: 주소를 찾지 못했습니다. "
                    f"({address})"
                )

                continue

            df.at[index, "latitude"] = latitude
            df.at[index, "longitude"] = longitude

            print(
                f"  성공: {latitude}, {longitude}"
            )

        except Exception as error:

            print(
                f"  오류: {university} - {error}"
            )


    # =================================================
    # 결과 저장
    # =================================================

    df.to_csv(
        file_path,
        index=False,
        encoding="utf-8-sig"
    )

    print()
    print("완료!")
    print(
        "data/universities.csv에 "
        "좌표가 저장되었습니다."
    )


if __name__ == "__main__":
    main()