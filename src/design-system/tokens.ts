// FlexG Admin 디자인 토큰 — Figma 원본(node 338:947) 기준
// 콘텐츠 영역은 밝은 테마, 사이드바/상단 네비는 다크 테마.

export const colors = {
  // 공통 / 콘텐츠
  white: '#FFFFFF',
  pageBg: '#FFFFFF',
  red: '#FF2F2F', // FgRed — N 뱃지, LIVE
  green: '#29BC25', // FgGreenX — 활성 메뉴, shopId, 수수료
  blue: '#2563EB', // FgBlue — 체크박스·라디오 선택색(디자인 규칙)
  // 2026-08-26 추가 — 디자인관리 기본설정 개편(설정 목록)
  greenToggle: '#32C243', // FgGreenOn — 상태 토글 켜짐 · 알약탭 활성
  blueRadio: '#0178D4', // FgBlueSel — 설정 목록 라디오 선택 테두리
  grF1: '#F1F1F1', // FgGrF1 — 알약탭 비활성 배경
  gr99: '#999999', // FgGr99 — 알약탭 비활성 글자
  grAA: '#AAAAAA', // FgGrAA — 상태 토글 꺼짐 글자
  grD9: '#D9D9D9', // FgGrD9 — 설정 행 안 세로 구분 바
  // 그레이 스케일 (Figma 토큰명 그대로)
  gr22: '#222222',
  gr42: '#424242', // 섹션 제목, 본문 강조
  gr72: '#727272', // 본문 기본
  gr92: '#929292', // 보조 텍스트
  grB8: '#B8B8B8', // placeholder, 비활성
  grD8: '#D8D8D8', // 카드 보더
  grE8: '#E8E8E8', // 테이블 그리드 라인
  grF2: '#F2F2F2', // 활성 페이지네이션 배경
  grF8: '#F8F8F8', // 칩/헤더 셀 배경, empty 카드
  // 버튼
  bcSub: '#8F8F8F', // 초기화
  bcPoint: '#596269', // 검색
  bcDefault: '#7B858D', // 관리/생성 버튼
} as const;

export const sidebar = {
  bg: '#25282A',
  separator: '#373C3F',
  cardBg: '#353535',
  searchBg: '#191B1C',
  searchBorder: '#3B4043',
  menuActiveBg: '#3A3D3F',
  accentGreen: '#29BC25',
  accentOrange: '#FF7200',
  accentOrangeDark: '#994400',
  menuActiveText: '#29BC25',
  menuInactiveText: '#84888B',
  titleText: '#8B8F92',
  linkText: '#B8B8B8',
  labelText: '#929292',
  iconLabel: '#727272',
} as const;

export const nav = {
  bg: '#25282A',
  activeBg: '#2E3234',
  inactiveText: '#B8B8B8',
  divider: '#424242',
} as const;

// 버튼 공통 베벨 그림자
export const bevelShadow =
  'inset 2px 2px 0 rgba(255,255,255,0.15), inset -2px -2px 0 rgba(0,0,0,0.15)';

// 베너 버튼 하드 드롭섀도우
export const bannerShadow = '0px 4px 0px #000000';

export const FONT = "'Nanum Gothic', sans-serif";

// public/figma-assets 경로 헬퍼
export const asset = (name: string) => `/figma-assets/${name}`;
