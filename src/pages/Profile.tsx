import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaEnvelope, FaCamera, FaSave } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Profile.css';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(user?.avatar || undefined);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      email: user?.email || '',
    },
  });

  const watchedUsername = watch('username');

  // 사용자명 중복 확인
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username === user?.username) {
      setUsernameAvailable(null);
      return;
    }

    if (username.length < 3) {
      setUsernameAvailable(false);
      return;
    }

    setIsCheckingUsername(true);
    try {
      // 실제 API 호출 대신 시뮬레이션 (나중에 실제 API로 교체)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 가상의 중복 확인 로직 (실제로는 서버에서 확인)
      const existingUsernames = ['admin', 'user', 'test', 'demo', 'guest'];
      const isAvailable = !existingUsernames.includes(username.toLowerCase());
      
      setUsernameAvailable(isAvailable);
      
      if (!isAvailable) {
        toast.error('이미 사용 중인 사용자명입니다.');
      } else {
        toast.success('사용 가능한 사용자명입니다.');
      }
    } catch (error) {
      toast.error('사용자명 확인 중 오류가 발생했습니다.');
      setUsernameAvailable(false);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // 사용자명 변경 감지
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedUsername && watchedUsername !== user?.username) {
        checkUsernameAvailability(watchedUsername);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedUsername, user?.username]);

  // 사용자 정보가 변경될 때마다 폼 데이터 업데이트
  React.useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
      });
      
      // sessionStorage에서 프로필 사진 로드 시도
      try {
        const savedPhoto = sessionStorage.getItem('profile_photo');
        if (savedPhoto) {
          setProfilePhoto(savedPhoto);
        } else {
          setProfilePhoto(user.avatar || undefined);
        }
      } catch (error) {
        console.warn('sessionStorage에서 프로필 사진을 로드할 수 없습니다:', error);
        setProfilePhoto(user.avatar || undefined);
      }
    }
  }, [user, reset]);

  // 컴포넌트 마운트 시 sessionStorage에서 프로필 사진 로드
  React.useEffect(() => {
    try {
      const savedPhoto = sessionStorage.getItem('profile_photo');
      if (savedPhoto && !profilePhoto) {
        setProfilePhoto(savedPhoto);
      }
    } catch (error) {
      console.warn('sessionStorage에서 프로필 사진을 로드할 수 없습니다:', error);
    }
  }, []);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // 사용자명이 변경되었는지 확인
      const isUsernameChanged = data.username !== user?.username;
      
      // 사용자명이 변경되었고 중복 확인이 되지 않은 경우
      if (isUsernameChanged && usernameAvailable !== true) {
        toast.error('사용자명 중복 확인을 먼저 해주세요.');
        setIsLoading(false);
        return;
      }

      // 프로필 사진 정보도 포함하여 업데이트
      const updateData = {
        ...data,
        avatar: profilePhoto || undefined,
        // 사용자명이 변경된 경우 계정 ID도 함께 업데이트
        id: isUsernameChanged ? data.username : user?.id
      };
      
      await updateProfile(updateData);
      
      // 이메일이 변경되었는지 확인
      if (data.email !== user?.email) {
        toast.success('이메일이 성공적으로 업데이트되었습니다.');
      } else if (isUsernameChanged) {
        toast.success('사용자명과 계정 ID가 성공적으로 업데이트되었습니다.');
      } else {
        toast.success('프로필이 업데이트되었습니다.');
      }
      
      setIsEditing(false);
      setUsernameAvailable(null); // 중복 확인 상태 초기화
    } catch (error) {
      toast.error('프로필 업데이트에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      email: user?.email || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 크기 제한 (2MB로 줄임)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('파일 크기는 2MB 이하여야 합니다.');
        return;
      }

      // 파일 타입 제한
      if (!file.type.startsWith('image/')) {
        toast.error('이미지 파일만 업로드 가능합니다.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        
        // 이미지 압축 함수
        const compressImage = (dataUrl: string, maxWidth: number = 200, quality: number = 0.7): Promise<string> => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              // 비율 유지하면서 크기 조정
              const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
              canvas.width = img.width * ratio;
              canvas.height = img.height * ratio;
              
              if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataUrl);
              } else {
                resolve(dataUrl);
              }
            };
            img.src = dataUrl;
          });
        };

        // 이미지 압축 후 저장
        compressImage(result).then((compressedResult) => {
          setProfilePhoto(compressedResult);
          
          // 압축된 이미지를 sessionStorage에 저장 (localStorage 대신)
          try {
            sessionStorage.setItem('profile_photo', compressedResult);
          } catch (error) {
            console.warn('프로필 사진을 sessionStorage에 저장할 수 없습니다:', error);
            // sessionStorage에도 저장할 수 없으면 메모리에만 보관
          }
          
          // AuthContext의 사용자 정보도 업데이트
          if (user) {
            updateProfile({ ...user, avatar: compressedResult });
          }
          
          toast.success('프로필 사진이 업데이트되었습니다.');
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="profile">
      <div className="profile-header">
        <h1>프로필</h1>
        <p>개인 정보를 관리하고 업데이트하세요</p>
      </div>

      <div className="profile-content">
        {/* 프로필 사진 */}
        <div className="profile-photo-section">
          <div className="profile-photo">
            {profilePhoto ? (
              <img src={profilePhoto} alt={user?.username || 'Profile'} />
            ) : (
              <div className="photo-placeholder">
                <FaUser />
              </div>
            )}
            <button className="photo-edit-btn" onClick={handlePhotoClick}>
              <FaCamera />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* 프로필 정보 */}
        <div className="profile-info-section">
          <div className="section-header">
            <h2>개인 정보</h2>
            {!isEditing && (
              <button className="btn btn-secondary" onClick={handleEdit}>
                편집
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">이름</label>
                <input
                  {...register('firstName', {
                    required: '이름을 입력해주세요.',
                  })}
                  type="text"
                  id="firstName"
                  disabled={!isEditing}
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
                  disabled={!isEditing}
                />
                {errors.lastName && <span className="error">{errors.lastName.message}</span>}
              </div>
            </div>

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
                disabled={!isEditing}
                onBlur={() => checkUsernameAvailability(watchedUsername)}
              />
              {errors.username && <span className="error">{errors.username.message}</span>}
              {isCheckingUsername && <span className="checking-status">사용자명 확인 중...</span>}
              {usernameAvailable !== null && (
                <span className={`username-status ${usernameAvailable ? 'available' : 'unavailable'}`}>
                  {usernameAvailable ? '사용 가능한 사용자명입니다.' : '이미 사용 중인 사용자명입니다.'}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">이메일</label>
              <div className="email-input">
                <input
                  {...register('email', {
                    required: '이메일을 입력해주세요.',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: '유효한 이메일 주소를 입력해주세요.',
                    },
                    onChange: (e) => {
                      // 실시간 이메일 유효성 검사
                      const email = e.target.value;
                      if (email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
                        e.target.setCustomValidity('올바른 이메일 형식을 입력해주세요.');
                      } else {
                        e.target.setCustomValidity('');
                      }
                    }
                  })}
                  type="email"
                  id="email"
                  placeholder="example@email.com"
                  // disabled={!isEditing} // 이메일은 항상 수정 가능하도록 제거
                />
              </div>
              {errors.email && <span className="error">{errors.email.message}</span>}
            </div>

            {isEditing && (
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  <FaSave />
                  {isLoading ? '저장 중...' : '저장'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* 계정 정보 */}
        <div className="account-info-section">
          <h2>계정 정보</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>계정 ID</label>
              <span>{user?.id}</span>
            </div>
                         <div className="info-item">
               <label>가입일</label>
               <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-'}</span>
             </div>
             <div className="info-item">
               <label>마지막 업데이트</label>
               <span>{user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('ko-KR') : '-'}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
