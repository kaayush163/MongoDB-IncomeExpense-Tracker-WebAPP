const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');   /// Helmet is a nodejs package that helps protect your server from some well-known web vulnerabilities by setting HTTP response headers appropriately
const morgan = require('morgan');
const fs = require('fs');
const mongoose = require('mongoose')
dotenv.config();

const app = express();

console.log(process.env.NODE_ENV);

app.use(express.static(path.join(__dirname,"./views")));
app.use(bodyParser.json());
app.use(cors());

const userRoutes = require('./routes/signup');
const expenseRoutes = require('./routes/expense');
const updateexpenseRoutes = require('./routes/updatexpense');
const purchaseRoutes = require('./routes/purchase');
const premiumFeatureRoutes = require('./routes/premiumfeature');
const resetPasswordRoutes = require('./routes/resetpassword')
app.use('/user',userRoutes);
app.use('/expense', expenseRoutes);
app.use('/updateexpense', updateexpenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumFeatureRoutes);
app.use('/password', resetPasswordRoutes);

const accessLogStream = fs.createWriteStream(
    path.join(__dirname,'access.log'),{flags: 'a'}   ///flag a will append new data to access log if not write flag a it will overwrtite the data previous one
);   

app.use(helmet());
app.use(morgan('combined',{stream:accessLogStream}));   ///used for logging request to chech request situtations GET,POST everything

mongoose.connect(process.env.MONGODB_ATLAS_URL)
    .then((result) => {
        // console.log('Connected to atlas!',result)
        app.listen(3000)
    })
    .catch(err => console.log(err))