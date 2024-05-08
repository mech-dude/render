import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

let pool;

const createPool = async () => {
  try {
    if (!pool) {
      pool = mysql.createPool({
        connectionLimit: process.env.MYSQL_CONNECTION_LIMIT,
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
      });
      await pool.getConnection(); // Test the connection
      console.log('Connected to MySQL database');
    }
  } catch (error) {
    console.error('Error connecting to MySQL database:', error);
    await new Promise(resolve => setTimeout(resolve, 5000)); // Retry after 5 seconds
    console.log('Retrying connection to MySQL database...');
    await createPool(); // Recursive call for retry
  }
};

const getConnection = async () => {
  if (!pool) {
    await createPool();
  }
  return pool.getConnection();
};

export { createPool, getConnection };