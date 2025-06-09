const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

 const db = mysql.createConnection({
  host: process.env.MYSQL_ADDON_HOST,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database.');

//   db.query('CREATE DATABASE IF NOT EXISTS team_tracker', (err, result) => {
//     if (err) {
//       console.error('Error creating database:', err);
//       return;
//     }
//     console.log('Database created or already exists.');

//     db.query('SHOW DATABASES', (err, results) => {
//       if (err) {
//         console.error('Error showing databases:', err);
//         return;
//       }
//       console.log('Available databases:');
//       results.forEach(db => console.log('- ' + db.Database));
//         });
//     });
});

module.exports = db;
