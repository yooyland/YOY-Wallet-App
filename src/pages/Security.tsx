import React, { useState } from 'react';
import { FaShieldAlt, FaKey, FaLock, FaUserShield, FaCheck, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';
import './Security.css';

interface SecurityStatus {
  twoFactorAuth: boolean;
  biometricAuth: boolean;
  passwordStrong: boolean;
  backupComplete: boolean;
  deviceSecure: boolean;
}

const Security: React.FC = () => {
  const { t } = useLanguage();
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    twoFactorAuth: false,
    biometricAuth: true,
    passwordStrong: true,
    backupComplete: false,
    deviceSecure: true
  });

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false
  });

  const securityScore = Object.values(securityStatus).filter(Boolean).length;
  const maxScore = Object.keys(securityStatus).length;

  const handleToggleSecurity = (key: keyof SecurityStatus) => {
    setSecurityStatus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    toast.success(
      securityStatus[key] 
        ? `${getSecurityLabel(key)} 비활성화됨` 
        : `${getSecurityLabel(key)} 활성화됨`
    );
  };

  const getSecurityLabel = (key: keyof SecurityStatus): string => {
    const labels = {
      twoFactorAuth: '2단계 인증',
      biometricAuth: '생체 인증',
      passwordStrong: '강력한 비밀번호',
      backupComplete: '지갑 백업',
      deviceSecure: '기기 보안'
    };
    return labels[key];
  };

  const handlePasswordChange = () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (passwordData.new.length < 8) {
      toast.error('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    // 실제로는 API 호출
    toast.success('비밀번호가 변경되었습니다.');
    setPasswordData({
      current: '',
      new: '',
      confirm: '',
      showCurrent: false,
      showNew: false,
      showConfirm: false
    });
    setShowPasswordChange(false);
  };

  const handleBackupWallet = () => {
    // 실제로는 지갑 백업 프로세스
    const isConfirmed = window.confirm(
      '지갑을 백업하시겠습니까? 안전한 장소에 니모닉을 보관하세요.'
    );
    
    if (isConfirmed) {
      setSecurityStatus(prev => ({ ...prev, backupComplete: true }));
      toast.success('지갑 백업이 완료되었습니다.');
    }
  };

  return (
    <div className="security">
      <div className="security-header">
        <h1>
          <FaShieldAlt />
          보안
        </h1>
        <p>지갑과 계정의 보안을 강화하고 관리하세요</p>
      </div>

      <div className="security-content">
        {/* 보안 점수 */}
        <div className="security-score-card">
          <div className="score-info">
            <h3>보안 점수</h3>
            <div className="score-display">
              <span className="score">{securityScore}</span>
              <span className="max-score">/ {maxScore}</span>
            </div>
            <div className="score-bar">
              <div 
                className="score-fill" 
                style={{ width: `${(securityScore / maxScore) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="score-status">
            {securityScore === maxScore ? (
              <div className="status excellent">
                <FaShieldAlt />
                <span>우수함</span>
              </div>
            ) : securityScore >= maxScore * 0.7 ? (
              <div className="status good">
                <FaShieldAlt />
                <span>양호함</span>
              </div>
            ) : (
              <div className="status poor">
                <FaShieldAlt />
                <span>개선 필요</span>
              </div>
            )}
          </div>
        </div>

        {/* 보안 설정 목록 */}
        <div className="security-settings">
          <h3>보안 설정</h3>
          
          <div className="security-item">
            <div className="item-info">
              <div className="item-icon">
                <FaUserShield />
              </div>
              <div className="item-details">
                <h4>2단계 인증 (2FA)</h4>
                <p>로그인 시 추가 보안 코드로 계정을 보호합니다</p>
              </div>
            </div>
            <div className="item-controls">
              <div className="status-indicator">
                {securityStatus.twoFactorAuth ? (
                  <FaCheck className="enabled" />
                ) : (
                  <FaTimes className="disabled" />
                )}
              </div>
              <button 
                className={`toggle-btn ${securityStatus.twoFactorAuth ? 'enabled' : 'disabled'}`}
                onClick={() => handleToggleSecurity('twoFactorAuth')}
              >
                {securityStatus.twoFactorAuth ? '비활성화' : '활성화'}
              </button>
            </div>
          </div>

          <div className="security-item">
            <div className="item-info">
              <div className="item-icon">
                <FaUserShield />
              </div>
              <div className="item-details">
                <h4>생체 인증</h4>
                <p>지문이나 얼굴 인식을 사용해 빠르고 안전하게 로그인합니다</p>
              </div>
            </div>
            <div className="item-controls">
              <div className="status-indicator">
                {securityStatus.biometricAuth ? (
                  <FaCheck className="enabled" />
                ) : (
                  <FaTimes className="disabled" />
                )}
              </div>
              <button 
                className={`toggle-btn ${securityStatus.biometricAuth ? 'enabled' : 'disabled'}`}
                onClick={() => handleToggleSecurity('biometricAuth')}
              >
                {securityStatus.biometricAuth ? '비활성화' : '활성화'}
              </button>
            </div>
          </div>

          <div className="security-item">
            <div className="item-info">
              <div className="item-icon">
                <FaKey />
              </div>
              <div className="item-details">
                <h4>비밀번호 변경</h4>
                <p>정기적인 비밀번호 변경으로 보안을 강화하세요</p>
              </div>
            </div>
            <div className="item-controls">
              <div className="status-indicator">
                {securityStatus.passwordStrong ? (
                  <FaCheck className="enabled" />
                ) : (
                  <FaTimes className="disabled" />
                )}
              </div>
              <button 
                className="action-btn"
                onClick={() => setShowPasswordChange(!showPasswordChange)}
              >
                변경
              </button>
            </div>
          </div>

          <div className="security-item">
            <div className="item-info">
              <div className="item-icon">
                <FaLock />
              </div>
              <div className="item-details">
                <h4>지갑 백업</h4>
                <p>니모닉 구문을 안전한 곳에 백업하여 자산을 보호하세요</p>
              </div>
            </div>
            <div className="item-controls">
              <div className="status-indicator">
                {securityStatus.backupComplete ? (
                  <FaCheck className="enabled" />
                ) : (
                  <FaTimes className="disabled" />
                )}
              </div>
              <button 
                className="action-btn"
                onClick={handleBackupWallet}
                disabled={securityStatus.backupComplete}
              >
                {securityStatus.backupComplete ? '완료됨' : '백업'}
              </button>
            </div>
          </div>
        </div>

        {/* 비밀번호 변경 폼 */}
        {showPasswordChange && (
          <div className="password-change-section">
            <h3>비밀번호 변경</h3>
            <div className="password-form">
              <div className="form-group">
                <label>현재 비밀번호</label>
                <div className="password-input">
                  <input
                    type={passwordData.showCurrent ? 'text' : 'password'}
                    value={passwordData.current}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                    placeholder="현재 비밀번호를 입력하세요"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setPasswordData(prev => ({ ...prev, showCurrent: !prev.showCurrent }))}
                  >
                    {passwordData.showCurrent ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>새 비밀번호</label>
                <div className="password-input">
                  <input
                    type={passwordData.showNew ? 'text' : 'password'}
                    value={passwordData.new}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                    placeholder="새 비밀번호를 입력하세요"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setPasswordData(prev => ({ ...prev, showNew: !prev.showNew }))}
                  >
                    {passwordData.showNew ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>새 비밀번호 확인</label>
                <div className="password-input">
                  <input
                    type={passwordData.showConfirm ? 'text' : 'password'}
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                    placeholder="새 비밀번호를 다시 입력하세요"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setPasswordData(prev => ({ ...prev, showConfirm: !prev.showConfirm }))}
                  >
                    {passwordData.showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPasswordChange(false)}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handlePasswordChange}
                  disabled={!passwordData.current || !passwordData.new || !passwordData.confirm}
                >
                  변경
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 보안 권장사항 */}
        <div className="security-recommendations">
          <h3>보안 권장사항</h3>
          <div className="recommendations-list">
            <div className="recommendation-item">
              <FaShieldAlt className="rec-icon" />
              <div className="rec-content">
                <h4>정기적인 비밀번호 변경</h4>
                <p>3개월마다 비밀번호를 변경하여 보안을 유지하세요</p>
              </div>
            </div>
            <div className="recommendation-item">
              <FaLock className="rec-icon" />
              <div className="rec-content">
                <h4>니모닉 구문 보관</h4>
                <p>니모닉을 안전한 오프라인 장소에 보관하고 타인과 공유하지 마세요</p>
              </div>
            </div>
            <div className="recommendation-item">
              <FaUserShield className="rec-icon" />
              <div className="rec-content">
                <h4>의심스러운 활동 확인</h4>
                <p>알 수 없는 거래나 로그인 시도가 있는지 정기적으로 확인하세요</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
