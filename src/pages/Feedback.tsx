import React, { useState } from 'react';
import { FaEnvelope, FaStar, FaBug, FaLightbulb, FaPaperPlane, FaCheck } from 'react-icons/fa';
import './Feedback.css';

const Feedback: React.FC = () => {
  const [feedbackType, setFeedbackType] = useState<'bug' | 'suggestion' | 'general'>('general');
  const [rating, setRating] = useState<number>(0);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const feedbackTypes = [
    {
      id: 'bug',
      label: '버그 신고',
      icon: <FaBug />,
      description: '앱에서 발견한 문제를 신고해 주세요'
    },
    {
      id: 'suggestion',
      label: '기능 제안',
      icon: <FaLightbulb />,
      description: '새로운 기능이나 개선사항을 제안해 주세요'
    },
    {
      id: 'general',
      label: '일반 문의',
      icon: <FaEnvelope />,
      description: '기타 의견이나 문의사항'
    }
  ];

  const handleSubmit = () => {
    if (subject.trim() && message.trim()) {
      // 피드백 전송 로직 구현
      console.log('피드백 전송:', {
        type: feedbackType,
        rating,
        subject,
        message,
        email
      });
      setIsSubmitted(true);
      
      // 3초 후 폼 초기화
      setTimeout(() => {
        setIsSubmitted(false);
        setSubject('');
        setMessage('');
        setEmail('');
        setRating(0);
      }, 3000);
    }
  };

  const renderStars = () => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map(star => (
          <FaStar
            key={star}
            className={`star ${star <= rating ? 'filled' : ''}`}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <div className="feedback-page">
        <div className="success-message">
          <div className="success-icon">
            <FaCheck />
          </div>
          <h2>피드백이 전송되었습니다!</h2>
          <p>소중한 의견 감사합니다. 검토 후 빠른 시일 내에 답변드리겠습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-page">
      <div className="page-header">
        <h1>의견 보내기</h1>
        <p>YOY 지갑을 더 좋게 만들어 주세요</p>
      </div>

      {/* 피드백 유형 선택 */}
      <div className="feedback-types">
        <h3>피드백 유형</h3>
        <div className="type-buttons">
          {feedbackTypes.map(type => (
            <button
              key={type.id}
              className={`type-button ${feedbackType === type.id ? 'active' : ''}`}
              onClick={() => setFeedbackType(type.id as any)}
            >
              <div className="type-icon">
                {type.icon}
              </div>
              <div className="type-info">
                <h4>{type.label}</h4>
                <p>{type.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 평점 */}
      <div className="rating-section">
        <h3>앱 만족도</h3>
        <p>YOY 지갑에 대한 전반적인 만족도를 평가해 주세요</p>
        {renderStars()}
        <p className="rating-text">
          {rating === 0 && '평점을 선택해 주세요'}
          {rating === 1 && '매우 불만족'}
          {rating === 2 && '불만족'}
          {rating === 3 && '보통'}
          {rating === 4 && '만족'}
          {rating === 5 && '매우 만족'}
        </p>
      </div>

      {/* 피드백 폼 */}
      <div className="feedback-form">
        <div className="form-group">
          <label>제목</label>
          <input
            type="text"
            placeholder="피드백 제목을 입력하세요"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>상세 내용</label>
          <textarea
            placeholder="자세한 내용을 입력해 주세요"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="form-textarea"
            rows={6}
          />
        </div>

        <div className="form-group">
          <label>연락처 이메일 (선택사항)</label>
          <input
            type="email"
            placeholder="답변 받을 이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-actions">
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={!subject.trim() || !message.trim()}
          >
            <FaPaperPlane />
            피드백 보내기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
