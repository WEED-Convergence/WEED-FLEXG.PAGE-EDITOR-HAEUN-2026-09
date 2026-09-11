/* ============================================================
 *  PAGE 페이지 빌더 — 에디터 화면 프리뷰
 * ------------------------------------------------------------
 *  기본 화면 참고: buildertest10-shop.flexg.page /…/design/316/editor (캡처)
 *  데이터 탭 참고: final-data-binding-tobe.html 의 우측 영역
 *
 *  캡처의 기본 세팅값(헤더 · 레일 · 좌측 패널 · 캔버스 · 우측 패널)을
 *  그대로 옮기고, 우측 [데이터] 탭 영역을 설계했다.
 *
 *  · 데이터는 pageBuilderData.ts 로 분리
 *  · 우측 탭이 문서 탭 — docs 셸이 ?tab= 으로 활성 탭을 실어 보낸다
 *  · 캔버스 요소나 레이어 줄을 고르면 데이터 탭이 그 요소에 맞게 바뀐다
 *  · 설명과 이을 요소에 data-doc-mark, 우측 패널에 data-doc-tab
 *
 *  ※ PAGE 서비스는 디자인시스템에 컴포넌트도 토큰도 아직 없다.
 *    이 화면은 전부 임시 조립이고, 색은 아래 PAGE 한곳에 모아 뒀다.
 *    → 문서에 「디자인시스템 요청 대상」으로 표시함.
 * ============================================================ */
import { useEffect, useRef, useState } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import {
  DOC_NAME, SHOP_URL, PUBLISH_STATES, SAVE_STATE,
  RAIL_TOP, RAIL_BOTTOM, PANEL_TOGGLES, CUSTOM_PAGES, COLLAPSED_GROUPS,
  ELEMENTS, elementById, groupOf,
  ARTBOARDS, ARTBOARD_GAP, SECTION_TITLE, SAMPLE_PRODUCTS, CATEGORY_GROUP, SINGLE_AREA,
  TOOLS, RIGHT_TABS, EMPTY_HINT,
  DATA_PANEL, REPEAT_NONE, REPEAT_SOURCES, REPEAT_COUNT, REPEAT_PREVIEW,
  fieldsFor, FIELD_LABEL, FIELD_PLACEHOLDER, sourceSectionLabel, VAR_SECTION_LABEL,
  FIELD_SAMPLE, PREVIEW_LABEL, RESULT_NOTE, PATH_NOTE, GUIDE, PATH_HELP,
  APPLY_REPEAT, APPLY_BIND, APPLIED_MARK, DISPLAY_CONDITION,
  CONDITION_MODAL, COND_CATEGORIES, COND_VARIABLES, COND_COMPARES, COND_VALUES, COND_DEFAULT,
  type RailIcon, type ToolKind, type ElementKind, type ElementNode, type CondRow,
} from './pageBuilderData';

/* ────────────────────────────────────────────────────────────
 *  PAGE 서비스 임시 토큰 — 디자인시스템에 PAGE 토큰이 생기면 교체
 * ──────────────────────────────────────────────────────────── */
const PAGE = {
  accent: '#5E54F6',      // 고른 것 · 적용 강조
  accentDeep: '#4C43CE',
  accentSoft: '#F0EEFF',
  accentLine: '#DCD7FF',
  publish: '#4A5AF0',     // 배포 버튼 · 켜진 토글
  ok: '#22C55E',
  ink: '#1F2328',
  body: '#4B5563',
  sub: '#6B7280',
  faint: '#9CA3AF',
  line: '#E5E7EB',
  lineSoft: '#F1F2F4',
  canvas: '#E9EAEC',
  ph: '#DDDFE3',
  phWarm: '#E5E0D5',
  danger: '#EF4444',
} as const;

const F = "'Pretendard', system-ui, sans-serif";

/* ────────────────────────────────────────────────────────────
 *  아이콘 — 이모지 금지라 전부 SVG
 * ──────────────────────────────────────────────────────────── */

function RailGlyph({ icon, c }: { icon: RailIcon; c: string }) {
  const p = { fill: 'none', stroke: c, strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (icon) {
    case 'collapse':
      return <svg width="18" height="18" viewBox="0 0 18 18"><rect x="2.5" y="3" width="13" height="12" rx="2" {...p} /><path d="M7 3v12" {...p} /></svg>;
    case 'page':
      return <svg width="18" height="18" viewBox="0 0 18 18"><path d="M4 2.5h6l4 4v9H4z" {...p} /><path d="M6.5 9.5h5M6.5 12h3.5" {...p} /></svg>;
    case 'add':
      return <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="6.5" {...p} /><path d="M9 6v6M6 9h6" {...p} /></svg>;
    case 'library':
      return <svg width="18" height="18" viewBox="0 0 18 18"><path d="M3 4.5h4.5a1.5 1.5 0 0 1 1.5 1.5v8a1.2 1.2 0 0 0-1.2-1.2H3zM15 4.5h-4.5A1.5 1.5 0 0 0 9 6v8a1.2 1.2 0 0 1 1.2-1.2H15z" {...p} /></svg>;
    case 'component':
      return <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 2.5 15 6v6l-6 3.5L3 12V6z" {...p} /><path d="M9 9v6.5M9 9l6-3M9 9 3 6" {...p} /></svg>;
    case 'setting':
      return <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="2.4" {...p} /><path d="M9 2.2v1.6M9 14.2v1.6M2.2 9h1.6M14.2 9h1.6M4.2 4.2l1.1 1.1M12.7 12.7l1.1 1.1M13.8 4.2l-1.1 1.1M5.3 12.7l-1.1 1.1" {...p} /></svg>;
    case 'font':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18">
          <text x="1" y="12" fontFamily={F} fontSize="9" fontWeight="700" fill={c}>가</text>
          <text x="10" y="12" fontFamily={F} fontSize="8" fill={c}>A</text>
        </svg>
      );
    case 'theme':
      return <svg width="18" height="18" viewBox="0 0 18 18"><path d="M14 10.4A5.6 5.6 0 0 1 7.6 4a5.6 5.6 0 1 0 6.4 6.4Z" {...p} /></svg>;
  }
}

/** 요소 성격 아이콘 — 레이어 트리와 데이터 탭이 같이 쓴다 */
function KindGlyph({ kind, c, s = 14 }: { kind: ElementKind; c: string; s?: number }) {
  const p = { fill: 'none', stroke: c, strokeWidth: 1.3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const box = { width: s, height: s, viewBox: '0 0 14 14' };
  switch (kind) {
    case 'text':
      return <svg {...box}><path d="M3 4V3h8v1M7 3v8M5.4 11h3.2" {...p} /></svg>;
    case 'image':
      return <svg {...box}><rect x="2.5" y="3" width="9" height="8" rx="1" {...p} /><path d="M3 9.5 5.6 7 8 9.4" {...p} /><circle cx="9.2" cy="5.6" r="0.9" fill={c} stroke="none" /></svg>;
    case 'link':
      return <svg {...box}><path d="M6 8a2.2 2.2 0 0 1 0-3.1l1.4-1.4a2.2 2.2 0 1 1 3.1 3.1l-.7.7" {...p} /><path d="M8 6a2.2 2.2 0 0 1 0 3.1l-1.4 1.4a2.2 2.2 0 1 1-3.1-3.1l.7-.7" {...p} /></svg>;
    case 'product':
      return <svg {...box}><rect x="2.5" y="2.5" width="9" height="9" rx="1" {...p} /><path d="M7 2.5v9M2.5 7h9" {...p} /></svg>;
    case 'category':
      return <svg {...box}><path d="M2.5 4.2 7 1.8l4.5 2.4L7 6.6z" {...p} /><path d="M2.5 7 7 9.4 11.5 7M2.5 9.8 7 12.2l4.5-2.4" {...p} /></svg>;
    default:
      return <svg {...box}><rect x="2.5" y="2.5" width="9" height="9" rx="1" {...p} /></svg>;
  }
}

function ToolGlyph({ kind, c }: { kind: ToolKind; c: string }) {
  const p = { fill: 'none', stroke: c, strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (kind) {
    case 'select':
      return <svg width="18" height="18" viewBox="0 0 18 18"><path d="M4.5 2.5 13 9.2l-3.6.6-1.7 3.4z" {...p} /></svg>;
    case 'frame':
      return <svg width="18" height="18" viewBox="0 0 18 18"><path d="M5.5 2.5v13M12.5 2.5v13M2.5 5.5h13M2.5 12.5h13" {...p} /></svg>;
    case 'text':
      return <svg width="18" height="18" viewBox="0 0 18 18"><path d="M4 4.5V3.2h10v1.3M9 3.2v11.6M6.8 14.8h4.4" {...p} /></svg>;
    case 'image':
      return <svg width="18" height="18" viewBox="0 0 18 18"><rect x="2.5" y="3.5" width="13" height="11" rx="1.6" {...p} /><path d="M3.4 12.4 7 8.8l3.4 3.3" {...p} /><circle cx="11.6" cy="7" r="1.2" fill={c} stroke="none" /></svg>;
    case 'sticker':
      return <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="6.5" {...p} /><path d="M6.4 10.6a3.2 3.2 0 0 0 5.2 0" {...p} /><circle cx="6.9" cy="7.2" r="0.8" fill={c} stroke="none" /><circle cx="11.1" cy="7.2" r="0.8" fill={c} stroke="none" /></svg>;
    case 'link':
      return <svg width="18" height="18" viewBox="0 0 18 18"><path d="M7.6 10.4a2.8 2.8 0 0 1 0-4l1.8-1.8a2.8 2.8 0 1 1 4 4l-.9.9" {...p} /><path d="M10.4 7.6a2.8 2.8 0 0 1 0 4l-1.8 1.8a2.8 2.8 0 1 1-4-4l.9-.9" {...p} /></svg>;
    case 'hand':
      return <svg width="18" height="18" viewBox="0 0 18 18"><path d="M6 8V4.6a1.1 1.1 0 0 1 2.2 0V8m0-.6V3.9a1.1 1.1 0 1 1 2.2 0V8m0-.4V5.2a1.1 1.1 0 1 1 2.2 0V10c0 2.8-1.8 4.8-4.4 4.8-2.4 0-3.4-1.2-4.4-3L2.9 9.4A1.1 1.1 0 0 1 4.6 8L6 9.6" {...p} /></svg>;
    case 'insert':
      return <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 12.5V3.5M5.6 6.9 9 3.5l3.4 3.4M3.5 14.5h11" {...p} /></svg>;
  }
}

function Chevron({ open, c = PAGE.faint, size = 10 }: { open: boolean; c?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden
      style={{ transform: open ? 'rotate(90deg)' : undefined }}>
      <path d="M3.5 2 6.5 5l-3 3" fill="none" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCheck({ c = PAGE.accent, s = 13 }: { c?: string; s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 12 12" aria-hidden>
      <path d="M2 6.2 4.6 8.8 10 3.2" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGlobe({ c = PAGE.sub }: { c?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden>
      <circle cx="8" cy="8" r="6" fill="none" stroke={c} strokeWidth="1.3" />
      <path d="M8 2c1.8 1.7 2.6 3.8 2.6 6S9.8 12.3 8 14C6.2 12.3 5.4 10.2 5.4 8S6.2 3.7 8 2ZM2.4 8h11.2" fill="none" stroke={c} strokeWidth="1.3" />
    </svg>
  );
}

function IconInfo({ c = PAGE.faint }: { c?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      <circle cx="8" cy="8" r="6" fill="none" stroke={c} strokeWidth="1.3" />
      <path d="M8 7.2v4M8 4.9v.1" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconHistory({ c = PAGE.sub }: { c?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
      <path d="M3.4 7.4A5.9 5.9 0 1 1 3 10.4" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M2.6 4v3.4H6" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 6.2V9.3l2.1 1.3" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconPlay({ c = PAGE.body }: { c?: string }) {
  return <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden><path d="M3.5 2.4 9.4 6l-5.9 3.6z" fill="none" stroke={c} strokeWidth="1.3" strokeLinejoin="round" /></svg>;
}

function IconHome({ c = PAGE.body }: { c?: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden>
      <path d="M3 8.2 9 3.2l6 5V15H3z" fill="none" stroke={c} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M7.2 15v-4.2h3.6V15" fill="none" stroke={c} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function IconUndo({ c = PAGE.faint, flip = false }: { c?: string; flip?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden style={{ transform: flip ? 'scaleX(-1)' : undefined }}>
      <path d="M6 4.5 3 7.4l3 2.9" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 7.4h6.2a3.4 3.4 0 0 1 0 6.8H7" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconSearch({ c = PAGE.faint }: { c?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden>
      <circle cx="6.2" cy="6.2" r="4.2" fill="none" stroke={c} strokeWidth="1.3" />
      <path d="M9.4 9.4 12 12" fill="none" stroke={c} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconPlus({ c = PAGE.sub, s = 13 }: { c?: string; s?: number }) {
  return <svg width={s} height={s} viewBox="0 0 12 12" aria-hidden><path d="M6 1.6v8.8M1.6 6h8.8" stroke={c} strokeWidth="1.4" strokeLinecap="round" /></svg>;
}

function IconMinus({ c = PAGE.sub, s = 13 }: { c?: string; s?: number }) {
  return <svg width={s} height={s} viewBox="0 0 12 12" aria-hidden><path d="M1.6 6h8.8" stroke={c} strokeWidth="1.4" strokeLinecap="round" /></svg>;
}

/** 눈 가림 — 조건을 만족할 때만 보인다는 표시 */
function IconEyeOff({ c = PAGE.sub }: { c?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      <path d="M2 8s2.4-4 6-4c.7 0 1.4.2 2 .4M13.3 6.2c.5.7.7 1.2.7 1.2s-2.4 4-6 4c-.7 0-1.3-.1-1.9-.4"
        fill="none" stroke={c} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M6.6 6.6a2 2 0 0 0 2.8 2.8" fill="none" stroke={c} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M2.6 13.4 13.4 2.6" fill="none" stroke={c} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconX({ c = PAGE.sub }: { c?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden>
      <path d="M3.6 3.6 12.4 12.4M12.4 3.6 3.6 12.4" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconPencil({ c = PAGE.faint }: { c?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden>
      <path d="M9.3 2.4 11.6 4.7 5.2 11.1 2.4 11.6l.5-2.8z" fill="none" stroke={c} strokeWidth="1.2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTrash({ c = PAGE.faint }: { c?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden>
      <path d="M2.5 3.7h9M5.5 3.7V2.4h3v1.3M3.7 3.7l.5 8h5.6l.5-8" fill="none" stroke={c} strokeWidth="1.2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSort({ c = PAGE.faint }: { c?: string }) {
  return <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M2.5 4h9M2.5 7h6M2.5 10h3.5" fill="none" stroke={c} strokeWidth="1.3" strokeLinecap="round" /></svg>;
}

function IconDot({ c }: { c: string }) {
  return <svg width="7" height="7" viewBox="0 0 8 8" aria-hidden><circle cx="4" cy="4" r="4" fill={c} /></svg>;
}

function IconGrip({ c = PAGE.faint }: { c?: string }) {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden>
      <g fill={c}>
        <circle cx="3" cy="2.5" r="0.9" /><circle cx="7" cy="2.5" r="0.9" />
        <circle cx="3" cy="6" r="0.9" /><circle cx="7" cy="6" r="0.9" />
        <circle cx="3" cy="9.5" r="0.9" /><circle cx="7" cy="9.5" r="0.9" />
      </g>
    </svg>
  );
}

function IconChat({ c = PAGE.sub }: { c?: string }) {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" aria-hidden>
      <path d="M10 3.5c3.9 0 7 2.5 7 5.6s-3.1 5.6-7 5.6c-.8 0-1.6-.1-2.3-.3L4 16l.9-2.6C3.7 12.4 3 10.9 3 9.1 3 6 6.1 3.5 10 3.5Z"
        fill="none" stroke={c} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

/** 작은 물음표 — 경로 옆과 패널 머리에서 쓴다 */
function IconQuestion({ c = PAGE.faint, s = 14 }: { c?: string; s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" aria-hidden>
      <circle cx="8" cy="8" r="6.2" fill="none" stroke={c} strokeWidth="1.3" />
      <path d="M6.4 6.3a1.6 1.6 0 1 1 2 1.6c-.3.1-.5.4-.5.8v.2" fill="none" stroke={c}
        strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="7.9" cy="11.3" r="0.75" fill={c} />
    </svg>
  );
}

function IconHelp({ c = PAGE.sub }: { c?: string }) {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" aria-hidden>
      <circle cx="10" cy="10" r="7" fill="none" stroke={c} strokeWidth="1.4" />
      <path d="M8.2 8.1a1.9 1.9 0 1 1 2.4 1.9c-.4.1-.6.5-.6.9v.4" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="10" cy="13.8" r="0.8" fill={c} />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
 *  작은 조각 — 전부 이 화면 전용 임시 조립
 * ──────────────────────────────────────────────────────────── */

function Pill({ on, onClick }: { on: boolean; onClick?: () => void }) {
  return (
    <Flex as="button" onClick={onClick} w="34px" h="18px" borderRadius="9px" p="2px" flexShrink={0}
      align="center" cursor="pointer" bg={on ? PAGE.publish : '#D7DAE0'} justify={on ? 'flex-end' : 'flex-start'}>
      <Box w="14px" h="14px" borderRadius="7px" bg="white" />
    </Flex>
  );
}

function HBtn({ label, kind = 'ghost', icon }: { label: string; kind?: 'ghost' | 'line' | 'fill'; icon?: React.ReactNode }) {
  const fill = kind === 'fill';
  return (
    <Flex as="button" align="center" gap="5px" px="12px" py="6px" borderRadius="6px" cursor="pointer" flexShrink={0}
      bg={fill ? PAGE.publish : 'white'}
      border={kind === 'ghost' ? 'none' : '1px solid ' + (fill ? PAGE.publish : PAGE.line)}
      _hover={{ bg: fill ? '#3C4BD8' : PAGE.lineSoft }}>
      {icon}
      <Text fontFamily={F} fontWeight="600" fontSize="12px" color={fill ? 'white' : PAGE.body} whiteSpace="nowrap">
        {label}
      </Text>
    </Flex>
  );
}

function PanelTitle({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <Flex align="center" justify="space-between" px="14px" py="10px">
      <Text fontFamily={F} fontWeight="700" fontSize="13px" color={PAGE.ink}>{title}</Text>
      {right}
    </Flex>
  );
}

/**
 *  고르는 칸 — 데이터 탭이 값을 고를 때 쓴다.
 *  잠긴 상태(회색 비활성)는 두지 않는다 — 해당 없는 칸은 아예 그리지 않는다.
 */
function Picker({
  value, onClick, muted = false,
}: {
  value: string; onClick?: () => void; muted?: boolean;
}) {
  return (
    <Flex as="button" onClick={onClick} align="center" justify="space-between" gap="6px"
      w="100%" h="34px" px="9px" borderRadius="7px" minW="0"
      border={'1px solid ' + PAGE.line} bg="white" cursor="pointer"
      _hover={{ borderColor: PAGE.accent }}>
      <Text fontFamily={F} fontSize="12px" color={muted ? PAGE.faint : PAGE.ink}
        whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{value}</Text>
      <Box flexShrink={0} transform="rotate(90deg)">
        <Chevron open={false} c={PAGE.faint} />
      </Box>
    </Flex>
  );
}

/** 목록 한 묶음 — 갈래가 둘 이상이면 머리글을 붙여 나눈다 */
interface OptionSection { label?: string; items: readonly string[]; variable?: boolean }

/** 고를 값 목록 — Picker 를 누르면 아래에 펼쳐진다 */
function Options({
  items, sections, value, onPick,
}: {
  items?: readonly string[];
  sections?: OptionSection[];
  value: string;
  onPick: (v: string, sec?: OptionSection) => void;
}) {
  const secs: OptionSection[] = sections ?? [{ items: items ?? [] }];
  return (
    <Box border={'1px solid ' + PAGE.line} borderRadius="7px" mt="4px" py="3px" bg="white">
      {secs.map((s, si) => (
        <Box key={si}>
          {s.label && (
            <Text fontFamily={F} fontWeight="700" fontSize="10px" color={PAGE.faint}
              px="9px" pt={si > 0 ? '8px' : '4px'} pb="4px" mt={si > 0 ? '3px' : undefined}
              borderTop={si > 0 ? '1px solid ' + PAGE.lineSoft : undefined}>
              {s.label}
            </Text>
          )}
          {s.items.map((it) => {
            const on = it === value;
            return (
              <Flex as="button" key={it} onClick={() => onPick(it, s)} w="100%" align="center" gap="6px"
                px="9px" py="7px" cursor="pointer" bg={on ? PAGE.accentSoft : 'transparent'}
                _hover={{ bg: PAGE.accentSoft }}>
                <Box w="13px" flexShrink={0}>{on && <IconCheck />}</Box>
                <Text fontFamily={F} fontWeight={on ? '700' : '400'} fontSize="12px"
                  color={on ? PAGE.accentDeep : PAGE.body} textAlign="left"
                  whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{it}</Text>
              </Flex>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}

/** 라벨 붙은 고르는 칸 — 팝업 안에서 쓴다. 목록은 아래로 겹쳐 펼친다 */
function MiniSelect({
  label, value, items, onPick, flex = '1',
}: {
  label?: string; value: string; items: string[]; onPick: (v: string) => void; flex?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Box position="relative" flex={flex} minW="0">
      {label && (
        <Text fontFamily={F} fontSize="11px" color={PAGE.sub} pb="5px">{label}</Text>
      )}
      <Picker value={value} onClick={() => setOpen((v) => !v)} />
      {open && (
        <Box position="absolute" left="0" right="0" top="100%" zIndex={5}>
          <Options items={items} value={value} onPick={(v) => { onPick(v); setOpen(false); }} />
        </Box>
      )}
    </Box>
  );
}

/** 표시 조건 고치기 팝업 — 연필을 누르면 뜬다 */
function ConditionModal({
  onClose, onApply, onRemove,
}: {
  onClose: () => void; onApply: () => void; onRemove: () => void;
}) {
  const [rows, setRows] = useState<CondRow[]>([COND_DEFAULT]);
  const set = (i: number, patch: Partial<CondRow>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <Flex position="fixed" inset="0" zIndex={50} align="center" justify="center" p="20px"
      bg="rgba(0,0,0,0.38)" onMouseDown={onClose}>
      <Flex direction="column" w="min(560px, 94%)" maxH="88%" bg="white" borderRadius="12px"
        boxShadow="0 20px 60px rgba(0,0,0,0.30)" overflow="hidden"
        onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}>

        {/* 머리 */}
        <Flex align="flex-start" justify="space-between" gap="12px" px="22px" pt="20px" pb="16px"
          borderBottom={'1px solid ' + PAGE.line} flexShrink={0}>
          <Box minW="0">
            <Text fontFamily={F} fontWeight="800" fontSize="16px" color={PAGE.ink}>{CONDITION_MODAL.title}</Text>
            <Text fontFamily={F} fontSize="12px" color={PAGE.sub} pt="4px">{CONDITION_MODAL.desc}</Text>
          </Box>
          <Flex as="button" onClick={onClose} w="26px" h="26px" align="center" justify="center"
            borderRadius="6px" cursor="pointer" flexShrink={0} _hover={{ bg: PAGE.lineSoft }}>
            <IconX />
          </Flex>
        </Flex>

        {/* 본문 */}
        <Box flex="1" minH="0" overflowY="auto" px="22px" py="18px">
          {rows.map((r, i) => (
            <Box key={i} border={'1px solid ' + PAGE.line} borderRadius="10px" p="16px" mb="12px">
              <Text fontFamily={F} fontSize="11px" color={PAGE.sub} pb="10px">
                {CONDITION_MODAL.rowLabel} {i + 1}
              </Text>

              {/* 지금 만든 조건을 문장으로 되짚어 줌 */}
              <Box bg={PAGE.lineSoft} borderRadius="8px" px="14px" py="12px" mb="14px">
                <Text fontFamily={F} fontSize="11px" color={PAGE.faint}>
                  {r.category}.{r.variable}
                </Text>
                <Text fontFamily={F} fontWeight="700" fontSize="13px" color={PAGE.ink} pt="4px">
                  {r.variable} {r.compare} {r.value}
                </Text>
              </Box>

              {/* 무엇을 · 어떻게 견줄지 */}
              <Flex gap="10px" align="flex-start" pb="14px">
                <MiniSelect label={CONDITION_MODAL.colLabels.category} value={r.category}
                  items={COND_CATEGORIES} onPick={(v) => set(i, { category: v })} flex="0.85" />
                <MiniSelect label={CONDITION_MODAL.colLabels.variable} value={r.variable}
                  items={COND_VARIABLES} onPick={(v) => set(i, { variable: v })} flex="1.4" />
                <MiniSelect label={CONDITION_MODAL.colLabels.compare} value={r.compare}
                  items={COND_COMPARES} onPick={(v) => set(i, { compare: v })} flex="1" />
              </Flex>

              {/* 견줄 값 */}
              <Box border={'1px solid ' + PAGE.line} borderRadius="8px" p="12px">
                <Flex align="center" justify="space-between" gap="10px" pb="9px">
                  <Text fontFamily={F} fontSize="11px" color={PAGE.sub}>{CONDITION_MODAL.valueLabel}</Text>
                  <Flex bg={PAGE.lineSoft} borderRadius="7px" p="3px" gap="2px" flexShrink={0}>
                    {CONDITION_MODAL.valueModes.map((m) => {
                      const on = m === r.mode;
                      return (
                        <Flex as="button" key={m} onClick={() => set(i, { mode: m })} px="12px" py="5px"
                          borderRadius="5px" cursor="pointer" bg={on ? 'white' : 'transparent'}
                          boxShadow={on ? '0 1px 2px rgba(0,0,0,0.12)' : undefined}>
                          <Text fontFamily={F} fontWeight={on ? '700' : '500'} fontSize="11px"
                            color={on ? PAGE.ink : PAGE.sub} whiteSpace="nowrap">{m}</Text>
                        </Flex>
                      );
                    })}
                  </Flex>
                </Flex>
                <MiniSelect value={r.value}
                  items={r.mode === CONDITION_MODAL.valueModes[0] ? COND_VALUES : COND_VARIABLES}
                  onPick={(v) => set(i, { value: v })} />
              </Box>
            </Box>
          ))}

          {/* 줄 더하기 — 여러 줄이면 모두 만족해야 함 */}
          <Flex as="button" onClick={() => setRows((rs) => [...rs, { ...COND_DEFAULT }])}
            w="100%" align="center" justify="center" gap="6px" py="13px" borderRadius="9px"
            bg={PAGE.lineSoft} cursor="pointer" _hover={{ bg: '#E9EAEC' }}>
            <IconPlus c={PAGE.sub} s={11} />
            <Text fontFamily={F} fontSize="12px" color={PAGE.sub}>{CONDITION_MODAL.addLabel}</Text>
          </Flex>
        </Box>

        {/* 발 */}
        <Flex align="center" justify="space-between" gap="12px" px="22px" py="14px"
          borderTop={'1px solid ' + PAGE.line} flexShrink={0}>
          <Flex as="button" onClick={onRemove} px="14px" py="9px" borderRadius="7px" bg="#DC2626"
            cursor="pointer" _hover={{ bg: '#B91C1C' }}>
            <Text fontFamily={F} fontWeight="700" fontSize="12px" color="white">{CONDITION_MODAL.removeLabel}</Text>
          </Flex>
          <Flex align="center" gap="12px">
            <Flex as="button" onClick={onClose} px="8px" py="9px" cursor="pointer">
              <Text fontFamily={F} fontSize="12px" color={PAGE.sub}>{CONDITION_MODAL.cancelLabel}</Text>
            </Flex>
            <Flex as="button" onClick={onApply} px="18px" py="9px" borderRadius="7px" bg={PAGE.publish}
              cursor="pointer" _hover={{ bg: '#3C4BD8' }}>
              <Text fontFamily={F} fontWeight="700" fontSize="12px" color="white">{CONDITION_MODAL.applyLabel}</Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

/** 표시 조건 — 지금 고른 요소 하나에 건다. 선택 사항이라 기본은 걸리지 않은 상태.
 *  조건이 없으면 더하기 링크만, 걸려 있으면 조건 줄과 몇 개에서 보이는지를 보인다. */
function ConditionArea({
  rule, count, onOpen, onRemove, mark,
}: {
  rule: string | null; count: string; onOpen: () => void; onRemove: () => void; mark?: string;
}) {
  return (
    <Box data-doc-mark={mark} mt="10px" pt="10px" borderTop={'1px solid ' + PAGE.line}>
      {rule ? (
        <>
          <Flex align="center" gap="6px">
            <Box flexShrink={0}><IconEyeOff /></Box>
            <Text fontFamily={F} fontSize="11px" color={PAGE.body} flex="1" minW="0"
              whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{rule}</Text>
            <Flex as="button" w="20px" h="20px" align="center" justify="center" borderRadius="4px"
              cursor="pointer" flexShrink={0} title={DISPLAY_CONDITION.editLabel} onClick={onOpen}
              _hover={{ bg: PAGE.lineSoft }}><IconPencil /></Flex>
            <Flex as="button" w="20px" h="20px" align="center" justify="center" borderRadius="4px"
              cursor="pointer" flexShrink={0} title={DISPLAY_CONDITION.removeLabel} onClick={onRemove}
              _hover={{ bg: PAGE.lineSoft }}><IconTrash /></Flex>
          </Flex>
          <Text fontFamily={F} fontSize="10px" color={PAGE.faint} pt="3px" pl="20px">{count}</Text>
        </>
      ) : (
        <Flex as="button" onClick={onOpen} align="center" gap="5px" cursor="pointer" w="max-content"
          _hover={{ '& p': { color: PAGE.body } }}>
          <IconPlus c={PAGE.faint} s={11} />
          <Text fontFamily={F} fontSize="11px" color={PAGE.faint}>{DISPLAY_CONDITION.addLabel}</Text>
        </Flex>
      )}
    </Box>
  );
}

/** 적용 버튼 — 검은 바. 눌러야 반영되고, 반영된 뒤에는 적용됨으로 바뀐다 */
function ApplyBtn({ label, onClick, applied = false }: { label: string; onClick?: () => void; applied?: boolean }) {
  return (
    <Flex as="button" onClick={applied ? undefined : onClick} w="100%" mt="10px" py="10px" borderRadius="7px"
      align="center" justify="center" gap="5px"
      bg={applied ? PAGE.accentSoft : '#27272A'} cursor={applied ? 'default' : 'pointer'}
      _hover={applied ? undefined : { bg: '#3A3A3E' }}>
      {applied && <IconCheck c={PAGE.accentDeep} s={12} />}
      <Text fontFamily={F} fontWeight="700" fontSize="12px" color={applied ? PAGE.accentDeep : 'white'}>
        {applied ? APPLIED_MARK : label}
      </Text>
    </Flex>
  );
}

/** 종속을 보여 주는 한 줄 — 상위가 있으면 먼저 적고, 눌러 그리로 갈 수 있다.
 *  끝의 물음표는 「지금 이 자리가 왜 이런지」를 그 자리에서 답한다. */
function PathLine({ up, name, onUp, help }: { up?: string; name: string; onUp?: () => void; help?: string }) {
  const [openHelp, setOpenHelp] = useState(false);
  return (
    <Box position="relative" pb="10px">
      <Flex data-doc-mark="data-path" align="center" gap="5px" minW="0">
        {up && (
          <>
            <Flex as="button" onClick={onUp} align="center" px="7px" py="4px" borderRadius="5px" minW="0"
              bg={PAGE.accentSoft} cursor="pointer" title={PATH_NOTE.upHint} _hover={{ bg: '#E4E0FF' }}>
              <Text fontFamily={F} fontWeight="700" fontSize="11px" color={PAGE.accentDeep}
                whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{up}</Text>
            </Flex>
            <Text fontFamily={F} fontSize="11px" color={PAGE.faint} flexShrink={0}>›</Text>
          </>
        )}
        <Text fontFamily={F} fontWeight="700" fontSize="11px" color={PAGE.ink} minW="0"
          whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{name}</Text>
        {help && (
          <Flex as="button" data-doc-mark="data-path-help" onClick={() => setOpenHelp((v) => !v)}
            w="18px" h="18px" ml="1px" align="center" justify="center" borderRadius="4px" flexShrink={0}
            cursor="pointer" bg={openHelp ? PAGE.accentSoft : 'transparent'}
            title="이 자리가 왜 이런지 보기" _hover={{ bg: PAGE.lineSoft }}>
            <IconQuestion c={openHelp ? PAGE.accentDeep : PAGE.faint} s={13} />
          </Flex>
        )}
      </Flex>

      {/* 설명은 아래를 밀어내지 않고 위에 떠서 덮는다 */}
      {openHelp && help && (
        <Box position="absolute" zIndex={25} top="100%" left="0" right="0" mt="5px"
          bg="white" border={'1px solid ' + PAGE.accentLine} borderRadius="8px" p="11px"
          boxShadow="0 10px 24px rgba(40,32,90,0.18)">
          <Flex align="flex-start" justify="space-between" gap="8px">
            <Box minW="0">
              {help.split('\n').map((l, i) => (
                <Text key={i} fontFamily={F} fontSize="11px" color="#5F5A80" lineHeight="1.65">{l}</Text>
              ))}
            </Box>
            <Flex as="button" onClick={() => setOpenHelp(false)} w="18px" h="18px" align="center"
              justify="center" borderRadius="4px" cursor="pointer" flexShrink={0} title="닫기"
              _hover={{ bg: PAGE.lineSoft }}><IconX c={PAGE.faint} /></Flex>
          </Flex>
        </Box>
      )}
    </Box>
  );
}

/** 결과 예고 — 이 자리에 값이 몇 번, 어떻게 들어가는지.
 *  예상과 어긋나기 쉬운 경우(반복인데 값이 안 바뀜)는 눈에 띄게 둔다. */
function ResultNote({ text, warn = false }: { text: string; warn?: boolean }) {
  return (
    <Flex data-doc-mark="data-result" align="center" gap="5px" pt="8px"
      bg={warn ? '#FDF3E6' : undefined} borderRadius={warn ? '6px' : undefined}
      px={warn ? '8px' : undefined} py={warn ? '7px' : undefined} mt={warn ? '2px' : undefined}>
      <Box flexShrink={0}><IconInfo c={warn ? '#C07A1E' : '#8B86AE'} /></Box>
      <Text fontFamily={F} fontWeight={warn ? '700' : '400'} fontSize="11px" color={warn ? '#9A5E1C' : '#77719A'}>
        {text}
      </Text>
    </Flex>
  );
}

/** 단계 제목 — 번호 동그라미 + 글 */
function StepTitle({ n, label }: { n: number; label: string }) {
  return (
    <Flex align="center" gap="8px" pb="10px">
      <Flex w="20px" h="20px" borderRadius="10px" bg={PAGE.accent} align="center" justify="center" flexShrink={0}>
        <Text fontFamily={F} fontWeight="700" fontSize="10px" color="white">{n}</Text>
      </Flex>
      <Text fontFamily={F} fontWeight="800" fontSize="12px" color={PAGE.ink}>{label}</Text>
    </Flex>
  );
}

/** 아직 고르지 않았을 때의 점선 안내 */
function Waiting({ text }: { text: string }) {
  return (
    <Box bg="#FAF9FF" border={'1px dashed ' + PAGE.accentLine} borderRadius="7px" p="12px">
      {text.split('\n').map((l, i) => (
        <Text key={i} fontFamily={F} fontSize="11px" color="#837FA7" lineHeight="1.6">{l}</Text>
      ))}
    </Box>
  );
}

/* ────────────────────────────────────────────────────────────
 *  캔버스 — 추천 상품 영역(자리표시)
 * ──────────────────────────────────────────────────────────── */

/**
 *  고를 수 있는 자리 — 누르면 우측 데이터 탭이 그 요소로 바뀐다.
 *  같은 id 가 여러 곳에 쓰이면(반복으로 찍힌 카드 3장) 함께 표시된다 — 요소 하나가 여러 번 찍힌 것이므로.
 */
function Pickable({
  id, picked, onPick, children, ...rest
}: {
  id: string; picked: string | null; onPick: (id: string) => void;
  children: React.ReactNode; [k: string]: unknown;
}) {
  const on = picked === id;
  return (
    <Box {...rest} position="relative" cursor="pointer"
      outline={on ? '2px solid ' + PAGE.accent : '2px solid transparent'} outlineOffset="3px"
      bg={on ? '#F4F2FF' : undefined}
      _hover={{ outlineColor: on ? PAGE.accent : '#C9C4FF' }}
      onMouseDown={(e: React.MouseEvent) => { e.stopPropagation(); onPick(id); }}>
      {children}
    </Box>
  );
}

function ArtboardBody({ w, picked, onPick, marked = false }: { w: number; picked: string | null; onPick: (id: string) => void; marked?: boolean }) {
  const narrow = w < 500;
  const pad = narrow ? 16 : 28;
  const cols = narrow ? 1 : 3;

  return (
    <Box w="100%" h="100%" bg="white" p={pad + 'px'} overflow="hidden">
      {/* 섹션 제목 */}
      <Pickable id="title" picked={picked} onPick={onPick} mb="14px" w="max-content">
        <Text fontFamily={F} fontWeight="800" fontSize="17px" color={PAGE.ink}>{SECTION_TITLE}</Text>
      </Pickable>

      {/* 상품 카드 그룹 — 반복 목록. 카드 3장은 같은 요소가 세 번 찍힌 것 */}
      <Pickable id="gProd" picked={picked} onPick={onPick} maxW={narrow ? '100%' : '600px'}>
        <Box display="grid" gridTemplateColumns={'repeat(' + cols + ', 1fr)'} gap="10px">
          {SAMPLE_PRODUCTS.slice(0, narrow ? 2 : 3).map((p, i) => (
            <Box key={p.name} border={'1px solid ' + PAGE.line} borderRadius="9px" bg="white" overflow="hidden">
              <Pickable id="pImg" picked={picked} onPick={onPick}>
                <Flex h="128px" align="center" justify="center"
                  bg={['#E5E0D5', '#D5D0C8', '#E3E7E2'][i % 3]}>
                  <Text fontFamily={F} fontSize="11px" color={PAGE.sub}>상품 이미지</Text>
                </Flex>
              </Pickable>
              <Box p="10px">
                <Pickable id="pName" picked={picked} onPick={onPick}>
                  <Text fontFamily={F} fontWeight="700" fontSize="12px" color={PAGE.ink}
                    whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{p.name}</Text>
                </Pickable>
                <Pickable id="pPrice" picked={picked} onPick={onPick} mt="5px">
                  <Text fontFamily={F} fontSize="12px" color={PAGE.sub}>{p.price}</Text>
                </Pickable>
              </Box>
            </Box>
          ))}
        </Box>
      </Pickable>

      {/* 카테고리 그룹 */}
      <Pickable id="gCat" picked={picked} onPick={onPick} mt="30px" w="260px" maxW="100%">
        <Box border={'1px solid ' + PAGE.line} borderRadius="8px" p="14px">
          <Text fontFamily={F} fontSize="11px" color={PAGE.faint}>{CATEGORY_GROUP.caption}</Text>
          <Text fontFamily={F} fontWeight="700" fontSize="14px" color={PAGE.ink} py="7px">{CATEGORY_GROUP.title}</Text>
          {CATEGORY_GROUP.links.map((l) => (
            <Pickable key={l} id="cLink" picked={picked} onPick={onPick}>
              <Text fontFamily={F} fontSize="12px" color={PAGE.body} py="5px">〉 {l}</Text>
            </Pickable>
          ))}
        </Box>
      </Pickable>

      {/* 단일 요소 바인딩 테스트 — 반복 묶음 밖에 놓인 낱개 자리 */}
      <Box data-doc-mark={marked ? 'single-area' : undefined}
        mt="42px" pt="18px" borderTop={'1px solid #ECECEF'}>
        <Text fontFamily={F} fontWeight="800" fontSize="12px" color={PAGE.sub} pb="12px">
          {SINGLE_AREA.title}
        </Text>
        <Box display="grid" gridTemplateColumns={narrow ? '1fr' : 'repeat(3, 1fr)'} gap="10px"
          maxW={narrow ? '100%' : '600px'}>
          {SINGLE_AREA.items.map((it) => (
            <Pickable key={it.id} id={it.id} picked={picked} onPick={onPick}>
              <Flex minH="90px" direction="column" justify="center" gap="8px" p="14px"
                border={'1px dashed ' + (picked === it.id ? '#9E96FF' : '#CFCFD5')} borderRadius="8px"
                bg={picked === it.id ? '#F5F2FF' : '#FAFAFA'}>
                {it.shape === 'image' && (
                  <Flex h="32px" borderRadius="5px" bg="#DDD5C6" align="center" justify="center">
                    <Text fontFamily={F} fontSize="10px" color={PAGE.sub}>{it.label}</Text>
                  </Flex>
                )}
                {it.shape === 'text' && (
                  <Text fontFamily={F} fontWeight="700" fontSize="12px" color={PAGE.ink}>{it.label}</Text>
                )}
                {it.shape === 'link' && (
                  <Flex align="center" gap="4px" w="max-content" bg={PAGE.accentSoft} borderRadius="5px" px="9px" py="7px">
                    <Text fontFamily={F} fontWeight="700" fontSize="11px" color="#5148D4">{it.label}</Text>
                    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                      <path d="M3 7 7 3M3.6 3H7v3.4" fill="none" stroke="#5148D4" strokeWidth="1.4"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Flex>
                )}
                <Text fontFamily={F} fontSize="10px" color="#888">{it.desc}</Text>
              </Flex>
            </Pickable>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

/* ────────────────────────────────────────────────────────────
 *  오른쪽 [데이터] 탭 — 이번에 설계한 영역
 * ──────────────────────────────────────────────────────────── */

/**
 *  데이터 탭 — 축이 둘인 모델을 그대로 그린다.
 *
 *   축1 「몇 번 찍히나」 = 고른 요소가 반복 안이냐 밖이냐. 자동으로 정해짐 → 경로 한 줄로 보여 줌
 *   축2 「값을 어디서 가져오나」 = 상위 소스의 항목이냐 변수냐 → 고를 수 있는 항목 목록으로 드러남
 *
 *  회색으로 잠근 영역은 두지 않는다 — 지금 해당 없는 것은 아예 그리지 않는다.
 */
function DataTab({ picked, onPick }: { picked: string | null; onPick: (id: string | null) => void }) {
  /* 그룹에 적용된 반복 소스 — 적용을 눌러야 기록된다. 경로의 상위 이름이 여기서 나온다 */
  const [appliedRepeat, setAppliedRepeat] = useState<Record<string, string>>({});
  /* 고르기만 하고 아직 적용하지 않은 값 */
  const [draftRepeat, setDraftRepeat] = useState<Record<string, string>>({});
  const [openRepeat, setOpenRepeat] = useState(false);

  /* 요소에 이은 항목 — 요소마다 따로 기억한다.
     isVar = 상위 소스가 아니라 변수에서 가져온 값(반복은 그대로라 값만 안 바뀜) */
  const [bound, setBound] = useState<Record<string, string>>({});
  const [draftField, setDraftField] = useState<Record<string, { name: string; isVar: boolean }>>({});
  const [openField, setOpenField] = useState(false);

  /* 표시 조건 — 선택 사항이라 기본은 걸리지 않은 상태 */
  const [cond, setCond] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<string | null>(null);

  /* 처음 쓰는 사람을 위한 안내 카드. 실제로는 처음 한 번만 펴 두고,
     접고 나면 패널 머리의 물음표로 언제든 다시 편다 */
  const [guideOpen, setGuideOpen] = useState(true);

  const el = elementById(picked);
  const group = groupOf(el);

  /* 요소를 바꾸면 펼쳐 둔 목록만 접는다 — 고른 값은 요소마다 남는다 */
  useEffect(() => { setOpenRepeat(false); setOpenField(false); }, [picked]);

  /* ── 그룹을 골랐을 때 — 몇 번 찍을지 정하는 자리 ── */
  const renderRepeat = (g: ElementNode) => {
    const kind = g.group as 'product' | 'category';
    const applied = appliedRepeat[g.id];
    const draft = draftRepeat[g.id] ?? applied ?? REPEAT_NONE;
    const chosen = draft !== REPEAT_NONE;
    const preview = REPEAT_PREVIEW[kind];

    return (
      <>
        {/* 그룹은 꼭대기라 경로에 상위가 없다 */}
        <PathLine name={g.name} help={PATH_HELP.group} />

        <Box data-doc-mark="data-repeat">
          <Text fontFamily={F} fontSize="11px" color={PAGE.sub} pb="7px">반복 데이터</Text>
          <Picker value={draft} muted={!chosen} onClick={() => setOpenRepeat((v) => !v)} />
          {openRepeat && (
            <Options items={REPEAT_SOURCES[kind]} value={draft}
              onPick={(v) => { setDraftRepeat((r) => ({ ...r, [g.id]: v })); setOpenRepeat(false); }} />
          )}
        </Box>

        {chosen && (
          <Box data-doc-mark="data-repeat-preview" mt="8px" border={'1px solid ' + PAGE.accentLine}
            bg="#FBFAFF" borderRadius="7px" p="9px">
            <Text fontFamily={F} fontSize="10px" color="#77719A" pb="7px">반복 데이터 미리보기</Text>
            <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap="5px">
              {preview.items.slice(0, REPEAT_COUNT).map((it, i) => (
                <Box key={it} bg="white" border={'1px solid ' + PAGE.line} borderRadius="5px" overflow="hidden">
                  {preview.withImage && (
                    <Flex h="38px" align="center" justify="center" bg={['#E5DFD4', '#D5D0C8', '#E2E7E1'][i % 3]}>
                      <Text fontFamily={F} fontSize="9px" color={PAGE.sub}>이미지</Text>
                    </Flex>
                  )}
                  <Text fontFamily={F} fontSize="9px" color={PAGE.body} p="5px"
                    whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{it}</Text>
                </Box>
              ))}
            </Box>
            <ResultNote text={RESULT_NOTE.repeat} />
          </Box>
        )}

        <ApplyBtn label={APPLY_REPEAT} applied={applied === draft}
          onClick={() => setAppliedRepeat((r) => ({ ...r, [g.id]: draft }))} />

        <ConditionArea mark="data-condition"
          rule={cond[g.id] ? DISPLAY_CONDITION.rule : null}
          count={DISPLAY_CONDITION.countRepeat}
          onOpen={() => setEditing(g.id)}
          onRemove={() => setCond((c) => ({ ...c, [g.id]: false }))} />
      </>
    );
  };

  /* ── 낱개 요소를 골랐을 때 — 무슨 값을 넣을지 정하는 자리 ── */
  const renderField = (e: ElementNode) => {
    const src = group ? appliedRepeat[group.id] : undefined;
    const inRepeat = !!src && src !== REPEAT_NONE;

    /* 반복 안이면 상위 소스의 항목과 변수를 한 목록에 두 묶음으로 나눠 보여 준다.
       반복 밖이면 고를 수 있는 것이 변수뿐이라 묶음을 나누지 않는다. */
    const sections: OptionSection[] = inRepeat
      ? [
          { label: sourceSectionLabel(src as string), items: fieldsFor(e.kind, src) },
          { label: VAR_SECTION_LABEL, items: fieldsFor(e.kind), variable: true },
        ]
      : [{ items: fieldsFor(e.kind) }];

    const pick = draftField[e.id];
    const cur = pick?.name;
    const isVar = !!pick?.isVar;
    const applied = bound[e.id];
    const sample = cur ? (FIELD_SAMPLE[cur] ?? cur) : '';
    /* 반복인데 값이 안 바뀌는 경우는 예상과 어긋나기 쉬워 눈에 띄게 알린다 */
    const warn = inRepeat && isVar;
    const resultText = !inRepeat ? RESULT_NOTE.single : isVar ? RESULT_NOTE.sameAll : RESULT_NOTE.repeat;

    return (
      <>
        {/* 경로 — 상위가 있으면 먼저 적는다. 이 한 줄이 종속이다 */}
        <PathLine up={inRepeat ? src : group?.name} name={e.name}
          onUp={group ? () => onPick(group.id) : undefined}
          help={inRepeat ? PATH_HELP.inRepeat(src as string) : group ? PATH_HELP.noRepeat : PATH_HELP.free} />

        <Box data-doc-mark="data-field">
          <Text fontFamily={F} fontSize="11px" color={PAGE.sub} pb="7px">{FIELD_LABEL}</Text>
          <Picker value={cur ?? FIELD_PLACEHOLDER} muted={!cur} onClick={() => setOpenField((v) => !v)} />
          {openField && (
            <Options sections={sections} value={cur ?? ''}
              onPick={(v, sec) => {
                setDraftField((f) => ({ ...f, [e.id]: { name: v, isVar: !!sec?.variable } }));
                setOpenField(false);
              }} />
          )}
        </Box>

        {/* 고른 항목에 실제로 무엇이 들어가는지 */}
        {cur && (
          <Box data-doc-mark="data-field-preview" mt="8px" border={'1px solid ' + PAGE.accentLine}
            bg="#FBFAFF" borderRadius="7px" p="9px">
            <Text fontFamily={F} fontSize="10px" color="#77719A" pb="7px">{PREVIEW_LABEL}</Text>
            {e.kind === 'image' ? (
              <Flex h="72px" borderRadius="6px" bg="#DED5C6" align="center" justify="center">
                <Text fontFamily={F} fontSize="10px" color={PAGE.sub}>{cur}</Text>
              </Flex>
            ) : (
              <Box bg="white" border={'1px solid ' + PAGE.line} borderRadius="6px" p="9px">
                <Text fontFamily={F} fontWeight="700" fontSize="12px" color={PAGE.ink}>{sample}</Text>
                <Text fontFamily={F} fontSize="10px" color={PAGE.sub} pt="4px">{cur}</Text>
              </Box>
            )}
            <ResultNote text={resultText} warn={warn} />
          </Box>
        )}

        {cur && (
          <ApplyBtn label={APPLY_BIND} applied={applied === cur}
            onClick={() => setBound((b) => ({ ...b, [e.id]: cur }))} />
        )}

        <ConditionArea mark="data-condition"
          rule={cond[e.id] ? DISPLAY_CONDITION.rule : null}
          count={inRepeat ? DISPLAY_CONDITION.countRepeat : DISPLAY_CONDITION.countSingle}
          onOpen={() => setEditing(e.id)}
          onRemove={() => setCond((c) => ({ ...c, [e.id]: false }))} />
      </>
    );
  };

  return (
    <>
      {/* 패널 머리 — 안내를 접어 두면 여기 물음표로 다시 편다 */}
      <Flex data-doc-mark="data-head" align="flex-start" justify="space-between" gap="8px"
        px="16px" py="12px" borderBottom={'1px solid ' + PAGE.line}>
        <Box minW="0">
          <Text fontFamily={F} fontWeight="700" fontSize="14px" color={PAGE.ink}>{DATA_PANEL.title}</Text>
          <Text fontFamily={F} fontSize="11px" color={PAGE.faint} pt="3px">
            {el ? el.name : DATA_PANEL.waitingHead}
          </Text>
        </Box>
        {!guideOpen && (
          <Flex as="button" onClick={() => setGuideOpen(true)} w="24px" h="24px" align="center" justify="center"
            borderRadius="6px" cursor="pointer" flexShrink={0} title={GUIDE.reopen}
            _hover={{ bg: PAGE.lineSoft }}>
            <IconQuestion c={PAGE.faint} s={15} />
          </Flex>
        )}
      </Flex>

      {/* 처음 쓰는 사람을 위한 안내 — 패널 위에 떠서 덮는다(자리를 밀지 않음) */}
      <Box position="relative">
      {guideOpen && (
        <Box data-doc-mark="data-guide" position="absolute" zIndex={30} top="10px" left="16px" right="16px"
          p="13px" borderRadius="10px" bg="white" border={'1px solid ' + PAGE.accentLine}
          boxShadow="0 12px 30px rgba(40,32,90,0.22)">
          <Flex align="center" justify="space-between" gap="8px" pb="9px">
            <Text fontFamily={F} fontWeight="700" fontSize="11.5px" color={PAGE.accentDeep}>
              {GUIDE.title}
            </Text>
            <Flex as="button" onClick={() => setGuideOpen(false)} w="18px" h="18px" align="center"
              justify="center" borderRadius="4px" cursor="pointer" flexShrink={0} title="접기"
              _hover={{ bg: '#E4E0FF' }}><IconX c={PAGE.accentDeep} /></Flex>
          </Flex>

          {GUIDE.body.map((p) => (
            <Text key={p} fontFamily={F} fontSize="11.5px" color="#5F5A80" lineHeight="1.7" pb="9px">
              {p}
            </Text>
          ))}

          <Flex as="button" onClick={() => setGuideOpen(false)} w="100%" mt="5px" py="7px"
            align="center" justify="center" borderRadius="6px" bg="white"
            border={'1px solid ' + PAGE.accentLine} cursor="pointer" _hover={{ bg: '#FBFAFF' }}>
            <Text fontFamily={F} fontWeight="700" fontSize="11px" color={PAGE.accentDeep}>{GUIDE.close}</Text>
          </Flex>
        </Box>
      )}
      </Box>

      {/* ① 선택 요소 — 고른 것 한 줄 */}
      <Box data-doc-mark="data-step1" px="16px" py="14px" borderBottom={'1px solid ' + PAGE.line}>
        <StepTitle n={1} label="선택 요소" />
        {!el ? (
          <Waiting text={DATA_PANEL.waitingElement} />
        ) : (
          <Flex align="center" gap="9px" p="9px" borderRadius="7px" bg={PAGE.accentSoft}>
            <KindGlyph kind={el.kind} c={PAGE.accentDeep} s={15} />
            <Box flex="1" minW="0">
              <Text fontFamily={F} fontWeight="700" fontSize="12px" color={PAGE.accentDeep}>{el.name}</Text>
              {el.where && (
                <Text fontFamily={F} fontSize="10px" color="#8B86AE"
                  whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{el.where}</Text>
              )}
            </Box>
            <Flex as="button" onClick={() => onPick(null)} w="20px" h="20px" align="center" justify="center"
              borderRadius="4px" cursor="pointer" flexShrink={0} title="선택 해제"
              _hover={{ bg: '#E4E0FF' }}><IconX c={PAGE.accentDeep} /></Flex>
          </Flex>
        )}
      </Box>

      {/* ② 데이터 연결 */}
      <Box data-doc-mark="data-step2" px="16px" py="14px">
        <StepTitle n={2} label="데이터 연결" />
        {!el ? <Waiting text={DATA_PANEL.waitingData} />
          : el.layerOnly ? <Waiting text={DATA_PANEL.notBindable} />
          : el.group ? renderRepeat(el)
          : renderField(el)}
      </Box>

      {/* 표시 조건 설정 팝업 — 새로 걸 때도 고칠 때도 같은 창 */}
      {editing && (
        <ConditionModal
          onClose={() => setEditing(null)}
          onApply={() => { setCond((c) => ({ ...c, [editing]: true })); setEditing(null); }}
          onRemove={() => { setCond((c) => ({ ...c, [editing]: false })); setEditing(null); }}
        />
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────────
 *  화면
 * ──────────────────────────────────────────────────────────── */

export function PageBuilder() {
  // docs 셸이 iframe 을 열 때 ?tab=활성탭 을 실어 보낸다
  const initialTab = new URLSearchParams(window.location.search).get('tab');
  const [tab, setTab] = useState(
    initialTab && (RIGHT_TABS as readonly string[]).includes(initialTab) ? initialTab : RIGHT_TABS[0],
  );

  const [publish, setPublish] = useState<string>(PUBLISH_STATES[0]);
  const [toggles, setToggles] = useState(PANEL_TOGGLES.map((t) => t.on));
  const [pageIdx, setPageIdx] = useState(CUSTOM_PAGES.findIndex((p) => p.active));
  const [tool, setTool] = useState<ToolKind>('select');
  // 펼쳐 둔 레이어 — 접으면 그 아래가 감춰진다
  const [openLayers, setOpenLayers] = useState<string[]>(['root', 'frame', 'gProd', 'gCat', 'sFrame']);

  // 작업 창에서 고른 요소 — 데이터 탭이 이 값에 따라 바뀐다
  const [picked, setPicked] = useState<string | null>(null);

  const [zoom, setZoom] = useState(0.66);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState<{ sx: number; sy: number; px: number; py: number } | null>(null);
  const viewRef = useRef<HTMLDivElement | null>(null);

  // 아트보드 가로 자리 — 왼쪽부터 간격을 두고 늘어놓는다
  const lefts: number[] = [];
  let ax = 0;
  for (const a of ARTBOARDS) { lefts.push(ax); ax += a.w + ARTBOARD_GAP; }

  // 처음 열 때 캡처처럼 Tablet 이 왼쪽에 걸리게 맞춘다(Desktop 은 잘려 보임)
  useEffect(() => {
    setPan({ x: 30 - lefts[1] * zoom, y: 46 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 요소를 고르면 데이터 탭으로 넘어간다 — 고친 결과를 바로 보게
  const pickElement = (id: string | null) => {
    setPicked(id);
    if (id) setTab('데이터');
  };

  const zoomBy = (f: number) => {
    const r = viewRef.current?.getBoundingClientRect();
    const cx = r ? r.width / 2 : 0;
    const cy = r ? r.height / 2 : 0;
    setZoom((z) => {
      const nz = Math.min(3, Math.max(0.1, z * f));
      setPan((p) => ({ x: cx - (cx - p.x) * (nz / z), y: cy - (cy - p.y) * (nz / z) }));
      return nz;
    });
  };

  useEffect(() => {
    if (!panning) return;
    const move = (e: MouseEvent) =>
      setPan({ x: panning.px + (e.clientX - panning.sx), y: panning.py + (e.clientY - panning.sy) });
    const up = () => setPanning(null);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [panning]);

  const toggleLayer = (id: string) =>
    setOpenLayers((o) => (o.includes(id) ? o.filter((v) => v !== id) : [...o, id]));

  // 접은 줄의 아래는 감춘다 — 화살표가 실제로 접히게
  const visibleLayers: ElementNode[] = [];
  let hideUnder: number | null = null;
  for (const e of ELEMENTS) {
    if (hideUnder !== null && e.depth > hideUnder) continue;
    hideUnder = null;
    visibleLayers.push(e);
    if (e.hasChild && !openLayers.includes(e.id)) hideUnder = e.depth;
  }

  return (
    <Flex direction="column" h="100dvh" bg="white" overflow="hidden" userSelect="none" minW="1280px">

      {/* ═══ 헤더 ═══ */}
      <Flex data-doc-mark="header" align="center" justify="space-between" gap="16px"
        h="56px" flexShrink={0} px="14px" borderBottom={'1px solid ' + PAGE.line} bg="white">

        <Flex align="center" gap="10px" minW="0" flex="1">
          <Flex as="button" w="30px" h="30px" align="center" justify="center" borderRadius="6px"
            cursor="pointer" _hover={{ bg: PAGE.lineSoft }}><IconHome /></Flex>
          <Flex align="center" gap="6px" flexShrink={0}>
            <Flex w="22px" h="22px" borderRadius="6px" bg={PAGE.publish} align="center" justify="center">
              <Text fontFamily={F} fontWeight="800" fontSize="13px" color="white">P</Text>
            </Flex>
            <Text fontFamily={F} fontWeight="800" fontSize="15px" color={PAGE.ink}>Page.</Text>
          </Flex>
          <Box w="1px" h="18px" bg={PAGE.line} flexShrink={0} />
          <Text fontFamily={F} fontWeight="600" fontSize="13px" color={PAGE.body} minW="0"
            whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{DOC_NAME}</Text>
        </Flex>

        <Flex data-doc-mark="header-url" align="center" gap="8px" flexShrink={0}
          border={'1px solid ' + PAGE.line} borderRadius="8px" pl="8px" pr="4px" py="4px" bg="white">
          <Flex bg={PAGE.ink} borderRadius="4px" px="7px" py="3px" flexShrink={0}>
            <Text fontFamily={F} fontWeight="800" fontSize="10px" letterSpacing="0.4px" color="white">FLEXG</Text>
          </Flex>
          <Box w="1px" h="14px" bg={PAGE.line} />
          <IconGlobe />
          <Text fontFamily={F} fontSize="12px" color={PAGE.body} whiteSpace="nowrap">{SHOP_URL}</Text>
          <Flex gap="2px" bg={PAGE.lineSoft} borderRadius="6px" p="2px">
            {PUBLISH_STATES.map((s) => (
              <Flex as="button" key={s} onClick={() => setPublish(s)} px="10px" py="4px" borderRadius="4px"
                cursor="pointer" bg={s === publish ? 'white' : 'transparent'}
                boxShadow={s === publish ? '0 1px 2px rgba(0,0,0,0.10)' : undefined}>
                <Text fontFamily={F} fontWeight={s === publish ? '700' : '500'} fontSize="11px"
                  color={s === publish ? PAGE.ink : PAGE.sub} whiteSpace="nowrap">{s}</Text>
              </Flex>
            ))}
          </Flex>
        </Flex>

        <Flex align="center" gap="10px" flex="1" justify="flex-end" minW="0">
          <Flex w="26px" h="26px" borderRadius="13px" bg="#F0B429" align="center" justify="center" flexShrink={0}>
            <Text fontFamily={F} fontWeight="700" fontSize="11px" color="white">{SAVE_STATE.avatar}</Text>
          </Flex>
          <Box data-doc-mark="header-save" flexShrink={0}>
            <Flex align="center" gap="5px">
              <IconDot c={PAGE.ok} />
              <Text fontFamily={F} fontWeight="700" fontSize="11px" color={PAGE.ok} whiteSpace="nowrap">
                {SAVE_STATE.headline}
              </Text>
            </Flex>
            <Text fontFamily={F} fontSize="10px" color={PAGE.faint} whiteSpace="nowrap">{SAVE_STATE.detail}</Text>
          </Box>
          <IconInfo />
          <Box flexShrink={0}>
            <Text fontFamily={F} fontSize="10px" color={PAGE.faint} whiteSpace="nowrap">{SAVE_STATE.editorLabel}</Text>
            <Text fontFamily={F} fontWeight="700" fontSize="11px" color={PAGE.body} whiteSpace="nowrap">
              {SAVE_STATE.editorNote}
            </Text>
          </Box>
          <Flex as="button" w="30px" h="30px" align="center" justify="center" borderRadius="6px"
            cursor="pointer" _hover={{ bg: PAGE.lineSoft }} flexShrink={0}><IconHistory /></Flex>
          <Flex gap="6px" align="center" data-doc-mark="header-actions">
            <HBtn label="미리보기" kind="line" icon={<IconPlay />} />
            <HBtn label="저장" kind="line" />
            <HBtn label="공유" kind="line" />
            <HBtn label="배포" kind="fill" />
          </Flex>
        </Flex>
      </Flex>

      {/* ═══ 본문 ═══ */}
      <Flex flex="1" minH="0" align="stretch">

        {/* ── 아이콘 레일 ── */}
        <Flex data-doc-mark="rail" direction="column" justify="space-between"
          w="44px" flexShrink={0} bg="white" borderRight={'1px solid ' + PAGE.line} py="8px">
          <Flex direction="column" gap="2px" align="center">
            {RAIL_TOP.map((r, i) => {
              const on = i === 1;
              return (
                <Flex as="button" key={r.icon} w="32px" h="32px" borderRadius="8px" align="center" justify="center"
                  cursor="pointer" bg={on ? PAGE.lineSoft : 'transparent'} _hover={{ bg: PAGE.lineSoft }}>
                  <RailGlyph icon={r.icon} c={on ? PAGE.ink : PAGE.faint} />
                </Flex>
              );
            })}
          </Flex>
          <Flex direction="column" gap="2px" align="center">
            {RAIL_BOTTOM.map((r) => (
              <Flex as="button" key={r.icon} w="32px" h="32px" borderRadius="8px" align="center" justify="center"
                cursor="pointer" _hover={{ bg: PAGE.lineSoft }}>
                <RailGlyph icon={r.icon} c={PAGE.faint} />
              </Flex>
            ))}
          </Flex>
        </Flex>

        {/* ── 왼쪽 패널 ── */}
        <Flex direction="column" w="250px" flexShrink={0} bg="white" borderRight={'1px solid ' + PAGE.line}>
          <Flex data-doc-mark="zoom" align="center" justify="space-between"
            px="12px" py="8px" borderBottom={'1px solid ' + PAGE.line}>
            <Flex gap="4px">
              <Flex as="button" w="24px" h="24px" align="center" justify="center" borderRadius="5px"
                cursor="pointer" _hover={{ bg: PAGE.lineSoft }}><IconUndo /></Flex>
              <Flex as="button" w="24px" h="24px" align="center" justify="center" borderRadius="5px"
                cursor="pointer" _hover={{ bg: PAGE.lineSoft }}><IconUndo flip /></Flex>
            </Flex>
            <Flex align="center" gap="6px">
              <Flex as="button" w="20px" h="20px" align="center" justify="center" borderRadius="4px"
                cursor="pointer" onClick={() => zoomBy(1 / 1.2)} _hover={{ bg: PAGE.lineSoft }}><IconMinus /></Flex>
              <Text fontFamily={F} fontWeight="600" fontSize="12px" color={PAGE.body} w="34px" textAlign="center">
                {Math.round(zoom * 100)}%
              </Text>
              <Flex as="button" w="20px" h="20px" align="center" justify="center" borderRadius="4px"
                cursor="pointer" onClick={() => zoomBy(1.2)} _hover={{ bg: PAGE.lineSoft }}><IconPlus /></Flex>
            </Flex>
          </Flex>

          <Box flex="1" minH="0" overflowY="auto">
            <Box data-doc-mark="panel-page">
              <PanelTitle title="페이지" right={<Box as="button" cursor="pointer"><IconPlus /></Box>} />
              <Box data-doc-mark="panel-toggles" px="14px" pb="10px">
                {PANEL_TOGGLES.map((t, i) => (
                  <Flex key={t.label} align="center" justify="space-between" py="5px">
                    <Text fontFamily={F} fontSize="12px" color={PAGE.body}>{t.label}</Text>
                    <Pill on={toggles[i]} onClick={() => setToggles((v) => v.map((x, j) => (j === i ? !x : x)))} />
                  </Flex>
                ))}
              </Box>
              <Box px="14px" pb="12px">
                <Flex align="center" gap="6px" border={'1px solid ' + PAGE.line} borderRadius="6px" px="8px" py="6px">
                  <IconSearch />
                  <Text fontFamily={F} fontSize="12px" color={PAGE.faint}>검색 ...</Text>
                </Flex>
              </Box>
            </Box>

            <Box data-doc-mark="custom-pages" pb="8px">
              <Flex align="center" gap="6px" px="14px" py="6px">
                <Chevron open />
                <Text fontFamily={F} fontWeight="700" fontSize="12px" color={PAGE.ink}>커스텀 페이지</Text>
              </Flex>
              {CUSTOM_PAGES.map((p, i) => (
                <Box key={p.path} onClick={() => setPageIdx(i)} cursor="pointer" mx="10px" px="12px" py="7px"
                  borderRadius="6px" bg={i === pageIdx ? PAGE.lineSoft : 'transparent'}
                  _hover={{ bg: PAGE.lineSoft }}>
                  <Text fontFamily={F} fontWeight={i === pageIdx ? '700' : '500'} fontSize="12px" color={PAGE.ink}>
                    {p.name}
                  </Text>
                  <Text fontFamily={F} fontSize="11px" color={PAGE.faint}>{p.path}</Text>
                </Box>
              ))}
              {COLLAPSED_GROUPS.map((g) => (
                <Flex key={g} align="center" gap="6px" px="14px" py="6px">
                  <Chevron open={false} />
                  <Text fontFamily={F} fontWeight="700" fontSize="12px" color={PAGE.ink}>{g}</Text>
                </Flex>
              ))}
            </Box>

            {/* 레이어 — 고르면 데이터 탭이 그 요소로 바뀐다 */}
            <Box data-doc-mark="layers" borderTop={'1px solid ' + PAGE.line}>
              <PanelTitle title="레이어" right={<Box as="button" cursor="pointer"><IconSort /></Box>} />
              <Box pb="10px">
                {visibleLayers.map((l) => {
                  const on = l.id === picked;
                  return (
                    <Flex key={l.id} data-doc-mark={l.docMark}
                      align="center" gap="6px" pr="10px" py="5px" cursor="pointer"
                      pl={10 + l.depth * 16 + 'px'} bg={on ? PAGE.accentSoft : 'transparent'}
                      _hover={{ bg: on ? PAGE.accentSoft : PAGE.lineSoft }}
                      onClick={() => pickElement(on ? null : l.id)}>
                      <Box w="10px" flexShrink={0}
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); toggleLayer(l.id); }}>
                        {l.hasChild && <Chevron open={openLayers.includes(l.id)} />}
                      </Box>
                      <KindGlyph kind={l.kind} c={on ? PAGE.accentDeep : PAGE.faint} s={13} />
                      <Text fontFamily={F} fontWeight={on ? '700' : '400'} fontSize="12px"
                        color={on ? PAGE.accentDeep : l.layerOnly ? PAGE.faint : PAGE.body} minW="0"
                        whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{l.name}</Text>
                    </Flex>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Flex>

        {/* ── 캔버스 ── */}
        <Box data-doc-mark="canvas" ref={viewRef} flex="1" minW="0"
          position="relative" overflow="hidden" bg={PAGE.canvas}
          cursor={panning ? 'grabbing' : 'default'}
          onMouseDown={(e: React.MouseEvent) => {
            if ((e.target as HTMLElement).dataset.bg === '1') {
              setPicked(null); // 빈 바닥을 누르면 선택 해제
              setPanning({ sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y });
            }
          }}
          onWheel={(e: React.WheelEvent) => {
            if (e.ctrlKey || e.metaKey) zoomBy(e.deltaY < 0 ? 1.1 : 1 / 1.1);
            else setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
          }}>
          <Box data-bg="1" position="absolute" inset="0" />

          <Box position="absolute" left="0" top="0" transformOrigin="0 0"
            transform={'translate(' + pan.x + 'px,' + pan.y + 'px) scale(' + zoom + ')'}>
            {ARTBOARDS.map((a, i) => (
              <Box key={a.id} position="absolute" left={lefts[i] + 'px'} top="0">
                <Flex data-doc-mark={i === 1 ? 'artboard-label' : undefined}
                  align="center" gap={8 / zoom + 'px'} pb={8 / zoom + 'px'}>
                  <Text fontFamily={F} fontWeight="600" fontSize={13 / zoom + 'px'} color={PAGE.sub} whiteSpace="nowrap">
                    {a.name} {a.w} × {a.h}
                  </Text>
                  <IconGrip />
                </Flex>
                <Box data-doc-mark={i === 1 ? 'canvas-pick' : undefined}
                  w={a.w + 'px'} h={a.h + 'px'} bg="white" boxShadow="0 1px 4px rgba(0,0,0,0.10)">
                  <ArtboardBody w={a.w} picked={picked} onPick={pickElement} marked={i === 1} />
                </Box>
              </Box>
            ))}
          </Box>

          {/* 떠 있는 도구 툴바 */}
          <Flex data-doc-mark="tools" position="absolute" left="50%" bottom="18px"
            transform="translateX(-50%)" bg="white" borderRadius="12px" px="8px" py="7px" gap="4px"
            boxShadow="0 4px 16px rgba(0,0,0,0.14)" border={'1px solid ' + PAGE.line}>
            {TOOLS.map((t, i) => {
              const on = t.kind === tool;
              return (
                <Flex key={t.kind} align="center">
                  <Flex as="button" onClick={() => setTool(t.kind)} w="34px" h="30px" borderRadius="8px"
                    align="center" justify="center" cursor="pointer"
                    bg={on ? PAGE.publish : 'transparent'} _hover={{ bg: on ? PAGE.publish : PAGE.lineSoft }}>
                    <ToolGlyph kind={t.kind} c={on ? 'white' : PAGE.body} />
                  </Flex>
                  {i === 0 && <Box pl="2px" pr="4px"><Chevron open={false} c={PAGE.faint} size={9} /></Box>}
                </Flex>
              );
            })}
          </Flex>

          <Flex position="absolute" right="16px" bottom="18px" direction="column" gap="10px">
            {[<IconChat key="c" />, <IconHelp key="h" />].map((ic, i) => (
              <Flex key={i} as="button" w="38px" h="38px" borderRadius="19px" bg="white" align="center" justify="center"
                cursor="pointer" boxShadow="0 2px 10px rgba(0,0,0,0.14)">{ic}</Flex>
            ))}
          </Flex>
        </Box>

        {/* ── 오른쪽 패널 ── */}
        <Flex data-doc-tab={tab} direction="column" w="300px" flexShrink={0}
          bg="white" borderLeft={'1px solid ' + PAGE.line}>
          <Flex data-doc-mark="right-tabs" gap="2px" px="10px"
            borderBottom={'1px solid ' + PAGE.line} flexShrink={0}>
            {RIGHT_TABS.map((t) => {
              const on = t === tab;
              return (
                <Flex as="button" key={t} onClick={() => setTab(t)} px="12px" pt="12px" pb="10px"
                  cursor="pointer" position="relative">
                  <Text fontFamily={F} fontWeight={on ? '700' : '500'} fontSize="12px"
                    color={on ? PAGE.ink : PAGE.faint} whiteSpace="nowrap">{t}</Text>
                  {on && <Box position="absolute" left="8px" right="8px" bottom="-1px" h="2px" bg={PAGE.ink} />}
                </Flex>
              );
            })}
          </Flex>

          <Box flex="1" minH="0" overflowY="auto">
            {tab === '데이터' ? (
              <DataTab picked={picked} onPick={pickElement} />
            ) : (
              <Flex align="center" justify="center" h="220px" px="20px">
                <Text fontFamily={F} fontSize="12px" color={PAGE.faint} textAlign="center">{EMPTY_HINT}</Text>
              </Flex>
            )}
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
}
