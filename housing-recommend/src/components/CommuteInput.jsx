import React, { useState } from 'react';
import {
  Calendar,
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Train,
  Clock,
  Compass
} from 'lucide-react';

export default function CommuteInput({
  selectedSchool,
  commuteCount = 4,
  onChangeCommuteCount,
  onNext,
  onPrev
}) {
  const [count, setCount] = useState(commuteCount || 4);

  // 1~5 통학 빈도별 맞춤 피드백 및 자취방 추천 팁
  const tipsByCount = {
    1: {
      badge: '여유로운 꿀통학러',
      title: '주 1회 통학',
      desc: '학교 갈 일이 적으니, 조금 멀더라도 월세가 저렴하고 넓은 쾌적한 방을 노려보세요!',
      weightTip: '가성비·넓은 평수 우선 추천',
      emoji: '🍯'
    },
    2: {
      badge: '스마트 통학러',
      title: '주 2회 통학',
      desc: '일주일에 이틀만 이동하므로 주변 상권이나 주거 편의시설이 좋은 곳이 유리해요.',
      weightTip: '주변 인프라·생활권 우선 추천',
      emoji: '✨'
    },
    3: {
      badge: '황금 밸런스러',
      title: '주 3회 통학',
      desc: '통학 시간과 월세의 균형이 중요한 구간! 40분 안팎의 교통 요충지를 추천해요.',
      weightTip: '거리와 월세 균형 추천',
      emoji: '⚖️'
    },
    4: {
      badge: '표준 대학생 라이프',
      title: '주 4회 통학',
      desc: '대부분의 대학생이 선택하는 빈도! 환승 피로도가 적은 30~40분대 직통 라인이 좋아요.',
      weightTip: '환승 최소화 노선 추천',
      emoji: '🎒'
    },
    5: {
      badge: '성실한 풀출석러',
      title: '주 5회 평일 매일',
      desc: '매일 등교해야 하므로 통학 피로 누적을 막을 30분 이내 근거리 지역을 추천해요.',
      weightTip: '30분 이내 직통 라인 집중 추천',
      emoji: '🏃'
    }
  };

  const handleSelectCount = (val) => {
    setCount(val);
    onChangeCommuteCount?.(val);
  };

  const handleDecrease = () => {
    if (count > 1) {
      handleSelectCount(count - 1);
    }
  };

  const handleIncrease = () => {
    if (count < 5) {
      handleSelectCount(count + 1);
    }
  };

  const currentTip = tipsByCount[count] || tipsByCount[4];

  return (
    <section className="school-selector-section commute-section">
      <div className="top-nav-bar">
        <button type="button" className="prev-step-back-btn" onClick={onPrev}>
          <ArrowLeft size={16} />
          <span>학교 다시 선택</span>
        </button>

        {selectedSchool && (
          <div className="current-school-pill">
            <span
              className="school-color-dot"
              style={{ backgroundColor: selectedSchool.themeColor }}
            />
            <span className="school-pill-name">{selectedSchool.name}</span>
          </div>
        )}
      </div>

      <div className="selector-header">
        <div className="step-tag">STEP 02</div>

        <h1 className="main-title">
          일주일에 <span className="highlight">몇 번</span> 학교에 가시나요?
        </h1>

        <p className="sub-title">
          통학 횟수에 따라 이동 피로도와 월세의 최적 밸런스를 계산합니다.
        </p>
      </div>

      <div className="commute-counter-card">
        <div className="counter-stepper-row">
          <button
            type="button"
            className={`counter-ctrl-btn ${count <= 1 ? 'disabled' : ''}`}
            onClick={handleDecrease}
            disabled={count <= 1}
            aria-label="통학 횟수 1 감소"
          >
            <Minus size={22} />
          </button>

          <div className="counter-display">
            <span className="counter-number">{count}</span>
            <span className="counter-unit">회 / 주</span>
          </div>

          <button
            type="button"
            className={`counter-ctrl-btn ${count >= 5 ? 'disabled' : ''}`}
            onClick={handleIncrease}
            disabled={count >= 5}
            aria-label="통학 횟수 1 증가"
          >
            <Plus size={22} />
          </button>
        </div>

        {/* 1~5 퀵 선택 버튼 */}
        <div className="count-chips-grid">
          {[1, 2, 3, 4, 5].map((num) => {
            const isSelected = count === num;

            return (
              <button
                key={num}
                type="button"
                className={`count-chip-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectCount(num)}
              >
                <span className="chip-day-label">
                  {`주 ${num}회`}
                </span>

                <span className="chip-number">{num}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="commute-tip-card">
        <div className="tip-header-row">
          <div className="tip-badge-wrap">
            <span className="tip-emoji">{currentTip.emoji}</span>
            <span className="tip-badge-text">{currentTip.badge}</span>
          </div>

          <span className="tip-tag-indicator">
            <Sparkles size={13} className="sparkle-icon" />
            {currentTip.weightTip}
          </span>
        </div>

        <h4 className="tip-title">
          {currentTip.title}의 추천 전략
        </h4>

        <p className="tip-description">
          {currentTip.desc}
        </p>
      </div>

      <div className="bottom-action-container">
        <div className="bottom-action-inner">
          <div className="selection-summary">
            <div className="summary-selected">
              <span className="summary-label">현재 설정</span>

              <span className="summary-value">
                <strong>
                  {selectedSchool?.shortName || '목표 대학교'}
                </strong>
                {' · '}주 <strong>{count}회</strong> 통학
              </span>
            </div>
          </div>

          <button
            type="button"
            className="next-step-button active"
            onClick={() => onNext(count)}
          >
            <span>다음 (교통 설정)</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}