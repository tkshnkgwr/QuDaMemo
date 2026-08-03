import { JapaneseHoliday } from '../types';

/**
 * Date.getDay() (0 = 日曜日, 1 = 月曜日...) に対応する日本語曜日配列
 */
export const JAPANESE_WEEKDAYS = [
  '日曜日',
  '月曜日',
  '火曜日',
  '水曜日',
  '木曜日',
  '金曜日',
  '土曜日',
];

export const JAPANESE_WEEKDAYS_SHORT = ['日', '月', '火', '水', '木', '金', '土'];

/**
 * 指定されたDateオブジェクトまたはYYYY-MM-DD文字列から日本語の曜日を取得
 */
export function getJapaneseWeekday(dateInput: Date | string): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput + 'T00:00:00') : dateInput;
  if (isNaN(d.getTime())) return '';
  return JAPANESE_WEEKDAYS[d.getDay()];
}

/**
 * 春分の日計算アルゴリズム（日本の法律に基づく近似計算 1900-2099）
 */
function getVernalEquinoxDay(year: number): number {
  if (year <= 1979) return Math.floor(20.8357 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
  if (year <= 2099) return Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
  return 20;
}

/**
 * 秋分の日計算アルゴリズム（日本の法律に基づく近似計算 1900-2099）
 */
function getAutumnalEquinoxDay(year: number): number {
  if (year <= 1979) return Math.floor(23.2588 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
  if (year <= 2099) return Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
  return 23;
}

/**
 * 指定年月の第N月曜日の日付を算出
 */
function getNthMonday(year: number, month: number, n: number): number {
  const firstDay = new Date(year, month - 1, 1).getDay();
  // 月初1日の曜日: 0=日, 1=月...
  let firstMonday = 1 + ((8 - firstDay) % 7);
  if (firstDay === 1) firstMonday = 1;
  return firstMonday + (n - 1) * 7;
}

/**
 * YYYY-MM-DD 形式の日付文字列生成ヘルパー
 */
function formatDate(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

/**
 * 指定年の日本の法定祝日一覧を計算・生成
 */
export function getJapaneseHolidays(year: number): Record<string, string> {
  const holidays: Record<string, string> = {};

  // 固定日付の祝日
  holidays[formatDate(year, 1, 1)] = '元日';
  holidays[formatDate(year, 1, getNthMonday(year, 1, 2))] = '成人の日';
  holidays[formatDate(year, 2, 11)] = '建国記念の日';
  holidays[formatDate(year, 2, 23)] = '天皇誕生日';

  // 春分の日
  const vernalDay = getVernalEquinoxDay(year);
  holidays[formatDate(year, 3, vernalDay)] = '春分の日';

  holidays[formatDate(year, 4, 29)] = '昭和の日';
  holidays[formatDate(year, 5, 3)] = '憲法記念日';
  holidays[formatDate(year, 5, 4)] = 'みどりの日';
  holidays[formatDate(year, 5, 5)] = 'こどもの日';

  // 海の日 (7月第3月曜日)
  holidays[formatDate(year, 7, getNthMonday(year, 7, 3))] = '海の日';

  // 山の日 (8月11日)
  holidays[formatDate(year, 8, 11)] = '山の日';

  // 敬老の日 (9月第3月曜日)
  holidays[formatDate(year, 9, getNthMonday(year, 9, 3))] = '敬老の日';

  // 秋分の日
  const autumnalDay = getAutumnalEquinoxDay(year);
  holidays[formatDate(year, 9, autumnalDay)] = '秋分の日';

  // スポーツの日 (10月第2月曜日)
  holidays[formatDate(year, 10, getNthMonday(year, 10, 2))] = 'スポーツの日';

  holidays[formatDate(year, 11, 3)] = '文化の日';
  holidays[formatDate(year, 11, 23)] = '勤労感謝の日';

  // 振替休日の計算
  const sortedDates = Object.keys(holidays).sort();
  for (const dateStr of sortedDates) {
    const d = new Date(dateStr + 'T00:00:00');
    if (d.getDay() === 0) {
      // 日曜日の場合、祝日でない最初の平日を振替休日に設定
      let subDate = new Date(d);
      subDate.setDate(subDate.getDate() + 1);
      let subStr = formatDate(subDate.getFullYear(), subDate.getMonth() + 1, subDate.getDate());
      while (holidays[subStr]) {
        subDate.setDate(subDate.getDate() + 1);
        subStr = formatDate(subDate.getFullYear(), subDate.getMonth() + 1, subDate.getDate());
      }
      holidays[subStr] = '振替休日';
    }
  }

  return holidays;
}

/**
 * 指定日付（YYYY-MM-DD）が日本の祝日か判定し、祝日名を返す
 */
export function getHolidayName(dateStr: string): string | null {
  if (!dateStr || dateStr.length < 10) return null;
  const parts = dateStr.split('-');
  if (parts.length < 3) return null;
  const year = parseInt(parts[0], 10);
  if (isNaN(year)) return null;

  const holidaysMap = getJapaneseHolidays(year);
  return holidaysMap[dateStr] || null;
}
