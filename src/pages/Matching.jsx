import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import "./Matching.css";

export default function Matching() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("전체");
  const [placeFilter, setPlaceFilter] = useState("");
  const navigate = useNavigate();

  // Firestore에서 게시글 불러오기
  useEffect(() => {
    const fetchPosts = async () => {
      const q = query(collection(db, "writing"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(data);
    };
    fetchPosts();
  }, []);

  return (
    <div className="matching-container">
      <header className="matching-header">
        <div className="profile">
          <span role="img" aria-label="profile">🥳</span>
        </div>
        <div className="title">합석렌티</div>
        <button className="edit-btn" onClick={() => navigate("/matching/writing")}>✏️</button>
      </header>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="filters">
        <select value={placeFilter} onChange={e => setPlaceFilter(e.target.value)}>
          <option value="">장소</option>
          <option value="민주광장">민주광장</option>
          <option value="SK미래관">SK미래관</option>
          <option value="정경관">정경관</option>
          <option value="중앙광장">중앙광장</option>
          <option value="중앙지하">중앙지하</option>
          <option value="중앙도서관">중앙도서관</option>
          <option value="다람쥐길">다람쥐길</option>
          <option value="정경대 후문">정경대 후문</option>
          <option value="참살이길">참살이길</option>
          <option value="법학관 후문">법학관 후문</option>
          <option value="하나스퀘어">하나스퀘어</option>
          <option value="기타">기타</option>
        </select>
        <select
          value={genderFilter}
          onChange={e => setGenderFilter(e.target.value)}
        >
          <option value="전체">상대 성별</option>
          <option value="남성">남성</option>
          <option value="여성">여성</option>
          <option value="성별 무관">성별 무관</option>
        </select>
      </div>
      <ul className="post-list">
        {posts
          .filter(
            post =>
              (genderFilter === "전체" || post.targetGender === genderFilter || (genderFilter === "성별 무관" && post.targetGender === "성별 무관")) &&
              (placeFilter === "" || post.place === placeFilter) &&
              (post.title.includes(search) || post.content.includes(search))
          )
          .map(post => (
            <li
              key={post.id}
              className="post-item"
              onClick={() => navigate(`/detail/${post.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="post-title">{post.title}</div>
              <div className="post-content">{post.content}</div>
              <div className="post-tags">
                <span className="tag">{post.mygender}</span>
                <span className="tag">{post.targetGender === "성별 무관" ? "성별 무관" : `${post.targetGender} 구인`}</span>
                <span className="tag">{post.place}</span>
                <span className="post-date">
                  {post.createdAt && post.createdAt.toDate
                    ? post.createdAt.toDate().toLocaleString()
                    : ""}
                </span>
              </div>
            </li>
          ))}
      </ul>
      <nav className="bottom-nav">
        <button className="nav-btn active">
          <span role="img" aria-label="합석">💙</span>
          합석
        </button>
        <button className="nav-btn" onClick={() => navigate(`/matching/detail/${post.id}`)}>
          <span role="img" aria-label="실시간 현장">📋</span>
          실시간 현장
        </button>
      </nav>
    </div>
  );
}