# ADDER — V18 PC 검수본

V18은 로컬 검수본이며 배포하지 않았습니다. 현재 공개 버전은 V17입니다. 별도 승인 후에만 V18을 배포합니다. PC 검수 → 같은 V18에서 수정 → 사용자의 명시적 배포 승인 후에만 기존 저장소에 배포합니다. 상세 계산/분석은 V18_DESIGN.md, 검증은 TEST_RESULTS.md를 참고하세요.

기존 저장소에 수동 반영할 때는 이 adder-game 폴더 **안의 파일과 폴더 전체**를 저장소 루트에 올립니다. docs/ 전체를 함께 교체하고 source/, release.json, rebuild.cjs, 문서도 갱신하세요. versions/는 추가·보존하고 이전 버전을 삭제하지 마세요. 기존 CNAME이나 별도 설정이 있다면 보존하세요. 같은 main /docs와 같은 Pages 주소를 사용합니다.

PC 독립실행과 GitHub Pages PWA를 같은 원본에서 생성합니다. 완성된 결과가 포함되어 있으므로 플레이하거나 GitHub에 올릴 때 빌드/설치는 필요 없습니다.

## 파일 구성

```text
adder-game/
  ADDER_V18.html             PC 독립실행판
  docs/                     GitHub Pages 공개 폴더
    index.html              CSS·JS·그림이 포함된 단일 게임 HTML
    manifest.webmanifest
    service-worker.js
    icons/                  192/512 PNG, Apple 180 PNG
    .nojekyll
  source/                   게임 원본 + PWA 원본
  versions/                 변경하지 않은 V15·V16·V17 HTML 및 원본 ZIP
  release.json              현재 버전
  rebuild.cjs
  server.cjs
  START_IPAD.cmd
  CHANGELOG.md
  TEST_RESULTS.md
```

## GitHub 최초 설정

1. GitHub에 `adder-game` 저장소를 만드세요. Pages가 지원되는 공개 저장소를 사용하는 것이 간단합니다.
2. 압축을 풀고 **adder-game 안의 내용 전체**를 저장소 최상위에 업로드하여 `main`에 커밋하세요. `docs`가 저장소 바로 아래에 있어야 합니다. ZIP 자체나 `adder-game/adder-game/docs`처럼 이중 폴더를 올리지 마세요.
3. 저장소 **Settings → Pages → Build and deployment → Source: Deploy from a branch**를 선택하세요.
4. **Branch: main / Folder: /docs → Save**를 선택하세요.
5. 배포 완료 후 Settings → Pages에 표시된 실제 주소를 사용하세요. 기본 형태는 `https://asdlkjzxmn2-cmd.github.io/ADDER-game/`입니다. 끝의 `/`를 포함하세요.

현재 결과물은 업로드 준비 폴더이며, 실제 GitHub 저장소 생성/업로드/온라인 공개는 수행하지 않았습니다. 앞으로 같은 저장소, 같은 Pages 주소를 유지합니다.

공식 안내: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## PC에서 실행

- `ADDER_V18.html`을 Chrome 또는 Edge로 더블클릭해 여세요. 인터넷과 Node.js 설치가 필요 없습니다.
- 자동 저장은 브라우저에 남습니다. 버전 교체 전 SAVE → 현재 진행 파일 저장으로 백업하세요.
- 기존 V15 진행은 V15에서 파일 저장한 후 V18에서 파일 불러오기를 사용하세요.

## iPad/iPhone 홈 화면 설치

1. **Safari**로 배포된 GitHub Pages의 **HTTPS 주소**를 여세요.
2. SAVE를 열고 **오프라인 실행 준비 완료**가 표시되는지 확인하세요.
3. 공유 → 홈 화면에 추가 → 추가. ‘웹 앱으로 열기’ 옵션이 있으면 켜세요.
4. 홈 화면의 ADDER 아이콘을 실행하고 다시 SAVE의 오프라인 준비 완료를 확인하세요. 홈 화면 앱과 기존 Safari 화면이 저장 공간을 공유한다고 가정하지 마세요. 필요한 진행 파일을 홈 화면 앱에서 불러오세요.
5. 앱을 종료하고 비행기 모드로 바꾼 뒤 다시 실행하여 해당 기기에서 오프라인 실행을 확인하세요.

공식 안내: https://support.apple.com/guide/ipad/open-as-web-app-ipad8f1f7a29/ipados

## 저장 데이터

- 자동 저장: IndexedDB `adder-local-v1` (버전 1), object store `games`, key `current-game`.
- 매 게임 행동은 저장 트랜잭션 완료 후 화면에 반영됩니다. 수동 SAVE 목록도 같은 게임 상태에 저장됩니다.
- PC, GitHub Pages, 다른 브라우저/기기는 자동 동기화되지 않습니다. SAVE의 JSON 내보내기/불러오기로 이동하세요.
- 기존 `ADDER_BOUTIQUE_SAVE` / schema 1 형식을 유지했습니다. 현재 진행 파일은 현재 진행의 백업이며 수동 슬롯 전체를 합쳐 내보내는 기능은 아닙니다. 필요한 슬롯은 각각 파일로 백업하세요.
- 서비스 워커는 Cache Storage만 사용합니다. 게임 IndexedDB를 열거나 삭제하지 않습니다.
- 사용자가 Safari 웹사이트 데이터를 지우거나 OS가 사이트 저장 공간을 회수하면 브라우저 저장 자료는 사라질 수 있습니다. 중요한 진행 파일은 따로 보관하세요. PWA는 기기의 저장 정책을 우회하지 않습니다.

## 안전한 업데이트

1. 새 버전 파일을 온라인 상태에서 발견하면 별도 캐시에 전부 받고 SHA-256을 검증합니다.
2. 성공한 새 워커는 waiting 상태에 머뭅니다. SAVE에는 새 버전 준비 완료가 표시됩니다.
3. 플레이 중 새로고침하지 않습니다. 열린 모든 ADDER 창은 기존 릴리스의 단일 HTML을 사용합니다.
4. ADDER 홈 화면 앱과 같은 주소의 Safari/브라우저 탭을 **모두 종료**하면 새 워커가 활성화될 수 있습니다. 홈 화면으로 나가기만 하면 앱이 백그라운드에 남아 업데이트가 계속 대기할 수 있습니다.
5. 다음 실행에서 새 버전과 기존 IndexedDB 진행을 읽습니다. 기기별 종료·활성화 시점은 브라우저가 관리합니다.
6. 다운로드 실패/불완전 배포는 설치 실패로 처리하며 기존 캐시와 진행은 유지됩니다. 네트워크 재연결 후 다시 확인합니다.

## V18 이후 제작

1. 이전 독립 HTML을 `versions/`에 보존하세요. V15 보존 파일은 변경하지 마세요.
2. `source/`를 수정하고 `release.json`을 `{"version":"V18"}`처럼 변경하세요.
3. Node.js가 있는 개발 PC에서 `node rebuild.cjs`를 실행하세요. 플레이어 PC에는 Node.js가 필요 없습니다.
4. 새 독립 HTML과 `docs/` 결과물을 테스트하고 CHANGELOG를 기록한 다음 **같은 저장소의 main에 완성 결과 전체를 함께 커밋**하세요.
5. `docs/index.html`만 편집하면 워커의 해시 검증과 달라져 설치가 거부됩니다. 항상 rebuild로 함께 생성하세요.
6. 다른 릴리스나 테스트용 파일은 `docs/` 안에 넣지 마세요. 현재 게임에는 외부 CDN/API 요청이나 런타임 이미지 다운로드가 없습니다. CSS/JS/상품 SVG가 게임 HTML에 포함되어 오프라인 캐시 대상이 명확합니다.

## START_IPAD 연결 문제 및 로컬 미리보기

이 기능은 선택 사항입니다. GitHub Pages로 실행하면 PC를 켜둘 필요가 없습니다.

- START_IPAD는 Node.js가 설치되었거나 기존 Codex 런타임이 있을 때 동작합니다. 창에 에러가 없는지 확인하세요.
- 이미 8133 포트를 사용하는 이전 서버 창이 있으면 먼저 그 창을 닫으세요. 새 서버를 실행하면 `http://localhost:8133/adder-game/`를 PC에서 확인할 수 있습니다.
- iPad에서는 서버 창에 출력된 현재 LAN 주소로 접속하세요. PC와 iPad가 서로 접근 가능한 같은 LAN이어야 합니다. 게스트 와이파이, AP 격리, VPN, Windows 방화벽이 통신을 막을 수 있습니다. 방화벽 전체를 끄지 말고 필요한 경우 Node.js의 개인 네트워크 접근만 허용하세요.
- 이번 점검 때 PC의 `http://192.168.124.101:8133/`는 기존 V15로 HTTP 200을 반환했습니다. iPad에서 해당 PC로 가는 경로는 직접 점검할 수 없어 타임아웃 원인을 단정할 수 없습니다.
- **LAN HTTP 주소는 iPad PWA 오프라인 검증용이 아닙니다.** Service Worker는 보안 컨텍스트가 필요합니다. PC의 localhost는 개발 예외지만 iPad의 `http://192.168...`는 아닙니다. iPad PWA에는 GitHub Pages HTTPS를 사용하세요.

Service Worker 동작 근거: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
