import { Injectable } from '@nestjs/common';
import { IPropertiesService } from './properties-service.interface';

@Injectable()
export class PropertiesService implements IPropertiesService {
    async validatePropertyOwnership(propertyId: string, userId: string): Promise<boolean> {
        // TODO: call the Properties Service to validate ownership
        return true;
    }
}
