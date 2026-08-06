import { describe, it, expect } from 'vitest';
import { getJapaneseHolidays, getJapaneseWeekday } from './holidays';

describe('日本の祝日・曜日ユーティリティの単体テスト', () => {
  it('日本の固定祝日およびハッピーマンデーが正しく取得できること', () => {
    const holidays = getJapaneseHolidays(2026);

    // 元日 (1月1日)
    expect(holidays['2026-01-01']).toBe('元日');
    // 成人の日 (1月第2月曜日)
    expect(holidays['2026-01-12']).toBe('成人の日');
    // 建国記念の日 (2月11日)
    expect(holidays['2026-02-11']).toBe('建国記念の日');
    // 天皇誕生日 (2月23日)
    expect(holidays['2026-02-23']).toBe('天皇誕生日');
    // 文化の日 (11月3日)
    expect(holidays['2026-11-03']).toBe('文化の日');
  });

  it('日付文字列から正確な日本語曜日が取得できること', () => {
    // 2026年8月4日は火曜日
    expect(getJapaneseWeekday('2026-08-04')).toBe('火曜日');
    // 2026年8月9日は日曜日
    expect(getJapaneseWeekday('2026-08-09')).toBe('日曜日');
  });

  it('customHolidaysで独自の祝日が反映・上書きされること', () => {
    const custom = { '2026-08-15': 'お盆休み' };
    const holidays = getJapaneseHolidays(2026, custom);
    expect(holidays['2026-08-15']).toBe('お盆休み');
  });
});
