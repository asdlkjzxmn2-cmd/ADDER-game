# ADDER 변경 기록

## V17 — PC 검수 대기 / 미배포
- 상품별 인기도, 기본 수요, 판매속도, 유행 반응도, 가격 민감도를 추가. 상품 ID로 초기값을 고정하고 세이브에 유지.
- 기존 판매가 수정값을 가격 민감도와 연결. 기존 판매 계산에 제한된 상품별 배율과 촬영 품질 배율 적용.
- 기존 유행/이벤트 공급 함수를 그대로 연결. V18 이후 신규 기능은 구현하지 않음.
- 누락/잘못된 신규 필드만 보완. IndexedDB, 세이브 포맷, 날짜, 화면 및 조작 유지.
- V16 HTML·전체 원본 ZIP 보존. V17 검수 중 수정은 V17로 유지.

## V16
- HOME, ONLINE, STORE도 고정 HUD 아래의 독립 스크롤 영역에서 렌더링하도록 수정. 이전 V15의 BUY 거래처/상품 분리 스크롤 및 고정 필터 유지.
- IndexedDB `adder-local-v1` 버전 1 / `games` / `current-game` 및 JSON 세이브 스키마 1 그대로 유지. 게임 규칙은 표시 버전명 외 변경 없음.
- PC 독립실행 `ADDER_V16.html`과 GitHub Pages `docs/index.html`을 같은 소스로 생성.
- 상대경로 manifest, iOS 홈 화면 아이콘, 서비스 워커 및 오프라인 캐시 추가.
- 새 릴리스의 전체 파일과 SHA-256을 확인한 후 설치. 실행 중에는 waiting 상태를 유지하며 강제 새로고침/skipWaiting/clients.claim 없음.
- 정상 활성화 이후 이 사이트의 이전 앱 캐시만 정리. IndexedDB 및 세이브 파일에는 접근하지 않음.
- START_IPAD 로컬 서버는 `/adder-game/` 경로 제공, 포트 충돌 및 연결 점검 안내 추가.

## V15 — 보존본
- 상단 상태 및 탭별 필터 고정, BUY 거래처/상품 분리 스크롤.
- BUY/REORDER 장바구니 수량 −/+ 조절.
- `versions/ADDER_V15.html`과 `versions/ADDER_V15_독립실행.zip`은 기존 파일 그대로 복사. V15 수정 없음.
