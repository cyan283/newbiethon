import os
import time

import pandas as pd
import requests


KAKAO_REST_API_KEY = os.getenv("KAKAO_REST_API_KEY")

INPUT_FILE = "data/regions.csv"
OUTPUT_FILE = "data/regions.csv"


def geocode_region(gu, region):
    url = "https://dapi.kakao.com/v2/local/search/address.json"

    headers = {
        "Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"
    }

    query = f"서울특별시 {gu} {region}"

    params = {
        "query": query
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

    longitude = float(result["x"])
    latitude = float(result["y"])

    return latitude, longitude


def main():
    if not KAKAO_REST_API_KEY:
        raise ValueError(
            "KAKAO_REST_API_KEY 환경변수가 설정되지 않았습니다."
        )

    df = pd.read_csv(INPUT_FILE)

    print(f"총 {len(df)}개 지역 좌표 변환 시작")

    success_count = 0
    fail_count = 0

    for index, row in df.iterrows():
        region = row["region"]
        gu = row["gu"]

        # 이미 좌표가 있으면 건너뜀
        if (
            pd.notna(row["latitude"])
            and pd.notna(row["longitude"])
        ):
            continue

        print(
            f"[{index + 1}/{len(df)}] "
            f"{gu} {region} 검색 중..."
        )

        try:
            latitude, longitude = geocode_region(
                gu,
                region
            )

            if latitude is None:
                print("  실패: 좌표를 찾지 못함")
                fail_count += 1
                continue

            df.at[index, "latitude"] = latitude
            df.at[index, "longitude"] = longitude

            print(
                f"  성공: {latitude}, {longitude}"
            )

            success_count += 1

        except Exception as error:
            print(f"  오류: {error}")
            fail_count += 1

        # API에 너무 빠르게 요청하지 않도록 잠깐 대기
        time.sleep(0.1)

    df.to_csv(
        OUTPUT_FILE,
        index=False,
        encoding="utf-8-sig"
    )

    print()
    print("좌표 변환 완료")
    print(f"성공: {success_count}")
    print(f"실패: {fail_count}")
    print(f"저장 위치: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()