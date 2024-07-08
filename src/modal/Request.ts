import mongoose from "mongoose";



const RequestSchema = new mongoose.Schema({
    
    reqId:{type:String},
    information:[],
    status:{type:String}

})


const Request =  mongoose.model('Requet' , RequestSchema);


export default Request