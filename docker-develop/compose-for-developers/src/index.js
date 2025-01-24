const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/external-api", async (req, res) => {
//   const address = 'http://host.docker.internal:9000/products';
  const address = 'http://external-api:9000/products'; // Podemos voltar a usar pois o external-api está sendo incluído no compose.dev.yaml
  const response = await fetch(address);
  const data = await response.json();
  res.json(data);
});

app.get("/test-db", (req, res) => {
  const mysql = require("mysql2");
  
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to database:", err);
      res.status(500).send("Error connecting to database");
    } else {
      console.log("Connected to database");
      res.send("Connected to database");
    }
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
