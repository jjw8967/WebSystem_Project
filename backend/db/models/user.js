const { mongoose, autoIncrement } = require('../mongo')

//Set User Schema
const userSchema = mongoose.Schema({
    ID : {type: String, unique: true},
    password : {type :String, required: true},
    call : {type :String},
    nickname : {type : String},
    name : {type: String, required: true},
    department: {type: String, required: true},
    auth: {type: Boolean, default: false},
    interest: {type: String},
    birth: {type: Number}
});

//module exports to Routers ★★★★★★★★★★★★
module.exports = mongoose.model("user", userSchema);

