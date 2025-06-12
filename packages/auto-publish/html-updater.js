'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * HTML更新器
 * 处理HTML文件中的脚本引用更新
 */
class HtmlUpdater {
  /**
   * 更新 HTML 文件中的脚本引用
   * @param {string} outputDir 输出目录
   * @returns {boolean} 是否更新成功
   */
  updateHtmlReferences(outputDir) {
    try {
      const indexPath = path.join(outputDir, 'index.html');
      
      if (!fs.existsSync(indexPath)) {
        logger.warn('index.html 文件不存在，跳过 HTML 引用更新');
        return true;
      }
      
      logger.log('🔄 开始更新 HTML 脚本引用...');
      
      let content = fs.readFileSync(indexPath, 'utf8');
      let updateCount = 0;
      const updateResults = [];
      
      // 定义需要更新的脚本文件映射
      const scriptMappings = this.getScriptMappings();
      
      // 处理每个脚本映射
      for (const mapping of scriptMappings) {
        const result = this.processScriptMapping(mapping, outputDir, content);
        content = result.content;
        updateCount += result.updated ? 1 : 0;
        updateResults.push(result.message);
      }
      
      // 处理 cocos2d-js 特殊情况
      const cocos2dResult = this.processCocos2dJs(outputDir, content);
      content = cocos2dResult.content;
      updateCount += cocos2dResult.updated ? 1 : 0;
      updateResults.push(cocos2dResult.message);
      
      // 写回文件
      if (updateCount > 0) {
        fs.writeFileSync(indexPath, content, 'utf8');
        logger.log(`🎉 HTML 引用更新完成 (${updateCount} 个引用已更新)`);
        
        // 显示详细的更新结果
        logger.log('📋 更新详情:');
        updateResults.forEach(result => logger.log(result));
      } else {
        logger.log('ℹ️  没有找到需要更新的 HTML 引用');
        logger.log('📋 检查结果:');
        updateResults.forEach(result => logger.log(result));
      }
      
      return true;
    } catch (err) {
      logger.error('HTML 引用更新失败:', err.message);
      return false;
    }
  }

  /**
   * 获取脚本映射配置
   * @returns {Array} 脚本映射数组
   */
  getScriptMappings() {
    return [
      { 
        template: 'gameConfig.js', 
        pattern: /gameConfig\..*\.js$/, 
        description: '游戏配置文件' 
      },
      { 
        template: 'url-decrypt.js', 
        pattern: /url-decrypt\..*\.js$/, 
        description: 'URL解密文件' 
      },
      { 
        template: 'main.js', 
        pattern: /main\..*\.js$/, 
        description: '主程序文件' 
      },
      { 
        template: 'src/settings.js', 
        pattern: /settings\..*\.js$/, 
        dir: 'src',
        description: '设置文件' 
      }
    ];
  }

  /**
   * 处理单个脚本映射
   * @param {Object} mapping 映射配置
   * @param {string} outputDir 输出目录
   * @param {string} content HTML内容
   * @returns {Object} 处理结果
   */
  processScriptMapping(mapping, outputDir, content) {
    const searchDir = mapping.dir ? path.join(outputDir, mapping.dir) : outputDir;
    
    if (!fs.existsSync(searchDir)) {
      return {
        content,
        updated: false,
        message: `   ⏭️ ${mapping.description}: 目录不存在 (${mapping.dir || 'root'})`
      };
    }
    
    // 查找实际的文件
    const files = fs.readdirSync(searchDir);
    const actualFile = files.find(file => mapping.pattern.test(file));
    
    if (!actualFile) {
      return {
        content,
        updated: false,
        message: `   ❌ ${mapping.description}: 未找到对应文件 (${mapping.template})`
      };
    }
    
    const actualPath = mapping.dir ? `${mapping.dir}/${actualFile}` : actualFile;
    
    // 检查当前引用
    const templatePatterns = [
      new RegExp(`['"]${mapping.template.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
      new RegExp(`['"]\\./${mapping.template.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
      new RegExp(`['"]/${mapping.template.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g')
    ];
    
    const correctReferencePattern = new RegExp(`['"]${actualPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
    const hasCorrectReference = correctReferencePattern.test(content);
    
    let hasUpdate = false;
    let foundTemplateReferences = false;
    
    // 尝试所有模式的替换
    for (const regex of templatePatterns) {
      if (regex.test(content)) {
        foundTemplateReferences = true;
        content = content.replace(regex, `'${actualPath}'`);
        hasUpdate = true;
      }
    }
    
    // 生成更新消息
    let message;
    if (hasCorrectReference && !foundTemplateReferences) {
      message = `   ✅ ${mapping.description}: 当前引用 ${actualFile}，无须替换`;
    } else if (hasUpdate) {
      message = `   ✅ ${mapping.description}: 当前引用 ${mapping.template}，已替换成 ${actualFile}`;
    } else if (!foundTemplateReferences && !hasCorrectReference) {
      message = `   ℹ️ ${mapping.description}: 未找到任何引用`;
    } else {
      message = `   ℹ️ ${mapping.description}: 引用状态未知`;
    }
    
    return {
      content,
      updated: hasUpdate,
      message
    };
  }

  /**
   * 处理 cocos2d-js 文件
   * @param {string} outputDir 输出目录
   * @param {string} content HTML内容
   * @returns {Object} 处理结果
   */
  processCocos2dJs(outputDir, content) {
    const cocos2dFiles = fs.readdirSync(outputDir).filter(f => /^cocos2d-js(-min)?\..*\.js$/.test(f));
    
    if (cocos2dFiles.length === 0) {
      return {
        content,
        updated: false,
        message: `   ❌ Cocos2d 引擎文件: 未找到 cocos2d-js*.js 文件`
      };
    }
    
    const actualCocos2dFile = cocos2dFiles[0];
    const correctCocos2dPattern = new RegExp(`['"]${actualCocos2dFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
    const hasCorrectCocos2dReference = correctCocos2dPattern.test(content);
    
    const cocos2dPatterns = [
      /['"]cocos2d-js\.js['"]/g,
      /['"]cocos2d-js-min\.js['"]/g,
      /['"]\.\/cocos2d-js\.js['"]/g,
      /['"]\.\/cocos2d-js-min\.js['"]/g,
      /['"]\/cocos2d-js\.js['"]/g,
      /['"]\/cocos2d-js-min\.js['"]/g,
      /['"]cocos2d-js['"]/g,
      /['"]cocos2d-js-min['"]/g,
      /src\s*=\s*['"]cocos2d-js\.js['"]/g,
      /src\s*=\s*['"]cocos2d-js-min\.js['"]/g
    ];
    
    let cocos2dUpdated = false;
    let foundCocos2dTemplateReferences = false;
    
    for (const regex of cocos2dPatterns) {
      if (regex.test(content)) {
        foundCocos2dTemplateReferences = true;
        content = content.replace(regex, (match) => {
          if (match.includes('src=')) {
            return match.replace(/cocos2d-js(-min)?(\.js)?/, actualCocos2dFile);
          } else {
            return `'${actualCocos2dFile}'`;
          }
        });
        cocos2dUpdated = true;
      }
    }
    
    let message;
    if (hasCorrectCocos2dReference && !foundCocos2dTemplateReferences) {
      message = `   ✅ Cocos2d 引擎文件: 当前引用 ${actualCocos2dFile}，无须替换`;
    } else if (cocos2dUpdated) {
      message = `   ✅ Cocos2d 引擎文件: 当前引用模板文件，已替换成 ${actualCocos2dFile}`;
    } else if (!foundCocos2dTemplateReferences && !hasCorrectCocos2dReference) {
      message = `   ℹ️ Cocos2d 引擎文件: 未找到任何引用`;
    } else {
      message = `   ℹ️ Cocos2d 引擎文件: 引用状态未知`;
    }
    
    return {
      content,
      updated: cocos2dUpdated,
      message
    };
  }
}

module.exports = new HtmlUpdater(); 