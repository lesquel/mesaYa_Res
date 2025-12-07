import { MenuDomainService } from './menu-domain.service';

describe('MenuDomainService', () => {
  let service: MenuDomainService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      findByRestaurant: jest.fn(),
    };
    service = new MenuDomainService(mockRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have create method', () => {
    expect(typeof service.createMenu).toBe('function');
  });

  it('should have update method', () => {
    expect(typeof service.updateMenu).toBe('function');
  });
});
