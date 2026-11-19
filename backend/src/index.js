require("dotenv").config(); 

console.log("Servidor iniciado");

const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

const pool = require('./config/db');

pool.query('SELECT NOW()')
  .then(res => {
    console.log('DB conectada:', res.rows[0]);
  })
  .catch(err => {
    console.error('Error conectando DB:', err);
  });
