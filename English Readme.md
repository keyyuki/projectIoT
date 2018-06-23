## 2. Get data temperature and door distance ##
Protocal HTTPS 

link: https://us-central1-api-project-611301476725.cloudfunctions.net/temperature/list2

method: GET

Param accept: pageToken, deviceId, orderId

- pageToken: this paginator param, this will be introduce at last "how to create paginator"
- deviceId: id of device. Using when get only data of 1 device
- orderId: id of order. Using when get only data of 1 order

When apply param, link will be change:
```
https://us-central1-api-project-611301476725.cloudfunctions.net/temperature/list2?deviceid=[your deviceId]&orderId=[your orderId]&pageToken=[your pageToken]

ex:
https://us-central1-api-project-611301476725.cloudfunctions.net/temperature/list2?deviceid=&orderId=34&pageToken=
```

Response format

```
{
    "code": 1,
    "data": {
        "filter": {},
        "data": [
            {
                "orderId": "12",
                "deviceId": "123",
                "createdDateTime": "2018-06-23T09:34:35.114Z",
                "tempurature": "89",
                "atIndex": 3,
                "doorDistance": "1"
            },
            {
                "doorDistance": "1",
                "orderId": "12",
                "deviceId": "123",
                "createdDateTime": "2018-06-23T09:34:34.005Z",
                "tempurature": "89",
                "atIndex": 2
            },
            {
                "doorDistance": "1",
                "orderId": "12",
                "deviceId": "123",
                "createdDateTime": "2018-06-23T09:34:10.176Z",
                "tempurature": "89",
                "atIndex": 1
            }
        ],
        "paginator": {
            "next_page_token": 1
        }
    }
}
```

Order by createdDateTime descending

code: response status, 1 is success, 0 is failed
data: an array of record. Maximum is 50 record per request
- orderId
- deviceId
- tempurature
- doorDistance
- createdDateTime: created date time, format date ISO 
- atIndex: index by server (dont care)
paginator: 
- next_page_token: token that will be set to tokenPage when get data of next page

### how to create paginator ###
each response has next_page_token. To get next page, using it for param pageToken
For example, next_page_token = 23. So link to next page is https://us-central1-api-project-611301476725.cloudfunctions.net/temperature/list2?pageToken=23

When no record, data will be an empty array and next_page_token='' 
