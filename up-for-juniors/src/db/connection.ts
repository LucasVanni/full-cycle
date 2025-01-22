import bluebird from 'bluebird';
import * as mysql from "mysql2/promise";

const createConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_ROOT_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: parseInt(process.env.MYSQL_PORT),
      Promise: bluebird,
    });

    return connection;
  } catch (error) {
    console.error("Error connecting to database", error);
    throw error;
  }
};

export default createConnection;
