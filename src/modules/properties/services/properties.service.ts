import { Injectable, Logger } from '@nestjs/common';
import { PropertiesService } from './properties-service.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PropertyUserResponse } from '@loyaltyengine/properties-client';

@Injectable()
export class PropertiesServiceImpl implements PropertiesService {
    private readonly logger = new Logger(PropertiesServiceImpl.name);
    constructor(private readonly httpService: HttpService) {}

    async validatePropertyOwnership(propertyId: string, userId: string): Promise<boolean> {
        // Fetch property user
        const apiURl: string = `${process.env.PROPERTIES_SERVICE_URL}/properties-api/v1/properties/${propertyId}/users/${userId}/assignments`;
        this.logger.log('Calling properties API: ' + apiURl);

        try {
            const { data } = await firstValueFrom(
                this.httpService.get<PropertyUserResponse>(apiURl, {
                    validateStatus: (status) => status === 200 || status === 404,
                }),
            );

            // Check if the property user was found
            return data.status.code === 200;
        } catch (error) {
            this.logger.error('Error occurred while trying to fetch property user');
            throw new Error('Error occurred while trying to fetch property user');
        }
    }
}
