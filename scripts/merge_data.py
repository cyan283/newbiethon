import pandas as pd


CANDIDATE_FILE = "data/candidates_with_transit.csv"
RENT_FILE = "data/rent_summary.csv"
OUTPUT_FILE = "data/final_regions.csv"


def main():
    candidates = pd.read_csv(CANDIDATE_FILE)
    rents = pd.read_csv(RENT_FILE)

    print("후보 데이터:", len(candidates))
    print("월세 데이터:", len(rents))

    # 통학 정보 없는 행 제거
    candidates = candidates.dropna(
        subset=[
            "commute_time",
            "transfers",
            "walking_time",
            "transport_cost"
        ]
    ).copy()

    print("통학 정보 있는 후보:", len(candidates))

    # 동 이름 기준으로 월세 데이터 합치기
    merged = candidates.merge(
        rents[
            [
                "region",
                "median_rent",
                "median_deposit",
                "transaction_count"
            ]
        ],
        on="region",
        how="left"
    )

    # 월세 데이터가 없는 동네 제거
    merged = merged.dropna(
        subset=["median_rent"]
    ).copy()

    print("월세 정보까지 있는 후보:", len(merged))

    merged.to_csv(
        OUTPUT_FILE,
        index=False,
        encoding="utf-8-sig"
    )

    print()
    print("완료!")
    print(
        f"{len(merged)}개 후보를 "
        f"{OUTPUT_FILE}에 저장했습니다."
    )


if __name__ == "__main__":
    main()