export interface PropertiesService {
    validatePropertyOwnership(propertyId: string, userId: string): Promise<boolean>;
}
