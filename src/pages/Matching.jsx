import { Link } from 'react-router-dom';

function Matching() {
  return (
    <>
      <h1>게시판 메인 페이지입니다</h1>
      <nav>
        <Link to="/matching/detail">게시글 1</Link>
        <br />
        <Link to="/matching/writing">게시글 작성</Link>

      </nav>
    </>
  );
}

export default Matching;
