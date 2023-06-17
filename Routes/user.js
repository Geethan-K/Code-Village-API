const express = require('express');
const app = express();
const {User} = require('../Models/schema')
const jwt = require('jsonwebtoken');

// Register User
app.post('register', async (req, res) => {
    debugger
    try {
      const { username,email, password, confirmPassword } = req.body;
    //  console.log(email,password,confirmPassword)
      // Check if password and confirm password match
      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }
      
      if(password==undefined){
        return res.status(400).json({message:'password should not be empty'})
      }
  
      // Check if user already exists
      const existingUser = await  User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create new user
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
      });
  
      // Save user to the database
      await newUser.save();
  
      // Generate JWT token
      const token = jwt.sign({ userId: newUser._id }, SECRET_KEY);
  
      // Return success response with token and points
      res.status(201).json({ token, responseType:"success",message:'Registered successfully !' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Login User
  app.post('login',async (req, res) => {
    debugger
    try {
      const { email, password } = req.body;
  
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, SECRET_KEY);
  
      
      // Return success response with token and points
      res.status(200).json({ Token:token, responseType: 'success',message:'Login Success !', userdata:user });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  