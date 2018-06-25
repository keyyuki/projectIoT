import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import TemRoute from './Routes';


admin.initializeApp();
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const temperature = functions.https.onRequest(TemRoute);



