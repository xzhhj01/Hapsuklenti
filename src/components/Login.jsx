import { useState, useEffect } from 'react';
import { signInWithEmail, signUpWithEmail } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState('');
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const navigate = useNavigate();

  // 기기 ID 확인
  useEffect(() => {
    const deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      // 새로운 기기 ID 생성
      const newDeviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('deviceId', newDeviceId);
    }
  }, []);

  // 리다이렉트를 위한 useEffect
  useEffect(() => {
    if (shouldRedirect) {
      // 상태 초기화
      setEmail('');
      setPassword('');
      setShouldRedirect(false);
      // 리다이렉트
      navigate('/', { replace: true });
    }
  }, [shouldRedirect, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // 회원가입 시 비밀번호 길이 체크
    if (isSignUp && password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    // 이메일 형식 체크
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식이 아닙니다.');
      return;
    }
    
    try {
      if (isSignUp) {
        // 기기당 계정 생성 제한 확인
        const deviceId = localStorage.getItem('deviceId');
        const existingAccount = localStorage.getItem(`account_${deviceId}`);
        
        if (existingAccount) {
          setError('이 기기에서는 이미 계정이 생성되어 있습니다. 다른 기기에서 시도해주세요.');
          return;
        }

        await signUpWithEmail(email, password);
        // 계정 생성 성공 시 기기 정보 저장
        localStorage.setItem(`account_${deviceId}`, email);
        setShouldRedirect(true);
      } else {
        await signInWithEmail(email, password);
        setShouldRedirect(true);
      }
    } catch (error) {
      console.error('Auth error:', error);
      // Firebase 에러 메시지를 더 친절하게 변환
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('이미 사용 중인 이메일입니다.');
          break;
        case 'auth/invalid-email':
          setError('올바른 이메일 형식이 아닙니다.');
          break;
        case 'auth/operation-not-allowed':
          setError('이메일/비밀번호 로그인이 비활성화되어 있습니다.');
          break;
        case 'auth/weak-password':
          setError('비밀번호가 너무 약합니다. 6자 이상의 강력한 비밀번호를 사용해주세요.');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('이메일 또는 비밀번호가 올바르지 않습니다.');
          break;
        default:
          setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2rem',
        background: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        margin: '1rem'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '1.5rem',
          color: '#1a202c'
        }}>
          {isSignUp ? '회원가입' : '로그인'}
        </h2>
        
        <div className="login-form">
          {isSignUp && (
            <div className="signup-notice">
              <p>⚠️ 한 기기당 하나의 계정만 만들 수 있습니다.</p>
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4a5568' }}>이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                required
                placeholder="example@email.com"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4a5568' }}>비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                required
                placeholder={isSignUp ? "6자 이상" : ""}
              />
              {isSignUp && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#718096' }}>
                  * 비밀번호는 6자 이상이어야 합니다
                </p>
              )}
            </div>

            {error && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#fff5f5',
                color: '#c53030',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#4299e1',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#3182ce'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#4299e1'}
            >
              {isSignUp ? '회원가입' : '로그인'}
            </button>
          </form>

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              style={{
                background: 'none',
                border: 'none',
                color: '#4299e1',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
            >
              {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 