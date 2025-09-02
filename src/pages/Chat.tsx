import React, { useState, useEffect, useRef } from 'react';
import { FaComments, FaUsers, FaSearch, FaPaperPlane, FaEllipsisV, FaPhone, FaVideo } from 'react-icons/fa';
import './Chat.css';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  avatar?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  avatar?: string;
  isOnline: boolean;
}

const Chat: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chats' | 'rooms' | 'contacts'>('chats');
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mockChatRooms: ChatRoom[] = [
    {
      id: '1',
      name: 'YOY 커뮤니티',
      lastMessage: '안녕하세요! YOY 지갑 사용법에 대해 궁금한 점이 있습니다.',
      lastMessageTime: new Date(Date.now() - 5 * 60 * 1000),
      unreadCount: 3,
      avatar: 'https://via.placeholder.com/40x40/ffd700/000000?text=Y',
      isOnline: true
    },
    {
      id: '2',
      name: '암호화폐 투자자들',
      lastMessage: '오늘 시장 상황이 어떠신가요?',
      lastMessageTime: new Date(Date.now() - 15 * 60 * 1000),
      unreadCount: 0,
      avatar: 'https://via.placeholder.com/40x40/007bff/ffffff?text=C',
      isOnline: false
    },
    {
      id: '3',
      name: '개발자 팀',
      lastMessage: '새로운 기능 개발이 완료되었습니다.',
      lastMessageTime: new Date(Date.now() - 30 * 60 * 1000),
      unreadCount: 1,
      avatar: 'https://via.placeholder.com/40x40/28a745/ffffff?text=D',
      isOnline: true
    }
  ];

  const mockMessages: Message[] = [
    {
      id: '1',
      sender: 'YOY 커뮤니티',
      content: '안녕하세요! YOY 지갑 사용법에 대해 궁금한 점이 있습니다.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isOwn: false,
      avatar: 'https://via.placeholder.com/40x40/ffd700/000000?text=Y'
    },
    {
      id: '2',
      sender: '나',
      content: '안녕하세요! 어떤 부분이 궁금하신가요?',
      timestamp: new Date(Date.now() - 4 * 60 * 1000),
      isOwn: true
    },
    {
      id: '3',
      sender: 'YOY 커뮤니티',
      content: '지갑 생성 후 백업을 어떻게 해야 하는지 모르겠어요.',
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      isOwn: false,
      avatar: 'https://via.placeholder.com/40x40/ffd700/000000?text=Y'
    },
    {
      id: '4',
      sender: '나',
      content: '지갑 생성 시 12개 단어의 시드 문구가 나오는데, 이것을 안전한 곳에 보관하시면 됩니다.',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      isOwn: true
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mockMessages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      // 메시지 전송 로직 구현
      console.log('메시지 전송:', message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredChatRooms = mockChatRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* 채팅 목록 사이드바 */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h2>채팅</h2>
            <div className="header-actions">
              <button className="action-button">
                <FaUsers />
              </button>
              <button className="action-button">
                <FaEllipsisV />
              </button>
            </div>
          </div>

          {/* 검색바 */}
          <div className="search-container">
            <div className="search-input">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="채팅 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'chats' ? 'active' : ''}`}
              onClick={() => setActiveTab('chats')}
            >
              채팅
            </button>
            <button
              className={`tab-button ${activeTab === 'rooms' ? 'active' : ''}`}
              onClick={() => setActiveTab('rooms')}
            >
              채팅방
            </button>
            <button
              className={`tab-button ${activeTab === 'contacts' ? 'active' : ''}`}
              onClick={() => setActiveTab('contacts')}
            >
              연락처
            </button>
          </div>

          {/* 채팅 목록 */}
          <div className="chat-list">
            {filteredChatRooms.map(room => (
              <div
                key={room.id}
                className={`chat-item ${selectedChat?.id === room.id ? 'active' : ''}`}
                onClick={() => setSelectedChat(room)}
              >
                <div className="chat-avatar">
                  <img src={room.avatar} alt={room.name} />
                  <span className={`online-status ${room.isOnline ? 'online' : 'offline'}`}></span>
                </div>
                <div className="chat-info">
                  <div className="chat-header">
                    <h4>{room.name}</h4>
                    <span className="chat-time">
                      {room.lastMessageTime.toLocaleTimeString('ko-KR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="chat-preview">
                    <p>{room.lastMessage}</p>
                    {room.unreadCount > 0 && (
                      <span className="unread-badge">{room.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 채팅 메인 영역 */}
        <div className="chat-main">
          {selectedChat ? (
            <>
              {/* 채팅 헤더 */}
              <div className="chat-header">
                <div className="chat-user-info">
                  <img src={selectedChat.avatar} alt={selectedChat.name} className="user-avatar" />
                  <div className="user-details">
                    <h3>{selectedChat.name}</h3>
                    <span className={`user-status ${selectedChat.isOnline ? 'online' : 'offline'}`}>
                      {selectedChat.isOnline ? '온라인' : '오프라인'}
                    </span>
                  </div>
                </div>
                <div className="chat-actions">
                  <button className="action-button">
                    <FaPhone />
                  </button>
                  <button className="action-button">
                    <FaVideo />
                  </button>
                  <button className="action-button">
                    <FaEllipsisV />
                  </button>
                </div>
              </div>

              {/* 메시지 영역 */}
              <div className="messages-container">
                <div className="messages-list">
                  {mockMessages.map(msg => (
                    <div key={msg.id} className={`message ${msg.isOwn ? 'own' : 'other'}`}>
                      {!msg.isOwn && (
                        <img src={msg.avatar} alt={msg.sender} className="message-avatar" />
                      )}
                      <div className="message-content">
                        <div className="message-bubble">
                          <p>{msg.content}</p>
                        </div>
                        <span className="message-time">
                          {msg.timestamp.toLocaleTimeString('ko-KR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* 메시지 입력 */}
              <div className="message-input-container">
                <div className="message-input-wrapper">
                  <textarea
                    className="message-input"
                    placeholder="메시지를 입력하세요..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows={1}
                  />
                  <button
                    className="send-button"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* 채팅 선택 안됨 상태 */
            <div className="no-chat-selected">
              <div className="no-chat-content">
                <FaComments size={64} />
                <h3>채팅을 선택하세요</h3>
                <p>왼쪽에서 채팅방을 선택하여 대화를 시작하세요</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
