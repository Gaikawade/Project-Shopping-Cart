require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const route = require('./routes/route');

const app = express();

app.use(bodyParser.json());
app.use(multer().any());

let DBString = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.l5fafvk.mongodb.net/${process.env.DB_NAME}`;
mongoose.connect(DBString, {useNewUrlParser: true})
        .then(() => console.log(`Hey man...I'm ready to store yout Data`))
        .catch((err) => console.log(err));

app.use('/', route);

app.listen(process.env.PORT || 3000, () =>{
    console.log(`I'm Express and I'm serving you on port ${process.env.PORT || 3000}`);
});