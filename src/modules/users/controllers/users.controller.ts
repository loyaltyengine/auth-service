import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import type { UsersService } from '../services/users-service.interface';
import { Response as ApiResponse, ChangePrimaryEmailResponse, EmailListResponse, EmailResponse, UserResponse } from '@loyaltyengine/auth-client';
import { UserMapper } from '../mappers/user.mapper';

@Controller('auth/v1/users')
export class UsersController {
    constructor(@Inject('UsersService') private readonly usersService: UsersService) { }

    @Get('me')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async getUserProfile(@Req() request): Promise<UserResponse> {
        const userId = request.user.userId;
        const user = await this.usersService.getActiveUserById(userId);
        return UserMapper.toUserResponse({ code: 200, message: 'Success' }, user);
    }

    @Patch('me')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async updateUser(@Req() request: any, @Body() updates: any): Promise<UserResponse> {
        const userId = request.user.userId;
        const user = await this.usersService.updateUser(userId, updates);
        return UserMapper.toUserResponse({ code: 200, message: 'Success' }, user);
    }

    @Post('me/deactivate')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async deactivateUser(@Req() request: any): Promise<ApiResponse> {
        const userId = request.user.userId;
        await this.usersService.deactivateUserById(userId);
        return { status: { code: 200, message: 'User has been deactivated' } };
    }

    @Post('me/reactivate')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async reactivateUser(@Req() request: any): Promise<ApiResponse> {
        // User needs to login first in order to reactivate
        const userId = request.user.userId;
        await this.usersService.activateUserById(userId);
        return { status: { code: 200, message: 'User has been reactivated' } };
    }

    @Delete('me')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async deleteUser(@Req() request: any): Promise<ApiResponse> {
        const userId = request.user.userId;
        await this.usersService.deleteUserById(userId);
        // Returning 200 for consistency even though 204 (No Content) would be more appropriate
        return { status: { code: 200, message: 'User has been deleted' } };
    }

    @Patch('me/emails/:emailId/primary')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async makePrimaryEmail(@Req() request: any, @Param('emailId') emailId: string): Promise<ChangePrimaryEmailResponse> {
        const userId = request.user.userId;
        const result = await this.usersService.makePrimaryEmail(userId, emailId);

        return {
            status: { code: 200, message: 'Primary email has been changed' },
            oldPrimaryEmail: result.old,
            newPrimaryEmail: result.new
        };
    }

    @Post('me/emails')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard)
    async addEmail(@Req() request: any, @Body() body: { email: string }): Promise<EmailResponse> {
        const userId = request.user.userId;
        const email = body.email;
        const emailDto = await this.usersService.addEmailToUser(userId, email);
        return UserMapper.toEmailResponse({ code: 201, message: 'Email has been added' }, emailDto);
    }

    @Get('me/emails')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async getEmails(@Req() request: any): Promise<EmailListResponse> {
        const userId = request.user.userId;
        const emails = await this.usersService.getEmailsByUserId(userId);
        return UserMapper.toEmailsResponse({ code: 200, message: 'Emails have been retrieved' }, emails);
    }

    @Delete('me/emails/:emailId')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async deleteEmail(@Req() request: any, @Param('emailId') emailId: string): Promise<ApiResponse> {
        const userId = request.user.userId;
        await this.usersService.deleteEmailById(userId, emailId);
        return { status: { code: 200, message: 'Email has been deleted' } };
    }
}
