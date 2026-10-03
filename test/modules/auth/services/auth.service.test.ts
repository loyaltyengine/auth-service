import { vi } from 'vitest';
import { AuthService } from '../../../../src/modules/auth/services/auth-service.interface';
import { AuthServiceImpl } from '../../../../src/modules/auth/services/auth.service';
import { buildTestRegisterDto, buildTestUserDto } from '../../../test-utils/test-data';
import { UsersService } from '../../../../src/modules/users/services/users-service.interface';
import { TokensService } from '../../../../src/modules/tokens/services/tokens-service.interface';

describe('AuthService', () => {
    let authService: AuthService;

    // Mock dependencies
    const mockUsersService: UsersService = {
        createUser: vi.fn(),
        updateUser: vi.fn(),
        getActiveUserById: vi.fn(),
        getActiveUserByEmail: vi.fn(),
        findUserByEmailWithPassword: vi.fn(),
        findEmail: vi.fn(),
        deactivateUserById: vi.fn(),
        activateUserById: vi.fn(),
        deleteUserById: vi.fn(),
        makePrimaryEmail: vi.fn(),
        addEmailToUser: vi.fn(),
        deleteEmailById: vi.fn(),
        getEmailsByUserId: vi.fn(),
    };

    const mockTokensService: TokensService = {
        signAccessToken: vi.fn(),
        signRefreshToken: vi.fn(),
        rotateRefreshToken: vi.fn(),
        verifyAccessToken: vi.fn(),
        verifyRefreshToken: vi.fn(),
        revokeAccessToken: vi.fn(),
        revokeRefreshToken: vi.fn(),
        deleteExpiredRefreshTokens: vi.fn(),
    };

    beforeEach(() => {
        // Clear all mocks
        vi.clearAllMocks();

        // Initialize service
        authService = new AuthServiceImpl(mockUsersService, mockTokensService);
    });

    describe('register', () => {
        it('should return the registered a user', async () => {
            // Mock
            const user = buildTestUserDto(1);
            vi.mocked(mockUsersService.createUser).mockResolvedValue(user);

            // Given
            const request = buildTestRegisterDto(1);

            // When
            const result = await authService.register(request);

            // Then
            expect(result.user).not.toBeNull();
            expect(result.user.primaryEmail).toEqual(request.email);
        });
    });
});
