import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSecurity } from '../contexts/SecurityContext';
import { useAuth } from '../contexts/AuthContext';
import { FaLock, FaFingerprint, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './PinAuth.css';

const PinAuth: React.FC = () => {
  const navigate = useNavigate();
  const { verifyPin, authenticateWithBiometric, securitySettings } = useSecurity();
  const { user } = useAuth();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'pin' | 'biometric'>('pin');
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 5;

  useEffect(() => {
    // 생체인증이 활성화되어 있으면 자동으로 시도
    if (securitySettings.biometricEnabled) {
      handleBiometricAuth();
    }
  }, []);

  const handlePinChange = (value: string) => {
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setPin(value);
    }
  };

  const handlePinSubmit = async () => {
    if (pin.length < 4) {
      toast.error('PIN을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const isValid = await verifyPin(pin);
      if (isValid) {
        toast.success('인증 성공');
        navigate('/');
      } else {
        setAttempts(prev => prev + 1);
        setPin('');
        toast.error(`PIN이 올바르지 않습니다. (${maxAttempts - attempts - 1}회 남음)`);
        
        if (attempts + 1 >= maxAttempts) {
          toast.error('인증 시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.');
          setTimeout(() => setAttempts(0), 30000); // 30초 후 재시도 가능
        }
      }
    } catch (error) {
      toast.error('인증에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    setIsLoading(true);
    setAuthMethod('biometric');
    
    try {
      const success = await authenticateWithBiometric();
      if (success) {
        toast.success('생체인증 성공');
        navigate('/');
      } else {
        toast.error('생체인증에 실패했습니다.');
        setAuthMethod('pin');
      }
    } catch (error) {
      toast.error('생체인증에 실패했습니다.');
      setAuthMethod('pin');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPinInput = () => (
    <div className="pin-input-container">
      <input
        type="password"
        value={pin}
        onChange={(e) => handlePinChange(e.target.value)}
        placeholder="PIN 입력"
        className="pin-input"
        maxLength={6}
        autoFocus
        disabled={isLoading}
      />
      <div className="pin-dots">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className={`pin-dot ${i < pin.length ? 'filled' : ''}`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="pin-auth">
      <div className="pin-auth-header">
        <h1>보안 인증</h1>
        <p>계정에 접근하려면 인증이 필요합니다.</p>
      </div>

      <div className="pin-auth-content">
        <div className="auth-step">
          <div className="step-icon">
            {authMethod === 'biometric' ? <FaFingerprint /> : <FaLock />}
          </div>
          
          {authMethod === 'biometric' ? (
            <>
              <h2>생체인증</h2>
              <p>생체인증을 진행해주세요.</p>
              {isLoading && <div className="loading-spinner" />}
            </>
          ) : (
            <>
              <h2>PIN 인증</h2>
              <p>설정한 PIN을 입력해주세요.</p>
              {renderPinInput()}
              <button
                className="btn btn-primary"
                onClick={handlePinSubmit}
                disabled={pin.length < 4 || isLoading}
              >
                {isLoading ? '인증 중...' : '확인'}
              </button>
            </>
          )}
        </div>

        {securitySettings.biometricEnabled && authMethod === 'pin' && (
          <div className="auth-options">
            <button
              className="btn btn-secondary biometric-btn"
              onClick={handleBiometricAuth}
              disabled={isLoading}
            >
              <FaFingerprint />
              생체인증으로 로그인
            </button>
          </div>
        )}

        {attempts > 0 && (
          <div className="attempts-info">
            <p>시도 횟수: {attempts}/{maxAttempts}</p>
            {attempts >= maxAttempts && (
              <p className="warning">30초 후 다시 시도할 수 있습니다.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PinAuth;
