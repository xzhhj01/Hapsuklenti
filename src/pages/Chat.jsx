import React, { useEffect, useState, useRef } from "react";
import "./chat.css";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

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
      {/* 1. 제목 */}
      <h2>실시간 현장 반응</h2>

      {/* 2. 메시지 리스트 */}
      <div className="messages">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={msg.userId === userId ? "my-message" : "other-message"}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. 입력창 */}
      <form onSubmit={sendMessage} className="input-form">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="메시지를 입력하세요"
        />
        <button type="submit">전송</button>
      </form>

      {/* 4. 네비게이션 */}
      <nav className="bottom-nav">
        <button>합석</button>
        <button className="active">실시간 현장</button>
      </nav>
    </div>
  );
}

export default Chat;