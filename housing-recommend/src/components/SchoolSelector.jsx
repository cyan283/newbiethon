import React, { useState, useMemo } from 'react';
import { SCHOOLS } from '../data/schools';
import { Search, X, MapPin, Train, CheckCircle2, School as SchoolIcon, ArrowRight } from 'lucide-react';

export default function SchoolSelector({ selectedSchool, onSelectSchool, onNext }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState('ALL');

  // 지역 필터 카테고리 정의
  const regionFilters = [
    { key: 'ALL', label: '전체' },
    { key: 'WEST', label: '서대문·마포', districts: ['서대문구', '마포구'] },
    { key: 'SOUTH', label: '동작·관악', districts: ['동작구', '관악구'] },
    { key: 'EAST_NORTH', label: '성북·동대문·노원', districts: ['성북구', '동대문구', '노원구'] },
    { key: 'CENTER_EAST', label: '광진·성동·종로·중구', districts: ['광진구', '성동구', '종로구', '중구'] },
    { key: 'GYEONGGI', label: '경기', districts: ['성남시 수정구'] }
  ];

  // 검색 및 지역 필터링
  const filteredSchools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return SCHOOLS.filter((school) => {
      // 1. 지역 탭 필터
      if (activeRegion !== 'ALL') {
        const filterItem = regionFilters.find((r) => r.key === activeRegion);
        if (filterItem && !filterItem.districts.includes(school.district)) {
          return false;
        }
      }

      // 2. 검색어 필터
      if (!query) return true;

      const matchName = school.name.toLowerCase().includes(query);
      const matchShort = school.shortName.toLowerCase().includes(query);
      const matchDistrict = school.district.toLowerCase().includes(query);
      const matchSubway = school.subway.toLowerCase().includes(query);
      const matchAliases = school.aliases.some((alias) =>
        alias.toLowerCase().includes(query)
      );

      return matchName || matchShort || matchDistrict || matchSubway || matchAliases;
    });
  }, [searchQuery, activeRegion]);

  const handleSelect = (school) => {
    onSelectSchool(school);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <section className="school-selector-section">
      {/* 헤더 안내 영역 */}
      <div className="selector-header">
        <div className="step-tag">STEP 01</div>
        <h1 className="main-title">
          어느 <span className="highlight">대학교</span>에 다니시나요?
        </h1>
        <p className="sub-title">
          통학하기 좋은 맞춤형 자취방 지역을 추천해 드릴게요.
        </p>
      </div>

      {/* 검색창 */}
      <div className="search-bar-wrapper">
        <div className="search-input-box">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="school-search-input"
            placeholder="학교명이나 지역(구)을 검색해보세요 (예: 건국대, 마포구, 성균관)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={clearSearch}
              aria-label="검색어 지우기"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 지역별 빠른 필터 탭 */}
      <div className="region-filter-bar">
        {regionFilters.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`region-tab-chip ${activeRegion === tab.key ? 'active' : ''}`}
            onClick={() => setActiveRegion(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 검색 결과 카운트 */}
      <div className="results-count-bar">
        <span>총 <strong>{filteredSchools.length}</strong>개 학교</span>
        {selectedSchool && (
          <span className="selected-indicator-text">
            선택: <strong>{selectedSchool.name}</strong>
          </span>
        )}
      </div>

      {/* 학교 그리드 목록 */}
      {filteredSchools.length > 0 ? (
        <div className="schools-grid">
          {filteredSchools.map((school) => {
            const isSelected = selectedSchool?.id === school.id;
            return (
              <div
                key={school.id}
                role="button"
                tabIndex={0}
                className={`school-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelect(school)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(school);
                  }
                }}
              >
                {/* 선택 시 체크 뱃지 */}
                {isSelected && (
                  <div className="check-badge">
                    <CheckCircle2 size={20} className="check-icon" />
                  </div>
                )}

                {/* 엠블럼 심볼 */}
                <div
                  className="school-emblem"
                  style={{
                    backgroundColor: school.themeColor,
                    boxShadow: isSelected
                      ? `0 4px 12px ${school.themeColor}55`
                      : 'none'
                  }}
                >
                  <span className="emblem-text">{school.badgeText}</span>
                </div>

                {/* 학교 정보 */}
                <div className="school-info">
                  <div className="school-name-row">
                    <h3 className="school-name">{school.name}</h3>
                    <span className="school-short-tag">{school.shortName}</span>
                  </div>

                  <div className="school-meta-tags">
                    <span className="meta-tag district-tag">
                      <MapPin size={12} className="meta-icon" />
                      {school.district}
                    </span>
                    <span className="meta-tag subway-tag" title={school.subway}>
                      <Train size={12} className="meta-icon" />
                      {school.subway}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-search-state">
          <div className="empty-icon-wrap">
            <SchoolIcon size={40} />
          </div>
          <h4>검색 결과가 없습니다</h4>
          <p>학교 이름을 다시 한 번 확인해주세요.</p>
          <button
            type="button"
            className="reset-search-btn"
            onClick={() => {
              setSearchQuery('');
              setActiveRegion('ALL');
            }}
          >
            전체 학교 다시 보기
          </button>
        </div>
      )}

      {/* 하단 고정 액션 바 */}
      <div className="bottom-action-container">
        <div className="bottom-action-inner">
          <div className="selection-summary">
            {selectedSchool ? (
              <div className="summary-selected">
                <span className="summary-label">선택된 학교</span>
                <span className="summary-value">
                  <strong>{selectedSchool.name}</strong> ({selectedSchool.district})
                </span>
              </div>
            ) : (
              <div className="summary-placeholder">
                목표 대학교를 1곳 선택해주세요.
              </div>
            )}
          </div>

          <button
            type="button"
            className={`next-step-button ${selectedSchool ? 'active' : 'disabled'}`}
            disabled={!selectedSchool}
            onClick={() => selectedSchool && onNext(selectedSchool)}
          >
            <span>다음 (통학 횟수 입력)</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
