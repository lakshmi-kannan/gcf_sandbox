import { Firestore } from "@google-cloud/firestore";
import { Request, Response } from 'firebase-functions';
import speakeasy from 'speakeasy';

import { USERS_COLLECTION, PROJECT_ID } from './constants';

function getDBClient(): Firestore {
    return new Firestore({
        projectId: PROJECT_ID,
        timestampsInSnapshots: true
    });
}

async function validateMFA(userId: string, mfaCode: string, db: Firestore) {
    const userDoc = db.collection(USERS_COLLECTION).doc(userId);
    let verified: boolean = false;

    verified = await userDoc.get().then((snapshot) => {
      if (!snapshot.exists) {
          return false;
      }

      const secret: string = snapshot.get("secret");
      verified = speakeasy.totp.verify({ secret: secret,
          encoding: 'base32',
          token: mfaCode,
      });
      return verified;
    }).catch((error) => {
          console.error("Error fetching doc: %s", error)
          return false;
    });

    return verified;
  }

export function validateUserMFA(request: Request, response: Response) {
    const data: any = request.body || {};
    const userId: string = request.params.get("userId"); // This should be in URL path
    const otpCode: string = data.OTP;
    const dbClient: Firestore = getDBClient();

    validateMFA(userId, otpCode, dbClient).then((verified) {
        return response.status(200).send({
            message: `User ${userId} is verified`
        });
    }).catch((err: Error) => {
        return response.status(500).send({
            message: `Error verifying OTP code for user ${userId} - ${err.toString()}`
        });
    });
}
