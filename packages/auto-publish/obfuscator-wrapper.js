/**
 * 智能代码处理器
 * 根据设置决定是否使用 javascript-obfuscator 进行混淆
 * 或仅进行基本的代码压缩和清理
 */

'use strict';

const path = require('path');
const logger = require('./logger');  // 使用共享的 logger 模塊

/**
 * 尝试加载 javascript-obfuscator
 * @returns {Object|null} 混淆器对象或 null
 */
function loadObfuscator() {
  try {
    const JavaScriptObfuscator = require('javascript-obfuscator');
    logger.log('✅ javascript-obfuscator 加载成功');
    return JavaScriptObfuscator;
  } catch (error) {
    logger.warn('⚠️ javascript-obfuscator 未安装或加载失败:', error.message);
    return null;
  }
}

/**
 * 创建智能代码处理器
 * @returns {Object} 代码处理器对象
 */
function createCodeProcessor() {
  logger.log('初始化智能代码处理器...');
  
  const obfuscator = loadObfuscator();
  
  return {
    /**
     * 处理器是否可用
     */
    isAvailable: true,
    
    /**
     * 混淆器是否可用
     */
    hasObfuscator: !!obfuscator,
    
    /**
     * 处理代码
     * @param {string} code 源代码
     * @param {Object} options 处理选项
     * @param {boolean} options.useObfuscation 是否使用混淆
     * @param {boolean} options.isGameConfig 是否为游戏配置文件
     * @param {boolean} options.isUrlDecrypt 是否为URL解密文件
     * @returns {Object} 处理结果对象
     */
    obfuscate: function(code, options = {}) {
      try {
        const { useObfuscation = false, isGameConfig = false, isUrlDecrypt = false } = options;
        
        if (useObfuscation && obfuscator) {
          // 检查代码复杂度，决定是否进行预处理
          const isComplexCode = code.length > 50000 || 
                               /\b(async\s+function|await\s+|import\s+|export\s+)/g.test(code) ||
                               /\b(webpack|module|exports|require)\b/g.test(code);
          
          let codeToProcess = code;
          
          if (!isComplexCode) {
            // 第一步：对简单代码进行预处理
            logger.log('🎭 第一步：添加无用注释和干扰代码...');
            codeToProcess = this.preprocessCode(code);
          } else {
            logger.log('🔍 检测到复杂代码，跳过预处理直接混淆...');
          }
          
          // 第二步：进行混淆
          logger.log('🔒 第二步：使用 javascript-obfuscator 进行代码混淆...');
          return this.performObfuscation(codeToProcess, isGameConfig, isUrlDecrypt);
        } else {
          // 仅进行基本的代码压缩
          logger.log('🗜️ 进行基本代码压缩...');
          return this.performCompression(code);
        }
        
      } catch (error) {
        logger.error('代码处理失败: ' + error.message);
        
        // 如果处理失败，返回原始代码
        return {
          getObfuscatedCode: function() {
            return code;
          }
        };
      }
    },
    
    /**
     * 执行代码混淆
     * @param {string} code 源代码
     * @param {boolean} isGameConfig 是否为游戏配置文件
     * @param {boolean} isUrlDecrypt 是否为URL解密文件
     * @returns {Object} 混淆结果对象
     */
    performObfuscation: function(code, isGameConfig, isUrlDecrypt) {
      // 检查代码中是否包含async/await语法
      const hasAsyncAwait = /\b(async\s+function|await\s+)/g.test(code);
      if (hasAsyncAwait) {
        logger.log('🔍 检测到 async/await 语法，使用兼容模式...');
      }
      
      // 基础保留变量
      const baseReservedNames = [
        'cc', 'window', 'document', 'console', 'Editor',
        // 🔐 加密解密相关全局变量
        'CryptoJS', 'md5',
        'getDecryptedData', 'isUrlDecryptionReady', 'waitForUrlDecryption',
        'decryptedTokenData', 'urlDecryptionReady', 'urlDecryptionComplete',
        // 🎮 游戏相关函数
        'hideSplash', 'showReloadDialog', 'loadScriptWithRetry',
        // 🎯 gameConfig.js 全局变量
        'url', 'DataFetcher', 'snapshotEndpoints', 'serverData', 
        'fetchSnapshots', 'snapshotReady', 'tryStartGame',
        // 🔧 DataFetcher 内部函数（确保完整性）
        'validateData', 'fetchSingle', 'fetchAll',
        // 📱 设备检测相关变量
        'isMobile', 'getDeviceType'
      ];
      
      // 收集所有需要保留的变量名
      const allReservedNames = [...baseReservedNames];
      
      // 如果是游戏配置文件，添加额外的变量
      if (isGameConfig) {
        allReservedNames.push(
          'GameConfig', 'HTTP', 'SERVERHOST', 
          'MEGA', 'RUSH', 'PATHS'
        );
      }
      
      // 如果是URL解密文件，添加解密相关的核心变量
      if (isUrlDecrypt) {
        allReservedNames.push(
          'DECRYPT_CONFIG', 'parseQueryString', 'performDecryption', 
          'processUrlDecryption', 'initializeDecryption', 'DOMContentLoaded'
        );
      }
      
      // 使用Set去重，确保所有变量名唯一
      const uniqueReservedNames = [...new Set(allReservedNames)];
      
      try {
        // 根据文件类型选择不同的混淆策略
        let obfuscationOptions;
        
        if (isUrlDecrypt) {
          logger.log('🔐 检测到URL解密文件，使用安全混淆模式...');
          obfuscationOptions = {
            compact: true,
            controlFlowFlattening: false,
            controlFlowFlatteningThreshold: 0,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.6,
            debugProtection: false,
            debugProtectionInterval: false,
            disableConsoleOutput: false,
            identifierNamesGenerator: 'hexadecimal',
            log: false,
            numbersToExpressions: false,
            renameGlobals: false,
            renameProperties: false,
            rotateStringArray: true,
            selfDefending: false,
            shuffleStringArray: true,
            simplify: false,
            splitStrings: false,
            stringArray: true,
            stringArrayCallsTransform: false,
            stringArrayCallsTransformThreshold: 0.5,
            stringArrayEncoding: ['base64'],
            stringArrayIndexShift: false,
            stringArrayRotate: false,
            stringArrayShuffle: false,
            stringArrayWrappersCount: 1,
            stringArrayWrappersChainedCalls: false,
            stringArrayWrappersParametersMaxCount: 2,
            stringArrayWrappersType: 'function',
            stringArrayThreshold: 0.5,
            target: 'browser',
            transformObjectKeys: false,
            unicodeEscapeSequence: false,
            ignoreRequireImports: true,
            reservedStrings: [
              'decrypt.*',
              'encrypt.*',
              '.*decrypt.*',
              '.*encrypt.*',
              'CryptoJS.*',
              'processUrl.*',
              'getDecryptedData',
              'parseQueryString',
              'performDecryption',
              'processUrlDecryption',
              'initializeDecryption',
              // 📱 设备检测相关字符串
              'isMobile',
              'getDeviceType',
              'window\\.isMobile'
            ],
            reservedNames: [
              'window', 'document', 'console',
              'CryptoJS', 'decrypt', 'encrypt',
              'getDecryptedData', 'processUrlDecryption',
              'parseQueryString', 'performDecryption',
              'initializeDecryption', 'urlDecryptionReady',
              'decryptedTokenData', 'DOMContentLoaded',
              'async', 'await', 'Promise', 'then', 'catch',
              // 📱 设备检测相关变量
              'isMobile', 'getDeviceType'
            ]
          };
        } else if (isGameConfig) {
          logger.log('🎮 检测到GameConfig文件，使用强化混淆模式...');
          obfuscationOptions = {
            compact: true,
            controlFlowFlattening: false,
            controlFlowFlatteningThreshold: 0,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.85,
            debugProtection: false,
            debugProtectionInterval: false,
            disableConsoleOutput: false,
            identifierNamesGenerator: 'hexadecimal',
            log: false,
            numbersToExpressions: true,
            renameGlobals: true,
            renameProperties: false,
            rotateStringArray: true,
            selfDefending: false,
            shuffleStringArray: true,
            simplify: true,
            splitStrings: true,
            splitStringsChunkLength: 3,
            stringArray: true,
            stringArrayCallsTransform: true,
            stringArrayCallsTransformThreshold: 0.8,
            stringArrayEncoding: ['base64', 'rc4'],
            stringArrayIndexesType: ['hexadecimal-number'],
            stringArrayIndexShift: true,
            stringArrayRotate: true,
            stringArrayShuffle: true,
            stringArrayWrappersCount: 4,
            stringArrayWrappersChainedCalls: true,
            stringArrayWrappersParametersMaxCount: 4,
            stringArrayWrappersType: 'function',
            stringArrayThreshold: 0.8,
            target: 'browser',
            transformObjectKeys: false,
            unicodeEscapeSequence: false,
            ignoreRequireImports: true,
            reservedStrings: [
              'HTTP',
              'SERVERHOST', 
              'MEGA',
              'RUSH',
              'PATHS',
              'ID',
              'CURRENCY',
              'INFO',
              'JACKPOT',
              'LIST',
              'ONLINE',
              'VERSION',
              'SETTING',
              'boot',
              'startGame',
              'window\\.boot',
              'window\\.startGame',
              // 📱 设备检测相关字符串
              'isMobile',
              'getDeviceType',
              'window\\.isMobile'
            ],
            reservedNames: [
              'window', 'document', 'console',
              'url', 'HTTP', 'SERVERHOST', 'MEGA', 'RUSH', 'PATHS',
              'GameConfig', 'ID', 'CURRENCY', 'INFO', 'JACKPOT', 
              'LIST', 'ONLINE', 'MAINTAINSTATE', 'INFOLOCK',
              'VERSION', 'SETTING', 'VIDEO', 'CARDLIST',
              'CREATECARD', 'DIYCARD', 'DIYCOUNT', 'DIYCREATE',
              'DIYUPDATE', 'DIYDELETE', 'INFOHISTORY',
              'boot', 'startGame', 'initGame', 'loadGame',
              'runGame', 'launchGame',
              // 📱 设备检测相关变量
              'isMobile', 'getDeviceType'
            ]
          };
        } else {
          logger.log('🔧 使用平衡混淆模式...');
          obfuscationOptions = {
            compact: true,
            controlFlowFlattening: false,
            controlFlowFlatteningThreshold: 0,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.6,
            debugProtection: false,
            debugProtectionInterval: false,
            disableConsoleOutput: false,
            identifierNamesGenerator: 'hexadecimal',
            log: false,
            numbersToExpressions: false,
            renameGlobals: false,
            renameProperties: false,
            rotateStringArray: true,
            selfDefending: false,
            shuffleStringArray: true,
            simplify: false,
            splitStrings: false,
            stringArray: true,
            stringArrayCallsTransform: false,
            stringArrayCallsTransformThreshold: 0.5,
            stringArrayEncoding: ['base64'],
            stringArrayIndexShift: false,
            stringArrayRotate: false,
            stringArrayShuffle: false,
            stringArrayWrappersCount: 1,
            stringArrayWrappersChainedCalls: false,
            stringArrayWrappersParametersMaxCount: 2,
            stringArrayWrappersType: 'function',
            stringArrayThreshold: 0.5,
            target: 'browser',
            transformObjectKeys: false,
            unicodeEscapeSequence: false,
            ignoreRequireImports: true,
            reservedStrings: [
              'cc\\..*',
              '_super',
              'prototype',
              'constructor',
              'onLoad',
              'start',
              'update',
              'onEnable',
              'onDisable',
              'boot',
              'startGame',
              'window\\.boot',
              'window\\.startGame',
              'window\\..*',
              'global\\..*',
              'exports',
              'module',
              'require',
              // 📱 设备检测相关字符串
              'isMobile',
              'getDeviceType',
              'window\\.isMobile'
            ],
            reservedNames: [
              'cc', 'window', 'document', 'console', 'global',
              'onLoad', 'start', 'update', 'onEnable', 'onDisable',
              '_super', 'prototype', 'constructor',
              'async', 'await', 'Promise', 'then', 'catch',
              'boot', 'startGame', 'initGame', 'loadGame',
              'runGame', 'launchGame', 'exports', 'module', 'require',
              'main', 'Main', 'game', 'Game', 'app', 'App',
              // 📱 设备检测相关变量
              'isMobile', 'getDeviceType'
            ]
          };
        }
        
        const result = obfuscator.obfuscate(code, obfuscationOptions);
        
        logger.log(`✅ 代码混淆完成 - 原始长度: ${code.length}, 混淆后长度: ${result.getObfuscatedCode().length}`);
        
        return result;
        
      } catch (syntaxError) {
        logger.warn('⚠️ 完整混淆失败，尝试简化模式: ' + syntaxError.message);
        
        // 备用方案：使用更简单的混淆配置
        try {
          const simpleOptions = {
            compact: false,
            controlFlowFlattening: false,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.3,
            debugProtection: false,
            identifierNamesGenerator: 'hexadecimal',
            renameGlobals: false,
            renameProperties: false,
            stringArray: false,
            transformObjectKeys: false,
            target: 'browser',
            reservedNames: [
              'cc', 'window', 'document', 'console', 'global',
              'onLoad', 'start', 'update', 'onEnable', 'onDisable',
              '_super', 'prototype', 'constructor',
              'async', 'await', 'Promise', 'then', 'catch',
              'boot', 'startGame', 'initGame', 'loadGame',
              'runGame', 'launchGame', 'exports', 'module', 'require',
              'main', 'Main', 'game', 'Game', 'app', 'App',
              // 📱 设备检测相关变量
              'isMobile', 'getDeviceType'
            ]
          };
          
          const result = obfuscator.obfuscate(code, simpleOptions);
          logger.log(`✅ 简化混淆完成 - 原始长度: ${code.length}, 混淆后长度: ${result.getObfuscatedCode().length}`);
          return result;
          
        } catch (finalError) {
          logger.error('❌ 所有混淆方案都失败，使用最小化处理: ' + finalError.message);
          
          // 最后备用方案：只添加文件头注释
          const header = `/*
 * Protected Code Module
 * Build: ${Date.now()}
 * Version: ${Math.random().toFixed(6)}
 * Environment: production
 */

`;
          
          return {
            getObfuscatedCode: function() {
              return header + code;
            }
          };
        }
      }
    },
    
    /**
     * 执行基本代码压缩
     * @param {string} code 源代码
     * @returns {Object} 压缩结果对象
     */
    performCompression: function(code) {
      let processed = code;
      
      // 1. 移除多行注释
      processed = processed.replace(/\/\*[\s\S]*?\*\//g, '');
      
      // 2. 移除单行注释（但保留 URL 中的 // ）
      processed = processed.replace(/(?<!:)\/\/.*$/gm, '');
      
      // 3. 移除多余的空白字符
      processed = processed
        .replace(/\s+/g, ' ')           // 多个空白字符替换为单个空格
        .replace(/\s*{\s*/g, '{')       // 大括号前后的空格
        .replace(/\s*}\s*/g, '}')       // 大括号前后的空格
        .replace(/\s*;\s*/g, ';')       // 分号前后的空格
        .replace(/\s*,\s*/g, ',')       // 逗号前后的空格
        .replace(/\s*:\s*/g, ':')       // 冒号前后的空格
        .replace(/\s*=\s*/g, '=')       // 等号前后的空格
        .trim();                        // 移除首尾空白
      
      // 4. 移除空行
      processed = processed.replace(/\n\s*\n/g, '\n');
      
      logger.log(`✅ 代码压缩完成 - 原始长度: ${code.length}, 压缩后长度: ${processed.length}`);
      
      return {
        getObfuscatedCode: function() {
          return processed;
        }
      };
    },
    
    /**
     * 预处理代码：添加无用注释和干扰代码
     * @param {string} code 源代码
     * @returns {string} 预处理后的代码
     */
    preprocessCode: function(code) {
      logger.log('🎭 添加无用注释和干扰代码...');
      
      let processed = code;
      
      try {
        // 生成随机无用注释的函数
        const generateUselessComments = () => {
          const comments = [
            '/* Security check passed */',
            '/* Performance optimization point */',
            '/* Memory allocation checkpoint */',
            '/* Data validation completed */',
            '/* Connection stability verified */',
            '/* Cache refresh triggered */',
            '/* Authentication token updated */',
            '/* Network latency measured */',
            '/* Error handling initialized */',
            '/* Configuration loaded successfully */'
          ];
          return comments[Math.floor(Math.random() * comments.length)];
        };
        
        // 生成简单的无用代码
        const generateSimpleDummyCode = () => {
          const dummyCodes = [
            '/* dummy: ' + Math.random().toString(36).substr(2, 9) + ' */',
            '/* timestamp: ' + Date.now() + ' */',
            '/* checksum: ' + Math.floor(Math.random() * 9999) + ' */',
            '/* build: ' + Math.random().toFixed(6) + ' */',
            '/* env: production */'
          ];
          return dummyCodes[Math.floor(Math.random() * dummyCodes.length)];
        };
        
        // 只在文件开头添加安全的头部信息
        const safeHeader = `
/*
 * System Configuration Module
 * Version: ${Math.random().toFixed(6)}
 * Build: ${Date.now()}
 * Environment: production
 * Security Level: enhanced
 * Performance Mode: optimized
 * Cache Strategy: aggressive
 * Debug Level: disabled
 * Compatibility: universal
 * Network Protocol: secure
 */

`;
        
        // 在行尾添加安全的注释（不破坏语法）
        processed = processed.replace(/;(\s*)$/gm, (match, whitespace) => {
          if (Math.random() > 0.7) { // 30%概率添加注释
            return '; ' + generateSimpleDummyCode() + whitespace;
          }
          return match;
        });
        
        // 在大括号之间添加注释
        processed = processed.replace(/{\s*$/gm, (match) => {
          if (Math.random() > 0.8) { // 20%概率添加注释
            return '{ ' + generateUselessComments() + '\n';
          }
          return match;
        });
        
        // 在文件开头添加头部
        processed = safeHeader + processed;
        
        logger.log(`✅ 安全预处理完成 - 原始长度: ${code.length}, 处理后长度: ${processed.length}`);
        
        return processed;
        
      } catch (error) {
        logger.warn('⚠️ 预处理失败，返回原始代码: ' + error.message);
        return code;
      }
    }
  };
}

/**
 * 导出代码处理器实例
 */
module.exports = createCodeProcessor(); 