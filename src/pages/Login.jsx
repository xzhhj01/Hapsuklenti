import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signInAnonymously } from '../lib/firebase';
import './Login.css';

function Login() {
  const navigate = useNavigate();

  const handleStart = async () => {
    try {
      await signInAnonymously();
      navigate('/');
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>합석렌티</h1>
        <p className="welcome-text">환영합니다!</p>
        <button onClick={handleStart} className="start-button">
          시작하기
        </button>
      </div>
    </div>
  );
}

export default Login; 