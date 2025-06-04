'use strict';

const fs = require('fs');
const path = require('path');

/**
 * 自动混淆插件 - 简化版
 * 专注于环境配置管理和HTML引用更新
 * 移除了复杂的混淆逻辑，保持代码简洁
 */

// ==================== 工具函数 ====================

/**
 * 统一的日志系统
 * 兼容 Cocos Creator 编辑器和命令行环境
 */
const logger = {
  log: (...args) => {
    const prefix = '[Auto-Obfuscate]';
    if (typeof Editor !== 'undefined') {
      Editor.log(prefix, ...args);
    } else {
      console.log(prefix, ...args);
    }
  },
  
  error: (...args) => {
    const prefix = '[Auto-Obfuscate]';
    if (typeof Editor !== 'undefined') {
      Editor.error(prefix, ...args);
    } else {
      console.error(prefix, ...args);
    }
  },
  
  warn: (...args) => {
    const prefix = '[Auto-Obfuscate]';
    if (typeof Editor !== 'undefined') {
      Editor.warn(prefix, ...args);
    } else {
      console.warn(prefix, ...args);
    }
  }
};

/**
 * 获取项目根路径
 * @returns {string} 项目路径
 */
const getProjectPath = () => {
  return (typeof Editor !== 'undefined' && Editor.Project?.path) 
    ? Editor.Project.path 
    : process.cwd();
};

/**
 * 安全的文件操作包装器
 * @param {Function} operation 要执行的操作
 * @param {string} errorMsg 错误消息
 * @returns {*} 操作结果或 null
 */
const safeFileOperation = (operation, errorMsg) => {
  try {
    return operation();
  } catch (err) {
    logger.error(`${errorMsg}:`, err.message);
    return null;
  }
};

// ==================== 主模块 ====================

module.exports = {
  
  /**
   * 插件设置配置
   * 文件检查和配置处理始终启用，只有混淆功能和GameConfig来源可选
   */
  settings: {
    useObfuscation: false,       // 是否使用混淆功能
    usePreviewTemplates: true,   // 是否使用 preview-templates 的 GameConfig（默认true）
    mode: 'config',              // 固定为配置模式
    updateHtml: true,            // 固定启用 HTML 文件引用更新
    processGameConfig: true      // 固定启用游戏配置文件处理
  },

  /**
   * 获取设置文件路径
   * @returns {string} 设置文件完整路径
   */
  getSettingsPath() {
    return path.join(__dirname, 'settings.json');
  },

  /**
   * 加载插件设置
   * @returns {Object} 设置对象
   */
  loadSettings() {
    return safeFileOperation(() => {
      const settingsPath = this.getSettingsPath();
      
      if (fs.existsSync(settingsPath)) {
        const savedSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        
        // 合并默认设置和保存的设置
        const mergedSettings = { ...this.settings, ...savedSettings };
        
        // 验证设置有效性
        if (!['off', 'config'].includes(mergedSettings.mode)) {
          logger.warn('无效的模式设置，使用默认值 "config"');
          mergedSettings.mode = 'config';
        }
        
        return mergedSettings;
      }
      
      // 如果设置文件不存在，返回默认设置
      return this.settings;
    }, '加载设置失败') || this.settings;
  },

  /**
   * 保存插件设置
   * @param {Object} newSettings 新的设置对象
   * @returns {boolean} 是否保存成功
   */
  saveSettings(newSettings) {
    return safeFileOperation(() => {
      // 合并设置
      this.settings = { ...this.settings, ...newSettings };
      
      // 写入文件
      const settingsPath = this.getSettingsPath();
      fs.writeFileSync(settingsPath, JSON.stringify(this.settings, null, 2), 'utf8');
      
      logger.log('💾 设置已保存');
      return true;
    }, '保存设置失败') || false;
  },

  /**
   * 拷贝 GameConfig 文件
   * 根据设置从 preview-templates 或 build-templates 拷贝
   * 确保使用指定来源的配置作为基础，同时保留目标文件的版本号
   * @param {string} outputDir 输出目录
   * @returns {string|null} 拷贝后的 GameConfig 文件路径或 null
   */
  copyGameConfig(outputDir) {
    return safeFileOperation(() => {
      const usePreview = this.settings.usePreviewTemplates;
      const sourceDir = usePreview ? 'preview-templates' : 'build-templates';
      
      logger.log(`📋 开始从 ${sourceDir} 拷贝 GameConfig 文件...`);
      
      const projectPath = getProjectPath();
      const sourceTemplatesDir = path.join(projectPath, sourceDir);
      
      if (!fs.existsSync(sourceTemplatesDir)) {
        logger.warn(`${sourceDir} 目录不存在，跳过拷贝`);
        return null;
      }
      
      // 查找源目录中的 gameConfig.js 文件
      const files = fs.readdirSync(sourceTemplatesDir);
      let sourceConfigFile = null;
      
      // 优先查找 gameConfig.js，然后查找带版本号的文件
      for (const file of files) {
        if (file === 'gameConfig.js') {
          sourceConfigFile = file;
          break;
        } else if (/^gameConfig\..*\.js$/.test(file)) {
          sourceConfigFile = file;
        }
      }
      
      if (!sourceConfigFile) {
        logger.warn(`在 ${sourceDir} 中未找到 gameConfig 文件`);
        return null;
      }
      
      const sourcePath = path.join(sourceTemplatesDir, sourceConfigFile);
      logger.log(`📁 找到源文件: ${sourceDir}/${sourceConfigFile}`);
      
      // 查找目标目录中是否已有 gameConfig 文件
      const outputFiles = fs.readdirSync(outputDir);
      let targetConfigFile = null;
      let versionSuffix = '';
      
      for (const file of outputFiles) {
        if (/^gameConfig\..*\.js$/.test(file)) {
          targetConfigFile = file;
          // 提取版本号部分 (如 .abc123)
          const match = file.match(/^gameConfig(\..*?)\.js$/);
          if (match) {
            versionSuffix = match[1];
          }
          break;
        }
      }
      
      if (!targetConfigFile) {
        // 如果目标目录没有 gameConfig 文件，使用源文件名
        targetConfigFile = sourceConfigFile;
        logger.log(`🎯 目标文件: ${targetConfigFile} (新建)`);
      } else {
        // 保留原有的版本号
        const newTargetFile = `gameConfig${versionSuffix}.js`;
        logger.log(`🎯 目标文件: ${newTargetFile} (覆盖，保留版本号: ${versionSuffix})`);
        targetConfigFile = newTargetFile;
      }
      
      const targetPath = path.join(outputDir, targetConfigFile);
      
      // 读取源文件内容
      const sourceContent = fs.readFileSync(sourcePath, 'utf8');
      
      // 写入目标文件
      fs.writeFileSync(targetPath, sourceContent, 'utf8');
      
      const sourceType = usePreview ? '开发版本' : '构建版本';
      logger.log(`✅ GameConfig 文件拷贝完成 (${sourceType}): ${sourceConfigFile} → ${targetConfigFile}`);
      
      return targetPath;
      
    }, 'GameConfig 文件拷贝失败');
  },

  /**
   * 查找 GameConfig 文件
   * 支持带版本号的文件名格式 (如: gameConfig.abc123.js)
   * @param {string} dir 搜索目录
   * @returns {string|null} GameConfig 文件路径或 null
   */
  findGameConfig(dir) {
    return safeFileOperation(() => {
      const files = fs.readdirSync(dir);
      
      // 查找匹配 gameConfig.*.js 模式的文件
      for (const file of files) {
        if (/^gameConfig\..*\.js$/.test(file)) {
          const fullPath = path.join(dir, file);
          logger.log(`🎯 找到 GameConfig 文件: ${file}`);
          return fullPath;
        }
      }
      
      logger.warn('未找到 GameConfig 文件');
      return null;
    }, '查找 GameConfig 失败');
  },

  /**
   * 处理 GameConfig 文件的环境配置
   * 根据构建路径自动替换环境相关的配置值
   * @param {string} configPath GameConfig 文件路径
   * @returns {boolean} 是否处理成功
   */
  processGameConfig(configPath) {
    // 如果插件关闭或不处理配置，直接返回
    if (this.settings.mode === 'off' || !this.settings.processGameConfig) {
      return true;
    }
    
    return safeFileOperation(() => {
      logger.log('🔧 开始处理 GameConfig 环境配置...');
      
      // 1. 加载环境映射配置
      const envMappingPath = path.join(__dirname, 'env-mapping.json');
      if (!fs.existsSync(envMappingPath)) {
        logger.warn('环境映射文件不存在，跳过环境配置处理');
        return true;
      }
      
      const mapping = JSON.parse(fs.readFileSync(envMappingPath, 'utf8'));
      let content = fs.readFileSync(configPath, 'utf8');
      
      // 2. 根据构建路径检测环境
      const buildPath = configPath.toLowerCase();
      let targetEnv = mapping.defaultEnv || 'test';
      
      // 遍历环境模式匹配
      for (const [envName, patterns] of Object.entries(mapping.buildPathPatterns || {})) {
        if (patterns.some(pattern => buildPath.includes(pattern.toLowerCase()))) {
          targetEnv = envName;
          break;
        }
      }
      
      logger.log(`📍 检测到目标环境: ${targetEnv}`);
      
      // 3. 加载对应环境的配置文件
      const envConfigPath = path.join(getProjectPath(), 'env-config', `${targetEnv}.json`);
      if (!fs.existsSync(envConfigPath)) {
        logger.warn(`环境配置文件不存在: ${envConfigPath}`);
        return true;
      }
      
      const envConfig = JSON.parse(fs.readFileSync(envConfigPath, 'utf8'));
      
      // 4. 替换配置值
      let replacementCount = 0;
      for (const [key, value] of Object.entries(envConfig)) {
        // 构建正则表达式，匹配 key: value 或 key = value 的模式
        const regex = new RegExp(`(${key}\\s*[:=]\\s*)([^,\\n}]+)`, 'g');
        const replacement = typeof value === 'string' ? `"${value}"` : value;
        
        // 检查是否有匹配项
        if (regex.test(content)) {
          content = content.replace(regex, `$1${replacement}`);
          replacementCount++;
          logger.log(`   ✅ ${key}: 已更新为 ${replacement}`);
        }
      }
      
      // 5. 写回文件
      if (replacementCount > 0) {
        fs.writeFileSync(configPath, content, 'utf8');
        logger.log(`🎉 GameConfig 环境配置更新完成 (${replacementCount} 项配置已更新)`);
      } else {
        logger.log('ℹ️  没有找到需要更新的配置项');
      }
      
      return true;
    }, 'GameConfig 处理失败') || false;
  },

  /**
   * 更新 HTML 文件中的脚本引用
   * 将模板文件名替换为实际的带版本号的文件名
   * @param {string} outputDir 输出目录
   * @returns {boolean} 是否更新成功
   */
  updateHtmlReferences(outputDir) {
    if (!this.settings.updateHtml) {
      logger.log('HTML 引用更新已禁用，跳过处理');
      return true;
    }
    
    const indexPath = path.join(outputDir, 'index.html');
    
    return safeFileOperation(() => {
      if (!fs.existsSync(indexPath)) {
        logger.warn('index.html 文件不存在，跳过 HTML 引用更新');
        return true;
      }
      
      logger.log('🔄 开始更新 HTML 脚本引用...');
      
      let content = fs.readFileSync(indexPath, 'utf8');
      let updateCount = 0;
      const updateResults = [];
      
      // 定义需要更新的脚本文件映射
      const scriptMappings = [
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
          template: 'cocos2d-js.js', 
          pattern: /cocos2d-js(-min)?\..*\.js$/, 
          description: 'Cocos2d 引擎文件' 
        },
        { 
          template: 'src/settings.js', 
          pattern: /settings\..*\.js$/, 
          dir: 'src',
          description: '设置文件' 
        }
      ];
      
      // 处理每个脚本映射
      for (const mapping of scriptMappings) {
        const searchDir = mapping.dir ? path.join(outputDir, mapping.dir) : outputDir;
        
        if (!fs.existsSync(searchDir)) {
          updateResults.push(`   ⏭️ ${mapping.description}: 目录不存在 (${mapping.dir || 'root'})`);
          continue;
        }
        
        // 查找实际的文件
        const files = fs.readdirSync(searchDir);
        const actualFile = files.find(file => mapping.pattern.test(file));
        
        if (actualFile) {
          const actualPath = mapping.dir ? `${mapping.dir}/${actualFile}` : actualFile;
          
          // 检查当前HTML中引用的是什么
          let currentReferences = [];
          const templatePatterns = [
            // 直接引用: "gameConfig.js"
            new RegExp(`['"]${mapping.template.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
            // 相对路径引用: "./gameConfig.js"
            new RegExp(`['"]\\./${mapping.template.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
            // 绝对路径引用: "/gameConfig.js"
            new RegExp(`['"]/${mapping.template.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g')
          ];
          
          // 检查是否已经引用了正确的文件
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
          
          // 生成更详细的日志信息
          if (hasCorrectReference && !foundTemplateReferences) {
            updateResults.push(`   ✅ ${mapping.description}: 当前引用 ${actualFile}，无须替换`);
          } else if (hasUpdate) {
            updateCount++;
            updateResults.push(`   ✅ ${mapping.description}: 当前引用 ${mapping.template}，已替换成 ${actualFile}`);
          } else if (!foundTemplateReferences && !hasCorrectReference) {
            updateResults.push(`   ℹ️ ${mapping.description}: 未找到任何引用`);
          } else {
            updateResults.push(`   ℹ️ ${mapping.description}: 引用状态未知`);
          }
        } else {
          updateResults.push(`   ❌ ${mapping.description}: 未找到对应文件 (${mapping.template})`);
        }
      }
      
      // 特殊处理：cocos2d-js.js 的各种可能引用
      const cocos2dFiles = fs.readdirSync(outputDir).filter(f => /^cocos2d-js(-min)?\..*\.js$/.test(f));
      if (cocos2dFiles.length > 0) {
        const actualCocos2dFile = cocos2dFiles[0];
        
        // 检查是否已经引用了正确的文件
        const correctCocos2dPattern = new RegExp(`['"]${actualCocos2dFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
        const hasCorrectCocos2dReference = correctCocos2dPattern.test(content);
        
        // 多种可能的 cocos2d-js.js 引用模式
        const cocos2dPatterns = [
          /['"]cocos2d-js\.js['"]/g,                    // "cocos2d-js.js"
          /['"]cocos2d-js-min\.js['"]/g,                // "cocos2d-js-min.js"
          /['"]\.\/cocos2d-js\.js['"]/g,                // "./cocos2d-js.js"
          /['"]\.\/cocos2d-js-min\.js['"]/g,            // "./cocos2d-js-min.js"
          /['"]\/cocos2d-js\.js['"]/g,                  // "/cocos2d-js.js"
          /['"]\/cocos2d-js-min\.js['"]/g,              // "/cocos2d-js-min.js"
          /['"]cocos2d-js['"]/g,                        // "cocos2d-js" (无扩展名)
          /['"]cocos2d-js-min['"]/g,                    // "cocos2d-js-min" (无扩展名)
          /src\s*=\s*['"]cocos2d-js\.js['"]/g,          // src="cocos2d-js.js"
          /src\s*=\s*['"]cocos2d-js-min\.js['"]/g       // src="cocos2d-js-min.js"
        ];
        
        let cocos2dUpdated = false;
        let foundCocos2dTemplateReferences = false;
        
        for (const regex of cocos2dPatterns) {
          if (regex.test(content)) {
            foundCocos2dTemplateReferences = true;
            content = content.replace(regex, (match) => {
              // 保持原有的引号风格和属性格式
              if (match.includes('src=')) {
                return match.replace(/cocos2d-js(-min)?(\.js)?/, actualCocos2dFile);
              } else {
                return `'${actualCocos2dFile}'`;
              }
            });
            cocos2dUpdated = true;
          }
        }
        
        // 生成更详细的日志信息
        if (hasCorrectCocos2dReference && !foundCocos2dTemplateReferences) {
          updateResults.push(`   ✅ Cocos2d 引擎文件: 当前引用 ${actualCocos2dFile}，无须替换`);
        } else if (cocos2dUpdated) {
          updateCount++;
          updateResults.push(`   ✅ Cocos2d 引擎文件: 当前引用模板文件，已替换成 ${actualCocos2dFile}`);
        } else if (!foundCocos2dTemplateReferences && !hasCorrectCocos2dReference) {
          updateResults.push(`   ℹ️ Cocos2d 引擎文件: 未找到任何引用`);
        } else {
          updateResults.push(`   ℹ️ Cocos2d 引擎文件: 引用状态未知`);
        }
      } else {
        updateResults.push(`   ❌ Cocos2d 引擎文件: 未找到 cocos2d-js*.js 文件`);
      }
      
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
    }, 'HTML 引用更新失败') || false;
  },

  /**
   * 查找并处理所有 JS 文件
   * @param {string} outputDir 输出目录
   * @returns {number} 处理的文件数量
   */
  processJavaScriptFiles(outputDir) {
    return safeFileOperation(() => {
      logger.log('🔍 开始查找 JavaScript 文件...');
      
      const jsFiles = [];
      
      // 递归查找所有 .js 文件
      const findJsFiles = (dir) => {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            // 跳过一些不需要处理的目录
            if (!['node_modules', '.git', 'temp'].includes(item)) {
              findJsFiles(fullPath);
            }
          } else if (stat.isFile() && item.endsWith('.js')) {
            const relativePath = path.relative(outputDir, fullPath);
            
            // 只处理特定的目标文件
            const shouldProcess = this.isTargetFile(relativePath, item);
            
            if (shouldProcess) {
              jsFiles.push(fullPath);
              logger.log(`   ✅ 目标文件: ${relativePath}`);
            } else {
              logger.log(`   ⏭️ 跳过文件: ${relativePath} (不在目标列表中)`);
            }
          }
        }
      };
      
      findJsFiles(outputDir);
      
      if (jsFiles.length === 0) {
        logger.log('ℹ️ 没有找到需要处理的目标文件');
        logger.log('📋 目标文件包括：');
        logger.log('   • gameConfig.*.js');
        logger.log('   • main.*.js');
        logger.log('   • url-decrypt.*.js');
        logger.log('   • assets/main/index.*.js');
        return 0;
      }
      
      logger.log(`🎯 找到 ${jsFiles.length} 个目标文件，将添加无用代码`);
      
      // 加载代码处理器
      const obfuscator = require('./obfuscator-wrapper');
      
      if (!obfuscator.isAvailable) {
        logger.error('❌ 代码处理器不可用');
        return 0;
      }
      
      if (this.settings.useObfuscation && !obfuscator.hasObfuscator) {
        logger.warn('⚠️ 混淆功能已启用但 javascript-obfuscator 不可用，将使用基本压缩');
      }
      
      let processedCount = 0;
      
      // 处理每个文件
      for (const filePath of jsFiles) {
        try {
          logger.log(`🔄 处理文件: ${path.relative(outputDir, filePath)}`);
          
          // 读取文件内容
          const originalCode = fs.readFileSync(filePath, 'utf8');
          
          if (originalCode.trim().length === 0) {
            logger.log('   ⏭️ 跳过空文件');
            continue;
          }
          
          // 判断是否为 GameConfig 文件
          const isGameConfig = filePath.includes('gameConfig') || 
                              filePath.includes('GameConfig') ||
                              originalCode.includes('GameConfig');
          
          // 判断是否为 URL解密文件
          const isUrlDecrypt = filePath.includes('url-decrypt') ||
                              originalCode.includes('URL解密模块') ||
                              originalCode.includes('getDecryptedData');
          
          // 处理代码
          const result = obfuscator.obfuscate(originalCode, {
            useObfuscation: this.settings.useObfuscation,
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
          
          processedCount++;
          
        } catch (error) {
          logger.error(`   ❌ 处理文件失败: ${error.message}`);
        }
      }
      
      logger.log(`🎯 JavaScript 文件处理完成: ${processedCount}/${jsFiles.length} 个文件`);
      return processedCount;
      
    }, 'JavaScript 文件处理失败') || 0;
  },

  /**
   * 拷贝 URL解密文件
   * 当勾选使用 preview-templates 时，从 preview-templates 拷贝 url-decrypt.js
   * @param {string} outputDir 输出目录路径
   * @returns {string|null} 拷贝后的 url-decrypt.js 文件路径或 null
   */
  copyUrlDecrypt(outputDir) {
    return safeFileOperation(() => {
      const usePreview = this.settings.usePreviewTemplates;
      
      // 只有勾选使用 preview-templates 时才进行拷贝
      if (!usePreview) {
        logger.log('📋 使用构建版本配置，跳过 url-decrypt.js 拷贝');
        return null;
      }
      
      const sourceDir = 'preview-templates';
      logger.log(`📋 开始从 ${sourceDir} 拷贝 url-decrypt.js 文件...`);
      
      const projectPath = getProjectPath();
      const sourceTemplatesDir = path.join(projectPath, sourceDir);
      const sourceFile = 'url-decrypt.js';
      const sourcePath = path.join(sourceTemplatesDir, sourceFile);
      
      if (!fs.existsSync(sourcePath)) {
        logger.warn(`在 ${sourceDir} 中未找到 url-decrypt.js 文件`);
        return null;
      }
      
      // 查找目标目录中是否已有 url-decrypt 文件
      const outputFiles = fs.readdirSync(outputDir);
      let targetFile = 'url-decrypt.js';
      let versionSuffix = '';
      
      // 检查是否存在带版本号的 url-decrypt 文件
      for (const file of outputFiles) {
        if (/^url-decrypt\..*\.js$/.test(file)) {
          // 提取版本号部分 (如 .abc123)
          const match = file.match(/^url-decrypt(\..*?)\.js$/);
          if (match) {
            versionSuffix = match[1];
            targetFile = `url-decrypt${versionSuffix}.js`;
            logger.log(`🎯 目标文件: ${targetFile} (覆盖，保留版本号: ${versionSuffix})`);
            break;
          }
        }
      }
      
      if (!versionSuffix) {
        logger.log(`🎯 目标文件: ${targetFile} (新建)`);
      }
      
      const targetPath = path.join(outputDir, targetFile);
      
      // 读取源文件内容
      const sourceContent = fs.readFileSync(sourcePath, 'utf8');
      
      // 写入目标文件
      fs.writeFileSync(targetPath, sourceContent, 'utf8');
      
      logger.log(`✅ url-decrypt.js 文件拷贝完成 (开发版本): ${sourceFile} → ${targetFile}`);
      
      return targetPath;
      
    }, 'url-decrypt.js 文件拷贝失败');
  },

  // ==================== 插件生命周期 ====================

  /**
   * 插件加载时调用
   */
  load() {
    logger.log('🚀 Auto-Obfuscate 插件启动');
    
    // 加载设置
    this.settings = this.loadSettings();
    
    // 显示当前模式
    const modeDescriptions = {
      'off': '❌ 关闭',
      'config': '⚙️ 仅配置处理'
    };
    
    logger.log(`当前模式: ${modeDescriptions[this.settings.mode] || '未知模式'}`);
    
    if (this.settings.useObfuscation) {
      logger.log('✅ 混淆功能已启用');
    } else {
      logger.log('ℹ️ 混淆功能已禁用，仅进行配置处理');
    }
    
    // 显示 GameConfig 来源设置
    const configSource = this.settings.usePreviewTemplates ? 'preview-templates (开发版)' : 'build-templates (构建版)';
    logger.log(`📋 GameConfig 来源: ${configSource}`);
  },

  /**
   * 插件卸载时调用
   */
  unload() {
    logger.log('👋 Auto-Obfuscate 插件卸载');
  },

  // ==================== 消息处理 ====================

  messages: {
    /**
     * 构建完成后的处理
     * @param {Object} event 事件对象
     * @param {Object} buildOptions 构建选项
     */
    async 'editor:build-finished'(event, buildOptions) {
      const startTime = Date.now();
      const outputDir = buildOptions.dest;
      
      logger.log('📦 开始处理构建结果...');
      logger.log(`📁 输出目录: ${outputDir}`);
      
      if (this.settings.useObfuscation) {
        logger.log('🔒 混淆功能已启用');
      } else {
        logger.log('ℹ️ 混淆功能已禁用，仅进行配置处理');
      }
      
      // 显示 GameConfig 来源
      const configSource = this.settings.usePreviewTemplates ? 'preview-templates (开发版)' : 'build-templates (构建版)';
      logger.log(`📋 GameConfig 来源: ${configSource}`);
      
      try {
        let processedItems = 0;
        
        // 1. 拷贝 GameConfig 文件（始终进行）
        let configPath = null;
        if (this.settings.processGameConfig) {
          configPath = this.copyGameConfig(outputDir);
          if (!configPath) {
            // 如果拷贝失败，尝试查找现有的 GameConfig 文件
            configPath = this.findGameConfig(outputDir);
          }
        }

        // 1.5. 拷贝 url-decrypt.js 文件（仅在使用 preview-templates 时）
        let urlDecryptPath = null;
        if (this.settings.processGameConfig) {
          urlDecryptPath = this.copyUrlDecrypt(outputDir);
        }

        // 2. 处理 GameConfig 文件的环境配置（始终进行）
        if (this.settings.processGameConfig && configPath) {
          const success = this.processGameConfig(configPath);
          if (success) processedItems++;
        }
        
        // 3. 更新 HTML 引用（始终进行）
        if (this.settings.updateHtml) {
          const success = this.updateHtmlReferences(outputDir);
          if (success) processedItems++;
        }
        
        // 4. 清除 console 日志（仅在开启混淆时执行）- 放在最后执行
        if (this.settings.useObfuscation) {
          logger.log('🗑️ 执行 console 日志清除处理...');
          
          const consoleCleanedCount = this.removeConsoleFromFiles(outputDir);
          processedItems += consoleCleanedCount;
        } else {
          logger.log('ℹ️ 混淆功能已禁用，跳过 console 日志清除处理');
        }

        // 5. 代码混淆处理（根据设置决定）
        if (this.settings.useObfuscation) {
          logger.log('🔒 执行代码混淆处理...');
          const jsProcessedCount = this.processJavaScriptFiles(outputDir);
          processedItems += jsProcessedCount;
        } else {
          logger.log('ℹ️ 混淆功能已禁用，跳过 JavaScript 文件处理');
        }
        
        // 6. 处理完成
        const duration = Date.now() - startTime;
        const obfuscationStatus = this.settings.useObfuscation ? '含混淆' : '不含混淆';
        logger.log(`🎉 处理完成! 耗时: ${duration}ms, 处理项目: ${processedItems} (${obfuscationStatus})`);
        
      } catch (err) {
        logger.error('处理过程中发生错误:', err.message);
        logger.error('错误堆栈:', err.stack);
      }
    },

    /**
     * 打开设置面板
     */
    'auto-obfuscate:open-settings'() {
      if (typeof Editor !== 'undefined') {
        Editor.Panel.open('auto-obfuscate.settings');
      } else {
        logger.warn('设置面板仅在 Cocos Creator 编辑器中可用');
      }
    },

    /**
     * 加载设置
     * @param {Object} event 事件对象
     */
    'auto-obfuscate:load-settings'(event) {
      logger.log('📥 收到面板设置加载请求');
      
      // 使用模块级别的方法加载设置
      const settings = module.exports.loadSettings();
      
      logger.log('📤 发送设置到面板:', settings);
      
      // 使用正确的 IPC 方式发送到面板
      if (typeof Editor !== 'undefined') {
        try {
          if (Editor.Ipc && typeof Editor.Ipc.sendToPanel === 'function') {
            Editor.Ipc.sendToPanel('auto-obfuscate.settings', 'auto-obfuscate:settings-loaded', settings);
            logger.log('✅ 设置已通过 Editor.Ipc.sendToPanel 发送');
          } else if (typeof Editor.sendToPanel === 'function') {
            Editor.sendToPanel('auto-obfuscate.settings', 'auto-obfuscate:settings-loaded', settings);
            logger.log('✅ 设置已通过 Editor.sendToPanel 发送');
          } else {
            logger.warn('⚠️ 无法找到可用的面板通信方法');
          }
        } catch (err) {
          logger.error('❌ 发送设置到面板失败:', err.message);
        }
      } else {
        logger.warn('⚠️ Editor 对象不可用');
      }
    },

    /**
     * 保存设置
     * @param {Object} event 事件对象
     * @param {Object} newSettings 新设置
     */
    'auto-obfuscate:save-settings'(event, newSettings) {
      logger.log('📥 收到面板设置保存请求:', newSettings);
      
      // 使用模块级别的方法保存设置
      const success = module.exports.saveSettings(newSettings);
      
      logger.log('💾 设置保存结果:', success);
      
      // 使用正确的 IPC 方式发送到面板
      if (typeof Editor !== 'undefined') {
        try {
          if (Editor.Ipc && typeof Editor.Ipc.sendToPanel === 'function') {
            Editor.Ipc.sendToPanel('auto-obfuscate.settings', 'auto-obfuscate:settings-saved', success);
            logger.log('✅ 保存结果已通过 Editor.Ipc.sendToPanel 发送');
          } else if (typeof Editor.sendToPanel === 'function') {
            Editor.sendToPanel('auto-obfuscate.settings', 'auto-obfuscate:settings-saved', success);
            logger.log('✅ 保存结果已通过 Editor.sendToPanel 发送');
          } else {
            logger.warn('⚠️ 无法找到可用的面板通信方法');
          }
        } catch (err) {
          logger.error('❌ 发送保存结果到面板失败:', err.message);
        }
      } else {
        logger.warn('⚠️ Editor 对象不可用');
      }
    }
  },

  /**
   * 清除指定文件中的 console 日志
   * @param {string} outputDir 输出目录
   * @returns {number} 处理的文件数量
   */
  removeConsoleFromFiles(outputDir) {
    return safeFileOperation(() => {
      logger.log('🔍 开始查找需要清除 console 日志的文件...');
      
      const targetFiles = [];
      const consoleTargetPatterns = [
        'index.html',
        /^main\..*\.js$/,
        /^gameConfig\..*\.js$/,
        /^url-decrypt\..*\.js$/,
        /^assets\/main\/index.*\.js$/
      ];
      
      // 递归查找目标文件
      const findTargetFiles = (dir, relativePath = '') => {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          const currentRelativePath = relativePath ? `${relativePath}/${item}` : item;
          
          if (stat.isDirectory()) {
            // 只搜索 assets/main 目录下的文件，跳过其他不需要的目录
            if (!['node_modules', '.git', 'temp'].includes(item)) {
              findTargetFiles(fullPath, currentRelativePath);
            }
          } else if (stat.isFile()) {
            // 检查文件是否匹配目标模式
            const shouldProcess = consoleTargetPatterns.some(pattern => {
              if (typeof pattern === 'string') {
                return item === pattern;
              } else {
                return pattern.test(currentRelativePath.replace(/\\/g, '/'));
              }
            });
            
            if (shouldProcess) {
              targetFiles.push({
                fullPath,
                relativePath: currentRelativePath,
                isHtml: item.endsWith('.html'),
                isJs: item.endsWith('.js')
              });
              logger.log(`   ✅ 目标文件: ${currentRelativePath}`);
            }
          }
        }
      };
      
      findTargetFiles(outputDir);
      
      if (targetFiles.length === 0) {
        logger.log('ℹ️ 没有找到需要清除 console 日志的目标文件');
        return 0;
      }
      
      logger.log(`🎯 找到 ${targetFiles.length} 个目标文件，开始清除 console 日志`);
      
      let processedCount = 0;
      
      // 处理每个文件
      for (const fileInfo of targetFiles) {
        try {
          logger.log(`🔄 处理文件: ${fileInfo.relativePath}`);
          
          // 读取文件内容
          const originalContent = fs.readFileSync(fileInfo.fullPath, 'utf8');
          
          if (originalContent.trim().length === 0) {
            logger.log('   ⏭️ 跳过空文件');
            continue;
          }
          
          let cleanedContent = originalContent;
          let removedCount = 0;
          
          if (fileInfo.isJs) {
            // 检查是否为需要特殊处理的 assets/main/index.*.js 文件
            const isAssetsMainIndex = /^assets\/main\/index.*\.js$/.test(fileInfo.relativePath.replace(/\\/g, '/'));
            
            if (isAssetsMainIndex) {
              // 对 assets/main/index.*.js 文件使用安全的console清除方法
              logger.log('   🛡️ 检测到 assets/main/index.*.js 文件，使用安全模式清除 console 日志...');
              
              const lines = cleanedContent.split('\n');
              const cleanedLines = [];
              
              for (let line of lines) {
                const originalLine = line;
                
                // 非常安全的console清除：只处理明确的、简单的console调用
                const safeConsolePatterns = [
                  // 完整行的console调用（行首到行尾，简单参数）
                  /^\s*console\.(log|error|warn|info)\s*\([^)]*\)\s*;?\s*$/,
                  // 非常简单的行内console调用
                  /(\s+)console\.(log|error|warn|info)\s*\([^)]*\)\s*;?(\s*)$/
                ];
                
                // 检查是否是完整行的简单console调用
                if (safeConsolePatterns[0].test(line)) {
                  line = '';
                  removedCount++;
                  logger.log(`     安全移除完整行: ${originalLine.trim()}`);
                } else if (safeConsolePatterns[1].test(line)) {
                  // 处理行末简单console调用
                  const beforeReplace = line;
                  line = line.replace(safeConsolePatterns[1], '$1$3');
                  if (line !== beforeReplace) {
                    removedCount++;
                    logger.log(`     安全移除行末调用: ${originalLine.trim()}`);
                  }
                }
                
                cleanedLines.push(line);
              }
              
              cleanedContent = cleanedLines.join('\n');
              
            } else {
              // 其他 JavaScript 文件：使用正常的console清除方法
              logger.log('   🔄 使用标准模式清除 console 日志...');
              
              // 方法1：逐行处理，更精确地识别console调用
              const lines = cleanedContent.split('\n');
              const cleanedLines = [];
              
              for (let i = 0; i < lines.length; i++) {
                let line = lines[i];
                let originalLine = line;
                
                // 处理单行console调用
                const singleLinePatterns = [
                  // 匹配各种console方法，支持模板字符串、复杂参数
                  /console\.(log|error|warn|info|debug|trace|dir|table|time|timeEnd|timeLog|clear|count|countReset|group|groupCollapsed|groupEnd|assert)\s*\([^;]*\)\s*;?/g
                ];
                
                singleLinePatterns.forEach(pattern => {
                  if (pattern.test(line)) {
                    // 对于匹配的行，尝试精确替换
                    line = line.replace(pattern, '');
                    // 如果整行都被清空了，就完全移除这一行
                    if (line.trim() === '') {
                      line = '';
                    }
                  }
                });
                
                // 处理多行console调用的开始
                const multiLineStartPattern = /console\.(log|error|warn|info|debug|trace|dir|table|time|timeEnd|timeLog|clear|count|countReset|group|groupCollapsed|groupEnd|assert)\s*\(/;
                if (multiLineStartPattern.test(line)) {
                  // 查找console调用的完整结束
                  let fullConsoleCall = line;
                  let openParens = (line.match(/\(/g) || []).length;
                  let closeParens = (line.match(/\)/g) || []).length;
                  let j = i;
                  
                  // 如果括号不平衡，继续读取下一行
                  while (openParens > closeParens && j < lines.length - 1) {
                    j++;
                    const nextLine = lines[j];
                    fullConsoleCall += '\n' + nextLine;
                    openParens += (nextLine.match(/\(/g) || []).length;
                    closeParens += (nextLine.match(/\)/g) || []).length;
                  }
                  
                  // 如果找到了完整的console调用，则移除它
                  if (openParens === closeParens && openParens > 0) {
                    removedCount++;
                    // 清空这些行
                    for (let k = i; k <= j; k++) {
                      if (k === i) {
                        // 第一行可能还有其他代码，只替换console部分
                        line = line.replace(multiLineStartPattern, '').replace(/^.*console\.[^(]*\(/, '');
                        if (k === j) {
                          // 如果是同一行，还需要移除结尾
                          line = line.replace(/[^}]*\)[^;]*;?/, '');
                        }
                      } else if (k === j) {
                        // 最后一行，移除到结束括号
                        lines[k] = lines[k].replace(/.*\)[^;]*;?/, '');
                      } else {
                        // 中间行完全清空
                        lines[k] = '';
                      }
                    }
                    i = j; // 跳过已处理的行
                  }
                }
                
                if (line !== originalLine) {
                  removedCount++;
                }
                
                cleanedLines.push(line);
              }
              
              cleanedContent = cleanedLines.join('\n');
              
              // 额外的简单模式匹配（作为备用）
              const simplePatterns = [
                // 简单的单行console调用
                /^\s*console\.(log|error|warn|info|debug|trace|dir|table|time\w*|clear|count\w*|group\w*|assert)\s*\([^;]*\)\s*;?\s*$/gm,
                // 行内console调用
                /console\.(log|error|warn|info|debug|trace|dir|table|time\w*|clear|count\w*|group\w*|assert)\s*\([^)]*\)\s*;?/g
              ];
              
              simplePatterns.forEach(pattern => {
                const beforeReplace = cleanedContent;
                cleanedContent = cleanedContent.replace(pattern, '');
                // 计算被替换的次数
                const matches = beforeReplace.match(pattern);
                if (matches) {
                  removedCount += matches.length;
                }
              });
            }
          } else if (fileInfo.isHtml) {
            // HTML 文件：移除 <script> 标签内的 console 调用
            cleanedContent = cleanedContent.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match, scriptContent) => {
              let cleanedScript = scriptContent;
              
              // 使用更简单但有效的模式
              const consolePatterns = [
                // 完整行的console调用
                /^\s*console\.(log|error|warn|info|debug|trace|dir|table|time\w*|clear|count\w*|group\w*|assert)\s*\([^;]*\)\s*;?\s*$/gm,
                // 行内console调用
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
          }
          
          // 清理多余的空行（连续超过2个空行的情况）
          cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
          
          // 如果内容有变化，写回文件
          if (cleanedContent !== originalContent) {
            fs.writeFileSync(fileInfo.fullPath, cleanedContent, 'utf8');
            logger.log(`   ✅ 清除了 ${removedCount} 个 console 调用`);
            processedCount++;
          } else {
            logger.log('   ℹ️ 没有找到 console 调用');
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
  },

  /**
   * 判断是否为需要处理的目标文件
   * @param {string} relativePath 相对路径
   * @param {string} fileName 文件名
   * @returns {boolean} 是否为目标文件
   */
  isTargetFile(relativePath, fileName) {
    // 标准化路径分隔符
    const normalizedPath = relativePath.replace(/\\/g, '/');
    
    // 目标文件模式 (web-mobile为根目录)
    const targetPatterns = [
      // 根目录下的特定文件
      /^gameConfig\..*\.js$/,
      /^main\..*\.js$/,
      /^url-decrypt\..*\.js$/,
      // assets/main/index.*.js 文件
      /^assets\/main\/index\..*\.js$/
    ];
    
    // 检查是否匹配任何目标模式
    return targetPatterns.some(pattern => pattern.test(normalizedPath));
  }
};
