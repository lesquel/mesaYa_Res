import { NotFoundError } from './not-found.error';
import { InvalidDataError } from './invalid-data.error';
import { ForbiddenError } from './forbidden-error';

describe('Domain Errors', () => {
  describe('NotFoundError', () => {
    it('should create error with message', () => {
      const error = new NotFoundError('Resource not found');
      expect(error.message).toBe('Resource not found');
      expect(error.name).toBe('NotFoundError');
      expect(error.statusCode).toBe(404);
    });

    it('should create error with details', () => {
      const error = new NotFoundError('User not found', { userId: '123' });
      expect(error.message).toBe('User not found');
      expect(error.details).toEqual({ userId: '123' });
    });
  });

  describe('InvalidDataError', () => {
    it('should create error with message', () => {
      const error = new InvalidDataError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.name).toBe('InvalidDataError');
      expect(error.statusCode).toBe(400);
    });

    it('should create error with details', () => {
      const error = new InvalidDataError('Validation failed', {
        field: 'email',
      });
      expect(error.details).toEqual({ field: 'email' });
    });
  });

  describe('ForbiddenError', () => {
    it('should create error with message', () => {
      const error = new ForbiddenError('Access denied');
      expect(error.message).toBe('Access denied');
      expect(error.name).toBe('ForbiddenError');
      expect(error.statusCode).toBe(403);
    });
  });
});
