import * as express from 'express';
const cookieParse = require('cookie-parser')();
const cors = require('cors')({ origin: true });
const bodyParser = require('body-parser');

import * as Routes from '../Routes/Routes';
import { AuthenticatePlugin } from './Auth.plugin';


const app = express.Router();


app.use(AuthenticatePlugin)

app.get('/list2', Routes.list2)
app.get('/list-random', Routes.listRandom)
app.get('/list-order', Routes.listOrder)
app.get('/list-device', Routes.listDevice);

export default app;