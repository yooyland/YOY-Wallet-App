const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  
  username: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 100],
      notEmpty: true,
      is: /^[a-zA-Z0-9_]+$/
    }
  },
  
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  
  salt: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [1, 100],
      notEmpty: true
    }
  },
  
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [1, 100],
      notEmpty: true
    }
  },
  
  profilePhoto: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  emailVerificationToken: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  emailVerificationExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  isPhoneVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: /^\+?[1-9]\d{1,14}$/
    }
  },
  
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  isSuperAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  status: {
    type: DataTypes.ENUM('active', 'suspended', 'blacklisted', 'whitelisted'),
    defaultValue: 'active'
  },
  
  securityLevel: {
    type: DataTypes.ENUM('basic', 'enhanced', 'enterprise'),
    defaultValue: 'basic'
  },
  
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  twoFactorSecret: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  backupCodes: {
    type: DataTypes.JSON,
    allowNull: true
  },
  
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  lastLoginIP: {
    type: DataTypes.STRING(45), // IPv6 지원
    allowNull: true
  },
  
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  lockoutUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  passwordChangedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  passwordResetToken: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {},
    allowNull: false
  },
  
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
    allowNull: false
  },
  
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: true,
  
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      unique: true,
      fields: ['username']
    },
    {
      fields: ['status']
    },
    {
      fields: ['isAdmin']
    },
    {
      fields: ['createdAt']
    }
  ],
  
  hooks: {
    beforeCreate: (user) => {
      if (user.email) {
        user.email = user.email.toLowerCase().trim();
      }
      if (user.username) {
        user.username = user.username.toLowerCase().trim();
      }
    },
    
    beforeUpdate: (user) => {
      if (user.changed('email')) {
        user.email = user.email.toLowerCase().trim();
      }
      if (user.changed('username')) {
        user.username = user.username.toLowerCase().trim();
      }
    }
  }
});

// 인스턴스 메서드
User.prototype.isLocked = function() {
  return this.lockoutUntil && new Date() < this.lockoutUntil;
};

User.prototype.incrementLoginAttempts = function() {
  this.loginAttempts += 1;
  if (this.loginAttempts >= 5) {
    this.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15분 잠금
  }
  return this.save();
};

User.prototype.resetLoginAttempts = function() {
  this.loginAttempts = 0;
  this.lockoutUntil = null;
  return this.save();
};

User.prototype.updateLastLogin = function(ip) {
  this.lastLogin = new Date();
  this.lastLoginIP = ip;
  return this.save();
};

// 클래스 메서드
User.findByEmail = function(email) {
  return this.findOne({
    where: {
      email: email.toLowerCase().trim()
    }
  });
};

User.findByUsername = function(username) {
  return this.findOne({
    where: {
      username: username.toLowerCase().trim()
    }
  });
};

User.findActiveUsers = function() {
  return this.findAll({
    where: {
      status: 'active'
    }
  });
};

module.exports = User;
