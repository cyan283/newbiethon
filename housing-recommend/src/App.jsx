import { useState } from 'react';
import StepProgress from './components/StepProgress';
import SchoolSelector from './components/SchoolSelector';
import './styles/SchoolSelector.css';

function App() {
  // 전체 추천 서비스 상태 관리
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSchool, setSelectedSchool] = useState(null);

  // 학교 선택 핸들러
  const handleSelectSchool = (school) => {
    setSelectedSchool(school);
  };

  // 다음 단계 이동 핸들러
  const handleNextStep = () => {
    if (selectedSchool) {
      setCurrentStep(2);
    }
  };

  // 이전 단계 이동 핸들러
  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className="app-viewport">
      <div className="app-card-wrapper">
        {/* 상단 3단계 프로그레스 바 */}
        <StepProgress currentStep={currentStep} totalSteps={3} />

        {/* STEP 1: 학교 선택 화면 */}
        {currentStep === 1 && (
          <SchoolSelector
            selectedSchool={selectedSchool}
            onSelectSchool={handleSelectSchool}
            onNext={handleNextStep}
          />
        )}

        {/* STEP 2: 통학 횟수 입력 예비 화면 (다음 요청 시 구현) */}
        {currentStep === 2 && (
          <section className="school-selector-section" style={{ minHeight: '400px' }}>
            <div className="selector-header">
              <div className="step-tag">STEP 02</div>
              <h1 className="main-title">
                <span className="highlight">{selectedSchool?.name}</span>으로
                <br />
                일주일에 몇 번 통학하시나요?
              </h1>
              <p className="sub-title">
                통학 횟수에 따라 거리와 가성비의 최적 밸런스를 계산합니다.
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
              <p style={{ color: '#64748b', fontSize: '15px', margin: '0 0 12px 0' }}>
                🎉 <strong>{selectedSchool?.name}</strong>({selectedSchool?.district}) 선택 완료!
              </p>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
                다음 작업으로 <strong>"#2 통학 횟수 입력 기능"</strong>을 이어갈 준비가 되었습니다.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePrevStep}
              style={{
                marginTop: 'auto',
                padding: '12px 20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#475569',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ← 학교 다시 선택하기
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

export default App;
