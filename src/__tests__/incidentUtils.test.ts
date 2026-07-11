import { describe, it, expect } from 'vitest';
import { getTimeAgo } from '@/utils/incidentUtils';

describe('getTimeAgo utility', () => {
  it('should return Just now for times less than a minute ago', () => {
    const time = new Date(Date.now() - 10 * 1000).toISOString();
    expect(getTimeAgo(time)).toBe('Just now');
  });

  it('should return 1m ago for times exactly one minute ago', () => {
    const time = new Date(Date.now() - 60 * 1000).toISOString();
    expect(getTimeAgo(time)).toBe('1m ago');
  });

  it('should return Xm ago for times under an hour ago', () => {
    const time = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    expect(getTimeAgo(time)).toBe('15m ago');
  });

  it('should return 1h ago for times exactly one hour ago', () => {
    const time = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    expect(getTimeAgo(time)).toBe('1h ago');
  });

  it('should return Xh ago for times under 24 hours ago', () => {
    const time = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    expect(getTimeAgo(time)).toBe('6h ago');
  });

  it('should return formatted month and day for times over 24 hours ago', () => {
    const past = new Date();
    past.setDate(past.getDate() - 3); // 3 days ago
    const time = past.toISOString();
    const result = getTimeAgo(time);
    
    // Should match pattern like "Jul 8"
    expect(result).toMatch(/^[A-Z][a-z]{2}\s\d{1,2}$/);
  });

  it('should return empty string for invalid date strings', () => {
    expect(getTimeAgo('invalid-date')).toBe('');
  });
});
