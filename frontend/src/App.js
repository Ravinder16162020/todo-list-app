import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from "firebase/auth";
import Login from './components/Login';
import TodoList from './components/TodoList';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase listener for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []);

  // Show a loading message while Firebase checks auth status
  if (loading) {
    return <div className="loading-screen"><h1>Loading...</h1></div>;
  }
  
  return (
    <div className="App">
      {user ? <TodoList /> : <Login />}
    </div>
  );
}

export default App;