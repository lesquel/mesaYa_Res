import { ReviewDomainService } from './review-domain.service';

describe('ReviewDomainService', () => {
  let service: ReviewDomainService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      findByRestaurant: jest.fn(),
      findByUser: jest.fn(),
    };
    service = new ReviewDomainService(mockRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have createReview method', () => {
    expect(typeof service.createReview).toBe('function');
  });

  it('should have updateReview method', () => {
    expect(typeof service.updateReview).toBe('function');
  });

  it('should have deleteReview method', () => {
    expect(typeof service.deleteReview).toBe('function');
  });
});
