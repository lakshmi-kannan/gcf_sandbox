export interface UserMFA {
    MFAType: string,
    phoneNumber?: string,
    secret: string
}

export interface User {
    userId: string,
    email: string,
    organization: string,
    MFA: UserMFA
}