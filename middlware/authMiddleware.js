const jwt = require("jsonwebtoken");
const JWT_SECRET = "your_jwt_secret"; // Замените на ваш секретный ключ

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Токен не предоставлен" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { userId: decoded.userId }; // Убедитесь, что `userId` правильно декодируется и устанавливается.
    next();
  } catch (error) {
    console.error("Ошибка декодирования токена", error);
    return res.status(401).json({ message: "Неверный токен" });
  }
};

module.exports = authMiddleware;
