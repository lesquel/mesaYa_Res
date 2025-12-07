import { SectionDomainService } from './section-domain.service';

describe('SectionDomainService', () => {
  let service: SectionDomainService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      listByRestaurant: jest.fn(),
    };
    service = new SectionDomainService(mockRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have createSection method', () => {
    expect(typeof service.createSection).toBe('function');
  });

  it('should have updateSection method', () => {
    expect(typeof service.updateSection).toBe('function');
  });

  it('should have deleteSection method', () => {
    expect(typeof service.deleteSection).toBe('function');
  });
});
