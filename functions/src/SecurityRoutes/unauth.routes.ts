import * as admin from 'firebase-admin';
import * as moment from 'moment';
import * as cryto from 'crypto';
import * as jwt from 'jsonwebtoken';

const encriptSecretKey = 'ertyuiqwbnnckza';

export const registration = async(request, response) => {
    let username = request.body.username;
    let password = request.body.password;
    let rePassword = request.body.rePassword;

    if(!username || !password || !rePassword){
        response.send({
            code: 0,
            messages: ['Invalid params']
        })
        return false;
    }
    username = username.trim();
    password = password.trim();
    rePassword = rePassword.trim();
    if(password !== rePassword){
        response.send({
            code: 0,
            messages: ['password and re-password does not match']
        })
        return false;
    }
    const isExisted = await getUserByUserName(username);
    if(isExisted){
        response.send({
            code: 0,
            messages: ['username is existed']
        })
        return false;
    }

    const salt = moment().utc().valueOf();
    const passwordHash = cryto.createHash('md5').update(password + salt).digest("hex");

    await admin.firestore().collection('users').add({
        username: username,
        password: passwordHash,
        salt: salt,
        createdDateTime: new Date()
    });

    response.send({
        code: 1,
       
    })
    return true;
}

export const login = async(request, response) => {
    let username = request.body.username
    let password = request.body.password;
    
    if(!username || !password ){
        response.send({
            code: 0,
            messages: ['Invalid params']
        })
        return false;
    }
    username = username.trim();
    password = password.trim();
    const user = await getUserByUserName(username);
    if(!user){
        response.send({
            code: 0,
            messages: ['User not found']
        })
        return false;
    }
    const passwordHash = cryto.createHash('md5').update(password + user.get('salt')).digest("hex");
    if(passwordHash !== user.get('password')){
        response.send({
            code: 0,
            messages: ['wrong password']
        })
        return false;
    }

    const token = jwt.sign({
        exp: moment().utc().unix() + (24*60*60),
        userId: user.id,
        username: username
    }, encriptSecretKey);

    response.send({
        code: 1,
        data: {
            token: token
        }
    })
    return true
}

const getUserByUserName = async(username) => {
    const snap = await admin.firestore().collection('users')
        .where('username', '==', username)
        .limit(1)
        .get();
    if(snap.empty){
        return null;
    }
    return snap.docs.shift();
}