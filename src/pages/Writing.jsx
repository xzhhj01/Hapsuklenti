import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addPost } from "../lib/firebase"; // 경로 확인!
import "./Writing.css";

const placeOptions = [
  "민주광장", "SK미래관", "정경관", "중앙광장", "중앙지하", "중앙도서관",
  "다람쥐길", "정경대 후문", "참살이길", "법학관 후문", "하나스퀘어", "기타"
];

export default function Writing() {
  const [title, setTitle] = useState("");
  const [myGender, setMyGender] = useState("남성");
  const [targetGender, setTargetGender] = useState("여성");
  const [place, setPlace] = useState("");
  const [content, setContent] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addPost(
      title,
      myGender,
      targetGender,
      place,
      content,
      contact,
      password
    );
    alert("글이 등록되었습니다!");
    navigate("/matching");
  };

  return (
    <div className="writing-wrap">
      <header className="writing-header">
        <div className="profile" onClick={() => navigate("/") } style={{cursor: "pointer"}}>
          <span role="img" aria-label="profile">🥳</span>
        </div>
        <div className="title">합석렌티</div>
      </header>
      <form className="writing-form" onSubmit={handleSubmit}>
        <input
          className="input"
          placeholder="글제목"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />

        <div className="gender-row">
          <div className="gender-label">내 성별:</div>
          <div className="gender-btns">
            <button
              type="button"
              className={myGender === "남성" ? "gender-btn selected" : "gender-btn"}
              onClick={() => setMyGender("남성")}
            >나 : 남성</button>
            <button
              type="button"
              className={myGender === "여성" ? "gender-btn selected" : "gender-btn"}
              onClick={() => setMyGender("여성")}
            >나 : 여성</button>
          </div>
        </div>
        <div className="gender-row">
          <div className="gender-label">상대 성별:</div>
          <div className="gender-btns">
            <button
              type="button"
              className={targetGender === "남성" ? "gender-btn selected" : "gender-btn"}
              onClick={() => setTargetGender("남성")}
            >찾아요 : 남성</button>
            <button
              type="button"
              className={targetGender === "여성" ? "gender-btn selected" : "gender-btn"}
              onClick={() => setTargetGender("여성")}
            >찾아요 : 여성</button>
            <button
              type="button"
              className={targetGender === "성별 무관" ? "gender-btn selected" : "gender-btn"}
              onClick={() => setTargetGender("성별 무관")}
            >찾아요 : 무관</button>
          </div>
        </div>

        <div className="select-row">
          <label>장소 :</label>
          <select
            value={place}
            onChange={e => setPlace(e.target.value)}
            required
          >
            <option value="">선택해주세요</option>
            {placeOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <textarea
          className="textarea"
          placeholder='본문 : "ENFJ 23학번입니다! 지금 정후 GS앞인데 OO학과 주점 같이 줄 서실 분 계실까요? 편하게 연락주세요! ㅎㅎ"'
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />

        <input
          className="input"
          placeholder="연락처 : 카카오톡 오픈채팅, 전화번호 등"
          value={contact}
          onChange={e => setContact(e.target.value)}
          required
        />

        <input
          className="input"
          placeholder="비밀번호 : (글 수정시 사용됩니다.)"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <button className="submit-btn" type="submit">올리기</button>
      </form>
      <nav className="bottom-nav">
        <button className="nav-btn" onClick={() => navigate("/chat")}> 
          <span role="img" aria-label="실시간 채팅">📋</span>
          실시간 채팅
        </button>
        <button className="nav-btn active" onClick={() => navigate("/matching")}> 
          <span role="img" aria-label="합석">💙</span>
          합석
        </button>
        <button className="nav-btn" onClick={() => navigate("/photo")}> 
          <span role="img" aria-label="사진">📷</span>
          사진
        </button>
      </nav>
    </div>
  );
}