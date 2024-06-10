import { createNotionRouter } from './routers/notion-router.js'
import { createHelpscoutRouter } from './routers/helpscout-router.js'
import { verifyUser, handleLogin, handleLogout, serveDashboard, serveAgentDashboard } from './controllers/authController.js';
import dotenv from 'dotenv'
dotenv.config({ path: './.env' })
import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable('x-powered-by');
app.use(cookieParser());


import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  // options
});

io.on("connection", (socket) => {
  // ...
  console.log("connected from socket")
});

io.on("test", (socket) => {
  // ...
  console.log("connected from socket")
});


httpServer.listen(8000);

app.use(cors({
  origin: ['http://localhost:8000', 'http://localhost:8080','http://localhost:3000', 'http://localhost:3306', 'https://render-client-cp7n.onrender.com', 'https://www.client.tsh-admin.site', 'http://192.168.1.11:3000', process.env.MYSQL_HOST],
  credentials: true
}));

// Routes
app.use('/dashboard', createNotionRouter())
app.use('/dashboard', createHelpscoutRouter())
app.post('/login', handleLogin);
app.get('/logout', handleLogout);
app.get('/dashboard', verifyUser, serveDashboard);
app.get('/agentdashboard', verifyUser, serveAgentDashboard);

// Route for testing server status
app.get('/', (req, res) => res.send('Deployed! 🚀'));

export { app, io };