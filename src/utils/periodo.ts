// src\utils\periodo.ts

export const PERIODO_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export const getPeriodoAnterior = (periodo: string): string => {
  const [year, month] = periodo.split('-').map(Number);
  const anterior = new Date(Date.UTC(year, month - 2, 1));
  return `${anterior.getUTCFullYear()}-${String(anterior.getUTCMonth() + 1).padStart(2, '0')}`;
};
