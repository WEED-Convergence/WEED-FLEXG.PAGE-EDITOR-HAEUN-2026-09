/* ============================================================
 *  디자인관리 > 기본설정 — 「쇼핑몰 정책 및 기능」 설정 항목 데이터
 * ------------------------------------------------------------
 *  Figma `디자인관리_20260826` (imJJhguPyLoOYFyR93ExfR)
 *   · Admin Wireframe (전체)      1:265
 *   · Admin Wireframe (화면·노출)  1:1781
 *  「전체」 탭의 등장 순서를 원본으로 두고, 각 탭은 이 배열을 카테고리로
 *  걸러 낸 결과다(= 전체 ↔ 개별 탭의 순서가 항상 일치).
 *
 *  asIs / toBe 는 「무엇을 어떻게 조작하는지」(표현 방식)만 적는다.
 *  선택된 값은 상점마다 다르므로 기본값으로 단정하지 않는다.
 * ============================================================ */

/** 설정이 속한 카테고리 = 탭 (「전체」 제외) */
export type PolicyCat =
  | '화면·노출'
  | '상품·장바구니'
  | '구매후기'
  | '주문·결제'
  | '회원관리'
  | '정산·재고';

export const POLICY_TABS = [
  '전체',
  '화면·노출',
  '상품·장바구니',
  '구매후기',
  '주문·결제',
  '회원관리',
  '정산·재고',
] as const;

/** 개편에서 무엇이 달라졌는지의 유형 — 비교표에서 묶어 보기 위한 분류 */
export type ChangeType = '토글 분리' | '명칭 변경' | '표기 정리' | '유지';

/** 옵션 영역 표현 방식 */
export type PolicyOption =
  /** 라디오 그룹 */
  | { kind: 'radio'; items: string[]; selected: number | null }
  /** 체크박스 그룹(복수 선택) */
  | { kind: 'check'; items: string[]; checked: number[] }
  /** 라디오 + 뒤따르는 입력칸 (1:1 문의버튼) */
  | { kind: 'radio-url'; items: string[]; selected: number; value: string }
  /** 드롭다운 하나 (선물하기 기한, 비밀번호 주기 등) */
  | { kind: 'select'; label: string }
  /** 라디오 2개 중 두 번째가 [접두어][숫자][단위] 형태 (구매후기 작성 기간·조건) */
  | {
      kind: 'radio-num';
      first: string;
      prefix: string;
      value: string;
      suffix: string;
      selected: number | null;
    };

export interface PolicyItem {
  /** 설정명 — 개편에서 `기능_` 접두사를 뺀 이름 */
  name: string;
  /** 개편 전 설정명 — 접두사가 붙어 있던 원래 이름 */
  asIsName: string;
  /** 속한 탭 */
  cat: PolicyCat;
  /** 상태 토글 — null 이면 토글 없이 값만 고르는 설정 */
  toggle: 'on' | 'off' | null;
  /**
   * 상위 설정에 딸린 하위 설정(초성 인덱스에서 제외).
   * 구매후기 기능 사용에 딸린 작성 기간·작성 조건만 해당한다 —
   * 구매후기 작성 알림은 이름만 비슷할 뿐 별개 기능이라 하위가 아니다.
   */
  child?: boolean;
  option?: PolicyOption;
  /** ⓘ 도움말 — 원문 그대로 */
  help?: string;
  /** 도움말 안에서 초록으로 강조되는 링크 문구 */
  helpLinks?: string[];
  /** 놓치면 손실이 생기는 예외. 도움말 위에 빨간 문구로 붙인다 */
  warn?: string;
  /** 개편 전 조작 방식 */
  asIs: string;
  /** 개편 후 조작 방식 */
  toBe: string;
  /** 달라진 점 요약 */
  diff: string;
  changeType: ChangeType;
}

export const POLICY_ITEMS: PolicyItem[] = [
  {
    name: '1:1 문의버튼',
    asIsName: '기능_1:1문의버튼',
    cat: '회원관리',
    toggle: null,
    option: {
      kind: 'radio-url',
      items: ['게시판 연결', '상담하기 연결 (카카오톡, 상담톡)'],
      selected: 0,
      value: '',
    },
    help: 'URL은 [카카오채널 관리자 > 프로필 > 채널 정보 > 채팅 URL]으로 확인할 수 있습니다.',
    asIs: '라디오(게시판 연결 / 상담하기 연결) + URL 입력',
    toBe: '라디오(게시판 연결 / 상담하기 연결) + URL 입력',
    diff: '조작 방식은 그대로. 이름에서 접두사만 뺌.',
    changeType: '표기 정리',
  },
  {
    name: '구매후기',
    asIsName: '기능_구매후기',
    cat: '구매후기',
    toggle: 'on',
    asIs: 'ON·OFF 슬라이더',
    toBe: '사용 토글',
    diff: '작성 기간·작성 조건을 아래에 거느리는 부모 설정이 됨.',
    changeType: '표기 정리',
  },
  {
    name: '구매후기 작성 기간',
    asIsName: '기능_구매후기 작성 기간',
    cat: '구매후기',
    toggle: 'off',
    child: true,
    option: {
      kind: 'radio-num',
      first: '제한없음',
      prefix: '배송완료 후',
      value: '15',
      suffix: '일 까지 구매후기 작성 가능',
      selected: 0,
    },
    asIs: '라디오(제한없음 / 배송완료 후 N일)',
    toBe: '토글 + 라디오(제한없음 / 배송완료 후 N일)',
    diff: '기한 제한을 쓸지 말지를 토글로 빼냄. 라디오는 값만 고름. 시안 표기값 15일.',
    changeType: '토글 분리',
  },
  {
    name: '구매후기 작성 조건',
    asIsName: '기능_구매후기 작성 조건',
    cat: '구매후기',
    toggle: 'off',
    child: true,
    option: {
      kind: 'radio-num',
      first: '제한없음',
      prefix: '최소',
      value: '20',
      suffix: '자 이상 작성해야 등록 가능',
      selected: 1,
    },
    asIs: '라디오(제한없음 / N자 이상부터 작성 가능)',
    toBe: '토글 + 라디오(제한없음 / 최소 N자 이상 작성해야 등록 가능)',
    diff: '글자 수 제한을 쓸지 말지를 토글로 빼냄. 문구를 행동 기준으로 바꿈. 시안 표기값 20자.',
    changeType: '토글 분리',
  },
  {
    name: '구매후기 작성 알림',
    asIsName: '기능_구매후기 작성 알림',
    cat: '구매후기',
    toggle: 'on',
    help: '로그인을 하면 작성 가능한 구매후기가 있다고 하단 알림 팝업을 띄울 수 있습니다.',
    asIs: 'ON·OFF 슬라이더',
    toBe: '사용 토글',
    diff: '구매후기 탭에 함께 묶이되, 구매후기 기능 사용과는 별개 설정으로 둠.',
    changeType: '표기 정리',
  },
  {
    name: '다중 송장번호 사용',
    asIsName: '기능_다중 송장번호 사용',
    cat: '정산·재고',
    toggle: 'off',
    help: '하나의 주문에 여러 개의 송장번호를 등록하실 경우 이용해 주세요.',
    asIs: 'ON·OFF 슬라이더',
    toBe: '사용 토글',
    diff: '조작 방식 동일. 표기만 통일.',
    changeType: '표기 정리',
  },
  {
    name: '로그인 유도',
    asIsName: '기능_로그인 유도',
    cat: '화면·노출',
    toggle: 'off',
    option: { kind: 'radio', items: ['팝업 형태', '페이지 형태'], selected: null },
    help: '비회원 구매가 가능한 링크와 함께 로그인을 유도할 수 있습니다.',
    asIs: 'ON·OFF 슬라이더 + 라디오(팝업 형태 / 페이지 형태)',
    toBe: '토글 + 라디오(팝업 형태 / 페이지 형태)',
    diff: '구조 동일. 표기만 통일.',
    changeType: '표기 정리',
  },
  {
    name: '로그인 실패 계정 잠금',
    asIsName: '로그인 실패 계정 잠금',
    cat: '회원관리',
    toggle: 'off',
    help: '회원이 로그인 시도할 때 5회 이상 비밀번호를 잘못 입력하면 계정 접속을 차단하고 비밀번호 재설정 안내를 진행합니다.',
    asIs: 'ON·OFF 슬라이더',
    toBe: '사용 토글',
    diff: '조작 방식은 그대로. 회원 보안 정책이라 회원관리 탭에 둠.',
    changeType: '표기 정리',
  },
  {
    name: '복사 방지',
    asIsName: '기능_복사 방지',
    cat: '화면·노출',
    toggle: 'off',
    help: '이미지나 텍스트 복사를 위한 대부분의 방법을 방지할 수 있습니다.',
    asIs: 'ON·OFF 슬라이더',
    toBe: '사용 토글',
    diff: '조작 방식 동일. 표기만 통일.',
    changeType: '표기 정리',
  },
  {
    name: '비회원 상품 가격 정보 숨김',
    asIsName: '기능_비회원 상품 가격 정보 숨김',
    cat: '화면·노출',
    toggle: 'off',
    help: '해당 기능 사용 시 상품 구매 제한 조건을 회원 구매만 허용하도록 설정해 주세요.',
    asIs: 'ON·OFF 슬라이더',
    toBe: '사용 토글',
    diff: '조작 방식 동일. 표기만 통일.',
    changeType: '표기 정리',
  },
  {
    name: '비밀번호 변경 권장 주기',
    asIsName: '비밀번호 변경 권장 주기',
    cat: '회원관리',
    toggle: 'off',
    option: { kind: 'select', label: '90일' },
    help: '비밀번호 변경 권장 주기가 지난 경우, 회원이 로그인할 때 비밀번호 변경 화면으로 자동 이동합니다.',
    asIs: 'ON·OFF 슬라이더 + 드롭다운(주기)',
    toBe: '토글 + 드롭다운(주기)',
    diff: '사용 여부를 토글로 빼내 주기 값은 켰을 때만 고름. 로그인 정책과 함께 회원관리 탭에 둠.',
    changeType: '토글 분리',
  },
  {
    name: '배송지 확인 팝업',
    asIsName: '기능_배송지 확인 팝업',
    cat: '주문·결제',
    toggle: 'off',
    help: '고객이 입력한 배송지를 결제하기 전에 한번 더 확인하는 팝업을 띄울 수 있습니다.',
    asIs: 'ON·OFF 슬라이더',
    toBe: '사용 토글',
    diff: '조작 방식 동일. 표기만 통일.',
    changeType: '표기 정리',
  },
  {
    name: '상품 문의',
    asIsName: '기능_상품문의',
    cat: '상품·장바구니',
    toggle: 'on',
    asIs: 'ON·OFF 슬라이더',
    toBe: '사용 토글',
    diff: '`상품문의` → `상품 문의` 로 띄어쓰기 정리.',
    changeType: '표기 정리',
  },
  {
    name: '상품고시정보 노출',
    asIsName: '기능_상품고시정보 노출',
    cat: '화면·노출',
    toggle: 'on',
    asIs: 'ON·OFF 슬라이더',
    toBe: '사용 토글',
    diff: '조작 방식 동일. 표기만 통일.',
    changeType: '표기 정리',
  },
  {
    name: '선물하기 배송지 입력 기한',
    asIsName: '기능_선물하기 (배송지 입력 기한)',
    cat: '주문·결제',
    toggle: null,
    option: { kind: 'select', label: '+7일' },
    help: '입금확인일 기준으로 선물 받는 사람이 배송지를 입력할 수 있는 기간입니다.',
    asIs: '드롭다운(+7일) + 입금확인일 기준 문구',
    toBe: '드롭다운(기한)',
    diff: '이름 앞에 반복되던 기능_선물하기를 풀어 한 줄로 씀. 주문 단계 정책이라 주문·결제 탭에 둠.',
    changeType: '표기 정리',
  },
  {
    name: '선물하기 배송지 입력 요청 메시지',
    asIsName: '기능_선물하기 (배송지 입력 요청 메시지 발송 조건)',
    cat: '주문·결제',
    toggle: null,
    option: { kind: 'select', label: '1일 주기' },
    help: '받는 사람이 배송지를 입력하지 않은 경우, 배송지 입력을 안내하는 메시지가 이 주기로 발송됩니다.',
    asIs: '드롭다운(발송 주기)',
    toBe: '드롭다운(발송 주기)',
    diff: '배송지 입력 기한 바로 아래에 붙여 선물하기 설정을 모음.',
    changeType: '표기 정리',
  },
  {
    name: '이벤트 효과',
    asIsName: '기능_이벤트 효과',
    cat: '화면·노출',
    toggle: 'off',
    option: { kind: 'radio', items: ['벚꽃 날리기', '눈 내리기'], selected: null },
    help: '이벤트 효과로 쇼핑몰에 감성적인 분위기를 연출하실 수 있습니다.',
    asIs: '라디오(사용안함 / 벚꽃 날리기 / 눈 내리기)',
    toBe: '토글 + 라디오(벚꽃 날리기 / 눈 내리기)',
    diff: '`사용안함`을 라디오에서 빼 토글로 옮김. 라디오는 효과 종류만 고름.',
    changeType: '토글 분리',
  },
  {
    name: '장바구니',
    asIsName: '기능_장바구니',
    cat: '상품·장바구니',
    toggle: 'on',
    help: '장바구니 배송비 혜택은 묶음상품그룹 또는 회원등급에서 설정하실 수 있습니다.',
    helpLinks: ['묶음상품그룹', '회원등급'],
    asIs: 'ON·OFF 슬라이더',
    toBe: '사용 토글',
    diff: '조작 방식 동일. 표기만 통일.',
    changeType: '표기 정리',
  },
  {
    name: '장바구니 바로 담기',
    asIsName: '기능_장바구니 바로 담기',
    cat: '상품·장바구니',
    toggle: 'off',
    help: '상품 리스트에서 장바구니 바로 담기 버튼 을 노출할 수 있습니다.',
    helpLinks: ['장바구니 바로 담기 버튼'],
    asIs: 'ON·OFF 슬라이더',
    toBe: '사용 토글',
    diff: '조작 방식 동일. 표기만 통일.',
    changeType: '표기 정리',
  },
  {
    name: '정산서 생성 기준',
    asIsName: '기능_정산서 생성 기준',
    cat: '정산·재고',
    toggle: null,
    option: { kind: 'radio', items: ['발주서 생성일', '배송완료일'], selected: 0 },
    asIs: '라디오(발주서 생성일 / 배송완료일)',
    toBe: '라디오(발주서 생성일 / 배송완료일)',
    diff: '두 기준이 이미 분명해 구조를 바꾸지 않음.',
    changeType: '유지',
  },
  {
    name: '주문/결제 약관 동의 기본값',
    asIsName: '기능_주문/결제 약관 동의 기본값',
    cat: '주문·결제',
    toggle: 'on',
    help: '주문/결제 시 약관 동의는 가급적 구매자가 직접 동의를 받을 수 있도록 설정해 주세요.',
    asIs: '라디오(동의 / 동의안함)',
    toBe: '사용 토글',
    diff: '실제 판단이 「기본 체크를 넣을지」 하나라 이진 토글로 바꿈.',
    changeType: '토글 분리',
  },
  {
    name: '주문/결제 만 14세 미만 제한',
    asIsName: '기능_주문/결제 만 14세 미만 제한',
    cat: '주문·결제',
    toggle: 'off',
    help: '주문/결제 시 만 14세 미만 구매 제한을 사용하면 필수 항목으로 동의를 받을 수 있습니다.',
    asIs: '라디오(사용 / 사용안함)',
    toBe: '사용 토글',
    diff: '사용 여부만 정하는 설정이라 토글로 바꿈.',
    changeType: '토글 분리',
  },
  {
    name: '주문 취소 ⓘ 입금완료 상태까지',
    asIsName: '기능_주문 취소 ⓘ 입금완료 상태까지',
    cat: '주문·결제',
    toggle: 'on',
    option: {
      kind: 'radio',
      items: ['주문자 취소', '취소 요청 접수', '카카오톡 채널 접수'],
      selected: 0,
    },
    help: '입금완료 상태까지의 주문 취소 방식을 설정할 수 있습니다.',
    asIs: '라디오(주문자 취소 / 취소 요청접수 / 상담하기 연결 / 사용안함)',
    toBe: '토글 + 라디오(주문자 취소 / 취소 요청 접수 / 카카오톡 채널 접수)',
    diff: '취소 허용 여부를 토글로 빼고, 접수 방식만 라디오에 남김. `상담하기 연결` → `카카오톡 채널 접수`.',
    changeType: '토글 분리',
  },
  {
    name: '주문 취소 ⓘ 배송준비 상태부터',
    asIsName: '기능_주문 취소 ⓘ 배송준비 상태부터',
    cat: '주문·결제',
    toggle: 'on',
    option: { kind: 'radio', items: ['취소 요청 접수', '카카오톡 채널 접수'], selected: 0 },
    help: '배송준비 상태부터의 주문 취소 방식을 설정할 수 있습니다.',
    asIs: '라디오(취소 요청접수 / 상담하기 연결 / 사용안함)',
    toBe: '토글 + 라디오(취소 요청 접수 / 카카오톡 채널 접수)',
    diff: '취소 허용 여부를 토글로 빼고, 접수 방식만 라디오에 남김. `상담하기 연결` → `카카오톡 채널 접수`.',
    changeType: '토글 분리',
  },
  {
    name: '재고 차감 기준',
    asIsName: '기능_재고 차감 기준',
    cat: '정산·재고',
    toggle: null,
    option: { kind: 'radio', items: ['입금확인(완료) 기준', '주문 기준'], selected: 0 },
    warn: '무통장, 가상계좌 결제수단은 무조건 재고 차감됩니다.',
    help: '입금확인(완료) 기준 : 결제 또는 주문 완료시 재고 수가 차감 / 주문 기준 : 결제하기 버튼 클릭시 재고 차감',
    asIs: '라디오(결제 완료 기준 / 주문 기준) + 빨간 경고 문구',
    toBe: '라디오(입금확인(완료) 기준 / 주문 기준) + 빨간 경고 문구',
    diff: '기준 이름을 결제 완료에서 입금확인(완료)으로 바꿈. 무통장과 가상계좌 예외 경고는 손실로 이어질 수 있어 그대로 둠.',
    changeType: '명칭 변경',
  },
  {
    name: '재고옵션 품절 시 옵션값 자동 숨김',
    asIsName: '기능_재고옵션 품절시, 옵션값 자동 숨김',
    cat: '상품·장바구니',
    toggle: 'off',
    help: '상품 재고 옵션을 사용할 경우, 품절 표시를 하거나 해당 옵션값을 숨길 수 있습니다.',
    asIs: '라디오(사용 / 사용 안함)',
    toBe: '사용 토글',
    diff: '사용 여부만 정하는 설정이라 라디오를 토글로 바꿈. 상품 옵션 정책이라 상품·장바구니 탭에 둠.',
    changeType: '토글 분리',
  },
  {
    name: '취소/반품 재고 처리',
    asIsName: '기능_취소/반품 재고 처리',
    cat: '정산·재고',
    toggle: null,
    option: { kind: 'radio', items: ['재고 원복', '재고 원복 안함'], selected: 0 },
    asIs: '라디오(재고 원복 / 재고 원복 안함) + 별도 행으로 미입금 주문건 예외',
    toBe: '라디오(재고 원복 / 재고 원복 안함)',
    diff: '본 설정은 그대로. 미입금 주문건 예외 규칙이 개편 화면에 없음.',
    changeType: '유지',
  },
  {
    // 이름 앞을 짝과 맞춰, 가나다순에서 취소/반품 재고 처리 바로 뒤에 오게 한다
    name: '취소/반품 재고 처리 - 미입금',
    asIsName: '미입금 취소/반품 재고 처리',
    cat: '정산·재고',
    toggle: null,
    option: { kind: 'radio', items: ['미입금 주문건 원복', '미입금 주문건 원복 안함'], selected: 0 },
    asIs: '라디오(미입금 주문건 원복 / 원복 안함)',
    toBe: '라디오(미입금 주문건 원복 / 원복 안함)',
    diff: '조작 방식은 그대로. 이름 앞을 짝과 맞춰 가나다순에서 나란히 오게 함.',
    changeType: '명칭 변경',
  },
  {
    name: '카카오 싱크 자동 로그인',
    asIsName: '기능_카카오 싱크 자동 로그인',
    cat: '화면·노출',
    toggle: 'off',
    option: { kind: 'radio', items: ['구매하기 눌렀을 때', '상품상세 눌렀을 때'], selected: 0 },
    help: '카카오톡 내에서 상품 URL을 눌렀을 때만 적용됩니다.',
    asIs: '라디오(구매하기 눌렀을때 / 상품상세 눌렀을때 / 사용안함)',
    toBe: '토글 + 라디오(구매하기 눌렀을 때 / 상품상세 눌렀을 때)',
    diff: '`사용안함`을 라디오에서 빼 토글로 옮김.',
    changeType: '토글 분리',
  },
  {
    name: '쿠폰/포인트 동시 사용',
    asIsName: '기능_쿠폰/포인트 동시 사용',
    cat: '주문·결제',
    toggle: 'on',
    help: '상품을 주문할 때 쿠폰과 포인트의 동시 사용 여부를 설정할 수 있습니다.',
    asIs: 'ON·OFF 슬라이더',
    toBe: '사용 토글',
    diff: '조작 방식 동일. 표기만 통일.',
    changeType: '표기 정리',
  },
  {
    name: '쿠폰 여러 상품 적용',
    asIsName: '기능_쿠폰 여러 상품 적용',
    cat: '주문·결제',
    toggle: 'off',
    help: '여러 상품을 주문하는 경우 쿠폰적용 범위를 설정할 수 있습니다. (단, 상품에는 1개의 쿠폰만 사용가능)',
    asIs: 'ON·OFF 슬라이더',
    toBe: '사용 토글',
    diff: '조작 방식 동일. 표기만 통일.',
    changeType: '표기 정리',
  },
  {
    name: '탭바 노출',
    asIsName: '기능_탭바 노출',
    cat: '화면·노출',
    toggle: null,
    option: { kind: 'check', items: ['쇼핑몰 홈', '상품 리스트'], checked: [0] },
    warn: '둘 다 해제하면 탭바가 어디에도 노출되지 않습니다.',
    help: '탭바 메뉴는 하단에 고정되어 노출되는 영역입니다.',
    asIs: '체크박스(쇼핑몰 홈 / 상품 리스트)',
    toBe: '체크박스(쇼핑몰 홈 / 상품 리스트)',
    diff: '조작 방식은 그대로. 둘 다 해제하면 사실상 끈 것과 같아 안내 문구를 더함.',
    changeType: '유지',
  },
  {
    name: '회원정보 작성 알림',
    asIsName: '기능_회원정보 작성 알림',
    cat: '회원관리',
    toggle: 'on',
    help: '로그인을 하면 이름과 휴대폰 번호, 마케팅 동의(선택)를 작성하도록 하단 알림 팝업을 띄울 수 있습니다.',
    asIs: 'ON·OFF 슬라이더',
    toBe: '사용 토글',
    diff: '조작 방식 동일. 표기만 통일.',
    changeType: '표기 정리',
  },
  {
    name: '회원가입 승인 방식',
    asIsName: '기능_회원가입 승인 방식',
    cat: '회원관리',
    toggle: 'off',
    help: '관리자가 회원목록에서 승인한 회원만 회원가입을 완료할 수 있는 방식입니다.',
    helpLinks: ['회원목록'],
    asIs: 'ON·OFF 슬라이더',
    toBe: '사용 토글',
    diff: '조작 방식 동일. 표기만 통일.',
    changeType: '표기 정리',
  },
];

// ── 초성 인덱스 ──
const CHO = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];
/** 쌍자음은 홑자음 그룹으로 합침 (ㄲ→ㄱ, ㅆ→ㅅ …) */
const CHO_FOLD: Record<string, string> = { 'ㄲ': 'ㄱ', 'ㄸ': 'ㄷ', 'ㅃ': 'ㅂ', 'ㅆ': 'ㅅ', 'ㅉ': 'ㅈ' };

/** 설정명의 초성 — 한글이 아니면 `#`(숫자·영문 묶음) */
export function initialOf(name: string): string {
  const code = name.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return '#';
  const cho = CHO[Math.floor((code - 0xac00) / 588)];
  return CHO_FOLD[cho] ?? cho;
}

/**
 * 한 탭에 노출할 행 목록 — 「전체」 순서를 유지한 채 카테고리로 거름.
 * 각 행에 그 탭 안에서의 초성 뱃지를 계산해 붙인다(그룹의 첫 항목만 뱃지).
 * 하위 설정(child)은 인덱스 대상이 아니라 항상 뱃지 없음.
 */
export function rowsOfTab(tab: string): (PolicyItem & { badge?: string })[] {
  const list = tab === '전체' ? POLICY_ITEMS : POLICY_ITEMS.filter((i) => i.cat === tab);
  const seen = new Set<string>();
  return list.map((item) => {
    if (item.child) return item;
    const ini = initialOf(item.name);
    if (seen.has(ini)) return item;
    seen.add(ini);
    return { ...item, badge: ini };
  });
}

/**
 * 조작할 수 없는 상태 안내.
 * 켜고 끄는 설정이 아니라 현재 계약 상태를 알리는 문구라, 탭으로 나뉘는 설정 목록에
 * 섞지 않고 설정 영역 맨 아래에 안내줄로 따로 둔다.
 */
export const STATUS_NOTES: { name: string; value: string; why: string }[] = [
  {
    name: '유료서비스 전환',
    value: '유료서비스 전환 완료',
    why: '켜고 끌 수 있는 설정이 아니라 현재 계약 상태를 알리는 문구',
  },
];
