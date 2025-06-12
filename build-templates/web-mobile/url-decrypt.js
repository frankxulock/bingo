/**
 * 游戏URL解密模块
 * 负责解密URL参数并提供给游戏使用
 * 必须在其他模块加载之前完成处理
 */

(function() {
  'use strict';

  /**
   * URL解密配置
   */
  const DECRYPT_CONFIG = {
    secretKey: "123456789mer-api",
    retryAttempts: 3,
    retryDelay: 1000
  };
  
  /**
   * 解析查询字符串为对象
   * @param {string} str - 查询字符串
   * @returns {Object} 解析后的对象
   */
  function parseQueryString(str) {
    if (!str || str.trim() === '') {
      return {};
    }
    
    try {
      return str
        .split('&')
        .map(kv => kv.split('='))
        .reduce((acc, [k, v]) => {
          if (k) {
            acc[decodeURIComponent(k)] = decodeURIComponent(v || '');
          }
          return acc;
        }, {});
    } catch (error) {
      console.error('解析查询字符串失败:', error);
      return {};
    }
  }
  
  /**
   * 执行AES解密
   * @param {string} encryptedData - 加密的数据
   * @param {string} secretKey - 密钥
   * @returns {string} 解密后的文本
   */
  function performDecryption(encryptedData, secretKey) {
    try {
      if (!encryptedData || encryptedData.trim() === '') {
        console.warn('⚠️ 没有提供加密数据');
        return '';
      }
      
      // 检查CryptoJS是否可用
      if (typeof CryptoJS === 'undefined') {
        throw new Error('CryptoJS 库未加载');
      }
      
      const key = CryptoJS.enc.Utf8.parse(secretKey);
      const iv = CryptoJS.enc.Utf8.parse(secretKey);
      
      // 执行解密
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedText) {
        throw new Error('解密结果为空，可能是密钥错误或数据损坏');
      }
      
      return decryptedText;
      
    } catch (error) {
      console.error('解密过程发生错误:', error);
      throw error;
    }
  }
  
  /**
   * 处理URL解密的主函数
   * @returns {Promise<Object>} 解密后的数据对象
   */
  async function processUrlDecryption() {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      function attemptDecryption() {
        attempts++;
        
        try {
          // 获取URL查询字符串
          const queryString = window.location.search.substring(1);

          // 如果没有查询字符串，返回空对象
          if (!queryString || queryString.trim() === '') {
            resolve({});
            return;
          }
          
          // 执行解密
          const decryptedText = performDecryption(queryString, DECRYPT_CONFIG.secretKey);   
          // 解析解密后的数据
          const decryptedData = parseQueryString(decryptedText);
          
          resolve(decryptedData);
          
        } catch (error) {
          console.error(`❌ 第 ${attempts} 次解密失败:`, error.message);
          
          if (attempts < DECRYPT_CONFIG.retryAttempts) {
            setTimeout(attemptDecryption, DECRYPT_CONFIG.retryDelay);
          } else {
            console.error('💥 解密失败，已达到最大重试次数');
            // 即使解密失败，也返回空对象，不阻塞游戏启动
            resolve({});
          }
        }
      }
      
      // 检查依赖库是否已加载
      if (typeof CryptoJS === 'undefined') {
        console.warn('⚠️ CryptoJS 库尚未加载，等待加载完成...');
        // 等待一小段时间让库加载
        setTimeout(attemptDecryption, 100);
      } else {
        attemptDecryption();
      }
    });
  }
  
  /**
   * 初始化解密模块
   */
  async function initializeDecryption() {
    try {
      // 执行解密
      const decryptedData = await processUrlDecryption();
      
      // 将解密结果挂载到全局对象
      window.decryptedTokenData = decryptedData;
      
      // 触发自定义事件，通知其他模块解密完成
      const event = new CustomEvent('urlDecryptionComplete', {
        detail: {
          success: true,
          data: decryptedData,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(event);
      // 标记解密完成
      window.urlDecryptionReady = true;
      
    } catch (error) {
      console.error('💥 URL解密模块初始化失败:', error);
      
      // 即使失败也要标记完成，避免阻塞
      window.decryptedTokenData = {};
      window.urlDecryptionReady = true;
      
      // 触发失败事件
      const event = new CustomEvent('urlDecryptionComplete', {
        detail: {
          success: false,
          error: error.message,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(event);
    }
  }
  
  /**
   * 获取解密数据的便捷方法
   * @param {string} key - 数据键名
   * @param {*} defaultValue - 默认值
   * @returns {*} 数据值
   */
  window.getDecryptedData = function(key, defaultValue = null) {
    if (!window.decryptedTokenData) {
      console.warn('解密数据尚未准备好');
      return defaultValue;
    }
    
    return window.decryptedTokenData[key] !== undefined 
      ? window.decryptedTokenData[key] 
      : defaultValue;
  };
  
  /**
   * 检查解密是否完成的便捷方法
   * @returns {boolean} 是否完成
   */
  window.isUrlDecryptionReady = function() {
    return window.urlDecryptionReady === true;
  };
  
  /**
   * 等待解密完成的便捷方法
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {Promise<Object>} 解密数据
   */
  window.waitForUrlDecryption = function(timeout = 5000) {
    return new Promise((resolve, reject) => {
      if (window.urlDecryptionReady) {
        resolve(window.decryptedTokenData || {});
        return;
      }
      
      const timeoutId = setTimeout(() => {
        window.removeEventListener('urlDecryptionComplete', handler);
        reject(new Error('URL解密超时'));
      }, timeout);
      
      const handler = (event) => {
        clearTimeout(timeoutId);
        window.removeEventListener('urlDecryptionComplete', handler);
        resolve(event.detail.data || {});
      };
      
      window.addEventListener('urlDecryptionComplete', handler);
    });
  };
  
  // 自动初始化（在DOM加载完成后）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDecryption);
  } else {
    // DOM已经加载完成
    initializeDecryption();
  }
  
})(); 