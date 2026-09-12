import os
import time

import pandas as pd
import requests


KAKAO_REST_API_KEY = os.getenv("KAKAO_REST_API_KEY")

FILE_PATH = "data/candidates_with_transit.csv"


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


def parse_route(data):
    if data.get("status") != "OK":
        return None

    routes = data.get("routes", [])

    if not routes:
        return None

    route = routes[0]
    properties = route["properties"]

    commute_time = round(
        properties["totalTime"] / 60
    )

    transfers = properties["transfers"]
    transport_cost = properties["fare"]["value"]

    walking_seconds = 0

    for step in route["steps"]:
        step_properties = step["properties"]

        if step_properties["type"] == "WALKING":
            walking_seconds += step_properties["time"]

    walking_time = round(
        walking_seconds / 60
    )

    return {
        "commute_time": commute_time,
        "transfers": transfers,
        "walking_time": walking_time,
        "transport_cost": transport_cost,
    }


def main():
    if not KAKAO_REST_API_KEY:
        raise ValueError(
            "KAKAO_REST_API_KEY 환경변수가 설정되지 않았습니다."
        )

    df = pd.read_csv(FILE_PATH)

    retry_count = 0
    success_count = 0
    fail_count = 0

    for index, row in df.iterrows():

        # 이미 성공한 행이면 건너뜀
        if (
            pd.notna(row["commute_time"])
            and pd.notna(row["transfers"])
            and pd.notna(row["walking_time"])
            and pd.notna(row["transport_cost"])
        ):
            continue

        retry_count += 1

        university = row["university"]
        region = row["region"]

        print(
            f"[재시도 {retry_count}] "
            f"{region} → {university}"
        )

        success = False

        for attempt in range(3):

            try:
                data = get_transit_route(
                    start_lon=row["region_longitude"],
                    start_lat=row["region_latitude"],
                    end_lon=row["university_longitude"],
                    end_lat=row["university_latitude"],
                )

                result = parse_route(data)

                if result is None:
                    print("  경로 없음")
                    break

                df.at[index, "commute_time"] = (
                    result["commute_time"]
                )

                df.at[index, "transfers"] = (
                    result["transfers"]
                )

                df.at[index, "walking_time"] = (
                    result["walking_time"]
                )

                df.at[index, "transport_cost"] = (
                    result["transport_cost"]
                )

                print(
                    f"  성공: "
                    f"{result['commute_time']}분 / "
                    f"환승 {result['transfers']}회 / "
                    f"도보 {result['walking_time']}분 / "
                    f"{result['transport_cost']}원"
                )

                success = True
                success_count += 1
                break

            except Exception as error:
                print(
                    f"  오류 - 재시도 "
                    f"{attempt + 1}/3: {error}"
                )

                time.sleep(2)

        if not success:
            fail_count += 1

        # 중간 저장
        df.to_csv(
            FILE_PATH,
            index=False,
            encoding="utf-8-sig"
        )

        time.sleep(0.5)

    print()
    print("재시도 완료!")
    print(f"추가 성공: {success_count}")
    print(f"여전히 실패: {fail_count}")


if __name__ == "__main__":
    main()