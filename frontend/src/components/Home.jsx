import './Home.css';
import React from 'react';

// Trenutna samo placeholder home str
const Home = ({ onLogout }) => {
  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Welcome Home! 🏐</h1>
        <button 
          className="btn btn-danger" 
          onClick={onLogout}
        >
          Odjavi se
        </button>
      </div>
      
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">You're logged in!</h5>
          <p className="card-text">
            This is your home page. Start building your components here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;