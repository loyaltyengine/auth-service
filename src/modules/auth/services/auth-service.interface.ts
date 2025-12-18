import { LoginResultDto } from '../dto/login-result.dto';
import { LoginUserDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RegisterResultDto } from '../dto/register-result.dto';
import { RefreshResultDto } from '../dto/refresh-result.dto';

export interface IAuthService {
    login(user: LoginUserDto): Promise<LoginResultDto>;
    logout(accessToken: string, refreshToken: string): Promise<void>;
    register(user: RegisterDto): Promise<RegisterResultDto>;
    refreshToken(refreshToken: string): Promise<RefreshResultDto>;
}
