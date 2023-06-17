
const mongoose = require('mongoose');


  // User Schema
const userSchema = new mongoose.Schema({
    username:{
      type:string,
      required:true
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      default: 100,
    },
  });

  const adminSchema = new mongoose.Schema({
    username : {
      type:String,
      required:true,
      unique:true    
    },
    email:{
      type:String,
      required:true,
      unique:true
    },
    password:{
      type:String,
      required:true,
    }
  })

  const Admin = mongoose.model('Admin',adminSchema);
  const User = mongoose.model('User', userSchema);

module.exports = {User,Admin}