import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { getCoinInfoWithLogo } from '../utils/upbitApi';
import { 
  FaUsers, 
  FaCoins, 
  FaChartLine, 
  FaShieldAlt, 
  FaCog, 
  FaPlus, 
  FaEdit, 
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaUserPlus,
  FaUserMinus,
  FaDatabase,
  FaFileAlt,
  FaBell,
  FaArrowLeft,
  FaUpload,
  FaSearch
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Admin.css';

interface CoinFormData {
  symbol: string;
  name: string;
  contractAddress: string;
  network: string;
  decimals: number;
  totalSupply: string;
  isActive: boolean;
  logoUrl?: string;
  logoFile?: File;
}

interface AdminFormData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'super_admin';
}

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  status: 'active' | 'blacklisted' | 'whitelisted';
  createdAt: string;
  lastLogin?: string;
}

interface BlacklistEntry {
  id: string;
  address: string;
  reason: string;
  addedBy: 'VP' | 'Valp';
  addedAt: string;
  status: 'active' | 'removed';
  requestType?: 'blacklist_add' | 'blacklist_remove' | 'whitelist_recovery';
  requestStatus?: 'pending' | 'approved' | 'rejected';
  requestedBy?: string; // 요청한 사용자
  requestReason?: string; // 요청 사유
}

interface GovernanceRequest {
  id: string;
  type: 'blacklist_add' | 'blacklist_remove' | 'whitelist_recovery';
  address: string;
  reason: string;
  requestedBy: string;
  requestStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedBy?: string; // Valp가 처리한 경우
  processedAt?: string;
  notes?: string; // Valp의 처리 노트
}

const Admin: React.FC = () => {
  const { user } = useAuth();
  const { 
    adminUsers, 
    adminCoins, 
    addAdmin, 
    removeAdmin, 
    addCoin, 
    updateCoin, 
    removeCoin, 
    toggleCoinStatus,
    isLoading 
  } = useAdmin();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'user-management' | 'coins' | 'analytics' | 'settings' | 'blacklist' | 'governance-requests'>('dashboard');
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [editingCoin, setEditingCoin] = useState<string | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [searchSymbol, setSearchSymbol] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // 모의 사용자 데이터
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'admin@yooyland.com',
      username: 'admin',
      firstName: '관리자',
      lastName: '시스템',
      isAdmin: true,
      status: 'whitelisted',
      createdAt: '2024-01-01T00:00:00Z',
      lastLogin: '2024-12-19T10:00:00Z'
    },
    {
      id: '2',
      email: 'jch4389@gmail.com',
      username: 'jch4389',
      firstName: '정창훈',
      lastName: '개발자',
      isAdmin: false,
      status: 'active',
      createdAt: '2024-01-15T00:00:00Z',
      lastLogin: '2024-12-19T09:30:00Z'
    },
    {
      id: '3',
      email: 'agosky@naver.com',
      username: 'agosky',
      firstName: '아고스키',
      lastName: '사용자',
      isAdmin: false,
      status: 'active',
      createdAt: '2024-02-01T00:00:00Z',
      lastLogin: '2024-12-19T08:45:00Z'
    }
  ]);

  // 모의 블랙리스트 데이터
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([
    {
      id: '1',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      reason: '의심스러운 거래 패턴',
      addedBy: 'VP',
      addedAt: '2024-12-15T00:00:00Z',
      status: 'active'
    },
    {
      id: '2',
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      reason: '스팸 계정',
      addedBy: 'Valp',
      addedAt: '2024-12-18T00:00:00Z',
      status: 'active'
    }
  ]);

  // 모의 거버넌스 요청 데이터
  const [governanceRequests, setGovernanceRequests] = useState<GovernanceRequest[]>([
    {
      id: '1',
      type: 'whitelist_recovery',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      reason: '의심스러운 거래 패턴이 해결되었습니다.',
      requestedBy: 'jch4389@gmail.com',
      requestStatus: 'pending',
      createdAt: '2024-12-19T09:00:00Z'
    },
    {
      id: '2',
      type: 'blacklist_add',
      address: '0x9876543210fedcba9876543210fedcba98765432',
      reason: '새로운 스팸 계정 발견',
      requestedBy: 'agosky@naver.com',
      requestStatus: 'pending',
      createdAt: '2024-12-19T10:00:00Z'
    }
  ]);

  const [coinFormData, setCoinFormData] = useState<CoinFormData>({
    symbol: '',
    name: '',
    contractAddress: '',
    network: 'Ethereum',
    decimals: 18,
    totalSupply: '',
    isActive: true,
    logoUrl: '',
    logoFile: undefined,
  });

  const [adminFormData, setAdminFormData] = useState<AdminFormData>({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    role: 'admin',
  });

  // 관리자 권한 확인
  if (!user?.isAdmin) {
    navigate('/');
    return null;
  }

  const handleCoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCoin) {
        await updateCoin(editingCoin, coinFormData);
        toast.success('코인이 업데이트되었습니다.');
      } else {
        await addCoin(coinFormData);
        toast.success('코인이 추가되었습니다.');
      }
      setShowCoinModal(false);
      setEditingCoin(null);
      setCoinFormData({
        symbol: '',
        name: '',
        contractAddress: '',
        network: 'Ethereum',
        decimals: 18,
        totalSupply: '',
        isActive: true,
        logoUrl: '',
        logoFile: undefined,
      });
    } catch (error) {
      toast.error('코인 처리에 실패했습니다.');
    }
  };

  // 사용자 상태 변경 함수
  const handleUserStatusChange = (userId: string, newStatus: 'active' | 'blacklisted' | 'whitelisted') => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
    
    const statusText = {
      active: '활성',
      blacklisted: '블랙리스트',
      whitelisted: '화이트리스트'
    };
    
    toast.success(`사용자 상태가 ${statusText[newStatus]}로 변경되었습니다.`);
  };

  // 블랙리스트에 주소 추가
  const handleAddToBlacklist = (address: string, reason: string, addedBy: 'VP' | 'Valp') => {
    const newEntry: BlacklistEntry = {
      id: Date.now().toString(),
      address,
      reason,
      addedBy,
      addedAt: new Date().toISOString(),
      status: 'active'
    };
    
    setBlacklist(prev => [...prev, newEntry]);
    toast.success('주소가 블랙리스트에 추가되었습니다.');
  };

  // 블랙리스트에서 주소 제거
  const handleRemoveFromBlacklist = (entryId: string) => {
    setBlacklist(prev => 
      prev.map(entry => 
        entry.id === entryId ? { ...entry, status: 'removed' } : entry
      )
    );
    toast.success('주소가 블랙리스트에서 제거되었습니다.');
  };

  // 화이트리스트에 주소 추가
  const handleAddToWhitelist = (address: string) => {
    // 블랙리스트에서 제거
    setBlacklist(prev => 
      prev.map(entry => 
        entry.address.toLowerCase() === address.toLowerCase() 
          ? { ...entry, status: 'removed' } 
          : entry
      )
    );
    
    // 사용자 상태를 화이트리스트로 변경 (해당 이메일을 가진 사용자가 있는 경우)
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.email.toLowerCase().includes(address.toLowerCase()) || 
        user.username.toLowerCase().includes(address.toLowerCase())
          ? { ...user, status: 'whitelisted' }
          : user
      )
    );
    
    toast.success('주소가 화이트리스트에 추가되었습니다.');
  };

  // VP 자동 블랙리스트 추가 (시스템 이벤트)
  const handleVPAutoBlacklist = (address: string, reason: string) => {
    const newEntry: BlacklistEntry = {
      id: Date.now().toString(),
      address,
      reason,
      addedBy: 'VP',
      addedAt: new Date().toISOString(),
      status: 'active'
    };
    
    setBlacklist(prev => [...prev, newEntry]);
    
    // VP 시스템 메시지 표시
    toast.success(`VP가 주소 ${address.substring(0, 10)}...를 블랙리스트에 자동 추가했습니다.`, {
      duration: 5000,
      icon: '🤖'
    });
  };

  // Valp가 거버넌스 요청 승인/거절
  const handleGovernanceRequest = (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    setGovernanceRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              requestStatus: action === 'approve' ? 'approved' : 'rejected',
              processedBy: user?.email || 'Valp',
              processedAt: new Date().toISOString(),
              notes
            }
          : request
      )
    );

    const request = governanceRequests.find(r => r.id === requestId);
    if (request) {
      if (action === 'approve') {
        // 요청 승인 시 실제 처리
        if (request.type === 'whitelist_recovery') {
          handleAddToWhitelist(request.address);
        } else if (request.type === 'blacklist_add') {
          handleAddToBlacklist(request.address, request.reason, 'Valp');
        }
        toast.success('거버넌스 요청이 승인되었습니다.');
      } else {
        toast.error('거버넌스 요청이 거절되었습니다.');
      }
    }
  };

  // 새로운 거버넌스 요청 생성
  const handleCreateGovernanceRequest = (type: 'blacklist_add' | 'blacklist_remove' | 'whitelist_recovery', address: string, reason: string) => {
    const newRequest: GovernanceRequest = {
      id: Date.now().toString(),
      type,
      address,
      reason,
      requestedBy: user?.email || 'unknown',
      requestStatus: 'pending',
      createdAt: new Date().toISOString()
    };
    
    setGovernanceRequests(prev => [...prev, newRequest]);
    toast.success('거버넌스 요청이 생성되었습니다. Valp의 승인을 기다립니다.');
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAdmin(adminFormData);
      toast.success('관리자가 추가되었습니다.');
      setShowAdminModal(false);
      setAdminFormData({
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        role: 'admin',
      });
    } catch (error) {
      toast.error('관리자 추가에 실패했습니다.');
    }
  };

  const handleEditCoin = (coinId: string) => {
    const coin = adminCoins.find(c => c.id === coinId);
    if (coin) {
      setCoinFormData({
        symbol: coin.symbol,
        name: coin.name,
        contractAddress: coin.contractAddress,
        network: coin.network,
        decimals: coin.decimals,
        totalSupply: coin.totalSupply,
        isActive: coin.isActive,
        logoUrl: coin.logoUrl || '',
        logoFile: undefined,
      });
      setEditingCoin(coinId);
      setShowCoinModal(true);
    }
  };

  const handleDeleteCoin = async (coinId: string) => {
    if (window.confirm('정말로 이 코인을 삭제하시겠습니까?')) {
      try {
        await removeCoin(coinId);
        toast.success('코인이 삭제되었습니다.');
      } catch (error) {
        toast.error('코인 삭제에 실패했습니다.');
      }
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (window.confirm('정말로 이 관리자를 삭제하시겠습니까?')) {
      try {
        await removeAdmin(adminId);
        toast.success('관리자가 삭제되었습니다.');
      } catch (error) {
        toast.error('관리자 삭제에 실패했습니다.');
      }
    }
  };

  // 코인 심볼로 업비트 정보 검색
  const handleSearchSymbol = async () => {
    if (!searchSymbol.trim()) {
      toast.error('코인 심볼을 입력해주세요.');
      return;
    }

    setIsSearching(true);
    try {
      const coinInfo = await getCoinInfoWithLogo(searchSymbol.toUpperCase());
      
      if (coinInfo) {
        setCoinFormData(prev => ({
          ...prev,
          symbol: searchSymbol.toUpperCase(),
          name: coinInfo.koreanName || coinInfo.englishName,
          logoUrl: coinInfo.logoUrl, // 업비트에서 가져온 로고 URL 우선 사용
          logoFile: undefined, // 업로드된 파일은 초기화
        }));
        toast.success(`${coinInfo.koreanName} 정보를 가져왔습니다.`);
      } else {
        toast.error('해당 코인을 찾을 수 없습니다.');
      }
    } catch (error) {
      toast.error('코인 정보 검색에 실패했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  // 로고 파일 업로드 처리 (업비트 로고보다 우선순위 낮음)
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB 제한
        toast.error('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('이미지 파일만 업로드 가능합니다.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setCoinFormData(prev => ({
          ...prev,
          logoFile: file,
          logoUrl: e.target?.result as string, // 업로드된 로고로 덮어쓰기
        }));
        toast.success('로고가 업로드되었습니다.');
      };
      reader.readAsDataURL(file);
    }
  };

  const renderDashboard = () => (
    <div className="admin-dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>총 관리자</h3>
            <p className="stat-number">{adminUsers.length}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaCoins />
          </div>
          <div className="stat-content">
            <h3>등록된 코인</h3>
            <p className="stat-number">{adminCoins.length}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaToggleOn />
          </div>
          <div className="stat-content">
            <h3>활성 코인</h3>
            <p className="stat-number">{adminCoins.filter(c => c.isActive).length}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>시스템 상태</h3>
            <p className="stat-status">정상</p>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>최근 활동</h3>
        <div className="activity-list">
          <div className="activity-item">
            <FaCoins className="activity-icon" />
            <div className="activity-content">
              <p>새로운 코인이 추가되었습니다</p>
              <span className="activity-time">방금 전</span>
            </div>
          </div>
          <div className="activity-item">
            <FaUsers className="activity-icon" />
            <div className="activity-content">
              <p>관리자 권한이 업데이트되었습니다</p>
              <span className="activity-time">5분 전</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="admin-users">
      <div className="section-header">
        <h2>관리자 관리</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAdminModal(true)}
        >
          <FaUserPlus />
          관리자 추가
        </button>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>이름</th>
              <th>이메일</th>
              <th>역할</th>
              <th>등록일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map(admin => (
              <tr key={admin.id}>
                <td>{admin.firstName} {admin.lastName}</td>
                <td>{admin.email}</td>
                <td>
                  <span className={`role-badge ${admin.role}`}>
                    {admin.role === 'super_admin' ? '슈퍼 관리자' : '관리자'}
                  </span>
                </td>
                <td>{new Date(admin.createdAt).toLocaleDateString('ko-KR')}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteAdmin(admin.id)}
                      disabled={admin.role === 'super_admin'}
                    >
                      <FaUserMinus />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // 일반 사용자 관리 탭
  const renderUserManagement = () => (
    <div className="user-management">
      <div className="section-header">
        <h2>사용자 관리</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="사용자 검색..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
          />
          <FaSearch className="search-icon" />
        </div>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>이름</th>
              <th>사용자명</th>
              <th>이메일</th>
              <th>상태</th>
              <th>가입일</th>
              <th>마지막 로그인</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter(user => 
                user.email.toLowerCase().includes(searchUser.toLowerCase()) ||
                user.username.toLowerCase().includes(searchUser.toLowerCase()) ||
                user.firstName.toLowerCase().includes(searchUser.toLowerCase()) ||
                user.lastName.toLowerCase().includes(searchUser.toLowerCase())
              )
              .map(user => (
                <tr key={user.id}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`status-badge ${user.status}`}>
                      {user.status === 'active' ? '활성' : 
                       user.status === 'blacklisted' ? '블랙리스트' : '화이트리스트'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('ko-KR')}</td>
                  <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ko-KR') : '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <select
                        value={user.status}
                        onChange={(e) => handleUserStatusChange(user.id, e.target.value as any)}
                        className="status-select"
                      >
                        <option value="active">활성</option>
                        <option value="blacklisted">블랙리스트</option>
                        <option value="whitelisted">화이트리스트</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // 블랙리스트 관리 탭
  const renderBlacklistManagement = () => (
    <div className="blacklist-management">
      <div className="section-header">
        <h2>블랙리스트/화이트리스트 관리</h2>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowBlacklistModal(true)}
          >
            <FaUserMinus />
            블랙리스트 추가
          </button>
          <button 
            className="btn btn-success"
            onClick={() => handleVPAutoBlacklist('0x' + Math.random().toString(36).substr(2, 40), 'VP 자동 감지 테스트')}
          >
            🤖 VP 테스트
          </button>
        </div>
      </div>

      <div className="blacklist-table">
        <table>
          <thead>
            <tr>
              <th>주소/이메일</th>
              <th>사유</th>
              <th>추가자</th>
              <th>추가일</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {blacklist
              .filter(entry => entry.status === 'active')
              .map(entry => (
                <tr key={entry.id}>
                  <td>{entry.address}</td>
                  <td>{entry.reason}</td>
                  <td>
                    <span className={`authority-badge ${entry.addedBy}`}>
                      {entry.addedBy === 'VP' ? 'VP (자동)' : 'Valp (수동)'}
                    </span>
                  </td>
                  <td>{new Date(entry.addedAt).toLocaleDateString('ko-KR')}</td>
                  <td>
                    <span className="status-badge active">활성</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => handleAddToWhitelist(entry.address)}
                        title="화이트리스트로 이동"
                      >
                        <FaUserPlus />
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveFromBlacklist(entry.id)}
                        title="블랙리스트에서 제거"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // 거버넌스 요청 관리 탭
  const renderGovernanceRequests = () => (
    <div className="governance-requests">
      <div className="section-header">
        <h2>거버넌스 요청 관리 (Valp 전용)</h2>
        <p className="section-description">
          VP 자동 결정과 사용자 요청을 Valp가 검증하고 승인/거절합니다.
        </p>
      </div>

      <div className="requests-grid">
        <div className="pending-requests">
          <h3>승인 대기중인 요청</h3>
          <div className="request-list">
            {governanceRequests
              .filter(request => request.requestStatus === 'pending')
              .map(request => (
                <div key={request.id} className="request-card pending">
                  <div className="request-header">
                    <span className={`request-type ${request.type}`}>
                      {request.type === 'blacklist_add' ? '🚫 블랙리스트 추가' :
                       request.type === 'blacklist_remove' ? '✅ 블랙리스트 제거' :
                       '🔄 화이트리스트 복구'}
                    </span>
                    <span className="request-status pending">승인 대기</span>
                  </div>
                  
                  <div className="request-content">
                    <div className="request-info">
                      <p><strong>주소:</strong> {request.address}</p>
                      <p><strong>사유:</strong> {request.reason}</p>
                      <p><strong>요청자:</strong> {request.requestedBy}</p>
                      <p><strong>요청일:</strong> {new Date(request.createdAt).toLocaleDateString('ko-KR')}</p>
                    </div>
                    
                    <div className="request-actions">
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => handleGovernanceRequest(request.id, 'approve')}
                      >
                        ✅ 승인
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleGovernanceRequest(request.id, 'reject')}
                      >
                        ❌ 거절
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            
            {governanceRequests.filter(r => r.requestStatus === 'pending').length === 0 && (
              <div className="no-requests">
                <p>승인 대기중인 요청이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        <div className="processed-requests">
          <h3>처리된 요청</h3>
          <div className="request-list">
            {governanceRequests
              .filter(request => request.requestStatus !== 'pending')
              .map(request => (
                <div key={request.id} className={`request-card ${request.requestStatus}`}>
                  <div className="request-header">
                    <span className={`request-type ${request.type}`}>
                      {request.type === 'blacklist_add' ? '🚫 블랙리스트 추가' :
                       request.type === 'blacklist_remove' ? '✅ 블랙리스트 제거' :
                       '🔄 화이트리스트 복구'}
                    </span>
                    <span className={`request-status ${request.requestStatus}`}>
                      {request.requestStatus === 'approved' ? '승인됨' : '거절됨'}
                    </span>
                  </div>
                  
                  <div className="request-content">
                    <div className="request-info">
                      <p><strong>주소:</strong> {request.address}</p>
                      <p><strong>사유:</strong> {request.reason}</p>
                      <p><strong>요청자:</strong> {request.requestedBy}</p>
                      <p><strong>처리자:</strong> {request.processedBy}</p>
                      <p><strong>처리일:</strong> {request.processedAt ? new Date(request.processedAt).toLocaleDateString('ko-KR') : '-'}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCoins = () => (
    <div className="admin-coins">
      <div className="section-header">
        <h2>코인 관리</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCoinModal(true)}
        >
          <FaPlus />
          코인 추가
        </button>
      </div>

      <div className="coins-table">
        <table>
          <thead>
            <tr>
              <th>로고</th>
              <th>심볼</th>
              <th>이름</th>
              <th>네트워크</th>
              <th>상태</th>
              <th>등록일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {adminCoins.map(coin => (
              <tr key={coin.id}>
                <td>
                  {coin.logoUrl ? (
                    <img 
                      src={coin.logoUrl} 
                      alt={`${coin.symbol} logo`} 
                      className="coin-logo"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="coin-logo-placeholder">
                      {coin.symbol.charAt(0)}
                    </div>
                  )}
                </td>
                <td>{coin.symbol}</td>
                <td>{coin.name}</td>
                <td>{coin.network}</td>
                <td>
                  <button
                    className={`status-toggle-small ${coin.isActive ? 'active' : 'inactive'}`}
                    onClick={() => toggleCoinStatus(coin.id)}
                    title={coin.isActive ? '활성' : '비활성'}
                  >
                    {coin.isActive ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </td>
                <td>{new Date(coin.createdAt).toLocaleDateString('ko-KR')}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEditCoin(coin.id)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteCoin(coin.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="admin-analytics">
      <h2>분석 및 통계</h2>
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>사용자 통계</h3>
          <div className="analytics-content">
            <p>총 사용자: 1,234명</p>
            <p>활성 사용자: 987명</p>
            <p>신규 가입: 45명 (이번 주)</p>
          </div>
        </div>
        
        <div className="analytics-card">
          <h3>거래 통계</h3>
          <div className="analytics-content">
            <p>총 거래량: $2,345,678</p>
            <p>일일 거래량: $12,345</p>
            <p>평균 거래 금액: $567</p>
          </div>
        </div>
        
        <div className="analytics-card">
          <h3>시스템 통계</h3>
          <div className="analytics-content">
            <p>서버 응답 시간: 45ms</p>
            <p>업타임: 99.9%</p>
            <p>에러율: 0.01%</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="admin-settings">
      <h2>시스템 설정</h2>
      <div className="settings-grid">
        <div className="setting-card">
          <h3>일반 설정</h3>
          <div className="setting-item">
            <label>시스템 이름</label>
            <input type="text" defaultValue="YOY Wallet" />
          </div>
          <div className="setting-item">
            <label>시스템 버전</label>
            <input type="text" defaultValue="1.0.0" disabled />
          </div>
        </div>
        
        <div className="setting-card">
          <h3>보안 설정</h3>
          <div className="setting-item">
            <label>관리자 세션 타임아웃</label>
            <select defaultValue="30">
              <option value="15">15분</option>
              <option value="30">30분</option>
              <option value="60">1시간</option>
            </select>
          </div>
          <div className="setting-item">
            <label>2단계 인증 필수</label>
            <input type="checkbox" defaultChecked />
          </div>
        </div>
        
        <div className="setting-card">
          <h3>알림 설정</h3>
          <div className="setting-item">
            <label>시스템 알림</label>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="setting-item">
            <label>에러 알림</label>
            <input type="checkbox" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <FaArrowLeft />
          뒤로 가기
        </button>
        <h1>관리자 패널</h1>
        <p>YOY Wallet 시스템 관리</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <FaChartLine />
          대시보드
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FaUsers />
          관리자
        </button>
        <button 
          className={`tab ${activeTab === 'user-management' ? 'active' : ''}`}
          onClick={() => setActiveTab('user-management')}
        >
          <FaUsers />
          사용자 관리
        </button>
        <button 
          className={`tab ${activeTab === 'coins' ? 'active' : ''}`}
          onClick={() => setActiveTab('coins')}
        >
          <FaCoins />
          코인 관리
        </button>
        <button 
          className={`tab ${activeTab === 'blacklist' ? 'active' : ''}`}
          onClick={() => setActiveTab('blacklist')}
        >
          <FaShieldAlt />
          블랙리스트
        </button>
        <button 
          className={`tab ${activeTab === 'governance-requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('governance-requests')}
        >
          <FaDatabase />
          거버넌스 요청
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <FaChartLine />
          분석
        </button>
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <FaCog />
          설정
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="tab-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'user-management' && renderUserManagement()}
        {activeTab === 'coins' && renderCoins()}
        {activeTab === 'blacklist' && renderBlacklistManagement()}
        {activeTab === 'governance-requests' && renderGovernanceRequests()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'settings' && renderSettings()}
      </div>

      {/* 코인 추가/수정 모달 */}
      {showCoinModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingCoin ? '코인 수정' : '코인 추가'}</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowCoinModal(false);
                  setEditingCoin(null);
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCoinSubmit}>
              <div className="form-group">
                <label>코인 심볼 검색 (업비트 자동 연동)</label>
                <div className="search-group">
                  <input
                    type="text"
                    placeholder="코인 심볼 입력 (예: BTC, ETH)"
                    value={searchSymbol}
                    onChange={(e) => setSearchSymbol(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={handleSearchSymbol}
                    disabled={isSearching}
                  >
                    {isSearching ? '검색 중...' : <FaSearch />}
                  </button>
                </div>
                <small className="form-help">업비트에서 코인 정보와 로고를 자동으로 가져옵니다.</small>
              </div>
              
              <div className="form-group">
                <label>로고 (업로드 우선)</label>
                <div className="logo-upload-section">
                  {coinFormData.logoUrl && (
                    <div className="logo-preview">
                      <img 
                        src={coinFormData.logoUrl} 
                        alt="로고 미리보기" 
                        className="logo-preview-img"
                      />
                      <div className="logo-source">
                        {coinFormData.logoFile ? '업로드된 로고' : '업비트 로고'}
                      </div>
                    </div>
                  )}
                  <div className="logo-upload-controls">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      id="logo-upload"
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="logo-upload" className="btn btn-secondary">
                      <FaUpload />
                      로고 업로드
                    </label>
                    {coinFormData.logoUrl && (
                      <button 
                        type="button" 
                        className="btn btn-danger btn-sm"
                        onClick={() => setCoinFormData({...coinFormData, logoUrl: '', logoFile: undefined})}
                      >
                        제거
                      </button>
                    )}
                  </div>
                  <small className="form-help">업로드한 로고가 업비트 로고보다 우선적으로 사용됩니다.</small>
                </div>
              </div>

              <div className="form-group">
                <label>심볼 *</label>
                <input
                  type="text"
                  value={coinFormData.symbol}
                  onChange={(e) => setCoinFormData({...coinFormData, symbol: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>이름 *</label>
                <input
                  type="text"
                  value={coinFormData.name}
                  onChange={(e) => setCoinFormData({...coinFormData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>컨트랙트 주소 *</label>
                <input
                  type="text"
                  value={coinFormData.contractAddress}
                  onChange={(e) => setCoinFormData({...coinFormData, contractAddress: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>네트워크 *</label>
                <select
                  value={coinFormData.network}
                  onChange={(e) => setCoinFormData({...coinFormData, network: e.target.value})}
                >
                  <option value="Ethereum">Ethereum</option>
                  <option value="BSC">BSC</option>
                  <option value="Polygon">Polygon</option>
                </select>
              </div>
              <div className="form-group">
                <label>소수점 자리수 *</label>
                <input
                  type="number"
                  value={coinFormData.decimals}
                  onChange={(e) => setCoinFormData({...coinFormData, decimals: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className="form-group">
                <label>총 발행량 *</label>
                <input
                  type="text"
                  value={coinFormData.totalSupply}
                  onChange={(e) => setCoinFormData({...coinFormData, totalSupply: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>활성화 상태</label>
                <select
                  value={coinFormData.isActive ? 'true' : 'false'}
                  onChange={(e) => setCoinFormData({...coinFormData, isActive: e.target.value === 'true'})}
                >
                  <option value="true">활성</option>
                  <option value="false">비활성</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCoinModal(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? '처리 중...' : (editingCoin ? '수정' : '추가')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 관리자 추가 모달 */}
      {showAdminModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>관리자 추가</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAdminModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAdminSubmit}>
              <div className="form-group">
                <label>이메일 *</label>
                <input
                  type="email"
                  value={adminFormData.email}
                  onChange={(e) => setAdminFormData({...adminFormData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>사용자명 *</label>
                <input
                  type="text"
                  value={adminFormData.username}
                  onChange={(e) => setAdminFormData({...adminFormData, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>이름 *</label>
                <input
                  type="text"
                  value={adminFormData.firstName}
                  onChange={(e) => setAdminFormData({...adminFormData, firstName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>성 *</label>
                <input
                  type="text"
                  value={adminFormData.lastName}
                  onChange={(e) => setAdminFormData({...adminFormData, lastName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>역할 *</label>
                <select
                  value={adminFormData.role}
                  onChange={(e) => setAdminFormData({...adminFormData, role: e.target.value as 'admin' | 'super_admin'})}
                >
                  <option value="admin">관리자</option>
                  <option value="super_admin">슈퍼 관리자</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdminModal(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? '처리 중...' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
