import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Detail from './pages/Detail';
import Matching from './pages/Matching';
import Writing from './pages/Writing';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/matching" element={<Matching />} />
        <Route path="/matching/writing" element={<Writing />} />
        <Route path="/matching/detail" element={<Detail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
