import React from "react";
import "./Home.css";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { logout } from "../lib/firebase";

function Home() {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    }
  };

  return (
    <div className="login-container">
      {/* 🔵 배경 도형 */}
      <div className="background-shapes">
        <div className="circle-1"></div>
        <div className="circle-2"></div>
        <div className="blob"></div>
      </div>

      {/* 🔵 로고 / 인삿말 */}
      <div className="logo-container">
        <div className="logo-background"></div>
        <h1 className="logo-text">
          합석렌티<span className="logo-emoji">🥳</span>
        </h1>
        <p className="welcome-text">
          WELCOME! JOIN US! <span className="welcome-heart">♥</span>
        </p>
      </div>

      {/* 🔵 버튼 */}
      <div className="buttons-container">
        {user ? (
          <>
            <Link to="/chat">
              <button className="button">실시간 소식 듣기</button>
            </Link>
            <Link to="/matching">
              <button className="button">합석 구하러 가기</button>
            </Link>
            <Link to="/photo">
              <button className="button">실시간 사진 보기</button>
            </Link>
            <button className="button logout-button" onClick={handleLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <Link to="/login">
            <button className="button">회원가입하기</button>
          </Link>
        )}
      </div>

      {/* 🔵 푸터 */}
      <div className="copyright">copyright 2025 NEXT</div>
    </div>
  );
}

export default Home;
