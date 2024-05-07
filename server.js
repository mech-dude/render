import { createNotionRouter } from './routers/notion-router.js'
import { createHelpscoutRouter } from './routers/helpscout-router.js'
import { getConversations } from './models/apphq-t2cases.js';
import dotenv from 'dotenv'
dotenv.config({ path: './.env' })
import mysql from 'mysql2';
import express, { query } from 'express';
import cors from 'cors'
import bcrypt from 'bcrypt'
import pkg from 'jsonwebtoken';
const jwt = pkg;
import cookieParser from 'cookie-parser';
import fs from 'fs';
import https from 'https';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable('x-powered-by');
app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3306', 'https://render-client-cp7n.onrender.com', process.env.MYSQL_HOST],
  credentials: true
}));

const pool = mysql.createPool({
  connectionLimit: process.env.MYSQL_CONNECTION_LIMIT,
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

app.use('/dashboard', createNotionRouter())
app.use('/dashboard', createHelpscoutRouter())

const getConnection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      } else {
        resolve(connection);
      }
    });
  });
};

getConnection()

const verifyUser = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
      return res.status(404).json("Token is missing");
  } else {
      jwt.verify(token, "jwt-secret-key", (err, decoded) => {
          if (err) {
              return res.status(403).json("Error with token");
          } else {
              console.log(decoded)
              const { username, role } = decoded;
              if (role === 'admin') {
                  console.log("ROLE:", role)
                  res.userData = { username, role }; // Store user role in request object
                  next();
              } else if (role === 'agent') {
                  console.log("ROLE:", role)
                  //res.userData = { username, role }; // Respond with user role if agent
                  res.json({ username, role });
              } else {
                  console.log("Not authorized")
                  return res.status(403).json("Not authorized");
              }
          }
      });
  }
}

app.get('/', (req, res) => res.send('Deployed! 🚀'));

app.get('/dashboard', verifyUser, async (req, res) => {
  // If execution reaches here, user is an admin
  const { username, role } = res.userData;
  const misc = {
    message: 'Hello from Express!',
    timestamp: new Date().toLocaleTimeString(),
    apphq: await getConversations(),
  };
  res.json({ username, role , misc });
});

app.get('/admindashboard', verifyUser, (req, res) => {

});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  
  pool.query(sql, [username, password], (error, results) => {
      if (error) {
          console.error('Error retrieving user:', error);
          return res.status(500).send('Internal Server Error');
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "User not found or incorrect password" });
      }

      const user = results[0];
      const tokenPayload = { username: user.username, role: user.role };

      jwt.sign(tokenPayload, process.env.JWT_SECRET_KEY, { expiresIn: '1d' }, (err, token) => {
          if (err) {
              console.error('Error signing JWT token:', err);
              return res.status(500).send('Internal Server Error');
          }

          //res.cookie('token', token);
          //return res.status(200).json({ user, message: "Login success" });
          res.cookie('token', token, { path: '/' }).status(200).json({ user, message: "Login success" });
          console.log('Cookies:', req.cookies);

      });
  });
});

app.get('/logout', (req, res) =>{
  res.clearCookie('token');
   return res.json({Status: "success"})
})



// Start the server
const PORT = process.env.PORT || 8080;

app.listen(PORT, () =>
    console.log(`Listening on PORT ${PORT}`)
)