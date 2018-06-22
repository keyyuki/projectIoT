import * as admin from 'firebase-admin';

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