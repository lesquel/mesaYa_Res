import { AuthService } from './auth.service';
import { SignUpUseCase } from '../use-cases/sign-up.use-case';
import { LoginUseCase } from '../use-cases/login.use-case';
import { UpdateUserRolesUseCase } from '../use-cases/update-user-roles.use-case';
import { UpdateRolePermissionsUseCase } from '../use-cases/update-role-permissions.use-case';
import { ListRolesUseCase } from '../use-cases/list-roles.use-case';
import { ListPermissionsUseCase } from '../use-cases/list-permissions.use-case';
import { FindUserByIdUseCase } from '../use-cases/find-user-by-id.use-case';
import { GetAuthAnalyticsUseCase } from '../use-cases/get-auth-analytics.use-case';
import { KafkaService } from '@shared/infrastructure/kafka';

describe('AuthService', () => {
  let service: AuthService;
  let signUpUseCase: jest.Mocked<SignUpUseCase>;
  let loginUseCase: jest.Mocked<LoginUseCase>;
  let updateUserRolesUseCase: jest.Mocked<UpdateUserRolesUseCase>;
  let updateRolePermissionsUseCase: jest.Mocked<UpdateRolePermissionsUseCase>;
  let listRolesUseCase: jest.Mocked<ListRolesUseCase>;
  let listPermissionsUseCase: jest.Mocked<ListPermissionsUseCase>;
  let findUserByIdUseCase: jest.Mocked<FindUserByIdUseCase>;
  let getAuthAnalyticsUseCase: jest.Mocked<GetAuthAnalyticsUseCase>;
  let kafkaService: jest.Mocked<KafkaService>;

  beforeEach(() => {
    signUpUseCase = { execute: jest.fn() } as any;
    loginUseCase = { execute: jest.fn() } as any;
    updateUserRolesUseCase = { execute: jest.fn() } as any;
    updateRolePermissionsUseCase = { execute: jest.fn() } as any;
    listRolesUseCase = { execute: jest.fn() } as any;
    listPermissionsUseCase = { execute: jest.fn() } as any;
    findUserByIdUseCase = { execute: jest.fn() } as any;
    getAuthAnalyticsUseCase = { execute: jest.fn() } as any;
    kafkaService = { emit: jest.fn() } as any;

    service = new AuthService(
      signUpUseCase,
      loginUseCase,
      updateUserRolesUseCase,
      updateRolePermissionsUseCase,
      listRolesUseCase,
      listPermissionsUseCase,
      findUserByIdUseCase,
      getAuthAnalyticsUseCase,
      kafkaService,
    );
  });

  describe('signup', () => {
    it('should call signUpUseCase with command', async () => {
      const command = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      const expectedResult = {
        token: 'jwt-token',
        user: { id: 'user-1', email: 'test@example.com' },
      };

      signUpUseCase.execute.mockResolvedValue(expectedResult as any);

      const result = await service.signup(command);

      expect(signUpUseCase.execute).toHaveBeenCalledWith(command);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should call loginUseCase with command', async () => {
      const command = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const expectedResult = {
        token: 'jwt-token',
        user: { id: 'user-1', email: 'test@example.com' },
      };

      loginUseCase.execute.mockResolvedValue(expectedResult as any);

      const result = await service.login(command);

      expect(loginUseCase.execute).toHaveBeenCalledWith(command);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getCurrentUser', () => {
    it('should call findUserByIdUseCase with userId', async () => {
      const userId = 'user-123';
      const expectedUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      };

      findUserByIdUseCase.execute.mockResolvedValue(expectedUser as any);

      const result = await service.getCurrentUser(userId);

      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedUser);
    });

    it('should return null if user not found', async () => {
      findUserByIdUseCase.execute.mockResolvedValue(null);

      const result = await service.getCurrentUser('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateUserRoles', () => {
    it('should call updateUserRolesUseCase with command', async () => {
      const command = {
        userId: 'user-123',
        roleNames: ['OWNER', 'ADMIN'],
      };

      const expectedUser = {
        id: 'user-123',
        roles: ['OWNER', 'ADMIN'],
      };

      updateUserRolesUseCase.execute.mockResolvedValue(expectedUser as any);

      const result = await service.updateUserRoles(command);

      expect(updateUserRolesUseCase.execute).toHaveBeenCalledWith(command);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('listRoles', () => {
    it('should call listRolesUseCase', async () => {
      const expectedRoles = [
        { name: 'ADMIN', permissions: [] },
        { name: 'OWNER', permissions: [] },
      ];

      listRolesUseCase.execute.mockResolvedValue(expectedRoles as any);

      const result = await service.listRoles();

      expect(listRolesUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual(expectedRoles);
    });
  });

  describe('listPermissions', () => {
    it('should call listPermissionsUseCase', async () => {
      const expectedPermissions = [
        { name: 'READ_RESTAURANT' },
        { name: 'WRITE_RESTAURANT' },
      ];

      listPermissionsUseCase.execute.mockResolvedValue(
        expectedPermissions as any,
      );

      const result = await service.listPermissions();

      expect(listPermissionsUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual(expectedPermissions);
    });
  });
});
