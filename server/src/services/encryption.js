const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.tagLength = 16;
    this.saltLength = 64;
    this.iterations = 100000;
  }

  // 사용자별 고유 암호화 키 생성
  generateUserKey(userId, masterKey, salt) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(masterKey, salt, this.iterations, this.keyLength, 'sha512', (err, key) => {
        if (err) reject(err);
        else resolve(key);
      });
    });
  }

  // 랜덤 솔트 생성
  generateSalt() {
    return crypto.randomBytes(this.saltLength);
  }

  // 랜덤 IV 생성
  generateIV() {
    return crypto.randomBytes(this.ivLength);
  }

  // 데이터 암호화
  async encryptData(data, key) {
    try {
      const iv = this.generateIV();
      const cipher = crypto.createCipher(this.algorithm, key);
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted: encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  // 데이터 복호화
  async decryptData(encryptedData, key, iv, tag) {
    try {
      const decipher = crypto.createDecipher(this.algorithm, key);
      decipher.setAuthTag(Buffer.from(tag, 'hex'));
      
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  // 민감 데이터 암호화 (사용자별 키 사용)
  async encryptSensitiveData(data, userId, masterKey) {
    try {
      const salt = this.generateSalt();
      const userKey = await this.generateUserKey(userId, masterKey, salt);
      const encrypted = await this.encryptData(data, userKey);
      
      return {
        encrypted: encrypted.encrypted,
        iv: encrypted.iv,
        tag: encrypted.tag,
        salt: salt.toString('hex')
      };
    } catch (error) {
      throw new Error(`Sensitive data encryption failed: ${error.message}`);
    }
  }

  // 민감 데이터 복호화
  async decryptSensitiveData(encryptedData, userId, masterKey, salt, iv, tag) {
    try {
      const userKey = await this.generateUserKey(userId, masterKey, Buffer.from(salt, 'hex'));
      return await this.decryptData(encryptedData, userKey, iv, tag);
    } catch (error) {
      throw new Error(`Sensitive data decryption failed: ${error.message}`);
    }
  }

  // 비밀번호 해싱
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // 비밀번호 검증
  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  // 지갑 개인키 암호화 (최고 보안)
  async encryptPrivateKey(privateKey, password, salt) {
    try {
      const key = await this.generateUserKey(password, salt, this.iterations * 2);
      const encrypted = await this.encryptData(privateKey, key);
      
      return {
        encrypted: encrypted.encrypted,
        iv: encrypted.iv,
        tag: encrypted.tag
      };
    } catch (error) {
      throw new Error(`Private key encryption failed: ${error.message}`);
    }
  }

  // 지갑 개인키 복호화
  async decryptPrivateKey(encryptedPrivateKey, password, salt, iv, tag) {
    try {
      const key = await this.generateUserKey(password, salt, this.iterations * 2);
      return await this.decryptData(encryptedPrivateKey, key, iv, tag);
    } catch (error) {
      throw new Error(`Private key decryption failed: ${error.message}`);
    }
  }

  // 해시 생성 (데이터 무결성 검증용)
  generateHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // HMAC 생성 (메시지 인증용)
  generateHMAC(data, key) {
    return crypto.createHmac('sha256', key).update(data).digest('hex');
  }

  // 랜덤 토큰 생성
  generateRandomToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // 보안 강화된 랜덤 문자열
  generateSecureRandomString(length = 32) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    const randomBytes = crypto.randomBytes(length);
    
    for (let i = 0; i < length; i++) {
      result += charset[randomBytes[i] % charset.length];
    }
    
    return result;
  }
}

module.exports = new EncryptionService();
