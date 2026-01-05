export interface IPropertiesService {
    validatePropertyOwnership(propertyId: string, userId: string): Promise<boolean>;
}
