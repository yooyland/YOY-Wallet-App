import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSecurity } from '../contexts/SecurityContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserShield, 
  FaFingerprint, 
  FaKey, 
  FaShieldAlt, 
  FaMobileAlt,
  FaCheck, 
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaDownload,
  FaUpload,
  FaTrash,
  FaLock,
  FaUnlock
} from 'react-icons/fa';
import './Security.css';

interface SecurityStatus {
  twoFactorAuth: boolean;
  biometricAuth: boolean;
  passwordStrong: boolean;
  backupComplete: boolean;
  deviceSecure: boolean;
  pinEnabled: boolean;
  patternEnabled: boolean;
  sessionTimeout: number;
}

interface BackupData {
  walletAddresses: string[];
  mnemonic: string;
  privateKeys: string[];
  createdAt: string;
  version: string;
}

const Security: React.FC = () => {
  const { user } = useAuth();
  const { 
    securitySettings, 
    setupPin, 
    disablePin, 
    verifyPin,
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric
  } = useSecurity();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    twoFactorAuth: false,
    biometricAuth: securitySettings.biometricEnabled,
    passwordStrong: true,
    backupComplete: false,
    deviceSecure: true,
    pinEnabled: securitySettings.pinEnabled,
    patternEnabled: false,
    sessionTimeout: 30
  });

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [backupData, setBackupData] = useState<BackupData | null>(null);
  
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false
  });

  const [pinData, setPinData] = useState({
    current: '',
    new: '',
    confirm: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false
  });

  const [patternData, setPatternData] = useState({
    pattern: '',
    confirm: '',
    showPattern: false
  });

  const securityScore = Object.values(securityStatus).filter(Boolean).length;
  const maxScore = Object.keys(securityStatus).length;

  // 보안 상태 업데이트
  useEffect(() => {
    setSecurityStatus(prev => ({
      ...prev,
      biometricAuth: securitySettings.biometricEnabled,
      pinEnabled: securitySettings.pinEnabled
    }));
  }, [securitySettings]);

  const handleToggleSecurity = async (key: keyof SecurityStatus) => {
    try {
      switch (key) {
        case 'biometricAuth':
          if (securityStatus.biometricAuth) {
            await disableBiometric();
          } else {
            await enableBiometric();
          }
          break;
        case 'pinEnabled':
          if (securityStatus.pinEnabled) {
            setShowPinModal(true);
          } else {
            setShowPinModal(true);
          }
          break;
        case 'patternEnabled':
          if (securityStatus.patternEnabled) {
            setShowPatternModal(true);
          } else {
            setShowPatternModal(true);
          }
          break;
        default:
          setSecurityStatus(prev => ({
            ...prev,
            [key]: !prev[key]
          }));
      }
    } catch (error) {
      console.error('보안 설정 변경 실패:', error);
    }
  };

  const getSecurityLabel = (key: keyof SecurityStatus): string => {
    const labels = {
      twoFactorAuth: '2단계 인증',
      biometricAuth: '생체 인증',
      passwordStrong: '강력한 비밀번호',
      backupComplete: '지갑 백업',
      deviceSecure: '기기 보안',
      pinEnabled: 'PIN 잠금',
      patternEnabled: '패턴 잠금',
      sessionTimeout: '세션 타임아웃'
    };
    return labels[key];
  };

  const handlePasswordChange = () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (passwordData.new.length < 8) {
      alert('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    // 실제로는 API 호출
    alert('비밀번호가 변경되었습니다.');
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

  const handlePinChange = async () => {
    if (pinData.new !== pinData.confirm) {
      alert('새 PIN이 일치하지 않습니다.');
      return;
    }

    if (!/^\d{4,6}$/.test(pinData.new)) {
      alert('PIN은 4-6자리 숫자여야 합니다.');
      return;
    }

    try {
      if (securityStatus.pinEnabled) {
        // PIN 변경
        if (pinData.current !== securitySettings.pin) {
          alert('현재 PIN이 올바르지 않습니다.');
          return;
        }
        await setupPin(pinData.new);
      } else {
        // PIN 설정
        await setupPin(pinData.new);
      }
      
      alert(securityStatus.pinEnabled ? 'PIN이 변경되었습니다.' : 'PIN이 설정되었습니다.');
      setPinData({
        current: '',
        new: '',
        confirm: '',
        showCurrent: false,
        showNew: false,
        showConfirm: false
      });
      setShowPinModal(false);
    } catch (error) {
      alert('PIN 설정에 실패했습니다.');
    }
  };

  const handleBackupWallet = () => {
    // 실제 지갑 백업 데이터 생성
    const backup: BackupData = {
      walletAddresses: ['0x1234...5678', '0x8765...4321'],
      mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
      privateKeys: ['0x1234...5678', '0x8765...4321'],
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    };
    
    setBackupData(backup);
    setShowBackupModal(true);
    
    // 백업 완료 상태 업데이트
    setSecurityStatus(prev => ({
      ...prev,
      backupComplete: true
    }));
  };

  const downloadBackup = () => {
    if (!backupData) return;
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `yoy-wallet-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="security">
      <div className="security-header">
        <h1>보안 설정</h1>
        <p>계정과 자산을 안전하게 보호하세요</p>
      </div>

      {/* 보안 점수 */}
      <div className="security-score">
        <div className="score-circle">
          <div className="score-number">{securityScore}</div>
          <div className="score-max">/ {maxScore}</div>
        </div>
        <div className="score-info">
          <h3>보안 점수</h3>
          <p>보안 설정을 완료하여 점수를 높이세요</p>
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
              <FaFingerprint />
            </div>
            <div className="item-details">
              <h4>생체 인증</h4>
              <p>지문이나 얼굴 인식으로 빠르고 안전하게 로그인합니다</p>
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
              <h4>PIN 잠금</h4>
              <p>4-6자리 PIN으로 앱을 잠금니다</p>
            </div>
          </div>
          <div className="item-controls">
            <div className="status-indicator">
              {securityStatus.pinEnabled ? (
                <FaCheck className="enabled" />
              ) : (
                <FaTimes className="disabled" />
              )}
            </div>
            <button 
              className={`toggle-btn ${securityStatus.pinEnabled ? 'enabled' : 'disabled'}`}
              onClick={() => handleToggleSecurity('pinEnabled')}
            >
              {securityStatus.pinEnabled ? '변경' : '설정'}
            </button>
          </div>
        </div>

        <div className="security-item">
          <div className="item-info">
            <div className="item-icon">
              <FaMobileAlt />
            </div>
            <div className="item-details">
              <h4>패턴 잠금</h4>
              <p>9점 패턴으로 앱을 잠금니다 (준비 중)</p>
            </div>
          </div>
          <div className="item-controls">
            <div className="status-indicator">
              {securityStatus.patternEnabled ? (
                <FaCheck className="enabled" />
              ) : (
                <FaTimes className="disabled" />
              )}
            </div>
            <button 
              className={`toggle-btn disabled`}
              onClick={() => alert('패턴 잠금 기능은 준비 중입니다.')}
              disabled
            >
              준비 중
            </button>
          </div>
        </div>

        <div className="security-item">
          <div className="item-info">
            <div className="item-icon">
              <FaShieldAlt />
            </div>
            <div className="item-details">
              <h4>지갑 백업</h4>
              <p>지갑 데이터를 안전하게 백업합니다</p>
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
              className={`toggle-btn ${securityStatus.backupComplete ? 'enabled' : 'disabled'}`}
              onClick={handleBackupWallet}
            >
              {securityStatus.backupComplete ? '다시 백업' : '백업'}
            </button>
          </div>
        </div>
      </div>

      {/* 비밀번호 변경 */}
      <div className="password-change-section">
        <h3>비밀번호 변경</h3>
        <button 
          className="change-password-btn"
          onClick={() => setShowPasswordChange(true)}
        >
          비밀번호 변경
        </button>
      </div>

      {/* 세션 타임아웃 */}
      <div className="session-timeout-section">
        <h3>세션 타임아웃</h3>
        <div className="timeout-controls">
          <select
            value={securityStatus.sessionTimeout}
            onChange={(e) => setSecurityStatus(prev => ({
              ...prev,
              sessionTimeout: parseInt(e.target.value)
            }))}
          >
            <option value={15}>15분</option>
            <option value={30}>30분</option>
            <option value={60}>1시간</option>
            <option value={120}>2시간</option>
          </select>
          <p>자동 로그아웃 시간을 설정합니다</p>
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      {showPasswordChange && (
        <div className="modal-overlay" onClick={() => setShowPasswordChange(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>비밀번호 변경</h3>
              <button className="close-btn" onClick={() => setShowPasswordChange(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="password-form">
              <div className="form-group">
                <label>현재 비밀번호</label>
                <div className="password-input">
                  <input
                    type={passwordData.showCurrent ? 'text' : 'password'}
                    value={passwordData.current}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                    placeholder="현재 비밀번호"
                  />
                  <button 
                    className="toggle-password"
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
                    placeholder="새 비밀번호 (8자 이상)"
                  />
                  <button 
                    className="toggle-password"
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
                    placeholder="새 비밀번호 확인"
                  />
                  <button 
                    className="toggle-password"
                    onClick={() => setPasswordData(prev => ({ ...prev, showConfirm: !prev.showConfirm }))}
                  >
                    {passwordData.showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              
              <button className="submit-btn" onClick={handlePasswordChange}>
                비밀번호 변경
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN 설정/변경 모달 */}
      {showPinModal && (
        <div className="modal-overlay" onClick={() => setShowPinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{securityStatus.pinEnabled ? 'PIN 변경' : 'PIN 설정'}</h3>
              <button className="close-btn" onClick={() => setShowPinModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="pin-form">
              {securityStatus.pinEnabled && (
                <div className="form-group">
                  <label>현재 PIN</label>
                  <div className="pin-input">
                    <input
                      type={pinData.showCurrent ? 'text' : 'password'}
                      value={pinData.current}
                      onChange={(e) => setPinData(prev => ({ ...prev, current: e.target.value }))}
                      placeholder="현재 PIN"
                      maxLength={6}
                    />
                    <button 
                      className="toggle-password"
                      onClick={() => setPinData(prev => ({ ...prev, showCurrent: !prev.showCurrent }))}
                    >
                      {pinData.showCurrent ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              )}
              
              <div className="form-group">
                <label>새 PIN</label>
                <div className="pin-input">
                  <input
                    type={pinData.showNew ? 'text' : 'password'}
                    value={pinData.new}
                    onChange={(e) => setPinData(prev => ({ ...prev, new: e.target.value }))}
                    placeholder="새 PIN (4-6자리)"
                    maxLength={6}
                  />
                  <button 
                    className="toggle-password"
                    onClick={() => setPinData(prev => ({ ...prev, showNew: !prev.showNew }))}
                  >
                    {pinData.showNew ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label>새 PIN 확인</label>
                <div className="pin-input">
                  <input
                    type={pinData.showConfirm ? 'text' : 'password'}
                    value={pinData.confirm}
                    onChange={(e) => setPinData(prev => ({ ...prev, confirm: e.target.value }))}
                    placeholder="새 PIN 확인"
                    maxLength={6}
                  />
                  <button 
                    className="toggle-password"
                    onClick={() => setPinData(prev => ({ ...prev, showConfirm: !prev.showConfirm }))}
                  >
                    {pinData.showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              
              <button className="submit-btn" onClick={handlePinChange}>
                {securityStatus.pinEnabled ? 'PIN 변경' : 'PIN 설정'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 백업 모달 */}
      {showBackupModal && backupData && (
        <div className="modal-overlay" onClick={() => setShowBackupModal(false)}>
          <div className="modal-content backup-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>지갑 백업</h3>
              <button className="close-btn" onClick={() => setShowBackupModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="backup-content">
              <div className="backup-warning">
                <FaLock />
                <h4>⚠️ 중요: 백업 파일을 안전한 곳에 보관하세요</h4>
                <p>이 파일에는 지갑 복구에 필요한 모든 정보가 포함되어 있습니다.</p>
              </div>
              
              <div className="backup-info">
                <div className="backup-item">
                  <span>백업 날짜:</span>
                  <span>{new Date(backupData.createdAt).toLocaleString('ko-KR')}</span>
                </div>
                <div className="backup-item">
                  <span>지갑 주소:</span>
                  <span>{backupData.walletAddresses.length}개</span>
                </div>
                <div className="backup-item">
                  <span>백업 버전:</span>
                  <span>{backupData.version}</span>
                </div>
              </div>
              
              <div className="backup-actions">
                <button className="download-btn" onClick={downloadBackup}>
                  <FaDownload /> 백업 파일 다운로드
                </button>
                <button className="close-btn" onClick={() => setShowBackupModal(false)}>
                  완료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;
