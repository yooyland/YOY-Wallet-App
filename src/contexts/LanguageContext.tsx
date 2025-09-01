import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (languageCode: string) => void;
  t: (key: string) => string;
  availableLanguages: Language[];
  detectUserLanguage: () => string;
}

const availableLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
];

const translations: Translations = {
  en: {
    // Common
    'app.name': 'YOY Wallet',
    'app.subtitle': 'Safe and convenient cryptocurrency wallet',
    'app.createAccount': 'Create New Account',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.wallet': 'Wallet',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Auth
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.username': 'Username',
    'auth.firstName': 'First Name',
    'auth.lastName': 'Last Name',
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.loginSuccess': 'Login successful!',
    'auth.loginFailed': 'Login failed.',
    'auth.registerSuccess': 'Registration successful!',
    'auth.registerFailed': 'Registration failed.',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.signUp': 'Sign Up',
    'auth.signIn': 'Sign In',
    'auth.loading': 'Loading...',
    'auth.loggingIn': 'Logging in...',
    'auth.registering': 'Registering...',
    
    // Form validation
    'validation.required': 'This field is required.',
    'validation.email': 'Please enter a valid email address.',
    'validation.passwordMin': 'Password must be at least 6 characters.',
    'validation.usernameMin': 'Username must be at least 3 characters.',
    'validation.passwordMismatch': 'Passwords do not match.',
    
    // Dashboard
    'dashboard.welcome': 'Welcome to YOY Wallet',
    'dashboard.totalBalance': 'Total Balance',
    'dashboard.coins': 'My Coins',
    'dashboard.recentTransactions': 'Recent Transactions',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.send': 'Send',
    'dashboard.receive': 'Receive',
    'dashboard.buy': 'Buy',
    'dashboard.sell': 'Sell',
    
    // Wallet
    'wallet.address': 'Wallet Address',
    'wallet.copy': 'Copy',
    'wallet.qr': 'QR Code',
    'wallet.send': 'Send',
    'wallet.receive': 'Receive',
    'wallet.balance': 'Balance',
    'wallet.value': 'Value',
    'wallet.addCoin': 'Add Coin',
    
    // Profile
    'profile.edit': 'Edit Profile',
    'profile.save': 'Save Changes',
    'profile.cancel': 'Cancel',
    'profile.photo': 'Profile Photo',
    'profile.changePhoto': 'Change Photo',
    'profile.accountInfo': 'Account Information',
    'profile.memberSince': 'Member Since',
    
    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Customize your wallet experience',
    'settings.security': 'Security',
    'settings.notifications': 'Notifications',
    'settings.appSettings': 'App Settings',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.passwordChange': 'Change Password',
    'settings.dataManagement': 'Data Management',
    'settings.exportData': 'Export Data',
    'settings.importData': 'Import Data',
    'settings.deleteAccount': 'Delete Account',
    'settings.saveSettings': 'Save Settings',
    
    // Language settings
    'language.auto': 'Auto-detect',
    'language.autoDesc': 'Automatically detect language based on location',
    'language.manual': 'Manual selection',
    'language.manualDesc': 'Choose your preferred language',
  },
  ko: {
    // Common
    'app.name': 'YOY Wallet',
    'app.subtitle': '안전하고 편리한 암호화폐 지갑',
    'app.createAccount': '새로운 계정 만들기',
    
    // Navigation
    'nav.dashboard': '대시보드',
    'nav.wallet': '지갑',
    'nav.profile': '프로필',
    'nav.settings': '설정',
    'nav.logout': '로그아웃',
    
    // Auth
    'auth.email': '이메일',
    'auth.password': '비밀번호',
    'auth.confirmPassword': '비밀번호 확인',
    'auth.username': '사용자명',
    'auth.firstName': '이름',
    'auth.lastName': '성',
    'auth.login': '로그인',
    'auth.register': '회원가입',
    'auth.loginSuccess': '로그인 성공!',
    'auth.loginFailed': '로그인에 실패했습니다.',
    'auth.registerSuccess': '회원가입 성공!',
    'auth.registerFailed': '회원가입에 실패했습니다.',
    'auth.noAccount': '계정이 없으신가요?',
    'auth.hasAccount': '이미 계정이 있으신가요?',
    'auth.signUp': '회원가입',
    'auth.signIn': '로그인',
    'auth.loading': '로딩 중...',
    'auth.loggingIn': '로그인 중...',
    'auth.registering': '가입 중...',
    
    // Form validation
    'validation.required': '이 필드는 필수입니다.',
    'validation.email': '유효한 이메일 주소를 입력해주세요.',
    'validation.passwordMin': '비밀번호는 최소 6자 이상이어야 합니다.',
    'validation.usernameMin': '사용자명은 최소 3자 이상이어야 합니다.',
    'validation.passwordMismatch': '비밀번호가 일치하지 않습니다.',
    
    // Dashboard
    'dashboard.welcome': 'YOY Wallet에 오신 것을 환영합니다',
    'dashboard.totalBalance': '총 자산',
    'dashboard.coins': '내 코인',
    'dashboard.recentTransactions': '최근 거래 내역',
    'dashboard.quickActions': '빠른 액션',
    'dashboard.send': '전송',
    'dashboard.receive': '수신',
    'dashboard.buy': '구매',
    'dashboard.sell': '판매',
    
    // Wallet
    'wallet.title': '지갑',
    'wallet.description': '암호화폐 자산을 안전하게 관리하세요',
    'wallet.setup.title': '지갑 설정',
    'wallet.setup.description': '새 지갑을 생성하거나 기존 지갑을 복구하세요',
    'wallet.setup.create': '새 지갑 생성',
    'wallet.setup.restore': '지갑 복구',
    'wallet.create.title': '새 지갑 생성',
    'wallet.create.warning': '새 지갑을 생성하면 12단어 니모닉이 생성됩니다. 이를 안전한 곳에 백업하세요.',
    'wallet.create.generate': '지갑 생성',
    'wallet.mnemonic.title': '니모닉 백업',
    'wallet.mnemonic.warning': '이 12단어를 안전한 곳에 기록하고 절대 공유하지 마세요.',
    'wallet.mnemonic.show': '니모닉 보기',
    'wallet.mnemonic.hide': '니모닉 숨기기',
    'wallet.mnemonic.confirm': '확인',
    'wallet.restore.title': '지갑 복구',
    'wallet.restore.mnemonic': '니모닉 구문',
    'wallet.restore.placeholder': '12단어 니모닉을 입력하세요',
    'wallet.restore.confirm': '지갑 복구',
    'wallet.address.title': '지갑 주소',
    'wallet.address.note': '이 주소로 암호화폐를 받을 수 있습니다',
    'wallet.address.qr': 'QR 코드',
    'wallet.address.addAccount': '계정 추가',
    'wallet.accounts.title': '계정 관리',
    'wallet.address': '지갑 주소',
    'wallet.copy': '복사',
    'wallet.qr': 'QR 코드',
    'wallet.send': '전송',
    'wallet.receive': '수신',
    'wallet.balance': '잔액',
    'wallet.value': '가치',
    'wallet.addCoin': '코인 추가',
    
    // Profile
    'profile.edit': '프로필 편집',
    'profile.save': '변경사항 저장',
    'profile.cancel': '취소',
    'profile.photo': '프로필 사진',
    'profile.changePhoto': '사진 변경',
    'profile.accountInfo': '계정 정보',
    'profile.memberSince': '가입일',
    
    // Settings
    'settings.title': '설정',
    'settings.subtitle': '지갑 경험을 맞춤 설정하세요',
    'settings.security': '보안',
    'settings.notifications': '알림',
    'settings.appSettings': '앱 설정',
    'settings.language': '언어',
    'settings.theme': '테마',
    'settings.passwordChange': '비밀번호 변경',
    'settings.dataManagement': '데이터 관리',
    'settings.exportData': '데이터 내보내기',
    'settings.importData': '데이터 가져오기',
    'settings.deleteAccount': '계정 삭제',
    'settings.saveSettings': '설정 저장',
    
    // Language settings
    'language.auto': '자동 감지',
    'language.autoDesc': '위치에 따라 언어를 자동으로 감지합니다',
    'language.manual': '수동 선택',
    'language.manualDesc': '원하는 언어를 선택하세요',
  },
  ja: {
    // Common
    'app.name': 'YOY Wallet',
    'app.subtitle': '安全で便利な暗号通貨ウォレット',
    'app.createAccount': '新しいアカウントを作成',
    
    // Navigation
    'nav.dashboard': 'ダッシュボード',
    'nav.wallet': 'ウォレット',
    'nav.profile': 'プロフィール',
    'nav.settings': '設定',
    'nav.logout': 'ログアウト',
    
    // Auth
    'auth.email': 'メールアドレス',
    'auth.password': 'パスワード',
    'auth.confirmPassword': 'パスワード確認',
    'auth.username': 'ユーザー名',
    'auth.firstName': '名',
    'auth.lastName': '姓',
    'auth.login': 'ログイン',
    'auth.register': '登録',
    'auth.loginSuccess': 'ログイン成功！',
    'auth.loginFailed': 'ログインに失敗しました。',
    'auth.registerSuccess': '登録成功！',
    'auth.registerFailed': '登録に失敗しました。',
    'auth.noAccount': 'アカウントをお持ちでない方は',
    'auth.hasAccount': 'すでにアカウントをお持ちの方は',
    'auth.signUp': '登録',
    'auth.signIn': 'ログイン',
    'auth.loading': '読み込み中...',
    'auth.loggingIn': 'ログイン中...',
    'auth.registering': '登録中...',
    
    // Form validation
    'validation.required': 'この項目は必須です。',
    'validation.email': '有効なメールアドレスを入力してください。',
    'validation.passwordMin': 'パスワードは6文字以上である必要があります。',
    'validation.usernameMin': 'ユーザー名は3文字以上である必要があります。',
    'validation.passwordMismatch': 'パスワードが一致しません。',
    
    // Dashboard
    'dashboard.welcome': 'YOY Walletへようこそ',
    'dashboard.totalBalance': '総残高',
    'dashboard.coins': 'マイコイン',
    'dashboard.recentTransactions': '最近の取引',
    'dashboard.quickActions': 'クイックアクション',
    'dashboard.send': '送信',
    'dashboard.receive': '受信',
    'dashboard.buy': '購入',
    'dashboard.sell': '売却',
    
    // Wallet
    'wallet.address': 'ウォレットアドレス',
    'wallet.copy': 'コピー',
    'wallet.qr': 'QRコード',
    'wallet.send': '送信',
    'wallet.receive': '受信',
    'wallet.balance': '残高',
    'wallet.value': '価値',
    'wallet.addCoin': 'コイン追加',
    
    // Profile
    'profile.edit': 'プロフィール編集',
    'profile.save': '変更を保存',
    'profile.cancel': 'キャンセル',
    'profile.photo': 'プロフィール写真',
    'profile.changePhoto': '写真を変更',
    'profile.accountInfo': 'アカウント情報',
    'profile.memberSince': '登録日',
    
    // Settings
    'settings.title': '設定',
    'settings.subtitle': 'ウォレット体験をカスタマイズ',
    'settings.security': 'セキュリティ',
    'settings.notifications': '通知',
    'settings.appSettings': 'アプリ設定',
    'settings.language': '言語',
    'settings.theme': 'テーマ',
    'settings.passwordChange': 'パスワード変更',
    'settings.dataManagement': 'データ管理',
    'settings.exportData': 'データエクスポート',
    'settings.importData': 'データインポート',
    'settings.deleteAccount': 'アカウント削除',
    'settings.saveSettings': '設定を保存',
    
    // Language settings
    'language.auto': '自動検出',
    'language.autoDesc': '位置に基づいて言語を自動検出します',
    'language.manual': '手動選択',
    'language.manualDesc': '希望する言語を選択してください',
  },
  zh: {
    // Common
    'app.name': 'YOY Wallet',
    'app.subtitle': '安全便捷的加密货币钱包',
    'app.createAccount': '创建新账户',
    
    // Navigation
    'nav.dashboard': '仪表板',
    'nav.wallet': '钱包',
    'nav.profile': '个人资料',
    'nav.settings': '设置',
    'nav.logout': '退出登录',
    
    // Auth
    'auth.email': '邮箱',
    'auth.password': '密码',
    'auth.confirmPassword': '确认密码',
    'auth.username': '用户名',
    'auth.firstName': '名字',
    'auth.lastName': '姓氏',
    'auth.login': '登录',
    'auth.register': '注册',
    'auth.loginSuccess': '登录成功！',
    'auth.loginFailed': '登录失败。',
    'auth.registerSuccess': '注册成功！',
    'auth.registerFailed': '注册失败。',
    'auth.noAccount': '没有账户？',
    'auth.hasAccount': '已有账户？',
    'auth.signUp': '注册',
    'auth.signIn': '登录',
    'auth.loading': '加载中...',
    'auth.loggingIn': '登录中...',
    'auth.registering': '注册中...',
    
    // Form validation
    'validation.required': '此字段为必填项。',
    'validation.email': '请输入有效的邮箱地址。',
    'validation.passwordMin': '密码至少需要6个字符。',
    'validation.usernameMin': '用户名至少需要3个字符。',
    'validation.passwordMismatch': '密码不匹配。',
    
    // Dashboard
    'dashboard.welcome': '欢迎使用YOY Wallet',
    'dashboard.totalBalance': '总余额',
    'dashboard.coins': '我的代币',
    'dashboard.recentTransactions': '最近交易',
    'dashboard.quickActions': '快速操作',
    'dashboard.send': '发送',
    'dashboard.receive': '接收',
    'dashboard.buy': '购买',
    'dashboard.sell': '出售',
    
    // Wallet
    'wallet.address': '钱包地址',
    'wallet.copy': '复制',
    'wallet.qr': '二维码',
    'wallet.send': '发送',
    'wallet.receive': '接收',
    'wallet.balance': '余额',
    'wallet.value': '价值',
    'wallet.addCoin': '添加代币',
    
    // Profile
    'profile.edit': '编辑个人资料',
    'profile.save': '保存更改',
    'profile.cancel': '取消',
    'profile.photo': '个人照片',
    'profile.changePhoto': '更改照片',
    'profile.accountInfo': '账户信息',
    'profile.memberSince': '注册时间',
    
    // Settings
    'settings.title': '设置',
    'settings.subtitle': '自定义您的钱包体验',
    'settings.security': '安全',
    'settings.notifications': '通知',
    'settings.appSettings': '应用设置',
    'settings.language': '语言',
    'settings.theme': '主题',
    'settings.passwordChange': '更改密码',
    'settings.dataManagement': '数据管理',
    'settings.exportData': '导出数据',
    'settings.importData': '导入数据',
    'settings.deleteAccount': '删除账户',
    'settings.saveSettings': '保存设置',
    
    // Language settings
    'language.auto': '自动检测',
    'language.autoDesc': '根据位置自动检测语言',
    'language.manual': '手动选择',
    'language.manualDesc': '选择您偏好的语言',
  },
  es: {
    // Common
    'app.name': 'YOY Wallet',
    'app.subtitle': 'Billetera de criptomonedas segura y conveniente',
    'app.createAccount': 'Crear nueva cuenta',
    
    // Navigation
    'nav.dashboard': 'Panel',
    'nav.wallet': 'Billetera',
    'nav.profile': 'Perfil',
    'nav.settings': 'Configuración',
    'nav.logout': 'Cerrar sesión',
    
    // Auth
    'auth.email': 'Correo electrónico',
    'auth.password': 'Contraseña',
    'auth.confirmPassword': 'Confirmar contraseña',
    'auth.username': 'Nombre de usuario',
    'auth.firstName': 'Nombre',
    'auth.lastName': 'Apellido',
    'auth.login': 'Iniciar sesión',
    'auth.register': 'Registrarse',
    'auth.loginSuccess': '¡Inicio de sesión exitoso!',
    'auth.loginFailed': 'Error al iniciar sesión.',
    'auth.registerSuccess': '¡Registro exitoso!',
    'auth.registerFailed': 'Error en el registro.',
    'auth.noAccount': '¿No tienes cuenta?',
    'auth.hasAccount': '¿Ya tienes cuenta?',
    'auth.signUp': 'Registrarse',
    'auth.signIn': 'Iniciar sesión',
    'auth.loading': 'Cargando...',
    'auth.loggingIn': 'Iniciando sesión...',
    'auth.registering': 'Registrando...',
    
    // Form validation
    'validation.required': 'Este campo es obligatorio.',
    'validation.email': 'Por favor ingrese una dirección de correo válida.',
    'validation.passwordMin': 'La contraseña debe tener al menos 6 caracteres.',
    'validation.usernameMin': 'El nombre de usuario debe tener al menos 3 caracteres.',
    'validation.passwordMismatch': 'Las contraseñas no coinciden.',
    
    // Dashboard
    'dashboard.welcome': 'Bienvenido a YOY Wallet',
    'dashboard.totalBalance': 'Balance total',
    'dashboard.coins': 'Mis monedas',
    'dashboard.recentTransactions': 'Transacciones recientes',
    'dashboard.quickActions': 'Acciones rápidas',
    'dashboard.send': 'Enviar',
    'dashboard.receive': 'Recibir',
    'dashboard.buy': 'Comprar',
    'dashboard.sell': 'Vender',
    
    // Wallet
    'wallet.address': 'Dirección de billetera',
    'wallet.copy': 'Copiar',
    'wallet.qr': 'Código QR',
    'wallet.send': 'Enviar',
    'wallet.receive': 'Recibir',
    'wallet.balance': 'Balance',
    'wallet.value': 'Valor',
    'wallet.addCoin': 'Agregar moneda',
    
    // Profile
    'profile.edit': 'Editar perfil',
    'profile.save': 'Guardar cambios',
    'profile.cancel': 'Cancelar',
    'profile.photo': 'Foto de perfil',
    'profile.changePhoto': 'Cambiar foto',
    'profile.accountInfo': 'Información de cuenta',
    'profile.memberSince': 'Miembro desde',
    
    // Settings
    'settings.title': 'Configuración',
    'settings.subtitle': 'Personaliza tu experiencia de billetera',
    'settings.security': 'Seguridad',
    'settings.notifications': 'Notificaciones',
    'settings.appSettings': 'Configuración de la aplicación',
    'settings.language': 'Idioma',
    'settings.theme': 'Tema',
    'settings.passwordChange': 'Cambiar contraseña',
    'settings.dataManagement': 'Gestión de datos',
    'settings.exportData': 'Exportar datos',
    'settings.importData': 'Importar datos',
    'settings.deleteAccount': 'Eliminar cuenta',
    'settings.saveSettings': 'Guardar configuración',
    
    // Language settings
    'language.auto': 'Detección automática',
    'language.autoDesc': 'Detectar idioma automáticamente según la ubicación',
    'language.manual': 'Selección manual',
    'language.manualDesc': 'Elige tu idioma preferido',
  },
  fr: {
    // Common
    'app.name': 'YOY Wallet',
    'app.subtitle': 'Portefeuille de cryptomonnaies sûr et pratique',
    'app.createAccount': 'Créer un nouveau compte',
    
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.wallet': 'Portefeuille',
    'nav.profile': 'Profil',
    'nav.settings': 'Paramètres',
    'nav.logout': 'Déconnexion',
    
    // Auth
    'auth.email': 'E-mail',
    'auth.password': 'Mot de passe',
    'auth.confirmPassword': 'Confirmer le mot de passe',
    'auth.username': 'Nom d\'utilisateur',
    'auth.firstName': 'Prénom',
    'auth.lastName': 'Nom de famille',
    'auth.login': 'Se connecter',
    'auth.register': 'S\'inscrire',
    'auth.loginSuccess': 'Connexion réussie !',
    'auth.loginFailed': 'Échec de la connexion.',
    'auth.registerSuccess': 'Inscription réussie !',
    'auth.registerFailed': 'Échec de l\'inscription.',
    'auth.noAccount': 'Vous n\'avez pas de compte ?',
    'auth.hasAccount': 'Vous avez déjà un compte ?',
    'auth.signUp': 'S\'inscrire',
    'auth.signIn': 'Se connecter',
    'auth.loading': 'Chargement...',
    'auth.loggingIn': 'Connexion en cours...',
    'auth.registering': 'Inscription en cours...',
    
    // Form validation
    'validation.required': 'Ce champ est obligatoire.',
    'validation.email': 'Veuillez saisir une adresse e-mail valide.',
    'validation.passwordMin': 'Le mot de passe doit contenir au moins 6 caractères.',
    'validation.usernameMin': 'Le nom d\'utilisateur doit contenir au moins 3 caractères.',
    'validation.passwordMismatch': 'Les mots de passe ne correspondent pas.',
    
    // Dashboard
    'dashboard.welcome': 'Bienvenue sur YOY Wallet',
    'dashboard.totalBalance': 'Solde total',
    'dashboard.coins': 'Mes pièces',
    'dashboard.recentTransactions': 'Transactions récentes',
    'dashboard.quickActions': 'Actions rapides',
    'dashboard.send': 'Envoyer',
    'dashboard.receive': 'Recevoir',
    'dashboard.buy': 'Acheter',
    'dashboard.sell': 'Vendre',
    
    // Wallet
    'wallet.address': 'Adresse du portefeuille',
    'wallet.copy': 'Copier',
    'wallet.qr': 'Code QR',
    'wallet.send': 'Envoyer',
    'wallet.receive': 'Recevoir',
    'wallet.balance': 'Solde',
    'wallet.value': 'Valeur',
    'wallet.addCoin': 'Ajouter une pièce',
    
    // Profile
    'profile.edit': 'Modifier le profil',
    'profile.save': 'Enregistrer les modifications',
    'profile.cancel': 'Annuler',
    'profile.photo': 'Photo de profil',
    'profile.changePhoto': 'Changer la photo',
    'profile.accountInfo': 'Informations du compte',
    'profile.memberSince': 'Membre depuis',
    
    // Settings
    'settings.title': 'Paramètres',
    'settings.subtitle': 'Personnalisez votre expérience de portefeuille',
    'settings.security': 'Sécurité',
    'settings.notifications': 'Notifications',
    'settings.appSettings': 'Paramètres de l\'application',
    'settings.language': 'Langue',
    'settings.theme': 'Thème',
    'settings.passwordChange': 'Changer le mot de passe',
    'settings.dataManagement': 'Gestion des données',
    'settings.exportData': 'Exporter les données',
    'settings.importData': 'Importer les données',
    'settings.deleteAccount': 'Supprimer le compte',
    'settings.saveSettings': 'Enregistrer les paramètres',
    
    // Language settings
    'language.auto': 'Détection automatique',
    'language.autoDesc': 'Détecter automatiquement la langue selon l\'emplacement',
    'language.manual': 'Sélection manuelle',
    'language.manualDesc': 'Choisissez votre langue préférée',
  },
  de: {
    // Common
    'app.name': 'YOY Wallet',
    'app.subtitle': 'Sichere und praktische Kryptowährungs-Wallet',
    'app.createAccount': 'Neues Konto erstellen',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.wallet': 'Wallet',
    'nav.profile': 'Profil',
    'nav.settings': 'Einstellungen',
    'nav.logout': 'Abmelden',
    
    // Auth
    'auth.email': 'E-Mail',
    'auth.password': 'Passwort',
    'auth.confirmPassword': 'Passwort bestätigen',
    'auth.username': 'Benutzername',
    'auth.firstName': 'Vorname',
    'auth.lastName': 'Nachname',
    'auth.login': 'Anmelden',
    'auth.register': 'Registrieren',
    'auth.loginSuccess': 'Anmeldung erfolgreich!',
    'auth.loginFailed': 'Anmeldung fehlgeschlagen.',
    'auth.registerSuccess': 'Registrierung erfolgreich!',
    'auth.registerFailed': 'Registrierung fehlgeschlagen.',
    'auth.noAccount': 'Haben Sie noch kein Konto?',
    'auth.hasAccount': 'Haben Sie bereits ein Konto?',
    'auth.signUp': 'Registrieren',
    'auth.signIn': 'Anmelden',
    'auth.loading': 'Laden...',
    'auth.loggingIn': 'Anmeldung läuft...',
    'auth.registering': 'Registrierung läuft...',
    
    // Form validation
    'validation.required': 'Dieses Feld ist erforderlich.',
    'validation.email': 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    'validation.passwordMin': 'Das Passwort muss mindestens 6 Zeichen lang sein.',
    'validation.usernameMin': 'Der Benutzername muss mindestens 3 Zeichen lang sein.',
    'validation.passwordMismatch': 'Die Passwörter stimmen nicht überein.',
    
    // Dashboard
    'dashboard.welcome': 'Willkommen bei YOY Wallet',
    'dashboard.totalBalance': 'Gesamtguthaben',
    'dashboard.coins': 'Meine Münzen',
    'dashboard.recentTransactions': 'Letzte Transaktionen',
    'dashboard.quickActions': 'Schnellaktionen',
    'dashboard.send': 'Senden',
    'dashboard.receive': 'Empfangen',
    'dashboard.buy': 'Kaufen',
    'dashboard.sell': 'Verkaufen',
    
    // Wallet
    'wallet.address': 'Wallet-Adresse',
    'wallet.copy': 'Kopieren',
    'wallet.qr': 'QR-Code',
    'wallet.send': 'Senden',
    'wallet.receive': 'Empfangen',
    'wallet.balance': 'Guthaben',
    'wallet.value': 'Wert',
    'wallet.addCoin': 'Münze hinzufügen',
    
    // Profile
    'profile.edit': 'Profil bearbeiten',
    'profile.save': 'Änderungen speichern',
    'profile.cancel': 'Abbrechen',
    'profile.photo': 'Profilfoto',
    'profile.changePhoto': 'Foto ändern',
    'profile.accountInfo': 'Kontoinformationen',
    'profile.memberSince': 'Mitglied seit',
    
    // Settings
    'settings.title': 'Einstellungen',
    'settings.subtitle': 'Passen Sie Ihre Wallet-Erfahrung an',
    'settings.security': 'Sicherheit',
    'settings.notifications': 'Benachrichtigungen',
    'settings.appSettings': 'App-Einstellungen',
    'settings.language': 'Sprache',
    'settings.theme': 'Design',
    'settings.passwordChange': 'Passwort ändern',
    'settings.dataManagement': 'Datenverwaltung',
    'settings.exportData': 'Daten exportieren',
    'settings.importData': 'Daten importieren',
    'settings.deleteAccount': 'Konto löschen',
    'settings.saveSettings': 'Einstellungen speichern',
    
    // Language settings
    'language.auto': 'Automatische Erkennung',
    'language.autoDesc': 'Sprache automatisch nach Standort erkennen',
    'language.manual': 'Manuelle Auswahl',
    'language.manualDesc': 'Wählen Sie Ihre bevorzugte Sprache',
  },
  ru: {
    // Common
    'app.name': 'YOY Wallet',
    'app.subtitle': 'Безопасный и удобный криптовалютный кошелек',
    'app.createAccount': 'Создать новый аккаунт',
    
    // Navigation
    'nav.dashboard': 'Панель управления',
    'nav.wallet': 'Кошелек',
    'nav.profile': 'Профиль',
    'nav.settings': 'Настройки',
    'nav.logout': 'Выйти',
    
    // Auth
    'auth.email': 'Электронная почта',
    'auth.password': 'Пароль',
    'auth.confirmPassword': 'Подтвердите пароль',
    'auth.username': 'Имя пользователя',
    'auth.firstName': 'Имя',
    'auth.lastName': 'Фамилия',
    'auth.login': 'Войти',
    'auth.register': 'Зарегистрироваться',
    'auth.loginSuccess': 'Вход выполнен успешно!',
    'auth.loginFailed': 'Ошибка входа.',
    'auth.registerSuccess': 'Регистрация прошла успешно!',
    'auth.registerFailed': 'Ошибка регистрации.',
    'auth.noAccount': 'Нет аккаунта?',
    'auth.hasAccount': 'Уже есть аккаунт?',
    'auth.signUp': 'Зарегистрироваться',
    'auth.signIn': 'Войти',
    'auth.loading': 'Загрузка...',
    'auth.loggingIn': 'Вход...',
    'auth.registering': 'Регистрация...',
    
    // Form validation
    'validation.required': 'Это поле обязательно для заполнения.',
    'validation.email': 'Пожалуйста, введите действительный адрес электронной почты.',
    'validation.passwordMin': 'Пароль должен содержать не менее 6 символов.',
    'validation.usernameMin': 'Имя пользователя должно содержать не менее 3 символов.',
    'validation.passwordMismatch': 'Пароли не совпадают.',
    
    // Dashboard
    'dashboard.welcome': 'Добро пожаловать в YOY Wallet',
    'dashboard.totalBalance': 'Общий баланс',
    'dashboard.coins': 'Мои монеты',
    'dashboard.recentTransactions': 'Последние транзакции',
    'dashboard.quickActions': 'Быстрые действия',
    'dashboard.send': 'Отправить',
    'dashboard.receive': 'Получить',
    'dashboard.buy': 'Купить',
    'dashboard.sell': 'Продать',
    
    // Wallet
    'wallet.address': 'Адрес кошелька',
    'wallet.copy': 'Копировать',
    'wallet.qr': 'QR-код',
    'wallet.send': 'Отправить',
    'wallet.receive': 'Получить',
    'wallet.balance': 'Баланс',
    'wallet.value': 'Стоимость',
    'wallet.addCoin': 'Добавить монету',
    
    // Profile
    'profile.edit': 'Редактировать профиль',
    'profile.save': 'Сохранить изменения',
    'profile.cancel': 'Отмена',
    'profile.photo': 'Фото профиля',
    'profile.changePhoto': 'Изменить фото',
    'profile.accountInfo': 'Информация об аккаунте',
    'profile.memberSince': 'Участник с',
    
    // Settings
    'settings.title': 'Настройки',
    'settings.subtitle': 'Настройте свой опыт использования кошелька',
    'settings.security': 'Безопасность',
    'settings.notifications': 'Уведомления',
    'settings.appSettings': 'Настройки приложения',
    'settings.language': 'Язык',
    'settings.theme': 'Тема',
    'settings.passwordChange': 'Изменить пароль',
    'settings.dataManagement': 'Управление данными',
    'settings.exportData': 'Экспорт данных',
    'settings.importData': 'Импорт данных',
    'settings.deleteAccount': 'Удалить аккаунт',
    'settings.saveSettings': 'Сохранить настройки',
    
    // Language settings
    'language.auto': 'Автоопределение',
    'language.autoDesc': 'Автоматически определять язык по местоположению',
    'language.manual': 'Ручной выбор',
    'language.manualDesc': 'Выберите предпочитаемый язык',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');

  // 사용자 언어 자동 감지
  const detectUserLanguage = (): string => {
    // 브라우저 언어 감지
    const browserLanguage = navigator.language.split('-')[0];
    
    // 지원되는 언어인지 확인
    if (availableLanguages.some(lang => lang.code === browserLanguage)) {
      return browserLanguage;
    }
    
    // 기본값은 영어
    return 'en';
  };

  // 언어 설정 함수
  const setLanguage = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem('preferredLanguage', languageCode);
  };

  // 번역 함수
  const t = (key: string): string => {
    const translation = translations[currentLanguage]?.[key];
    if (translation) {
      return translation;
    }
    
    // 번역이 없으면 영어로 폴백
    const englishTranslation = translations['en']?.[key];
    if (englishTranslation) {
      return englishTranslation;
    }
    
    // 영어 번역도 없으면 키 반환
    return key;
  };

  useEffect(() => {
    // 저장된 언어 설정이 있는지 확인
    const savedLanguage = localStorage.getItem('preferredLanguage');
    
    if (savedLanguage && availableLanguages.some(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    } else {
      // 저장된 설정이 없으면 자동 감지
      const detectedLanguage = detectUserLanguage();
      setCurrentLanguage(detectedLanguage);
      localStorage.setItem('preferredLanguage', detectedLanguage);
    }
  }, []);

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    availableLanguages,
    detectUserLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
