// src\test-utils\mongoose-model.mock.ts

export type QueryMock = {
  populate: jest.Mock;
  exec: jest.Mock;
};

export type ModelMock = jest.Mock & {
  find: jest.Mock;
  findOne: jest.Mock;
  findOneAndUpdate: jest.Mock;
  findOneAndDelete: jest.Mock;
  exists: jest.Mock;
  countDocuments: jest.Mock;
  insertMany: jest.Mock;
};

export const queryResult = (value: unknown): QueryMock => {
  const query: QueryMock = {
    populate: jest.fn(),
    exec: jest.fn().mockResolvedValue(value),
  };
  query.populate.mockReturnValue(query);
  return query;
};

/**
 * Simula un modelo de Mongoose: se puede usar como constructor
 * (`new Model(data).save()` resuelve con `data`) y expone los métodos
 * estáticos de consulta como mocks.
 */
export const createModelMock = (): ModelMock => {
  const constructor = jest.fn((data: Record<string, unknown>) => ({
    ...data,
    save: jest.fn().mockResolvedValue(data),
  }));

  return Object.assign(constructor, {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    exists: jest.fn(),
    countDocuments: jest.fn(),
    insertMany: jest.fn((docs: unknown[]) => Promise.resolve(docs)),
  });
};
