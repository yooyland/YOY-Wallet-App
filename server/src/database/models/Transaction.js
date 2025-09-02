const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
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
  
  txHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      is: /^0x[a-fA-F0-9]{64}$/
    }
  },
  
  fromAddress: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  
  toAddress: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      is: /^0x[a-fA-F0-9]{40}$/
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
  
  amount: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  
  fee: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  
  gasPrice: {
    type: DataTypes.DECIMAL(20, 9),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  
  gasLimit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  
  gasUsed: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  
  network: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Ethereum',
    validate: {
      isIn: [['Ethereum', 'BSC', 'Polygon', 'Arbitrum', 'Optimism']]
    }
  },
  
  blockNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  
  blockHash: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      is: /^0x[a-fA-F0-9]{64}$/
    }
  },
  
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'failed', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false
  },
  
  confirmations: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  
  requiredConfirmations: {
    type: DataTypes.INTEGER,
    defaultValue: 12,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  
  type: {
    type: DataTypes.ENUM('send', 'receive', 'swap', 'stake', 'unstake'),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
    allowNull: false
  },
  
  isInternal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  
  relatedTxId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'transactions',
      key: 'id'
    }
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
  },
  
  confirmedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  
  indexes: [
    {
      unique: true,
      fields: ['txHash']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['fromAddress']
    },
    {
      fields: ['toAddress']
    },
    {
      fields: ['coinSymbol']
    },
    {
      fields: ['network']
    },
    {
      fields: ['status']
    },
    {
      fields: ['type']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['blockNumber']
    }
  ],
  
  hooks: {
    beforeCreate: (transaction) => {
      if (transaction.coinSymbol) {
        transaction.coinSymbol = transaction.coinSymbol.toUpperCase().trim();
      }
    },
    
    beforeUpdate: (transaction) => {
      if (transaction.changed('coinSymbol')) {
        transaction.coinSymbol = transaction.coinSymbol.toUpperCase().trim();
      }
      
      // 상태가 confirmed로 변경되면 confirmedAt 설정
      if (transaction.changed('status') && transaction.status === 'confirmed') {
        transaction.confirmedAt = new Date();
      }
    }
  }
});

// 인스턴스 메서드
Transaction.prototype.confirm = function(blockNumber, blockHash, gasUsed) {
  this.status = 'confirmed';
  this.blockNumber = blockNumber;
  this.blockHash = blockHash;
  this.gasUsed = gasUsed;
  this.confirmedAt = new Date();
  return this.save();
};

Transaction.prototype.fail = function() {
  this.status = 'failed';
  return this.save();
};

Transaction.prototype.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

Transaction.prototype.updateConfirmations = function(confirmations) {
  this.confirmations = confirmations;
  if (confirmations >= this.requiredConfirmations && this.status === 'pending') {
    this.status = 'confirmed';
    this.confirmedAt = new Date();
  }
  return this.save();
};

// 클래스 메서드
Transaction.findByTxHash = function(txHash) {
  return this.findOne({
    where: { txHash }
  });
};

Transaction.findUserTransactions = function(userId, options = {}) {
  const where = { userId };
  
  if (options.status) {
    where.status = options.status;
  }
  
  if (options.type) {
    where.type = options.type;
  }
  
  if (options.coinSymbol) {
    where.coinSymbol = options.coinSymbol.toUpperCase();
  }
  
  if (options.network) {
    where.network = options.network;
  }
  
  return this.findAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: options.limit || 50,
    offset: options.offset || 0
  });
};

Transaction.findPendingTransactions = function() {
  return this.findAll({
    where: { status: 'pending' },
    order: [['createdAt', 'ASC']]
  });
};

Transaction.findTransactionsByAddress = function(address) {
  return this.findAll({
    where: {
      [sequelize.Op.or]: [
        { fromAddress: address },
        { toAddress: address }
      ]
    },
    order: [['createdAt', 'DESC']]
  });
};

Transaction.getTransactionStats = function(userId, period = '30d') {
  const where = { userId };
  
  if (period === '7d') {
    where.createdAt = {
      [sequelize.Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    };
  } else if (period === '30d') {
    where.createdAt = {
      [sequelize.Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    };
  } else if (period === '1y') {
    where.createdAt = {
      [sequelize.Op.gte]: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    };
  }
  
  return this.findAll({
    where,
    attributes: [
      'type',
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
      [sequelize.fn('SUM', sequelize.col('fee')), 'totalFees']
    ],
    group: ['type', 'status']
  });
};

module.exports = Transaction;
