// src\test-utils\mongoose-model.mock.ts

import type { Mock } from 'vitest';
import { vi } from 'vitest';

export type QueryMock = {
  populate: Mock;
  select: Mock;
  collation: Mock;
  exec: Mock;
};

export type ModelMock = Mock & {
  find: Mock;
  findOne: Mock;
  findOneAndUpdate: Mock;
  findOneAndDelete: Mock;
  exists: Mock;
  countDocuments: Mock;
  insertMany: Mock;
};

export const queryResult = (value: unknown): QueryMock => {
  const query: QueryMock = {
    populate: vi.fn(),
    select: vi.fn(),
    collation: vi.fn(),
    exec: vi.fn().mockResolvedValue(value),
  };
  query.populate.mockReturnValue(query);
  query.select.mockReturnValue(query);
  query.collation.mockReturnValue(query);
  return query;
};

/**
 * Simula un modelo de Mongoose: se puede usar como constructor
 * (`new Model(data).save()` resuelve con `data`) y expone los métodos
 * estáticos de consulta como mocks.
 */
export const createModelMock = (): ModelMock => {
  const constructor = vi.fn(function (
    this: Record<string, unknown>,
    data: Record<string, unknown>,
  ) {
    Object.assign(this, data);
    this.save = vi.fn().mockResolvedValue(data);
    return this;
  });

  return Object.assign(constructor, {
    find: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn(),
    exists: vi.fn().mockReturnValue(queryResult(null)),
    countDocuments: vi.fn(),
    insertMany: vi.fn((docs: unknown[]) => Promise.resolve(docs)),
  });
};
