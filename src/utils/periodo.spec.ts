// src\utils\periodo.spec.ts

import { getPeriodoAnterior, getPeriodoSiguiente } from './periodo';

describe('periodo utils', () => {
  describe('getPeriodoAnterior', () => {
    it.each([
      ['2026-06', '2026-05'],
      ['2026-10', '2026-09'],
      ['2026-01', '2025-12'],
      ['2000-03', '2000-02'],
    ])('el período anterior a %s es %s', (periodo, esperado) => {
      expect(getPeriodoAnterior(periodo)).toBe(esperado);
    });
  });

  describe('getPeriodoSiguiente', () => {
    it.each([
      ['2026-06', 1, '2026-07'],
      ['2026-11', 1, '2026-12'],
      ['2026-11', 2, '2027-01'],
      ['2026-12', 1, '2027-01'],
      ['2026-06', 0, '2026-06'],
    ])(
      'el período siguiente a %s con offset %d es %s',
      (periodo, offset, esperado) => {
        expect(getPeriodoSiguiente(periodo, offset)).toBe(esperado);
      },
    );
  });
});
