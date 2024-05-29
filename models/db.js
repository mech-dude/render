import knexLib from 'knex';
const { knex } = knexLib;
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

let knexDB = knex({
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
});

export { knexDB };