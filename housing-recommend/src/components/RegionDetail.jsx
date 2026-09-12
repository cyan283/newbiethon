import React, { useEffect, useRef } from 'react';
import { ArrowLeft, MapPin, GraduationCap } from 'lucide-react';

export default function RegionDetail({
  selectedRegion,
  selectedSchool,
  onPrev
}) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!selectedRegion) return;

    const script = document.createElement('script');

    // ⭐ 여기는 네 실제 JavaScript 키로 유지
    script.src =
      '//dapi.kakao.com/v2/maps/sdk.js?appkey=5ca65758cea9072ed1bbd29610665f10&autoload=false&libraries=services';

    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = mapRef.current;

        if (!container) return;

        const options = {
          center: new window.kakao.maps.LatLng(
            37.5665,
            126.9780
          ),
          level: 6
        };

        const map = new window.kakao.maps.Map(
          container,
          options
        );

        const places =
          new window.kakao.maps.services.Places();

        // =========================
        // 추천 지역 이름
        // =========================

        const regionName =
          selectedRegion.region ||
          selectedRegion.name ||
          '';

        const regionKeyword =
          `${selectedRegion.gu || ''} ${regionName}`.trim();

        // =========================
        // 학교 이름
        // =========================

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

        const schoolName =
          universityNameMap[selectedSchool?.name] ||
          selectedSchool?.name ||
          '';

        let regionPosition = null;
        let schoolPosition = null;

        // =========================
        // 두 마커 모두 보이게 지도 범위 조정
        // =========================

        const fitMap = () => {
          if (!regionPosition || !schoolPosition) {
            return;
          }

          const bounds =
            new window.kakao.maps.LatLngBounds();

          bounds.extend(regionPosition);
          bounds.extend(schoolPosition);

          map.setBounds(bounds);
        };

        // =========================
        // 추천 지역 검색
        // =========================

        places.keywordSearch(
          regionKeyword,
          (data, status) => {
            if (
              status ===
                window.kakao.maps.services.Status.OK &&
              data.length > 0
            ) {
              regionPosition =
                new window.kakao.maps.LatLng(
                  data[0].y,
                  data[0].x
                );

              const regionMarker =
                new window.kakao.maps.Marker({
                  map,
                  position: regionPosition
                });

              // 추천 지역 라벨
              const regionInfoWindow =
                new window.kakao.maps.InfoWindow({
                  content: `
                    <div style="
                      padding:6px 10px;
                      font-size:12px;
                      font-weight:700;
                      white-space:nowrap;
                    ">
                      🏠 ${regionName}
                    </div>
                  `
                });

              regionInfoWindow.open(
                map,
                regionMarker
              );

              map.setCenter(regionPosition);

              fitMap();
            }
          }
        );

        // =========================
        // 학교 검색
        // =========================

        if (schoolName) {
          places.keywordSearch(
            schoolName,
            (data, status) => {
              if (
                status ===
                  window.kakao.maps.services.Status.OK &&
                data.length > 0
              ) {
                schoolPosition =
                  new window.kakao.maps.LatLng(
                    data[0].y,
                    data[0].x
                  );

                const schoolMarker =
                  new window.kakao.maps.Marker({
                    map,
                    position: schoolPosition
                  });

                // 학교 라벨
                const schoolInfoWindow =
                  new window.kakao.maps.InfoWindow({
                    content: `
                      <div style="
                        padding:6px 10px;
                        font-size:12px;
                        font-weight:700;
                        white-space:nowrap;
                      ">
                        🎓 ${schoolName}
                      </div>
                    `
                  });

                schoolInfoWindow.open(
                  map,
                  schoolMarker
                );

                fitMap();
              }
            }
          );
        }
      });
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [selectedRegion, selectedSchool]);

  if (!selectedRegion) {
    return null;
  }

  const regionName =
    selectedRegion.region ||
    selectedRegion.name ||
    '';

  return (
    <section className="school-selector-section">

      {/* 상단 */}
      <div className="top-nav-bar">

        <button
          type="button"
          className="prev-step-back-btn"
          onClick={onPrev}
        >
          <ArrowLeft size={16} />
          <span>TOP5로 돌아가기</span>
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

      {/* 제목 */}
      <div className="selector-header">

        <div className="step-tag">
          REGION DETAIL
        </div>

        <h1 className="main-title">

          <span className="highlight">
            {regionName}
          </span>

          <br />

          지역 위치 보기

        </h1>

        <p className="sub-title">
          추천 지역과 학교 위치를 한눈에 확인해보세요.
        </p>

      </div>

      {/* 위치 정보 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginBottom: '16px',
          fontSize: '15px',
          fontWeight: 700
        }}
      >

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <MapPin size={18} />

          <span>
            추천 지역:
            {' '}
            {selectedRegion.gu}{' '}
            {regionName}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <GraduationCap size={18} />

          <span>
            목표 학교:
            {' '}
            {selectedSchool?.name}
          </span>
        </div>

      </div>

      {/* 지도 */}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '430px',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}
      />

    </section>
  );
}