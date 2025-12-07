// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ====== MongoDB connection ======
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartwinnr_dashboard';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

// ====== User model ======
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// ====== UserActivity model (for user dashboard charts) ======
const userActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  sessions: { type: Number, default: 0 },
  points: { type: Number, default: 0 }
});

userActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

// ====== UserInterest model (sports interests) ======
const userInterestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sport: { type: String, required: true },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  createdAt: { type: Date, default: Date.now }
});

const UserInterest = mongoose.model('UserInterest', userInterestSchema);

// ====== Seed default admin ======
async function seedAdmin() {
  const adminEmail = 'admin@smartwinnr.com';
  const existing = await User.findOne({ email: adminEmail });

  if (!existing) {
    const hash = await bcrypt.hash('Admin@123', 10);
    await User.create({
      name: 'Admin User',
      email: adminEmail,
      passwordHash: hash,
      role: 'admin'
    });
    console.log('Seeded default admin: admin@smartwinnr.com / Admin@123');
  }
}
seedAdmin();

// ====== Helpers ======
function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'secret123',
    { expiresIn: '2h' }
  );
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

// Seed sample user activity for demo
async function ensureSampleActivityForUser(userId) {
  const now = new Date();
  const from = new Date();
  from.setDate(now.getDate() - 6);

  const count = await UserActivity.countDocuments({
    userId,
    date: { $gte: from }
  });

  if (count > 0) return;

  const docs = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    docs.push({
      userId,
      date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
      sessions: Math.floor(Math.random() * 5) + 1,
      points: Math.floor(Math.random() * 50) + 10
    });
  }
  await UserActivity.insertMany(docs);
}

// ====== ROUTES ======

// Health check
app.get('/', (req, res) => {
  res.send('Smartwinnr Admin API is running');
});

// ---------- AUTH ----------

// PUBLIC: user registration (role always 'user')
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'user' // important: no one can self-register as admin
    });

    // auto-login after registration
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login (admin or normal user)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Current user profile
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// ---------- ADMIN DASHBOARD METRICS ----------
app.get('/api/metrics', authMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    const now = new Date();
    const from = new Date();
    from.setDate(now.getDate() - 6);

    const recentUsers = await User.find({ createdAt: { $gte: from } });

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const label = d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short'
      });

      const countForDay = recentUsers.filter((u) => {
        const ud = new Date(u.createdAt);
        return (
          ud.getDate() === d.getDate() &&
          ud.getMonth() === d.getMonth() &&
          ud.getFullYear() === d.getFullYear()
        );
      }).length;

      days.push({ date: label, value: countForDay });
    }

    const salesByProduct = [
      { label: 'CRM Licenses', value: 120 },
      { label: 'Add-ons', value: 80 },
      { label: 'Support', value: 50 }
    ];

    // aggregate sports interests (for pie chart)
    let sportsInterests = [];
    try {
      const interestsAgg = await UserInterest.aggregate([
        { $group: { _id: '$sport', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
      sportsInterests = interestsAgg.map((i) => ({
        sport: i._id,
        count: i.count
      }));
    } catch (e) {
      console.error('Sports interests aggregation error:', e.message);
    }

    return res.json({
      summary: {
        totalUsers,
        activeUsers,
        totalSales: 250,
        newSignupsToday: days[6]?.value || 0
      },
      charts: {
        last7DaysSignups: days,
        salesByProduct,
        sportsInterests // pie chart only uses these interests
      }
    });
  } catch (err) {
    console.error('Metrics error:', err);
    return res.status(500).json({ message: 'Server error in /api/metrics' });
  }
});

// ---------- USER DASHBOARD (per logged-in user) ----------
app.get('/api/user/dashboard', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    await ensureSampleActivityForUser(userId);

    const now = new Date();
    const from = new Date();
    from.setDate(now.getDate() - 6);

    const activities = await UserActivity.find({
      userId,
      date: { $gte: from }
    }).sort({ date: 1 });

    let totalSessions = 0;
    let totalPoints = 0;
    const days = activities.map((a) => {
      totalSessions += a.sessions;
      totalPoints += a.points;
      return {
        date: a.date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short'
        }),
        sessions: a.sessions,
        points: a.points
      };
    });

    res.json({
      summary: {
        totalSessions,
        totalPoints,
        daysTracked: days.length
      },
      charts: {
        sessionsLast7Days: days.map((d) => ({ date: d.date, value: d.sessions })),
        pointsLast7Days: days.map((d) => ({ date: d.date, value: d.points }))
      }
    });
  } catch (err) {
    console.error('User dashboard error:', err);
    res.status(500).json({ message: 'Server error in /api/user/dashboard' });
  }
});

// ---------- USER SPORTS INTERESTS ----------
app.post('/api/user/interests', authMiddleware, async (req, res) => {
  try {
    const { sport, level } = req.body;
    if (!sport) {
      return res.status(400).json({ message: 'Sport is required' });
    }

    const doc = await UserInterest.create({
      userId: req.user.id,
      sport,
      level: level || 'Beginner'
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error('User interest error:', err);
    res.status(500).json({ message: 'Server error in /api/user/interests' });
  }
});

// ---------- USERS MANAGEMENT (Admin only) ----------
app.get('/api/users', authMiddleware, requireAdmin, async (req, res) => {
  const users = await User.find().select('-passwordHash');
  res.json(users);
});

app.patch(
  '/api/users/:id/toggle-active',
  authMiddleware,
  requireAdmin,
  async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    });
  }
);

app.delete('/api/users/:id', authMiddleware, requireAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

// ====== Start server ======
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});