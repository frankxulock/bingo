'use strict';

const fs = require('fs');
const path = require('path');
const gitHandler = require('./git-handler');
const logger = require('./logger');
const configManager = require('./config-manager');
const fileHandler = require('./file-handler');
const htmlUpdater = require('./html-updater');
const jsProcessor = require('./js-processor');
const utils = require('./utils');

/**
 * 自动混淆插件 - 简化版
 * 专注于环境配置管理和HTML引用更新
 * 移除了复杂的混淆逻辑，保持代码简洁
 */

// ==================== 主模块 ====================

class AutoPublishPlugin {
  constructor() {
    this.settings = configManager.defaultSettings;
  }

  /**
   * 获取设置文件路径
   * @returns {string} 设置文件完整路径
   */
  getSettingsPath() {
    return path.join(__dirname, 'settings.json');
  }

  /**
   * 加载插件设置
   * @returns {Object} 设置对象
   */
  loadSettings() {
    return utils.safeFileOperation(() => {
      const settingsPath = this.getSettingsPath();
      
      if (fs.existsSync(settingsPath)) {
        const savedSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        
        // 合并默认设置和保存的设置
        const mergedSettings = { ...this.settings, ...savedSettings };
        
        // 验证设置有效性
        this.validateSettings(mergedSettings);
        
        return mergedSettings;
      }
      
      // 如果设置文件不存在，返回默认设置
      return this.settings;
    }, '加载设置失败') || this.settings;
  }

  /**
   * 验证设置
   */
  validateSettings(settings) {
    // 验证模式
    if (!['off', 'config'].includes(settings.mode)) {
      logger.warn('无效的模式设置，使用默认值 "config"');
      settings.mode = 'config';
    }

    // 检查git是否可用，如果不可用则禁用git自动更新
    if (settings.gitAutoUpdate) {
      const gitStatus = gitHandler.checkGitAvailable();
      if (!gitStatus.available) {
        settings.gitAutoUpdate = false;
        logger.error(gitStatus.message);
        logger.warn('⚠️ 已自动禁用git自动更新功能');
        this.saveSettings(settings);
      }
    }
  }

  /**
   * 保存插件设置
   * @param {Object} newSettings 新的设置对象
   * @returns {boolean} 是否保存成功
   */
  saveSettings(newSettings) {
    return utils.safeFileOperation(() => {
      // 检查是否要启用git自动更新
      if (newSettings.gitAutoUpdate && !this.settings.gitAutoUpdate) {
        const gitStatus = gitHandler.checkGitAvailable();
        if (!gitStatus.available) {
          newSettings.gitAutoUpdate = false;
          logger.error(gitStatus.message);
          logger.warn('⚠️ 无法启用git自动更新功能');
        }
      }

      // 合并设置
      this.settings = { ...this.settings, ...newSettings };
      
      // 写入文件
      const settingsPath = this.getSettingsPath();
      fs.writeFileSync(settingsPath, JSON.stringify(this.settings, null, 2), 'utf8');
      
      logger.log('💾 设置已保存');
      return true;
    }, '保存设置失败') || false;
  }

  /**
   * 处理构建结果
   */
  async handleBuildFinished(outputDir) {
    const startTime = Date.now();
    let processedItems = 0;

    try {
      // 1. 处理配置文件
      if (this.settings.processGameConfig) {
        const configResult = await this.handleConfigFiles(outputDir);
        processedItems += configResult;
      }

      // 2. 更新 HTML 引用
      if (this.settings.updateHtml) {
        const htmlResult = await this.handleHtmlUpdate(outputDir);
        processedItems += htmlResult;
      }

      // 3. 处理 JavaScript 文件
      if (this.settings.useObfuscation) {
        const jsResult = await this.handleJavaScript(outputDir);
        processedItems += jsResult;
      }

      // 4. Git自动更新
      if (this.settings.gitAutoUpdate) {
        await this.handleGitUpdate(outputDir);
      }

      // 5. 完成处理
      this.logProcessComplete(startTime, processedItems);

    } catch (err) {
      logger.error('处理过程中发生错误:', err.message);
      logger.error('错误堆栈:', err.stack);
    }
  }

  /**
   * 处理配置文件
   */
  async handleConfigFiles(outputDir) {
    let processedCount = 0;

    // 拷贝 GameConfig
    const configPath = fileHandler.copyGameConfig(outputDir) || 
                      fileHandler.findGameConfig(outputDir);
    if (configPath) processedCount++;

    // 拷贝 url-decrypt.js
    const urlDecryptPath = fileHandler.copyUrlDecrypt(outputDir);
    if (urlDecryptPath) processedCount++;

    return processedCount;
  }
  
  /**
   * 处理 HTML 更新
   */
  async handleHtmlUpdate(outputDir) {
    const success = htmlUpdater.updateHtmlReferences(outputDir);
    return success ? 1 : 0;
  }

  /**
   * 处理 JavaScript 文件
   */
  async handleJavaScript(outputDir) {
    let processedCount = 0;
        
    // 清除 console 日志
    logger.log('🗑️ 执行 console 日志清除处理...');
    const consoleCleanedCount = jsProcessor.removeConsoleFromFiles(outputDir);
    processedCount += consoleCleanedCount;
        
    // 混淆处理
    logger.log('🔒 执行代码混淆处理...');
    const jsProcessedCount = jsProcessor.processJavaScriptFiles(outputDir);
    processedCount += jsProcessedCount;

    return processedCount;
  }

  /**
   * 处理 Git 更新
   */
  async handleGitUpdate(outputDir) {
    logger.log('🔧 开始Git自动更新...');
    
    const gitRepoPath = path.dirname(outputDir);
    const gitOptions = {
      projectPath: gitRepoPath,
      buildPath: outputDir,
      targetBranch: this.settings.gitBranch || 'mega_h5_dev',
      tagPrefix: this.settings.gitTagPrefix || 'mega_h5_dev',
      commitMessage: this.settings.gitCommitMessage || null
    };

    try {
      const gitSuccess = await gitHandler.handleGitUpdate(gitOptions);
      if (gitSuccess) {
        logger.log('✅ Git自动更新成功');
      } else {
        logger.warn('⚠️ Git自动更新失败，但不影响构建结果');
      }
    } catch (gitError) {
      logger.error('❌ Git自动更新过程中发生错误:', gitError.message);
    }
  }
  
  /**
   * 输出处理完成日志
   */
  logProcessComplete(startTime, processedItems) {
    const duration = Date.now() - startTime;
    const obfuscationStatus = this.settings.useObfuscation ? '含混淆' : '不含混淆';
    logger.log(`🎉 处理完成! 耗时: ${duration}ms, 处理项目: ${processedItems} (${obfuscationStatus})`);
  }
}

// 创建插件实例
const plugin = new AutoPublishPlugin();

module.exports = {
  // 插件设置
  settings: plugin.settings,

  // 插件生命周期
  load() {
    logger.log('🚀 auto-publish 插件启动');
    plugin.settings = plugin.loadSettings();
    this.logPluginStatus();
  },
    
  unload() {
    logger.log('👋 auto-publish 插件卸载');
  },
    
  // 日志输出
  logPluginStatus() {
    const modeDescriptions = {
      'off': '❌ 关闭',
      'config': '⚙️ 仅配置处理'
    };
    
    logger.log(`当前模式: ${modeDescriptions[plugin.settings.mode] || '未知模式'}`);
    logger.log(plugin.settings.useObfuscation ? '✅ 混淆功能已启用' : 'ℹ️ 混淆功能已禁用');
    
    const configSource = plugin.settings.usePreviewTemplates ? 
      'preview-templates (开发版)' : 
      'build-templates (构建版)';
    logger.log(`📋 GameConfig 来源: ${configSource}`);
  },

  // 消息处理
  messages: {
    async 'editor:build-finished'(event, buildOptions) {
      logger.log('📦 开始处理构建结果...');
      logger.log(`📁 输出目录: ${buildOptions.dest}`);
      
      await plugin.handleBuildFinished(buildOptions.dest);
    },

    'auto-publish:open-settings'() {
      if (typeof Editor !== 'undefined') {
        Editor.Panel.open('auto-publish.settings');
      } else {
        logger.warn('设置面板仅在 Cocos Creator 编辑器中可用');
      }
    },

    'auto-publish:load-settings'(event) {
      logger.log('📥 收到面板设置加载请求');
      
      const settings = plugin.loadSettings();
      const gitStatus = gitHandler.checkGitAvailable();
      
      const settingsWithGitStatus = {
        ...settings,
        gitAvailable: gitStatus.available,
        gitErrorMessage: gitStatus.message
      };
      
      this.sendToPanel('auto-publish:settings-loaded', settingsWithGitStatus);
    },

    'auto-publish:check-git'(event) {
      const gitStatus = gitHandler.checkGitAvailable();
      event.reply(null, gitStatus);
    },

    'auto-publish:check-git-config'(event) {
      try {
        const { execSync } = require('child_process');
        const userName = execSync('git config user.name', { 
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe']
        }).trim();
        const userEmail = execSync('git config user.email', { 
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe']
        }).trim();
        
        // 使用 callback 風格回調
        if (event.reply) {
          event.reply(null, { userName, userEmail });
        } else {
          return { userName, userEmail };
        }
      } catch (err) {
        logger.error('檢查Git配置失敗:', err);
        if (event.reply) {
          event.reply(null, { error: err.message });
        } else {
          return { error: err.message };
        }
      }
    },

    'auto-publish:check-git-repo'(event) {
      try {
        const { execSync } = require('child_process');
        const buildDevPath = path.join(Editor.Project.path, 'build', 'dev');
        
        // 檢查是否為Git倉庫
        const isRepo = fs.existsSync(path.join(buildDevPath, '.git'));
        
        // 檢查是否有衝突
        let hasConflicts = false;
        if (isRepo) {
          try {
            const status = execSync('git status --porcelain', { 
              cwd: buildDevPath,
              encoding: 'utf8'
            });
            hasConflicts = status.split('\n').some(line => line.startsWith('UU'));
        } catch (err) {
            logger.warn('檢查Git衝突狀態失敗:', err);
        }
        }
        
        event.reply(null, { isRepo, hasConflicts });
      } catch (err) {
        event.reply(err);
      }
    },

    'auto-publish:save-settings'(event, newSettings) {
      logger.log('📥 收到面板设置保存请求:', newSettings);
      
      const success = plugin.saveSettings(newSettings);
      const gitStatus = gitHandler.checkGitAvailable();
      
      this.sendToPanel('auto-publish:settings-saved', {
        success,
        settings: newSettings,
        gitAvailable: gitStatus.available
      });
    },

    // 辅助方法：发送消息到面板
    sendToPanel(eventName, data) {
      if (typeof Editor === 'undefined') {
        logger.warn('⚠️ Editor 对象不可用');
        return;
      }

      try {
        if (Editor.Ipc?.sendToPanel) {
          Editor.Ipc.sendToPanel('auto-publish.settings', eventName, data);
          logger.log('✅ 数据已通过 Editor.Ipc.sendToPanel 发送');
        } else if (Editor.sendToPanel) {
          Editor.sendToPanel('auto-publish.settings', eventName, data);
          logger.log('✅ 数据已通过 Editor.sendToPanel 发送');
            } else {
          logger.warn('⚠️ 无法找到可用的面板通信方法');
            }
      } catch (err) {
        logger.error('❌ 发送数据到面板失败:', err.message);
        }
      }
  }
};
