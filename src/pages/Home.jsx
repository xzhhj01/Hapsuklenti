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
        <br />
        
      </nav>
    </>
  )
}

export default Home;
