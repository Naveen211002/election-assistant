import { jest } from '@jest/globals';

// Mock config and logger
jest.unstable_mockModule('../src/config/config.js', () => ({
  config: {
    NODE_ENV: 'production',
    BIGQUERY_DATASET: 'test_dataset',
    BIGQUERY_TABLE: 'test_table',
    GCP_PROJECT_ID: 'test-project'
  }
}));

jest.unstable_mockModule('../src/services/logger.service.js', () => ({
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn()
  }
}));

// Mock BigQuery
const mockInsert = jest.fn().mockResolvedValue([]);
const mockTable = jest.fn().mockReturnValue({ insert: mockInsert });
const mockDataset = jest.fn().mockReturnValue({ table: mockTable });

jest.unstable_mockModule('@google-cloud/bigquery', () => ({
  BigQuery: class {
    constructor() {}
    dataset(name) { return mockDataset(name); }
  }
}));

const mockTableObj = { insert: mockInsert };
mockDataset.mockImplementation((_name) => ({
  table: (tableName) => mockTable(tableName)
}));
mockTable.mockImplementation((_name) => mockTableObj);

const { logToBigQuery } = await import('../src/services/telemetry.service.js');

describe('Telemetry Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('logToBigQuery inserts data when in production', async () => {
    const data = {
      sessionId: 'test-session',
      userMessage: 'hello',
      modelReply: 'hi',
      intent: 'greeting',
      latencyMs: 100,
      tokens: 10
    };

    await logToBigQuery(data);

    expect(mockDataset).toHaveBeenCalledWith('test_dataset');
    expect(mockTable).toHaveBeenCalledWith('test_table');
    expect(mockInsert).toHaveBeenCalledWith([expect.objectContaining({
      session_id: 'test-session',
      user_message: 'hello',
      model_reply: 'hi'
    })]);
  });

  test('logToBigQuery handles errors gracefully', async () => {
    mockInsert.mockRejectedValueOnce(new Error('BQ Error'));
    await logToBigQuery({ sessionId: 'err' });
    // Coverage is achieved by hitting the catch block
  });
});
