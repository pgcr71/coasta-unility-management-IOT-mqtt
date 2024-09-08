import express from 'express';
import bodyParser from 'body-parser';

import { createInfoTable, insert_message } from './utils.js';
import { errorHandler } from './errorMiddleware.js';
const app = express();
app.use(errorHandler);
const port = 1883;
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/', (req, res) => {
    console.log(req.body)
    const body = req.body;
    createInfoTable();
    insert_message('device', body)
    res.send('OK')
})

app.get('/', (req, res) => {
    console.log(req.query)
    const body= req.query;
    createInfoTable();
    insert_message('device', body)
    res.send('OK')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})