import React, { useEffect, useRef } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';

export default function RegionDetail({
  selectedRegion,
  selectedSchool,
  onPrev
}) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!selectedRegion) return;

    const script = document.createElement('script');

    script.src = '//dapi.kakao.com/v2/maps/sdk.js?appkey=5ca65758cea9072ed1bbd29610665f10&autoload=false&libraries=services';

    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = mapRef.current;

        const options = {
          center: new window.kakao.maps.LatLng(
            37.5665,
            126.9780
          ),
          level: 5
        };

        const map = new window.kakao.maps.Map(
          container,
          options
        );

        const geocoder =
          new window.kakao.maps.services.Geocoder();

        const keyword =
          `${selectedRegion.gu || ''} ${selectedRegion.name}`;

        geocoder.addressSearch(
          keyword,
          (result, status) => {
            if (
              status ===
              window.kakao.maps.services.Status.OK
            ) {
              const coords =
                new window.kakao.maps.LatLng(
                  result[0].y,
                  result[0].x
                );

              map.setCenter(coords);

              new window.kakao.maps.Marker({
                map,
                position: coords
              });
            }
          }
        );
      });
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [selectedRegion]);

  if (!selectedRegion) {
    return null;
  }

  return (
    <section className="school-selector-section">
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

      <div className="selector-header">
        <div className="step-tag">
          REGION DETAIL
        </div>

        <h1 className="main-title">
          <span className="highlight">
            {selectedRegion.name}
          </span>
          <br />
          지역 위치 보기
        </h1>

        <p className="sub-title">
          추천 지역 보러가기
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '14px',
          fontSize: '16px',
          fontWeight: 700
        }}
      >
        <MapPin size={18} />

        <span>
          {selectedRegion.gu}{' '}
          {selectedRegion.name}
        </span>
      </div>

      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '420px',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}
      />
    </section>
  );
}