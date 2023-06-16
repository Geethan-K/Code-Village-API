const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const https = require("https");
const cors = require('cors');
const app = express();
const router = express.Router();
const SECRET_KEY = 'secret-key';
app.options("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(204);
});

app.use(cors());
// Middleware to parse JSON
app.use(express.json());

app.use((req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'Token not provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Attach the decoded payload to the request object
    req.user = decoded;
    next();
  });
});

const DbUrl = 'mongodb+srv://Kakashi:SilentKiller@codevillagecluster.rbzkcod.mongodb.net/?retryWrites=true&w=majority';
// Connect to MongoDB
mongoose.connect(DbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.log(error));

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

const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin',adminSchema);


//Middleware to verify jwt 
/*
function verifyToken(req,res,next){
  const token = req.headers['authorization'];
  if(!token){
    res.status(403).json({message:'token not provided'})
  }
  jwt.verify(token,SECRET_KEY,(err,decoded)=>{
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
      // Attach the decoded payload to the request object
      req.user = decoded;
      next();
  })
}
*/

// Sample Default

app.get('/', function(req, res) {
  res.json({Name:'Madhara',Clan:'Uchiha'});
});



// Register User
app.post('/api/register', async (req, res) => {
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
    const existingUser = await User.findOne({ email });
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
app.post('/api/login',async (req, res) => {
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

//Register Admin
app.post('/api/admin/registration',async(req,res)=>{
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
app.post('/api/admin/login',async(req,res)=>{
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


// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
