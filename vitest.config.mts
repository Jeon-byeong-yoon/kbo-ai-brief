import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 경로에 공백과 한글이 들어 있어 URL 로 다루면 깨진다. fileURLToPath 로 풀어 준다.
const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    // tsconfig 의 "@/*" 경로 별칭을 그대로 쓴다.
    alias: { '@': path.resolve(root, 'src') },
  },
  test: {
    include: ['src/**/*.test.ts'],
    // .next 안에 빌드 산출물과 파일 동기화 도구가 만든 사본이 있어 제외한다.
    exclude: ['node_modules/**', '.next/**'],
  },
});
