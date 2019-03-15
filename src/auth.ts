import { Request } from 'firebase-functions';

export async function handleAuth(request: Request) {
    const authHeader: string = request.get("Authorization") || "";

    const bearerToken: string[] = authHeader.split(" ");
    if (bearerToken[0] !== "Bearer") {
        throw new Error(`Invalid Authorization header. Use "Bearer <token>".`);
    }
    const oauthToken: string = bearerToken[1];
    return isValidOAuthToken(oauthToken);
}

export async function isValidOAuthToken(oauthToken: string) {
    return true;
}