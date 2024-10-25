const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const pool = require("../db"); // Подключение к базе данных

const router = express.Router();
const JWT_SECRET = "your_jwt_secret"; // Замените на ваш секретный ключ

// Регистрация пользователя
router.post(
  "/register",
  body("name").isString().isLength({ min: 3 }),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Проверка существования пользователя
      const existingUser = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      if (existingUser.rows.length > 0) {
        return res
          .status(400)
          .json({ message: "Пользователь с таким email уже существует" });
      }

      // Хэширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);

      // Создание нового пользователя
      const newUser = await pool.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
        [name, email, hashedPassword]
      );

      res.status(201).json({ userId: newUser.rows[0].id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }
);

// Авторизация пользователя
router.post(
  "/login",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      if (user.rows.length === 0) {
        return res.status(400).json({ message: "Неверные email или пароль" });
      }

      // Сравнение паролей
      const isMatch = await bcrypt.compare(password, user.rows[0].password);
      if (!isMatch) {
        return res.status(400).json({ message: "Неверные email или пароль" });
      }

      // Генерация JWT токена
      const token = jwt.sign({ userId: user.rows[0].id }, JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ id: user.rows[0].id, name: user.rows[0].name, token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }
);

module.exports = router;
