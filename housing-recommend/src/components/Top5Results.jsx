import React, { useMemo } from 'react';
import {
  Trophy,
  ArrowLeft,
  Home,
  Train,
  CreditCard,
  ChevronRight
} from 'lucide-react';

export default function Top5Results({
  selectedSchool,
  recommendationResult,
  onSelectDetail,
  onRestart
}) {

  // =====================================================
  // 백엔드 추천 결과 → 화면에서 사용하기 좋은 형태로 변환
  // =====================================================

  const top5List = useMemo(() => {

    // 아직 결과가 없으면 빈 배열
    if (!recommendationResult?.recommendations) {
      return [];
    }

    return recommendationResult.recommendations.map(
      (item, index) => ({
        // 순위
        rank: index + 1,

        // 지역 이름
        name: item.region,

        // 구
        gu: item.gu,

        // 최종 점수
        totalScore: item.score,

        // -------------------------------------------------
        // 주거비
        // -------------------------------------------------
        housing: {
          score: item.scores?.rent ?? 0,
          monthlyRent:
            item.rent_text ??
            `${item.rent}만원`,

          deposit:
            item.deposit_text ??
            (
              item.deposit !== null
                ? `${item.deposit}만원`
                : '정보 없음'
            ),

          transactionCount:
            item.transaction_count
        },

        // -------------------------------------------------
        // 통학 효율
        // -------------------------------------------------
        commuteEfficiency: {
          score: item.scores?.commute ?? 0,

          time:
            `${item.commute_time}분`,

          transferCount:
            `${item.transfers}번`,

          walkingTime:
            `${item.walking_time}분`,

          mobilityScore:
            item.scores?.mobility ?? 0
        },

        // -------------------------------------------------
        // 교통비
        // -------------------------------------------------
        transitCost: {
          score: item.scores?.transport ?? 0,

          monthlyCost:
            item.monthly_transport_cost !== undefined
              ? `월 ${Number(
                  item.monthly_transport_cost
                ).toLocaleString()}원`
              : '정보 없음',

          originalMonthlyCost:
            item.original_monthly_transport_cost,

          oneWayCost:
            item.one_way_transport_cost
        },

        // 상세 페이지에서 사용할 수 있도록
        // 백엔드 원본 데이터도 보관
        raw: item
      })
    );

  }, [recommendationResult]);


  // =====================================================
  // 결과 없음
  // =====================================================

  if (top5List.length === 0) {
    return (
      <section className="school-selector-section results-section">

        <div className="top-nav-bar">
          <button
            type="button"
            className="prev-step-back-btn"
            onClick={onRestart}
          >
            <ArrowLeft size={16} />
            <span>처음부터 다시하기</span>
          </button>
        </div>

        <div className="selector-header">

          <div
            className="step-tag"
            style={{
              background: '#fef2f2',
              color: '#dc2626'
            }}
          >
            RESULT ERROR
          </div>

          <h1 className="main-title">
            추천 결과를 불러오지 못했습니다.
          </h1>

          <p className="sub-title">
            조건을 다시 선택한 후 추천을 실행해주세요.
          </p>

        </div>

      </section>
    );
  }


  return (
    <section className="school-selector-section results-section">

      {/* =================================================
          상단 네비게이션
      ================================================= */}

      <div className="top-nav-bar">

        <button
          type="button"
          className="prev-step-back-btn"
          onClick={onRestart}
        >
          <ArrowLeft size={16} />
          <span>처음부터 다시하기</span>
        </button>


        {selectedSchool && (

          <div className="current-school-pill">

            <span
              className="school-color-dot"
              style={{
                backgroundColor:
                  selectedSchool.themeColor
              }}
            />

            <span className="school-pill-name">
              {selectedSchool.name}
            </span>

          </div>

        )}

      </div>


      {/* =================================================
          헤더
      ================================================= */}

      <div className="selector-header">

        <div
          className="step-tag"
          style={{
            background: '#ecfdf5',
            color: '#059669'
          }}
        >
          TOP 5 RECOMMENDATION
        </div>


        <h1 className="main-title">

          <span className="highlight">
            {selectedSchool?.name}
          </span>

          {' '}학생을 위한
          <br />

          추천결과 TOP 5

        </h1>


        <p className="sub-title">
          실제 주거비, 통학시간, 이동편의성,
          교통비 데이터를 분석한 추천 결과입니다.
        </p>

      </div>


      {/* =================================================
          TOP 5 카드
      ================================================= */}

      <div className="top5-cards-container">

        {top5List.map((item) => {

          const isTop1 = item.rank === 1;

          return (

            <div
              key={`${item.name}-${item.rank}`}
              className={
                `result-item-card ${
                  isTop1
                    ? 'top1-highlight-card'
                    : ''
                }`
              }
            >

              {/* =========================================
                  카드 헤더
              ========================================= */}

              <div className="result-card-header">

                <div className="result-rank-title-group">

                  <span
                    className={
                      `top-rank-badge ${
                        isTop1
                          ? 'badge-top1'
                          : ''
                      }`
                    }
                  >

                    {isTop1 && (
                      <Trophy
                        size={14}
                        className="trophy-icon"
                      />
                    )}

                    Top {item.rank}

                  </span>


                  <h2 className="result-region-name">

                    {item.gu
                      ? `${item.gu} ${item.name}`
                      : item.name}

                  </h2>

                </div>


                <div className="result-score-box">

                  <span className="score-caption">
                    총점수
                  </span>

                  <span className="score-number">
                    {item.totalScore}
                  </span>

                  <span className="score-unit">
                    점
                  </span>

                </div>

              </div>


              {/* =========================================
                  분석 내용
              ========================================= */}

              <div className="result-analysis-body">


                {/* =======================================
                    1. 주거비
                ======================================= */}

                <div className="analysis-sub-block">

                  <div className="sub-block-title-row">

                    <div className="sub-title-left">

                      <Home
                        size={15}
                        className="sub-block-icon housing-icon"
                      />

                      <span className="sub-block-heading">
                        1. 주거비
                      </span>

                    </div>


                    <span className="sub-block-score">
                      {item.housing.score}점
                    </span>

                  </div>


                  <ul className="sub-block-details-list">

                    <li>

                      <span className="bullet">
                        -
                      </span>

                      <span className="detail-key">
                        지역 평균 월세
                      </span>

                      <span className="detail-value">
                        {item.housing.monthlyRent}
                      </span>

                    </li>


                    <li>

                      <span className="bullet">
                        -
                      </span>

                      <span className="detail-key">
                        평균 보증금
                      </span>

                      <span className="detail-value">
                        {item.housing.deposit}
                      </span>

                    </li>

                  </ul>

                </div>


                {/* =======================================
                    2. 통학 효율
                ======================================= */}

                <div className="analysis-sub-block">

                  <div className="sub-block-title-row">

                    <div className="sub-title-left">

                      <Train
                        size={15}
                        className="sub-block-icon commute-icon"
                      />

                      <span className="sub-block-heading">
                        2. 통학효율
                      </span>

                    </div>


                    <span className="sub-block-score">
                      {item.commuteEfficiency.score}점
                    </span>

                  </div>


                  <ul className="sub-block-details-list">

                    <li>

                      <span className="bullet">
                        -
                      </span>

                      <span className="detail-key">
                        통학 시간
                      </span>

                      <span className="detail-value">
                        {item.commuteEfficiency.time}
                      </span>

                    </li>


                    <li>

                      <span className="bullet">
                        -
                      </span>

                      <span className="detail-key">
                        환승 횟수
                      </span>

                      <span className="detail-value">
                        {
                          item.commuteEfficiency
                            .transferCount
                        }
                      </span>

                    </li>


                    <li>

                      <span className="bullet">
                        -
                      </span>

                      <span className="detail-key">
                        도보 시간
                      </span>

                      <span className="detail-value">
                        {
                          item.commuteEfficiency
                            .walkingTime
                        }
                      </span>

                    </li>

                  </ul>

                </div>


                {/* =======================================
                    3. 교통비
                ======================================= */}

                <div className="analysis-sub-block">

                  <div className="sub-block-title-row">

                    <div className="sub-title-left">

                      <CreditCard
                        size={15}
                        className="sub-block-icon cost-icon"
                      />

                      <span className="sub-block-heading">
                        3. 교통비
                      </span>

                    </div>


                    <span className="sub-block-score">
                      {item.transitCost.score}점
                    </span>

                  </div>


                  <ul className="sub-block-details-list">

                    <li>

                      <span className="bullet">
                        -
                      </span>

                      <span className="detail-key">
                        월 예상 교통비
                      </span>

                      <span className="detail-value">
                        {
                          item.transitCost
                            .monthlyCost
                        }
                      </span>

                    </li>

                  </ul>

                </div>

              </div>


              {/* =========================================
                  상세 지역 페이지 버튼
              ========================================= */}

              <div className="card-footer-action">

                <button
                  type="button"
                  className="view-detail-region-btn"

                  onClick={() =>
                    onSelectDetail?.(item)
                  }
                >

                  <span>
                    {item.name} 상세 지역 보기
                  </span>

                  <ChevronRight size={16} />

                </button>

              </div>

            </div>

          );

        })}

      </div>


      {/* =================================================
          하단
      ================================================= */}

      <div className="bottom-action-container">

        <div className="bottom-action-inner">

          <div className="selection-summary">

            <div className="summary-selected">

              <span className="summary-label">
                추천 완료
              </span>

              <span className="summary-value">

                <strong>
                  {selectedSchool?.name}
                </strong>

                {' '}맞춤 TOP 5

              </span>

            </div>

          </div>


          <button
            type="button"
            className="next-step-button active"
            onClick={onRestart}
          >
            <span>
              조건 변경 후 다시 추천
            </span>
          </button>

        </div>

      </div>

    </section>
  );
}