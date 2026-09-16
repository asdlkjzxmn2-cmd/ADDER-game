# V17 분석과 계산 방식

## 기존 구조 확인
- 날짜: state.day=1로 시작, dateFor(day)가 2027.01.15부터 표시. closeDay 끝에서 day++ / ap=5. 별도 날짜 카운터를 추가하지 않았습니다. 기존 달력은 월을 30일로 취급하는 게임 달력입니다. 실제 달력으로 바꾸는 작업은 이번에 하지 않았습니다.
- 상품 정의: id/name/category/retail/wholesale 또는 unitCost/quality/trend/season/source/supplierId. 고정 상품과 generatedProducts, ORIGINALS, generatedOriginals를 사용합니다.
- 재고: inventory[id]의 stock, price, shoot, sold, avgCost, colorStock/colorSold, saleActive와 입고/판매 이력. 기존 가격 수정은 setPrice 그대로입니다.
- 판매: closeDay에서 온라인/오프라인 예상 판매 강도에 난수 가산 후 내림, 재고 상한 적용. 촬영 안 한 상품은 온라인 판매 불가, 판매중지 상품은 판매 불가. 기존 리뷰·채널·평판·팔로워·시즌·유행·이벤트·컬러 선택을 유지합니다.
- 기존 코드에는 이미 간단한 주간 유행/랜덤 이벤트/정산이 있습니다. 삭제하거나 V18~V21 확장 기능을 중복 구현하지 않았습니다.
- 저장: IndexedDB adder-local-v1 / version 1 / games / current-game. 파일은 ADDER_BOUTIQUE_SAVE / schema 1. 내부 state.version=17은 이전 버전부터 사용하던 스키마 값으로, 이번 출시번호와는 별개입니다.

## V17 추가 데이터
state.productSalesProfiles[상품ID]에 version:1과 아래 항목을 저장합니다. 상품 ID를 해시한 초기값이므로 불러오기/재실행/색상 변경으로 성향이 다시 추첨되지 않습니다. 새로 발견/개발한 상품도 동일하게 초기화됩니다.

| 항목 | 생성 범위 | 역할 |
|---|---|---|
| popularity | 30~90 | 기본 인기도 |
| demand | 0.85~1.15 | 기본 수요 |
| sellSpeed | 0.85~1.15 | 회전 성향 |
| trendAffinity | 0.8~1.2 | 기존 유행 일치 시 반응 |
| priceSensitivity | 약 0.75~1.55 | 가격 변화 반응; 인기 높으면 대체로 낮음 |

UI와 버튼은 변경하지 않았고 내부 숫자를 화면에 추가하지 않았습니다. 기존 판매현황으로 실제 차이를 확인할 수 있습니다.

## 계산
균형 조정 위치: source/logic.js의 PRODUCT_SALES_BALANCE, defaultProductSalesProfile, productSalesFactors.

- 상품 배율 = clamp((0.7 + 인기도 × 0.006) × 수요 × 판매속도, 0.60, 1.50)
- 가격 배율 = clamp((권장 소매가 ÷ 사용자 판매가)^가격민감도, 0.35, 1.55)
- 촬영 배율: 미촬영 온라인 판매 불가 / 셀프 1.00 / 호리존 1.06 / 에디토리얼 1.12
- 유행 배율: 기존 유행 일치 시 1 + 0.55 × 유행반응도, 그 외 1
- 온라인 강도 = 기존 온라인 기본강도 × 상품 배율 × 가격 배율 × 촬영 배율 × 유행 배율 × 기존 시즌·품질·평판·팔로워·사이트·리뷰·이벤트 배율
- 오프라인은 기존 매장 배율을 사용하고 촬영 배율은 적용하지 않습니다.
- 실제 수량은 기존 floor(강도 + 난수 가산), 바이럴 최소판매 규칙, 재고 상한을 그대로 사용합니다. 배율은 확정 판매수량/확률이 아니며 하루 결과는 흔들릴 수 있습니다. 가격을 낮춰도 상한 도달 뒤에는 추가 개선이 없습니다.

## 세이브 호환
ensureProductSalesProfiles가 새 게임/기존 상태 처리/불러오기/보기/상품 생성 후에 누락 필드를 보완합니다. 정상인 성향 값은 유지하고 null·비숫자·범위 밖의 신규 값만 해당 상품 기본값으로 복구합니다. 기존 돈·재고·가격·촬영·이력·날짜·수동 슬롯을 초기화하지 않습니다. 예전 수동 슬롯은 원본을 그대로 보관하고 해당 슬롯을 불러올 때 보완합니다.

PC의 file://와 Pages의 HTTPS 저장소는 자동 공유되지 않습니다. 이전 실행판에서 SAVE → 현재 진행 파일 저장 후 V17에서 파일 불러오기를 사용하세요. PWA 캐시와 IndexedDB는 분리돼 있습니다. 기존 저장소 주소에서 업데이트하면 기존 자동 저장을 계속 읽습니다.

## 보존/수정 파일
- 보존: V15 HTML/ZIP, V16 HTML/전체 ZIP. 원본 출력 폴더도 그대로 유지.
- 기능 수정: source/logic.js만. client.js/template.html/pwa.js는 표시 버전 문자열만 변경.
- 갱신: release.json, rebuild.cjs의 버전 치환 기준, ADDER_V17.html, docs/index.html, docs/service-worker.js, README/CHANGELOG/TEST_RESULTS.
- 그대로 유지: CSS, local-runtime, manifest, 아이콘, 서비스워커 템플릿, 서버/START_IPAD.
- 추가: V17_DESIGN.md, 검증 코드와 결과 tests/, V16 보존본.
