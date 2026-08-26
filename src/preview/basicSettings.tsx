/* ============================================================
 *  디자인관리 > 기본설정 — 개편 화면 프리뷰
 * ------------------------------------------------------------
 *  Figma `디자인관리_20260826` (imJJhguPyLoOYFyR93ExfR)
 *  개편 대상은 최상단 「쇼핑몰 정책 및 기능」 한 곳이고,
 *  그 아래 5개 영역은 As-Is 그대로라 범위를 표시만 한다.
 *
 *  ※ 상태 토글·알약탭·초성 뱃지는 디자인시스템(policyParts)으로 옮겨 배럴에서 가져온다.
 *    설정 행(PolicyRow)·영역 박스(SetBox)는 이 화면 전용 조립이다.
 * ============================================================ */
import { useState } from 'react';
import { Box, Flex, Text, Input } from '@chakra-ui/react';
import {
  AdminLayout, colors, FONT, Radio, Checkbox, FilledButton, SelectInput,
  StatusToggle, PillTabs, InitialBadge,
} from '../design-system';
import { POLICY_ITEMS, POLICY_TABS, rowsOfTab, type PolicyItem, type PolicyOption } from './policyData';

// 이 화면에서 쓰는 색 — 전부 디자인 토큰에서 가져온다
const C = {
  rowBg: colors.grF8,
  line: colors.grE8,
  divider: colors.grD9,
  tabOffBg: colors.grF1,
  tabOffText: colors.gr99,
  label: colors.gr72,
  help: colors.gr92,
  title: colors.gr42,
} as const;

/* ────────────────────────────────────────────────────────────
 *  이 화면 전용 조립 — 설정 목록의 행·영역 골격
 * ──────────────────────────────────────────────────────────── */

/** ⓘ 도움말 — 지정한 문구만 초록 굵게 강조 */
function HelpLine({ text, links = [] }: { text: string; links?: string[] }) {
  const parts: React.ReactNode[] = [];
  let rest = text;
  let key = 0;
  while (rest.length) {
    const hit = links
      .map((l) => ({ l, i: rest.indexOf(l) }))
      .filter((h) => h.i >= 0)
      .sort((a, b) => a.i - b.i)[0];
    if (!hit) { parts.push(rest); break; }
    if (hit.i > 0) parts.push(rest.slice(0, hit.i));
    parts.push(
      <Text as="span" key={`k${key++}`} fontWeight="700" color={colors.green} textDecoration="underline">
        {hit.l}
      </Text>,
    );
    rest = rest.slice(hit.i + hit.l.length);
  }
  return (
    <Text fontFamily={FONT} fontSize="12px" letterSpacing="-0.24px" color={C.help} lineHeight="1.4">
      ⓘ {parts}
    </Text>
  );
}

/** 좁은 숫자 입력칸 — 라디오 문장 사이에 끼는 값 */
function InlineNumber({ value }: { value: string }) {
  return (
    <Input defaultValue={value} w="52px" h="auto" bg="white" border={`1px solid ${C.line}`} borderRadius="4px"
      px="8px" pt="4px" pb="5px" textAlign="center" fontFamily={FONT} fontSize="12px" color={C.label}
      _focus={{ boxShadow: 'none', borderColor: colors.bcPoint }} />
  );
}

/** 설정 한 줄의 옵션 영역 — 라디오 / 체크박스 / 라디오+입력 */
function OptionView({ option }: { option: PolicyOption }) {
  const [sel, setSel] = useState(
    option.kind === 'radio' || option.kind === 'radio-num' ? option.selected
      : option.kind === 'radio-url' ? option.selected : null,
  );
  const [checked, setChecked] = useState<number[]>(option.kind === 'check' ? option.checked : []);

  if (option.kind === 'check') {
    return (
      <Flex gap="16px" align="center">
        {option.items.map((item, i) => (
          <Checkbox key={item} label={item} checked={checked.includes(i)}
            onClick={() => setChecked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]))} />
        ))}
      </Flex>
    );
  }
  if (option.kind === 'select') {
    return <SelectInput label={option.label} width="140px" />;
  }
  if (option.kind === 'radio-url') {
    return (
      <Flex gap="16px" align="center">
        {option.items.map((item, i) => (
          <Radio key={item} label={item} checked={sel === i} onClick={() => setSel(i)} />
        ))}
        <Input defaultValue={option.value} placeholder="" w="270px" h="auto" bg={C.line} border="none" borderRadius="4px"
          px="8px" pt="5px" pb="6px" fontFamily={FONT} fontSize="12px" color={C.label} _focus={{ boxShadow: 'none' }} />
      </Flex>
    );
  }
  if (option.kind === 'radio-num') {
    return (
      <Flex gap="16px" align="center">
        <Radio label={option.first} checked={sel === 0} onClick={() => setSel(0)} />
        <Flex gap="6px" align="center">
          <Radio label={option.prefix} checked={sel === 1} onClick={() => setSel(1)} />
          <InlineNumber value={option.value} />
          <Text fontFamily={FONT} fontSize="12px" letterSpacing="-0.24px" color={C.label} whiteSpace="nowrap">
            {option.suffix}
          </Text>
        </Flex>
      </Flex>
    );
  }
  return (
    <Flex gap="16px" align="center">
      {option.items.map((item, i) => (
        <Radio key={item} label={item} checked={sel === i} onClick={() => setSel(i)} />
      ))}
    </Flex>
  );
}

/** 설정 한 줄 — [상태 토글] │ [초성 뱃지 + 설정명] │ [옵션 / ⓘ 도움말] */
function PolicyRow({
  item, badge, anchor, on, onToggle, muted,
}: {
  item: PolicyItem; badge?: string; anchor?: boolean;
  on: boolean; onToggle: () => void;
  /** 부모 설정이 꺼져 있어 지금은 동작하지 않는 상태 */
  muted?: boolean;
}) {
  const stacked = Boolean(item.option && item.help);
  return (
    <Flex px="24px" py={stacked ? '12px' : undefined} h={stacked ? undefined : '44px'} gap="20px" align="center">
      {/* 상태 토글 — 없는 설정은 폭만 차지해 열을 맞춘다 */}
      <Box data-doc-mark={anchor ? 'toggle-col' : undefined} w="57px" flexShrink={0}>
        {item.toggle !== null && <StatusToggle on={on} onToggle={onToggle} />}
      </Box>
      <Box w="1px" h="12px" bg={item.toggle !== null ? C.divider : 'transparent'} flexShrink={0} />
      {/* 초성 뱃지 + 설정명. 하위 설정은 들여쓰기와 세로선으로 계층을 보인다 */}
      <Flex data-doc-mark={anchor ? 'index-col' : undefined} gap="8px" align="center" flexShrink={0}>
        <InitialBadge letter={badge} />
        <Flex w="200px" align="center">
          {item.child && (
            <Flex w="16px" alignSelf="stretch" justify="center" flexShrink={0}>
              <Box w="1px" bg={C.divider} />
            </Flex>
          )}
          <Text fontFamily={FONT} fontWeight="700" fontSize="12px" letterSpacing="-0.24px" color={C.label}>
            {item.name}
          </Text>
        </Flex>
      </Flex>
      {/* 옵션 + 도움말. 부모가 꺼져 있으면 옅게 두고 조작을 막는다 */}
      <Flex data-doc-mark={anchor ? 'option-col' : undefined} direction="column" gap="6px" justify="center" minW="0"
        opacity={muted ? 0.4 : 1} pointerEvents={muted ? 'none' : undefined}>
        {item.option && <OptionView option={item.option} />}
        {item.warn && (
          <Text fontFamily={FONT} fontWeight="700" fontSize="12px" letterSpacing="-0.24px" color={colors.red} lineHeight="1.4">
            ⓘ {item.warn}
          </Text>
        )}
        {item.help && <HelpLine text={item.help} links={item.helpLinks} />}
      </Flex>
    </Flex>
  );
}

/** 설정 영역 한 덩어리 — 제목 + 본문 + 하단 「변경사항 적용」 */
function SetBox({
  title, sub, children, mark, footer = true,
}: {
  title: string; sub?: React.ReactNode; children: React.ReactNode; mark?: string; footer?: boolean;
}) {
  return (
    <Box data-doc-mark={mark} pb="20px">
      <Flex gap="12px" align="center" pb="8px">
        <Text fontFamily={FONT} fontWeight="700" fontSize="18px" letterSpacing="-0.36px" color={C.title}>{title}</Text>
        {sub}
      </Flex>
      {children}
      {footer && (
        <Flex justify="center" py="15px">
          <FilledButton label="변경사항 적용" bg={colors.bcDefault} px="24px" pt="8px" pb="9px" markId={mark ? 'apply' : undefined} />
        </Flex>
      )}
    </Box>
  );
}

/** 개편 범위 밖 영역 — 자리만 한 박스로 접어 둔다(마커 없음) */
function LegacyBox({ areas }: { areas: string[] }) {
  return (
    <Box bg={C.rowBg} border={`1px solid ${C.line}`} borderRadius="6px" px="24px" py="18px">
      <Flex gap="12px" align="center" wrap="wrap">
        <Text fontFamily={FONT} fontWeight="700" fontSize="13px" color={C.label}>
          {areas.join(' · ')}
        </Text>
        <Flex bg={C.tabOffBg} borderRadius="100px" px="10px" py="3px" align="center">
          <Text fontFamily={FONT} fontWeight="700" fontSize="11px" color={C.tabOffText}>기존 동일</Text>
        </Flex>
      </Flex>
    </Box>
  );
}

/* ────────────────────────────────────────────────────────────
 *  화면
 * ──────────────────────────────────────────────────────────── */

const LNB = {
  title: '디자인관리',
  items: [
    { label: '기본 설정', active: true },
    { label: '폰트/색상/버튼' },
    { label: '아이콘' },
    { label: '메인 PC화면' },
    { label: '메인 레이아웃 관리' },
    { label: '좌측 슬라이드' },
    {
      label: '상품 상세페이지',
      sub: [
        { label: '상품 상세페이지 설정' },
        { label: '상품 상세정보 안내' },
        { label: '상품 상세페이지 배너' },
      ],
    },
    { label: '상품 이미지 및 리스트' },
    { label: '검색 관리' },
    {
      label: '배너 관리',
      sub: [
        { label: '배너 그룹' },
        { label: 'APP 시작 팝업' },
        { label: 'WEB 시작 팝업' },
        { label: '메인 최상단 배너' },
        { label: '주문/결제 배너' },
      ],
    },
  ],
};

export function BasicSettings() {
  // docs 셸이 iframe 을 열 때 ?tab=활성탭 을 실어 보낸다
  const initialTab = new URLSearchParams(window.location.search).get('tab');
  const [tab, setTab] = useState(
    initialTab && (POLICY_TABS as readonly string[]).includes(initialTab) ? initialTab : '전체',
  );
  const rows = rowsOfTab(tab);
  // 부모를 껐을 때 하위 설정을 옅게 처리해야 해서 토글 상태를 한곳에서 관리한다
  const [onMap, setOnMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(POLICY_ITEMS.map((i) => [i.name, i.toggle === 'on'])),
  );
  const toggleOne = (name: string) => setOnMap((m) => ({ ...m, [name]: !m[name] }));

  return (
    <AdminLayout navActive="home" sidebar={LNB}>
      <Box fontFamily={FONT} color={C.label} minW="1360px">
        {/* 1. 쇼핑몰 정책 및 기능 — 개편 대상 */}
        <SetBox title="쇼핑몰 정책 및 기능" mark="policy">
          {/* 카테고리 탭 */}
          <Box data-doc-mark="tabs" pb="12px">
            <PillTabs tabs={POLICY_TABS} active={tab} onChange={setTab} />
          </Box>

          {/* 설정 목록 — 탭이 바뀌어도 「전체」의 순서를 그대로 물려받는다 */}
          <Box data-doc-tab={tab} bg={C.rowBg} borderTop={`1px solid ${C.line}`} borderBottom={`1px solid ${C.line}`}>
            {rows.map((item, i) => {
              // 계층·토글없음은 그 유형이 처음 나오는 행에만 마커를 건다
              const firstChild = item.child && !rows.slice(0, i).some((r) => r.child);
              const firstNoToggle = item.toggle === null && !rows.slice(0, i).some((r) => r.toggle === null);
              // 열 설명 마커는 토글이 있는 첫 행에 걺 — 빈 토글 자리에 마커가 붙지 않게
              const colAnchor = item.toggle !== null && !rows.slice(0, i).some((r) => r.toggle !== null);
              // 하위 설정은 바로 위 상위 설정을 따른다. 상위가 꺼져 있으면 옅게
              const parent = item.child
                ? [...rows.slice(0, i)].reverse().find((r) => !r.child)
                : undefined;
              const muted = Boolean(parent && parent.toggle !== null && !onMap[parent.name]);
              return (
                <Box key={item.name} data-doc-mark={firstChild ? 'child' : firstNoToggle ? 'no-toggle' : undefined}>
                  <Box px="24px"><Box h="1px" bg={C.line} /></Box>
                  <PolicyRow item={item} badge={item.badge} anchor={colAnchor} muted={muted}
                    on={!!onMap[item.name]} onToggle={() => toggleOne(item.name)} />
                </Box>
              );
            })}
            <Box px="24px"><Box h="1px" bg={C.line} /></Box>
          </Box>
        </SetBox>

        {/* 2~6. 개편 범위 밖 — 마커 없이 「기존 동일」로만 표기 */}
        <LegacyBox
          areas={['쇼핑몰 정보', '플로팅 액션 버튼 설정', '쇼핑몰 하단 안내', '회사소개', 'SNS 링크']}
        />
      </Box>
    </AdminLayout>
  );
}
