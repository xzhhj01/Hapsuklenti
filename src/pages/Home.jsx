import { Link } from "react-router-dom";

function Home() {
  return (
    <>
    <h1>home</h1>
    <nav>
        <Link to="/">홈</Link>
        <br />
        <Link to="/matching">게시판</Link>
        <br />
        <Link to="/chat">실시간 현장</Link>
        <br />
        
      </nav>
    </>
  )
}

export default Home;
