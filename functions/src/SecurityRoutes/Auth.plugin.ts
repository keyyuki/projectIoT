import {AuthenService}  from './Auth.service';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
import * as admin from 'firebase-admin';

const encriptSecretKey = 'ertyuiqwbnnckza';

export const AuthenticatePlugin = async(req, res, next) => {
    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer '))) {
        res.status(403).send({code:0, messages: ['Unauthorized']});
        return;
    }    
    const idToken = req.headers.authorization.split('Bearer ')[1];
    let decoded;
    try {
        decoded = jwt.verify(idToken, encriptSecretKey);
    } catch (error) {
        res.status(403).send({code:0, messages: ['Invalid authentication token']});
        return;
    }
    

    if(decoded.exp < moment().utc().unix()){
        res.status(403).send({code:0, messages: ['Token expired']});
        return;
    }

    const user = await admin.firestore().collection('users').doc(decoded.userId).get();

    if(!user.exists){
        res.status(403).send({code:0, messages: ['User not found']});
        return;
    }

    AuthenService.token = idToken;
    AuthenService.userId = user.id;
    AuthenService.userSnap = user;
    next();   
    return;  
}