import { getConnection } from '../models/db.js';
import { getConversations } from '../models/apphq-t2cases.js';
import pkg from 'jsonwebtoken';
const jwt = pkg;

// Middleware to verify user authentication
export async function verifyUser(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
      return res.status(404).json("Token is missing");
    }
  
    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
      if (err) {
        return res.status(403).json("Error with token");
      }
  
      console.log(decoded);
      const { username, role, name } = decoded;
      if (role === 'admin') {
        //console.log("ROLE:", role);
        res.userData = { username, role , name}; // Store user role in request object
        next();
      } else if (role === 'agent') {
        //console.log("ROLE:", role);
        res.json({ username, role});
      } else {
        console.log("Not authorized");
        return res.status(403).json("Not authorized");
      }
    });
}

// Route to handle login
export async function handleLogin(req, res) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000', 'http://192.168.1.11:3000');
    res.header('Access-Control-Allow-Credentials', true);
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
      const tokenPayload = { role: user.role, name: user.name }; //Extract data from db
      jwt.sign(tokenPayload, process.env.JWT_SECRET_KEY, { expiresIn: '1d' }, (err, token) => {
        if (err) {
          console.error('Error signing JWT token:', err);
          return res.status(500).send('Internal Server Error');
        }
        console.log("token:", token);
        const sanitizedUser = { username: user.username, role: user.role, name: user.name }; // Exclude sensitive data
        res.cookie('token', token, { path: '/', secure: true, httpOnly: false }).status(200).json({ user: sanitizedUser, message: "Login success" });
        console.log('Cookies:', req.cookies);
      });
    } catch (error) {
      console.error('Error retrieving user:', error);
      return res.status(500).send('Internal Server Error');
    }
}

// Route to handle logout
export function handleLogout(req, res) {
    res.clearCookie('token');
    return res.json({ Status: "success" });
}

// Route to serve dashboard data
export async function serveDashboard(req, res) {
    try {
        // If execution reaches here, user is an admin
        const { role, name } = res.userData; // Send data to client
        const misc = {
          timestamp: new Date().toLocaleTimeString(),
          apphq: await getConversations(),
        };
        res.json({ role, name, misc });
      } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}

// Route for admin dashboard
export async function serveAdminDashboard(req, res) {
  // Admin dashboard logic
}