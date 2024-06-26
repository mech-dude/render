import { createNotionRouter } from './routers/notion-router.js';
import { createHelpscoutRouter } from './routers/helpscout-router.js';
import { verifyUser, handleLogin, handleLogout, serveDashboard, serveAgentDashboard } from './controllers/authController.js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable('x-powered-by');
app.use(cookieParser());

const corsOptions = {
  origin: [
    'http://localhost:8000',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:3306',
    'https://render-client-cp7n.onrender.com',
    'https://www.client.tsh-admin.site',
    'http://192.168.1.11:3000',
    process.env.MYSQL_HOST,
  ],
  credentials: true,
};

app.use(cors(corsOptions));

// Routes
app.use('/dashboard', createNotionRouter());
app.use('/dashboard', createHelpscoutRouter());
app.post('/login', handleLogin);
app.get('/logout', handleLogout);
app.get('/dashboard', verifyUser, serveDashboard);
app.get('/agentdashboard', verifyUser, serveAgentDashboard);

// Route for testing server status
app.get('/', (req, res) => res.send('Deployed! 🚀'));

// HTTP server
const server = createServer(app);

// Socket.IO server
const io = new SocketServer(server, {
  cors: corsOptions,
  transports: ['websocket'],
  pingTimeout: 60000,
});

// Proxy middleware for HTTP requests (exclude WebSocket connections)
app.use((req, res, next) => {
  if (req.headers.upgrade !== 'websocket') {
    return apiProxy(req, res, next);
  }
  next();
});

const apiProxy = createProxyMiddleware({
  target: `http://localhost:${process.env.PORT}`,
  changeOrigin: true,
});

export {server, io}