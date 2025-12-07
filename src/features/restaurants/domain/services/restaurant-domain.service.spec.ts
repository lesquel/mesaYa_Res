import { RestaurantDomainService } from './restaurant-domain.service';

describe('RestaurantDomainService', () => {
  let service: RestaurantDomainService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      searchByLocation: jest.fn(),
      findByOwner: jest.fn(),
    };
    service = new RestaurantDomainService(mockRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have createRestaurant method', () => {
    expect(typeof service.createRestaurant).toBe('function');
  });

  it('should have updateRestaurant method', () => {
    expect(typeof service.updateRestaurant).toBe('function');
  });

  it('should have deleteRestaurant method', () => {
    expect(typeof service.deleteRestaurant).toBe('function');
  });
});
