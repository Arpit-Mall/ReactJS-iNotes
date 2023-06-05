const mongoose = require('mongoose');
const mongoURI = "mongodb://127.0.0.1:27017/iNotes?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.8.1"

const connectToMongo = async()=>{
    const connectdb = await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB Successfully");
}

module.exports = connectToMongo;

