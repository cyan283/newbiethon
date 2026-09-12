import { useState } from 'react';
import StepProgress from './components/StepProgress';
import SchoolSelector from './components/SchoolSelector';
import CommuteInput from './components/CommuteInput';
import TransitSelector from './components/TransitSelector';
import PriorityRanking from './components/PriorityRanking';
import AnalyzingLoading from './components/AnalyzingLoading';
import Top5Results from './components/Top5Results';
import './styles/SchoolSelector.css';

function App() {
  // 전체 서비스 단계:
  // 1: 학교 선택 (#1)
  // 2: 통학 횟수 (#2)
  // 3: 교통/환승 (#3)
  // 4: 중요도 순위 (#4)
  // 5: 백엔드 계산 대기 화면
  // 6: TOP5 결과 페이지 (#6)
  // 7: 상세 지역 페이지 (#7)
  const [currentStep, setCurrentStep] = useState(1);

  // 사용자 수집 데이터 상태
  const [selectedSchool, setSelectedSchool] = useState(null); // #1 학교
  const [commuteCount, setCommuteCount] = useState(4); // #2 통학 횟수 (1~7)
  const [transitCard, setTransitCard] = useState('climate'); // #3-1 교통카드 혜택
  const [transferLimit, setTransferLimit] = useState('one'); // #3-2 환승 횟수
  const [priorities, setPriorities] = useState(['cost', 'time', 'walk']); // #4 중요도 1, 2, 3순위
  const [selectedRegion, setSelectedRegion] = useState(null); // #7 상세 지역 데이터

  // Step 1 -> Step 2
  const handleSchoolNext = (school) => {
    setSelectedSchool(school);
    setCurrentStep(2);
  };

  // Step 2 -> Step 3
  const handleCommuteNext = (count) => {
    setCommuteCount(count);
    setCurrentStep(3);
  };

  // Step 2 -> Step 1 (뒤로)
  const handleCommutePrev = () => {
    setCurrentStep(1);
  };

  // Step 3 -> Step 4
  const handleTransitNext = ({ transitCard: card, transferLimit: transfer }) => {
    setTransitCard(card);
    setTransferLimit(transfer);
    setCurrentStep(4);
  };

  // Step 3 -> Step 2 (뒤로)
  const handleTransitPrev = () => {
    setCurrentStep(2);
  };

  // Step 4 -> Step 5 (계산 대기 화면으로 이동)
  const handlePriorityNext = (rankedList) => {
    setPriorities(rankedList);
    setCurrentStep(5);
  };

  // Step 4 -> Step 3 (뒤로)
  const handlePriorityPrev = () => {
    setCurrentStep(3);
  };

  // Step 5 -> Step 4 (뒤로)
  const handleLoadingPrev = () => {
    setCurrentStep(4);
  };

  // Step 5 -> Step 6 (계산 완료 후 TOP 5 결과로 이동)
  const handleAnalysisComplete = () => {
    setCurrentStep(6);
  };

  // Step 6 -> Step 7 (상세 지역 보기)
  const handleSelectDetailRegion = (region) => {
    setSelectedRegion(region);
    setCurrentStep(7);
  };

  // 처음부터 다시 시작
  const handleRestart = () => {
    setCurrentStep(1);
  };

  // Step 7 -> Step 6 (상세 페이지에서 목록으로 뒤로가기)
  const handleDetailPrev = () => {
    setCurrentStep(6);
  };

  return (
    <div className="app-viewport">
      <div className="app-card-wrapper">
        {/* 상단 4단계 프로그레스 바 (결과 및 상세 페이지는 완료 상태로 유지) */}
        <StepProgress currentStep={Math.min(currentStep, 4)} totalSteps={4} />

        {/* STEP 1: 학교 선택 화면 */}
        {currentStep === 1 && (
          <SchoolSelector
            selectedSchool={selectedSchool}
            onSelectSchool={(school) => setSelectedSchool(school)}
            onNext={handleSchoolNext}
          />
        )}

        {/* STEP 2: 통학 횟수 입력 화면 (1 ~ 7회) */}
        {currentStep === 2 && (
          <CommuteInput
            selectedSchool={selectedSchool}
            commuteCount={commuteCount}
            onChangeCommuteCount={(c) => setCommuteCount(c)}
            onNext={handleCommuteNext}
            onPrev={handleCommutePrev}
          />
        )}

        {/* STEP 3: 교통카드 혜택 및 환승 횟수 입력 화면 */}
        {currentStep === 3 && (
          <TransitSelector
            selectedSchool={selectedSchool}
            commuteCount={commuteCount}
            transitCard={transitCard}
            transferLimit={transferLimit}
            onChangeTransitCard={(c) => setTransitCard(c)}
            onChangeTransferLimit={(t) => setTransferLimit(t)}
            onNext={handleTransitNext}
            onPrev={handleTransitPrev}
          />
        )}

        {/* STEP 4: 중요도 1, 2, 3순위 선택 화면 */}
        {currentStep === 4 && (
          <PriorityRanking
            selectedSchool={selectedSchool}
            commuteCount={commuteCount}
            transitCard={transitCard}
            transferLimit={transferLimit}
            priorities={priorities}
            onNext={handlePriorityNext}
            onPrev={handlePriorityPrev}
          />
        )}

        {/* STEP 5: 백엔드 계산 대기 화면 */}
        {currentStep === 5 && (
          <AnalyzingLoading
            selectedSchool={selectedSchool}
            commuteCount={commuteCount}
            transitCard={transitCard}
            transferLimit={transferLimit}
            priorities={priorities}
            onComplete={handleAnalysisComplete}
            onPrev={handleLoadingPrev}
          />
        )}

        {/* STEP 6: TOP 5 결과 페이지 (#6) */}
        {currentStep === 6 && (
          <Top5Results
            selectedSchool={selectedSchool}
            commuteCount={commuteCount}
            transitCard={transitCard}
            transferLimit={transferLimit}
            priorities={priorities}
            onSelectDetail={handleSelectDetailRegion}
            onRestart={handleRestart}
          />
        )}

        {/* STEP 7: 상세 지역 페이지 (#7 예비 화면) */}
        {currentStep === 7 && (
          <section className="school-selector-section" style={{ minHeight: '460px' }}>
            <div className="top-nav-bar">
              <button type="button" className="prev-step-back-btn" onClick={handleDetailPrev}>
                ← TOP 5 목록으로 돌아가기
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
              <div className="step-tag" style={{ background: '#eff6ff', color: '#2563eb' }}>
                REGION DETAIL
              </div>
              <h1 className="main-title">
                <span className="highlight">{selectedRegion?.name}</span>
                <br />
                상세 지역 분석
              </h1>
              <p className="sub-title">
                총점수: <strong>{selectedRegion?.totalScore}점</strong> (Top {selectedRegion?.rank})
              </p>
            </div>

            <div
              style={{
                background: '#f8fafc',
                borderRadius: '16px',
                padding: '24px',
                border: '1.5px dashed #cbd5e1',
                textAlign: 'center',
                margin: '20px 0'
              }}
            >
              <p style={{ color: '#0f172a', fontSize: '15px', fontWeight: 700, margin: '0 0 8px 0' }}>
                🏠 {selectedRegion?.name} 선택 완료!
              </p>
              <p style={{ color: '#64748b', fontSize: '13.5px', margin: 0 }}>
                다음 작업으로 마지막 단계인 <strong>"#7 상세 지역 페이지 (상권, 치안, 지하철 상세 노선, 로드뷰 등)"</strong>을 구현할 준비가 되었습니다.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default App;
