require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
// CORS: only allow localhost for local development
const allowedOrigins = [
  
  'https://sharukeshtodo.netlify.app', // Replace with your actual Netlify URL
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); 
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.set('trust proxy', 1); 
// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
  googleId: String,
  displayName: String,
  email: String,
  passwordHash: String, // For email/password users
  photo: String, // Google photo
  photoCustom: String, // Custom uploaded photo (base64 or URL)
  todos: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
      text: String,
      completed: Boolean,
    }
  ],
  age: Number,
  phoneNumber: String,
  githubId: String,
});
const User = mongoose.model('User', userSchema);

// Passport Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://to-do-10z7.onrender.com/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ googleId: profile.id });
  if (!user) {
    user = await User.create({
      googleId: profile.id,
      displayName: profile.displayName,
      email: profile.emails[0].value,
      photo: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
    });
  } else {
    if (profile.photos && profile.photos[0] && user.photo !== profile.photos[0].value) {
      user.photo = profile.photos[0].value;
      await user.save();
    }
  }
  return done(null, user);
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Passport GitHub OAuth
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'https://to-do-10z7.onrender.com/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ githubId: profile.id });
  if (!user) {
    user = await User.create({
      githubId: profile.id,
      displayName: profile.displayName || profile.username,
      email: profile.emails && profile.emails[0] ? profile.emails[0].value : '',
      photo: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
    });
  } else {
    if (profile.photos && profile.photos[0] && user.photo !== profile.photos[0].value) {
      user.photo = profile.photos[0].value;
      await user.save();
    }
  }
  return done(null, user);
}));

// Auth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Use deployed Netlify site as default frontend URL for redirects
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://sharukeshtodo.netlify.app';
app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/',
  session: true,
}), (req, res) => {
  res.redirect(FRONTEND_URL);
});

app.get('/auth/github', passport.authenticate('github', { scope: [ 'user:email' ] }));

app.get('/auth/github/callback', passport.authenticate('github', {
  failureRedirect: '/',
  session: true,
}), (req, res) => {
  res.redirect(FRONTEND_URL);
});

app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect(FRONTEND_URL);
  });
});

app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    const { googleId, displayName, email, photo, photoCustom, age, phoneNumber } = req.user;
    res.json({
      googleId,
      displayName,
      email,
      photo: photoCustom || photo, // Prefer custom photo if set
      age,
      phoneNumber
    });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Middleware to check authentication
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: 'Not authenticated' });
}

// ToDo API
app.get('/api/todos', ensureAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user.todos || []);
});

app.post('/api/todos', ensureAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  const todo = { text: req.body.text, completed: false };
  user.todos.push(todo);
  await user.save();
  res.json(user.todos[user.todos.length - 1]);
});

app.put('/api/todos/:id', ensureAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  const todo = user.todos.id(req.params.id);
  if (todo) {
    todo.text = req.body.text;
    todo.completed = req.body.completed;
    await user.save();
    res.json(todo);
  } else {
    res.status(404).json({ message: 'Todo not found' });
  }
});

app.delete('/api/todos/:id', ensureAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  user.todos = user.todos.filter(t => t._id.toString() !== req.params.id);
  await user.save();
  res.json({ success: true });
});

app.put('/api/profile', ensureAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (req.body.displayName && typeof req.body.displayName === 'string') {
      user.displayName = req.body.displayName;
    }
    if (req.body.photoCustom && typeof req.body.photoCustom === 'string') {
      user.photoCustom = req.body.photoCustom;
    }
    if (req.body.age && !isNaN(Number(req.body.age))) {
      user.age = Number(req.body.age);
    }
    if (req.body.phoneNumber && typeof req.body.phoneNumber === 'string') {
      user.phoneNumber = req.body.phoneNumber;
    }
    await user.save();
    res.json({ displayName: user.displayName, photo: user.photoCustom || user.photo, age: user.age, phoneNumber: user.phoneNumber });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { email, password, displayName, photoCustom } = req.body;
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      displayName,
      passwordHash,
      photoCustom,
    });
    req.login(user, err => {
      if (err) return res.status(500).json({ error: 'Login after register failed' });
      res.json({
        googleId: user.googleId,
        displayName: user.displayName,
        email: user.email,
        photo: user.photoCustom || user.photo,
      });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    req.login(user, err => {
      if (err) return res.status(500).json({ error: 'Login failed' });
      res.json({
        googleId: user.googleId,
        displayName: user.displayName,
        email: user.email,
        photo: user.photoCustom || user.photo,
      });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 