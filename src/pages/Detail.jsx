import React, { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./Detail.css";
import { useParams, useNavigate } from "react-router-dom";

export default function Detail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [password, setPassword] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      const docRef = doc(db, "writing", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPost({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchPost();
  }, [id]);

  // 비밀번호 검증 및 수정모드 진입
  const handleEdit = () => {
    if (password === post.password) {
      setEditMode(true);
      setEditTitle(post.title);
      setEditContent(post.content);
    } else {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };

  // 수정 후 저장
  const handleSave = async () => {
    const docRef = doc(db, "writing", id);
    await updateDoc(docRef, {
      title: editTitle,
      content: editContent,
    });
    setPost({ ...post, title: editTitle, content: editContent });
    setEditMode(false);
    alert("수정이 완료되었습니다.");
    navigate("/matching");
  };

  if (!post) return <div>로딩중...</div>;

  return (
    <div className="detail-wrap">
      <header className="detail-header">
        <div className="profile" onClick={() => navigate("/") } style={{cursor: "pointer"}}>
          <span role="img" aria-label="profile">🥳</span>
        </div>
        <div className="title" onClick={() => navigate("/") } style={{cursor: "pointer"}}>합석렌티</div>
      </header>
      <div className="detail-card">
        {editMode ? (
          <>
            <input
              className="input"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
            />
            <textarea
              className="textarea"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
            />
            <button className="submit-btn" onClick={handleSave}>저장</button>
          </>
        ) : (
          <>
            <div className="detail-title">{post.title}</div>
            <div className="detail-tags">
              <span className="detail-tag">{post.mygender}</span>
              <span className="detail-tag">{post.targetGender === "성별 무관" ? "성별 무관" : `${post.targetGender} 구인`}</span>
              <span className="detail-tag">{post.place}</span>
            </div>
            <div className="detail-content">
              {post.content}
              <div className="detail-contact">
                <b>연락처 :</b> {post.contact}
              </div>
            </div>
          </>
        )}
      </div>
      {!editMode && (
        <div className="detail-edit-row">
          <input
            className="detail-password"
            type="password"
            placeholder="비밀번호 :"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button className="detail-edit-btn" onClick={handleEdit}>
            <span role="img" aria-label="수정">✏️</span> 수정하기
          </button>
        </div>
      )}
      <nav className="bottom-nav">
        <button className="nav-btn" onClick={() => navigate("/chat")}> 
          <span role="img" aria-label="실시간 채팅">📋</span>
          실시간 채팅
        </button>
        <button className="nav-btn active" onClick={() => navigate("/matching")}> 
          <span role="img" aria-label="합석">💘</span>
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