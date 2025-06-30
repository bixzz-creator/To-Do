import React, { useEffect, useState } from 'react';
import './App.css';

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

  useEffect(() => {
    fetch('http://localhost:5000/auth/user', {
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
    fetch('http://localhost:5000/api/todos', { credentials: 'include' })
      .then(res => res.json())
      .then(setTodos);
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  const handleLogout = () => {
    window.location.href = 'http://localhost:5000/auth/logout';
  };

  const addTodo = e => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    fetch('http://localhost:5000/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ text: newTodo }),
    })
      .then(res => res.json())
      .then(todo => {
        setTodos([...todos, todo]);
        setNewTodo('');
      });
  };

  const toggleTodo = (id, completed, text) => {
    fetch(`http://localhost:5000/api/todos/${id}`, {
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
    fetch(`http://localhost:5000/api/todos/${id}`, {
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
    fetch(`http://localhost:5000/api/todos/${id}`, {
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
    fetch('http://localhost:5000/api/profile', {
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
    const res = await fetch('http://localhost:5000/api/register', {
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
    const res = await fetch('http://localhost:5000/api/login', {
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

  if (loading) return <div>Loading...</div>;

  if ((!user || user.message) && authView !== '') {
    if (authView === 'landing') {
      return (
        <div className="auth-landing">
          <h1>Welcome to To-Do App</h1>
          <button className="auth-google" onClick={handleGoogleLogin}>
            Sign in with Google
          </button>
          <button className="auth-email" onClick={() => setAuthView('login')}>Login with Email</button>
          <button className="auth-email" onClick={() => setAuthView('signup')}>Sign up with Email</button>
        </div>
      );
    }
    if (authView === 'signup') {
      return (
        <div className="auth-form">
          <h2>Sign Up</h2>
          <form onSubmit={handleSignup}>
            <input type="text" placeholder="Display Name" value={signupName} onChange={e => setSignupName(e.target.value)} />
            <input type="email" placeholder="Email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} />
            <input type="password" placeholder="Confirm Password" value={signupPassword2} onChange={e => setSignupPassword2(e.target.value)} />
            <div className="profile-image-upload">
              <label htmlFor="signupPhotoInput" className="profile-image-label">
                <img
                  src={signupPhotoPreview || 'https://via.placeholder.com/100'}
                  alt="Profile Preview"
                  className="profile-image-preview"
                />
                <span className="profile-image-edit">Photo</span>
              </label>
              <input
                id="signupPhotoInput"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleSignupPhotoChange}
              />
            </div>
            {signupError && <div className="auth-error">{signupError}</div>}
            <button type="submit">Sign Up</button>
            <button type="button" className="auth-switch" onClick={() => setAuthView('landing')}>Back</button>
          </form>
        </div>
      );
    }
    if (authView === 'login') {
      return (
        <div className="auth-form">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
            {loginError && <div className="auth-error">{loginError}</div>}
            <button type="submit">Login</button>
            <button type="button" className="auth-switch" onClick={() => setAuthView('landing')}>Back</button>
          </form>
        </div>
      );
    }
  }

  if (!user || user.message) {
    return (
      <div className="App">
        <h1>To-Do List</h1>
        <button onClick={handleGoogleLogin}>Sign in with Google</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="sidebar">
        <div className="sidebar-header">
          {user.photo && <img src={user.photo} alt="Profile" className="sidebar-avatar" />}
          <span className="sidebar-name">{user.displayName}</span>
        </div>
        <nav>
          <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}>Home</button>
          <button className={view === 'profile' ? 'active' : ''} onClick={() => setView('profile')}>Profile</button>
          <button className={view === 'details' ? 'active' : ''} onClick={() => setView('details')}>Details</button>
          <button onClick={handleLogout} style={{ marginTop: 32 }}>Logout</button>
        </nav>
      </aside>
      <main className="main-content">
        {view === 'home' && (
          <>
            <h1>To-Do List</h1>
            <form onSubmit={addTodo} style={{ marginTop: 20 }}>
              <input
                value={newTodo}
                onChange={e => setNewTodo(e.target.value)}
                placeholder="Add a new to-do"
              />
              <button type="submit">Add</button>
            </form>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {todos.map(todo => (
                <li key={todo._id} style={{ margin: '10px 0' }}>
                  <button
                    className={`tick-btn${todo.completed ? ' completed' : ''}`}
                    onClick={() => toggleTodo(todo._id, todo.completed, todo.text)}
                    title="Mark as complete"
                  >
                    ✓
                  </button>
                  {editId === todo._id ? (
                    <>
                      <input
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        style={{ marginLeft: 8 }}
                      />
                      <button onClick={() => saveEdit(todo._id, todo.completed)} style={{ marginLeft: 5 }}>Save</button>
                      <button onClick={cancelEdit} style={{ marginLeft: 5 }}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <span style={{ textDecoration: todo.completed ? 'line-through' : 'none', marginLeft: 8 }}>
                        {todo.text}
                      </span>
                      <button onClick={() => startEdit(todo._id, todo.text)} style={{ marginLeft: 10 }}>Edit</button>
                      <button onClick={() => deleteTodo(todo._id)} style={{ marginLeft: 5 }}>Delete</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
            {showBoom && (
              <div className="boom-overlay">
                <div className="boom-text">🎉 Great job! 🎉</div>
              </div>
            )}
          </>
        )}
        {view === 'profile' && (
          <div className="profile-page">
            <h1>Profile</h1>
            <form onSubmit={handleProfileSave} className="profile-form">
              <div className="profile-image-upload">
                <label htmlFor="profileImageInput" className="profile-image-label">
                  <img
                    src={profileImagePreview || profileImage || 'https://via.placeholder.com/100'}
                    alt="Profile Preview"
                    className="profile-image-preview"
                  />
                  <span className="profile-image-edit">Edit</span>
                </label>
                <input
                  id="profileImageInput"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleProfileImageChange}
                />
              </div>
              <label htmlFor="displayName">Display Name</label>
              <input
                id="displayName"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                style={{ marginBottom: 16 }}
              />
              <button type="submit">Save</button>
            </form>
          </div>
        )}
        {view === 'details' && (
          <div className="details-page">
            <div className="details-card">
              <img src={user.photo} alt="Profile" className="details-avatar" />
              <div className="details-info">
                <div><span className="details-label">Display Name:</span> {user.displayName}</div>
                <div><span className="details-label">Email:</span> {user.email}</div>
                <div><span className="details-label">Google ID:</span> {user.googleId}</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
