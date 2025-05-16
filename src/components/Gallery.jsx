import React, { useState, useEffect, forwardRef, useImperativeHandle, useMemo } from "react";
import { getAllPhotos } from "../lib/firebase";
import "./Gallery.css";

const Gallery = forwardRef((props, ref) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalPhoto, setModalPhoto] = useState(null); // 모달 상태
  const [currentTime, setCurrentTime] = useState(new Date());

  // 외부에서 접근 가능한 함수 정의
  useImperativeHandle(ref, () => ({
    refreshGallery: fetchPhotos
  }));

  useEffect(() => {
    fetchPhotos();
    // 1분마다 갤러리 새로고침
    const refreshInterval = setInterval(fetchPhotos, 60000);
    // 5초마다 현재 시간 업데이트 (1초에서 5초로 변경)
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 5000);
    
    return () => {
      clearInterval(refreshInterval);
      clearInterval(timeInterval);
    };
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

  // 남은 시간 계산 함수를 useMemo로 최적화
  const getRemainingTime = useMemo(() => {
    return (expiresAt) => {
      if (!expiresAt) return "시간 정보 없음";
      
      const expires = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt.seconds * 1000);
      const diff = expires - currentTime;
      
      if (diff <= 0) return "만료됨";
      
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      return `${minutes}분 ${seconds}초 남음`;
    };
  }, [currentTime]);

  // 모달 닫기
  const closeModal = () => setModalPhoto(null);

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
            <div key={photo.id} className="photo-item" onClick={() => setModalPhoto(photo)}>
              <img src={photo.imageUrl} alt="업로드된 사진" />
              <div className="photo-tags">
                {photo.tag1 && <span className="tag">{photo.tag1}</span>}
                {photo.tag2 && <span className="tag">{photo.tag2}</span>}
                {photo.tag3 && <span className="tag">{photo.tag3}</span>}
              </div>
              <div className="photo-date">
                {getRemainingTime(photo.expiresAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 사진 클릭 시 모달 */}
      {modalPhoto && (
        <div className="photo-modal-overlay" onClick={closeModal}>
          <div className="photo-modal" onClick={e => e.stopPropagation()}>
            <button className="photo-modal-close" onClick={closeModal}>×</button>
            <img src={modalPhoto.imageUrl} alt="확대 사진" className="photo-modal-img" />
            <div className="photo-modal-tags">
              {modalPhoto.tag1 && <span className="tag">{modalPhoto.tag1}</span>}
              {modalPhoto.tag2 && <span className="tag">{modalPhoto.tag2}</span>}
              {modalPhoto.tag3 && <span className="tag">{modalPhoto.tag3}</span>}
            </div>
            <div className="photo-modal-time">
              {getRemainingTime(modalPhoto.expiresAt)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default Gallery; 