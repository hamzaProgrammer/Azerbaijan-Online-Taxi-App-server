const mongoose = require('mongoose')
const DB = process.env.DB;

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connection made with MongoDB Atlas")
}).catch((error) => {
    console.log("Connection to MongoD failed", error)
})