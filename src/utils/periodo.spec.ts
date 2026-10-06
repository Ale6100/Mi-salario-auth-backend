// src\utils\periodo.spec.ts

import { getPeriodoAnterior } from './periodo';

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
