'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const configManager = require('./config-manager');
const utils = require('./utils');

/**
 * JavaScript代码处理器
 * 处理代码混淆和console清理
 */
class JsProcessor {
  /**
   * 处理JavaScript文件
   * @param {string} outputDir 输出目录
   * @returns {number} 处理的文件数量
   */
  processJavaScriptFiles(outputDir) {
    return utils.safeFileOperation(() => {
      logger.log('🔍 开始查找 JavaScript 文件...');
      
      const jsFiles = utils.findFiles(outputDir, (relativePath) => utils.isTargetFile(relativePath))
        .map(file => file.fullPath);
      
      if (jsFiles.length === 0) {
        logger.log('ℹ️ 没有找到需要处理的目标文件');
        this.logTargetFileTypes();
        return 0;
      }
      
      logger.log(`🎯 找到 ${jsFiles.length} 个目标文件，将添加无用代码`);
      
      // 加载代码处理器
      const obfuscator = require('./obfuscator-wrapper');
      
      if (!obfuscator.isAvailable) {
        logger.error('❌ 代码处理器不可用');
        return 0;
      }
      
      const settings = configManager.loadSettings();
      if (settings.useObfuscation && !obfuscator.hasObfuscator) {
        logger.warn('⚠️ 混淆功能已启用但 javascript-obfuscator 不可用，将使用基本压缩');
      }
      
      let processedCount = 0;
      
      // 处理每个文件
      for (const filePath of jsFiles) {
        try {
          const relativePath = path.relative(outputDir, filePath);
          logger.log(`🔄 处理文件: ${relativePath}`);
          
          const result = this.processJsFile(filePath, obfuscator, settings);
          if (result.success) {
            processedCount++;
          }
        } catch (error) {
          logger.error(`   ❌ 处理文件失败: ${error.message}`);
        }
      }
      
      logger.log(`🎯 JavaScript 文件处理完成: ${processedCount}/${jsFiles.length} 个文件`);
      return processedCount;
      
    }, 'JavaScript 文件处理失败') || 0;
  }

  /**
   * 处理单个JS文件
   * @param {string} filePath 文件路径
   * @param {Object} obfuscator 混淆器实例
   * @param {Object} settings 设置对象
   * @returns {Object} 处理结果
   */
  processJsFile(filePath, obfuscator, settings) {
    try {
      // 读取文件内容
      const originalCode = fs.readFileSync(filePath, 'utf8');
      
      if (originalCode.trim().length === 0) {
        logger.log('   ⏭️ 跳过空文件');
        return { success: false };
      }
      
      // 判断文件类型
      const isGameConfig = filePath.includes('gameConfig') || 
                          filePath.includes('GameConfig') ||
                          originalCode.includes('GameConfig');
      
      const isUrlDecrypt = filePath.includes('url-decrypt') ||
                          originalCode.includes('URL解密模块') ||
                          originalCode.includes('getDecryptedData');
      
      // 处理代码
      const result = obfuscator.obfuscate(originalCode, {
        useObfuscation: settings.useObfuscation,
        isGameConfig: isGameConfig,
        isUrlDecrypt: isUrlDecrypt,
        enableDeadCodeInjection: true
      });
      
      const processedCode = result.getObfuscatedCode();
      
      // 保存处理后的代码
      fs.writeFileSync(filePath, processedCode, 'utf8');
      
      const compressionRatio = ((originalCode.length - processedCode.length) / originalCode.length * 100).toFixed(1);
      const sizeIncrease = ((processedCode.length - originalCode.length) / originalCode.length * 100).toFixed(1);
      const sizeInfo = processedCode.length > originalCode.length ? 
        `大小增加: +${sizeIncrease}% (添加了无用代码)` : 
        `压缩率: ${compressionRatio}%`;
      logger.log(`   ✅ 处理完成 - ${sizeInfo}`);
      
      return { success: true };
      
    } catch (err) {
      logger.error(`   ❌ 处理失败: ${err.message}`);
      return { success: false };
    }
  }

  /**
   * 输出目标文件类型说明
   */
  logTargetFileTypes() {
    logger.log('📋 目标文件包括：');
    logger.log('   • gameConfig.*.js');
    logger.log('   • main.*.js');
    logger.log('   • url-decrypt.*.js');
    logger.log('   • assets/main/index.*.js');
  }

  /**
   * 清除指定文件中的 console 日志
   * @param {string} outputDir 输出目录
   * @returns {number} 处理的文件数量
   */
  removeConsoleFromFiles(outputDir) {
    return utils.safeFileOperation(() => {
      logger.log('🔍 开始查找需要清除 console 日志的文件...');
      
      const targetFiles = utils.findFiles(outputDir, (relativePath) => {
        const patterns = [
          'index.html',
          /^main\..*\.js$/,
          /^gameConfig\..*\.js$/,
          /^url-decrypt\..*\.js$/,
          /^assets\/main\/index.*\.js$/
        ];
        
        return patterns.some(pattern => {
          if (typeof pattern === 'string') {
            return path.basename(relativePath) === pattern;
          }
          return pattern.test(relativePath.replace(/\\/g, '/'));
        });
      });
      
      if (targetFiles.length === 0) {
        logger.log('ℹ️ 没有找到需要清除 console 日志的目标文件');
        return 0;
      }
      
      logger.log(`🎯 找到 ${targetFiles.length} 个目标文件，开始清除 console 日志`);
      
      let processedCount = 0;
      
      // 处理每个文件
      for (const fileInfo of targetFiles) {
        try {
          const result = this.removeConsoleFromFile(fileInfo);
          if (result.success) {
            processedCount++;
          }
        } catch (err) {
          logger.error(`   ❌ 处理文件失败: ${err.message}`);
        }
      }
      
      if (processedCount > 0) {
        logger.log(`🎉 console 日志清除完成，处理了 ${processedCount} 个文件`);
      } else {
        logger.log('ℹ️ 没有文件需要清除 console 日志');
      }
      
      return processedCount;
      
    }, 'console 日志清除失败') || 0;
  }

  /**
   * 从单个文件中清除console日志
   * @param {Object} fileInfo 文件信息
   * @returns {Object} 处理结果
   */
  removeConsoleFromFile(fileInfo) {
    try {
      logger.log(`🔄 处理文件: ${fileInfo.relativePath}`);
      
      // 读取文件内容
      const originalContent = fs.readFileSync(fileInfo.fullPath, 'utf8');
      
      if (originalContent.trim().length === 0) {
        logger.log('   ⏭️ 跳过空文件');
        return { success: false };
      }
      
      let cleanedContent = originalContent;
      let removedCount = 0;
      
      const isJs = fileInfo.relativePath.endsWith('.js');
      const isHtml = fileInfo.relativePath.endsWith('.html');
      
      if (isJs) {
        const result = this.cleanJsConsole(fileInfo, cleanedContent);
        cleanedContent = result.content;
        removedCount = result.removedCount;
      } else if (isHtml) {
        const result = this.cleanHtmlConsole(cleanedContent);
        cleanedContent = result.content;
        removedCount = result.removedCount;
      }
      
      // 清理多余的空行
      cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
      
      // 如果内容有变化，写回文件
      if (cleanedContent !== originalContent) {
        fs.writeFileSync(fileInfo.fullPath, cleanedContent, 'utf8');
        logger.log(`   ✅ 清除了 ${removedCount} 个 console 调用`);
        return { success: true };
      } else {
        logger.log('   ℹ️ 没有找到 console 调用');
        return { success: false };
      }
      
    } catch (err) {
      logger.error(`   ❌ 处理失败: ${err.message}`);
      return { success: false };
    }
  }

  /**
   * 清除JS文件中的console日志
   * @param {Object} fileInfo 文件信息
   * @param {string} content 文件内容
   * @returns {Object} 处理结果
   */
  cleanJsConsole(fileInfo, content) {
    let removedCount = 0;
    
    // 检查是否为需要特殊处理的文件
    const isAssetsMainIndex = /^assets\/main\/index.*\.js$/.test(fileInfo.relativePath.replace(/\\/g, '/'));
    
    if (isAssetsMainIndex) {
      logger.log('   🛡️ 检测到 assets/main/index.*.js 文件，使用安全模式清除 console 日志...');
      return this.cleanJsConsoleSafeMode(content);
    } else {
      logger.log('   🔄 使用标准模式清除 console 日志...');
      return this.cleanJsConsoleStandardMode(content);
    }
  }

  /**
   * 安全模式清除JS文件中的console日志
   * @param {string} content 文件内容
   * @returns {Object} 处理结果
   */
  cleanJsConsoleSafeMode(content) {
    const lines = content.split('\n');
    const cleanedLines = [];
    let removedCount = 0;
    
    for (let line of lines) {
      const originalLine = line;
      
      const safeConsolePatterns = [
        /^\s*console\.(log|error|warn|info)\s*\([^)]*\)\s*;?\s*$/,
        /(\s+)console\.(log|error|warn|info)\s*\([^)]*\)\s*;?(\s*)$/
      ];
      
      if (safeConsolePatterns[0].test(line)) {
        line = '';
        removedCount++;
        logger.log(`     安全移除完整行: ${originalLine.trim()}`);
      } else if (safeConsolePatterns[1].test(line)) {
        const beforeReplace = line;
        line = line.replace(safeConsolePatterns[1], '$1$3');
        if (line !== beforeReplace) {
          removedCount++;
          logger.log(`     安全移除行末调用: ${originalLine.trim()}`);
        }
      }
      
      cleanedLines.push(line);
    }
    
    return {
      content: cleanedLines.join('\n'),
      removedCount
    };
  }

  /**
   * 标准模式清除JS文件中的console日志
   * @param {string} content 文件内容
   * @returns {Object} 处理结果
   */
  cleanJsConsoleStandardMode(content) {
    let removedCount = 0;
    let cleanedContent = content;
    
    // 方法1：逐行处理
    const lines = content.split('\n');
    const cleanedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const originalLine = line;
      
      // 处理单行console调用
      const singleLinePattern = /console\.(log|error|warn|info|debug|trace|dir|table|time|timeEnd|timeLog|clear|count|countReset|group|groupCollapsed|groupEnd|assert)\s*\([^;]*\)\s*;?/g;
      
      if (singleLinePattern.test(line)) {
        line = line.replace(singleLinePattern, '');
        if (line.trim() === '') {
          line = '';
        }
        removedCount++;
      }
      
      // 处理多行console调用
      const multiLineStartPattern = /console\.(log|error|warn|info|debug|trace|dir|table|time|timeEnd|timeLog|clear|count|countReset|group|groupCollapsed|groupEnd|assert)\s*\(/;
      if (multiLineStartPattern.test(line)) {
        let fullConsoleCall = line;
        let openParens = (line.match(/\(/g) || []).length;
        let closeParens = (line.match(/\)/g) || []).length;
        let j = i;
        
        while (openParens > closeParens && j < lines.length - 1) {
          j++;
          const nextLine = lines[j];
          fullConsoleCall += '\n' + nextLine;
          openParens += (nextLine.match(/\(/g) || []).length;
          closeParens += (nextLine.match(/\)/g) || []).length;
        }
        
        if (openParens === closeParens && openParens > 0) {
          removedCount++;
          for (let k = i; k <= j; k++) {
            if (k === i) {
              line = line.replace(multiLineStartPattern, '').replace(/^.*console\.[^(]*\(/, '');
              if (k === j) {
                line = line.replace(/[^}]*\)[^;]*;?/, '');
              }
            } else if (k === j) {
              lines[k] = lines[k].replace(/.*\)[^;]*;?/, '');
            } else {
              lines[k] = '';
            }
          }
          i = j;
        }
      }
      
      cleanedLines.push(line);
    }
    
    cleanedContent = cleanedLines.join('\n');
    
    // 方法2：简单模式匹配（备用）
    const simplePatterns = [
      /^\s*console\.(log|error|warn|info|debug|trace|dir|table|time\w*|clear|count\w*|group\w*|assert)\s*\([^;]*\)\s*;?\s*$/gm,
      /console\.(log|error|warn|info|debug|trace|dir|table|time\w*|clear|count\w*|group\w*|assert)\s*\([^)]*\)\s*;?/g
    ];
    
    simplePatterns.forEach(pattern => {
      const beforeReplace = cleanedContent;
      cleanedContent = cleanedContent.replace(pattern, '');
      const matches = beforeReplace.match(pattern);
      if (matches) {
        removedCount += matches.length;
      }
    });
    
    return {
      content: cleanedContent,
      removedCount
    };
  }

  /**
   * 清除HTML文件中的console日志
   * @param {string} content HTML内容
   * @returns {Object} 处理结果
   */
  cleanHtmlConsole(content) {
    let removedCount = 0;
    let cleanedContent = content;
    
    cleanedContent = cleanedContent.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match, scriptContent) => {
      let cleanedScript = scriptContent;
      
      const consolePatterns = [
        /^\s*console\.(log|error|warn|info|debug|trace|dir|table|time\w*|clear|count\w*|group\w*|assert)\s*\([^;]*\)\s*;?\s*$/gm,
        /console\.(log|error|warn|info|debug|trace|dir|table|time\w*|clear|count\w*|group\w*|assert)\s*\([^)]*\)\s*;?/g
      ];
      
      consolePatterns.forEach(pattern => {
        const matches = cleanedScript.match(pattern);
        if (matches) {
          removedCount += matches.length;
          cleanedScript = cleanedScript.replace(pattern, '');
        }
      });
      
      return match.replace(scriptContent, cleanedScript);
    });
    
    return {
      content: cleanedContent,
      removedCount
    };
  }
}

module.exports = new JsProcessor(); 