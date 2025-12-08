import { LoginResultDto } from '../dto/login-result.dto';
import { LoginUserDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RegisterResultDto } from '../dto/register-result.dto';

export interface IAuthService {
    login(user: LoginUserDto): Promise<LoginResultDto>;
    register(user: RegisterDto): Promise<RegisterResultDto>;
}
