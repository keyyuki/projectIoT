# projectIoT #

có các API chính sau
1. Đẩy dữ liệu từ sensor lên server
2. Lấy danh sách các record dữ liệu nhiệt độ và khoảng cách cửa
3. Lấy danh sách các đơn hàng
4. Lấy danh sách các thiết bị
5. Danh sách fake dùng để làm web, mobile trong lúc chờ hoàn thiện các phần khác

## 1. Đẩy dữ liệu từ sensor lên server ##
Giao thức HTTPS 

link: https://us-central1-api-project-611301476725.cloudfunctions.net/temperature/add2

phương thức: POST

param:


- q: đây là dữ liệu đẩy lên, có format [deviceId]-[orderId]-[temperature]-[doorDistance]. deviceId, orderId, temperature, doorDistance đều là số int không âm. Trong đó temperature = nhiệt độ đo được tại cảm biến + 300 để số đẩy lên luôn dương. Lên server chỉ việc trừ đi sau là dc. VD q=12-34-305-2 nghĩa là deviceId=12, orderId=34, temperature=305 (tức là thực tế là 5), doorDistance=2

```
POST /temperature/add2 HTTP/1.1
Host: us-central1-api-project-611301476725.cloudfunctions.net
Content-Type: application/x-www-form-urlencoded
Cache-Control: no-cache

q=12-34-305-2
```

## 2. Lấy danh sách các record dữ liệu nhiệt độ và khoảng cách cửa ##
Giao thức HTTPS 

link: https://us-central1-api-project-611301476725.cloudfunctions.net/temperature/list2

phương thức: GET


có thể bổ sung các param pageToken, deviceId, orderId để lọc lấy những dữ liệu cần thiết
- pageToken: đây là param để xác định paging. Đọc phần hướng dẫn phía dưới để biết cách query dữ liệu paging
- deviceId: id của thiết bị. Dùng trong trường hợp muốn lấy danh sách dữ liệu của chỉ 1 cảm biến
- orderId: id của đơn hàng, dùng khi muốn lấy danh sách dữ liệu của chỉ 1 đơn hàng

Khi bổ sung các param này để có dữ liệu cần có, link request sẽ đổi thành
```
https://us-central1-api-project-611301476725.cloudfunctions.net/temperature/list2?deviceid=[your deviceId]&orderId=[your orderId]&pageToken=[your pageToken]

ex:
https://us-central1-api-project-611301476725.cloudfunctions.net/temperature/list2?deviceid=&orderId=34&pageToken=
```

dữ liệu trả về là 1 chuỗi json có định dạng
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
Dữ liệu được sắp xếp sẵn theo thời gian từ cao -> thấp
code: mã response trả về, 1 là thành công, 0 là thất bại.
data: 1 array chứa danh sách các dữ liệu. Tối đa 50 dữ liệu
- orderId
- deviceId
- tempurature
- doorDistance
- createdDateTime: thời gian tạo, format giờ ISO 
- atIndex: index do server tự tạo
paginator: 
- next_page_token: token để set cho tokenPage khi muốn lấy danh sách trang tiếp theo

### cách tạo paginator ###
mỗi response trả về có next_page_token. Để có thể lấy dữ liệu của trang tiếp theo thì dùng nó làm giá trị cho param tokenPage
VD, next_page_token = 23. Để lấy trang tiếp theo ta chỉ cần gọi theo đường dẫn https://us-central1-api-project-611301476725.cloudfunctions.net/temperature/list2?pageToken=23

Khi dữ liệu hết, data sẽ là 1 array rỗng, next_page_token khi đó cũng ko có giá trị nữa

## 3. Danh sách các đơn hàng ##
Giao thức HTTPS 

link: https://us-central1-api-project-611301476725.cloudfunctions.net/temperature/list-order

phương thức: GET

Param: pageToken

maximum data per request: 50


response:
```
{
    "code": 1,
    "data": {
        "filter": {},
        "data": [
            {
                "deviceId": "123",
                "id": "12",
                "createdDateTime": "2018-06-23T09:34:37.776Z"
            }
        ],
        "paginator": {
            "next_page_token": "12"
        }
    }
}
```

## 4. Lấy danh sách các thiết bị ##
Giao thức HTTPS 

link: https://us-central1-api-project-611301476725.cloudfunctions.net/temperature/list-device

phương thức: GET

Param: pageToken

maximum data per request: 50


response:
```
{
    "code": 1,
    "data": {
        "filter": {},
        "data": [
            {
                "code": "123",                
                "createdDateTime": "2018-06-23T09:34:37.776Z"
            }
        ],
        "paginator": {
            "next_page_token": "123"
        }
    }
}
```

## 5. Danh sách fake ##
Giao thức HTTPS 
link: https://us-central1-api-project-611301476725.cloudfunctions.net/temperature/list-random
phương thức: GET

format dữ liệu trả về giống hệt với trang danh sách thông thường, nhưng dữ liệu đều là random. 
