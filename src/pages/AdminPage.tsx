import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserShield, FaUserCheck, FaUserTimes, FaSearch, FaFilter, FaDownload } from 'react-icons/fa';
import './AdminPage.css';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'active' | 'suspended' | 'blacklisted' | 'whitelisted';
  isAdmin: boolean;
  createdAt: string;
  lastLogin: string;
}

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'users' | 'blacklist' | 'whitelist'>('users');

  const mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@yooyland.com',
      firstName: '관리자',
      lastName: '김',
      status: 'active',
      isAdmin: true,
      createdAt: '2024-01-01',
      lastLogin: '2024-12-19 15:30'
    },
    {
      id: '2',
      email: 'user1@example.com',
      firstName: '사용자',
      lastName: '이',
      status: 'active',
      isAdmin: false,
      createdAt: '2024-01-15',
      lastLogin: '2024-12-19 14:20'
    },
    {
      id: '3',
      email: 'user2@example.com',
      firstName: '사용자',
      lastName: '박',
      status: 'blacklisted',
      isAdmin: false,
      createdAt: '2024-02-01',
      lastLogin: '2024-12-18 10:15'
    },
    {
      id: '4',
      email: 'user3@example.com',
      firstName: '사용자',
      lastName: '최',
      status: 'whitelisted',
      isAdmin: false,
      createdAt: '2024-02-15',
      lastLogin: '2024-12-19 12:45'
    }
  ];

  useEffect(() => {
    setUsers(mockUsers);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const updateUserStatus = (userId: string, newStatus: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, status: newStatus as any } : user
      )
    );
  };

  const exportUsers = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Email,FirstName,LastName,Status,IsAdmin,CreatedAt,LastLogin\n" +
      filteredUsers.map(user => 
        `${user.id},${user.email},${user.firstName},${user.lastName},${user.status},${user.isAdmin},${user.createdAt},${user.lastLogin}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'suspended': return 'orange';
      case 'blacklisted': return 'red';
      case 'whitelisted': return 'blue';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '활성';
      case 'suspended': return '정지';
      case 'blacklisted': return '블랙리스트';
      case 'whitelisted': return '화이트리스트';
      default: return status;
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>관리자 페이지</h1>
        <p>사용자 관리 및 시스템 모니터링</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FaUsers />
          전체 사용자
        </button>
        <button
          className={`tab-button ${activeTab === 'blacklist' ? 'active' : ''}`}
          onClick={() => setActiveTab('blacklist')}
        >
          <FaUserTimes />
          블랙리스트
        </button>
        <button
          className={`tab-button ${activeTab === 'whitelist' ? 'active' : ''}`}
          onClick={() => setActiveTab('whitelist')}
        >
          <FaUserCheck />
          화이트리스트
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="controls-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="사용자 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <FaFilter className="filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">전체 상태</option>
            <option value="active">활성</option>
            <option value="suspended">정지</option>
            <option value="blacklisted">블랙리스트</option>
            <option value="whitelisted">화이트리스트</option>
          </select>
        </div>

        <button className="export-button" onClick={exportUsers}>
          <FaDownload />
          내보내기
        </button>
      </div>

      {/* 사용자 목록 */}
      <div className="users-section">
        <div className="section-header">
          <h3>사용자 목록 ({filteredUsers.length}명)</h3>
        </div>

        <div className="users-table">
          <div className="table-header">
            <div className="header-cell">ID</div>
            <div className="header-cell">이름</div>
            <div className="header-cell">이메일</div>
            <div className="header-cell">상태</div>
            <div className="header-cell">권한</div>
            <div className="header-cell">가입일</div>
            <div className="header-cell">마지막 로그인</div>
            <div className="header-cell">액션</div>
          </div>

          {filteredUsers.map(user => (
            <div key={user.id} className="table-row">
              <div className="table-cell">{user.id}</div>
              <div className="table-cell">{user.firstName} {user.lastName}</div>
              <div className="table-cell">{user.email}</div>
              <div className="table-cell">
                <span className={`status-badge ${getStatusColor(user.status)}`}>
                  {getStatusText(user.status)}
                </span>
              </div>
              <div className="table-cell">
                {user.isAdmin ? (
                  <span className="admin-badge">관리자</span>
                ) : (
                  <span className="user-badge">일반사용자</span>
                )}
              </div>
              <div className="table-cell">{user.createdAt}</div>
              <div className="table-cell">{user.lastLogin}</div>
              <div className="table-cell actions">
                <select
                  value={user.status}
                  onChange={(e) => updateUserStatus(user.id, e.target.value)}
                  className="status-select"
                >
                  <option value="active">활성</option>
                  <option value="suspended">정지</option>
                  <option value="blacklisted">블랙리스트</option>
                  <option value="whitelisted">화이트리스트</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 통계 정보 */}
      <div className="stats-section">
        <h3>시스템 통계</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <h4>전체 사용자</h4>
            <span className="stat-number">{users.length}</span>
          </div>
          <div className="stat-card">
            <h4>활성 사용자</h4>
            <span className="stat-number">{users.filter(u => u.status === 'active').length}</span>
          </div>
          <div className="stat-card">
            <h4>블랙리스트</h4>
            <span className="stat-number">{users.filter(u => u.status === 'blacklisted').length}</span>
          </div>
          <div className="stat-card">
            <h4>화이트리스트</h4>
            <span className="stat-number">{users.filter(u => u.status === 'whitelisted').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
