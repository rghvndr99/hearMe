import jwt from 'jsonwebtoken';
export default function (req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const token = auth.split(' ')[1];
    const data = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = data;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
