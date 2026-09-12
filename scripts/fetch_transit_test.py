import os
import pandas as pd
import requests
import json


KAKAO_REST_API_KEY = os.getenv("KAKAO_REST_API_KEY")

CANDIDATE_FILE = "data/candidates.csv"


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


def main():
    if not KAKAO_REST_API_KEY:
        raise ValueError(
            "KAKAO_REST_API_KEY 환경변수가 설정되지 않았습니다."
        )

    df = pd.read_csv(CANDIDATE_FILE)

    # 일단 첫 번째 후보 1개만 테스트
    row = df.iloc[0]

    university = row["university"]
    region = row["region"]

    print(
        f"{region} → {university} "
        "대중교통 경로 검색 중..."
    )

    data = get_transit_route(
        start_lon=row["region_longitude"],
        start_lat=row["region_latitude"],
        end_lon=row["university_longitude"],
        end_lat=row["university_latitude"]
    )

    

    print(
        json.dumps(
            data,
            ensure_ascii=False,
            indent=2
        )
)
        



    status = data.get("status")

    print("API 상태:", status)

    if status != "OK":
        print("경로 검색 실패")
        print(data)
        return

    routes = data.get("routes", [])

    if not routes:
        print("검색된 경로가 없습니다.")
        return

    # 가장 첫 번째 추천 경로 사용
    route = routes[0]

    properties = route["properties"]

    # 초 → 분
    commute_time = round(
        properties["totalTime"] / 60
    )

    transfers = properties["transfers"]

    transport_cost = properties["fare"]["value"]

    # 도보 구간 시간 모두 더하기
    transit_seconds = 0

    for step in route["steps"]:
        step_properties = step["properties"]

        if step_properties["type"] in ["BUS", "SUBWAY"]:
            transit_seconds += step_properties["time"]

    walking_seconds = max(
        0,
        properties["totalTime"] - transit_seconds
    )

    walking_time = round(
        walking_seconds / 60
    )

    print()
    print("===== 결과 =====")
    print("대학교:", university)
    print("출발 동네:", region)
    print("통학시간:", commute_time, "분")
    print("환승:", transfers, "회")
    print("도보시간:", walking_time, "분")
    print("교통비:", transport_cost, "원")


if __name__ == "__main__":
    main()