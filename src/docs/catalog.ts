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
          '개편 대상은 페이지 맨 위 설정 영역 한 곳. 아래 5개 영역은 기존과 같음\n' +
          '기존 설정 35개를 성격별 7개 탭으로 묶고, 이름 앞에 붙던 기능_ 접두사를 뺌\n' +
          '**저장은 영역 단위. 하단 변경사항 적용을 눌러야 반영됨**',
        sections: [
          {
            title: '카테고리 탭',
            badge: 'TAB',
            mark: 'tabs',
            body: '설정을 성격별로 나눠 보는 탭. 전체 탭은 35개를 가나다순으로 모두 보여주고, 나머지 탭은 그 순서에서 해당 성격만 걸러 냄.',
            table: {
              headers: ['탭', '건수', '담는 설정'],
              rows: [
                ['전체', '35', '가나다순으로 모두'],
                ['운영 형태', '7', '회원과 비회원을 어떻게 대할지'],
                ['화면·노출', '4', '방문자 구분 없이 화면에 무엇을 그릴지'],
                ['상품·장바구니', '4', '상품 상세와 장바구니 동작'],
                ['구매후기', '4', '후기 기능과 작성 정책'],
                ['주문·결제', '9', '주문, 결제, 취소 정책'],
                ['보안', '2', '계정 보호. **추후 ISMS 보안설정 페이지로 분리 예정**'],
                ['정산·재고', '5', '정산 기준과 재고 차감, 원복'],
              ],
            },
          },
          {
            title: '상태 토글',
            badge: 'TOGGLE',
            mark: 'toggle-col',
            body:
              '기능을 쓸지 말지를 맨 왼쪽에서 먼저 정함. 켜면 사용, 끄면 해제로 표시.\n' +
              '**꺼도 옆 옵션의 선택값은 지우지 않고 보관함.**',
          },
          {
            title: '초성 인덱스와 설정명',
            badge: 'INDEX',
            mark: 'index-col',
            body:
              '가나다순으로 늘어놓고, 초성이 바뀌는 첫 설정에만 뱃지를 붙임. 나머지는 뱃지 없이 자리만 지켜 이름 시작 위치를 맞춤.\n' +
              '탭을 바꾸면 그 탭 안에서 다시 계산함.',
          },
          {
            title: '옵션과 도움말',
            badge: 'OPTION',
            mark: 'option-col',
            body:
              '기능을 켰을 때 고르는 값을 오른쪽에 두고, 도움말은 그 아래 별도 줄에 붙임.\n' +
              '**재고나 노출에 손실이 생기는 예외는 도움말 위에 빨간 문구로 알림.**',
          },
          {
            title: '하위 설정',
            badge: 'DEPTH',
            mark: 'child',
            body:
              '구매후기에 딸린 작성 기간, 작성 조건은 들여쓰기와 세로선으로 계층을 보임. 초성 인덱스에서는 빠짐.\n' +
              '**부모를 끄면 하위는 토글까지 잠김.** 값은 보관해 다시 켜면 돌아옴.',
          },
          {
            title: '토글 없이 값만 고르는 설정',
            badge: 'RULE',
            mark: 'no-toggle',
            body:
              '끌 수 없이 늘 동작하고 기준값만 고르는 설정. 토글 자리는 비워 두되 폭은 유지함. 12건.\n' +
              '**토글이 없다는 것은 반드시 기준을 정해야 한다는 뜻.** 돈, 재고, 법에 걸리는 설정이 여기 모임.',
          },
          {
            title: '이벤트 효과',
            badge: '토글 분리',
            mark: 'chg-event',
            body: '사용안함 / 벚꽃 / 눈 라디오에서 사용안함을 빼 토글로 옮김. 사용안함은 효과 종류가 아니라 끄는 뜻이라서.',
          },
          {
            title: '구매후기 작성 기간',
            badge: '토글 분리',
            mark: 'chg-review-period',
            body: '제한없음 / 배송완료 후 N일 라디오를 토글과 숫자 입력으로 나눔. 제한없음은 토글 해제와 같은 말이라 뺌.',
          },
          {
            title: '구매후기 작성 조건',
            badge: '토글 분리',
            mark: 'chg-review-length',
            body: '위와 같은 방식. 문구를 최소 N자 이상 작성해야 등록 가능으로 바꿈.',
          },
          {
            title: '비밀번호 변경 권장 주기',
            badge: '토글 분리',
            mark: 'chg-pw-cycle',
            body: '주기 값은 토글을 켰을 때만 고름. 계정 보호라 보안 탭으로 옮김.',
          },
          {
            title: '주문/결제 만 14세 미만 제한',
            badge: '토글 분리',
            mark: 'chg-age14',
            body: '사용 / 사용안함 라디오가 곧 켜고 끔이라 토글로 바꿈.',
          },
          {
            title: '재고옵션 품절 시 옵션값 자동 숨김',
            badge: '토글 분리',
            mark: 'chg-soldout-hide',
            body: '사용 / 사용 안함 라디오를 토글로 바꿈. 해제하면 품절로 표시함.',
          },
          {
            title: '주문 취소 ⓘ 입금완료 상태까지',
            badge: '명칭 변경',
            mark: 'chg-cancel-paid',
            body: '상담하기 연결을 카카오톡 채널 접수로 바꿈. 사용안함도 이 단계의 처리 방식 중 하나라 라디오에 그대로 둠.',
          },
          {
            title: '주문 취소 ⓘ 배송준비 상태부터',
            badge: '명칭 변경',
            mark: 'chg-cancel-ship',
            body: '위와 같은 이유로 이름만 바꿈.',
          },
          {
            title: '재고 차감 기준',
            badge: '명칭 변경',
            mark: 'chg-stock-base',
            body: '결제 완료 기준을 입금확인(완료) 기준으로 바꿈.\n**무통장과 가상계좌는 기준과 관계없이 차감된다는 경고는 그대로 유지함.**',
          },
          {
            title: '취소/반품 재고 처리 - 미입금',
            badge: '명칭 변경',
            mark: 'chg-restore-unpaid',
            body: '별개 기능이지만 짝으로 읽어야 해서 이름 앞을 맞춤. 가나다순에서 저절로 나란히 옴.',
          },
          {
            title: '폐쇄몰',
            badge: '신규',
            mark: 'chg-private-mall',
            body:
              '새로 넣은 설정. 첫 진입을 로그인으로 고정하고, 상품 주소를 직접 알고 들어와도 로그인으로 보냄.\n' +
              '**사용 시 비회원은 어떤 경로로도 쇼핑몰을 볼 수 없어 영향이 큼.**',
          },
          {
            title: '변경사항 적용',
            badge: 'ACTION',
            mark: 'apply',
            body: '영역 하단 버튼으로 한 번에 저장. 탭을 옮겨 다니며 바꾼 설정도 함께 저장됨.\n저장하지 않고 화면을 벗어나려 하면 확인 창을 띄움.',
          },
          {
            title: '조작할 수 없는 상태 안내',
            badge: 'INFO',
            mark: 'status-note',
            body: '유료서비스 전환은 켜고 끄는 설정이 아니라 계약 상태를 알리는 문구. 탭으로 나뉘는 목록에 섞지 않고 맨 아래 안내줄로 뒀음.',
          },
          {
            title: '개편 범위 밖 영역',
            badge: 'SCOPE',
            body:
              '쇼핑몰 정보, 플로팅 액션 버튼 설정, 쇼핑몰 하단 안내, 회사소개, SNS 링크는 기존과 같아 한 줄로 접어 뒀음.\n' +
              '**기존 영역은 개편 전 토글을 그대로 써서 한 페이지에 두 가지가 섞임.** 나머지는 다음 차수에서 맞춤.',
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
