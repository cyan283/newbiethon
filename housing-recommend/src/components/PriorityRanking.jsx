import React, { useState } from 'react';
import {
  Wallet,
  Clock,
  Footprints,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  Check
} from 'lucide-react';

export default function PriorityRanking({
  selectedSchool,
  commuteCount = 4,
  priorities = ['cost', 'time', 'walk'],
  onNext,
  onPrev
}) {
  // 3개 조건 메타데이터
  const priorityItemsData = {
    cost: {
      id: 'cost',
      title: '월 평균 지출 비용',
      subTitle: '보증금 + 월세 + 교통비',
      desc: '주거비와 대중교통비의 총합을 아껴 통장 잔고를 지켜주는 가성비 지역',
      icon: Wallet,
      iconColor: '#059669',
      iconBg: '#ecfdf5',
      short: '지출 비용'
    },
    time: {
      id: 'time',
      title: '통학 시간',
      subTitle: '문 앞에서 강의실까지 소요 시간',
      desc: '환승 대기 및 이동 시간을 최소화하여 아침 수면 시간과 체력을 보장하는 지역',
      icon: Clock,
      iconColor: '#2563eb',
      iconBg: '#eff6ff',
      short: '통학 시간'
    },
    walk: {
      id: 'walk',
      title: '도보 최소화',
      subTitle: '집-역, 역-학교 걷는 거리',
      desc: '눈·비 오는 날에도 부담 없는 초역세권(도보 3~5분) 위주의 쾌적한 보행 환경',
      icon: Footprints,
      iconColor: '#d97706',
      iconBg: '#fef3c7',
      short: '도보 최소화'
    }
  };

  const allKeys = ['cost', 'time', 'walk'];

  // 터치 순서 배열 (예: ['cost', 'time'] -> 1순위: cost, 2순위: time)
  // 초기 상태: 빈 배열로 시작하여 사용자가 직접 터치하는 재미를 주거나, 이전 선택값이 유효하면 유지
  const [selectedOrder, setSelectedOrder] = useState(() => {
    if (priorities && priorities.length === 3) {
      return priorities;
    }
    return [];
  });

  // 카드 터치 핸들러
  const handleCardClick = (id) => {
    if (selectedOrder.includes(id)) {
      // 이미 선택된 카드를 다시 누르면: 해당 카드 및 그 이후 순위 해제 (자연스러운 재선택 유도)
      const clickedIndex = selectedOrder.indexOf(id);
      setSelectedOrder(selectedOrder.slice(0, clickedIndex));
    } else {
      // 새로운 카드 터치 시 순서대로 추가
      if (selectedOrder.length < 3) {
        setSelectedOrder([...selectedOrder, id]);
      }
    }
  };

  // 전체 리셋
  const handleReset = () => {
    setSelectedOrder([]);
  };

  // 1, 2, 3순위 라벨 스타일 정보
  const rankMeta = {
    1: { label: '1순위 (최우선)', badgeColor: '#2563eb', badgeBg: '#eff6ff', cardBorder: '#2563eb' },
    2: { label: '2순위 (보조)', badgeColor: '#475569', badgeBg: '#f1f5f9', cardBorder: '#94a3b8' },
    3: { label: '3순위 (참고)', badgeColor: '#64748b', badgeBg: '#f8fafc', cardBorder: '#cbd5e1' }
  };

  // 1순위 기반 맞춤 분석 팁
  const getTop1Tip = () => {
    const top1 = selectedOrder[0];
    if (top1 === 'cost') {
      return {
        title: '💰 알뜰 절약형 모드',
        desc: '환승이 1회 발생하더라도, 월 고정 주거비(월세+교통비)가 서울 평균 대비 10~15만원 이상 저렴한 꿀가성비 지역을 1순위로 추천합니다.'
      };
    }
    if (top1 === 'time') {
      return {
        title: '⚡ 통학 시간 단축 모드',
        desc: '비용보다 이동 피로도를 최소화하기 위해, 환승 없이 30분 안팎으로 주파할 수 있는 직통 역세권 라인을 1순위로 추천합니다.'
      };
    }
    if (top1 === 'walk') {
      return {
        title: '🚶 초역세권 도보 최소화 모드',
        desc: '언덕길이나 먼 보행 거리를 배제하고, 역 출구에서 도보 3~5분 이내 평지에 위치한 원룸 밀집 구역을 1순위로 추천합니다.'
      };
    }
    return null;
  };

  const isCompleted = selectedOrder.length === 3;
  const top1Tip = isCompleted ? getTop1Tip() : null;

  return (
    <section className="school-selector-section priority-section">
      {/* 상단 네비게이션 */}
      <div className="top-nav-bar">
        <button type="button" className="prev-step-back-btn" onClick={onPrev}>
          <ArrowLeft size={16} />
          <span>교통 조건 다시 설정</span>
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

      {/* 헤더 안내 */}
      <div className="selector-header">
        <div className="step-tag">STEP 04</div>
        <h1 className="main-title">
          <span className="highlight">터치하는 순서</span>대로<br />
          우선순위가 정해져요
        </h1>
        <p className="sub-title">
          가장 중요하다고 생각하는 순서대로 카드를 <strong>하나씩 탭</strong>해주세요. (1순위 ➔ 2순위 ➔ 3순위)
        </p>
      </div>

      {/* 상단 1, 2, 3순위 슬롯 인디케이터 바 */}
      <div className="priority-slots-bar">
        {[1, 2, 3].map((slotNum) => {
          const itemId = selectedOrder[slotNum - 1];
          const itemData = itemId ? priorityItemsData[itemId] : null;

          return (
            <div
              key={slotNum}
              className={`priority-slot-box ${itemData ? 'filled' : 'empty'} ${
                selectedOrder.length + 1 === slotNum ? 'next-target' : ''
              }`}
            >
              <div className="slot-rank-badge">{slotNum}순위</div>
              <div className="slot-content-text">
                {itemData ? (
                  <span className="slot-item-name">{itemData.short}</span>
                ) : (
                  <span className="slot-placeholder">
                    {selectedOrder.length + 1 === slotNum ? '👈 선택 대기' : '대기'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3개 조건 카드 리스트 */}
      <div className="touch-priority-cards-list">
        {allKeys.map((key) => {
          const item = priorityItemsData[key];
          const orderIndex = selectedOrder.indexOf(key);
          const isSelected = orderIndex !== -1;
          const rankNum = isSelected ? orderIndex + 1 : null;
          const meta = rankNum ? rankMeta[rankNum] : null;
          const IconComp = item.icon;

          return (
            <div
              key={key}
              role="button"
              tabIndex={0}
              className={`touch-priority-card ${isSelected ? 'selected' : ''} ${
                rankNum ? `rank-${rankNum}` : ''
              }`}
              onClick={() => handleCardClick(key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(key);
                }
              }}
            >
              {/* 좌측 순위 뱃지 (터치 순서에 따라 1, 2, 3 표시) */}
              <div
                className={`touch-rank-indicator ${isSelected ? 'active' : ''}`}
                style={
                  meta
                    ? { backgroundColor: meta.badgeColor, color: '#ffffff' }
                    : {}
                }
              >
                {isSelected ? (
                  <span className="rank-number-text">{rankNum}</span>
                ) : (
                  <span className="rank-empty-dot" />
                )}
              </div>

              {/* 카드 아이콘 */}
              <div
                className="priority-icon-box"
                style={{ backgroundColor: item.iconBg, color: item.iconColor }}
              >
                <IconComp size={22} />
              </div>

              {/* 텍스트 내용 */}
              <div className="priority-text-wrap">
                <div className="priority-title-row">
                  <h3 className="priority-title">{item.title}</h3>
                  {isSelected && (
                    <span
                      className="touch-rank-pill"
                      style={{
                        color: meta.badgeColor,
                        backgroundColor: meta.badgeBg
                      }}
                    >
                      {meta.label}
                    </span>
                  )}
                </div>
                <div className="priority-sub-pill-text">{item.subTitle}</div>
                <p className="priority-desc">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 선택 상태 안내 및 초기화 버튼 */}
      <div className="priority-help-row">
        <span className="help-caption">
          {isCompleted
            ? '✅ 1, 2, 3순위가 모두 지정되었습니다. 변경하려면 카드를 다시 누르세요.'
            : `선택 진행률: ${selectedOrder.length}/3 (카드를 터치하세요)`}
        </span>
        {selectedOrder.length > 0 && (
          <button type="button" className="ranking-reset-btn" onClick={handleReset}>
            <RotateCcw size={13} />
            <span>순위 다시 정하기</span>
          </button>
        )}
      </div>

      {/* 3개 모두 선택되었을 때 나타나는 실시간 맞춤 분석 팁 */}
      {isCompleted && top1Tip && (
        <div className="commute-tip-card" style={{ marginTop: '16px' }}>
          <div className="tip-header-row">
            <div className="tip-badge-wrap">
              <Sparkles size={16} className="sparkle-icon" color="#2563eb" />
              <span className="tip-badge-text" style={{ color: '#1d4ed8' }}>
                {top1Tip.title}
              </span>
            </div>
            <span className="tip-tag-indicator">1순위 가중치 60%</span>
          </div>
          <p className="tip-description">{top1Tip.desc}</p>
        </div>
      )}

      {/* 하단 고정 액션 바 */}
      <div className="bottom-action-container">
        <div className="bottom-action-inner">
          <div className="selection-summary">
            {isCompleted ? (
              <div className="summary-selected">
                <span className="summary-label">최종 우선순위</span>
                <span className="summary-value">
                  <strong>1위 {priorityItemsData[selectedOrder[0]].short}</strong> &gt;{' '}
                  2위 {priorityItemsData[selectedOrder[1]].short} &gt;{' '}
                  3위 {priorityItemsData[selectedOrder[2]].short}
                </span>
              </div>
            ) : (
              <div className="summary-placeholder">
                우선순위를 모두 선택해주세요 ({selectedOrder.length}/3)
              </div>
            )}
          </div>

          <button
            type="button"
            className={`next-step-button ${isCompleted ? 'active' : 'disabled'}`}
            disabled={!isCompleted}
            onClick={() => isCompleted && onNext(selectedOrder)}
          >
            <span>추천 결과 보기</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
