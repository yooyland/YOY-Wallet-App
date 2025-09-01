import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { SecuritySettings } from '../types';

interface SecurityContextType {
  securitySettings: SecuritySettings;
  setupPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  disablePin: () => Promise<void>;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  isBiometricAvailable: () => boolean;
  authenticateWithBiometric: () => Promise<boolean>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

type SecurityAction =
  | { type: 'SETUP_PIN'; payload: string }
  | { type: 'DISABLE_PIN' }
  | { type: 'ENABLE_BIOMETRIC' }
  | { type: 'DISABLE_BIOMETRIC' }
  | { type: 'LOAD_SETTINGS'; payload: SecuritySettings };

const securityReducer = (state: SecuritySettings, action: SecurityAction): SecuritySettings => {
  switch (action.type) {
    case 'SETUP_PIN':
      return {
        ...state,
        pinEnabled: true,
        pin: action.payload,
      };
    case 'DISABLE_PIN':
      return {
        ...state,
        pinEnabled: false,
        pin: undefined,
      };
    case 'ENABLE_BIOMETRIC':
      return {
        ...state,
        biometricEnabled: true,
      };
    case 'DISABLE_BIOMETRIC':
      return {
        ...state,
        biometricEnabled: false,
      };
    case 'LOAD_SETTINGS':
      return action.payload;
    default:
      return state;
  }
};

const initialState: SecuritySettings = {
  pinEnabled: false,
  biometricEnabled: false,
};

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [securitySettings, dispatch] = useReducer(securityReducer, initialState);

  useEffect(() => {
    // 로컬 스토리지에서 보안 설정 복원
    const savedSettings = localStorage.getItem('yoy_wallet_security');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        dispatch({ type: 'LOAD_SETTINGS', payload: settings });
      } catch (error) {
        console.error('보안 설정 로드 실패:', error);
      }
    }
  }, []);

  const setupPin = async (pin: string): Promise<void> => {
    try {
      // PIN 유효성 검사 (4-6자리 숫자)
      if (!/^\d{4,6}$/.test(pin)) {
        throw new Error('PIN은 4-6자리 숫자여야 합니다.');
      }

      dispatch({ type: 'SETUP_PIN', payload: pin });
      
      // 로컬 스토리지에 저장
      const updatedSettings = { ...securitySettings, pinEnabled: true, pin };
      localStorage.setItem('yoy_wallet_security', JSON.stringify(updatedSettings));
      
      console.log('PIN 설정 완료');
    } catch (error) {
      console.error('PIN 설정 실패:', error);
      throw error;
    }
  };

  const disablePin = async (): Promise<void> => {
    try {
      dispatch({ type: 'DISABLE_PIN' });
      
      // 로컬 스토리지에 저장 (PIN 완전 삭제)
      const updatedSettings = { 
        ...securitySettings, 
        pinEnabled: false, 
        pin: undefined 
      };
      localStorage.setItem('yoy_wallet_security', JSON.stringify(updatedSettings));
      
      console.log('PIN 비활성화 완료');
    } catch (error) {
      console.error('PIN 비활성화 실패:', error);
      throw error;
    }
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    try {
      // 실제 환경에서는 해시된 PIN을 비교해야 함
      return securitySettings.pin === pin;
    } catch (error) {
      console.error('PIN 검증 실패:', error);
      return false;
    }
  };

  const enableBiometric = async (): Promise<void> => {
    try {
      // 생체인증 사용 가능 여부 확인
      if (!isBiometricAvailable()) {
        throw new Error('생체인증을 사용할 수 없습니다.');
      }

      dispatch({ type: 'ENABLE_BIOMETRIC' });
      
      // 로컬 스토리지에 저장
      const updatedSettings = { ...securitySettings, biometricEnabled: true };
      localStorage.setItem('yoy_wallet_security', JSON.stringify(updatedSettings));
      
      console.log('생체인증 활성화 완료');
    } catch (error) {
      console.error('생체인증 활성화 실패:', error);
      throw error;
    }
  };

  const disableBiometric = async (): Promise<void> => {
    try {
      dispatch({ type: 'DISABLE_BIOMETRIC' });
      
      // 로컬 스토리지에 저장
      const updatedSettings = { ...securitySettings, biometricEnabled: false };
      localStorage.setItem('yoy_wallet_security', JSON.stringify(updatedSettings));
      
      console.log('생체인증 비활성화 완료');
    } catch (error) {
      console.error('생체인증 비활성화 실패:', error);
      throw error;
    }
  };

  const isBiometricAvailable = (): boolean => {
    // 실제 환경에서는 WebAuthn API 등을 사용하여 확인
    // 현재는 시뮬레이션
    return 'credentials' in navigator && 'preventExtensions' in navigator;
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    try {
      if (!securitySettings.biometricEnabled) {
        return false;
      }

      // 실제 환경에서는 WebAuthn API를 사용
      // 현재는 시뮬레이션 (80% 성공률)
      return Math.random() < 0.8;
    } catch (error) {
      console.error('생체인증 실패:', error);
      return false;
    }
  };

  const value: SecurityContextType = {
    securitySettings,
    setupPin,
    verifyPin,
    disablePin,
    enableBiometric,
    disableBiometric,
    isBiometricAvailable,
    authenticateWithBiometric,
  };

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>;
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
