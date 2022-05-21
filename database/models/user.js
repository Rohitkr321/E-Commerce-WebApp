var mongoose = require("mongoose");
let role ={
  adin:"admin",
  user:"customer"
}
const userSchema = new mongoose.Schema({
name :{
    type: String,
    required:true
  },
username: {
    type: String,
    required: true,

  },
password:{
    type: String,
    required: true,
}, 
isVerified:{
  type :Boolean,
  required:true
},
userType:{
  type:String,
  default:role.user,
},
});

const userModel = mongoose.model('userData', userSchema);

module.exports = userModel;