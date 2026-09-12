import pandas as pd
from math import radians, sin, cos, sqrt, atan2


UNIVERSITY_FILE = "data/universities.csv"
REGION_FILE = "data/regions.csv"
OUTPUT_FILE = "data/candidates.csv"

TOP_N = 15


def haversine(lat1, lon1, lat2, lon2):
    """
    두 좌표 사이의 직선거리(km)를 계산
    """
    R = 6371

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1))
        * cos(radians(lat2))
        * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(
        sqrt(a),
        sqrt(1 - a)
    )

    return R * c


def main():
    universities = pd.read_csv(UNIVERSITY_FILE)
    regions = pd.read_csv(REGION_FILE)

    candidates = []

    for _, university in universities.iterrows():

        university_name = university["university"]
        university_lat = university["latitude"]
        university_lon = university["longitude"]

        print(f"{university_name} 후보 지역 계산 중...")

        temp = regions.copy()

        temp["distance_km"] = temp.apply(
            lambda row: haversine(
                university_lat,
                university_lon,
                row["latitude"],
                row["longitude"]
            ),
            axis=1
        )

        # 가까운 동네 TOP_N개 선택
        nearest = (
            temp
            .sort_values("distance_km")
            .head(TOP_N)
        )

        for _, region in nearest.iterrows():
            candidates.append({
                "university": university_name,
                "region": region["region"],
                "gu": region["gu"],
                "region_latitude": region["latitude"],
                "region_longitude": region["longitude"],
                "university_latitude": university_lat,
                "university_longitude": university_lon,
                "distance_km": round(
                    region["distance_km"],
                    2
                )
            })

    result = pd.DataFrame(candidates)

    result.to_csv(
        OUTPUT_FILE,
        index=False,
        encoding="utf-8-sig"
    )

    print()
    print("완료!")
    print(
        f"{len(result)}개의 대학-동네 조합을 "
        f"{OUTPUT_FILE}에 저장했습니다."
    )


if __name__ == "__main__":
    main()