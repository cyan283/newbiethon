import pandas as pd


# =====================================================
# 1순위 / 2순위 / 3순위 중요도
# =====================================================

RANK_WEIGHTS = {
    1: 0.5,
    2: 0.3,
    3: 0.2,
}


# =====================================================
# 등교일수에 따른 통학 중요도
# =====================================================

SCHOOL_DAY_FACTOR = {
    1: 0.6,
    2: 0.8,
    3: 1.0,
    4: 1.2,
    5: 1.4,
}


# =====================================================
# 값이 작을수록 높은 점수를 주는 함수
# =====================================================

def inverse_score(series):

    min_value = series.min()
    max_value = series.max()

    if min_value == max_value:
        return pd.Series(
            [100] * len(series),
            index=series.index
        )

    return (
        100
        * (max_value - series)
        / (max_value - min_value)
    )


# =====================================================
# 우선순위 → 실제 가중치 변환
# =====================================================

def get_ranked_weights(
    priority_ranking,
    school_days
):

    weights = {
        "rent": 0,
        "commute": 0,
        "mobility": 0,
        "transport": 0,
    }

    for rank, priority in enumerate(
        priority_ranking,
        start=1
    ):

        rank_weight = RANK_WEIGHTS[rank]

        # 돈
        if priority == "money":

            # 돈 항목 중
            # 월세 60% / 교통비 40%
            weights["rent"] += (
                rank_weight * 0.6
            )

            weights["transport"] += (
                rank_weight * 0.4
            )

        # 시간
        elif priority == "time":

            weights["commute"] += (
                rank_weight
            )

        # 걷기 최소화
        elif priority == "walking":

            weights["mobility"] += (
                rank_weight
            )

    # 등교일수 반영
    factor = SCHOOL_DAY_FACTOR[school_days]

    weights["commute"] *= factor
    weights["transport"] *= factor

    # 합계가 1이 되도록 다시 조정
    total = sum(weights.values())

    for key in weights:
        weights[key] /= total

    return weights


# =====================================================
# 모두의카드 적용
# =====================================================

def calculate_modu_card_cost(
    monthly_cost,
    monthly_rides
):

    # 월 15회 미만이면 환급 적용 안 함
    if monthly_rides < 15:
        return monthly_cost

    # 청년 기준 정률 환급
    # 30% 환급 → 실제 부담 70%
    percentage_cost = (
        monthly_cost * 0.70
    )

    # 서울 버스 / 지하철 이용을 전제로 한
    # 청년 일반형 기본 기준
    fixed_limit = 55000

    fixed_cost = min(
        monthly_cost,
        fixed_limit
    )

    # 정률 / 정액 중 더 유리한 금액
    return min(
        percentage_cost,
        fixed_cost
    )


# =====================================================
# 최종 추천 점수 계산
# =====================================================

def calculate_scores(
    df,
    school_days,
    priority_ranking,
    transfer_preference,
    use_modu_card
):

    result = df.copy()

    # ---------------------------------------------
    # 통학 정보나 월세 정보 없는 후보 제거
    # ---------------------------------------------

    result = result.dropna(
        subset=[
            "median_rent",
            "commute_time",
            "transfers",
            "walking_time",
            "transport_cost",
        ]
    ).copy()

    # ---------------------------------------------
    # 월 통학 횟수
    # ---------------------------------------------

    monthly_rides = (
        school_days
        * 2
        * 4.345
    )

    # ---------------------------------------------
    # 주간 통학시간
    # 편도 통학시간 × 왕복 × 등교일수
    # ---------------------------------------------

    result["weekly_commute_time"] = (
        result["commute_time"]
        * 2
        * school_days
    )

    # ---------------------------------------------
    # 할인 전 월 교통비
    # ---------------------------------------------

    result["original_monthly_transport_cost"] = (
        result["transport_cost"]
        * monthly_rides
    )

    # ---------------------------------------------
    # 모두의카드 사용 여부
    # ---------------------------------------------

    if use_modu_card:

        result["monthly_transport_cost"] = (
            result[
                "original_monthly_transport_cost"
            ].apply(
                lambda cost:
                calculate_modu_card_cost(
                    cost,
                    monthly_rides
                )
            )
        )

    else:

        result["monthly_transport_cost"] = (
            result[
                "original_monthly_transport_cost"
            ]
        )

    # ---------------------------------------------
    # 각각 0~100점으로 변환
    # ---------------------------------------------

    result["rent_score"] = inverse_score(
        result["median_rent"]
    )

    result["commute_score"] = inverse_score(
        result["weekly_commute_time"]
    )

    result["transport_score"] = inverse_score(
        result["monthly_transport_cost"]
    )

    transfer_score = inverse_score(
        result["transfers"]
    )

    walking_score = inverse_score(
        result["walking_time"]
    )

    # ---------------------------------------------
    # 이동 편의성 점수
    # 환승 60% + 도보 40%
    # ---------------------------------------------

    result["mobility_score"] = (
        transfer_score * 0.6
        + walking_score * 0.4
    )

    # ---------------------------------------------
    # 사용자 맞춤 가중치
    # ---------------------------------------------

    weights = get_ranked_weights(
        priority_ranking,
        school_days
    )

    # ---------------------------------------------
    # 기본 추천 점수
    # ---------------------------------------------

    result["final_score"] = (

        result["rent_score"]
        * weights["rent"]

        + result["commute_score"]
        * weights["commute"]

        + result["mobility_score"]
        * weights["mobility"]

        + result["transport_score"]
        * weights["transport"]
    )

    # ---------------------------------------------
    # 환승 선호도 추가 패널티
    # ---------------------------------------------

    if transfer_preference == "none":

        penalty = 0

    elif transfer_preference == "one_ok":

        # 1회까지는 괜찮음
        # 그 이후 한 번당 -4
        penalty = (
            (result["transfers"] - 1)
            .clip(lower=0)
            * 4
        )

    elif transfer_preference == "hate":

        # 환승 한 번당 -5
        penalty = (
            result["transfers"]
            * 5
        )

    else:

        penalty = 0

    result["final_score"] -= penalty

    # 0~100 범위
    result["final_score"] = (
        result["final_score"]
        .clip(0, 100)
    )

    # ---------------------------------------------
    # 높은 점수 순으로 정렬
    # ---------------------------------------------

    result = result.sort_values(
        by="final_score",
        ascending=False
    )

    return result, weights