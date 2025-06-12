'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * 工具函數集合
 * 提供共用的工具函數
 */

/**
 * 獲取項目根路徑
 * @returns {string} 項目路徑
 */
function getProjectPath() {
  return (typeof Editor !== 'undefined' && Editor.Project?.path) 
    ? Editor.Project.path 
    : process.cwd();
}

/**
 * 安全的文件操作包裝器
 * @param {Function} operation 要執行的操作
 * @param {string} errorMsg 錯誤消息
 * @returns {*} 操作結果或 null
 */
function safeFileOperation(operation, errorMsg) {
  try {
    return operation();
  } catch (err) {
    logger.error(`${errorMsg}:`, err.message);
    return null;
  }
}

/**
 * 判斷是否為需要處理的目標文件
 * @param {string} relativePath 相對路徑
 * @returns {boolean} 是否為目標文件
 */
function isTargetFile(relativePath) {
  const normalizedPath = relativePath.replace(/\\/g, '/');
  
  const targetPatterns = [
    /^gameConfig\..*\.js$/,
    /^main\..*\.js$/,
    /^url-decrypt\..*\.js$/,
    /^assets\/main\/index\..*\.js$/
  ];
  
  return targetPatterns.some(pattern => pattern.test(normalizedPath));
}

/**
 * 遞歸查找文件
 * @param {string} dir 目錄路徑
 * @param {Function} filterFn 過濾函數
 * @param {Array} excludeDirs 排除的目錄
 * @returns {Array} 文件列表
 */
function findFiles(dir, filterFn, excludeDirs = ['node_modules', '.git', 'temp']) {
  const files = [];
  
  function traverse(currentDir, relativePath = '') {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      const currentRelativePath = relativePath ? `${relativePath}/${item}` : item;
      
      if (stat.isDirectory()) {
        if (!excludeDirs.includes(item)) {
          traverse(fullPath, currentRelativePath);
        }
      } else if (stat.isFile() && filterFn(currentRelativePath, item)) {
        files.push({
          fullPath,
          relativePath: currentRelativePath
        });
      }
    }
  }
  
  traverse(dir);
  return files;
}

module.exports = {
  getProjectPath,
  safeFileOperation,
  isTargetFile,
  findFiles
}; 