import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Detail from './pages/Detail';
import Matching from './pages/Matching';
import Writing from './pages/Writing';
import Photo from './pages/Photo';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="" element={<Home />} />
          <Route path="/chat" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
          <Route path="/matching" element={<Matching />} />
          <Route path="/matching/writing" element={
            <ProtectedRoute>
              <Writing />
            </ProtectedRoute>
          } />
          <Route path="/matching/detail/:id" element={<Detail />} />
          <Route path="/photo" element={
            <ProtectedRoute>
              <Photo />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
