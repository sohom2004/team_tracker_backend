const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db/db.js');
const authRoutes = require('./routes/authRoutes');

dotenv.config();
const app = express();

app.use(cors({
  origin: "https://team-tracker-frontend-two.vercel.app", // your live frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('Server running on port 5000');
});
