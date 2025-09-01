import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { LoginCredentials } from '../types';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Auth.css';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuth();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    try {
      await login(data);
      toast.success('로그인 성공!');
      navigate('/');
    } catch (error) {
      toast.error('로그인에 실패했습니다.');
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
