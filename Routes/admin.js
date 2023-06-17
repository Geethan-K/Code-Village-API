const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const {Admin} = require('../Models/schema')
//Register Admin
app.post('registration',async(req,res)=>{
    try {
      const { username,email, password, confirmPassword } = req.body;
  
      // Check if password and confirm password match
      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }
  
      // Check if user already exists
      const existingUser = await Admin.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create new Admin
      const newAdmin = new Admin({
        username,
        email,
        password: hashedPassword,
      });
  
      // Save user to the database
      await newAdmin.save();
  
      // Generate JWT token
      const token = jwt.sign({ userId: newAdmin._id }, SECRET_KEY);
  
      // Return success response with token and points
      res.status(201).json({ token,responseType:'success',message:'Admin created successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  })
  
  //Login Admin
  app.post('login',async(req,res)=>{
    try{
        const {email,password} = req.body;
        const admin = await Admin.findOne({email});
        if(!admin){
          return res.status(400).json({message:'Invalid username or password'})
        }
        const isPasswordValid = await bcrypt.compare(password,Admin.password);
        if (!isPasswordValid) {
          return res.status(400).json({ message: 'Invalid email or password' });
        }
    
        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, SECRET_KEY);
    
        // Return success response with token and points
        res.status(200).json({ token, responseType:'success',message:'Login Successfull' });
    }catch(error){
        res.status(500).json({ message: 'Internal server error' });
    }
  })
  
