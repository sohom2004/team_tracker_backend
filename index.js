const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db/db.js');
const authRoutes = require('./routes/authRoutes');

dotenv.config();
const app = express();

app.use(cors({
  origin: ["https://team-tracker-frontend-git-main-sohom2004s-projects.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.options('*', cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
