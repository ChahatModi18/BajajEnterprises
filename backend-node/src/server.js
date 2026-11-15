import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const app = express();
const cookieName = 'bajaj_session';
const isProd = process.env.NODE_ENV === 'production';
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');

const User = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['CUSTOMER', 'ADMIN'], default: 'CUSTOMER' },
}, { timestamps: true, versionKey: false }));

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });
const cookieOptions = { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 1000 };
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });
const issueSession = (res, user) => res.cookie(cookieName, jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' }), cookieOptions);

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies[cookieName];
    if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    const user = await User.findById(payload.sub);
    if (!user || user.role !== payload.role) return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
    req.user = user; next();
  } catch { return res.status(401).json({ message: 'Your session is invalid or has expired.' }); }
}
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: 'You do not have permission to access this resource.' });
  next();
};

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.post('/auth/register', authLimit, async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) return res.status(400).json({ message: 'Name must be between 2 and 80 characters.' });
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (typeof password !== 'string' || password.length < 10 || password.length > 72) return res.status(400).json({ message: 'Use a password between 10 and 72 characters.' });
    const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), passwordHash: await bcrypt.hash(password, 12) });
    issueSession(res, user); return res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' });
    if (err?.name === 'ValidationError') return res.status(400).json({ message: 'Please check your details and try again.' });
    return res.status(500).json({ message: 'We could not create your account right now.' });
  }
});
app.post('/auth/login', authLimit, async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Email or password is incorrect.' });
  issueSession(res, user); return res.json({ user: publicUser(user) });
});
app.get('/auth/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));
app.get('/auth/dashboard', requireAuth, (req, res) => res.json({ user: publicUser(req.user), message: 'Your account is ready.' }));
app.get('/auth/admin/dashboard', requireAuth, requireRole('ADMIN'), (req, res) => res.json({ user: publicUser(req.user) }));
app.post('/auth/logout', (_req, res) => res.clearCookie(cookieName, { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/' }).json({ message: 'Signed out successfully.' }));
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ message: 'Something went wrong.' }); });

const port = Number(process.env.PORT || 4000);
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bajaj_auth')
  .then(() => app.listen(port, () => console.log(`Authentication service listening on ${port}`)))
  .catch((err) => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
