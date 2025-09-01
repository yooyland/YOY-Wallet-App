import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { RegisterCredentials } from '../types';
import { FaEye, FaEyeSlash, FaUserPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Auth.css';

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading, error } = useAuth();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterCredentials>();

  const password = watch('password');

  const onSubmit = async (data: RegisterCredentials) => {
    try {
      await registerUser(data);
      toast.success('회원가입 성공!');
      navigate('/');
    } catch (error) {
      toast.error('회원가입에 실패했습니다.');
    }
  };

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
          <p>{t('app.createAccount')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">사용자명</label>
            <input
              {...register('username', {
                required: '사용자명을 입력해주세요.',
                minLength: {
                  value: 3,
                  message: '사용자명은 최소 3자 이상이어야 합니다.',
                },
              })}
              type="text"
              id="username"
              placeholder="사용자명을 입력하세요"
            />
            {errors.username && <span className="error">{errors.username.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="firstName">이름</label>
            <input
              {...register('firstName', {
                required: '이름을 입력해주세요.',
              })}
              type="text"
              id="firstName"
              placeholder="이름을 입력하세요"
            />
            {errors.firstName && <span className="error">{errors.firstName.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">성</label>
            <input
              {...register('lastName', {
                required: '성을 입력해주세요.',
              })}
              type="text"
              id="lastName"
              placeholder="성을 입력하세요"
            />
            {errors.lastName && <span className="error">{errors.lastName.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              {...register('email', {
                required: '이메일을 입력해주세요.',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: '유효한 이메일 주소를 입력해주세요.',
                },
              })}
              type="email"
              id="email"
              placeholder="이메일을 입력하세요"
            />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <div className="password-input">
              <input
                {...register('password', {
                  required: '비밀번호를 입력해주세요.',
                  minLength: {
                    value: 6,
                    message: '비밀번호는 최소 6자 이상이어야 합니다.',
                  },
                })}
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="비밀번호를 입력하세요"
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

          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <div className="password-input">
              <input
                {...register('confirmPassword', {
                  required: '비밀번호를 다시 입력해주세요.',
                  validate: value => value === password || '비밀번호가 일치하지 않습니다.',
                })}
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                placeholder="비밀번호를 다시 입력하세요"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={isLoading}
          >
            <FaUserPlus />
            {isLoading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="auth-link">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
