const express = require('express')
const cors = require('cors')
const app = express();
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
dotenv.config({
    path: './config.env'
})
//const fileupload = require("express-fileupload")
require('./db/conn')
var port = process.env.PORT || 8080;

app.use(bodyParser.json({
    limit: '30mb',
    extended: true
}))
app.use(bodyParser.urlencoded({
    limit: '30mb',
    extended: true
}))
app.use(cors())

// app.use(fileupload({
//     useTempFiles: true
// }))


app.use('/driverPics', express.static('driverPics'));
app.use('/customerPics', express.static('customerPics'));
app.use('/ordersPics', express.static('ordersPics'));


app.use(express.json())

// adding routes
app.use(require('./routes/CustomerRoutes'))
app.use(require('./routes/DriverRoutes'))
app.use(require('./routes/OrderRoutes'))
app.use(require('./routes/AdminRoutes'))
app.use(require('./routes/ServicesRoutes'))
app.use(require('./routes/RadiusRoutes'))
app.use(require('./routes/AnnouncementRoutes'))
app.use(require('./routes/ComplaintTypesRoutes'))
app.use(require('./routes/RegionsRoutes'))



app.listen(process.env.PORT || 8080, (req, res) => {
    console.log(`Express Server Running at ${port}`)
})