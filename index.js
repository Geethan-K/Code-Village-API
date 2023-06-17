const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {graphqlHTTP} = require("express-graphql");
const cors = require('cors');
const app = express();
const router = express.Router();
const schema = require('./Schema/Schema')
require('dotenv').config();
const SECRET_KEY = 'secret-key';

app.use('/graphql',graphqlHTTP({
  schema,
  graphiql:process.env.NODE_ENV=="development"
}))

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


app.use('/api/user/',require('./Routes/user'))
app.use('/api/admin/',require('./Routes/admin'))


//GraphQl implementation
 app.use("/graphql", graphqlHTTP({}));



// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
