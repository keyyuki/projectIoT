import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';


export const addTemp = async(request, response) => {
    try {
        if(!request.body || !request.body.time || (!request.body.temperature && !request.body.humidity)){
            response.send({code: 0, messages: ['invalid params. Param require is "time", "temperature", "humidity". Time format is 2018-06-18 20:59:59']})
            return false;
        }
        const data = {
            time: request.body.time,
            temperature: request.body.temperature || null,
            humidity: request.body.humidity || null
        }
    
        await admin.firestore().collection('temperature').add(data);
        response.send({code:1});
        return true;
    } catch (error) {
        console.error(error);
        response.status(500).send({code:0, messages: ['status: 500. Internal server error']});
        return false;
    }   

}

export const listTemp = async(request, response) => {
    try {
        const list = await admin.firestore().collection('temperature').limit(50).get();
        const result = list.docs.map(ele => {
            return ele.data()
        });
        response.send({code: 1, data: result.reverse()})
        return true;
    } catch (error) {
        console.error(error);
        response.status(500).send({code:0, messages: ['status: 500. Internal server error']});
        return false;
    }
}

export const add2 = async(request, response) : Promise<Boolean> => {
    
    if(!request.body || !request.body.q){
        response.send({code: 0, messages: ['invalid params']})
        return false;
    }
    response.send({code:1});
    try {
        const dataQ = String(request.body.q).toString().split('-');        
        const deviceId = dataQ[0]  || null;
        const orderId  = dataQ[1]  || null;
        let tempurature =  null;        
        if(dataQ[2]){
            tempurature = parseInt(dataQ[2])  - 300;
        }
        const doorDistance = dataQ[3]  || null;    

        // lấy ra số atIndex của record lớn nhất gần đây
        let lastAtIndex = 0;
        const lastRecordSnap = await admin.firestore().collection('truck-state')
            .select('atIndex')
            .orderBy('atIndex', 'desc')
            .limit(1)
            .get();
        if(!lastRecordSnap.empty){
            lastAtIndex = lastRecordSnap.docs.shift().get('atIndex');
        }

        await admin.firestore().collection('truck-state').add({
            deviceId,
            orderId,
            tempurature,
            doorDistance,
            createdDateTime: new Date(),
            atIndex: lastAtIndex + 1
        }); 
        if(deviceId) {
            const deviceExisted = await admin.firestore().collection('devices').doc(deviceId).get();
            if(!deviceExisted.exists){
                await admin.firestore().doc('device/' + deviceId).set({
                    code: deviceId,
                    createdDateTime: new Date(),                    
                });
            }            
        }
        if(orderId){
            const orderExisted = await admin.firestore().collection('orders').doc(orderId).get();
            if(!orderExisted.exists){
                await admin.firestore().doc('orders/' + orderId).set({
                    id: orderId,
                    deviceId: deviceId,
                    createdDateTime: new Date(),                    
                });
            }    
        }        
          
        return true;
    } catch (error) {
        console.error(error);
        //response.status(500).send({code:0, messages: ['status: 500. Internal server error']});
        return false;
    }  
}

export const list2 = async(request: functions.Request, response) : Promise<Boolean>=> {

    let pageToken = null;
    let deviceId = null;
    let orderId = null;
    
    if(request.query && request.query.pageToken){
        pageToken = parseInt(request.query.pageToken) 
    }
    if(request.query && request.query.deviceId){
        deviceId = parseInt(request.query.deviceId)
    }
    if(request.query && request.query.orderId){
        orderId = parseInt(request.query.deviceId)
    }

    let query = admin.firestore().collection('truck-state')
        .select('tempurature', 'doorDistance', 'orderId', 'deviceId', 'createdDateTime', 'atIndex')
        .orderBy('atIndex', 'desc').limit(50);
    
    if(deviceId){
        query = query.where('deviceId', '==', deviceId);
    }
    if(orderId){
        query = query.where('orderId', '==', orderId);
    }
    if(pageToken){        
        query = query.where('atIndex', '<', pageToken);
    }
    
    const snap = await query.get();
    const result = {
        'filter' : request.query,
        'data': [],
        'paginator': {
            'next_page_token': ''
        }
    };
    if(!snap.empty){
        result.data = snap.docs.map(ele => {
            return ele.data();
        });

        const lastElement = snap.docs.pop();
        result.paginator.next_page_token = lastElement.get('atIndex');
    }
    response.send({code: 1, data: result});
    return true;
}

export const listRandom = async(request, response) =>{
    const result = [];
    for (let index = 0; index < 50; index++) {
        const d = new Date();
        d.setSeconds(d.getSeconds() + index);
        const element = {
            tempurature: Math.round(Math.random() * 100),
            doorDistance: Math.round(Math.random() * 10),
            orderId: 23,
            deviceId: 40,
            atIndex: index+1,
            createdDateTime: d.toISOString()
        }
        result.push(element);
    }

    response.send({
        code: 1,
        data: {
            filter: request.query,
            data: result,
            'paginator': {
                'next_page_token': 50
            }
        }
    })
    return true;
}

export const listOrder = async(request, response) =>{
    let pageToken = null;   
    
    if(request.query && request.query.pageToken){
        pageToken = request.query.pageToken;
    }
    let query = admin.firestore().collection('orders')    
    .orderBy('id', 'desc').limit(50);
    if(pageToken){        
        query = query.where('id', '<', pageToken);
    }

    const snap = await query.get();
    const result = {
        'filter' : request.query,
        'data': [],
        'paginator': {
            'next_page_token': ''
        }
    };
    if(!snap.empty){
        result.data = snap.docs.map(ele => {
            return ele.data();
        });

        const lastElement = snap.docs.pop();
        result.paginator.next_page_token = lastElement.get('id');
    }
    response.send({code: 1, data: result});
    return true;
}

export const listDevice = async(request, response) =>{
    let pageToken = null;   
    
    if(request.query && request.query.pageToken){
        pageToken = request.query.pageToken;
    }
    let query = admin.firestore().collection('device')    
    .orderBy('code', 'desc').limit(50);
    if(pageToken){        
        query = query.where('code', '<', pageToken);
    }

    const snap = await query.get();
    const result = {
        'filter' : request.query,
        'data': [],
        'paginator': {
            'next_page_token': ''
        }
    };
    if(!snap.empty){
        result.data = snap.docs.map(ele => {
            return ele.data();
        });

        const lastElement = snap.docs.pop();
        result.paginator.next_page_token = lastElement.get('code');
    }
    response.send({code: 1, data: result});
    return true;
}