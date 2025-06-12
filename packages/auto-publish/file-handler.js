'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const configManager = require('./config-manager');
const utils = require('./utils');

/**
 * 文件處理器
 * 處理文件複製、查找和基礎處理
 */
class FileHandler {
  /**
   * 拷貝 GameConfig 文件
   * @param {string} outputDir 輸出目錄
   * @returns {string|null} 拷貝後的 GameConfig 文件路徑或 null
   */
  copyGameConfig(outputDir) {
    return utils.safeFileOperation(() => {
      const settings = configManager.loadSettings();
      const usePreview = settings.usePreviewTemplates;
      const sourceDir = usePreview ? 'preview-templates' : 'build-templates/web-mobile';
      
      logger.log(`📋 開始從 ${sourceDir} 拷貝 GameConfig 文件...`);
      
      const projectPath = utils.getProjectPath();
      const sourceTemplatesDir = path.join(projectPath, sourceDir);
      
      if (!fs.existsSync(sourceTemplatesDir)) {
        logger.warn(`${sourceDir} 目錄不存在，跳過拷貝`);
        return null;
      }
      
      // 查找源文件
      const sourceFile = this.findGameConfigInDir(sourceTemplatesDir);
      if (!sourceFile) {
        logger.warn(`在 ${sourceDir} 中未找到 GameConfig 文件`);
        return null;
      }
      
      const sourcePath = path.join(sourceTemplatesDir, sourceFile);
      logger.log(`📁 找到源文件: ${sourceDir}/${sourceFile}`);
      
      // 查找目標文件
      const targetFile = this.findGameConfigInDir(outputDir) || sourceFile;
      const targetPath = path.join(outputDir, targetFile);
      
      // 拷貝文件
      fs.copyFileSync(sourcePath, targetPath);
      
      const sourceType = usePreview ? '開發版本' : '構建版本';
      logger.log(`✅ GameConfig 文件拷貝完成 (${sourceType}): ${sourceFile} → ${targetFile}`);
      
      return targetPath;
    }, 'GameConfig 文件拷貝失敗');
  }

  /**
   * 在指定目錄中查找 GameConfig 文件
   * @param {string} dir 目錄路徑
   * @returns {string|null} 文件名或 null
   */
  findGameConfigInDir(dir) {
    try {
      const files = fs.readdirSync(dir);
      
      // 優先查找 gameConfig.js
      let configFile = files.find(f => f === 'gameConfig.js');
      if (configFile) return configFile;
      
      // 查找帶版本號的文件
      configFile = files.find(f => /^gameConfig\..*\.js$/.test(f));
      return configFile || null;
    } catch (err) {
      logger.error('查找 GameConfig 失敗:', err.message);
      return null;
    }
  }

  /**
   * 拷貝 URL解密文件
   * @param {string} outputDir 輸出目錄路徑
   * @returns {string|null} 拷貝後的 url-decrypt.js 文件路徑或 null
   */
  copyUrlDecrypt(outputDir) {
    return utils.safeFileOperation(() => {
      const settings = configManager.loadSettings();
      
      if (!settings.usePreviewTemplates) {
        logger.log('📋 使用構建版本配置，跳過 url-decrypt.js 拷貝');
        return null;
      }
      
      const sourceDir = 'preview-templates';
      logger.log(`📋 開始從 ${sourceDir} 拷貝 url-decrypt.js 文件...`);
      
      const projectPath = utils.getProjectPath();
      const sourceTemplatesDir = path.join(projectPath, sourceDir);
      const sourceFile = 'url-decrypt.js';
      const sourcePath = path.join(sourceTemplatesDir, sourceFile);
      
      if (!fs.existsSync(sourcePath)) {
        logger.warn(`在 ${sourceDir} 中未找到 url-decrypt.js 文件`);
        return null;
      }
      
      // 查找目標文件
      const targetFile = this.findUrlDecryptInDir(outputDir) || sourceFile;
      const targetPath = path.join(outputDir, targetFile);
      
      // 拷貝文件
      fs.copyFileSync(sourcePath, targetPath);
      
      logger.log(`✅ url-decrypt.js 文件拷貝完成 (開發版本): ${sourceFile} → ${targetFile}`);
      
      return targetPath;
    }, 'url-decrypt.js 文件拷貝失敗');
  }

  /**
   * 在指定目錄中查找 url-decrypt.js 文件
   * @param {string} dir 目錄路徑
   * @returns {string|null} 文件名或 null
   */
  findUrlDecryptInDir(dir) {
    try {
      const files = fs.readdirSync(dir);
      return files.find(f => /^url-decrypt\..*\.js$/.test(f)) || null;
    } catch (err) {
      logger.error('查找 url-decrypt.js 失敗:', err.message);
      return null;
    }
  }

  /**
   * 判斷是否為需要處理的目標文件
   * @param {string} relativePath 相對路徑
   * @returns {boolean} 是否為目標文件
   */
  isTargetFile(relativePath) {
    return utils.isTargetFile(relativePath);
  }
}

module.exports = new FileHandler(); 