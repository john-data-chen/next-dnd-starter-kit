import { afterEach, describe, expect, it, vi, beforeAll } from 'vitest';

// 模擬 dotenv 模組
vi.mock('dotenv', () => ({
  config: vi.fn().mockReturnValue({ error: null })
}));

// 模擬 path 模組
vi.mock('path', () => ({
  resolve: vi.fn().mockReturnValue('/path/to/.env'),
  default: { resolve: vi.fn().mockReturnValue('/path/to/.env') }
}));

describe('Environment Configuration', () => {
  // 保存原始環境變數
  const originalEnv = { ...process.env };

  // 在每個測試後重置環境變數
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  // 在所有測試結束後恢復原始環境變數
  afterAll(() => {
    process.env = originalEnv;
  });

  it('should use provided DATABASE_URL', async () => {
    // 設置測試環境變數
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('DATABASE_URL', 'test-db-url');
    
    const { config } = await import('@/lib/config/env');
    expect(config.databaseUrl).toBe('test-db-url');
  });

  it('should have correct environment flags in test environment', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    
    const { config } = await import('@/lib/config/env');
    expect(config.isTest).toBe(true);
    expect(config.isProduction).toBe(false);
    expect(config.isDevelopment).toBe(false);
  });

  it('should have correct environment flags in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    
    const { config } = await import('@/lib/config/env');
    expect(config.isTest).toBe(false);
    expect(config.isProduction).toBe(true);
    expect(config.isDevelopment).toBe(false);
  });

  it('should use default values when environment variables are not set', async () => {
    // 只設置 NODE_ENV
    vi.stubEnv('NODE_ENV', 'test');
    
    const { config } = await import('@/lib/config/env');
    expect(config.appName).toBe('Next.js App');
    expect(config.baseUrl).toBe('http://localhost:3000');
    expect(config.enableAnalytics).toBe(false);
    expect(config.debug).toBe(false);
  });

  it('should throw error when DATABASE_URL is missing in non-production', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('DATABASE_URL', '');
    
    // 捕獲 console.error 輸出
    const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    await expect(import('@/lib/config/env')).rejects.toThrow(
      'Local development DATABASE_URL is not defined'
    );
    
    expect(mockError).toHaveBeenCalled();
    mockError.mockRestore();
  });

  it('should not throw when DATABASE_URL is missing in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DATABASE_URL', '');
    
    const { config } = await import('@/lib/config/env');
    expect(config.databaseUrl).toBe('');
  });
});
