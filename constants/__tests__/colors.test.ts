import { Colors } from '../colors';

describe('Colors', () => {
  describe('background', () => {
    it('primary equals #0D0D0D', () => {
      expect(Colors.background.primary).toBe('#0D0D0D');
    });

    it('surface equals #1A1A1A', () => {
      expect(Colors.background.surface).toBe('#1A1A1A');
    });
  });

  describe('text', () => {
    it('primary equals #FFFFFF', () => {
      expect(Colors.text.primary).toBe('#FFFFFF');
    });

    it('secondary equals #A1A1AA', () => {
      expect(Colors.text.secondary).toBe('#A1A1AA');
    });
  });

  describe('norm', () => {
    it('green equals #22C55E', () => {
      expect(Colors.norm.green).toBe('#22C55E');
    });

    it('yellow equals #EAB308', () => {
      expect(Colors.norm.yellow).toBe('#EAB308');
    });

    it('red equals #EF4444', () => {
      expect(Colors.norm.red).toBe('#EF4444');
    });
  });

  describe('heartScore', () => {
    it('excellent equals #22C55E', () => {
      expect(Colors.heartScore.excellent).toBe('#22C55E');
    });

    it('good equals #84CC16', () => {
      expect(Colors.heartScore.good).toBe('#84CC16');
    });

    it('fair equals #EAB308', () => {
      expect(Colors.heartScore.fair).toBe('#EAB308');
    });

    it('needsAttention equals #F97316', () => {
      expect(Colors.heartScore.needsAttention).toBe('#F97316');
    });

    it('atRisk equals #EF4444', () => {
      expect(Colors.heartScore.atRisk).toBe('#EF4444');
    });
  });

  describe('shared base values (no duplication)', () => {
    it('norm.green and heartScore.excellent share the same value', () => {
      expect(Colors.norm.green).toBe(Colors.heartScore.excellent);
    });

    it('norm.yellow and heartScore.fair share the same value', () => {
      expect(Colors.norm.yellow).toBe(Colors.heartScore.fair);
    });

    it('norm.red and heartScore.atRisk share the same value', () => {
      expect(Colors.norm.red).toBe(Colors.heartScore.atRisk);
    });
  });

  describe('immutability', () => {
    it('Colors object is frozen', () => {
      expect(Object.isFrozen(Colors)).toBe(true);
    });

    it('Colors.background is frozen', () => {
      expect(Object.isFrozen(Colors.background)).toBe(true);
    });

    it('Colors.text is frozen', () => {
      expect(Object.isFrozen(Colors.text)).toBe(true);
    });

    it('Colors.norm is frozen', () => {
      expect(Object.isFrozen(Colors.norm)).toBe(true);
    });

    it('Colors.heartScore is frozen', () => {
      expect(Object.isFrozen(Colors.heartScore)).toBe(true);
    });

    it('mutation has no effect in strict mode', () => {
      const originalValue = Colors.background.primary;
      // @ts-expect-error — intentionally testing immutability
      expect(() => { Colors.background.primary = '#000000'; }).toThrow();
      expect(Colors.background.primary).toBe(originalValue);
    });
  });

  describe('no duplicate keys within groups', () => {
    it('background group has unique keys', () => {
      const keys = Object.keys(Colors.background);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it('text group has unique keys', () => {
      const keys = Object.keys(Colors.text);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it('norm group has unique keys', () => {
      const keys = Object.keys(Colors.norm);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it('heartScore group has unique keys', () => {
      const keys = Object.keys(Colors.heartScore);
      expect(new Set(keys).size).toBe(keys.length);
    });
  });
});
