/* ============================================================
 *  docs 시스템 개발 : 김희연 / 2026.06.01
 * ============================================================ */
// ─────────────────────────────────────────────────────────────────────────
//  기획 문서 카탈로그 — FLEXG 어드민 · 디자인관리 > 기본설정 UI/UX 개편
//  그룹(작업 영역) → 페이지 → 하위 팝업의 트리 구조.
//  이 파일 한 곳만 채우면 좌측 트리 / 중앙 프리뷰(iframe) / 우측 설명 패널이 자동 구성된다.
// ─────────────────────────────────────────────────────────────────────────

// 설명 패널의 한 항목. mark를 주면 프리뷰 화면의 [data-doc-mark="..."] 요소 위에
// 번호 마커가 얹히고, 이 항목 옆에도 같은 번호가 붙는다(화면↔설명 1:1 매칭).
export interface DocSection {
  title: string;
  badge?: string;    // 짧은 유형 라벨(예: SEARCH · TABLE · ACTION)
  body: string;      // 기능 정의 · 규칙 · 예외 케이스(협업용). 컴포넌트명은 넣지 말 것 → components 로 분리
  mark?: string;     // 프리뷰 화면 요소의 data-doc-mark 값과 일치시키면 번호 마커로 앵커링
  context?: string;  // 탭 있는 화면에서 이 항목이 속한 탭(data-doc-tab). 탭 전환 시 해당 항목만 노출
  table?: StateTable; // 이 항목의 규칙을 표로. 줄글로 늘어놓지 말고 축이 둘 이상이면 표로 쓴다
  components?: string[]; // 이 영역에서 쓴 표준 컴포넌트명 — 본문과 분리해 「사용된 컴포넌트」로 노출
}

// 상태별(로그인 전/후 · 권한 등) 노출·동작 차이를 표로 설명 — 우측 패널에 표로 렌더.
export interface StateTable {
  caption?: string;
  headers: string[];
  rows: string[][];
}

export interface DocEntry {
  id: string;          // URL(/docs/<id>) · 코멘트/마커 키
  code?: string;       // 화면 코드(예: LIVE-P001)
  name: string;        // 화면명
  docPath?: string;    // 표시용 경로(문서상의 위치)
  route: string;       // 실제 프리뷰 라우트(iframe src)
  breadcrumb: string;  // 상단 경로 표시
  type: 'page' | 'popup';
  summary: string;     // 화면 한 줄~문단 요약
  common?: string;     // 공통 개요·전제·규칙 — 탭 무관 항상 노출(마커로 못 찍는 것). 1)/2) 로 작성
  sections: DocSection[];
  tabs?: string[];     // 탭 있는 화면이면 탭 목록(data-doc-tab 값). 프리뷰 상단 탭 칩으로 노출
  stateTable?: StateTable;
  children?: DocEntry[]; // 소속 팝업
  updatedAt?: string;  // 최근 수정일 YYYY-MM-DD
  hideDesc?: boolean;  // 우측 설명 패널을 숨김(그 자체가 문서인 개요/표지 화면용). 프리뷰가 전체 폭 차지
  status?: PageStatus; // 작업 상태 — 「작업페이지 한눈에 보기」에서 뱃지로 표기
}

// 화면(페이지) 작업 상태 — 배포 이력이 아니라 문서 작업 진행도
export type PageStatus = '작성중' | '검토중' | '확정';
export const STATUS_META: Record<PageStatus, { bg: string; fg: string }> = {
  '작성중': { bg: '#FDF0E1', fg: '#B45309' },
  '검토중': { bg: '#E7F0FF', fg: '#2563EB' },
  '확정': { bg: '#EAF8EA', fg: '#1E8F1B' },
};

export interface DocGroup {
  title: string;        // 작업 영역명(예: 개요 · 어드민 · 디자인관리)
  entries: DocEntry[];
}

export const AUTHOR = '컨버전스 김희연';
export const DOC_TITLE = 'CONVERGENCE Docs.';

// ─────────────────────────────────────────────────────────────────────────
//  화면 정의
// ─────────────────────────────────────────────────────────────────────────
export const DOC_GROUPS: DocGroup[] = [
  {
    title: '개요',
    entries: [
      {
        id: 'overview',
        name: '프로토타입 개요',
        docPath: '/overview',
        route: '/preview/overview',
        breadcrumb: '개요',
        type: 'page',
        updatedAt: '2026-08-26',
        status: '작성중',
        hideDesc: true, // 프리뷰(표지) 자체가 문서 → 우측 설명 패널 숨김
        summary:
          '기본설정의 설정 목록을 왜 어떻게 다시 구성하는지 정리한 표지. 목적, 범위, 화면 구성, 사용 흐름, As-Is 대비를 담음.',
        sections: [],
      },
    ],
  },
  {
    title: '어드민 · 디자인관리',
    entries: [
      {
        id: 'basic-settings',
        code: 'DSN-P001',
        name: '기본설정',
        docPath: '/admin/design/basic-settings',
        route: '/preview/basic-settings',
        breadcrumb: '어드민 > 디자인관리 > 기본설정',
        type: 'page',
        updatedAt: '2026-08-26',
        status: '작성중',
        summary:
          '쇼핑몰의 판매 정책과 기능을 켜고 끄는 화면. 기능을 쓸지 말지와 세부 값이 한 줄에 섞여 있던 목록을 카테고리 탭과 상태 토글로 나눠 다시 구성함.',
        common:
          '개편 대상은 페이지 맨 위 설정 영역 한 곳이고, 아래 5개 영역은 기존과 같음\n' +
          '설정 35개를 성격별 7개 탭으로 나누고, 전체 탭에서는 35개를 가나다순으로 모두 보여줌\n' +
          '설정명 앞에 붙던 기능_ 접두사를 뺌\n' +
          '**저장은 영역 단위이며 하단 변경사항 적용을 눌러야 반영됨.** 토글이나 옵션을 바꾸는 것만으로는 저장되지 않음',
        sections: [
          {
            title: '카테고리 탭',
            badge: 'TAB',
            mark: 'tabs',
            body: '설정을 성격별로 나눠 보는 탭. 진입하면 전체 탭이 열림.\n탭을 바꿔도 설정이 나열되는 순서는 전체 탭과 같음. 각 탭은 전체 탭의 순서에서 그 성격의 설정만 걸러 낸 결과임.',
            table: {
              caption: '탭 구성',
              headers: ['탭', '건수', '담는 설정'],
              rows: [
                ['전체', '35', '35개를 가나다순으로 모두'],
                ['화면·노출', '7', '쇼핑몰 화면에 무엇을 보여주고 감출지'],
                ['상품·장바구니', '4', '상품 상세와 장바구니 동작'],
                ['구매후기', '4', '후기 기능과 작성 정책'],
                ['주문·결제', '9', '주문, 결제, 취소 정책'],
                ['회원관리', '3', '가입 승인과 회원정보, 문의 창구'],
                ['보안', '3', '계정과 접근 통제. **추후 ISMS 보안설정 페이지로 분리할 예정이라 미리 갈라 둠**'],
                ['정산·재고', '5', '정산 기준과 재고 차감, 원복'],
              ],
            },
          },
          {
            title: '보안 탭을 따로 둔 이유',
            badge: 'SECURITY',
            body:
              '계정과 접근을 통제하는 설정은 성격이 달라서 회원관리에서 갈라 냈음.\n' +
              '**추후 ISMS 대응 보안설정 페이지를 따로 만들 계획이라, 그때 통째로 옮길 수 있게 미리 묶어 둠.**',
            table: {
              caption: '보안 탭 구성',
              headers: ['설정', '무엇을 막는지'],
              rows: [
                ['로그인 실패 계정 잠금', '비밀번호를 반복해서 틀리는 접근'],
                ['비밀번호 변경 권장 주기', '오래된 비밀번호를 그대로 쓰는 것'],
                ['폐쇄몰', '**로그인하지 않은 사람의 쇼핑몰 접근 자체**'],
              ],
            },
          },
          {
            title: '상태 토글',
            badge: 'TOGGLE',
            mark: 'toggle-col',
            body: '각 행 맨 왼쪽에서 그 기능을 쓸지 말지를 먼저 정함.\n개편 전 사용안함처럼 옵션 목록에 섞여 있던 사용 여부를 전부 이 토글로 옮김.',
            table: {
              caption: '상태 표기',
              headers: ['상태', '화면 표기', '동작'],
              rows: [
                ['켬', '초록 바탕에 사용', '오른쪽 옵션에서 값을 고를 수 있음'],
                ['끔', '회색 바탕에 해제', '**옵션 선택값은 지우지 않고 보관함.** 다시 켜면 이전 값으로 돌아감'],
                ['토글 없음', '자리만 비워 둠', '끌 수 없는 설정. 값만 고름'],
              ],
            },
          },
          {
            title: '초성 인덱스와 설정명',
            badge: 'INDEX',
            mark: 'index-col',
            body: '목록은 설정명 가나다순이고, 초성이 바뀌는 첫 설정에만 초성 뱃지가 붙음.',
            table: {
              caption: '뱃지 규칙',
              headers: ['경우', '표기'],
              rows: [
                ['초성 그룹의 첫 설정', '그 초성을 뱃지로 표시'],
                ['같은 그룹의 나머지', '**뱃지 없이 자리만 비움.** 설정명 시작 위치를 맞추기 위함'],
                ['쌍자음으로 시작', '홑자음 그룹에 합침 (ㄲ은 ㄱ, ㅆ은 ㅅ)'],
                ['한글로 시작하지 않음', '# 그룹'],
                ['하위 설정', '인덱스 대상이 아니므로 뱃지 없음'],
                ['탭을 바꿨을 때', '그 탭 안에서 다시 계산함'],
              ],
            },
          },
          {
            title: '옵션과 도움말',
            badge: 'OPTION',
            mark: 'option-col',
            body: '기능을 켰을 때 고르는 값을 오른쪽에 둠.\n도움말은 옵션 아래 별도 줄에 붙임. 개편 전처럼 옵션과 같은 줄에 두지 않음.',
            table: {
              caption: '옵션 표현',
              headers: ['표현', '쓰는 곳'],
              rows: [
                ['라디오', '하나만 고르는 값. 이벤트 효과, 주문 취소 방식 등'],
                ['체크박스', '여러 곳을 고르는 값. 탭바 노출'],
                ['숫자 입력', '기간이나 글자 수. 그 값을 쓰는 라디오를 골랐을 때만 유효함'],
                ['드롭다운', '기간이나 주기. 선물하기, 비밀번호 변경 권장 주기'],
                ['URL 입력', '외부 채널 주소. 1:1 문의버튼'],
                ['없음', '옵션도 도움말도 없으면 오른쪽을 비움. 상품 문의, 상품고시정보 노출'],
                ['경고 문구', '**놓치면 재고나 노출에 손실이 생기는 예외는 도움말 위에 빨간 문구로 붙임.** 재고 차감 기준, 탭바 노출'],
              ],
            },
          },
          {
            title: '하위 설정',
            badge: 'DEPTH',
            mark: 'child',
            body: '부모 설정에 딸린 세부 정책은 부모 바로 아래에 붙임.\n계층은 설정명을 들여쓰고 세로선을 그어 표시함. 하위 설정은 초성 인덱스에서 빠짐.',
            table: {
              caption: '계층 구성',
              headers: ['부모', '하위 설정', '부모를 껐을 때'],
              rows: [
                ['구매후기', '구매후기 작성 기간, 구매후기 작성 조건', '**하위를 옅게 표시하고 조작을 막음.** 값은 지우지 않고 보관'],
                ['하위가 아닌 것', '구매후기 작성 알림', '이름은 비슷하지만 후기를 쓸 수 있다고 알리는 별개 기능'],
                ['하위가 아닌 것', '취소/반품 재고 처리 - 미입금', '별개 기능이라 들여쓰지 않음. **이름 앞을 짝과 맞춰 가나다순에서 나란히 오게 함**'],
              ],
            },
          },
          {
            title: '토글 없이 값만 고르는 설정',
            badge: 'RULE',
            mark: 'no-toggle',
            body: '끌 수 없이 늘 동작하고 기준값만 고르는 설정. 토글 자리는 비워 두되 폭은 유지해 설정명 시작 위치를 맞춤.',
            table: {
              caption: '해당 설정',
              headers: ['설정', '고르는 값'],
              rows: [
                ['1:1 문의버튼', '문의를 받을 경로. 고객 소통 창구라 회원관리 탭에 둠'],
                ['정산서 생성 기준', '정산서를 만드는 기준일'],
                ['재고 차감 기준', '재고를 언제 빼는지'],
                ['취소/반품 재고 처리', '재고를 되돌릴지'],
                ['취소/반품 재고 처리 - 미입금', '미입금 건의 재고를 되돌릴지'],
                ['탭바 노출', '탭바를 띄울 위치'],
                ['선물하기 배송지 입력 기한', '배송지를 입력할 수 있는 기간'],
                ['선물하기 배송지 입력 요청 메시지', '안내 메시지 발송 주기'],
              ],
            },
          },
          {
            title: '변경사항 적용',
            badge: 'ACTION',
            mark: 'apply',
            body:
              '영역 하단 가운데 버튼으로 그 영역의 변경을 한 번에 저장함. 탭을 옮겨 다니며 바꾼 설정도 함께 저장됨.\n' +
              '**저장하지 않고 화면을 벗어나려 하면 확인 창을 띄움.** 탭만 바꾸는 것은 저장 대상이 유지되므로 확인 창을 띄우지 않음.',
          },
          {
            title: '조작할 수 없는 상태 안내',
            badge: 'INFO',
            mark: 'status-note',
            body: '켜고 끄는 설정이 아니라 현재 계약 상태를 알리는 문구.\n탭으로 나뉘는 설정 목록에 섞으면 조작할 수 있는 것처럼 읽혀서, 설정 영역 맨 아래에 안내줄로 따로 둠.',
            table: {
              caption: '해당 항목',
              headers: ['항목', '표시 내용'],
              rows: [
                ['유료서비스 전환', '유료서비스 전환 완료'],
              ],
            },
          },
          {
            title: '개편 범위 밖 영역',
            badge: 'SCOPE',
            body: '기본설정 페이지는 6개 영역으로 이뤄지고, 이번 개편 대상은 맨 위 설정 영역 하나임.\n나머지는 기존과 같아 화면에서 한 줄로 접어 뒀음.',
            table: {
              caption: '나머지 5개 영역',
              headers: ['영역', '상태'],
              rows: [
                ['쇼핑몰 정보', '기존 동일'],
                ['플로팅 액션 버튼 설정', '기존 동일'],
                ['쇼핑몰 하단 안내', '기존 동일'],
                ['회사소개', '기존 동일'],
                ['SNS 링크', '기존 동일'],
                ['토글 표기', '**기존 영역은 개편 전 토글을 그대로 써서 한 페이지에 두 가지가 섞임.** 이번 범위는 설정 영역만이며, 나머지는 다음 차수에서 맞춤'],
              ],
            },
          },
        ],
      },
    ],
  },
];

// ── 파생 헬퍼 (트리 → 평탄 목록) ──
export const ALL_ENTRIES: DocEntry[] = DOC_GROUPS.flatMap((g) =>
  g.entries.flatMap((e) => [e, ...(e.children ?? [])]),
);

export function entryById(id: string): DocEntry | undefined {
  return ALL_ENTRIES.find((e) => e.id === id);
}
export function groupTitleOf(id: string): string {
  for (const g of DOC_GROUPS) {
    for (const e of g.entries) {
      if (e.id === id || (e.children ?? []).some((c) => c.id === id)) return g.title;
    }
  }
  return DOC_GROUPS[0].title;
}
export function screenName(id: string): string {
  return entryById(id)?.name ?? id;
}

// ─────────────────────────────────────────────────────────────────────────
//  「작업페이지 한눈에 보기」 = 화면(페이지) 인덱스
//  배포 이력이 아니라, 이 프로토타입의 작업 화면을 영역(그룹)별로 모아 보는 목차.
//  데이터는 위 DOC_GROUPS 에서 파생한다(별도 목록을 두지 않음).
// ─────────────────────────────────────────────────────────────────────────

// 영역(작업 영역 = 문서 그룹) 목록 — 인덱스 영역 필터에 사용
export const AREA_COLS: string[] = DOC_GROUPS.map((g) => g.title);

// 인덱스 한 줄(화면) — 상위 페이지 + 소속 팝업
export interface IndexRow {
  entry: DocEntry;
  parent?: DocEntry; // 팝업이면 소속 페이지
}

// 영역별로 [페이지, 그 페이지의 팝업들…] 펼친 목록
export function pageRowsInArea(area: string): IndexRow[] {
  const group = DOC_GROUPS.find((g) => g.title === area);
  if (!group) return [];
  return group.entries.flatMap((e) => [
    { entry: e },
    ...(e.children ?? []).map((c) => ({ entry: c, parent: e })),
  ]);
}
