/* ============================================================
 *  docs 시스템 개발 : 김희연 / 2026.06.01
 * ============================================================ */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import {
  DOC_GROUPS, ALL_ENTRIES, AUTHOR, DOC_TITLE, groupTitleOf,
  AREA_COLS, pageRowsInArea, STATUS_META,
  type DocEntry, type DocSection, type IndexRow, type StateTable,
} from './catalog';
import { DocComments } from './DocComments';
import { subscribe as subscribeComments, countOf, commentsOf, replyCount, type DocComment } from './commentStore';

const FONT = "'Pretendard', system-ui, sans-serif";

// ── 테마 토큰 (라이트/다크) ──────────────────────────────────────────────
interface Theme {
  panel: string; border: string; borderSoft: string; text: string; textSub: string;
  textMuted: string; center: string; hover: string; active: string; searchBg: string;
  chip: string; chipText: string; screenFrame: string; screenBg: string; shadow: string;
  accent: string; onAccent: string;
}
const THEMES: Record<'light' | 'dark', Theme> = {
  light: {
    panel: '#FFFFFF', border: '#E5E7EB', borderSoft: '#F0F1F3', text: '#111827', textSub: '#374151',
    textMuted: '#9CA3AF', center: '#EEF0F3', hover: '#F4F5F7', active: '#ECEDEF', searchBg: '#F4F5F7',
    chip: '#F1F1F4', chipText: '#6B7280', screenFrame: '#CBD0D8', screenBg: '#FFFFFF',
    shadow: 'rgba(0,0,0,0.10)', accent: '#3F3F46', onAccent: '#FFFFFF',
  },
  dark: {
    panel: '#22262E', border: '#363C46', borderSoft: '#2D323B', text: '#F7F8FA', textSub: '#DCE0E7',
    textMuted: '#A6ADB8', center: '#13151A', hover: '#2D323B', active: '#343A44', searchBg: '#2D323B',
    chip: '#363C46', chipText: '#C7CCD4', screenFrame: '#454C57', screenBg: '#13151A',
    shadow: 'rgba(0,0,0,0.5)', accent: '#C7CCD4', onAccent: '#22262E',
  },
};

const ALERT_COLOR = '#DC2626'; // 설명 안 강조(**...**) — 놓치면 안 되는 규칙에만 절제해서 쓴다
const PREVIEW_MIN_W = 1620; // 어드민 화면이 가로 스크롤 없이 들어가는 최소 논리 폭(사이드바 238 + 본문 1360 + 여백)
const MARK_COLOR = '#EC4899'; // 화면 위 번호 마커 색(코멘트 핀 파랑과 구분)

// 오늘(작성일 기본값) — 변경일 미지정 시 표기
const TODAY = (() => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
})();

// ── 아이콘 (이모지 대신 SVG) ─────────────────────────────────────────────
const IC = { fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const IconMenu = ({ s = 16, c = 'currentColor' }) => (<svg width={s} height={s} viewBox="0 0 24 24" {...IC} stroke={c}><path d="M4 6h16M4 12h16M4 18h16" /></svg>);
const IconSearch = ({ s = 15, c = 'currentColor' }) => (<svg width={s} height={s} viewBox="0 0 24 24" {...IC} stroke={c}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>);
const IconSun = ({ s = 16, c = 'currentColor' }) => (<svg width={s} height={s} viewBox="0 0 24 24" {...IC} stroke={c}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19" /></svg>);
const IconMoon = ({ s = 16, c = 'currentColor' }) => (<svg width={s} height={s} viewBox="0 0 24 24" {...IC} stroke={c}><path d="M20 14.5A7.5 7.5 0 0 1 9.5 4a7.5 7.5 0 1 0 10.5 10.5Z" /></svg>);
const IconComment = ({ s = 16, c = 'currentColor' }) => (<svg width={s} height={s} viewBox="0 0 24 24" {...IC} stroke={c}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" /></svg>);
const IconList = ({ s = 16, c = 'currentColor' }) => (<svg width={s} height={s} viewBox="0 0 24 24" {...IC} stroke={c}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>);
const IconGrid = ({ s = 16, c = 'currentColor' }) => (<svg width={s} height={s} viewBox="0 0 24 24" {...IC} stroke={c}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>);
const IconPanel = ({ s = 16, c = 'currentColor' }) => (<svg width={s} height={s} viewBox="0 0 24 24" {...IC} stroke={c}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M15 4v16" /></svg>);
const IconClose = ({ s = 16, c = 'currentColor' }) => (<svg width={s} height={s} viewBox="0 0 24 24" {...IC} stroke={c} strokeWidth={2}><path d="M6 6l12 12M18 6 6 18" /></svg>);
const IconCheck = ({ s = 14, c = 'currentColor' }) => (<svg width={s} height={s} viewBox="0 0 24 24" {...IC} stroke={c} strokeWidth={2.4}><path d="M5 12l5 5L20 6" /></svg>);

// ── URL(/docs/<id>) ↔ 선택 화면 매핑 ──
function docIdFromPath(): string {
  const m = window.location.pathname.match(/^\/docs\/([^/?#]+)/);
  const id = m?.[1] ? decodeURIComponent(m[1]) : '';
  return id && ALL_ENTRIES.some((e) => e.id === id) ? id : ALL_ENTRIES[0].id;
}

interface MarkPos { mark: string; x: number; y: number; num: number }

export function DocsShell() {
  const [mode, setMode] = useState<'light' | 'dark'>(
    () => (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  );
  const t = THEMES[mode];

  const [selectedId, setSelectedId] = useState<string>(docIdFromPath);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [descCollapsed, setDescCollapsed] = useState(false); // 우측 설명 패널 접기
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState('');
  // 중앙 뷰: 화면 프리뷰 / 작업페이지 한눈에 보기(화면 인덱스). URL로 딥링크(/docs/pages)
  const [view, setView] = useState<'screen' | 'index'>(
    () => (/^\/docs\/pages\/?$/.test(window.location.pathname) ? 'index' : 'screen'),
  );
  const openIndex = useCallback(() => {
    setView('index');
    window.history.pushState({}, '', '/docs/pages');
  }, []);

  // 우측 패널 모드: 설명 / 코멘트 / 둘 다. 코멘트·둘다면 핀 노출.
  const [rightMode, setRightMode] = useState<'desc' | 'comments' | 'both'>('desc');
  const [commentPlace, setCommentPlace] = useState(false); // 배치(빈 화면 클릭=새 핀)
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);

  const [, bumpComments] = useState(0);
  useEffect(() => subscribeComments(() => bumpComments((n) => n + 1)), []);

  const entry = useMemo(() => ALL_ENTRIES.find((e) => e.id === selectedId) ?? ALL_ENTRIES[0], [selectedId]);

  // 탭 있는 화면의 활성 탭 — 우측 설명·코멘트를 이 탭 것만 노출(data-doc-tab 컨텍스트)
  const [activeTab, setActiveTab] = useState('');
  useEffect(() => { setActiveTab(entry.tabs?.[0] ?? ''); }, [entry]);

  const select = useCallback((id: string) => {
    setSelectedId(id);
    setView('screen');
    setOpenCommentId(null);
    window.history.pushState({}, '', `/docs/${encodeURIComponent(id)}`);
  }, []);

  // 뒤/앞으로가기 대응
  useEffect(() => {
    const onPop = () => {
      if (/^\/docs\/pages\/?$/.test(window.location.pathname)) { setView('index'); return; }
      setView('screen');
      setSelectedId(docIdFromPath());
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // ── 프리뷰 iframe + 화면 위 번호 마커 앵커링 ──
  const previewRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [marks, setMarks] = useState<MarkPos[]>([]);
  const [hoverMark, setHoverMark] = useState<string | null>(null);

  // ── 프리뷰 배율 ──
  // 어드민 화면은 최소 폭이 넓어서, 좁은 창에서는 가로 스크롤 대신 축소해 전체를 보여준다.
  // zoom=null 이면 창 폭에 맞춰 자동(맞춤), 숫자면 사용자가 고정한 배율.
  const [zoom, setZoom] = useState<number | null>(null);
  const [boxW, setBoxW] = useState(0);
  useEffect(() => {
    const box = previewRef.current;
    if (!box) return;
    const ro = new ResizeObserver(([e]) => setBoxW(e.contentRect.width));
    ro.observe(box);
    setBoxW(box.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, [entry]);
  // 맞춤 배율 = 창 폭 / 화면이 필요로 하는 최소 폭. 확대는 하지 않는다.
  const fitScale = boxW ? Math.min(1, boxW / PREVIEW_MIN_W) : 1;
  const scale = zoom ?? fitScale;
  const stepZoom = (d: number) =>
    setZoom((z) => Math.min(1.5, Math.max(0.25, Math.round(((z ?? fitScale) + d) * 100) / 100)));

  // 같은 출처(iframe) 요소의 실제 좌표로 마커를 얹는다 — 좌표 하드코딩 없이 레이아웃 바뀌어도 안 깨짐.
  const scaleRef = useRef(1);
  const recompute = useCallback(() => {
    const ifr = iframeRef.current, box = previewRef.current;
    if (!ifr || !box) return;
    let doc: Document | null = null;
    try { doc = ifr.contentDocument; } catch { setMarks([]); return; }
    if (!doc) return;
    const boxRect = box.getBoundingClientRect();
    const ifrRect = ifr.getBoundingClientRect();
    const raw = Array.from(doc.querySelectorAll<HTMLElement>('[data-doc-mark]')).map((el) => {
      const r = el.getBoundingClientRect();
      // 마커는 항상 요소의 '왼쪽 위 모서리'에 앵커링(중앙 아님)
      // iframe 안 좌표는 축소 전 값이라 배율을 곱해 화면 좌표로 옮긴다
      return {
        mark: el.getAttribute('data-doc-mark') || '',
        x: ifrRect.left - boxRect.left + r.left * scaleRef.current,
        y: ifrRect.top - boxRect.top + r.top * scaleRef.current,
        top: r.top,
      };
    });
    // 화면 좌표 상단→하단 순으로 번호 매김(설명 패널 번호와 공유)
    raw.sort((a, b) => a.top - b.top);
    setMarks(raw.map((m, i) => ({ mark: m.mark, x: m.x, y: m.y, num: i + 1 })));
  }, []);

  useEffect(() => { scaleRef.current = scale; recompute(); }, [scale, recompute]);

  // 로드/리사이즈/주기 폴링으로 재계산(같은 출처라 스크롤·레이아웃 변화 추적)
  useEffect(() => {
    recompute();
    const id = window.setInterval(recompute, 350);
    window.addEventListener('resize', recompute);
    return () => { window.clearInterval(id); window.removeEventListener('resize', recompute); };
  }, [recompute, entry, activeTab]);

  const markNum = useMemo(() => {
    const m: Record<string, number> = {};
    marks.forEach((mk) => { m[mk.mark] = mk.num; });
    return m;
  }, [marks]);

  // iframe src — 탭 있는 화면은 ?tab=활성탭 을 실어 로드
  const iframeSrc = useMemo(() => {
    const base = entry.route;
    if (!entry.tabs?.length || !activeTab) return base;
    return base + (base.includes('?') ? '&' : '?') + 'tab=' + encodeURIComponent(activeTab);
  }, [entry, activeTab]);

  const openInNew = () => window.open(iframeSrc, '_blank', 'noopener');

  // 설명 패널에 노출할 섹션 — 활성 탭 것만(탭 없으면 전부)
  const shownSections = entry.sections.filter((s) => !s.context || s.context === activeTab);
  // 핀 노출 = 코멘트/둘다 모드거나 배치 중
  const commentsVisible = rightMode !== 'desc' || commentPlace;

  // 사이드바 검색 필터
  const q = query.trim().toLowerCase();
  const matches = (e: DocEntry) => !q || e.name.toLowerCase().includes(q) || (e.code ?? '').toLowerCase().includes(q);

  // 작업페이지 인덱스 필터 상태
  const [clArea, setClArea] = useState<string>('all');
  const [clQuery, setClQuery] = useState('');

  return (
    <Flex h="100dvh" w="100%" bg={t.center} fontFamily={FONT} overflow="hidden" color={t.text}>
      {/* ───────────── 좌측: 문서 트리 ───────────── */}
      {navCollapsed ? (
        <Flex direction="column" w="40px" flexShrink={0} bg={t.panel} borderRight={`1px solid ${t.border}`} align="center" pt="14px" gap="10px">
          <IconBtn t={t} title="문서 영역 펼치기" onClick={() => setNavCollapsed(false)}><IconMenu c={t.textSub} /></IconBtn>
        </Flex>
      ) : (
        <Flex direction="column" w="288px" flexShrink={0} bg={t.panel} borderRight={`1px solid ${t.border}`} boxShadow={`4px 0 12px -4px ${t.shadow}`} zIndex={2}>
          {/* 헤더 */}
          <Flex align="center" gap="8px" px="16px" pt="16px" pb="4px">
            <Text fontSize="17px" fontWeight="800" color={t.text} flex="1">{DOC_TITLE}</Text>
            <IconBtn t={t} title="문서 영역 접기" onClick={() => setNavCollapsed(true)}><IconMenu c={t.textSub} /></IconBtn>
          </Flex>
          {/* 컴포넌트 바로가기 — 타이틀 아래 작은 링크 */}
          <Box px="16px" pb="12px">
            <Flex as="button" align="center" gap="5px" onClick={() => window.open('/components', '_blank', 'noopener')} cursor="pointer" title="주요 컴포넌트 카탈로그를 새 창으로 열기"
              _hover={{ '& svg': { stroke: t.text }, '& p': { color: t.text } }}>
              <IconGrid s={12} c={t.textMuted} />
              <Text fontSize="11.5px" fontWeight="700" color={t.textMuted}>컴포넌트 바로가기 ↗</Text>
            </Flex>
          </Box>
          {/* 검색 */}
          <Box px="16px" pb="12px">
            <Flex align="center" gap="8px" bg={t.searchBg} border={`1px solid ${t.borderSoft}`} borderRadius="9px" px="10px" h="36px">
              <IconSearch c={t.textMuted} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="화면 검색"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: t.text, fontSize: 13, fontFamily: 'inherit' }}
              />
            </Flex>
          </Box>
          {/* 뷰 전환 — 작업페이지 한눈에 보기 */}
          <Box px="12px" pb="8px">
            <NavViewBtn t={t} on={view === 'index'} onClick={openIndex} label="작업페이지 한눈에 보기" count={ALL_ENTRIES.length}><IconList c={view === 'index' ? t.onAccent : t.accent} /></NavViewBtn>
          </Box>
          {/* 트리 */}
          <Box flex="1" overflowY="auto" px="10px" pb="14px">
            {DOC_GROUPS.map((g) => {
              const visible = g.entries.filter((e) => matches(e) || (e.children ?? []).some(matches));
              if (!visible.length) return null;
              return (
                <Box key={g.title} pt="10px">
                  <Text px="8px" pb="4px" fontSize="11px" fontWeight="800" letterSpacing="0.04em" color={t.textMuted} textTransform="uppercase">{g.title}</Text>
                  {visible.map((e) => (
                    <Box key={e.id}>
                      <PageRow e={e} t={t} active={e.id === selectedId} commentCount={countOf(e.id)}
                        collapsed={!!collapsed[e.id]} onToggle={() => setCollapsed((c) => ({ ...c, [e.id]: !c[e.id] }))}
                        onSelect={() => select(e.id)} />
                      {!collapsed[e.id] && (e.children ?? []).filter(matches).map((c, i, arr) => (
                        <PopupRow key={c.id} e={c} t={t} active={c.id === selectedId} last={i === arr.length - 1}
                          commentCount={countOf(c.id)} onSelect={() => select(c.id)} />
                      ))}
                    </Box>
                  ))}
                </Box>
              );
            })}
          </Box>
          <Flex px="16px" py="12px" borderTop={`1px solid ${t.borderSoft}`}>
            <Text fontSize="11px" color={t.textMuted}>작성 · {AUTHOR}</Text>
          </Flex>
        </Flex>
      )}

      {view === 'index' ? (
        <PageIndex t={t} clArea={clArea} setClArea={setClArea} clQuery={clQuery} setClQuery={setClQuery} onSelectScreen={select} />
      ) : (
      <>
      {/* ───────────── 중앙: 화면 프리뷰 ───────────── */}
      <Flex direction="column" flex="1" minW="0">
        {/* 상단 바 — Page INFO 규격 (모든 항목 노출) */}
        <Flex align="center" gap="10px" px="16px" minH="52px" py="8px" borderBottom={`1px solid ${t.border}`} bg={t.panel} flexShrink={0} flexWrap="wrap">
          <Text fontSize="11px" fontWeight="800" color={t.textMuted} flexShrink={0} letterSpacing="0.03em">Page INFO</Text>
          {/* #ID */}
          {entry.code && (
            <Flex align="center" gap="4px" border={`1px solid ${t.border}`} borderRadius="6px" px="8px" py="3px" flexShrink={0}>
              <Text fontSize="11px" color={t.textMuted}>#</Text>
              <Text fontSize="12px" fontWeight="700" color={t.textSub}>{entry.code}</Text>
            </Flex>
          )}
          {/* 유형 뱃지 */}
          <Text fontSize="9px" fontWeight="800" flexShrink={0} px="6px" py="2px" borderRadius="4px"
            color={entry.type === 'page' ? t.onAccent : t.chipText} bg={entry.type === 'page' ? t.accent : t.chip}>
            {entry.type === 'page' ? '페이지' : '팝업'}
          </Text>
          {/* 실제 페이지 주소 — 클릭 시 새 창 */}
          <Text as="button" fontSize="12px" color={t.chipText} flexShrink={0} fontFamily="monospace" cursor="pointer"
            title="새 창에서 열기" _hover={{ textDecoration: 'underline', color: t.text }} onClick={openInNew}>
            {iframeSrc} ↗
          </Text>
          {/* 페이지명 + 경로 */}
          <Flex align="baseline" gap="8px" minW="0" flex="1">
            <Text fontSize="13px" fontWeight="800" color={t.text} flexShrink={0}>{entry.name}</Text>
            <Text fontSize="11px" color={t.textMuted} truncate>{entry.breadcrumb}</Text>
          </Flex>
          {/* 작성자 */}
          <Flex align="center" gap="5px" flexShrink={0}>
            <Text fontSize="11px" color={t.textMuted}>작성자</Text>
            <Text fontSize="12px" fontWeight="700" color={t.textSub}>{AUTHOR}</Text>
          </Flex>
          <Box w="1px" h="14px" bg={t.border} flexShrink={0} />
          {/* 변경일 */}
          <Flex align="center" gap="5px" flexShrink={0}>
            <Text fontSize="11px" color={t.textMuted}>{entry.updatedAt ? '변경일' : '작성일'}</Text>
            <Text fontSize="12px" fontWeight="700" color={t.textSub}>{entry.updatedAt ?? TODAY}</Text>
          </Flex>
          <Box w="1px" h="14px" bg={t.border} flexShrink={0} />
          {/* 프리뷰 배율 — 창 폭에 맞춰 자동, 필요하면 직접 조절 */}
          <Flex align="center" h="28px" borderRadius="7px" border={`1px solid ${t.border}`} overflow="hidden" flexShrink={0}>
            <Flex as="button" w="26px" h="100%" align="center" justify="center" cursor="pointer"
              _hover={{ bg: t.hover }} onClick={() => stepZoom(-0.1)} title="축소">
              <Text fontSize="14px" fontWeight="700" color={t.textSub} lineHeight="1">−</Text>
            </Flex>
            <Flex as="button" px="8px" h="100%" align="center" justify="center" cursor="pointer" minW="52px"
              borderLeft={`1px solid ${t.border}`} borderRight={`1px solid ${t.border}`}
              bg={zoom == null ? t.chip : 'transparent'} _hover={{ bg: t.hover }}
              onClick={() => setZoom(zoom == null ? 1 : null)}
              title={zoom == null ? '100% 로 보기' : '창 폭에 맞추기'}>
              <Text fontSize="11.5px" fontWeight="700" color={t.textSub} whiteSpace="nowrap">
                {Math.round(scale * 100)}%{zoom == null ? ' 맞춤' : ''}
              </Text>
            </Flex>
            <Flex as="button" w="26px" h="100%" align="center" justify="center" cursor="pointer"
              _hover={{ bg: t.hover }} onClick={() => stepZoom(0.1)} title="확대">
              <Text fontSize="14px" fontWeight="700" color={t.textSub} lineHeight="1">+</Text>
            </Flex>
          </Flex>
          {/* 코멘트 달기 — 화면 클릭으로 새 핀. 켜면 핀도 자동 노출 */}
          <Flex as="button" flexShrink={0} align="center" justify="center" h="28px" px="10px" gap="5px" borderRadius="7px"
            border={`1px solid ${commentPlace ? '#2563EB' : t.border}`} bg={commentPlace ? '#2563EB' : 'transparent'} cursor="pointer"
            _hover={{ bg: commentPlace ? '#2563EB' : t.hover }}
            onClick={() => { if (commentPlace) { setCommentPlace(false); } else { setCommentPlace(true); setDescCollapsed(false); if (rightMode === 'desc') setRightMode('comments'); } }}
            title={commentPlace ? '달기 종료' : '화면을 클릭해 새 코멘트를 답니다'}>
            <IconComment s={13} c={commentPlace ? '#fff' : t.textSub} />
            <Text fontSize="12px" fontWeight={commentPlace ? '800' : '600'} color={commentPlace ? '#fff' : t.textSub} whiteSpace="nowrap">{commentPlace ? '달기 종료' : '코멘트 달기'}</Text>
            {countOf(entry.id) > 0 && (
              <Text fontSize="10px" fontWeight="800" color={commentPlace ? '#2563EB' : '#fff'} bg={commentPlace ? '#fff' : '#2563EB'} px="5px" borderRadius="100px" lineHeight="1.5">{countOf(entry.id)}</Text>
            )}
          </Flex>
          {/* 테마 전환 */}
          <Flex as="button" flexShrink={0} align="center" justify="center" h="28px" px="10px" gap="5px" borderRadius="7px"
            border={`1px solid ${t.border}`} bg="transparent" cursor="pointer" _hover={{ bg: t.hover }}
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} title="테마 전환">
            {mode === 'dark' ? <IconSun s={13} c={t.textSub} /> : <IconMoon s={13} c={t.textSub} />}
            <Text fontSize="12px" fontWeight="600" color={t.textSub} whiteSpace="nowrap">{mode === 'dark' ? '라이트' : '다크'}</Text>
          </Flex>
        </Flex>

        {/* 프리뷰 박스 */}
        <Box flex="1" p="20px" overflow="hidden">
          <Box
            ref={previewRef}
            position="relative"
            h="100%"
            bg="#FFFFFF"
            border={`1px solid ${t.screenFrame}`}
            borderRadius="0"
            overflow="hidden"
            boxShadow={`0 6px 24px -8px ${t.shadow}`}
          >
            <iframe
              key={entry.id}
              ref={iframeRef}
              src={iframeSrc}
              title={entry.name}
              onLoad={recompute}
              style={{
                // 축소한 만큼 논리 크기를 키워, 좁은 창에서도 넓은 해상도로 그린다
                width: `${100 / scale}%`,
                height: `${100 / scale}%`,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                border: 'none', display: 'block', background: '#FFFFFF',
              }}
            />

            {/* 번호 마커 오버레이 — 요소 왼쪽 위 모서리에 앵커. 설명 패널을 닫으면(descCollapsed) 마커도 숨김 */}
            {!commentPlace && !descCollapsed && marks.map((m) => (
              <Flex key={m.mark} position="absolute" left={`${m.x}px`} top={`${m.y}px`} transform="translate(-50%, -50%)"
                align="center" justify="center" w="22px" h="22px" borderRadius="50%" bg={MARK_COLOR}
                border="2px solid #fff" boxShadow="0 1px 5px rgba(0,0,0,0.35)" pointerEvents="none"
                opacity={hoverMark && hoverMark !== m.mark ? 0.35 : 1}
                outline={hoverMark === m.mark ? `3px solid ${MARK_COLOR}55` : undefined}>
                <Text fontSize="11px" fontWeight="800" color="#fff" lineHeight="1">{m.num}</Text>
              </Flex>
            ))}

            {/* 코멘트 오버레이 */}
            <DocComments
              entryId={entry.id}
              t={t}
              active={commentsVisible}
              placing={commentPlace}
              openId={openCommentId}
              setOpenId={setOpenCommentId}
              activeContext={activeTab}
            />
          </Box>
        </Box>
      </Flex>

      {/* ───────────── 우측: 설명 패널 (접기 가능 · hideDesc면 아예 없음) ───────────── */}
      {!entry.hideDesc && (descCollapsed ? (
        <Flex direction="column" w="40px" flexShrink={0} bg={t.panel} borderLeft={`1px solid ${t.border}`} boxShadow={`-6px 0 16px -8px ${t.shadow}`} zIndex={1} align="center" pt="14px">
          <IconBtn t={t} title="설명 펼치기" onClick={() => setDescCollapsed(false)}><IconPanel c={t.textSub} /></IconBtn>
        </Flex>
      ) : (
      <Flex direction="column" w="360px" flexShrink={0} bg={t.panel} borderLeft={`1px solid ${t.border}`} boxShadow={`-6px 0 16px -8px ${t.shadow}`} zIndex={1}>
        {/* 패널 헤더 — Page INFO 바와 동일 높이(52px). 설명/코멘트/둘 다 탭 + 닫기 */}
        <Flex align="center" gap="4px" px="10px" h="52px" borderBottom={`1px solid ${t.border}`} flexShrink={0}>
          <PanelTab t={t} on={rightMode === 'desc'} label="설명" onClick={() => setRightMode('desc')} />
          <PanelTab t={t} on={rightMode === 'comments'} label="코멘트" count={countOf(entry.id)} onClick={() => setRightMode('comments')} />
          <PanelTab t={t} on={rightMode === 'both'} label="둘 다" count={countOf(entry.id)} onClick={() => setRightMode('both')} />
          <Box flex="1" />
          <IconBtn t={t} title="패널 닫기" onClick={() => setDescCollapsed(true)}><IconClose c={t.textSub} /></IconBtn>
        </Flex>
        <Box flex="1" overflowY="auto" px="20px" py="18px">
          {(rightMode === 'desc' || rightMode === 'both') && (<>
          <Flex align="center" gap="8px" pb="4px">
            {entry.code && <Text fontSize="11px" fontWeight="800" color={t.textMuted} bg={t.chip} px="6px" py="1px" borderRadius="5px">{entry.code}</Text>}
            <Text fontSize="10px" fontWeight="800" color={entry.type === 'page' ? t.onAccent : t.chipText} bg={entry.type === 'page' ? t.accent : t.chip} px="6px" py="2px" borderRadius="5px">
              {entry.type === 'page' ? '페이지' : '팝업'}
            </Text>
          </Flex>
          <Text fontSize="20px" fontWeight="800" color={t.text} pb="2px">{entry.name}</Text>
          {entry.docPath && <Text fontSize="12px" color={t.textMuted} pb="12px">{entry.docPath}</Text>}
          <Text fontSize="13.5px" color={t.textSub} lineHeight="1.7" pb="16px">{entry.summary}</Text>

          {/* 공통 — 마커로 못 찍는 개요·전제·규칙. 탭 무관 항상 노출 */}
          {entry.common && (
            <Box mb="18px" p="12px 14px" borderRadius="10px" bg={t.searchBg} border={`1px solid ${t.borderSoft}`}>
              <Flex align="center" gap="6px" pb="6px">
                <Box w="4px" h="12px" borderRadius="2px" bg={t.accent} />
                <Text fontSize="11px" fontWeight="800" letterSpacing="0.04em" color={t.textSub}>공통</Text>
              </Flex>
              <RichText text={entry.common} t={t} />
            </Box>
          )}

          {/* 섹션(번호=화면 마커) */}
          <Text fontSize="11px" fontWeight="800" letterSpacing="0.04em" color={t.textMuted} textTransform="uppercase" pb="8px">구성</Text>
          <Flex direction="column" gap="10px">
            {shownSections.map((s, i) => (
              <SectionCard key={i} s={s} t={t} num={s.mark ? markNum[s.mark] : undefined}
                hovered={!!s.mark && hoverMark === s.mark}
                onHover={(v) => setHoverMark(v ? s.mark ?? null : null)} />
            ))}
          </Flex>

          {/* 상태별 표 */}
          {entry.stateTable && (
            <Box pt="20px">
              {entry.stateTable.caption && <Text fontSize="11px" fontWeight="800" letterSpacing="0.04em" color={t.textMuted} textTransform="uppercase" pb="8px">{entry.stateTable.caption}</Text>}
              <Box border={`1px solid ${t.border}`} overflow="hidden">
                <Flex bg={t.hover}>
                  {entry.stateTable.headers.map((h, i) => (
                    <Box key={i} flex="1" px="10px" py="7px" borderLeft={i ? `1px solid ${t.borderSoft}` : undefined}>
                      <Text fontSize="11.5px" fontWeight="800" color={t.textSub}>{h}</Text>
                    </Box>
                  ))}
                </Flex>
                {entry.stateTable.rows.map((row, ri) => (
                  <Flex key={ri} borderTop={`1px solid ${t.borderSoft}`}>
                    {row.map((cell, ci) => (
                      <Box key={ci} flex="1" px="10px" py="7px" borderLeft={ci ? `1px solid ${t.borderSoft}` : undefined}>
                        <Text fontSize="12px" fontWeight={ci === 0 ? '700' : '400'} color={ci === 0 ? t.text : t.textSub}>{cell}</Text>
                      </Box>
                    ))}
                  </Flex>
                ))}
              </Box>
            </Box>
          )}

          {entry.updatedAt && <Text fontSize="11px" color={t.textMuted} pt="20px">최근 수정 · {entry.updatedAt} · {groupTitleOf(entry.id)}</Text>}
          </>)}

          {/* 코멘트 목록 (코멘트/둘 다 모드) */}
          {(rightMode === 'comments' || rightMode === 'both') && (
            <Box pt={rightMode === 'both' ? '20px' : '0'} mt={rightMode === 'both' ? '20px' : '0'} borderTop={rightMode === 'both' ? `1px solid ${t.borderSoft}` : undefined}>
              {rightMode === 'comments' && (<>
                <Text fontSize="20px" fontWeight="800" color={t.text} pb="4px">{entry.name}</Text>
                <Text fontSize="12.5px" color={t.textMuted} lineHeight="1.6" pb="14px">화면을 클릭해 핀으로 코멘트를 남기세요. 항목을 누르면 해당 핀으로 이동합니다.</Text>
              </>)}
              {rightMode === 'both' && (
                <Flex align="center" gap="6px" pb="10px">
                  <Text fontSize="11px" fontWeight="800" letterSpacing="0.04em" color={t.textMuted} textTransform="uppercase">코멘트</Text>
                  <Text fontSize="11px" fontWeight="700" color={t.textMuted}>{countOf(entry.id)}</Text>
                </Flex>
              )}
              <CommentList t={t} entryId={entry.id} activeTab={activeTab} openId={openCommentId}
                onOpen={(id) => { setOpenCommentId(id); }} />
            </Box>
          )}
        </Box>
      </Flex>
      ))}
      </>
      )}
    </Flex>
  );
}

// ── 하위 컴포넌트 ──────────────────────────────────────────────────────────
function IconBtn({ t, title, onClick, children }: { t: Theme; title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Flex as="button" w="30px" h="30px" flexShrink={0} align="center" justify="center" borderRadius="8px"
      border={`1px solid ${t.border}`} bg={t.panel} cursor="pointer" _hover={{ bg: t.hover }} onClick={onClick} title={title}>
      {children}
    </Flex>
  );
}

// 우측 패널 헤더 탭(설명/코멘트/둘 다)
function PanelTab({ t, on, label, count, onClick }: { t: Theme; on: boolean; label: string; count?: number; onClick: () => void }) {
  return (
    <Flex as="button" align="center" gap="5px" h="32px" px="12px" borderRadius="8px" cursor="pointer"
      bg={on ? t.accent : 'transparent'} _hover={{ bg: on ? t.accent : t.hover }} onClick={onClick}>
      <Text fontSize="13px" fontWeight="800" color={on ? t.onAccent : t.textSub}>{label}</Text>
      {count != null && count > 0 && (
        <Text fontSize="10px" fontWeight="800" color={on ? t.accent : '#fff'} bg={on ? '#fff' : '#2563EB'} px="5px" borderRadius="100px" lineHeight="1.6">{count}</Text>
      )}
    </Flex>
  );
}

// 우측 패널 코멘트 목록 — 클릭 시 해당 핀 팝오버 오픈(보기 전용, 달기는 상단 버튼으로만)
function CommentList({ t, entryId, activeTab, openId, onOpen }: {
  t: Theme; entryId: string; activeTab: string; openId: string | null; onOpen: (id: string) => void;
}) {
  const [, bump] = useState(0);
  const [hideResolved, setHideResolved] = useState(false);
  useEffect(() => subscribeComments(() => bump((n) => n + 1)), []);
  const all = commentsOf(entryId).filter((c: DocComment) => !c.context || c.context === activeTab);
  const list = hideResolved ? all.filter((c: DocComment) => !c.resolved) : all;
  const fmt = (iso: string) => { try { const d = new Date(iso); const p = (n: number) => String(n).padStart(2, '0'); return `${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; } catch { return ''; } };
  const hasResolved = all.some((c: DocComment) => c.resolved);
  return (
    <Flex direction="column" gap="8px">
      {hasResolved && (
        <Flex as="button" align="center" gap="6px" alignSelf="flex-end" onClick={() => setHideResolved((v) => !v)} cursor="pointer" pb="2px">
          <Flex w="15px" h="15px" align="center" justify="center" borderRadius="4px" border={`1.5px solid ${hideResolved ? t.accent : t.border}`} bg={hideResolved ? t.accent : 'transparent'}>
            {hideResolved && <IconCheck s={11} c={t.onAccent} />}
          </Flex>
          <Text fontSize="11.5px" fontWeight="700" color={t.textSub}>해결됨 숨김</Text>
        </Flex>
      )}
      {list.length === 0 ? (
        <Text fontSize="12px" color={t.textMuted} py="8px">{hideResolved ? '표시할 코멘트가 없습니다.' : '아직 코멘트가 없습니다. 상단 [코멘트 달기]로 추가합니다.'}</Text>
      ) : list.map((c: DocComment, i: number) => {
        const on = c.id === openId;
        const rc = replyCount(c.id);
        return (
          <Box key={c.id} as="button" onClick={() => onOpen(c.id)} textAlign="left" p="11px 12px" borderRadius="10px"
            border={`1px solid ${on ? '#2563EB' : t.borderSoft}`} bg={on ? '#2563EB14' : t.panel} cursor="pointer" _hover={{ borderColor: '#2563EB' }}>
            <Flex align="center" gap="6px" pb="4px">
              <Flex w="18px" h="18px" flexShrink={0} align="center" justify="center" borderRadius="50%" bg={c.resolved ? '#22A356' : '#2563EB'}>
                {c.resolved ? <IconCheck s={11} c="#fff" /> : <Text fontSize="10px" fontWeight="800" color="#fff" lineHeight="1">{i + 1}</Text>}
              </Flex>
              <Text fontSize="12px" fontWeight="800" color={t.text} truncate>{c.author}</Text>
              {c.resolved && <Text fontSize="9px" fontWeight="800" color="#fff" bg="#22A356" px="5px" py="1px" borderRadius="4px" flexShrink={0}>해결</Text>}
              <Text fontSize="10px" color={t.textMuted} flexShrink={0}>{fmt(c.updatedAt ?? c.createdAt)}</Text>
              <Box flex="1" />
              {rc > 0 && <Text fontSize="10px" fontWeight="700" color={t.textMuted} flexShrink={0}>답글 {rc}</Text>}
            </Flex>
            <Text fontSize="12.5px" color={t.textSub} lineHeight="1.5" lineClamp={2}>{c.text}</Text>
          </Box>
        );
      })}
    </Flex>
  );
}

function CommentBadge({ n }: { n: number }) {
  if (!n) return null;
  return (
    <Flex align="center" gap="2px" flexShrink={0} title={`미해결 코멘트 ${n}개`}>
      <IconComment s={12} c="#2563EB" /><Text fontSize="10px" fontWeight="800" color="#2563EB">{n}</Text>
    </Flex>
  );
}

function TypeTag({ kind, t }: { kind: 'page' | 'popup'; t: Theme }) {
  return (
    <Text fontSize="9px" fontWeight="700" flexShrink={0} px="5px" py="1px" borderRadius="4px"
      color={kind === 'page' ? t.onAccent : t.chipText} bg={kind === 'page' ? t.accent : t.chip}>
      {kind === 'page' ? '페이지' : '팝업'}
    </Text>
  );
}

function PageRow({ e, t, active, commentCount, collapsed, onToggle, onSelect }: {
  e: DocEntry; t: Theme; active: boolean; commentCount: number; collapsed: boolean; onToggle: () => void; onSelect: () => void;
}) {
  const hasChildren = !!e.children?.length;
  return (
    <Flex as="button" w="100%" align="center" gap="6px" pl="6px" pr="10px" py="8px" borderRadius="8px"
      bg={active ? t.active : 'transparent'} position="relative" cursor="pointer"
      _hover={{ bg: active ? t.active : t.hover }} onClick={onSelect} textAlign="left">
      {active && <Box position="absolute" left="0" top="6px" bottom="6px" w="3px" borderRadius="2px" bg={t.accent} />}
      <Flex as="span" w="18px" h="18px" flexShrink={0} align="center" justify="center" borderRadius="4px" fontSize="9px"
        color={t.textMuted} cursor={hasChildren ? 'pointer' : 'default'}
        _hover={hasChildren ? { bg: t.chip, color: t.text } : undefined}
        onClick={(ev: React.MouseEvent) => { if (hasChildren) { ev.stopPropagation(); onToggle(); } }}>
        {hasChildren ? (collapsed ? '▶' : '▼') : ''}
      </Flex>
      <Text flex="1" minW="0" fontSize="14px" fontWeight="700" color={t.text} truncate>{e.name}</Text>
      <CommentBadge n={commentCount} />
      <TypeTag kind={e.type} t={t} />
      {hasChildren && <Text fontSize="10px" color={t.textMuted} flexShrink={0}>{e.children!.length}</Text>}
    </Flex>
  );
}

function PopupRow({ e, t, active, last, commentCount, onSelect }: {
  e: DocEntry; t: Theme; active: boolean; last: boolean; commentCount: number; onSelect: () => void;
}) {
  return (
    <Flex position="relative" pl="14px">
      <Box position="absolute" left="14px" top="0" bottom={last ? '50%' : '0'} w="1px" bg={t.border} />
      <Box position="absolute" left="14px" top="50%" w="10px" h="1px" bg={t.border} />
      <Flex as="button" flex="1" minW="0" ml="24px" align="center" gap="6px" pl="6px" pr="10px" py="6px" borderRadius="7px"
        bg={active ? t.active : 'transparent'} position="relative" cursor="pointer"
        _hover={{ bg: active ? t.active : t.hover }} onClick={onSelect} textAlign="left">
        {active && <Box position="absolute" left="0" top="5px" bottom="5px" w="3px" borderRadius="2px" bg={t.accent} />}
        <Text flex="1" minW="0" fontSize="13px" fontWeight={active ? '700' : '500'} color={active ? t.text : t.textSub} truncate>{e.name}</Text>
        <CommentBadge n={commentCount} />
        <TypeTag kind={e.type} t={t} />
      </Flex>
    </Flex>
  );
}

function SectionCard({ s, t, num, hovered, onHover }: {
  s: DocSection; t: Theme; num?: number; hovered: boolean; onHover: (v: boolean) => void;
}) {
  return (
    <Flex gap="10px" p="12px" borderRadius="10px" border={`1px solid ${hovered ? MARK_COLOR : t.borderSoft}`}
      bg={hovered ? `${MARK_COLOR}0F` : t.panel} align="flex-start"
      onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
      {num != null ? (
        <Flex flexShrink={0} w="20px" h="20px" align="center" justify="center" borderRadius="50%" bg={MARK_COLOR}>
          <Text fontSize="11px" fontWeight="800" color="#fff" lineHeight="1">{num}</Text>
        </Flex>
      ) : (
        <Box flexShrink={0} w="20px" h="20px" borderRadius="50%" border={`1.5px dashed ${t.border}`} />
      )}
      <Box flex="1" minW="0">
        <Flex align="center" gap="6px" pb="3px">
          <Text fontSize="13.5px" fontWeight="800" color={t.text}>{s.title}</Text>
          {s.badge && <Text fontSize="9px" fontWeight="800" color={t.chipText} bg={t.chip} px="5px" py="1px" borderRadius="4px" letterSpacing="0.03em">{s.badge}</Text>}
        </Flex>
        {s.body && <RichText text={s.body} t={t} />}
        {s.table && <DescTable table={s.table} t={t} />}
        {s.components && s.components.length > 0 && (
          <Box mt="8px" pt="8px" borderTop={`1px solid ${t.borderSoft}`}>
            <Text fontSize="9.5px" fontWeight="800" color={t.textMuted} letterSpacing="0.04em" pb="5px">사용된 컴포넌트</Text>
            <Flex gap="4px" wrap="wrap">
              {s.components.map((c) => (
                <Text key={c} as="span" fontFamily="monospace" fontSize="10.5px" fontWeight="700" color={t.chipText} bg={t.chip} px="6px" py="2px" borderRadius="5px">{c}</Text>
              ))}
            </Flex>
          </Box>
        )}
      </Box>
    </Flex>
  );
}

// 설명 본문 — **텍스트** 를 빨간 볼드로 강조. 그 외는 줄바꿈 그대로.
function RichText({ text, t, size = '12.5px' }: { text: string; t: Theme; size?: string }) {
  return (
    <Text fontSize={size} color={t.textSub} lineHeight="1.7" whiteSpace="pre-line">
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <Text as="span" key={i} fontWeight="800" color={ALERT_COLOR}>{part.slice(2, -2)}</Text>
          : part,
      )}
    </Text>
  );
}

// 설명 안 표 — 문서 표는 라운드 없는 직사각형
function DescTable({ table, t }: { table: StateTable; t: Theme }) {
  return (
    <Box pt="8px">
      {table.caption && (
        <Text fontSize="10.5px" fontWeight="800" letterSpacing="0.03em" color={t.textMuted} pb="5px">{table.caption}</Text>
      )}
      <Box border={`1px solid ${t.border}`} overflow="hidden">
        <Flex bg={t.hover}>
          {table.headers.map((h, i) => (
            <Box key={i} flex={i === 0 ? '0 0 34%' : '1'} px="8px" py="6px" borderLeft={i ? `1px solid ${t.borderSoft}` : undefined}>
              <Text fontSize="11px" fontWeight="800" color={t.textSub}>{h}</Text>
            </Box>
          ))}
        </Flex>
        {table.rows.map((row, ri) => (
          <Flex key={ri} borderTop={`1px solid ${t.borderSoft}`} align="stretch">
            {row.map((cell, ci) => (
              <Box key={ci} flex={ci === 0 ? '0 0 34%' : '1'} px="8px" py="6px" borderLeft={ci ? `1px solid ${t.borderSoft}` : undefined}>
                <Text fontSize="11.5px" lineHeight="1.55" fontWeight={ci === 0 ? '700' : '400'} color={ci === 0 ? t.text : t.textSub}>
                  {cell.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
                    part.startsWith('**') && part.endsWith('**')
                      ? <Text as="span" key={i} fontWeight="800" color={ALERT_COLOR}>{part.slice(2, -2)}</Text>
                      : part,
                  )}
                </Text>
              </Box>
            ))}
          </Flex>
        ))}
      </Box>
    </Box>
  );
}

// 사이드바 뷰 전환 버튼(배포리스트)
function NavViewBtn({ t, on, onClick, label, count, children }: {
  t: Theme; on: boolean; onClick: () => void; label: string; count?: number; children: React.ReactNode;
}) {
  return (
    <Flex as="button" w="100%" align="center" gap="8px" px="10px" h="38px" borderRadius="9px"
      bg={on ? t.accent : t.searchBg} border={`1px solid ${on ? t.accent : t.borderSoft}`} cursor="pointer"
      _hover={{ bg: on ? t.accent : t.hover }} onClick={onClick} textAlign="left">
      <Flex w="22px" h="22px" flexShrink={0} align="center" justify="center" borderRadius="6px" bg={on ? 'rgba(255,255,255,0.22)' : t.chip}>
        {children}
      </Flex>
      <Text flex="1" fontSize="13px" fontWeight="800" color={on ? t.onAccent : t.text}>{label}</Text>
      {count != null && <Text fontSize="10px" fontWeight="700" color={on ? t.onAccent : t.textMuted} bg={on ? 'rgba(255,255,255,0.18)' : t.chip} px="6px" py="1px" borderRadius="100px">{count}</Text>}
    </Flex>
  );
}

function FilterChip({ t, on, label, onClick }: { t: Theme; on: boolean; label: string; onClick: () => void }) {
  return (
    <Box as="button" onClick={onClick} px="11px" h="30px" borderRadius="100px" cursor="pointer"
      bg={on ? t.accent : t.chip} border={`1px solid ${on ? t.accent : t.border}`} _hover={{ bg: on ? t.accent : t.hover }}>
      <Text fontSize="12px" fontWeight="700" color={on ? t.onAccent : t.chipText} whiteSpace="nowrap">{label}</Text>
    </Box>
  );
}

// ── 작업페이지 한눈에 보기(화면 인덱스) ─────────────────────────────────────
// 배포 이력이 아니라, 이 프로토타입의 작업 화면을 영역별로 모아 보는 목차.
function PageIndex({ t, clArea, setClArea, clQuery, setClQuery, onSelectScreen }: {
  t: Theme;
  clArea: string; setClArea: (v: string) => void;
  clQuery: string; setClQuery: (v: string) => void;
  onSelectScreen: (id: string) => void;
}) {
  const clq = clQuery.trim().toLowerCase();
  const rowPass = (r: IndexRow) =>
    !clq ||
    r.entry.name.toLowerCase().includes(clq) ||
    (r.entry.code ?? '').toLowerCase().includes(clq) ||
    (r.entry.summary ?? '').toLowerCase().includes(clq);
  const areas = clArea === 'all' ? AREA_COLS : AREA_COLS.filter((a) => a === clArea);
  const sections = areas
    .map((a) => ({ area: a, rows: pageRowsInArea(a).filter(rowPass) }))
    .filter((s) => s.rows.length > 0);
  const total = sections.reduce((n, s) => n + s.rows.length, 0);

  return (
    <Flex direction="column" flex="1" minW="0">
      {/* 상단 바 */}
      <Flex align="center" gap="8px" px="18px" h="52px" borderBottom={`1px solid ${t.border}`} bg={t.panel} flexShrink={0}>
        <IconList c={t.accent} />
        <Text fontSize="14px" fontWeight="800" color={t.text}>작업페이지 한눈에 보기</Text>
        <Text fontSize="12px" color={t.textMuted}>영역별 작업 화면과 상태를 한눈에</Text>
      </Flex>

      {/* 필터: 영역 + 검색 */}
      <Flex align="center" gap="6px" px="18px" py="12px" flexWrap="wrap" flexShrink={0}>
        <Text fontSize="11px" fontWeight="800" color={t.textMuted} pr="2px">영역</Text>
        <FilterChip t={t} label="전체" on={clArea === 'all'} onClick={() => setClArea('all')} />
        {AREA_COLS.map((a) => <FilterChip key={a} t={t} label={a} on={clArea === a} onClick={() => setClArea(a)} />)}
        <Box flex="1" minW="10px" />
        <Flex align="center" gap="6px" bg={t.searchBg} border={`1px solid ${t.borderSoft}`} borderRadius="8px" px="10px" h="32px" w="240px">
          <IconSearch s={13} c={t.textMuted} />
          <input value={clQuery} onChange={(e) => setClQuery(e.target.value)} placeholder="화면명·코드·요약 검색"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: t.text, fontSize: 12, fontFamily: 'inherit' }} />
        </Flex>
      </Flex>

      {/* 본문: 영역별 화면 리스트 */}
      <Box flex="1" overflowY="auto" bg={t.center} px="18px" pb="22px">
        {total === 0 ? (
          <Text fontSize="13px" color={t.textSub} pt="14px">{clq ? `"${clQuery.trim()}" 검색 결과 없음` : '표시할 화면이 없음'}</Text>
        ) : sections.map((s) => {
          const COLS = '88px minmax(110px,1.1fr) 60px minmax(120px,1.2fr) minmax(180px,2fr) 76px 22px';
          return (
          <Box key={s.area} pt="18px">
            {/* 영역 헤더 */}
            <Flex align="center" gap="8px" pb="9px" borderBottom={`2px solid ${t.border}`} mb="10px">
              <Text fontSize="15px" fontWeight="800" color={t.text}>{s.area}</Text>
              <Text fontSize="12px" fontWeight="800" color={t.textSub}>{s.rows.length}</Text>
            </Flex>
            <Box border={`1px solid ${t.border}`} overflow="hidden">
              {/* 컬럼 헤더 */}
              <Box display="grid" gridTemplateColumns={COLS} gap="12px" px="14px" py="9px" bg={t.searchBg} borderBottom={`1px solid ${t.border}`}>
                {['코드', '화면', '유형', '경로', '설명', '상태', ''].map((h, ci) => (
                  <Text key={ci} fontSize="11px" fontWeight="800" color={t.textSub} letterSpacing="0.03em">{h}</Text>
                ))}
              </Box>
              {s.rows.map((r, i) => {
                const e = r.entry;
                const sm = e.status ? STATUS_META[e.status] : null;
                const bc = e.breadcrumb.split('›').map((x) => x.trim()).filter(Boolean);
                const parentPath = bc.slice(0, -1).join(' › '); // 상위 경로(화면명 제외)
                return (
                  <Box as="button" key={e.id} onClick={() => onSelectScreen(e.id)} display="grid" gridTemplateColumns={COLS} gap="12px"
                    alignItems="center" w="100%" textAlign="left" px="14px" py="12px" bg={t.panel} cursor="pointer"
                    borderTop={i ? `1px solid ${t.borderSoft}` : undefined} _hover={{ bg: t.hover }}>
                    {/* 코드 */}
                    <Text fontFamily="monospace" fontSize="11.5px" fontWeight="700" color={t.textSub} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{e.code ?? '—'}</Text>
                    {/* 화면 (상위 경로 + 화면명) */}
                    <Box minW="0">
                      {parentPath && <Text fontSize="10.5px" fontWeight="600" color={t.textMuted} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" pb="1px">{parentPath} ›</Text>}
                      <Text fontSize="14px" fontWeight="800" color={t.text} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">{e.name}</Text>
                    </Box>
                    {/* 유형 (페이지/팝업 셀 분리) */}
                    <Box>
                      <Text as="span" fontSize="10px" fontWeight="800" color={e.type === 'page' ? t.onAccent : t.chipText} bg={e.type === 'page' ? t.accent : t.chip} px="6px" py="2px" borderRadius="4px" whiteSpace="nowrap">{e.type === 'page' ? '페이지' : '팝업'}</Text>
                    </Box>
                    {/* 경로 */}
                    <Text fontFamily="monospace" fontSize="12px" fontWeight="700" color={t.text} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">{e.docPath ?? '—'}</Text>
                    {/* 설명 (셀 분리 · 줄바꿈 허용) */}
                    <Text fontSize="13.5px" fontWeight="500" color={t.text} lineHeight="1.6">{e.summary || '—'}</Text>
                    {/* 상태 */}
                    <Box>{sm && <Text as="span" fontSize="11px" fontWeight="800" bg={sm.bg} color={sm.fg} px="9px" py="3px" borderRadius="6px" whiteSpace="nowrap">{e.status}</Text>}</Box>
                    {/* 이동 */}
                    <Text fontSize="14px" fontWeight="700" color={t.textSub} textAlign="right">→</Text>
                  </Box>
                );
              })}
            </Box>
          </Box>
          );
        })}
      </Box>
    </Flex>
  );
}

