import { Controller, Delete, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import type { UsersService } from '../services/users-service.interface';

@Controller('auth/v1/users')
export class UsersController {
    constructor( @Inject('UsersService') private readonly usersService: UsersService) {}

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
