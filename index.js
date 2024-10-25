require('dotenv').config();
const express = require('express');
const pool = require('./db');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

// Маршруты будут подключены позже
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);
const userAuth = require('./routes/auth');
app.use('/api/auth', userAuth);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
