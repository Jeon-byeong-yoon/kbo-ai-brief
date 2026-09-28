import { describe, it, expect } from 'vitest';
import { findTeam, naverCodeOf, teamLogoSrc, TEAM_CODES, TEAM_ASSETS } from './team-assets';

describe('구단 찾기', () => {
  it('네이버 코드로 찾는다', () => {
    expect(findTeam('OB')?.code).toBe('DOOSAN');
    expect(findTeam('WO')?.code).toBe('KIWOOM');
    expect(findTeam('HT')?.code).toBe('KIA');
    expect(findTeam('SK')?.code).toBe('SSG');
    expect(findTeam('LT')?.code).toBe('LOTTE');
    expect(findTeam('SS')?.code).toBe('SAMSUNG');
    expect(findTeam('HH')?.code).toBe('HANWHA');
  });

  it('한글 이름으로 찾는다', () => {
    expect(findTeam('두산')?.code).toBe('DOOSAN');
    expect(findTeam('두산 베어스')?.code).toBe('DOOSAN');
    expect(findTeam('KIA 타이거즈')?.code).toBe('KIA');
  });

  it('과거 구단명도 같은 프랜차이즈로 잇는다 — 기록실이 옛 이름으로 준다', () => {
    expect(findTeam('넥센')?.code).toBe('KIWOOM');
    expect(findTeam('해태')?.code).toBe('KIA');
    expect(findTeam('SK')?.code).toBe('SSG');
  });

  it('여러 힌트 중 먼저 맞는 것을 쓴다', () => {
    expect(findTeam(undefined, '', 'SS')?.code).toBe('SAMSUNG');
  });

  it('모르는 값이면 null', () => {
    expect(findTeam('없는팀')).toBeNull();
    expect(findTeam(null, undefined, '')).toBeNull();
  });
});

describe('네이버 코드 되돌리기', () => {
  it('내부 코드에서 네이버 코드로', () => {
    expect(naverCodeOf('SAMSUNG')).toBe('SS');
    expect(naverCodeOf('DOOSAN')).toBe('OB');
    expect(naverCodeOf('SSG')).toBe('SK');
  });

  it('열 구단 모두 왕복이 된다', () => {
    for (const code of TEAM_CODES) {
      const naver = naverCodeOf(code);
      expect(naver).not.toBeNull();
      expect(findTeam(naver!)?.code).toBe(code);
    }
  });
});

describe('엠블럼', () => {
  it('열 구단이 전부 있다', () => {
    expect(TEAM_CODES).toHaveLength(10);
  });

  it('파일이 있으면 캐시 무력화 버전이 붙는다 — 확장자가 같으면 브라우저가 옛 이미지를 준다', () => {
    const src = teamLogoSrc(TEAM_ASSETS.LG);
    expect(src).toMatch(/^\/teams\/lg\.png\?v=\d+$/);
  });

  it('파일을 null 로 두면 배지로 떨어진다 — 상표 문제로 언제든 뺄 수 있어야 한다', () => {
    expect(teamLogoSrc({ ...TEAM_ASSETS.LG, logo: null })).toBeNull();
    expect(teamLogoSrc(null)).toBeNull();
  });

  it('구단마다 라이트·다크 상징색이 둘 다 있다', () => {
    for (const code of TEAM_CODES) {
      const t = TEAM_ASSETS[code];
      expect(t.light).toHaveLength(2);
      expect(t.dark).toHaveLength(2);
      expect(t.light[0]).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(t.dark[0]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
