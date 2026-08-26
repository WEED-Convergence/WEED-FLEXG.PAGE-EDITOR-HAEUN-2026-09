// 설정 목록(정책·기능) 구성요소 — 2026-08-26 디자인관리 기본설정 개편에서 추가.
// 기존 Toggle(OFF ●— ON)·TabStrip(사각 탭)과 별개 패턴이라 새 컴포넌트로 둔다.
import { Box, Flex, Text } from '@chakra-ui/react';
import { colors, FONT } from '../../../tokens';

/**
 * 상태 라벨을 품은 토글 — 켜짐이면 「사용」, 꺼짐이면 「해제」가 토글 안에 들어간다.
 * 좌우에 OFF/ON 글자가 붙는 기존 Toggle 과 달리, 상태를 글자 하나로 읽게 한다.
 */
export function StatusToggle({
  on, onToggle, onLabel = '사용', offLabel = '해제',
}: {
  on: boolean; onToggle: () => void; onLabel?: string; offLabel?: string;
}) {
  const knob = (
    <Box w="16px" h="16px" borderRadius="100px" bg={colors.white} flexShrink={0} boxShadow="0 1px 2px rgba(0,0,0,0.2)" />
  );
  const label = (
    <Flex px="6px" align="center" justify="center">
      <Text fontFamily={FONT} fontWeight="700" fontSize="10px" letterSpacing="-0.2px" lineHeight="1.3"
        color={on ? colors.white : colors.grAA} whiteSpace="nowrap">
        {on ? onLabel : offLabel}
      </Text>
    </Flex>
  );
  return (
    <Flex as="button" onClick={onToggle} align="center" p="4px" borderRadius="100px" cursor="pointer" flexShrink={0}
      bg={on ? colors.greenToggle : colors.grE8}
      boxShadow={on ? 'inset 1px 1px 2px rgba(0,0,0,0.18)' : 'inset 1px 1px 4px rgba(0,0,0,0.1)'}>
      {on ? label : knob}
      {on ? knob : label}
    </Flex>
  );
}

/**
 * 알약형 탭 — 목록을 성격별로 나눠 보는 필터 탭.
 * 화면 안 콘텐츠를 통째로 바꾸는 TabStrip 과 달리, 같은 목록을 좁혀 보는 용도다.
 */
export function PillTabs({
  tabs, active, onChange,
}: {
  tabs: readonly string[]; active: string; onChange: (t: string) => void;
}) {
  return (
    <Flex gap="4px" align="center" wrap="wrap">
      {tabs.map((tab) => {
        const on = tab === active;
        return (
          <Flex as="button" key={tab} onClick={() => onChange(tab)} px="16px" py="8px" borderRadius="100px"
            align="center" justify="center" cursor="pointer" flexShrink={0}
            bg={on ? colors.greenToggle : colors.grF1}>
            <Text fontFamily={FONT} fontWeight="700" fontSize="12px" letterSpacing="-0.24px"
              color={on ? colors.white : colors.gr99} whiteSpace="nowrap">
              {tab}
            </Text>
          </Flex>
        );
      })}
    </Flex>
  );
}

/**
 * 초성 인덱스 뱃지 — 가나다순 목록에서 초성이 바뀌는 첫 항목에만 글자가 들어간다.
 * 글자가 없을 때도 같은 크기의 자리를 지켜, 뒤따르는 이름의 시작 위치가 흔들리지 않게 한다.
 */
export function InitialBadge({ letter, placeholderBg = colors.grF8 }: { letter?: string; placeholderBg?: string }) {
  if (!letter) return <Box w="16px" h="16px" borderRadius="100px" bg={placeholderBg} flexShrink={0} />;
  return (
    <Flex w="16px" h="16px" borderRadius="100px" bg={colors.grB8} align="center" justify="center" flexShrink={0}>
      <Text fontFamily={FONT} fontWeight="700" fontSize="12px" letterSpacing="-0.24px" color={colors.white} lineHeight="1">
        {letter}
      </Text>
    </Flex>
  );
}
