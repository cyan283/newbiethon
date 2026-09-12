import { useState } from 'react';
import StepProgress from './components/StepProgress';
import SchoolSelector from './components/SchoolSelector';
import CommuteInput from './components/CommuteInput';
import TransitSelector from './components/TransitSelector';
import PriorityRanking from './components/PriorityRanking';
import AnalyzingLoading from './components/AnalyzingLoading';
import Top5Results from './components/Top5Results';
import './styles/SchoolSelector.css';
import RegionDetail from './components/RegionDetail';

function App() {
  const [currentStep, setCurrentStep] = useState(1);

  // 사용자 입력값
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [commuteCount, setCommuteCount] = useState(4);
  const [transitCard, setTransitCard] = useState('climate');
  const [transferLimit, setTransferLimit] = useState('one');
  const [priorities, setPriorities] = useState([
    'cost',
    'time',
    'walk'
  ]);

  // 상세 지역
  const [selectedRegion, setSelectedRegion] = useState(null);

  // ⭐ 백엔드 추천 결과 저장
  const [recommendationResult, setRecommendationResult] = useState(null);

  // ⭐ 에러 저장
  const [recommendationError, setRecommendationError] = useState(null);


  // =====================================================
  // 학교 이름 변환
  // 프론트 "서울대" → 백엔드 "서울대학교"
  // =====================================================

  const universityNameMap = {
    '서울대': '서울대학교',
    '연세대': '연세대학교',
    '고려대': '고려대학교',
    '서강대': '서강대학교',
    '성균관대': '성균관대학교',
    '한양대': '한양대학교',
    '중앙대': '중앙대학교',
    '경희대': '경희대학교',
    '한국외대': '한국외국어대학교',
    '서울시립대': '서울시립대학교',
    '건국대': '건국대학교',
    '동국대': '동국대학교',
    '홍익대': '홍익대학교',
    '국민대': '국민대학교',
    '숭실대': '숭실대학교',
    '세종대': '세종대학교',
    '광운대': '광운대학교',
    '명지대': '명지대학교',
    '가천대': '가천대학교'
  };


  // =====================================================
  // 중요도 값 변환
  // 프론트 → 백엔드
  // =====================================================

  const priorityMap = {
    cost: 'money',
    time: 'time',
    walk: 'walking'
  };


  // =====================================================
  // 환승 선호 값 변환
  // 프론트 → 백엔드
  // =====================================================

  const transferMap = {
    direct: 'hate',   // 환승을 최대한 피하고 싶음
    one: 'one_ok',    // 1회까지 허용
    two: 'none',      // 환승에 비교적 관대
    any: 'none'       // 환승 횟수 상관없음
  };


  // =====================================================
  // Step 1 → Step 2
  // =====================================================

  const handleSchoolNext = (school) => {
    setSelectedSchool(school);
    setCurrentStep(2);
  };


  // =====================================================
  // Step 2 → Step 3
  // =====================================================

  const handleCommuteNext = (count) => {
    setCommuteCount(count);
    setCurrentStep(3);
  };


  const handleCommutePrev = () => {
    setCurrentStep(1);
  };


  // =====================================================
  // Step 3 → Step 4
  // =====================================================

  const handleTransitNext = ({
    transitCard: card,
    transferLimit: transfer
  }) => {
    setTransitCard(card);
    setTransferLimit(transfer);
    setCurrentStep(4);
  };


  const handleTransitPrev = () => {
    setCurrentStep(2);
  };


  // =====================================================
  // ⭐ 백엔드 추천 API 호출
  // =====================================================

  const requestRecommendation = async (rankedList) => {
    try {
      setRecommendationError(null);

      // 프론트 학교 이름 가져오기
      const frontendSchoolName = selectedSchool?.name;

      // 백엔드 대학 이름으로 변환
      const backendSchoolName =
        universityNameMap[frontendSchoolName] ||
        frontendSchoolName;

      // 우선순위 변환
      const backendPriorities = rankedList.map(
        (item) => priorityMap[item]
      );

      // 환승 선호 변환
      const backendTransfer =
        transferMap[transferLimit] || transferLimit;

      // -------------------------------------------------
      // 백엔드로 보낼 데이터
      // -------------------------------------------------

      const requestBody = {
        university: backendSchoolName,

       school_days: commuteCount,

       priority_ranking: rankedList.map(
        (item) => priorityMap[item]
       ),

       transfer_preference:
       transferMap[transferLimit],

      use_modu_card: false
      };
      console.log('백엔드로 보내는 데이터:', requestBody);

      // -------------------------------------------------
      // API 요청
      // -------------------------------------------------

      const response = await fetch(
        'http://127.0.0.1:8000/recommend',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify(requestBody)
        }
      );


      // -------------------------------------------------
      // 응답 JSON 변환
      // -------------------------------------------------

      const data = await response.json();

      console.log('백엔드 응답:', data);


      // -------------------------------------------------
      // HTTP 에러 처리
      // -------------------------------------------------

      if (!response.ok) {
        throw new Error(
          data.detail ||
          '추천 데이터를 불러오는 데 실패했습니다.'
        );
      }


      // -------------------------------------------------
      // 추천 결과 저장
      // -------------------------------------------------

      setRecommendationResult(data);

      return data;

    } catch (error) {
      console.error(
        '추천 API 호출 실패:',
        error
      );

      setRecommendationError(error.message);

      return null;
    }
  };


  // =====================================================
  // Step 4 → Step 5
  // 중요도 입력이 끝나면 실제 백엔드 호출
  // =====================================================

  // STEP 4 → 5 → 6
const handlePriorityNext = async (rankedList) => {
  setPriorities(rankedList);
  setRecommendationResult(null);
  setRecommendationError(null);

  // 먼저 로딩 화면 표시
  setCurrentStep(5);

  // API 요청 + 최소 2초 로딩 화면 유지
  const [result] = await Promise.all([
    requestRecommendation(rankedList),

    new Promise((resolve) => {
      setTimeout(resolve, 2000);
    })
  ]);

  // API 성공 시 결과 페이지로 이동
  if (result) {
    setCurrentStep(6);
  }
};


  const handlePriorityPrev = () => {
    setCurrentStep(3);
  };


  // =====================================================
  // Step 5 → Step 4
  // =====================================================

  const handleLoadingPrev = () => {
    setCurrentStep(4);
  };


  // =====================================================
  // Step 6 → Step 7
  // =====================================================

  const handleSelectDetailRegion = (region) => {
    setSelectedRegion(region);
    setCurrentStep(7);
  };


  // =====================================================
  // 처음부터 다시 시작
  // =====================================================

  const handleRestart = () => {
    setCurrentStep(1);

    setSelectedRegion(null);
    setRecommendationResult(null);
    setRecommendationError(null);
  };


  // =====================================================
  // Step 7 → Step 6
  // =====================================================

  const handleDetailPrev = () => {
    setCurrentStep(6);
  };


  return (
    <div className="app-viewport">
      <div className="app-card-wrapper">

        <StepProgress
          currentStep={Math.min(currentStep, 4)}
          totalSteps={4}
        />


        {/* STEP 1 */}
        {currentStep === 1 && (
          <SchoolSelector
            selectedSchool={selectedSchool}
            onSelectSchool={(school) =>
              setSelectedSchool(school)
            }
            onNext={handleSchoolNext}
          />
        )}


        {/* STEP 2 */}
        {currentStep === 2 && (
          <CommuteInput
            selectedSchool={selectedSchool}
            commuteCount={commuteCount}
            onChangeCommuteCount={(c) =>
              setCommuteCount(c)
            }
            onNext={handleCommuteNext}
            onPrev={handleCommutePrev}
          />
        )}


        {/* STEP 3 */}
        {currentStep === 3 && (
          <TransitSelector
            selectedSchool={selectedSchool}
            commuteCount={commuteCount}
            transitCard={transitCard}
            transferLimit={transferLimit}
            onChangeTransitCard={(c) =>
              setTransitCard(c)
            }
            onChangeTransferLimit={(t) =>
              setTransferLimit(t)
            }
            onNext={handleTransitNext}
            onPrev={handleTransitPrev}
          />
        )}


        {/* STEP 4 */}
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


        {/* STEP 5 */}
        {currentStep === 5 && (
          <AnalyzingLoading
            selectedSchool={selectedSchool}
            commuteCount={commuteCount}
            transitCard={transitCard}
            transferLimit={transferLimit}
            priorities={priorities}
            onPrev={handleLoadingPrev}
          />
        )}


        {/* API 에러 */}
        {recommendationError && currentStep === 5 && (
          <div
            style={{
              color: '#dc2626',
              textAlign: 'center',
              padding: '20px'
            }}
          >
            추천 결과를 불러오지 못했습니다.
            <br />
            {recommendationError}

            <div style={{ marginTop: '15px' }}>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
              >
                이전으로 돌아가기
              </button>
            </div>
          </div>
        )}


        {/* STEP 6 */}
        {currentStep === 6 && (
          <Top5Results
            selectedSchool={selectedSchool}
            commuteCount={commuteCount}
            transitCard={transitCard}
            transferLimit={transferLimit}
            priorities={priorities}

            // ⭐ 실제 백엔드 추천 결과
            recommendationResult={recommendationResult}

            onSelectDetail={handleSelectDetailRegion}
            onRestart={handleRestart}
          />
        )}


        {/* STEP 7 */}
        {currentStep === 7 && (
          <RegionDetail
            selectedRegion={selectedRegion}
            selectedSchool={selectedSchool}
            onPrev={handleDetailPrev}
          />
        )}

      </div>
    </div>
  );
}

export default App;

