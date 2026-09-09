/* ============================================================
 *  프리뷰 라우팅 — /preview/<화면id>
 *  docs 셸(중앙 iframe)이 여는 실제 화면들.
 *  화면을 추가하면 여기 분기와 src/docs/catalog.ts 의 route 를 함께 맞춘다.
 * ============================================================ */
import { Box, Text } from '@chakra-ui/react';
import { Overview } from './overview';
import { BasicSettings } from './basicSettings';
import { PageBuilder } from './pageBuilder';

export function DemoScreen() {
  const path = window.location.pathname.replace(/^\/preview\//, '');
  switch (path) {
    case 'overview':
      return <Overview />;
    case 'basic-settings':
      return <BasicSettings />;
    case 'page-builder':
      return <PageBuilder />;
    default:
      return (
        <Box minH="100dvh" bg="#F7F8FA" p="28px" fontFamily="'Pretendard', system-ui, sans-serif">
          <Text fontSize="15px" color="#3F3F46">알 수 없는 프리뷰: {path}</Text>
        </Box>
      );
  }
}
