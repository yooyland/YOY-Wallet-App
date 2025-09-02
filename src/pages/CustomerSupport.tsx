import React, { useState } from 'react';
import { FaHeadset, FaEnvelope, FaPhone, FaQuestionCircle, FaBook, FaComments } from 'react-icons/fa';
import './CustomerSupport.css';

const CustomerSupport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contact' | 'faq' | 'guide'>('contact');

  const contactMethods = [
    {
      id: 'email',
      title: '이메일 문의',
      icon: <FaEnvelope />,
      description: '24시간 내 답변',
      contact: 'support@yoyland.com',
      available: '24/7'
    },
    {
      id: 'phone',
      title: '전화 문의',
      icon: <FaPhone />,
      description: '실시간 상담',
      contact: '1588-1234',
      available: '평일 09:00-18:00'
    },
    {
      id: 'chat',
      title: '라이브 채팅',
      icon: <FaComments />,
      description: '즉시 상담',
      contact: '채팅 시작',
      available: '평일 09:00-22:00'
    }
  ];

  const faqItems = [
    {
      id: 1,
      question: 'YOY 토큰이란 무엇인가요?',
      answer: 'YOY는 YooY Land 생태계의 거버넌스 토큰으로, 이더리움 기반의 ERC-20 토큰입니다.'
    },
    {
      id: 2,
      question: '지갑은 어떻게 생성하나요?',
      answer: '지갑 탭에서 "새 지갑 생성"을 클릭하고, 안전한 곳에 시드 구문을 백업하세요.'
    },
    {
      id: 3,
      question: 'PIN을 잊어버렸어요.',
      answer: '보안 설정에서 생체인증으로 PIN을 재설정하거나, 시드 구문으로 지갑을 복구할 수 있습니다.'
    },
    {
      id: 4,
      question: '거래 수수료는 얼마인가요?',
      answer: '이더리움 네트워크 수수료가 적용되며, 네트워크 상황에 따라 변동됩니다.'
    }
  ];

  const guides = [
    {
      id: 1,
      title: '시작하기 가이드',
      description: 'YOY 지갑 사용법을 단계별로 알아보세요',
      icon: <FaBook />
    },
    {
      id: 2,
      title: '보안 가이드',
      description: '지갑을 안전하게 사용하는 방법',
      icon: <FaHeadset />
    },
    {
      id: 3,
      title: 'VP/Valp 시스템',
      description: '거버넌스 시스템 이해하기',
      icon: <FaQuestionCircle />
    }
  ];

  return (
    <div className="customer-support-page">
      <div className="page-header">
        <h1>고객센터</h1>
        <p>궁금한 점이나 문제가 있으시면 언제든 문의해 주세요</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          <FaHeadset />
          문의하기
        </button>
        <button
          className={`tab-button ${activeTab === 'faq' ? 'active' : ''}`}
          onClick={() => setActiveTab('faq')}
        >
          <FaQuestionCircle />
          자주 묻는 질문
        </button>
        <button
          className={`tab-button ${activeTab === 'guide' ? 'active' : ''}`}
          onClick={() => setActiveTab('guide')}
        >
          <FaBook />
          사용 가이드
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="tab-content">
        {activeTab === 'contact' && (
          <div className="contact-section">
            <h3>문의 방법</h3>
            <div className="contact-methods">
              {contactMethods.map(method => (
                <div key={method.id} className="contact-card">
                  <div className="contact-icon">
                    {method.icon}
                  </div>
                  <div className="contact-info">
                    <h4>{method.title}</h4>
                    <p className="contact-description">{method.description}</p>
                    <p className="contact-detail">{method.contact}</p>
                    <span className="contact-hours">{method.available}</span>
                  </div>
                  <button className="contact-button">
                    문의하기
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="faq-section">
            <h3>자주 묻는 질문</h3>
            <div className="faq-list">
              {faqItems.map(item => (
                <div key={item.id} className="faq-item">
                  <h4 className="faq-question">{item.question}</h4>
                  <p className="faq-answer">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="guide-section">
            <h3>사용 가이드</h3>
            <div className="guide-list">
              {guides.map(guide => (
                <div key={guide.id} className="guide-card">
                  <div className="guide-icon">
                    {guide.icon}
                  </div>
                  <div className="guide-info">
                    <h4>{guide.title}</h4>
                    <p>{guide.description}</p>
                  </div>
                  <button className="guide-button">
                    보기
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSupport;
