import React, { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import "./Detail.css";
import { useNavigate } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Detail() {
  const query = useQuery();
  const id = query.get("id");
  const [post, setPost] = useState(null);
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

  if (!post) return <div>로딩중...</div>;

  return (
    <div className="detail-wrap">
      <header className="detail-header">
        <div className="profile">
          <span role="img" aria-label="profile">🥳</span>
        </div>
        <div className="title">합석렌티</div>
      </header>
      <div className="detail-card">
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
      </div>
      <div className="detail-edit-row">
        <input
          className="detail-password"
          type="password"
          placeholder="비밀번호 :"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="detail-edit-btn">
          <span role="img" aria-label="수정">✏️</span> 수정하기
        </button>
      </div>
      <nav className="bottom-nav">
        <button className="nav-btn active">
          <span role="img" aria-label="합석">💙</span>
          합석
        </button>
        <button className="nav-btn">
          <span role="img" aria-label="실시간 현장">📋</span>
          실시간 현장
        </button>
      </nav>
    </div>
  );
}