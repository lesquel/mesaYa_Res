import { normalizeId } from './normalize-id.util';

describe('normalizeId', () => {
  it('should trim whitespace', () => {
    expect(normalizeId('  id-123  ')).toBe('id-123');
  });

  it('should preserve original case', () => {
    // normalizeId only trims, doesn't convert to lowercase
    expect(normalizeId('ID-123')).toBe('ID-123');
    expect(normalizeId('User-ABC')).toBe('User-ABC');
  });

  it('should handle already normalized IDs', () => {
    expect(normalizeId('id-123')).toBe('id-123');
  });

  it('should handle UUIDs', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    expect(normalizeId(uuid)).toBe(uuid);
  });

  it('should handle empty string', () => {
    expect(normalizeId('')).toBe('');
  });

  it('should handle IDs with special characters', () => {
    expect(normalizeId('user_123')).toBe('user_123');
    expect(normalizeId('user-123')).toBe('user-123');
  });
});
