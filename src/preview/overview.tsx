/* ============================================================
 *  프로토타입 개요(표지) — /preview/overview
 *  이 화면 자체가 문서라 docs 셸에서 우측 설명 패널 없이 전체 폭으로 뜬다.
 * ============================================================ */
import { useState, useEffect } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { POLICY_ITEMS, DROPPED_ITEMS, POLICY_TABS, changeCounts, type ChangeType } from './policyData';

// 변경 유형 뱃지 색
const CHANGE_BG: Record<ChangeType, string> = {
  '토글 분리': '#EAF1FF', '명칭 변경': '#F3EAFE', '표기 정리': '#EFF7EF', '유지': '#F3F3F5',
};
const CHANGE_FG: Record<ChangeType, string> = {
  '토글 분리': '#2563EB', '명칭 변경': '#7C3AED', '표기 정리': '#1E8F1B', '유지': '#71717A',
};

const OV_SECTIONS = [
  { id: 'overview', n: '01', t: '개요 · 배경' },
  { id: 'goal', n: '02', t: '목적' },
  { id: 'metric', n: '03', t: '성공 기준' },
  { id: 'scope', n: '04', t: '범위' },
  { id: 'screen', n: '05', t: '화면 구성' },
  { id: 'compare', n: '06', t: 'As-Is / To-Be 비교' },
  { id: 'flow', n: '07', t: '주요 사용자 플로우' },
  { id: 'user', n: '08', t: '대상 사용자 · 권한' },
  { id: 'note', n: '09', t: '참고 사항' },
];

export function Overview() {
  const OFONT = "'Pretendard', system-ui, sans-serif";
  const GREEN = '#29BC25';
  const [active, setActive] = useState(OV_SECTIONS[0].id);
  // 비교표를 설정 구분(탭)별로 좁혀 보기
  const [cmpTab, setCmpTab] = useState<string>('전체');
  const cmpItems = cmpTab === '전체' ? POLICY_ITEMS : POLICY_ITEMS.filter((i) => i.cat === cmpTab);
  const cmpDropped = cmpTab === '전체' ? DROPPED_ITEMS : DROPPED_ITEMS.filter((d) => d.cat === cmpTab);

  // 스크롤 스파이 — 현재 보이는 섹션을 목차에서 하이라이트
  useEffect(() => {
    const els = OV_SECTIONS.map((s) => document.getElementById('ovsec-' + s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id.replace('ovsec-', ''));
      },
      { rootMargin: '0px 0px -68% 0px', threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = (id: string) => document.getElementById('ovsec-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // ── 샘플 콘텐츠 (실제 작업 시 이 내용을 자기 프로토타입 기준으로 교체) ──
  // ── 이 프로토타입의 내용 ──
  const meta = [
    { k: '서비스', v: 'FLEXG' },
    { k: '페이지', v: '어드민 › 디자인관리' },
    { k: '화면 수', v: '1 (기본설정)' },
    { k: '상태', v: '작성중' },
    { k: '작성자', v: '김희연' },
    { k: '최종 수정', v: '2026-08-26' },
  ];
  const goals: { t: string; d: string }[] = [
    { t: '사용 여부와 값의 분리', d: '기능을 켤지 말지와, 켠 뒤 어떤 값을 쓸지를 한 라디오 그룹에 섞지 않고 토글과 옵션으로 나눔.' },
    { t: '찾는 시간 단축', d: '설정을 성격별 6개 카테고리 탭으로 나누고, 목록은 가나다순 + 초성 인덱스로 정렬해 이름만 알면 바로 찾게 함.' },
    { t: '표기 통일', d: '같은 성격의 켜고 끄는 설정을 모두 같은 토글 하나로 표현하고, 설정명에서 `기능_` 접두사를 뺌.' },
    { t: '읽는 순서 고정', d: '한 줄을 [상태] → [이름] → [값] → [도움말] 순서로 고정해 목록을 훑을 때 시선이 흔들리지 않게 함.' },
  ];
  const metricRows = [
    ['특정 설정을 찾는 데 걸리는 시간', '이름을 알면 탭 1회 + 스크롤 없이 도달'],
    ['기능 사용 여부 오인 문의', '개편 전 대비 감소'],
    ['설정 저장 후 되돌리는 비율', '감소 (의도와 다르게 저장하는 일이 줄어듦)'],
  ];
  const scopeRows: { in: boolean; t: string; d: string }[] = [
    { in: true, t: '포함', d: '기본설정 페이지 최상단 「쇼핑몰 정책 및 기능」 영역 — 카테고리 탭 7개 · 설정 28개 · 상태 토글 · 초성 인덱스' },
    { in: false, t: '제외', d: '같은 페이지 아래 5개 영역(쇼핑몰 정보 · 플로팅 액션 버튼 설정 · 쇼핑몰 하단 안내 · 회사소개 · SNS 링크) — As-Is 유지' },
  ];
  const screenAreas: [string, string, string][] = [
    ['카테고리 탭', '설정을 성격별로 나눠 보는 알약형 탭 7개', '전체 · 화면·노출 · 상품·장바구니 · 구매후기 · 주문·결제 · 회원관리 · 정산·재고'],
    ['상태 토글', '기능을 쓸지 말지를 한 눈에 보여 주는 열', '사용 / 해제 (라벨이 토글 안에 들어감)'],
    ['초성 인덱스', '가나다순 목록에서 초성이 바뀌는 첫 설정에만 붙는 뱃지', 'ㄱ ㄷ ㄹ ㅂ ㅅ ㅇ ㅈ ㅊ ㅋ ㅌ ㅎ · 한글이 아니면 #'],
    ['설정명', '무엇을 켜고 끄는지 알려 주는 이름', '`기능_` 접두사 제거 · 하위 설정은 ㄴ 로 계층 표시'],
    ['옵션', '기능을 켰을 때 고르는 값', '라디오 · 체크박스 · 숫자 입력 · URL 입력'],
    ['도움말', '그 설정이 어디에 어떻게 반영되는지 설명', '옵션 아래 줄에 ⓘ 로 표기 · 연결 화면은 초록 링크'],
  ];
  const flowSteps = [
    '디자인관리 › 기본설정으로 들어가면 「전체」 탭에 28개 설정이 가나다순으로 펼쳐진다.',
    '찾는 설정의 성격을 알면 카테고리 탭을, 이름을 알면 초성 뱃지를 훑어 위치를 잡는다.',
    '왼쪽 토글로 그 기능을 쓸지 말지 먼저 정한다.',
    '켠 설정만 오른쪽 옵션에서 값(형태·기준·기간 등)을 고른다.',
    '영역 하단의 「변경사항 적용」으로 저장한다.',
  ];
  const userRows: [string, string, string][] = [
    ['쇼핑몰 운영자', '기본설정 전체', '판매 정책·기능 on/off · 취소/재고 기준 조정'],
    ['관리자', '기본설정 전체 + 하위 메뉴', '초기 세팅 · 정책 일괄 점검'],
    ['디자이너 · 개발', '문서 열람', '개편 범위와 행 구조 확인'],
  ];
  const notes = [
    '개편 범위는 「쇼핑몰 정책 및 기능」 한 영역이며, 아래 5개 영역은 As-Is 토글(OFF ●— ON)을 그대로 쓴다 — 한 페이지 안에서 토글 표기가 두 가지로 갈린다.',
    'Figma 시안이 있는 탭은 「전체」와 「화면·노출」 둘뿐이고, 나머지 5개 탭은 「전체」의 순서·규칙을 그대로 적용해 구성했다.',
    'As-Is 에 있던 설정 7개가 개편 「전체」 탭에 없다 — 제거·이관 여부가 정해지지 않아 보류로 표기한다.',
  ];

  const label = { fontSize: '13px', fontWeight: 800, color: GREEN, letterSpacing: '0.02em' } as const;
  const linkStyle = { display: 'inline-flex', alignItems: 'center', gap: '6px', height: '40px', padding: '0 18px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' } as const;
  const th = { fontSize: '12.5px', fontWeight: 800, color: '#71717A', letterSpacing: '0.01em' } as const;

  const Sec = ({ id, n, t, children }: { id: string; n: string; t: string; children: React.ReactNode }) => (
    <Box id={'ovsec-' + id} pt="58px" scrollMarginTop="74px">
      <Flex align="center" gap="10px" pb="14px">
        <Text fontFamily="monospace" fontSize="16px" fontWeight={700} color={GREEN}>{n}</Text>
        <Text fontSize="21px" fontWeight={800} letterSpacing="-0.01em">{t}</Text>
      </Flex>
      {children}
    </Box>
  );

  // 문서형 표 — 라운드 없이 직사각, 셀은 문자열 또는 노드
  const DTable = ({ cols, rows }: { cols: { h: string; w?: string }[]; rows: React.ReactNode[][] }) => (
    <Box bg="#fff" border="1px solid #E8E8EA" overflow="hidden">
      <Flex bg="#F7F7F8" borderBottom="1px solid #EAEAEC">
        {cols.map((c, i) => (
          <Box key={i} flex={c.w ? undefined : '1'} w={c.w} flexShrink={c.w ? 0 : undefined} px="16px" py="11px" borderLeft={i ? '1px solid #EAEAEC' : undefined}>
            <Text {...th}>{c.h}</Text>
          </Box>
        ))}
      </Flex>
      {rows.map((r, ri) => (
        <Flex key={ri} borderTop={ri ? '1px solid #F0F0F2' : undefined} align="stretch">
          {r.map((cell, ci) => (
            <Box key={ci} flex={cols[ci].w ? undefined : '1'} w={cols[ci].w} flexShrink={cols[ci].w ? 0 : undefined} px="16px" py="13px" borderLeft={ci ? '1px solid #F0F0F2' : undefined}>
              {typeof cell === 'string' ? <Text fontSize="14px" color="#3F3F46" lineHeight="1.65">{cell}</Text> : cell}
            </Box>
          ))}
        </Flex>
      ))}
    </Box>
  );

  return (
    <Box minH="100dvh" bg="#F6F6F7" fontFamily={OFONT} color="#18181B">
      {/* ── 고정 바: 스크롤해도 화면명과 바로가기가 항상 보이게 ── */}
      <Flex position="sticky" top="0" zIndex={50} bg="rgba(255,255,255,0.92)" backdropFilter="blur(8px)"
        borderBottom="1px solid #E4E4E7" px="48px" py="12px" align="center" gap="20px">
        <Flex align="center" gap="10px" minW="0" flex="1">
          <Text as="span" bg={GREEN} color="#fff" fontSize="11.5px" fontWeight={800} borderRadius="6px" px="8px" py="3px" flexShrink={0}>FLEXG</Text>
          <Text fontSize="15px" fontWeight={800} letterSpacing="-0.01em" truncate>디자인관리 기본설정 — 쇼핑몰 정책 및 기능</Text>
        </Flex>
        <Flex gap="8px" flexShrink={0}>
          <a href="/components" target="_blank" rel="noopener" style={{ ...linkStyle, height: '32px', padding: '0 14px', fontSize: '13px', background: '#18181B', color: '#fff' }}>컴포넌트북 열기 ↗</a>
          <a href="/components/flexg/design-tokens" target="_blank" rel="noopener" style={{ ...linkStyle, height: '32px', padding: '0 14px', fontSize: '13px', background: '#fff', color: '#3F3F46', border: '1px solid #E4E4E7' }}>디자인 토큰 보기 ↗</a>
        </Flex>
      </Flex>

      {/* ── 표지: 제목 + 메타(서비스~작성자·최종수정) + CTA ── */}
      <Box bg="#fff" borderBottom="1px solid #E4E4E7" px="48px" py="46px">
        <Box>
          {/* 상단: 제목 블록(좌) + CTA(우) */}
          <Flex justify="space-between" align="flex-start" gap="24px" wrap="wrap" pb="26px">
            <Box>
              <Text {...label} pb="14px">프로토타입 개요</Text>
              <Flex gap="8px" pb="16px" wrap="wrap">
                <Text as="span" bg={GREEN} color="#fff" fontSize="13px" fontWeight={800} borderRadius="7px" px="11px" py="5px">FLEXG</Text>
                <Text as="span" bg="#F1F1F3" color="#3F3F46" fontSize="13px" fontWeight={700} borderRadius="7px" px="11px" py="5px">어드민 › 디자인관리</Text>
              </Flex>
              <Text fontSize="34px" fontWeight={800} letterSpacing="-0.02em" pb="14px">디자인관리 기본설정 — 쇼핑몰 정책 및 기능</Text>
              <Text fontSize="16px" color="#52525B" lineHeight="1.7" maxW="900px">
                쇼핑몰의 판매 정책과 기능을 켜고 끄는 화면. 기능 사용 여부와 세부 값이 한 줄에 뒤섞여 있던 목록을, 카테고리 탭과 상태 토글로 나눠 다시 구성한다.
              </Text>
            </Box>
          </Flex>

          {/* 메타 정보 — 표지 안에 배치 */}
          <Flex bg="#FAFAFA" border="1px solid #ECECEE" overflow="hidden" wrap="wrap">
            {meta.map((m, i) => (
              <Box key={m.k} flex="1 1 150px" px="18px" py="14px" borderLeft={i === 0 ? undefined : '1px solid #ECECEE'}>
                <Text fontSize="12px" fontWeight={700} color="#A1A1AA" pb="5px">{m.k}</Text>
                <Text fontSize="14.5px" fontWeight={700} color="#27272A">{m.v}</Text>
              </Box>
            ))}
          </Flex>
        </Box>
      </Box>

      {/* ── 본문(좌) + 플로팅 목차(우) ── */}
      <Box px="48px" pt="6px" pb="56px">
        <Flex gap="48px" align="flex-start">
          <Box flex="1" minW="0">
            {/* 01 개요·배경 */}
            <Sec id="overview" n="01" t="개요 · 배경">
              <Text fontSize="15px" color="#3F3F46" lineHeight="1.9" whiteSpace="pre-line">
                {'기본설정의 「쇼핑몰 정책 및 기능」은 쇼핑몰 운영 규칙을 한자리에서 켜고 끄는 화면이다. 그동안 설정이 한 페이지에 평면으로 나열돼 있었고, 기능을 쓸지 말지와 어떤 값을 쓸지가 같은 라디오 그룹에 섞여 있었다. `사용안함`이 선택지 안에 들어 있어 지금 켜져 있는지 꺼져 있는지부터 읽어 내야 했고, 설정명 앞에는 `기능_` 이 반복됐다.\n\n개편은 두 가지를 나눈다. 하나는 성격별 카테고리 탭으로 목록을 쪼개 찾는 범위를 좁히는 것, 다른 하나는 사용 여부를 상태 토글로 빼내 옵션에는 켠 뒤 고르는 값만 남기는 것이다. 운영자는 왼쪽에서 쓸지 말지를 먼저 정하고, 켠 설정만 오른쪽에서 값을 조정한다.'}
              </Text>
            </Sec>

            {/* 02 목적 */}
            <Sec id="goal" n="02" t="목적">
              <Flex direction="column" gap="14px">
                {goals.map((g) => (
                  <Flex key={g.t} align="flex-start" gap="12px">
                    <Box mt="7px" w="6px" h="6px" borderRadius="full" bg={GREEN} flexShrink={0} />
                    <Box>
                      <Text fontSize="15px" fontWeight={800} color="#27272A" pb="2px">{g.t}</Text>
                      <Text fontSize="14px" color="#52525B" lineHeight="1.7">{g.d}</Text>
                    </Box>
                  </Flex>
                ))}
              </Flex>
            </Sec>

            {/* 03 성공 기준 */}
            <Sec id="metric" n="03" t="성공 기준">
              <Text fontSize="14px" color="#71717A" lineHeight="1.7" pb="14px">이 개편이 잘 작동하는지 판단하는 기준(예시 목표치).</Text>
              <DTable
                cols={[{ h: '지표' }, { h: '목표', w: '220px' }]}
                rows={metricRows.map((r) => [
                  <Text key="a" fontSize="14px" fontWeight={700} color="#27272A" lineHeight="1.6">{r[0]}</Text>,
                  <Text key="b" fontSize="14px" color="#3F3F46" fontWeight={700} lineHeight="1.6">{r[1]}</Text>,
                ])}
              />
            </Sec>

            {/* 04 범위 */}
            <Sec id="scope" n="04" t="범위">
              <DTable
                cols={[{ h: '구분', w: '110px' }, { h: '내용' }]}
                rows={scopeRows.map((s) => [
                  <Flex key="a" h="100%" align="center">
                    <Text as="span" fontSize="12px" fontWeight={800} borderRadius="6px" px="9px" py="4px" bg={s.in ? '#EAF8EA' : '#F3F3F5'} color={s.in ? '#1E8F1B' : '#71717A'}>{s.t}</Text>
                  </Flex>,
                  s.d,
                ])}
              />
            </Sec>

            {/* 05 화면 구성 */}
            <Sec id="screen" n="05" t="화면 구성">
              <Text fontSize="14px" color="#71717A" lineHeight="1.7" pb="14px">개편 영역의 한 줄은 다음 순서로 읽힌다 — 상태 토글 → 초성 뱃지 + 설정명 → 옵션 → 도움말.</Text>
              <DTable
                cols={[{ h: '영역', w: '190px' }, { h: '설명' }, { h: '주요 데이터', w: '230px' }]}
                rows={screenAreas.map((a) => [
                  <Text key="a" fontSize="14px" fontWeight={800} color="#18181B" lineHeight="1.55">{a[0]}</Text>,
                  a[1],
                  <Text key="c" fontSize="13px" color="#71717A" lineHeight="1.6">{a[2]}</Text>,
                ])}
              />
              <a href="/docs/basic-settings" target="_top" style={{ textDecoration: 'none', display: 'block' }}>
                <Flex mt="10px" bg="#fff" border="1px solid #E8E8EA" px="18px" py="15px" align="center" gap="14px" _hover={{ bg: '#FAFAFA' }} transition="background .12s">
                  <Box flex="1">
                    <Text fontSize="14px" fontWeight={800} color="#18181B" pb="3px">기본설정 화면 미리보기</Text>
                    <Text fontSize="13px" color="#71717A">개편 화면과 영역별 설명을 문서 프리뷰로 열기</Text>
                  </Box>
                  <Text fontSize="17px" color={GREEN} fontWeight={700}>→</Text>
                </Flex>
              </a>
            </Sec>

            {/* 06 As-Is / To-Be 비교 */}
            <Sec id="compare" n="06" t="As-Is / To-Be 비교">
              <Text fontSize="14px" color="#71717A" lineHeight="1.7" pb="16px">
                개편 전에는 설정 35개가 한 페이지에 평면으로 나열됐다. 기능을 쓸지 말지가 옵션 목록에 섞여 있었고, 토글이 있는 행과 없는 행이 번갈아 나와 목록을 훑는 기준이 없었다. 개편에서는 28개가 카테고리 탭 7개로 나뉘고, 사용 여부는 전부 상태 토글로 빠진다.
              </Text>

              {/* 변경 유형별 건수 */}
              <Flex gap="10px" pb="18px" wrap="wrap">
                {changeCounts().map((c) => (
                  <Flex key={c.type} bg="#fff" border="1px solid #E8E8EA" px="16px" py="12px" align="baseline" gap="8px" flex="1 1 150px">
                    <Text fontSize="22px" fontWeight={800} color={CHANGE_FG[c.type]} lineHeight="1">{c.count}</Text>
                    <Text fontSize="13px" fontWeight={700} color="#52525B">{c.type}</Text>
                  </Flex>
                ))}
                <Flex bg="#fff" border="1px solid #E8E8EA" px="16px" py="12px" align="baseline" gap="8px" flex="1 1 150px">
                  <Text fontSize="22px" fontWeight={800} color="#B45309" lineHeight="1">{DROPPED_ITEMS.length}</Text>
                  <Text fontSize="13px" fontWeight={700} color="#52525B">개편 화면에 없음</Text>
                </Flex>
              </Flex>

              {/* 설정 구분(탭)별 보기 */}
              <Flex gap="6px" pb="14px" wrap="wrap" align="center">
                {POLICY_TABS.map((t) => {
                  const on = t === cmpTab;
                  const n = t === '전체' ? POLICY_ITEMS.length : POLICY_ITEMS.filter((i) => i.cat === t).length;
                  return (
                    <Flex as="button" key={t} onClick={() => setCmpTab(t)} align="center" gap="6px"
                      px="14px" py="8px" borderRadius="100px" cursor="pointer"
                      bg={on ? '#18181B' : '#fff'} border={`1px solid ${on ? '#18181B' : '#E4E4E7'}`}>
                      <Text fontSize="13px" fontWeight={on ? 800 : 600} color={on ? '#fff' : '#52525B'} whiteSpace="nowrap">{t}</Text>
                      <Text fontFamily="monospace" fontSize="11.5px" fontWeight={700} color={on ? '#A1A1AA' : '#B0B4BB'}>{n}</Text>
                    </Flex>
                  );
                })}
              </Flex>

              {/* 설정 대비표 */}
              <Text fontSize="15px" fontWeight={800} color="#27272A" pb="10px">
                {cmpTab === '전체' ? `설정 ${cmpItems.length}개 — 조작 방식 대비` : `${cmpTab} — 설정 ${cmpItems.length}개`}
              </Text>
              <Box overflowX="auto" pb="4px">
              <Box minW="1180px">
              <DTable
                cols={[{ h: '설정명 (As-Is → To-Be)', w: '260px' }, { h: 'As-Is 조작 방식', w: '260px' }, { h: 'To-Be 조작 방식', w: '260px' }, { h: '달라진 점' }, { h: '유형', w: '100px' }]}
                rows={cmpItems.map((it) => [
                  <Box key="a">
                    <Text fontSize="13px" color="#A1A1AA" textDecoration="line-through" lineHeight="1.5">{it.asIsName}</Text>
                    <Text fontSize="14px" fontWeight={800} color="#18181B" lineHeight="1.5">
                      {it.child ? `ㄴ ${it.name}` : it.name}
                    </Text>
                    <Text fontSize="12px" color="#71717A" pt="2px">{it.cat}</Text>
                  </Box>,
                  <Text key="b" fontSize="13px" color="#71717A" lineHeight="1.6">{it.asIs}</Text>,
                  <Text key="c" fontSize="13px" color="#3F3F46" lineHeight="1.6" fontWeight={600}>{it.toBe}</Text>,
                  <Text key="d" fontSize="13px" color="#52525B" lineHeight="1.65">{it.diff}</Text>,
                  <Flex key="e">
                    <Text as="span" fontSize="11.5px" fontWeight={800} borderRadius="6px" px="8px" py="4px" whiteSpace="nowrap"
                      bg={CHANGE_BG[it.changeType]} color={CHANGE_FG[it.changeType]}>{it.changeType}</Text>
                  </Flex>,
                ])}
              />
              </Box>
              </Box>

              {/* 개편 화면에 없는 설정 */}
              <Text fontSize="15px" fontWeight={800} color="#27272A" pt="34px" pb="6px">
                개편 화면에 없는 설정 {cmpDropped.length}개{cmpTab === '전체' ? '' : ` — ${cmpTab}`}
              </Text>
              <Text fontSize="14px" color="#71717A" lineHeight="1.7" pb="12px">
                「전체」 탭이 전체 목록이므로 잘려서 안 보이는 것이 아니라 실제로 빠져 있다. 제거인지 다른 화면으로의 이관인지 정해지지 않아 보류로 둔다.
              </Text>
              <Box overflowX="auto" pb="4px">
              <Box minW="900px">
              <DTable
                cols={[{ h: '설정명', w: '330px' }, { h: 'As-Is 조작 방식', w: '300px' }, { h: '원래 성격' }, { h: '처리 방침', w: '96px' }]}
                rows={cmpDropped.map((d) => [
                  <Text key="a" fontSize="14px" fontWeight={700} color="#27272A" lineHeight="1.55">{d.name}</Text>,
                  <Text key="b" fontSize="13px" color="#71717A" lineHeight="1.6">{d.asIs}</Text>,
                  <Text key="c" fontSize="13px" color="#71717A" lineHeight="1.6">{d.cat}</Text>,
                  <Flex key="d">
                    <Text as="span" fontSize="11.5px" fontWeight={800} borderRadius="6px" px="8px" py="4px" bg="#FDF0E1" color="#B45309" whiteSpace="nowrap">보류</Text>
                  </Flex>,
                ])}
              />
              </Box>
              </Box>

              {/* 목록 구조 자체의 변화 */}
              <Text fontSize="15px" fontWeight={800} color="#27272A" pt="34px" pb="10px">목록 구조</Text>
              <DTable
                cols={[{ h: '항목', w: '150px' }, { h: 'As-Is' }, { h: 'To-Be' }]}
                rows={[
                  ['목록 구조', '한 페이지에 35개를 평면 나열', '카테고리 탭 7개 · 가나다순 · 초성 인덱스 뱃지'],
                  ['설정명', '`기능_` 접두사가 모든 이름 앞에 붙음', '접두사 제거'],
                  ['사용 여부', '옵션 목록에 `사용안함` 으로 섞임', '왼쪽 상태 토글로 분리'],
                  ['토글 표기', '좌우에 OFF / ON 글자가 붙은 슬라이더', '상태 라벨을 품은 토글 (`사용` / `해제`)'],
                  ['도움말', '옵션 오른쪽 같은 줄', '옵션 아래 별도 줄'],
                  ['계층', '하위 설정도 같은 높이로 나열', '부모 아래에 붙이고 초성 인덱스에서 제외'],
                ].map((r) => [
                  <Text key="a" fontSize="14px" fontWeight={800} color="#18181B" lineHeight="1.55">{r[0]}</Text>,
                  <Text key="b" fontSize="13.5px" color="#71717A" lineHeight="1.65">{r[1]}</Text>,
                  <Text key="c" fontSize="13.5px" color="#3F3F46" fontWeight={600} lineHeight="1.65">{r[2]}</Text>,
                ])}
              />
            </Sec>

            {/* 07 주요 사용자 플로우 */}
            <Sec id="flow" n="07" t="주요 사용자 플로우">
              <Flex direction="column" gap="12px">
                {flowSteps.map((s, i) => (
                  <Flex key={i} align="flex-start" gap="14px">
                    <Flex w="24px" h="24px" flexShrink={0} align="center" justify="center" borderRadius="full" bg="#EAF8EA" mt="1px">
                      <Text fontSize="12px" fontWeight={800} color="#1E8F1B">{i + 1}</Text>
                    </Flex>
                    <Text fontSize="15px" color="#3F3F46" lineHeight="1.7" pt="2px">{s}</Text>
                  </Flex>
                ))}
              </Flex>
            </Sec>

            {/* 07 대상 사용자·권한 */}
            <Sec id="user" n="08" t="대상 사용자 · 권한">
              <DTable
                cols={[{ h: '역할', w: '170px' }, { h: '접근 범위', w: '190px' }, { h: '주요 사용' }]}
                rows={userRows.map((u) => [
                  <Text key="a" fontSize="14px" fontWeight={800} color="#18181B" lineHeight="1.55">{u[0]}</Text>,
                  <Text key="b" fontSize="14px" color="#3F3F46" lineHeight="1.6">{u[1]}</Text>,
                  u[2],
                ])}
              />
            </Sec>

            {/* 08 참고 사항 */}
            <Sec id="note" n="09" t="참고 사항">
              <Box bg="#FBFBFC" border="1px solid #EDEDEF" p="18px 20px">
                <Flex direction="column" gap="10px">
                  {notes.map((n, i) => (
                    <Flex key={i} align="flex-start" gap="10px">
                      <Box mt="8px" w="5px" h="5px" borderRadius="full" bg="#C4C4C8" flexShrink={0} />
                      <Text fontSize="14px" color="#52525B" lineHeight="1.7">{n}</Text>
                    </Flex>
                  ))}
                </Flex>
              </Box>
            </Sec>
          </Box>

          {/* 플로팅 목차 — 각 영역으로 점프 */}
          <Box as="aside" w="212px" flexShrink={0} display={{ base: 'none', lg: 'block' }} position="sticky" top="74px" alignSelf="flex-start">
            <Box bg="#fff" border="1px solid #ECECEE" borderRadius="12px" p="14px 12px" boxShadow="0 1px 3px rgba(0,0,0,0.04)">
              <Text fontSize="11px" fontWeight={800} color="#A1A1AA" letterSpacing="0.06em" pb="10px" pl="8px">이 페이지</Text>
              <Flex direction="column" gap="1px">
                {OV_SECTIONS.map((s) => {
                  const on = active === s.id;
                  return (
                    <Flex as="button" key={s.id} onClick={() => go(s.id)} align="center" gap="9px" w="100%"
                      px="8px" py="7px" borderRadius="7px" cursor="pointer" bg={on ? '#F1FAF1' : 'transparent'}
                      _hover={{ bg: on ? '#F1FAF1' : '#F6F6F7' }} transition="background .12s" textAlign="left">
                      <Text fontFamily="monospace" fontSize="11px" fontWeight={700} color={on ? GREEN : '#C4C4C8'}>{s.n}</Text>
                      <Text fontSize="13px" fontWeight={on ? 700 : 500} color={on ? '#18181B' : '#71717A'}>{s.t}</Text>
                    </Flex>
                  );
                })}
              </Flex>
            </Box>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}

