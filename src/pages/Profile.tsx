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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      email: user?.email || '',
    },
  });

  // 사용자 정보가 변경될 때마다 폼 데이터 업데이트
  React.useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
      });
      setProfilePhoto(user.avatar || undefined);
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // 프로필 사진 정보도 포함하여 업데이트
      const updateData = {
        ...data,
        avatar: profilePhoto || undefined
      };
      
      await updateProfile(updateData);
      toast.success('프로필이 업데이트되었습니다.');
      setIsEditing(false);
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
      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('파일 크기는 5MB 이하여야 합니다.');
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
        setProfilePhoto(result);
        
        // 프로필 사진을 localStorage에 저장
        localStorage.setItem('profile_photo', result);
        
        // AuthContext의 사용자 정보도 업데이트
        if (user) {
          updateProfile({ ...user, avatar: result });
        }
        
        toast.success('프로필 사진이 업데이트되었습니다.');
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
              />
              {errors.username && <span className="error">{errors.username.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">이메일</label>
              <div className="email-input">
                <FaEnvelope className="email-icon" />
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
                  disabled={!isEditing}
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
