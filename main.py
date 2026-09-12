from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd

from recommendation import calculate_scores


app = FastAPI(
    title="Student Housing Recommendation API"
)


# =====================================================
# 최종 데이터 불러오기
# =====================================================

df = pd.read_csv(
    "data/final_regions.csv"
)


# =====================================================
# 요청 데이터 형식
# =====================================================

class RecommendationRequest(BaseModel):

    # 학교 이름
    university: str

    # 주 1~5일
    school_days: int

    # 예:
    # ["money", "time", "walking"]
    priority_ranking: list[str]

    # none / one_ok / hate
    transfer_preference: str

    # 모두의카드 사용 여부
    use_modu_card: bool


# =====================================================
# 서버 확인용
# =====================================================

@app.get("/")
def root():
    return {
        "message": "Student Housing Recommendation API"
    }


# =====================================================
# 대학 목록 조회
# =====================================================

@app.get("/universities")
def get_universities():

    universities = (
        df["university"]
        .dropna()
        .unique()
        .tolist()
    )

    return {
        "universities": universities
    }


# =====================================================
# 추천 API
# =====================================================

@app.post("/recommend")
def recommend(
    request: RecommendationRequest
):

    # -------------------------------------------------
    # 1. 등교일수 검사
    # -------------------------------------------------

    if request.school_days < 1 or request.school_days > 5:

        raise HTTPException(
            status_code=400,
            detail="school_days는 1~5 사이여야 합니다."
        )


    # -------------------------------------------------
    # 2. 우선순위 검사
    # -------------------------------------------------

    valid_priorities = {
        "money",
        "time",
        "walking"
    }

    if len(request.priority_ranking) != 3:

        raise HTTPException(
            status_code=400,
            detail="우선순위는 3개를 모두 지정해야 합니다."
        )


    if len(set(request.priority_ranking)) != 3:

        raise HTTPException(
            status_code=400,
            detail="우선순위는 중복될 수 없습니다."
        )


    if set(request.priority_ranking) != valid_priorities:

        raise HTTPException(
            status_code=400,
            detail=(
                "priority_ranking은 "
                "money, time, walking "
                "세 항목으로 구성되어야 합니다."
            )
        )


    # -------------------------------------------------
    # 3. 환승 선호도 검사
    # -------------------------------------------------

    valid_transfer_preferences = {
        "none",
        "one_ok",
        "hate"
    }

    if (
        request.transfer_preference
        not in valid_transfer_preferences
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "transfer_preference는 "
                "none, one_ok, hate 중 하나여야 합니다."
            )
        )


    # -------------------------------------------------
    # 4. 대학 존재 여부 확인
    # -------------------------------------------------

    university_df = df[
        df["university"] == request.university
    ].copy()

    if university_df.empty:

        raise HTTPException(
            status_code=404,
            detail="해당 대학교의 후보 지역 데이터가 없습니다."
        )


    # -------------------------------------------------
    # 5. 추천 계산
    # -------------------------------------------------

    result, weights = calculate_scores(

        df=university_df,

        school_days=request.school_days,

        priority_ranking=(
            request.priority_ranking
        ),

        transfer_preference=(
            request.transfer_preference
        ),

        use_modu_card=(
            request.use_modu_card
        )
    )


    if result.empty:

        raise HTTPException(
            status_code=404,
            detail="추천 가능한 지역 데이터가 없습니다."
        )


    # -------------------------------------------------
    # 6. 상위 5개 추천
    # -------------------------------------------------

    recommendations = []

    for _, row in result.head(5).iterrows():

        rent = int(row["median_rent"])

        recommendations.append({

            "region":
                row["region"],

            "gu":
                row["gu"],

            "score":
                round(
                    float(row["final_score"]),
                    1
                ),

            # 계산용 숫자
            "rent":
                rent,

            # 표시용 문자열
            "rent_text":
                f"{rent}만원",

            "deposit":
                (
                    int(row["median_deposit"])
                    if pd.notna(row["median_deposit"])
                    else None
                ),

            "deposit_text":
                (
                    f"{int(row['median_deposit'])}만원"
                    if pd.notna(row["median_deposit"])
                    else None
                ),

            "transaction_count":
                int(row["transaction_count"]),

            "commute_time":
                int(row["commute_time"]),

            "transfers":
                int(row["transfers"]),

            "walking_time":
                int(row["walking_time"]),

            "one_way_transport_cost":
                int(row["transport_cost"]),

            "original_monthly_transport_cost":
                round(
                    float(
                        row[
                            "original_monthly_transport_cost"
                        ]
                    )
                ),

            "monthly_transport_cost":
                round(
                    float(
                        row[
                            "monthly_transport_cost"
                        ]
                    )
                ),

            "scores": {

                "rent":
                    round(
                        float(row["rent_score"]),
                        1
                    ),

                "commute":
                    round(
                        float(row["commute_score"]),
                        1
                    ),

                "mobility":
                    round(
                        float(row["mobility_score"]),
                        1
                    ),

                "transport":
                    round(
                        float(row["transport_score"]),
                        1
                    )
            }
        })


    # -------------------------------------------------
    # 7. 결과 반환
    # -------------------------------------------------

    return {

        "university":
            request.university,

        "school_days":
            request.school_days,

        "priority_ranking":
            request.priority_ranking,

        "transfer_preference":
            request.transfer_preference,

        "use_modu_card":
            request.use_modu_card,

        "applied_weights": {

            "rent":
                round(
                    weights["rent"],
                    3
                ),

            "commute":
                round(
                    weights["commute"],
                    3
                ),

            "mobility":
                round(
                    weights["mobility"],
                    3
                ),

            "transport":
                round(
                    weights["transport"],
                    3
                )
        },

        "recommendations":
            recommendations
    }