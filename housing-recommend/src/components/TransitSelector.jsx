import React, { useState } from 'react';
import {
  CreditCard,
  Train,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Shuffle,
  ShieldCheck,
  Percent
} from 'lucide-react';

export default function TransitSelector({
  selectedSchool,
  commuteCount = 4,
  transitCard = 'climate',
  transferLimit = 'one',
  onChangeTransitCard,
  onChangeTransferLimit,
  onNext,
  onPrev
}) {
  const [selectedCard, setSelectedCard] = useState(transitCard || 'climate');
  const [selectedTransfer, setSelectedTransfer] = useState(transferLimit || 'one');

  // 교통카드 옵션
  const transitCardOptions = [
    {
      id: 'climate',
      title: '기후동행카드',
      tag: '서울 무제한',
      tagColor: '#059669',
      tagBg: '#ecfdf5',
      desc: '서울 시내 지하철·버스를 월 6만원대로 무제한 이용',
      tip: '서울 시내권 우선 추천'
    },
    {
      id: 'kpass',
      title: 'K-pass (K패스)',
      tag: '20~30% 환급',
      tagColor: '#2563eb',
      tagBg: '#eff6ff',
      desc: '경기·광역버스 포함 전국 대중교통비 청년 30% 환급',
      tip: '경기/수도권 외곽까지 폭넓게 탐색'
    },
    {
      id: 'none',
      title: '혜택 없음 (일반)',
      tag: '기본 요금',
      tagColor: '#64748b',
      tagBg: '#f1f5f9',
      desc: '일반 신용/체크카드로 건당 대중교통 요금 지불',
      tip: '탑승 횟수당 순수 교통비 산정'
    }
  ];

  // 환승 횟수 옵션
  const transferOptions = [
    {
      id: 'direct',
      label: '환승 없음',
      subLabel: '직통 노선만',
      desc: '환승 스트레스 없이 한 번에 등교'
    },
    {
      id: 'one',
      label: '1번 이하',
      subLabel: '환승 최대 1회',
      desc: '가장 대중적인 통학 경로 허용'
    },
    {
      id: 'two',
      label: '2번 이하',
      subLabel: '환승 최대 2회',
      desc: '월세 저렴한 지역까지 후보군 확대'
    },
    {
      id: 'any',
      label: '상관없음',
      subLabel: '환승 횟수 무관',
      desc: '환승보다 다른 조건(월세/치안) 우선'
    }
  ];

  const handleCardSelect = (cardId) => {
    setSelectedCard(cardId);
    onChangeTransitCard?.(cardId);
  };

  const handleTransferSelect = (transferId) => {
    setSelectedTransfer(transferId);
    onChangeTransferLimit?.(transferId);
  };

  // 선택 결과 요약 텍스트
  const currentCardObj = transitCardOptions.find((c) => c.id === selectedCard);
  const currentTransferObj = transferOptions.find((t) => t.id === selectedTransfer);

  // 조합별 인사이트 메시지
  const getCombinationTip = () => {
    if (selectedCard === 'climate') {
      if (selectedTransfer === 'direct') {
        return '서울 시내 지하철 직통 라인 위주로, 추가 교통비 없이 쾌적하게 통학 가능한 역세권을 집중 추천합니다!';
      }
      return '서울 시내 대중교통 무제한 혜택을 100% 활용할 수 있는 서울 핵심 자취 지역을 탐색합니다.';
    }
    if (selectedCard === 'kpass') {
      return 'K-pass 환급 혜택을 고려해, 서울 진입이 빠른 수도권/외곽의 가성비 높은 넓은 방까지 추천 범위에 포함됩니다.';
    }
    return '건당 교통 요금을 고려하여, 통학 횟수에 따른 월 예상 교통비와 월세의 총합을 정밀하게 계산합니다.';
  };

  const isFormValid = selectedCard && selectedTransfer;

  const handleSubmit = () => {
    if (isFormValid) {
      onNext({
        transitCard: selectedCard,
        transferLimit: selectedTransfer
      });
    }
  };

  return (
    <section className="school-selector-section transit-section">
      {/* 상단 네비게이션 */}
      <div className="top-nav-bar">
        <button type="button" className="prev-step-back-btn" onClick={onPrev}>
          <ArrowLeft size={16} />
          <span>통학 횟수 다시 설정</span>
        </button>
        {selectedSchool && (
          <div className="current-school-pill">
            <span
              className="school-color-dot"
              style={{ backgroundColor: selectedSchool.themeColor }}
            />
            <span className="school-pill-name">
              {selectedSchool.name} · 주 {commuteCount}회
            </span>
          </div>
        )}
      </div>

      {/* 헤더 타이틀 */}
      <div className="selector-header">
        <div className="step-tag">STEP 03</div>
        <h1 className="main-title">
          <span className="highlight">교통카드</span>와 선호하는 <span className="highlight">환승 횟수</span>는?
        </h1>
        <p className="sub-title">
          교통비 지출 구조와 통학 피로도를 정확히 반영해 추천해 드립니다.
        </p>
      </div>

      {/* 질문 1: 사용하고 있는 교통카드 혜택 */}
      <div className="transit-question-group">
        <div className="question-title-row">
          <div className="question-icon-wrap">
            <CreditCard size={17} />
          </div>
          <h3 className="question-label">1. 사용 중인 교통카드 혜택</h3>
        </div>

        <div className="transit-cards-grid">
          {transitCardOptions.map((card) => {
            const isSelected = selectedCard === card.id;
            return (
              <div
                key={card.id}
                role="button"
                tabIndex={0}
                className={`transit-card-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleCardSelect(card.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardSelect(card.id);
                  }
                }}
              >
                {isSelected && (
                  <div className="check-badge-mini">
                    <CheckCircle2 size={18} />
                  </div>
                )}
                <div className="transit-card-head">
                  <span className="transit-card-title">{card.title}</span>
                  <span
                    className="transit-card-tag"
                    style={{ color: card.tagColor, backgroundColor: card.tagBg }}
                  >
                    {card.tag}
                  </span>
                </div>
                <p className="transit-card-desc">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 질문 2: 학교까지 환승 횟수 */}
      <div className="transit-question-group" style={{ marginTop: '24px' }}>
        <div className="question-title-row">
          <div className="question-icon-wrap">
            <Shuffle size={17} />
          </div>
          <h3 className="question-label">2. 학교까지 선호하는 환승 횟수</h3>
        </div>

        <div className="transfer-options-grid">
          {transferOptions.map((opt) => {
            const isSelected = selectedTransfer === opt.id;
            return (
              <div
                key={opt.id}
                role="button"
                tabIndex={0}
                className={`transfer-card-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleTransferSelect(opt.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTransferSelect(opt.id);
                  }
                }}
              >
                {isSelected && (
                  <div className="check-badge-mini">
                    <CheckCircle2 size={16} />
                  </div>
                )}
                <div className="transfer-card-label">{opt.label}</div>
                <div className="transfer-card-sub">{opt.subLabel}</div>
                <div className="transfer-card-desc">{opt.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 조합별 스마트 추천 가이드 카드 */}
      <div className="commute-tip-card" style={{ marginTop: '22px' }}>
        <div className="tip-header-row">
          <div className="tip-badge-wrap">
            <Sparkles size={16} className="sparkle-icon" color="#2563eb" />
            <span className="tip-badge-text" style={{ color: '#1d4ed8' }}>
              선택 조건 분석 가이드
            </span>
          </div>
          <span className="tip-tag-indicator">
            {currentCardObj?.title} × {currentTransferObj?.label}
          </span>
        </div>
        <p className="tip-description">{getCombinationTip()}</p>
      </div>

      {/* 하단 고정 액션 바 */}
      <div className="bottom-action-container">
        <div className="bottom-action-inner">
          <div className="selection-summary">
            <div className="summary-selected">
              <span className="summary-label">현재 교통 설정</span>
              <span className="summary-value">
                <strong>{currentCardObj?.title}</strong> · <strong>{currentTransferObj?.label}</strong>
              </span>
            </div>
          </div>

          <button
            type="button"
            className={`next-step-button ${isFormValid ? 'active' : 'disabled'}`}
            disabled={!isFormValid}
            onClick={handleSubmit}
          >
            <span>다음 (중요도 선택)</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
