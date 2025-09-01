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

  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'coins' | 'analytics' | 'settings'>('dashboard');
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingCoin, setEditingCoin] = useState<string | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<string | null>(null);
  const [searchSymbol, setSearchSymbol] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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
      const coinData = {
        symbol: coinFormData.symbol,
        name: coinFormData.name,
        contractAddress: coinFormData.contractAddress,
        network: coinFormData.network,
        decimals: coinFormData.decimals,
        totalSupply: coinFormData.totalSupply,
        isActive: coinFormData.isActive,
        logoUrl: coinFormData.logoUrl || undefined,
      };

      console.log('코인 추가/수정 데이터:', coinData); // 디버깅

      if (editingCoin) {
        await updateCoin(editingCoin, coinData);
        toast.success('코인이 업데이트되었습니다.');
      } else {
        await addCoin(coinData);
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
      toast.error('코인 추가/수정에 실패했습니다.');
    }
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
    <div className="admin-page">
      <div className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <h1>관리자 패널</h1>
            <p>시스템 관리 및 모니터링</p>
          </div>
          <div className="header-right">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              <FaArrowLeft />
              사용자 환경으로 돌아가기
            </button>
          </div>
        </div>
      </div>

      <div className="admin-navigation">
        <button 
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <FaChartLine />
          대시보드
        </button>
        <button 
          className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FaUsers />
          관리자
        </button>
        <button 
          className={`nav-tab ${activeTab === 'coins' ? 'active' : ''}`}
          onClick={() => setActiveTab('coins')}
        >
          <FaCoins />
          코인 관리
        </button>
        <button 
          className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <FaChartLine />
          분석
        </button>
        <button 
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <FaCog />
          설정
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'coins' && renderCoins()}
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
