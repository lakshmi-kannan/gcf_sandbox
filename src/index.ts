import { https, Request, Response } from 'firebase-functions';

import { registerUserMFA } from './registerMFA';
import { handleAuth } from './auth';

export const mfaRegister = https.onRequest(
    (request: Request, response: Response) => {
        handleAuth(request).then((authorized) => {
            if (authorized) {
                switch (request.method) {
                    case "POST":
                        return registerUserMFA(request, response);
                    default:
                        return response.status(403).send('Forbidden!');
                }
            } else {
                return response.status(403).send({
                    message: "Invalid credentials!"
                });
            }
        }).catch((err: Error) => {
            return response.status(500).send({
                message: `Error handling auth ${err.toString()}`
            })
        });
});
