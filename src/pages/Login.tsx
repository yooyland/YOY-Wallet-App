import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSecurity } from '../contexts/SecurityContext';
import { LoginCredentials } from '../types';
import { FaEye, FaEyeSlash, FaLock, FaFingerprint, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Auth.css';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showSecurityOptions, setShowSecurityOptions] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState('');
  const { login, isLoading, error } = useAuth();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { setupPin, enableBiometric, isBiometricAvailable } = useSecurity();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    try {
      // 이메일 인증 화면으로 이동
      setEmailForVerification(data.email);
      setShowEmailVerification(true);
    } catch (error) {
      toast.error('로그인에 실패했습니다.');
    }
  };

  const handleEmailVerification = async () => {
    if (!verificationCode.trim()) {
      toast.error('인증 코드를 입력해주세요.');
      return;
    }

    setIsVerifying(true);
    try {
      // 실제 API 호출 대신 시뮬레이션 (나중에 실제 API로 교체)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 가상의 인증 코드 검증 (실제로는 서버에서 확인)
      if (verificationCode === '123456') { // 테스트용 코드
        // 이메일 인증 성공 후 로그인 진행
        await login({ email: emailForVerification, password: '' }); // 실제로는 비밀번호도 필요
        toast.success('이메일 인증 성공! 로그인되었습니다.');
        setShowEmailVerification(false);
        setShowSecurityOptions(true);
      } else {
        toast.error('잘못된 인증 코드입니다.');
      }
    } catch (error) {
      toast.error('이메일 인증에 실패했습니다.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerificationCode = async () => {
    try {
      // 실제 API 호출 대신 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('인증 코드가 재전송되었습니다. (테스트용: 123456)');
    } catch (error) {
      toast.error('인증 코드 재전송에 실패했습니다.');
    }
  };

  const handleSkipSecurity = () => {
    navigate('/');
  };

  const handleSetupPin = async () => {
    try {
      // PIN 설정 페이지로 이동
      navigate('/pin-setup');
    } catch (error) {
      toast.error('PIN 설정에 실패했습니다.');
    }
  };

  const handleSetupBiometric = async () => {
    try {
      if (isBiometricAvailable()) {
        await enableBiometric();
        toast.success('생체인증이 활성화되었습니다.');
        navigate('/');
      } else {
        toast.error('생체인증을 사용할 수 없습니다.');
        navigate('/');
      }
    } catch (error) {
      toast.error('생체인증 설정에 실패했습니다.');
      navigate('/');
    }
  };

  // 보안 옵션 선택 화면
  if (showSecurityOptions) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo-section">
              <img 
                src={isDark ? "/logo.png" : "/logo-1.png"} 
                alt="YOY Wallet" 
                className="auth-logo-image" 
              />
            </div>
            <h1>보안 설정</h1>
            <p>추가 보안 옵션을 선택하세요 (선택사항)</p>
          </div>

          <div className="security-options">
            <div className="security-option">
              <div className="option-icon">
                <FaLock />
              </div>
              <div className="option-content">
                <h3>PIN 잠금</h3>
                <p>4-6자리 숫자로 PIN을 설정하여 앱을 보호합니다.</p>
                <button
                  className="btn btn-primary"
                  onClick={handleSetupPin}
                >
                  PIN 설정
                </button>
              </div>
            </div>

            {isBiometricAvailable() && (
              <div className="security-option">
                <div className="option-icon">
                  <FaFingerprint />
                </div>
                <div className="option-content">
                  <h3>생체인증</h3>
                  <p>지문이나 얼굴인식으로 빠르게 로그인합니다.</p>
                  <button
                    className="btn btn-primary"
                    onClick={handleSetupBiometric}
                  >
                    생체인증 설정
                  </button>
                </div>
              </div>
            )}

            <div className="security-option">
              <div className="option-icon">
                <FaShieldAlt />
              </div>
              <div className="option-content">
                <h3>기본 보안</h3>
                <p>이메일과 비밀번호만으로 로그인합니다.</p>
                <button
                  className="btn btn-secondary"
                  onClick={handleSkipSecurity}
                >
                  나중에 설정
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 이메일 인증 화면
  if (showEmailVerification) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo-section">
              <img 
                src={isDark ? "/logo.png" : "/logo-1.png"} 
                alt="YOY Wallet" 
                className="auth-logo-image" 
              />
            </div>
            <h1>이메일 인증</h1>
            <p>입력하신 이메일로 인증 코드를 보냈습니다.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleEmailVerification(); }} className="auth-form">
            <div className="form-group">
              <label htmlFor="verificationCode">인증 코드</label>
              <input
                type="text"
                id="verificationCode"
                placeholder="인증 코드"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={isVerifying}
                maxLength={6}
                minLength={6}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={isVerifying}
            >
              {isVerifying ? '인증 코드 확인 중...' : '인증 코드 확인'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResendVerificationCode}
              disabled={isVerifying}
            >
              {isVerifying ? '재전송 중...' : '인증 코드 재전송'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-section">
            <img 
              src={isDark ? "/logo.png" : "/logo-1.png"} 
              alt="YOY Wallet" 
              className="auth-logo-image" 
            />
          </div>
          <h1>{t('app.name')}</h1>
          <p>{t('app.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              {...register('email', {
                required: t('validation.required'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('validation.email'),
                },
              })}
              type="email"
              id="email"
              placeholder={t('auth.email')}
            />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}</label>
            <div className="password-input">
              <input
                {...register('password', {
                  required: t('validation.required'),
                  minLength: {
                    value: 6,
                    message: t('validation.passwordMin'),
                  },
                })}
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder={t('auth.password')}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={isLoading}
          >
            {isLoading ? t('auth.loggingIn') : t('auth.login')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="auth-link">
              {t('auth.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
