import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Calendar,
  CreditCard,
  Award,
  Sparkles,
  ArrowLeft,
  Search,
  CheckCircle2
} from 'lucide-react';

export default function AnalyzingLoading({
  selectedSchool,
  commuteCount = 4,
  transitCard = 'climate',
  transferLimit = 'one',
  priorities = ['cost', 'time', 'walk'],
  onComplete,
  onPrev
}) {
  const [progress, setProgress] = useState(15);
  const [currentStepText, setCurrentStepText] = useState('목표 대학교 주변 교통망 데이터 수집 중...');

  // 분석 시뮬레이션 단계 텍스트
  const analysisSteps = [
    { percent: 25, text: '서울·수도권 지하철 및 버스 노선 데이터 조회 중...' },
    { percent: 50, text: '통학 시간 및 선호 환승 횟수 기반 이동 경로 시뮬레이션 중...' },
    { percent: 75, text: '보증금·월세 및 평균 관리비 가성비 가중치 산출 중...' },
    { percent: 95, text: '1순위 우선순위를 반영한 최종 추천 점수 계산 중...' },
    { percent: 100, text: '사용자 맞춤 TOP 5 지역 추천 완료!' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const next = prev + 5;
        // 단계별 문구 업데이트
        const found = analysisSteps.find((s) => next <= s.percent);
        if (found) {
          setCurrentStepText(found.text);
        }
        return next;
      });
    }, 180);

    return () => clearInterval(timer);
  }, []);

  // 라벨 매핑 헬퍼
  const getTransitCardLabel = (card) => {
    switch (card) {
      case 'climate':
        return '기후동행카드 (서울 무제한)';
      case 'kpass':
        return 'K-pass (20~30% 환급)';
      case 'none':
      default:
        return '혜택 없음 (일반 요금)';
    }
  };

  const getTransferLimitLabel = (limit) => {
    switch (limit) {
      case 'direct':
        return '환승 없음 (직통)';
      case 'one':
        return '환승 1번 이하';
      case 'two':
        return '환승 2번 이하';
      case 'any':
      default:
        return '환승 상관없음';
    }
  };

  const priorityNames = {
    cost: '월 평균 지출 비용',
    time: '통학 시간',
    walk: '도보 최소화'
  };

  return (
    <section className="school-selector-section loading-section">
      {/* 상단 이전 수정 링크 */}
      <div className="top-nav-bar">
        <button type="button" className="prev-step-back-btn" onClick={onPrev}>
          <ArrowLeft size={16} />
          <span>설문 조건 다시 수정</span>
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

      {/* 로딩 애니메이션 영역 */}
      <div className="loading-hero-container">
        <div className="pulse-radar-ring">
          <div className="pulse-circle pulse-1" />
          <div className="pulse-circle pulse-2" />
          <div className="loading-icon-center">
            <Compass className="spinning-compass" size={36} />
          </div>
        </div>

        {/* 요구 문구 */}
        <h1 className="loading-main-title">
          사용자에게 맞는 <span className="highlight">지역을 찾고있습니다</span>
        </h1>
        <p className="loading-sub-text">
          {selectedSchool?.name || '학교'}까지의 통학 경로와 우선순위를 분석하고 있어요.
        </p>

        {/* 진행 게이지 바 */}
        <div className="analyzing-progress-bar-wrap">
          <div className="analyzing-progress-bar-track">
            <div
              className="analyzing-progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="analyzing-progress-meta">
            <span className="analysis-step-desc">
              <Sparkles size={13} className="sparkle-loading-icon" />
              {currentStepText}
            </span>
            <span className="analysis-percentage">{progress}%</span>
          </div>
        </div>
      </div>

      {/* 사용자 설문 결과 요약 카드 (요청하신 화면 스타일) */}
      <div className="survey-summary-card">
        <div className="survey-summary-header">
          <div className="summary-card-title-wrap">
            <span className="summary-card-icon">📋</span>
            <h3 className="summary-card-title">분석 대상 맞춤 프로필</h3>
          </div>
          <span className="ready-badge">ANALYSIS IN PROGRESS</span>
        </div>

        <div className="survey-profile-list">
          {/* 목표 대학교 */}
          <div className="profile-item-row">
            <div className="profile-label">
              <MapPin size={15} className="profile-icon" />
              <span>목표 대학교</span>
            </div>
            <div className="profile-value">
              <strong>{selectedSchool?.name || '미선택'}</strong>
              <span className="profile-sub-tag">({selectedSchool?.district || '서울'})</span>
            </div>
          </div>

          {/* 통학 횟수 */}
          <div className="profile-item-row">
            <div className="profile-label">
              <Calendar size={15} className="profile-icon" />
              <span>통학 횟수</span>
            </div>
            <div className="profile-value">
              주 <strong>{commuteCount}회</strong> 통학
            </div>
          </div>

          {/* 교통 혜택 & 환승 */}
          <div className="profile-item-row">
            <div className="profile-label">
              <CreditCard size={15} className="profile-icon" />
              <span>교통 혜택 & 환승</span>
            </div>
            <div className="profile-value">
              <strong>{getTransitCardLabel(transitCard)}</strong> · {getTransferLimitLabel(transferLimit)}
            </div>
          </div>

          {/* 우선순위 */}
          <div className="profile-item-row">
            <div className="profile-label">
              <Award size={15} className="profile-icon" />
              <span>우선순위</span>
            </div>
            <div className="profile-value priority-chain">
              <span className="rank-token rank-token-1">
                1위 <strong>{priorityNames[priorities[0]]}</strong>
              </span>
              <span className="chain-arrow">&gt;</span>
              <span className="rank-token rank-token-2">
                2위 {priorityNames[priorities[1]]}
              </span>
              <span className="chain-arrow">&gt;</span>
              <span className="rank-token rank-token-3">
                3위 {priorityNames[priorities[2]]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 고정 액션 바 또는 완료 시 바로가기 */}
      <div className="bottom-action-container">
        <div className="bottom-action-inner">
          <div className="selection-summary">
            <div className="summary-selected">
              <span className="summary-label">계산 상태</span>
              <span className="summary-value">
                {progress === 100 ? (
                  <strong style={{ color: '#059669' }}>✅ 분석 완료! 추천 결과를 확인해보세요</strong>
                ) : (
                  <span>지역별 점수 매칭 중... (<strong>{progress}%</strong>)</span>
                )}
              </span>
            </div>
          </div>

          <button
            type="button"
            className={`next-step-button ${progress === 100 ? 'active' : 'disabled'}`}
            disabled={progress < 100}
            onClick={() => onComplete?.()}
          >
            <span>{progress === 100 ? 'TOP 5 결과 보기' : '계산 중...'}</span>
            <CheckCircle2 size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
