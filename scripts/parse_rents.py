import pandas as pd
import xml.etree.ElementTree as ET
from io import StringIO


INPUT_FILE = "data/rents.csv"
OUTPUT_FILE = "data/rent_summary.csv"


def clean_number(value):
    """
    '1,000' 같은 문자열을 숫자로 변환
    """
    if value is None:
        return None

    value = str(value).replace(",", "").strip()

    if value == "":
        return None

    try:
        return int(value)
    except ValueError:
        return None


def parse_xml(xml_text, deal_ymd):
    """
    XML 한 덩어리에서
    법정동 / 월세 / 보증금 등을 추출
    """

    rows = []

    root = ET.fromstring(xml_text)

    items = root.findall(".//item")

    for item in items:

        # API 응답 필드명은 실제 XML 구조에 따라 다를 수 있어서
        # 여러 이름을 순서대로 확인
        region = (
            item.findtext("umdNm")
            or item.findtext("법정동")
        )

        monthly_rent = (
            item.findtext("monthlyRent")
            or item.findtext("월세금액")
        )

        deposit = (
            item.findtext("deposit")
            or item.findtext("보증금액")
        )

        deal_year = (
            item.findtext("dealYear")
            or item.findtext("년")
        )

        deal_month = (
            item.findtext("dealMonth")
            or item.findtext("월")
        )

        monthly_rent = clean_number(monthly_rent)
        deposit = clean_number(deposit)

        # 월세 계약만 사용
        # 월세 0원은 전세일 가능성이 높으므로 제외
        if monthly_rent is None or monthly_rent <= 0:
            continue

        if not region:
            continue

        rows.append({
            "region": region.strip(),
            "monthly_rent": monthly_rent,
            "deposit": deposit,
            "deal_ymd": deal_ymd,
            "deal_year": deal_year,
            "deal_month": deal_month,
        })

    return rows


def main():

    raw = pd.read_csv(INPUT_FILE)

    all_rows = []

    print(f"원본 응답 {len(raw)}개 파싱 시작")

    for index, row in raw.iterrows():

        deal_ymd = row["deal_ymd"]
        xml_text = row["raw_xml"]

        print(
            f"[{index + 1}/{len(raw)}] "
            f"{row['lawd_cd']} / {deal_ymd} 파싱 중..."
        )

        try:
            parsed_rows = parse_xml(
                xml_text,
                deal_ymd
            )

            all_rows.extend(parsed_rows)

            print(
                f"  월세 거래 {len(parsed_rows)}건 추출"
            )

        except Exception as error:
            print(f"  오류: {error}")

    rent_df = pd.DataFrame(all_rows)

    if rent_df.empty:
        print()
        print("추출된 월세 거래가 없습니다.")
        print(
            "API XML 필드명이 예상과 다른지 "
            "확인해야 합니다."
        )
        return

    print()
    print(
        f"총 {len(rent_df)}건의 "
        "월세 거래를 추출했습니다."
    )

    # -----------------------------------------
    # 학생 자취 기준 필터
    # -----------------------------------------
    #
    # 너무 큰 보증금 계약이 섞이면
    # 월세만 비교하기 어려우므로
    # 우선 보증금 2천만원 이하로 제한
    # -----------------------------------------

    filtered = rent_df[
        rent_df["deposit"].fillna(0) <= 2000
    ].copy()

    print(
        f"보증금 2,000만원 이하: "
        f"{len(filtered)}건"
    )

    # -----------------------------------------
    # 법정동별 월세 중앙값 계산
    # -----------------------------------------

    summary = (
        filtered
        .groupby("region")
        .agg(
            median_rent=(
                "monthly_rent",
                "median"
            ),
            median_deposit=(
                "deposit",
                "median"
            ),
            transaction_count=(
                "monthly_rent",
                "count"
            )
        )
        .reset_index()
    )

    # 숫자 정리
    summary["median_rent"] = (
        summary["median_rent"]
        .round()
        .astype(int)
    )

    summary["median_deposit"] = (
        summary["median_deposit"]
        .round()
        .astype(int)
    )

    summary = summary.sort_values(
        by="region"
    )

    summary.to_csv(
        OUTPUT_FILE,
        index=False,
        encoding="utf-8-sig"
    )

    print()
    print("완료!")
    print(
        f"{len(summary)}개 동네의 "
        f"월세 중앙값을 저장했습니다."
    )
    print(
        f"저장 위치: {OUTPUT_FILE}"
    )


if __name__ == "__main__":
    main()