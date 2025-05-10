import React, { useEffect, useState, useRef } from "react";
import "./chat.css";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // 브라우저 고유 ID
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('userId', userId);
  }

  // 메시지 실시간 구독
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 메시지 전송
  const sendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    await addDoc(collection(db, "messages"), {
      text: input,
      userId,
      createdAt: serverTimestamp(),
    });
    setInput("");
  };

  // 스크롤 하단 고정
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container">
      {/* matching-header 스타일의 상단바 */}
      <header className="matching-header">
        <div className="profile" onClick={() => navigate("/")} style={{cursor: "pointer"}}>
          <span role="img" aria-label="profile">🥳</span>
        </div>
        <div className="title">실시간 채팅</div>
      </header>

      {/* 메시지 리스트 */}
      <div className="messages">
        {messages.map(msg => {
          let dateStr = "";
          if (msg.createdAt) {
            let dateObj;
            if (msg.createdAt.toDate) {
              dateObj = msg.createdAt.toDate();
            } else if (msg.createdAt.seconds) {
              dateObj = new Date(msg.createdAt.seconds * 1000);
            }
            if (dateObj) {
              // MM/DD HH:mm 형식
              const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
              const dd = String(dateObj.getDate()).padStart(2, '0');
              const hh = String(dateObj.getHours()).padStart(2, '0');
              const min = String(dateObj.getMinutes()).padStart(2, '0');
              dateStr = `${mm}/${dd} ${hh}:${min}`;
            }
          }
          const isMine = msg.userId === userId;
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
              <div className={isMine ? "my-message" : "other-message"}>
                {msg.text}
              </div>
              {dateStr && (
                <div className={isMine ? "chat-date my-date" : "chat-date other-date"}>
                  <em>{dateStr}</em>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <form onSubmit={sendMessage} className="input-form">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="메시지를 입력하세요"
        />
        <button type="submit">↑</button>
      </form>

      {/* 네비게이션 */}
      <nav className="bottom-nav">
        <button className="nav-btn active">
          <span role="img" aria-label="실시간 채팅">📋</span>
          실시간 채팅
        </button>
        <button className="nav-btn" onClick={() => navigate('/matching')}>
          <span role="img" aria-label="합석">💘</span>
          합석
        </button>
        <button className="nav-btn" onClick={() => navigate('/photo')}>
          <span role="img" aria-label="사진">📷</span>
          사진
        </button>
      </nav>
    </div>
  );
}

export default Chat;
