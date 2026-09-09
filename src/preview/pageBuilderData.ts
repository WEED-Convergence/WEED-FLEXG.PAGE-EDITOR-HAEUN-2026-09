/* ============================================================
 *  PAGE 페이지 빌더 — 에디터 기본 화면 + [데이터] 탭 데이터
 * ------------------------------------------------------------
 *  기본 화면 참고: buildertest10-shop.flexg.page /…/design/316/editor (캡처)
 *  데이터 탭 참고: final-data-binding-tobe.html 의 우측 영역
 *
 *  기본설정(policyData.ts)과 같은 방식 — 화면 코드와 데이터를 분리한다.
 *
 *  ※ PAGE 서비스는 디자인시스템에 컴포넌트·토큰이 아직 없다.
 *    색은 pageBuilder.tsx 맨 위 한곳(PAGE)에 모아 두고,
 *    문서에 「디자인시스템 요청 대상」으로 표시한다.
 * ============================================================ */

/* ── 헤더 ───────────────────────────────────────────────── */

export const DOC_NAME = '육마켓(복제) (복사본) _ 김하은 전달용';
export const SHOP_URL = 'https://buildertest10.flexg.shop';
export const PUBLISH_STATES = ['비공개', '공개'] as const;

/** 헤더 오른쪽 저장 상태 */
export const SAVE_STATE = {
  headline: '모든 변경 사항 저장됨',
  detail: '세션 정상 · v11 · 저장 오후 5:40',
  editorLabel: '마지막 편집자',
  editorNote: '타이틀 변경 금지.',
  avatar: '타',
};

/* ── 왼쪽 아이콘 레일 ────────────────────────────────────── */

export type RailIcon =
  | 'collapse' | 'page' | 'add' | 'library' | 'component' | 'setting' | 'font' | 'theme';

export const RAIL_TOP: { icon: RailIcon; label: string }[] = [
  { icon: 'collapse', label: '패널 접기' },
  { icon: 'page', label: '페이지' },
  { icon: 'add', label: '추가' },
  { icon: 'library', label: '라이브러리' },
  { icon: 'component', label: '컴포넌트' },
  { icon: 'setting', label: '설정' },
];

export const RAIL_BOTTOM: { icon: RailIcon; label: string }[] = [
  { icon: 'font', label: '글꼴' },
  { icon: 'theme', label: '화면 밝기' },
];

/* ── 왼쪽 패널 ───────────────────────────────────────────── */

/** 페이지 영역 위쪽 토글 3개 */
export const PANEL_TOGGLES: { label: string; on: boolean }[] = [
  { label: 'URL 표시', on: true },
  { label: '전체 페이지 표시', on: false },
  { label: '잔여 컴포넌트 정리 표시', on: false },
];

/** 커스텀 페이지 목록 */
export interface PageItem { name: string; path: string; active?: boolean }
export const CUSTOM_PAGES: PageItem[] = [
  { name: '빈 페이지', path: '/new-page' },
  { name: '바인딩', path: '/new-page-binding', active: true },
];

/** 접혀 있는 페이지 묶음 */
export const COLLAPSED_GROUPS = ['호'];

/* ── 캔버스에 놓인 요소 ──────────────────────────────────── */

/** 데이터를 이을 수 있는 요소의 성격 — 이것에 따라 우측 패널이 달라진다 */
export type ElementKind = 'image' | 'text' | 'link' | 'product' | 'category';

export const ELEMENT_KINDS: { kind: ElementKind; name: string; desc: string; repeat: boolean }[] = [
  { kind: 'image', name: '이미지', desc: '상품 카드 > 대표 이미지', repeat: false },
  { kind: 'text', name: '텍스트', desc: '상품 카드 > 상품명·가격', repeat: false },
  { kind: 'link', name: '링크', desc: '카테고리 > 메뉴 링크', repeat: false },
  { kind: 'product', name: '상품 카드 그룹', desc: '컨테이너 > 반복 목록', repeat: true },
  { kind: 'category', name: '카테고리 그룹', desc: '컨테이너 > 카테고리 반복', repeat: true },
];

/** 레이어 트리 — 캔버스에 놓인 것과 같은 것을 계층으로 보여 준다 */
export type LayerKind = 'frame' | 'text' | 'grid' | 'image' | 'link';
export interface LayerNode {
  id: string;
  name: string;
  kind: LayerKind;
  depth: number;
  hasChild?: boolean;
  /** 이 줄을 고르면 우측 패널이 다루는 요소 성격 */
  element?: ElementKind;
  docMark?: string;
}

export const LAYER_TREE: LayerNode[] = [
  { id: 'l0', name: '바인딩', kind: 'frame', depth: 0, hasChild: true },
  { id: 'l1', name: '기본 프레임', kind: 'frame', depth: 1, hasChild: true },
  { id: 'l2', name: '오늘의 추천 상품', kind: 'text', depth: 1, element: 'text' },
  { id: 'l3', name: '상품 카드 그룹', kind: 'grid', depth: 1, hasChild: true, element: 'product', docMark: 'layer-repeat' },
  { id: 'l4', name: '상품 이미지', kind: 'image', depth: 2, element: 'image' },
  { id: 'l5', name: '상품명 · 가격', kind: 'text', depth: 2, element: 'text' },
  { id: 'l6', name: '카테고리 그룹', kind: 'frame', depth: 1, hasChild: true, element: 'category' },
  { id: 'l7', name: '메뉴 링크', kind: 'link', depth: 2, element: 'link' },
];

/* ── 캔버스 ──────────────────────────────────────────────── */

/** 나란히 놓인 아트보드 — 캡처처럼 왼쪽부터 넓은 순 */
export interface Artboard { id: string; name: string; w: number; h: number }
export const ARTBOARDS: Artboard[] = [
  { id: 'a0', name: 'Desktop', w: 1440, h: 1150 },
  { id: 'a1', name: 'Tablet', w: 768, h: 1150 },
  { id: 'a2', name: 'Mobile', w: 375, h: 1150 },
];

/** 아트보드 사이 간격 */
export const ARTBOARD_GAP = 80;

/** 캔버스에 그려 둔 추천 상품 영역 */
export const SECTION_TITLE = '오늘의 추천 상품';

export const SAMPLE_PRODUCTS: { name: string; price: string }[] = [
  { name: '카라 이동식 미니 홈바', price: '₩64,800' },
  { name: '원목 거실 테이블', price: '₩129,000' },
  { name: '모듈 수납 선반', price: '₩89,000' },
];

export const CATEGORY_GROUP = {
  caption: '카테고리 그룹',
  title: 'Living Room',
  links: ['소파', '테이블'],
};

/** 단일 요소 바인딩 테스트 — 반복 묶음에 들지 않은 낱개 자리.
 *  반복 없이 개별 연결만 확인할 때 쓴다. */
export const SINGLE_AREA = {
  title: '단일 요소 바인딩 테스트',
  items: [
    { kind: 'image' as ElementKind, shape: 'image' as const, label: '이미지 요소', desc: '개별 이미지 필드' },
    { kind: 'text' as ElementKind, shape: 'text' as const, label: '상품명 텍스트', desc: '개별 텍스트 필드' },
    { kind: 'link' as ElementKind, shape: 'link' as const, label: '상세 페이지 보기', desc: '개별 URL 필드' },
  ],
};

/** 캔버스 아래 떠 있는 도구 */
export type ToolKind = 'select' | 'frame' | 'text' | 'image' | 'sticker' | 'link' | 'hand' | 'insert';
export const TOOLS: { kind: ToolKind; label: string }[] = [
  { kind: 'select', label: '고르기' },
  { kind: 'frame', label: '프레임' },
  { kind: 'text', label: '글' },
  { kind: 'image', label: '이미지' },
  { kind: 'sticker', label: '스티커' },
  { kind: 'link', label: '링크' },
  { kind: 'hand', label: '화면 옮기기' },
  { kind: 'insert', label: '올리기' },
];

/* ── 오른쪽 패널 ─────────────────────────────────────────── */

export const RIGHT_TABS = ['스타일', '애니메이션', '데이터'] as const;

/** 레이어를 고르지 않았을 때의 안내 — 스타일·애니메이션 탭이 씀 */
export const EMPTY_HINT = '편집할 레이어를 선택하세요';

/* ── [데이터] 탭 ─────────────────────────────────────────── */

export const DATA_PANEL = {
  title: '데이터 연결',
  waitingHead: '선택 대기',
  /** ① 단계 — 아직 아무것도 안 골랐을 때 */
  waitingElement:
    '작업 창에서 이미지, 텍스트, 링크, 그룹 또는 카테고리 요소를 선택하세요.\n' +
    '선택 후 해당 요소에 맞는 연결 방식과 데이터만 표시됩니다.',
  /** ② 단계 — 아직 아무것도 안 골랐을 때 */
  waitingData: '요소를 선택하면 데이터 설정이 나타납니다.',
};

/** 표시 조건 — 반복 데이터와 개별 데이터 각각의 하위 영역.
 *  탭으로 가르지 않고 그 데이터를 고르는 자리 바로 아래에 붙인다. */
export const DISPLAY_CONDITION = {
  addLabel: '표시 조건',
  editLabel: '조건 고치기',
  removeLabel: '조건 지우기',
  /** 반복 데이터에 건 조건 — 찍어 낼 것을 걸러 냄 */
  repeat: {
    rule: '품절이 아닐 때만 표시',
    count: '128개 중 112개에서 표시',
  },
  /** 개별 데이터에 건 조건 — 그 자리를 보일지 말지 */
  single: {
    rule: '재고 ≤ 1일 때만 표시',
    count: '4개 중 1개에서 표시',
  },
};

/** 반복 데이터 — 고르지 않아도 됨(선택 사항) */
export const REPEAT_NONE = '반복 데이터 사용 안 함';
export const REPEAT_SOURCES = [
  REPEAT_NONE,
  '태그별 상품',
  '카테고리별 상품',
  '기본상품 목록',
  '배열 변수',
];

/** 반복 데이터를 고르면 나오는 미리보기 카드 수 */
export const REPEAT_PREVIEW_COUNT = 3;

/** 요소 성격별로 고를 수 있는 개별 데이터 */
export const INDIVIDUAL_FIELDS: Record<ElementKind, string[]> = {
  image: ['상품 대표 이미지', '상품 썸네일', '카테고리 이미지'],
  text: ['상품명', '판매가', '상품 설명'],
  link: ['상품 상세 URL', '카테고리 URL', '외부 링크 URL'],
  category: ['카테고리명', '카테고리 URL'],
  product: ['상품 대표 이미지', '상품명', '판매가', '상품 상세 URL'],
};

/** 개별 데이터를 골랐을 때 실제로 무엇이 들어가는지 */
export interface ReturnPreview { shape: 'image' | 'text'; main: string; sub: string }
export const RETURN_PREVIEW: Record<ElementKind, ReturnPreview> = {
  image: { shape: 'image', main: '상품 대표 이미지', sub: '고른 이미지 필드가 이 자리에 들어감' },
  text: { shape: 'text', main: '카라 이동식 미니 홈바', sub: '고른 텍스트 필드의 반환 예시' },
  link: { shape: 'text', main: '/products/mini-home-bar', sub: '상세 페이지 연결 주소' },
  category: { shape: 'text', main: 'Living Room', sub: '소파 · 테이블 · TV장' },
  product: { shape: 'text', main: '카라 이동식 미니 홈바', sub: '반복으로 찍히는 첫 번째 값' },
};

/** 적용 버튼 문구 */
export const APPLY_REPEAT = '반복 데이터 적용';
export const APPLY_SINGLE = '개별 데이터 적용';

/** 표시 조건의 고치기(연필)를 누르면 뜨는 팝업 */
export const CONDITION_MODAL = {
  title: '활성 조건 설정',
  desc: '조건이 만족될 때 이 레이어의 활성 디자인 상태가 적용됩니다.',
  rowLabel: '조건',
  addLabel: '조건 추가',
  removeLabel: '조건 삭제',
  cancelLabel: '취소',
  applyLabel: '적용',
  valueLabel: '값',
  colLabels: { category: '카테고리', variable: '변수', compare: '비교' },
  /** 값을 어떻게 줄지 — 직접 적을지, 다른 항목에서 가져올지 */
  valueModes: ['직접 값', '필드'] as const,
};

/** 조건 한 줄에서 고르는 값들 */
export const COND_CATEGORIES = ['상품', '카테고리', '회원', '주문'];
export const COND_VARIABLES = ['할인 표기', '품절 여부', '재고 수량', '판매가', '등록일'];
export const COND_COMPARES = ['같음 (=)', '같지 않음 (≠)', '보다 큼 (>)', '보다 작음 (<)', '비어 있음'];
export const COND_VALUES = ['표기 함', '표기 안 함'];

/** 조건 한 줄 */
export interface CondRow {
  category: string;
  variable: string;
  compare: string;
  mode: string;
  value: string;
}

export const COND_DEFAULT: CondRow = {
  category: COND_CATEGORIES[0],
  variable: COND_VARIABLES[0],
  compare: COND_COMPARES[0],
  mode: CONDITION_MODAL.valueModes[0],
  value: COND_VALUES[0],
};
