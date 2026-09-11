/* ============================================================
 *  PAGE 페이지 빌더 — 에디터 기본 화면 + [데이터] 탭 데이터
 * ------------------------------------------------------------
 *  기본 화면 참고: buildertest10-shop.flexg.page /…/design/316/editor (캡처)
 *
 *  기본설정(policyData.ts)과 같은 방식 — 화면 코드와 데이터를 분리한다.
 *
 *  ※ PAGE 서비스는 디자인시스템에 컴포넌트·토큰이 아직 없다.
 *    색은 pageBuilder.tsx 맨 위 한곳(PAGE)에 모아 두고,
 *    문서에 「디자인시스템 요청 대상」으로 표시한다.
 *
 *  ※ 데이터 탭 모델 — 축이 둘이다.
 *    축1 「몇 번 찍히나」 : 요소가 반복 안이냐 밖이냐. 자동으로 정해짐 = 종속
 *    축2 「값을 어디서 가져오나」 : 상위 소스의 항목이냐 변수냐
 *    두 축을 섞어 부르지 않는다 — 「개별 바인딩」·「변수 바인딩」 같은 이름은 쓰지 않음
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

/** 요소의 성격 — 아이콘과 고를 수 있는 항목을 가른다 */
export type ElementKind = 'frame' | 'image' | 'text' | 'link' | 'product' | 'category';

/** 반복을 걸 수 있는 그룹의 기준 — 그룹마다 고를 수 있는 소스가 다르다 */
export type GroupKind = 'product' | 'category';

/**
 *  화면에 놓인 요소 하나.
 *  레이어 트리와 캔버스가 같은 목록을 쓴다 — 부모 관계를 한 곳에서만 정의하려고.
 */
export interface ElementNode {
  id: string;
  /** 요소 이름 — 레이어 줄·패널 머리·경로에 그대로 쓴다 */
  name: string;
  kind: ElementKind;
  /** 레이어 트리 들여쓰기 단 */
  depth: number;
  hasChild?: boolean;
  /** 이 요소가 든 반복 그룹. 없으면 반복 밖 = 한 번만 찍힘 */
  groupId?: string;
  /** 이 요소가 그룹이면 어느 기준의 반복인지 */
  group?: GroupKind;
  /** 레이어에만 있고 데이터를 이을 수 없는 줄(뼈대 프레임) */
  layerOnly?: boolean;
  /** 화면에서 어디에 있는지 — 고른 요소 카드에 한 줄로 적음 */
  where?: string;
  docMark?: string;
}

export const ELEMENTS: ElementNode[] = [
  { id: 'root', name: '바인딩', kind: 'frame', depth: 0, hasChild: true, layerOnly: true },
  { id: 'frame', name: '기본 프레임', kind: 'frame', depth: 1, hasChild: true, layerOnly: true },
  { id: 'title', name: '오늘의 추천 상품', kind: 'text', depth: 1, where: '섹션 제목' },

  { id: 'gProd', name: '상품 카드 그룹', kind: 'product', depth: 1, hasChild: true, group: 'product',
    where: '컨테이너 · 반복 목록', docMark: 'layer-repeat' },
  { id: 'pImg', name: '상품 이미지', kind: 'image', depth: 2, groupId: 'gProd', where: '상품 카드 > 대표 이미지' },
  { id: 'pName', name: '상품명', kind: 'text', depth: 2, groupId: 'gProd', where: '상품 카드 > 이름' },
  { id: 'pPrice', name: '판매가', kind: 'text', depth: 2, groupId: 'gProd', where: '상품 카드 > 가격' },

  { id: 'gCat', name: '카테고리 그룹', kind: 'category', depth: 1, hasChild: true, group: 'category',
    where: '컨테이너 · 카테고리 반복' },
  { id: 'cLink', name: '메뉴 링크', kind: 'link', depth: 2, groupId: 'gCat', where: '카테고리 > 메뉴 줄' },

  { id: 'sFrame', name: '단일 요소 테스트', kind: 'frame', depth: 1, hasChild: true, layerOnly: true },
  { id: 'sImg', name: '이미지 요소', kind: 'image', depth: 2, where: '반복 밖 · 낱개 자리' },
  { id: 'sText', name: '상품명 텍스트', kind: 'text', depth: 2, where: '반복 밖 · 낱개 자리' },
  { id: 'sLink', name: '상세 페이지 보기', kind: 'link', depth: 2, where: '반복 밖 · 낱개 자리' },
];

export function elementById(id: string | null): ElementNode | undefined {
  return id ? ELEMENTS.find((e) => e.id === id) : undefined;
}

/** 이 요소가 든 반복 그룹 */
export function groupOf(el: ElementNode | undefined): ElementNode | undefined {
  return el?.groupId ? ELEMENTS.find((e) => e.id === el.groupId) : undefined;
}

/** 그룹 안에 든 요소들 — 반복을 건 뒤 다음 단계로 안내할 때 쓴다 */
export function childrenOf(groupId: string): ElementNode[] {
  return ELEMENTS.filter((e) => e.groupId === groupId);
}

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

/** 단일 요소 바인딩 테스트 — 반복 묶음에 들지 않은 낱개 자리 */
export const SINGLE_AREA = {
  title: '단일 요소 바인딩 테스트',
  items: [
    { id: 'sImg', shape: 'image' as const, label: '이미지 요소', desc: '반복 밖 낱개' },
    { id: 'sText', shape: 'text' as const, label: '상품명 텍스트', desc: '반복 밖 낱개' },
    { id: 'sLink', shape: 'link' as const, label: '상세 페이지 보기', desc: '반복 밖 낱개' },
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
    '작업 창이나 레이어에서 이미지, 텍스트, 링크, 그룹 요소를 선택하세요.\n' +
    '선택한 자리가 반복 안인지 밖인지에 따라 이을 수 있는 데이터가 달라집니다.',
  /** ② 단계 — 아직 아무것도 안 골랐을 때 */
  waitingData: '요소를 선택하면 데이터 연결이 나타납니다.',
  /** 뼈대 프레임처럼 데이터를 이을 수 없는 줄을 골랐을 때 */
  notBindable:
    '이 요소는 바인딩을 지원하지 않습니다.\n' +
    '이미지 · 텍스트 · 링크 또는 그룹을 선택해 보세요.',
};

/* ── 축1 : 반복 (몇 번 찍히나) ───────────────────────────── */

export const REPEAT_NONE = '반복 데이터 사용 안 함';

/** 그룹 기준별로 고를 수 있는 반복 소스 — 상품 그룹과 카테고리 그룹이 다르다 */
export const REPEAT_SOURCES: Record<GroupKind, string[]> = {
  product: [REPEAT_NONE, '태그별 상품', '카테고리별 상품', '기본상품 목록', '배열 변수'],
  category: [REPEAT_NONE, '전체 카테고리', '대표 카테고리', '하위 카테고리'],
};

/** 반복을 고르면 몇 개가 찍히는지 — 미리보기 카드 수와 결과 예고에 함께 쓴다 */
export const REPEAT_COUNT = 3;

/** 반복 미리보기에 무엇을 그릴지 — 그룹 기준마다 다르다 */
export const REPEAT_PREVIEW: Record<GroupKind, { withImage: boolean; items: string[] }> = {
  product: { withImage: true, items: SAMPLE_PRODUCTS.map((p) => p.name) },
  category: { withImage: false, items: ['Living Room', 'Bedroom', 'Kitchen'] },
};

/* ── 축2 : 값 출처 (어디서 가져오나) ─────────────────────── */

/** 반복 소스가 가진 항목 — 소스마다 다르다. 이게 「하위 종속 항목」 */
export const SOURCE_FIELDS: Record<string, Partial<Record<ElementKind, string[]>>> = {
  '태그별 상품': {
    image: ['상품 대표 이미지', '상품 썸네일'],
    text: ['상품명', '판매가', '할인율', '태그명'],
    link: ['상품 상세 URL'],
  },
  '카테고리별 상품': {
    image: ['상품 대표 이미지', '상품 썸네일'],
    text: ['상품명', '판매가', '카테고리명'],
    link: ['상품 상세 URL'],
  },
  '기본상품 목록': {
    image: ['상품 대표 이미지'],
    text: ['상품명', '판매가', '재고 수량'],
    link: ['상품 상세 URL'],
  },
  '배열 변수': {
    image: ['목록 이미지'],
    text: ['목록 값', '목록 번호'],
    link: ['목록 링크'],
  },
  '전체 카테고리': {
    image: ['카테고리 이미지'],
    text: ['카테고리명', '상품 수'],
    link: ['카테고리 URL'],
  },
  '대표 카테고리': {
    image: ['카테고리 이미지'],
    text: ['카테고리명'],
    link: ['카테고리 URL'],
  },
  '하위 카테고리': {
    image: ['카테고리 이미지'],
    text: ['하위 카테고리명', '상품 수'],
    link: ['하위 카테고리 URL'],
  },
};

/** 반복에 매이지 않은 값 — 반복 밖 요소가 고른다 */
export const VARIABLES: Partial<Record<ElementKind, string[]>> = {
  image: ['쇼핑몰 로고', '기본 배너 이미지', '회원 프로필 이미지'],
  text: ['쇼핑몰 이름', '로그인 회원 이름', '오늘 날짜', '장바구니 수량'],
  link: ['장바구니 URL', '마이페이지 URL', '고객센터 URL'],
};

/** 고른 요소가 지금 고를 수 있는 항목 */
export function fieldsFor(kind: ElementKind, source?: string): string[] {
  if (source) return SOURCE_FIELDS[source]?.[kind] ?? [];
  return VARIABLES[kind] ?? [];
}

/** 항목 칸 위 라벨 — 무엇에 매였는지는 경로가 이미 말해 주므로 여기선 되풀이하지 않는다 */
export const FIELD_LABEL = '연결할 항목';

/** 항목을 고르기 전 안내 — 첫 항목을 미리 적어 두지 않는다 */
export const FIELD_PLACEHOLDER = '연결할 항목을 선택하세요';

/**
 *  반복 안 요소도 변수를 고를 수 있다 — 반복에서 벗어나는 게 아니라 값 출처만 다른 것.
 *  목록 안에서 두 묶음으로 갈라 보여 준다(칸을 따로 만들지 않는다).
 */
export function sourceSectionLabel(source: string): string {
  return source + '의 항목';
}
export const VAR_SECTION_LABEL = '변수 — 반복과 무관한 값';

/* ── 반환값 미리보기 ─────────────────────────────────────── */

/** 고른 항목에 실제로 무엇이 들어가는지 — 항목 이름으로 찾는다 */
export const FIELD_SAMPLE: Record<string, string> = {
  '상품명': '카라 이동식 미니 홈바',
  '판매가': '₩64,800',
  '할인율': '15%',
  '태그명': '신상품',
  '재고 수량': '12',
  '카테고리명': 'Living Room',
  '하위 카테고리명': '소파',
  '상품 수': '24개',
  '목록 값': '첫 번째 항목',
  '목록 번호': '1',
  '상품 상세 URL': '/products/mini-home-bar',
  '카테고리 URL': '/category/living-room',
  '하위 카테고리 URL': '/category/sofa',
  '목록 링크': '/list/1',
  '쇼핑몰 이름': '육마켓',
  '로그인 회원 이름': '김하은',
  '오늘 날짜': '2026-09-11',
  '장바구니 수량': '3',
  '장바구니 URL': '/cart',
  '마이페이지 URL': '/mypage',
  '고객센터 URL': '/support',
};

export const PREVIEW_LABEL = '반환값 미리보기';

/* ── 결과 예고 — 축1 × 축2 를 합쳐 한 줄로 알린다 ────────── */

export const RESULT_NOTE = {
  /** 반복 안 + 상위 소스의 항목 */
  repeat: REPEAT_COUNT + '개 항목에 각각 다른 값이 들어감',
  /** 반복 안 + 변수 — 반복은 그대로라 여전히 찍히지만 값이 안 바뀐다 */
  sameAll: REPEAT_COUNT + '개 항목에 모두 같은 값이 들어감',
  /** 반복 밖, 또는 아직 반복을 걸지 않음 */
  single: '이 자리에 한 번만 들어감',
};

/* ── 경로 — 종속을 보여 주는 한 줄 ──────────────────────── */

export const PATH_NOTE = {
  /** 경로의 상위를 눌렀을 때 무슨 일이 나는지.
   *  반복을 거는 길은 이 하나뿐 — 따로 「반복 걸기」 버튼을 두지 않는다(같은 동작이라 중복). */
  upHint: '눌러서 반복 설정으로 이동',
};

/* ── 처음 쓰는 사람을 위한 안내 ─────────────────────────── */

/**
 *  ① 앞에 두는 접히는 안내 카드.
 *  창을 띄우지 않는다 — 읽은 자리에서 곧바로 해 볼 수 있게 패널 안에 둔다.
 */
export const GUIDE = {
  title: '데이터 연결이란?',
  /**
   *  이 기능이 **무엇을 하는 일인지**만 적는다.
   *  버튼을 어떤 순서로 누르는지(동작법)는 넣지 않는다 — 그건 번호와 경로가 화면에서 직접 안내한다.
   */
  body: [
    '인터페이스(UI)요소와 실제 쇼핑몰 데이터 소스를 상호 연결하는 기능입니다.',
    '바인딩이 정상적으로 구성되면 쇼핑몰 데이터가 업데이트될 때마다 연결된 UI 요소 역시 실시간으로 자동 갱신됩니다.',
  ],
  close: '알겠습니다',
  reopen: '데이터 연결 안내 다시 보기',
};

/**
 *  경로 옆 물음표 — 일반론이 아니라 「지금 이 자리가 왜 이런지」를 답한다.
 *  「왜 항목이 이것뿐이지」라는 질문이 생기는 바로 그 자리에서 답이 나오게.
 */
export const PATH_HELP = {
  /** 그룹을 골랐을 때 */
  group:
    '이 묶음은 맨 위 자리라 매인 곳이 없음.\n' +
    '여기서 고른 반복 데이터를 묶음 안의 요소들이 따라감.',
  /** 반복이 걸린 묶음 안 요소 */
  inRepeat: (src: string) =>
    '이 자리는 위 묶음에 걸린 「' + src + '」을 따라감.\n' +
    '그래서 그 데이터가 가진 항목이 먼저 나옴.',
  /** 묶음 안이지만 아직 반복이 없을 때 */
  noRepeat:
    '위 묶음에 아직 반복이 걸려 있지 않아 매인 곳이 없음.\n' +
    '지금은 반복과 무관한 값만 나오고, 값이 한 번만 들어감.',
  /** 어느 묶음에도 들지 않은 낱개 */
  free:
    '이 자리는 어떤 묶음에도 들지 않음.\n' +
    '반복과 무관한 값을 골라 한 번만 넣음.',
};

/* ── 적용 ───────────────────────────────────────────────── */

export const APPLY_REPEAT = '반복 적용';
export const APPLY_BIND = '바인딩 적용';
export const APPLIED_MARK = '적용됨';

/* ── 표시 조건 — 선택 사항. 고른 요소 하나에 건다 ────────── */

export const DISPLAY_CONDITION = {
  addLabel: '표시 조건',
  editLabel: '조건 고치기',
  removeLabel: '조건 지우기',
  rule: '재고가 있을 때만 표시',
  /** 반복이면 몇 개에서 보이는지, 아니면 조건 문장만 */
  countRepeat: REPEAT_COUNT + '개 중 2개에서 표시',
  countSingle: '조건을 만족할 때만 표시',
};

/** 표시 조건의 더하기·고치기를 누르면 뜨는 팝업 */
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
