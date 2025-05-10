import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { getAllPhotos } from "../lib/firebase";
import "./Gallery.css";

const Gallery = forwardRef((props, ref) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 외부에서 접근 가능한 함수 정의
  useImperativeHandle(ref, () => ({
    refreshGallery: fetchPhotos
  }));

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("사진 목록을 가져오는 중...");
      const photoList = await getAllPhotos();
      console.log("가져온 사진 목록:", photoList);
      setPhotos(photoList);
      setLoading(false);
    } catch (error) {
      console.error("사진 로드 중 오류 발생:", error);
      setError("사진을 불러오는 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchPhotos();
  };

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2>사진 갤러리</h2>
        <button onClick={handleRefresh} className="refresh-button">
          🔄 새로고침
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">사진을 불러오는 중...</div>
      ) : photos.length === 0 ? (
        <div className="no-photos">아직 업로드된 사진이 없습니다.</div>
      ) : (
        <div className="photo-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="photo-item">
              <img src={photo.imageUrl} alt="업로드된 사진" />
              <div className="photo-tags">
                {photo.tag1 && <span className="tag">{photo.tag1}</span>}
                {photo.tag2 && <span className="tag">{photo.tag2}</span>}
                {photo.tag3 && <span className="tag">{photo.tag3}</span>}
              </div>
              <div className="photo-date">
                {photo.uploadedAt?.toDate 
                  ? photo.uploadedAt.toDate().toLocaleString() 
                  : photo.uploadedAt?.seconds 
                    ? new Date(photo.uploadedAt.seconds * 1000).toLocaleString()
                    : "날짜 정보 없음"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default Gallery; 