const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const https = require("https");

const app = express();

// Middleware to parse JSON
app.use(express.json());
app.options("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(204);
});
// // configure the app to use bodyParser()
// app.use(bodyParser.urlencoded({
//   extended: true
// }));
// app.use(bodyParser.json());

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



// Sample Default

app.get('/', function(req, res) {
  res.json({Name:'Kakashi',Clan:'hatake'});
});


// Register User
app.post('/api/register', async (req, res) => {
  debugger
  try {
    const { email, password, confirmPassword } = req.body;
    console.log(email,password,confirmPassword)
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
      email,
      password: hashedPassword,
    });

    // Save user to the database
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, 'secret-key');

    // Return success response with token and points
    res.status(201).json({ token, points: newUser.points });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login User
app.post('/api/login', async (req, res) => {
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
    const token = jwt.sign({ userId: user._id }, 'secret-key');

    // Return success response with token and points
    res.status(200).json({ token, points: user.points });
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
    const token = jwt.sign({ userId: newAdmin._id }, 'secret-key');

    // Return success response with token and points
    res.status(201).json({ token });
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
      const token = jwt.sign({ userId: user._id }, 'secret-key');
  
      // Return success response with token and points
      res.status(200).json({ token, points: user.points });
  }catch(error){
      res.status(500).json({ message: 'Internal server error' });
  }
})


// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});