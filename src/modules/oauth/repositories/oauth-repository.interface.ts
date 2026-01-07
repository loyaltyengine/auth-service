
import { OauthAccountModel } from "../models/oauth-account.model";
import { CreateOauthAccountData } from "./types/create-oauth-account.data";

export interface IOauthRepository {
    findAccountByProviderId(provider: string, providerId: string): Promise<OauthAccountModel | null>;
    createOauthAccount(data: CreateOauthAccountData): Promise<OauthAccountModel>;
}
