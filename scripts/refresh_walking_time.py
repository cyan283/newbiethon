import os
import time

import pandas as pd
import requests


KAKAO_REST_API_KEY = os.getenv("KAKAO_REST_API_KEY")

FILE_PATH = "data/candidates_with_transit.csv"
print("현재 작업 폴더:", os.getcwd())
print("저장 파일 경로:", os.path.abspath(FILE_PATH))

def get_transit_route(
    start_lon,
    start_lat,
    end_lon,
    end_lat
):
    url = "https://dapi.kakao.com/v2/routing/publictraffic"

    headers = {
        "Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"
    }

    params = {
        "start_x": start_lon,
        "start_y": start_lat,
        "end_x": end_lon,
        "end_y": end_lat,
    }

    response = requests.get(
        url,
        headers=headers,
        params=params,
        timeout=20
    )

    response.raise_for_status()

    return response.json()


def calculate_walking_time(data):
    """
    총 소요시간 - 버스/지하철 탑승시간
    = 도보 및 대기 등 비탑승 시간 추정
    """

    if data.get("status") != "OK":
        return None

    routes = data.get("routes", [])

    if not routes:
        return None

    route = routes[0]

    properties = route["properties"]

    transit_seconds = 0

    for step in route["steps"]:
        step_properties = step["properties"]

        if step_properties["type"] in [
            "BUS",
            "SUBWAY"
        ]:
            transit_seconds += (
                step_properties["time"]
            )

    walking_seconds = max(
        0,
        properties["totalTime"]
        - transit_seconds
    )

    walking_time = round(
        walking_seconds / 60
    )

    return walking_time


def main():

    if not KAKAO_REST_API_KEY:
        raise ValueError(
            "KAKAO_REST_API_KEY 환경변수가 설정되지 않았습니다."
        )

    df = pd.read_csv(FILE_PATH)

    success_count = 0
    fail_count = 0
    skip_count = 0

    for index, row in df.iterrows():

        # 기존 통학 조회가 실패한 행은 건너뜀
        if (
            pd.isna(row["commute_time"])
            or pd.isna(row["transfers"])
            or pd.isna(row["transport_cost"])
        ):
            skip_count += 1
            continue

        university = row["university"]
        region = row["region"]

        print(
            f"[{index + 1}/{len(df)}] "
            f"{region} → {university}"
        )

        try:
            data = get_transit_route(
                start_lon=row[
                    "region_longitude"
                ],
                start_lat=row[
                    "region_latitude"
                ],
                end_lon=row[
                    "university_longitude"
                ],
                end_lat=row[
                    "university_latitude"
                ],
            )

            walking_time = (
                calculate_walking_time(data)
            )

            if walking_time is None:
                print("  실패: 경로 없음")
                fail_count += 1
                continue

            df.at[
                index,
                "walking_time"
            ] = walking_time

            print(
                f"  새 도보시간: "
                f"{walking_time}분"
            )

            success_count += 1

        except Exception as error:
            print(
                f"  오류: {error}"
            )
            fail_count += 1

        # 중간 저장
        df.to_csv(
            FILE_PATH,
            index=False,
            encoding="utf-8-sig"
        )

        time.sleep(0.2)

    print()
    print("도보시간 갱신 완료!")
    print(
        f"성공: {success_count}"
    )
    print(
        f"실패: {fail_count}"
    )
    print(
        f"기존 실패 행 건너뜀: {skip_count}"
    )


if __name__ == "__main__":
    main()