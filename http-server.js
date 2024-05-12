/*import { createPool, getConnection } from './models/db.js';
import { createNotionRouter } from './routers/notion-router.js'
import { createHelpscoutRouter } from './routers/helpscout-router.js'
import { verifyUser, handleLogin, handleLogout, serveDashboard, serveAdminDashboard } from './controllers/authController.js';
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
  origin: ['http://localhost:3000', 'http://localhost:3306', 'https://render-client-cp7n.onrender.com', 'https://www.client.tsh-admin.site', 'http://192.168.1.11:3000', process.env.MYSQL_HOST],
  credentials: true
}));

// Initialize MySQL connection pool
createPool();

app.use('/dashboard', createNotionRouter())
app.use('/dashboard', createHelpscoutRouter())
app.post('/login', handleLogin);
app.get('/logout', handleLogout);
app.get('/dashboard', verifyUser, serveDashboard);
app.get('/admindashboard', verifyUser, serveAdminDashboard);

// Route for testing server status
app.get('/', (req, res) => res.send('Deployed! 🚀'));


export default app;*/