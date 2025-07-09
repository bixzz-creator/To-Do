import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'https://to-do-10z7.onrender.com';

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
        setLoading(false);
        if (data) fetchTodos();
      });
  }, []);

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
      }),
    })
      .then(res => res.json())
      .then(data => {
        setUser(u => ({ ...u, displayName: data.displayName, photo: data.photo }));
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

  const handleSignup = async e => {
    e.preventDefault();
    setSignupError('');
    if (!signupEmail || !signupPassword || !signupPassword2 || !signupName) {
      setSignupError('All fields are required.');
      return;
    }
    if (signupPassword !== signupPassword2) {
      setSignupError('Passwords do not match.');
      return;
    }
    const res = await fetch(`${API_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: signupEmail,
        password: signupPassword,
        displayName: signupName,
        photoCustom: signupPhotoPreview || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setSignupError(data.error || 'Registration failed');
      return;
    }
    setUser(data);
    setAuthView('');
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
            <div className="auth-buttons">
              <button className="auth-btn auth-btn-google" onClick={handleGoogleLogin}>
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              <div className="auth-divider">
                <span>or</span>
              </div>
              <button className="auth-btn auth-btn-secondary" onClick={() => setAuthView('login')}>
                Sign In with Email
              </button>
              <button className="auth-btn auth-btn-primary" onClick={() => setAuthView('signup')}>
                Create Account
              </button>
            </div>
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
                <label>Profile Photo</label>
                <div className="profile-upload">
                  <label htmlFor="signupPhotoInput" className="profile-upload-label">
                    <img
                      src={signupPhotoPreview || 'https://via.placeholder.com/80x80/6366f1/ffffff?text=📷'}
                      alt="Profile Preview"
                      className="profile-upload-preview"
                    />
                    <span className="profile-upload-text">Add Photo</span>
                  </label>
                  <input
                    id="signupPhotoInput"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleSignupPhotoChange}
                  />
                </div>
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

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="user-profile">
            <img 
              src={user.photo || 'https://via.placeholder.com/60x60/6366f1/ffffff?text=👤'} 
              alt="Profile" 
              className="user-avatar" 
            />
            <div className="user-info">
              <h3 className="user-name">{user.displayName}</h3>
              <p className="user-email">{user.email}</p>
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
              <h1>Profile Settings</h1>
              <p>Update your personal information</p>
            </div>
            
            <div className="profile-card">
              <form onSubmit={handleProfileSave} className="profile-form">
                <div className="profile-photo-section">
                  <label>Profile Photo</label>
                  <div className="profile-photo-upload">
                    <label htmlFor="profileImageInput" className="photo-upload-label">
                      <img
                        src={profileImagePreview || profileImage || 'https://via.placeholder.com/120x120/6366f1/ffffff?text=📷'}
                        alt="Profile Preview"
                        className="photo-preview"
                      />
                      <div className="photo-overlay">
                        <span className="photo-edit-text">Change Photo</span>
                      </div>
                    </label>
                    <input
                      id="profileImageInput"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleProfileImageChange}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="displayName">Display Name</label>
                  <input
                    id="displayName"
                    type="text"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    placeholder="Enter your display name"
                  />
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="save-btn">Save Changes</button>
                  <button type="button" className="cancel-btn" onClick={() => setView('home')}>
                    Cancel
                  </button>
                </div>
              </form>
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
                  <span className="detail-label">Display Name:</span>
                  <span className="detail-value">{user.displayName}</span>
                </div>
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
