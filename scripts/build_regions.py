import pandas as pd
from charset_normalizer import from_bytes


INPUT_FILE = "data/legal_dong.txt"
OUTPUT_FILE = "data/regions.csv"


def detect_encoding(file_path):
    with open(file_path, "rb") as f:
        raw_data = f.read()

    result = from_bytes(raw_data).best()

    if result is None:
        raise ValueError("파일 인코딩을 감지하지 못했습니다.")

    print("감지된 인코딩:", result.encoding)

    return result.encoding


def main():
    encoding = detect_encoding(INPUT_FILE)

    df = pd.read_csv(
        INPUT_FILE,
        sep="\t",
        dtype=str,
        encoding=encoding
    )

    print()
    print("원본 파일 읽기 완료")
    print("열 이름:")
    print(df.columns.tolist())

    # 열 이름 앞뒤 공백 제거
    df.columns = df.columns.str.strip()

    # 일반적인 법정동 전체자료 열 이름에 맞춤
    code_column = df.columns[0]
    name_column = df.columns[1]
    status_column = df.columns[2]

    print()
    print("사용할 열:")
    print("코드:", code_column)
    print("법정동명:", name_column)
    print("상태:", status_column)

    # 서울특별시만 선택
    seoul = df[
        df[name_column].str.startswith(
            "서울특별시",
            na=False
        )
    ].copy()

    # 폐지된 지역 제외
    # 파일마다 '존재', '폐지', '존재여부' 표현이 다를 수 있으므로
    # 우선 폐지라는 글자가 있는 행을 제거
    seoul = seoul[
        ~seoul[status_column].fillna("").str.contains("폐지")
    ].copy()

    # 예:
    # 서울특별시 관악구 신림동
    parts = seoul[name_column].str.split()

    # 시 + 구 + 동 구조인 데이터만 사용
    seoul = seoul[
        parts.str.len() >= 3
    ].copy()

    seoul["gu"] = (
        seoul[name_column]
        .str.split()
        .str[1]
    )

    seoul["region"] = (
        seoul[name_column]
        .str.split()
        .str[-1]
    )

    result = pd.DataFrame({
        "region": seoul["region"],
        "gu": seoul["gu"],
        "legal_code": seoul[code_column],
        "latitude": "",
        "longitude": "",
    })

    result = result.drop_duplicates(
        subset=["legal_code"]
    )

    result = result.sort_values(
        by=["gu", "region"]
    )

    result.to_csv(
        OUTPUT_FILE,
        index=False,
        encoding="utf-8-sig"
    )

    print()
    print("완료!")
    print(
        f"{len(result)}개 지역을 "
        f"{OUTPUT_FILE}에 저장했습니다."
    )


if __name__ == "__main__":
    main()