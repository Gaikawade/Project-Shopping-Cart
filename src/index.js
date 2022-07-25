const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const route = require('./routes/route');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().any());

let DBString = "mongodb+srv://Mahesh8985:lz9fOW52615YVat4@cluster0.l5fafvk.mongodb.net/productsManagement";
mongoose.connect(DBString, {useNewUrlParser: true})
        .then(() => console.log('MongoDB is connected'))
        .catch((err) => console.log(err));

app.use('/', route);

app.listen(process.env.PORT || 3000, () =>{
    console.log(`Express Server is running on port ${process.env.PORT || 3000}`);
});