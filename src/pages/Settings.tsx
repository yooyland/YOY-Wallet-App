import React, { useState } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { useSecurity } from '../contexts/SecurityContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  FaCog, 
  FaShieldAlt, 
  FaBell, 
  FaEye, 
  FaEyeSlash,
  FaSave,
  FaTrash,
  FaDownload,
  FaUpload
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Settings.css';

interface SecuritySettings {
  twoFactorAuth: boolean;
  biometricAuth: boolean;
  sessionTimeout: number;
  passwordChangeRequired: boolean;
  pinAuth: boolean;
  patternAuth: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  transactionAlerts: boolean;
  priceAlerts: boolean;
  securityAlerts: boolean;
}

interface AppSettings {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  currency: string;
  timezone: string;
}

const Settings: React.FC = () => {
  const { currency, setCurrency } = useCurrency();
  const { user } = useAuth();
  const { securitySettings: globalSecuritySettings, setupPin, disablePin, enableBiometric, disableBiometric, isBiometricAvailable } = useSecurity();
  const { t, currentLanguage, setLanguage, availableLanguages } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  
  // 보안 설정
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    biometricAuth: globalSecuritySettings.biometricEnabled,
    sessionTimeout: 30,
    passwordChangeRequired: false,
    pinAuth: globalSecuritySettings.pinEnabled && !!globalSecuritySettings.pin,
    patternAuth: false,
  });

  // 알림 설정
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    transactionAlerts: true,
    priceAlerts: false,
    securityAlerts: true,
  });

  // 앱 설정
  const [appSettings, setAppSettings] = useState<AppSettings>({
    language: 'ko',
    theme: 'light',
    currency: 'USD',
    timezone: 'Asia/Seoul',
  });

  // 비밀번호 변경
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  });

  const handleSecurityChange = (key: keyof SecuritySettings, value: boolean | number) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleAppSettingChange = (key: keyof AppSettings, value: string) => {
    setAppSettings(prev => ({ ...prev, [key]: value }));
    
    // 언어가 변경되면 LanguageContext도 업데이트
    if (key === 'language') {
      setLanguage(value);
    }
  };

  // 언어 설정 동기화
  React.useEffect(() => {
    setAppSettings(prev => ({ ...prev, language: currentLanguage }));
  }, [currentLanguage]);

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('새 비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    try {
      // 실제 구현에서는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('비밀번호가 변경되었습니다.');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false,
      });
    } catch (error) {
      toast.error('비밀번호 변경에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // 실제 구현에서는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('설정이 저장되었습니다.');
    } catch (error) {
      toast.error('설정 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    const data = {
      user: user,
      settings: {
        security: securitySettings,
        notifications: notificationSettings,
        app: appSettings,
      },
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yoy-wallet-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('설정이 내보내기되었습니다.');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      toast.success('계정 삭제 요청이 처리되었습니다.');
    }
  };

  return (
    <div className="settings">
              <div className="settings-header">
          <h1>{t('settings.title')}</h1>
          <p>{t('settings.subtitle')}</p>
        </div>

      <div className="settings-content">
        {/* 보안 설정 */}
        <div className="settings-section">
          <div className="section-header">
            <FaShieldAlt className="section-icon" />
            <h2>{t('settings.security')}</h2>
          </div>
          
          <div className="settings-grid">
            <div className="setting-item">
              <div className="setting-info">
                <label>2단계 인증</label>
                <p>로그인 시 추가 보안 코드를 요구합니다</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={securitySettings.twoFactorAuth}
                  onChange={(e) => handleSecurityChange('twoFactorAuth', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>생체 인증</label>
                <p>지문 또는 얼굴 인식을 사용합니다</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={securitySettings.biometricAuth}
                  onChange={async (e) => {
                    if (e.target.checked) {
                      try {
                        await enableBiometric();
                        handleSecurityChange('biometricAuth', true);
                        toast.success('생체 인증이 활성화되었습니다.');
                      } catch (error) {
                        toast.error('생체 인증 활성화에 실패했습니다.');
                      }
                    } else {
                      try {
                        await disableBiometric();
                        handleSecurityChange('biometricAuth', false);
                        toast.success('생체 인증이 비활성화되었습니다.');
                      } catch (error) {
                        toast.error('생체 인증 비활성화에 실패했습니다.');
                      }
                    }
                  }}
                  disabled={!isBiometricAvailable()}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>PIN 인증</label>
                <p>4-6자리 숫자 PIN으로 로그인합니다</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={securitySettings.pinAuth}
                  onChange={async (e) => {
                    if (e.target.checked) {
                      // PIN 설정 모달 또는 페이지로 이동
                      const pin = prompt('PIN을 입력해주세요 (4-6자리 숫자):');
                      if (pin && /^\d{4,6}$/.test(pin)) {
                        try {
                          await setupPin(pin);
                          handleSecurityChange('pinAuth', true);
                          toast.success('PIN 인증이 활성화되었습니다.');
                        } catch (error) {
                          toast.error('PIN 설정에 실패했습니다.');
                        }
                      } else {
                        toast.error('올바른 PIN을 입력해주세요.');
                      }
                    } else {
                      // PIN 비활성화
                      try {
                        await disablePin();
                        handleSecurityChange('pinAuth', false);
                        toast.success('PIN 인증이 비활성화되었습니다.');
                      } catch (error) {
                        toast.error('PIN 비활성화에 실패했습니다.');
                      }
                    }
                  }}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>패턴 인증</label>
                <p>9점 패턴으로 로그인합니다 (준비 중)</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={securitySettings.patternAuth}
                  onChange={(e) => {
                    toast('패턴 인증 기능은 준비 중입니다.');
                  }}
                  disabled={true}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>세션 타임아웃</label>
                <p>자동 로그아웃 시간을 설정합니다</p>
              </div>
              <select
                value={securitySettings.sessionTimeout}
                onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
              >
                <option value={15}>15분</option>
                <option value={30}>30분</option>
                <option value={60}>1시간</option>
                <option value={120}>2시간</option>
              </select>
            </div>
          </div>

          {/* 비밀번호 변경 */}
          <div className="password-change-section">
            <h3>비밀번호 변경</h3>
            <div className="password-form">
              <div className="form-row">
                <div className="form-group">
                  <label>현재 비밀번호</label>
                  <div className="password-input">
                    <input
                      type={passwordData.showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="현재 비밀번호"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setPasswordData(prev => ({ ...prev, showCurrentPassword: !prev.showCurrentPassword }))}
                    >
                      {passwordData.showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>새 비밀번호</label>
                  <div className="password-input">
                    <input
                      type={passwordData.showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="새 비밀번호"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setPasswordData(prev => ({ ...prev, showNewPassword: !prev.showNewPassword }))}
                    >
                      {passwordData.showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>새 비밀번호 확인</label>
                  <div className="password-input">
                    <input
                      type={passwordData.showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="새 비밀번호 확인"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setPasswordData(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                    >
                      {passwordData.showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                className="btn btn-primary"
                onClick={handlePasswordChange}
                disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                <FaSave />
                {isLoading ? '변경 중...' : '비밀번호 변경'}
              </button>
            </div>
          </div>
        </div>

        {/* 알림 설정 */}
        <div className="settings-section">
          <div className="section-header">
            <FaBell className="section-icon" />
            <h2>알림 설정</h2>
          </div>
          
          <div className="settings-grid">
            <div className="setting-item">
              <div className="setting-info">
                <label>이메일 알림</label>
                <p>중요한 정보를 이메일로 받습니다</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationSettings.emailNotifications}
                  onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>푸시 알림</label>
                <p>앱에서 실시간 알림을 받습니다</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationSettings.pushNotifications}
                  onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>거래 알림</label>
                <p>송금/수신 시 알림을 받습니다</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationSettings.transactionAlerts}
                  onChange={(e) => handleNotificationChange('transactionAlerts', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>가격 알림</label>
                <p>코인 가격 변동 시 알림을 받습니다</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationSettings.priceAlerts}
                  onChange={(e) => handleNotificationChange('priceAlerts', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>보안 알림</label>
                <p>보안 관련 이벤트 시 알림을 받습니다</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationSettings.securityAlerts}
                  onChange={(e) => handleNotificationChange('securityAlerts', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* 앱 설정 */}
        <div className="settings-section">
          <div className="section-header">
            <FaCog className="section-icon" />
            <h2>{t('settings.appSettings')}</h2>
          </div>
          
          <div className="settings-grid">
            <div className="setting-item">
              <div className="setting-info">
                <label>{t('settings.language')}</label>
                <p>{t('language.manualDesc')}</p>
              </div>
              <select
                value={currentLanguage}
                onChange={(e) => handleAppSettingChange('language', e.target.value)}
              >
                {availableLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>테마</label>
                <p>앱 테마를 선택합니다 (Dark: Black+Gold, Light: White+Blue)</p>
              </div>
              <div className="theme-toggle">
                <span className={`theme-label ${theme === 'light' ? 'active' : ''}`}>라이트 (White+Blue)</span>
                <button 
                  className={`theme-switch ${theme === 'dark' ? 'dark' : 'light'}`}
                  onClick={toggleTheme}
                >
                  <div className="theme-switch-thumb"></div>
                </button>
                <span className={`theme-label ${theme === 'dark' ? 'active' : ''}`}>다크 (Black+Gold)</span>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>통화</label>
                <p>표시 통화를 선택합니다</p>
              </div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
              >
                <option value="USD">USD (달러)</option>
                <option value="KRW">KRW (원)</option>
                <option value="EUR">EUR (유로)</option>
                <option value="JPY">JPY (엔)</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>시간대</label>
                <p>시간대를 선택합니다</p>
              </div>
              <select
                value={appSettings.timezone}
                onChange={(e) => handleAppSettingChange('timezone', e.target.value)}
              >
                <option value="Asia/Seoul">Asia/Seoul (한국)</option>
                <option value="America/New_York">America/New_York (미국 동부)</option>
                <option value="Europe/London">Europe/London (영국)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (일본)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 데이터 관리 */}
        <div className="settings-section">
          <div className="section-header">
            <FaDownload className="section-icon" />
            <h2>데이터 관리</h2>
          </div>
          
          <div className="data-actions">
            <button className="btn btn-secondary" onClick={handleExportData}>
              <FaDownload />
              설정 내보내기
            </button>
            
            <button className="btn btn-secondary">
              <FaUpload />
              설정 가져오기
            </button>
          </div>
        </div>

        {/* 계정 관리 */}
        <div className="settings-section">
          <div className="section-header">
            <FaTrash className="section-icon" />
            <h2>계정 관리</h2>
          </div>
          
          <div className="account-actions">
            <button className="btn btn-danger" onClick={handleDeleteAccount}>
              <FaTrash />
              계정 삭제
            </button>
          </div>
        </div>

        {/* 설정 저장 */}
        <div className="settings-actions">
          <button
            className="btn btn-primary"
            onClick={handleSaveSettings}
            disabled={isLoading}
          >
            <FaSave />
            {isLoading ? '저장 중...' : '설정 저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
