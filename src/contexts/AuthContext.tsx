import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '../types';
import { useSecurity } from './SecurityContext';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 복원
    const savedUser = localStorage.getItem('yoy_wallet_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        // 프로필 사진 정보도 가져오기
        const savedPhoto = localStorage.getItem('profile_photo');
        if (savedPhoto) {
          user.avatar = savedPhoto;
        }
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } catch (error) {
        localStorage.removeItem('yoy_wallet_user');
      }
    }
  }, []);

    const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      // 실제 API 호출 대신 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 관리자 이메일 확인
      const adminEmails = ['admin@yooyland.com', 'landyooy@gmail.com', 'jch4389@gmail.com'];
      const isAdmin = adminEmails.includes(credentials.email);
      
      // 기존 사용자 정보가 있는지 확인
      const existingUser = localStorage.getItem('yoy_wallet_user');
      let mockUser: User;
      
      if (existingUser) {
        // 기존 사용자 정보 확인
        const parsedUser = JSON.parse(existingUser);
        
        // 이메일이 다르면 새로운 사용자로 처리
        if (parsedUser.email !== credentials.email) {
          // 기존 사용자 정보 삭제
          localStorage.removeItem('yoy_wallet_user');
          localStorage.removeItem('profile_photo');
          
          // 새로운 사용자 생성
          const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
          const username = `YoY${randomNumber}`;
          
          mockUser = {
            id: username,
            email: credentials.email,
            username: username,
            firstName: '사용자',
            lastName: '이름',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isAdmin: isAdmin,
          };
        } else {
          // 같은 이메일이면 기존 사용자 정보 사용
          mockUser = {
            ...parsedUser,
            updatedAt: new Date().toISOString(),
            isAdmin: isAdmin,
          };
        }
      } else {
        // 새로운 사용자 생성
        const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        const username = `YoY${randomNumber}`;
        
        mockUser = {
          id: username,
          email: credentials.email,
          username: username,
          firstName: '사용자',
          lastName: '이름',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isAdmin: isAdmin,
        };
      }
      
      localStorage.setItem('yoy_wallet_user', JSON.stringify(mockUser));
      dispatch({ type: 'AUTH_SUCCESS', payload: mockUser });
      
      // 관리자가 아닌 경우에만 보안 설정 확인
      if (!isAdmin) {
        // 보안 설정이 있고, 실제로 활성화되어 있을 때만 PIN 인증 페이지로 이동
        const securitySettings = localStorage.getItem('securitySettings');
        if (securitySettings) {
          const settings = JSON.parse(securitySettings);
          // 실제로 PIN이나 생체인증이 활성화되어 있을 때만 추가 인증 요구
          if ((settings.pinEnabled && settings.pin) || settings.biometricEnabled) {
            setTimeout(() => {
              window.location.href = '/pin-auth';
            }, 100);
          }
        }
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: '로그인에 실패했습니다.' });
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      // 실제 API 호출 대신 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // YoY + 난수 형태의 사용자명 생성 (기존 사용자명이 있으면 사용, 없으면 생성)
      let username = credentials.username;
      if (!username || username === 'user123') {
        const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        username = `YoY${randomNumber}`;
      }
      
             const mockUser: User = {
         id: username, // 계정 ID를 사용자명과 동일하게 설정
         email: credentials.email,
         username: username,
         firstName: credentials.firstName,
         lastName: credentials.lastName,
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
       };
      
      localStorage.setItem('yoy_wallet_user', JSON.stringify(mockUser));
      dispatch({ type: 'AUTH_SUCCESS', payload: mockUser });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: '회원가입에 실패했습니다.' });
    }
  };

  const logout = () => {
    // 사용자 정보와 프로필 사진 완전 삭제
    localStorage.removeItem('yoy_wallet_user');
    localStorage.removeItem('profile_photo');
    sessionStorage.removeItem('profile_photo');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      // 실제 API 호출 대신 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 현재 사용자 정보 가져오기
      const currentUser = state.user;
      if (!currentUser) {
        throw new Error('사용자 정보가 없습니다.');
      }
      
             // 업데이트된 사용자 정보 생성
       const updatedUser = { 
         ...currentUser, 
         ...userData,
         updatedAt: new Date().toISOString() // 업데이트 시간 기록
       };
      
      // 상태 업데이트
      dispatch({ type: 'UPDATE_PROFILE', payload: userData });
      
      // localStorage에 저장
      localStorage.setItem('yoy_wallet_user', JSON.stringify(updatedUser));
      
      // 프로필 사진이 있으면 별도 저장
      if (userData.avatar) {
        localStorage.setItem('profile_photo', userData.avatar);
      }
      
      console.log('프로필 업데이트 완료:', updatedUser);
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      dispatch({ type: 'AUTH_FAILURE', payload: '프로필 업데이트에 실패했습니다.' });
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
