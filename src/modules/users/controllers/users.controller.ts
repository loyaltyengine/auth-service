import { Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('auth/v1/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('me')
    @UseGuards(AuthGuard)
    async getUserProfile() {
        throw new Error('Not implemented yet');
    }

    @Post('deactivate')
    @UseGuards(AuthGuard)
    async deactivateUser() {
        throw new Error('Not implemented yet');
    }

    @Post('reactivate')
    @UseGuards(AuthGuard)
    async reactivateUser() {
        throw new Error('Not implemented yet');
    }

    @Delete('delete')
    @UseGuards(AuthGuard)
    async deleteUser() {
        throw new Error('Not implemented yet');
    }
}
