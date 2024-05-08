import { createPool, getConnection } from './models/db.js';
import { createNotionRouter } from './routers/notion-router.js'
import { createHelpscoutRouter } from './routers/helpscout-router.js'
import { getConversations } from './models/apphq-t2cases.js';
import dotenv from 'dotenv'
dotenv.config({ path: './.env' })
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
  origin: ['http://localhost:3000', 'http://localhost:3306', 'https://render-client-cp7n.onrender.com', 'https://www.client.tsh-admin.site', process.env.MYSQL_HOST],
  credentials: true
}));

// Initialize MySQL connection pool
createPool();

app.use('/dashboard', createNotionRouter())
app.use('/dashboard', createHelpscoutRouter())

// Middleware to verify user authentication
const verifyUser = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(404).json("Token is missing");
  }

  jwt.verify(token, "jwt-secret-key", (err, decoded) => {
    if (err) {
      return res.status(403).json("Error with token");
    }

    console.log(decoded);
    const { username, role } = decoded;
    if (role === 'admin') {
      console.log("ROLE:", role);
      res.userData = { username, role }; // Store user role in request object
      next();
    } else if (role === 'agent') {
      console.log("ROLE:", role);
      res.json({ username, role });
    } else {
      console.log("Not authorized");
      return res.status(403).json("Not authorized");
    }
  });
};

// Route to handle login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';

  try {
    const connection = await getConnection();
    const [results] = await connection.query(sql, [username, password]);
    connection.release();

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
      console.log("token:", token);
      res.cookie('token', token, { path: '/', secure: true, httpOnly: false }).status(200).json({ user, message: "Login success" });
      console.log('Cookies:', req.cookies);
    });
  } catch (error) {
    console.error('Error retrieving user:', error);
    return res.status(500).send('Internal Server Error');
  }
});

// Route to handle logout
app.get('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ Status: "success" });
});

// Route to serve dashboard data
app.get('/dashboard', verifyUser, async (req, res) => {
  try {
    // If execution reaches here, user is an admin
    const { username, role } = res.userData;
    const misc = {
      message: 'Hello from Express!',
      timestamp: new Date().toLocaleTimeString(),
      apphq: await getConversations(),
    };
    res.json({ username, role, misc });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route for admin dashboard
app.get('/admindashboard', verifyUser, (req, res) => {
  // Handle admin dashboard logic here
});

// Route for testing server status
app.get('/', (req, res) => res.send('Deployed! 🚀'));

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));