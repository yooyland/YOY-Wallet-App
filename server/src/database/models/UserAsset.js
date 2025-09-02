const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserAsset = sequelize.define('UserAsset', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  coinSymbol: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 20]
    }
  },
  
  coinName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  
  balance: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  
  lockedBalance: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  
  availableBalance: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.balance - this.lockedBalance;
    }
  },
  
  walletAddress: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  
  encryptedPrivateKey: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  privateKeyIV: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  privateKeyTag: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  network: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Ethereum',
    validate: {
      isIn: [['Ethereum', 'BSC', 'Polygon', 'Arbitrum', 'Optimism']]
    }
  },
  
  contractAddress: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  
  decimals: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 18,
    validate: {
      min: 0,
      max: 18
    }
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  
  lastSyncAt: {
    type: DataTypes.DATE,
    allowNull: true
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
  tableName: 'user_assets',
  timestamps: true,
  
  indexes: [
    {
      unique: true,
      fields: ['userId', 'coinSymbol', 'network']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['coinSymbol']
    },
    {
      fields: ['network']
    },
    {
      fields: ['isActive']
    }
  ],
  
  hooks: {
    beforeCreate: (asset) => {
      if (asset.coinSymbol) {
        asset.coinSymbol = asset.coinSymbol.toUpperCase().trim();
      }
    },
    
    beforeUpdate: (asset) => {
      if (asset.changed('coinSymbol')) {
        asset.coinSymbol = asset.coinSymbol.toUpperCase().trim();
      }
    }
  }
});

// 인스턴스 메서드
UserAsset.prototype.updateBalance = function(newBalance, lockedBalance = 0) {
  this.balance = newBalance;
  this.lockedBalance = lockedBalance;
  this.lastSyncAt = new Date();
  return this.save();
};

UserAsset.prototype.lockBalance = function(amount) {
  if (this.availableBalance >= amount) {
    this.lockedBalance += amount;
    return this.save();
  }
  throw new Error('Insufficient available balance');
};

UserAsset.prototype.unlockBalance = function(amount) {
  if (this.lockedBalance >= amount) {
    this.lockedBalance -= amount;
    return this.save();
  }
  throw new Error('Insufficient locked balance');
};

UserAsset.prototype.transfer = function(amount, toAsset) {
  if (this.availableBalance >= amount) {
    this.balance -= amount;
    toAsset.balance += amount;
    
    return Promise.all([
      this.save(),
      toAsset.save()
    ]);
  }
  throw new Error('Insufficient available balance');
};

// 클래스 메서드
UserAsset.findByUserAndCoin = function(userId, coinSymbol, network = 'Ethereum') {
  return this.findOne({
    where: {
      userId,
      coinSymbol: coinSymbol.toUpperCase(),
      network
    }
  });
};

UserAsset.findUserAssets = function(userId) {
  return this.findAll({
    where: {
      userId,
      isActive: true
    },
    order: [
      ['balance', 'DESC'],
      ['coinSymbol', 'ASC']
    ]
  });
};

UserAsset.findUserAssetsByNetwork = function(userId, network) {
  return this.findAll({
    where: {
      userId,
      network,
      isActive: true
    }
  });
};

UserAsset.getTotalPortfolioValue = function(userId, coinPrices) {
  return this.findAll({
    where: {
      userId,
      isActive: true
    }
  }).then(assets => {
    return assets.reduce((total, asset) => {
      const price = coinPrices[asset.coinSymbol] || 0;
      return total + (asset.balance * price);
    }, 0);
  });
};

module.exports = UserAsset;
