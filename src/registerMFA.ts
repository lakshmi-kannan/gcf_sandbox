import { Request, Response } from 'firebase-functions';
import { Firestore } from "@google-cloud/firestore";

import speakeasy from 'speakeasy';

import { MFAType, PROJECT_ID } from './constants';
import { UserMFA, User } from './dataTypes';

function getDBClient(): Firestore {
    return new Firestore({
        projectId: PROJECT_ID,
        timestampsInSnapshots: true
    });
}

async function writeUserMFAToDB(userData: User) {
    const db: Firestore = getDBClient();
    return await db.collection("users").doc(userData.userId).set(userData);
}

export function registerUserMFA(request:Request, response:Response) {
        const data: any = request.body || {};
        const userId: string = data.userId;
        const userEmail: string = data.email;
        const userOrg: string = data.organization;
        const mfaType: MFAType = (<any>MFAType)[data.MFAType.toUpperCase()];
        let userMFA: UserMFA;

        const secret: speakeasy.GeneratedSecret = speakeasy.generateSecret();
        const secretBase32: string = secret.base32;

        switch (mfaType) {
            case MFAType.SMS:
                const phoneNumber: string = data.phoneNumber;
                userMFA = {
                    MFAType: MFAType.SMS.toString(),
                    phoneNumber: phoneNumber,
                    secret: secretBase32
                };
                break;
            case MFAType.GAUTH:
                userMFA = {
                    MFAType: MFAType.GAUTH.toString(),
                    secret: secretBase32
                };
                break;
            default:
                // Send a BAD REQUEST response
                return response.status(400).send({
                    error: `Invalid MFA Type ${mfaType}`
                });
        }

        const userData: User = {
            userId: userId,
            MFA: userMFA,
            email: userEmail,
            organization: userOrg
        }

        writeUserMFAToDB(userData).then(() => {
            return response.status(200).send({
                message: `Wrote MFA information to database for user ${userId}`
            })
        }).catch((err: Error) => {
            return response.status(500).send({
                error: `Error writing user info to database - ${err}`
            });
        });

        return response.status(200).send({
            message: `Wrote MFA information to database for user ${userId}`
        });
}