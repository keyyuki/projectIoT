import * as express from 'express';
const cookieParse = require('cookie-parser')() ;
const cors = require('cors')({ origin: true });
const bodyParser = require('body-parser');

import * as Routes from './Routes';
import * as UnauthRoutes from '../SecurityRoutes/unauth.routes'
import AuthRouter from '../SecurityRoutes'

const app = express();
// enable cross domain
app.use(cors);
// enable cookie parser
app.use(cookieParse);
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())



app.post('/add', Routes.add2)
app.get('/list', Routes.listTemp)
app.post('/add2', Routes.add2)
app.get('/list2', Routes.list2)
app.get('/list-random', Routes.listRandom)
app.get('/list-order', Routes.listOrder)
app.get('/list-device', Routes.listDevice);

app.post('/registration', UnauthRoutes.registration)
app.post('/login', UnauthRoutes.login)

app.use('/auth', AuthRouter);


export default app;