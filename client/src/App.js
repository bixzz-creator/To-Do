import React, { useEffect, useState } from 'react';
import './App.css';
import ReCAPTCHA from 'react-google-recaptcha';

// Always use localhost:5000 for API in development and production (local only)
const API_URL = 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [view, setView] = useState('home');
  const [profileName, setProfileName] = useState('');
  const [showBoom, setShowBoom] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [authView, setAuthView] = useState('landing');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPassword2, setSignupPassword2] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupPhotoPreview, setSignupPhotoPreview] = useState('');
  const [signupError, setSignupError] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [showAddForm, setShowAddForm] = useState(false);
  const [todoCategory, setTodoCategory] = useState('personal');
  const [profileAge, setProfileAge] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [signupCaptcha, setSignupCaptcha] = useState(null);
  const [signupCaptchaError, setSignupCaptchaError] = useState('');
  const [signupAge, setSignupAge] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [completionAge, setCompletionAge] = useState('');
  const [completionPhone, setCompletionPhone] = useState('');
  const [completionError, setCompletionError] = useState('');
  const [completionName, setCompletionName] = useState('');
  const [completionCaptcha, setCompletionCaptcha] = useState(null);
  const [completionCaptchaError, setCompletionCaptchaError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/auth/user`, {
      credentials: 'include',
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUser(data);
        setProfileName(data?.displayName || '');
        setProfileImage(data?.photo || '');
        setProfileImagePreview('');
        setProfileAge(data?.age || '');
        setProfilePhone(data?.phoneNumber || '');
        setLoading(false);
        if (data) fetchTodos();
      });
  }, []);

  useEffect(() => {
    if (user && (!user.displayName || !user.age || !user.phoneNumber)) {
      setShowProfileCompletion(true);
      setCompletionName(user.displayName || '');
      setCompletionAge(user.age || '');
      setCompletionPhone(user.phoneNumber || '');
    } else {
      setShowProfileCompletion(false);
    }
  }, [user]);

  const fetchTodos = () => {
    fetch(`${API_URL}/api/todos`, { credentials: 'include' })
      .then(res => res.json())
      .then(setTodos);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleLogout = () => {
    window.location.href = `${API_URL}/auth/logout`;
  };

  const addTodo = e => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    fetch(`${API_URL}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ text: newTodo }),
    })
      .then(res => res.json())
      .then(todo => {
        setTodos([...todos, todo]);
        setNewTodo('');
        setShowAddForm(false);
      });
  };

  const toggleTodo = (id, completed, text) => {
    fetch(`${API_URL}/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ completed: !completed, text }),
    })
      .then(res => res.json())
      .then(updated => {
        setTodos(todos.map(t => t._id === id ? updated : t));
        if (!completed) {
          setShowBoom(true);
          setTimeout(() => setShowBoom(false), 1500);
        }
      });
  };

  const deleteTodo = id => {
    fetch(`${API_URL}/api/todos/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then(() => setTodos(todos.filter(t => t._id !== id)));
  };

  const startEdit = (id, text) => {
    setEditId(id);
    setEditText(text);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditText('');
  };

  const saveEdit = (id, completed) => {
    fetch(`${API_URL}/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ text: editText, completed }),
    })
      .then(res => res.json())
      .then(updated => {
        setTodos(todos.map(t => t._id === id ? updated : t));
        setEditId(null);
        setEditText('');
      });
  };

  const handleProfileImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = e => {
    e.preventDefault();
    fetch(`${API_URL}/api/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        displayName: profileName,
        photoCustom: profileImagePreview || undefined,
        age: profileAge,
        phoneNumber: profilePhone,
      }),
    })
      .then(res => res.json())
      .then(data => {
        setUser(u => ({ ...u, displayName: data.displayName, photo: data.photo, age: data.age, phoneNumber: data.phoneNumber }));
        setProfileImage(data.photo);
        setProfileImagePreview('');
        setView('home');
      });
  };

  const handleSignupPhotoChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignupPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getAvatarUrl = (name) => {
    if (!name) return '';
    const firstLetter = encodeURIComponent(name.trim()[0].toUpperCase());
    return `https://ui-avatars.com/api/?name=${firstLetter}&background=6d28d9&color=fff&size=128`;
  };

  const handleSignup = async e => {
    e.preventDefault();
    setSignupError('');
    setSignupCaptchaError('');
    if (!signupEmail || !signupPassword || !signupPassword2 || !signupName || !signupAge || !signupPhone) {
      setSignupError('All fields are required.');
      return;
    }
    if (signupPassword !== signupPassword2) {
      setSignupError('Passwords do not match.');
      return;
    }
    if (!signupCaptcha) {
      setSignupCaptchaError('Please complete the CAPTCHA.');
      return;
    }
    const avatarUrl = getAvatarUrl(signupName);
    const res = await fetch(`${API_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: signupEmail,
        password: signupPassword,
        displayName: signupName,
        age: signupAge,
        phoneNumber: signupPhone,
        captcha: signupCaptcha,
        photoCustom: avatarUrl,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setSignupError(data.error || 'Registration failed');
      return;
    }
    setUser(data);
    setAuthView('');
    setShowWelcome(true);
    setView('profile'); // Show profile with welcome after signup
  };

  const handleLogin = async e => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail || !loginPassword) {
      setLoginError('Email and password required.');
      return;
    }
    const res = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoginError(data.error || 'Login failed');
      return;
    }
    setUser(data);
    setAuthView('');
    setShowWelcome(true);
    setView('profile'); // Show profile with welcome after login
  };

  const handleProfileCompletion = async e => {
    e.preventDefault();
    setCompletionError('');
    setCompletionCaptchaError('');
    if (!completionName || !completionAge || !completionPhone) {
      setCompletionError('All fields are required.');
      return;
    }
    if (!completionCaptcha) {
      setCompletionCaptchaError('Please complete the CAPTCHA.');
      return;
    }
    const res = await fetch(`${API_URL}/api/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ displayName: completionName, age: completionAge, phoneNumber: completionPhone, captcha: completionCaptcha }),
    });
    const data = await res.json();
    if (!res || !res.ok) {
      setCompletionError(data.error || 'Failed to update profile.');
      return;
    }
    setUser(u => ({ ...u, displayName: data.displayName, age: data.age, phoneNumber: data.phoneNumber }));
    setShowProfileCompletion(false);
    setView('home');
  };

  // Filter and search todos
  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && !todo.completed) || 
      (filter === 'completed' && todo.completed);
    return matchesSearch && matchesFilter;
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your tasks...</p>
      </div>
    );
  }

  if ((!user || user.message) && authView !== '') {
    if (authView === 'landing') {
      return (
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo">
                <span className="logo-icon">✓</span>
                <h1>TaskMaster</h1>
              </div>
              <p className="auth-subtitle">Organize your life, one task at a time</p>
            </div>
            <button className="auth-btn auth-btn-secondary" onClick={() => setAuthView('login')}>
              <span style={{fontWeight:600}}>Sign In with Email</span>
            </button>
            <button className="auth-btn auth-btn-primary" onClick={() => setAuthView('signup')}>
              Create Account
            </button>
            <div className="auth-divider"><span>or</span></div>
            <button className="auth-btn auth-btn-google" onClick={handleGoogleLogin}>
              <span className="google-icon">
                <svg width="22" height="22" viewBox="0 0 48 48">
                  <g>
                    <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.3 4.5 29.4 2.5 24 2.5 12.7 2.5 3.5 11.7 3.5 23S12.7 43.5 24 43.5c10.5 0 20-8.5 20-20 0-1.3-.1-2.7-.3-3.5z"/>
                    <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 17.1 19.2 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.3 4.5 29.4 2.5 24 2.5c-6.6 0-12.2 2.7-16.2 7.2z"/>
                    <path fill="#FBBC05" d="M24 43.5c5.6 0 10.3-1.8 13.7-4.9l-6.3-5.2c-2.1 1.5-4.8 2.4-7.4 2.4-6.1 0-11.2-4.1-13-9.6l-7 5.4C7.8 39.2 15.3 43.5 24 43.5z"/>
                    <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.2 5.5-7.7 5.5-2.2 0-4.2-.7-5.7-2l-7 5.4C15.8 39.2 19.7 41 24 41c7.2 0 13-5.8 13-13 0-1.3-.1-2.7-.3-3.5z"/>
                  </g>
                </svg>
              </span>
              Continue with Google
            </button>
            <button className="auth-btn auth-btn-github" onClick={() => window.location.href = 'http://localhost:5000/auth/github'}>
              <svg className="github-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 0.3C5.37 0.3 0 5.67 0 12.3c0 5.28 3.438 9.75 8.205 11.325.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.606-2.665-.304-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.323 3.3 1.23.96-.267 1.98-.399 3-.404 1.02.005 2.04.137 3 .404 2.29-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.803 5.624-5.475 5.92.43.37.823 1.096.823 2.21 0 1.595-.015 2.88-.015 3.27 0 .32.218.694.825.576C20.565 22.045 24 17.575 24 12.3c0-6.63-5.373-12-12-12"/></svg>
              Continue with GitHub
            </button>
          </div>
        </div>
      );
    }
    if (authView === 'signup') {
      return (
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Create Account</h2>
              <p>Join TaskMaster and start organizing your life</p>
            </div>
            <form onSubmit={handleSignup} className="auth-form">
              <div className="form-group">
                <label>Display Name</label>
                <input 
                  type="text" 
                  value={signupName} 
                  onChange={e => setSignupName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={signupEmail} 
                  onChange={e => setSignupEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  min="0"
                  value={signupAge}
                  onChange={e => setSignupAge(e.target.value)}
                  placeholder="Enter your age"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  value={signupPhone}
                  onChange={e => setSignupPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={signupPassword} 
                  onChange={e => setSignupPassword(e.target.value)}
                  placeholder="Create a password"
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input 
                  type="password" 
                  value={signupPassword2} 
                  onChange={e => setSignupPassword2(e.target.value)}
                  placeholder="Confirm your password"
                />
              </div>
              <div className="form-group">
                <ReCAPTCHA
                  sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Google test site key
                  onChange={value => setSignupCaptcha(value)}
                />
                {signupCaptchaError && <div className="auth-error">{signupCaptchaError}</div>}
              </div>
              {signupError && <div className="auth-error">{signupError}</div>}
              <button type="submit" className="auth-btn auth-btn-primary">Create Account</button>
              <button type="button" className="auth-btn auth-btn-text" onClick={() => setAuthView('landing')}>
                ← Back to Sign In
              </button>
            </form>
          </div>
        </div>
      );
    }
    if (authView === 'login') {
      return (
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Welcome Back</h2>
              <p>Sign in to continue with your tasks</p>
            </div>
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={loginEmail} 
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={loginPassword} 
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              {loginError && <div className="auth-error">{loginError}</div>}
              <button type="submit" className="auth-btn auth-btn-primary">Sign In</button>
              <button type="button" className="auth-btn auth-btn-text" onClick={() => setAuthView('landing')}>
                ← Back to Sign In
              </button>
            </form>
          </div>
        </div>
      );
    }
  }

  if (!user || user.message) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Please Sign In</h2>
          <button className="auth-btn auth-btn-primary" onClick={handleGoogleLogin}>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // Render profile completion page if needed
  if (showProfileCompletion) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Complete Your Profile</h2>
            <p>We need your name, age, and phone number to finish setting up your account.</p>
          </div>
          <form onSubmit={handleProfileCompletion} className="auth-form">
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                value={completionName}
                onChange={e => setCompletionName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                min="0"
                value={completionAge}
                onChange={e => setCompletionAge(e.target.value)}
                placeholder="Enter your age"
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={completionPhone}
                onChange={e => setCompletionPhone(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
            <div className="form-group">
              <ReCAPTCHA
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Google test site key
                onChange={value => setCompletionCaptcha(value)}
              />
              {completionCaptchaError && <div className="auth-error">{completionCaptchaError}</div>}
            </div>
            {completionError && <div className="auth-error">{completionError}</div>}
            <button type="submit" className="auth-btn auth-btn-primary">Continue to Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'profile' && showWelcome) {
    return (
      <div className="profile-page">
        <div className="page-header">
          <h1>Welcome, {user.displayName || 'User'}!</h1>
          <p>Your profile is ready.</p>
        </div>
        <div className="profile-card">
          <div className="details-header">
            <img src={user.photo || 'https://via.placeholder.com/100x100/6366f1/ffffff?text=👤'} alt="Profile" className="details-avatar" />
            <div className="details-info">
              <h3>{user.displayName}</h3>
              <p className="details-email">{user.email}</p>
            </div>
          </div>
          <div className="details-content">
            <div className="detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{user.displayName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Age:</span>
              <span className="detail-value">{user.age || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{user.phoneNumber || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{user.email}</span>
            </div>
          </div>
          <button className="auth-btn auth-btn-primary" style={{marginTop: 24}} onClick={() => { setShowWelcome(false); setView('home'); }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="user-profile">
            <img 
              src={
                user.photo ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName ? user.displayName[0].toUpperCase() : 'U')}&background=6d28d9&color=fff&size=60`
              }
              alt="Profile" 
              className="user-avatar" 
            />
            <div className="user-info">
              <h3 className="user-name">{user.displayName}</h3>
              <p className="user-email" style={{
                maxWidth: 140,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
                cursor: 'pointer'
              }} title={user.email}>{user.email}</p>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${view === 'home' ? 'active' : ''}`} 
            onClick={() => setView('home')}
          >
            <span className="nav-icon">🏠</span>
            Dashboard
          </button>
          <button 
            className={`nav-item ${view === 'profile' ? 'active' : ''}`} 
            onClick={() => setView('profile')}
          >
            <span className="nav-icon">👤</span>
            Profile
          </button>
          <button 
            className={`nav-item ${view === 'details' ? 'active' : ''}`} 
            onClick={() => setView('details')}
          >
            <span className="nav-icon">ℹ️</span>
            Account Details
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        {view === 'home' && (
          <div className="dashboard">
            <div className="dashboard-header">
              <div className="dashboard-title">
                <h1>My Tasks</h1>
                <p className="dashboard-subtitle">Stay organized and productive</p>
              </div>
              <button 
                className="add-task-btn"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <span className="add-icon">+</span>
                Add Task
              </button>
            </div>

            <div className="progress-section">
              <div className="progress-header">
                <h3>Progress Overview</h3>
                <span className="progress-text">{completedCount} of {totalCount} completed</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="controls-section">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All ({totalCount})
                </button>
                <button 
                  className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                  onClick={() => setFilter('active')}
                >
                  Active ({totalCount - completedCount})
                </button>
                <button 
                  className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                  onClick={() => setFilter('completed')}
                >
                  Completed ({completedCount})
                </button>
              </div>
            </div>

            {showAddForm && (
              <div className="add-task-form">
                <form onSubmit={addTodo}>
                  <div className="form-row">
                    <input
                      type="text"
                      value={newTodo}
                      onChange={e => setNewTodo(e.target.value)}
                      placeholder="What needs to be done?"
                      className="task-input"
                      autoFocus
                    />
                    <button type="submit" className="submit-btn">
                      Add Task
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="tasks-container">
              {filteredTodos.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No tasks found</h3>
                  <p>
                    {searchTerm 
                      ? `No tasks match "${searchTerm}"` 
                      : filter === 'all' 
                        ? 'Start by adding your first task!' 
                        : `No ${filter} tasks yet`
                    }
                  </p>
                  {!searchTerm && filter === 'all' && (
                    <button 
                      className="add-task-btn"
                      onClick={() => setShowAddForm(true)}
                    >
                      Add Your First Task
                    </button>
                  )}
                </div>
              ) : (
                <div className="tasks-list">
                  {filteredTodos.map(todo => (
                    <div key={todo._id} className={`task-item ${todo.completed ? 'completed' : ''}`}>
                      <div className="task-content">
                        <button
                          className={`task-checkbox ${todo.completed ? 'checked' : ''}`}
                          onClick={() => toggleTodo(todo._id, todo.completed, todo.text)}
                          title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {todo.completed && <span className="checkmark">✓</span>}
                        </button>
                        
                        {editId === todo._id ? (
                          <div className="task-edit">
                            <input
                              type="text"
                              value={editText}
                              onChange={e => setEditText(e.target.value)}
                              className="edit-input"
                              autoFocus
                            />
                            <div className="edit-actions">
                              <button 
                                onClick={() => saveEdit(todo._id, todo.completed)}
                                className="save-btn"
                              >
                                Save
                              </button>
                              <button 
                                onClick={cancelEdit}
                                className="cancel-btn"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="task-text">
                            <span className={todo.completed ? 'completed-text' : ''}>
                              {todo.text}
                            </span>
                            <div className="task-actions">
                              <button 
                                onClick={() => startEdit(todo._id, todo.text)}
                                className="action-btn edit-btn"
                                title="Edit task"
                              >
                                ✏️
                              </button>
                              <button 
                                onClick={() => deleteTodo(todo._id)}
                                className="action-btn delete-btn"
                                title="Delete task"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'profile' && (
          <div className="profile-page">
            <div className="page-header">
              <h1>Profile</h1>
              <p>Your personal information</p>
            </div>
            <div className="profile-card">
              <div className="details-header">
                <img src={user.photo || 'https://via.placeholder.com/100x100/6366f1/ffffff?text=👤'} alt="Profile" className="details-avatar" />
                <div className="details-info">
                  <h3>{user.displayName}</h3>
                  <p className="details-email">{user.email}</p>
                </div>
              </div>
              <div className="details-content">
                <div className="detail-item">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{user.displayName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Age:</span>
                  <span className="detail-value">{user.age || '-'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{user.phoneNumber || '-'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{user.email}</span>
                </div>
                {user.createdAt && (
                  <div className="detail-item">
                    <span className="detail-label">Registration Date:</span>
                    <span className="detail-value">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'details' && (
          <div className="details-page">
            <div className="page-header">
              <h1>Account Details</h1>
              <p>Your account information</p>
            </div>
            <div className="details-card">
              <div className="details-header">
                <img src={user.photo || 'https://via.placeholder.com/100x100/6366f1/ffffff?text=👤'} alt="Profile" className="details-avatar" />
                <div className="details-info">
                  <h3>{user.displayName}</h3>
                  <p className="details-email">{user.email}</p>
                </div>
              </div>
              <div className="details-content">
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{user.email}</span>
                </div>
                {user.googleId && (
                  <div className="detail-item">
                    <span className="detail-label">Google ID:</span>
                    <span className="detail-value">{user.googleId}</span>
                  </div>
                )}
                {user.createdAt && (
                  <div className="detail-item">
                    <span className="detail-label">Login Time:</span>
                    <span className="detail-value">{new Date(user.createdAt).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {showBoom && (
        <div className="celebration-overlay">
          <div className="celebration-content">
            <div className="celebration-icon">🎉</div>
            <h2>Great job!</h2>
            <p>Task completed successfully!</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
