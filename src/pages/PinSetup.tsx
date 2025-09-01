import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSecurity } from '../contexts/SecurityContext';
import { FaLock, FaFingerprint, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './PinSetup.css';

const PinSetup: React.FC = () => {
  const navigate = useNavigate();
  const { setupPin, enableBiometric, isBiometricAvailable } = useSecurity();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'pin' | 'confirm' | 'biometric'>('pin');
  const [isLoading, setIsLoading] = useState(false);

  const handlePinChange = (value: string) => {
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setPin(value);
    }
  };

  const handleConfirmPinChange = (value: string) => {
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setConfirmPin(value);
    }
  };

  const handlePinSubmit = () => {
    if (pin.length < 4) {
      toast.error('PIN은 최소 4자리 이상이어야 합니다.');
      return;
    }
    setStep('confirm');
  };

  const handleConfirmPinSubmit = async () => {
    if (pin !== confirmPin) {
      toast.error('PIN이 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    try {
      await setupPin(pin);
      toast.success('PIN이 설정되었습니다.');
      
      // 생체인증 사용 가능 여부 확인
      if (isBiometricAvailable()) {
        setStep('biometric');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('PIN 설정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricSetup = async () => {
    setIsLoading(true);
    try {
      await enableBiometric();
      toast.success('생체인증이 활성화되었습니다.');
      navigate('/dashboard');
    } catch (error) {
      toast.error('생체인증 설정에 실패했습니다.');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipBiometric = () => {
    navigate('/dashboard');
  };

  const renderPinInput = (value: string, onChange: (value: string) => void, placeholder: string) => (
    <div className="pin-input-container">
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pin-input"
        maxLength={6}
        autoFocus
      />
      <div className="pin-dots">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className={`pin-dot ${i < value.length ? 'filled' : ''}`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="pin-setup">
      <div className="pin-setup-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <h1>보안 설정</h1>
      </div>

      <div className="pin-setup-content">
        {step === 'pin' && (
          <div className="setup-step">
            <div className="step-icon">
              <FaLock />
            </div>
            <h2>PIN 설정</h2>
            <p>4-6자리 숫자로 PIN을 설정해주세요.</p>
            {renderPinInput(pin, handlePinChange, 'PIN 입력')}
            <button
              className="btn btn-primary"
              onClick={handlePinSubmit}
              disabled={pin.length < 4}
            >
              다음
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="setup-step">
            <div className="step-icon">
              <FaLock />
            </div>
            <h2>PIN 확인</h2>
            <p>설정한 PIN을 다시 입력해주세요.</p>
            {renderPinInput(confirmPin, handleConfirmPinChange, 'PIN 재입력')}
            <div className="button-group">
              <button
                className="btn btn-secondary"
                onClick={() => setStep('pin')}
                disabled={isLoading}
              >
                이전
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmPinSubmit}
                disabled={confirmPin.length < 4 || isLoading}
              >
                {isLoading ? '설정 중...' : '확인'}
              </button>
            </div>
          </div>
        )}

        {step === 'biometric' && (
          <div className="setup-step">
            <div className="step-icon">
              <FaFingerprint />
            </div>
            <h2>생체인증 설정</h2>
            <p>생체인증을 활성화하시겠습니까?</p>
            <div className="biometric-options">
              <button
                className="btn btn-primary biometric-btn"
                onClick={handleBiometricSetup}
                disabled={isLoading}
              >
                <FaFingerprint />
                생체인증 활성화
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleSkipBiometric}
                disabled={isLoading}
              >
                나중에 설정
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PinSetup;
