import React, { useState, useRef } from "react";
import { addPhoto } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import Gallery from "../components/Gallery";
import "./Photo.css";

// 이미지 압축 함수
function compressImage(file, maxSizeMB = 1, maxWidth = 1200) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    img.onload = () => {
      // 비율 유지하며 리사이즈
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      // 반복적으로 품질 낮추며 1MB 이하로
      let quality = 0.92;
      function tryCompress() {
        canvas.toBlob(
          (blob) => {
            if (blob.size <= maxSizeMB * 1024 * 1024 || quality < 0.5) {
              resolve(blob);
            } else {
              quality -= 0.07;
              tryCompress();
            }
          },
          "image/jpeg",
          quality
        );
      }
      tryCompress();
    };
    reader.onerror = reject;
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Photo() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [tags, setTags] = useState({ tag1: "", tag2: "", tag3: "" });
  const [uploadStatus, setUploadStatus] = useState({ status: "", message: "" });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const navigate = useNavigate();
  const galleryRef = useRef();

  // 파일 선택 핸들러
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      let fileToUpload = selectedFile;
      if (selectedFile.size > 1024 * 1024) {
        // 1MB 초과 시 자동 압축
        try {
          fileToUpload = await compressImage(selectedFile, 1, 1200);
          setUploadStatus({
            status: "info",
            message: "이미지가 자동으로 1MB 이하로 압축되었습니다."
          });
        } catch (err) {
          setUploadStatus({
            status: "error",
            message: "이미지 압축에 실패했습니다."
          });
          return;
        }
      }
      setFile(fileToUpload);
      
      // 미리보기 URL 생성
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(fileToUpload);
    }
  };

  // 태그 입력 핸들러
  const handleTagChange = (e, tagName) => {
    setTags(prevTags => ({
      ...prevTags,
      [tagName]: e.target.value
    }));
  };

  // 사진 업로드 핸들러
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setUploadStatus({
        status: "error",
        message: "업로드할 파일을 선택해주세요."
      });
      return;
    }

    try {
      setUploadStatus({
        status: "loading",
        message: "사진을 업로드 중입니다..."
      });
      
      const result = await addPhoto(file, tags);
      console.log("업로드 결과:", result);
      
      // setUploadStatus({
      //   status: "success",
      //   message: "사진이 성공적으로 업로드되었습니다!"
      // });
      
      // 폼 초기화
      setFile(null);
      setPreviewUrl(null);
      setTags({ tag1: "", tag2: "", tag3: "" });
      setShowUploadModal(false);
      
      // Gallery 컴포넌트 새로고침
      if (galleryRef.current && galleryRef.current.refreshGallery) {
        galleryRef.current.refreshGallery();
      }
    } catch (error) {
      console.error("업로드 중 오류 발생:", error);
      setUploadStatus({
        status: "error",
        message: `사진 업로드 중 오류가 발생했습니다: ${error.message || "알 수 없는 오류"}`
      });
    }
  };

  // 업로드 모달 닫기
  const closeModal = () => {
    setShowUploadModal(false);
    setFile(null);
    setPreviewUrl(null);
    setTags({ tag1: "", tag2: "", tag3: "" });
    setUploadStatus({ status: "", message: "" });
  };

  return (
    <div className="photo-container">
      <header className="photo-header">
        <div className="profile" onClick={() => navigate("/")} style={{cursor: "pointer"}}>
          <span role="img" aria-label="profile">🥳</span>
        </div>
        <div className="title" onClick={() => navigate("/")} style={{cursor: "pointer"}}>합석렌티</div>
        <button className="photo-add-btn" onClick={() => setShowUploadModal(true)}>
          <span role="img" aria-label="plus">＋</span>
        </button>
      </header>

      {/* 업로드 모달 */}
      {showUploadModal && (
        <div className="photo-upload-modal-overlay" onClick={closeModal}>
          <div className="photo-upload-modal" onClick={e => e.stopPropagation()}>
            <button className="photo-upload-modal-close" onClick={closeModal}>×</button>
            <div className="photo-upload-modal-title">📸 사진을 올려주세요</div>
            <form onSubmit={handleUpload} className="upload-form">
              <div className="file-input-container">
                <label className="file-input-label">
                  {previewUrl ? (
                    <img src={previewUrl} alt="미리보기" className="image-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <span role="img" aria-label="camera">📷</span>
                      <p>Upload</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                </label>
              </div>
              <div className="photo-upload-modal-desc">
                <b>지금 이 순간을 공유해보세요</b>
              </div>
              <div className="photo-upload-modal-tags">
                <div className="photo-upload-modal-tag-row">
                  <span className="photo-upload-modal-tag-label">태그1 :</span>
                  <input type="text" value={tags.tag1} onChange={e => handleTagChange(e, "tag1")}
                    className="photo-upload-modal-tag-input" placeholder="#주점" maxLength={12} />
                </div>
                <div className="photo-upload-modal-tag-row">
                  <span className="photo-upload-modal-tag-label">태그2 :</span>
                  <input type="text" value={tags.tag2} onChange={e => handleTagChange(e, "tag2")}
                    className="photo-upload-modal-tag-input" placeholder="#02년생" maxLength={12} />
                </div>
                <div className="photo-upload-modal-tag-row">
                  <span className="photo-upload-modal-tag-label">태그3 :</span>
                  <input type="text" value={tags.tag3} onChange={e => handleTagChange(e, "tag3")}
                    className="photo-upload-modal-tag-input" placeholder="#노을남" maxLength={12} />
                </div>
              </div>
              <button
                type="submit"
                className="upload-button"
                disabled={uploadStatus.status === "loading" || !file}
              >
                {uploadStatus.status === "loading" ? "업로드 중..." : "Upload"}
              </button>
              {uploadStatus.message && (
                <div className={`status-message ${uploadStatus.status}`}>
                  {uploadStatus.message}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* 갤러리 컴포넌트 추가 */}
      <Gallery ref={galleryRef} />
      
      {/* 하단 네비게이션 */}
      <nav className="bottom-nav">
        <button className="nav-btn" onClick={() => navigate("/chat")}> 
          <span role="img" aria-label="실시간 채팅">📋</span>
          실시간 채팅
        </button>
        <button className="nav-btn" onClick={() => navigate("/matching")}> 
          <span role="img" aria-label="합석">💘</span>
          합석
        </button>
        <button className="nav-btn active"> 
          <span role="img" aria-label="사진">📷</span>
          사진
        </button>
      </nav>
    </div>
  );
} 