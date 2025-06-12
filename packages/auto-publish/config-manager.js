'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * 配置管理器
 * 处理插件配置的加载、保存和验证
 */
class ConfigManager {
  constructor() {
    this.defaultSettings = {
      useObfuscation: false,       // 是否使用混淆功能
      usePreviewTemplates: true,   // 是否使用 preview-templates 的 GameConfig
      mode: 'config',              // 固定为配置模式
      updateHtml: true,            // 固定启用 HTML 更新
      processGameConfig: true,     // 固定启用配置处理
      gitAutoUpdate: true,         // 是否启用git自动更新
      gitBranch: 'mega_h5_dev',    // git目标分支
      gitTagPrefix: 'mega_h5_dev', // git标签前缀
      gitCommitMessage: '',        // git提交信息
      gitForceMode: 'auto',        // git冲突处理模式
      toggleSwitch: true,          // 面板开关状态
      gameConfigToggle: true,      // GameConfig 开关状态
      gitAutoUpdateToggle: true    // Git自动更新开关状态
    };
  }

  /**
   * 获取设置文件路径
   * @returns {string} 设置文件完整路径
   */
  getSettingsPath() {
    return (typeof Editor !== 'undefined' && Editor.Project?.path)
      ? path.join(Editor.Project.path, 'packages/auto-publish/settings.json')
      : path.join(__dirname, 'settings.json');
  }

  /**
   * 加载设置
   * @returns {Object} 设置对象
   */
  loadSettings() {
    try {
      const settingsPath = this.getSettingsPath();
      
      if (fs.existsSync(settingsPath)) {
        const savedSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        const mergedSettings = { ...this.defaultSettings, ...savedSettings };
        
        // 验证设置
        this.validateSettings(mergedSettings);
        
        return mergedSettings;
      }
      
      return this.defaultSettings;
    } catch (err) {
      logger.error('加载设置失败:', err.message);
      return this.defaultSettings;
    }
  }

  /**
   * 保存设置
   * @param {Object} newSettings 新的设置对象
   * @returns {boolean} 是否保存成功
   */
  saveSettings(newSettings) {
    try {
      // 合并设置
      const mergedSettings = { ...this.defaultSettings, ...newSettings };
      
      // 验证设置
      this.validateSettings(mergedSettings);
      
      // 写入文件
      const settingsPath = this.getSettingsPath();
      fs.writeFileSync(settingsPath, JSON.stringify(mergedSettings, null, 2), 'utf8');
      
      logger.log('💾 设置已保存');
      return true;
    } catch (err) {
      logger.error('保存设置失败:', err.message);
      return false;
    }
  }

  /**
   * 保存設置到主進程
   * @param {Object} settings - 要保存的設置
   * @returns {Promise} 保存操作的Promise
   */
  saveToMain(settings) {
    return new Promise((resolve, reject) => {
      // 先保存到文件
      const success = this.saveSettings(settings);
      if (!success) {
        reject(new Error('保存設置到文件失敗'));
        return;
      }

      // 如果在面板環境中，通知主進程
      if (typeof Editor !== 'undefined' && Editor.Ipc) {
        Editor.Ipc.sendToMain('auto-publish:save-settings', settings, (err) => {
          if (err) {
            logger.error('通知主進程更新設置失敗:', err);
            reject(err);
            return;
          }
          logger.log('主進程已更新設置');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * 验证设置有效性
   * @param {Object} settings 设置对象
   */
  validateSettings(settings) {
    // 验证必要字段
    const requiredFields = [
      'useObfuscation',
      'usePreviewTemplates',
      'mode',
      'updateHtml',
      'processGameConfig',
      'gitAutoUpdate',
      'gitBranch',
      'gitTagPrefix',
      'gitCommitMessage',
      'toggleSwitch',
      'gameConfigToggle',
      'gitAutoUpdateToggle'
    ];

    const missingFields = requiredFields.filter(field => !(field in settings));
    if (missingFields.length > 0) {
      logger.warn('設置缺少必要字段:', missingFields);
      // 使用默認值填充缺失字段
      missingFields.forEach(field => {
        settings[field] = this.defaultSettings[field];
      });
    }

    // 验证模式
    if (!['off', 'config'].includes(settings.mode)) {
      logger.warn('无效的模式设置，使用默认值 "config"');
      settings.mode = 'config';
    }

    // 验证Git相关设置
    if (settings.gitAutoUpdate) {
      const gitHandler = require('./git-handler');
      const gitStatus = gitHandler.checkGitAvailable();
      if (!gitStatus.available) {
        settings.gitAutoUpdate = false;
        logger.error(gitStatus.message);
        logger.warn('⚠️ 已自动禁用git自动更新功能');
      }
    }

    // 验证Git冲突处理模式
    if (!['auto', 'force', 'pull'].includes(settings.gitForceMode)) {
      settings.gitForceMode = 'auto';
    }
  }

  /**
   * 获取项目根路径
   * @returns {string} 项目路径
   */
  getProjectPath() {
    return (typeof Editor !== 'undefined' && Editor.Project?.path) 
      ? Editor.Project.path 
      : process.cwd();
  }
}

module.exports = new ConfigManager(); 