const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const authenticator = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({msg: "Authorization denied"});
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({msg: "Authorization denied"})
  }
};

module.exports = authenticator;
