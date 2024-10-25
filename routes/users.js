const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middlware/authMiddleware");

// Получения всех пользователей
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users;");
    console.log(result.rows);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// Регистрация нового пользователя
// router.post('/', async (req, res) => {
//   const { name, email, learning_goals, learning_style } = req.body;
//   try {
//     const result = await pool.query(
//       'INSERT INTO users (name, email, learning_goals, learning_style) VALUES ($1, $2, $3, $4) RETURNING *',
//       [name, email, learning_goals, learning_style]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send('Server error');
//   }
// });

// Добавление предпочтений пользователя
router.post("/preferences", authMiddleware, async (req, res) => {
  const { userId } = req.user; // Предполагаем, что токен уже проверен в middleware и userId доступен
  const { preferences } = req.body;

  if (!preferences || !Array.isArray(preferences)) {
    return res
      .status(400)
      .json({ message: "Предпочтения должны быть в виде массива" });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET preferences = $1 WHERE id = $2 RETURNING preferences",
      [preferences, userId]
    );

    res.status(200).json({ preferences: result.rows[0].preferences });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при обновлении предпочтений" });
  }
});

// Обновление предпочтений пользователя
router.put("/preferences", authMiddleware, async (req, res) => {
  const { userId } = req.user;
  const { preferences } = req.body;

  if (!preferences || !Array.isArray(preferences)) {
    return res
      .status(400)
      .json({ message: "Предпочтения должны быть в виде массива" });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET preferences = $1 WHERE id = $2 RETURNING preferences",
      [preferences, userId]
    );

    res.status(200).json({ preferences: result.rows[0].preferences });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при обновлении предпочтений" });
  }
});

// Удаление всех предпочтений пользователя
router.delete("/preferences", authMiddleware, async (req, res) => {
  const { userId } = req.user;

  try {
    const result = await pool.query(
      "UPDATE users SET preferences = '{}' WHERE id = $1 RETURNING preferences",
      [userId]
    );

    res.status(200).json({ preferences: result.rows[0].preferences });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при удалении предпочтений" });
  }
});

// Получение предпочтений пользователя
router.get("/preferences", authMiddleware, async (req, res) => {
  const { userId } = req.user;

  try {
    const result = await pool.query(
      "SELECT preferences FROM users WHERE id = $1",
      [userId]
    );

    res.status(200).json({ preferences: result.rows[0].preferences });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при получении предпочтений" });
  }
});

module.exports = router;
