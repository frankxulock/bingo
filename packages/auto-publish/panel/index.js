'use strict';

const configManager = require('../config-manager');
const GitManager = require('../git-handler');
const UIManager = require('./modules/ui-manager');
const logger = require('../logger');
const fs = require('fs');
const path = require('path');

/**
 * Auto Publish Suite Panel
 * 
 * 面板功能：
 * 1. 代码混淆开关
 * 2. GameConfig 配置源选择
 * 3. Git 自动发布设置
 * 4. 分支管理和标签生成
 * 
 * @module auto-publish-panel
 */

Editor.Panel.extend({
  /**
   * 面板樣式定義
   */
  get style() {
    const stylePath = path.join(__dirname, 'styles', 'panel.css');
    return fs.readFileSync(stylePath, 'utf8');
  },

  /**
   * 面板模板
   */
  get template() {
    const templatePath = path.join(__dirname, 'templates', 'panel.html');
    return fs.readFileSync(templatePath, 'utf8');
  },

  /**
   * 面板设置
   * @property {boolean} useObfuscation - 是否使用混淆功能
   * @property {boolean} usePreviewTemplates - 是否使用 preview-templates 的 GameConfig
   * @property {string} mode - 面板模式
   * @property {boolean} updateHtml - 是否更新HTML
   * @property {boolean} processGameConfig - 是否处理配置
   * @property {boolean} gitAutoUpdate - 是否启用git自动更新
   * @property {string} gitBranch - git目标分支
   * @property {string} gitTagPrefix - git标签前缀
   * @property {string} gitCommitMessage - git提交信息
   */
  settings: {
    useObfuscation: false,       // 是否使用混淆功能
    usePreviewTemplates: true,   // 是否使用 preview-templates 的 GameConfig
    mode: 'config',              // 固定为配置模式（简化版）
    updateHtml: true,            // 固定启用 HTML 更新
    processGameConfig: true,     // 固定启用配置处理
    gitAutoUpdate: true,         // 是否启用git自动更新
    gitBranch: 'mega_h5_dev',    // git目标分支
    gitTagPrefix: 'mega_h5_dev', // git标签前缀
    gitCommitMessage: ''         // git提交信息
  },

  /** 事件監聽器存儲 */
  _listeners: [],

  /** 初始化狀態 */
  _initialized: false,

  /**
   * 安全的DOM查詢方法
   * @param {string} selector - CSS選擇器
   * @returns {Element|null} DOM元素
   */
  querySelector(selector) {
    try {
      return this.shadowRoot?.querySelector(selector) 
        || this.$el?.querySelector(selector)
        || document.querySelector(selector);
    } catch (err) {
      logger.warn('DOM查詢失敗:', selector, err);
      return null;
    }
  },

  /**
   * 獲取當前設置
   * @returns {Object} 當前設置對象
   */
  getCurrentSettings() {
    // 從 this.settings 獲取基本設置
    const baseSettings = {
      useObfuscation: this.settings.useObfuscation || false,
      usePreviewTemplates: this.settings.usePreviewTemplates || true,
      mode: this.settings.mode || 'config',
      updateHtml: this.settings.updateHtml || true,
      processGameConfig: this.settings.processGameConfig || true,
      gitAutoUpdate: this.settings.gitAutoUpdate || false,
      gitForceMode: this.settings.gitForceMode || 'auto'
    };

    // 從 UI 獲取 Git 相關設置
    const gitBranchElement = this.querySelector('#gitBranch');
    const gitTagPrefixElement = this.querySelector('#gitTagPrefix');
    const gitCommitMessageElement = this.querySelector('#gitCommitMessage');

    // 合併 Git 設置
    return {
      ...baseSettings,
      gitBranch: gitBranchElement?.value || 'mega_h5_dev',
      gitTagPrefix: gitTagPrefixElement?.value || 'mega_h5_dev',
      gitCommitMessage: gitCommitMessageElement?.value || ''
    };
  },

  /**
   * 應用設置到界面
   * @param {Object} settings - 設置對象
   */
  applySettings(settings) {
    if (!settings) {
      logger.error('無效的設置對象');
      return;
    }

    this.settings = { ...settings };
    logger.log('正在應用設置到界面...');
    
    // 更新開關狀態
    const switches = {
      mainSwitch: {
        id: 'mainSwitch',
        value: settings.useObfuscation,
        label: '代碼混淆',
        status: settings.useObfuscation ? '已啟用' : '已停用'
      },
      gameConfigSwitch: {
        id: 'gameConfigSwitch',
        value: settings.usePreviewTemplates,
        label: 'GameConfig來源',
        status: settings.usePreviewTemplates ? 'preview-templates (開發版)' : 'build-templates (構建版)'
      },
      gitAutoUpdateSwitch: {
        id: 'gitAutoUpdateSwitch',
        value: settings.gitAutoUpdate,
        label: 'Git自動更新',
        status: settings.gitAutoUpdate ? '已啟用' : '已停用'
      }
    };

    // 更新每個開關的狀態
    Object.entries(switches).forEach(([key, config]) => {
      UIManager.updateSwitch(config.id, config.value);
      logger.log(`${config.label}狀態:`, config.status);
    });

    // 檢查Git可用性並更新UI
    try {
      const gitStatus = GitManager.checkGitAvailable();
      if (gitStatus.available) {
        UIManager.updateGitCard(true);
        logger.log('Git功能已啟用');
        
        // 更新Git配置界面
        UIManager.setFormValues({
          gitBranch: settings.gitBranch,
          gitTagPrefix: settings.gitTagPrefix,
          gitCommitMessage: settings.gitCommitMessage || ''
        });
        
        logger.log('Git配置已更新:', {
          branch: settings.gitBranch,
          tagPrefix: settings.gitTagPrefix,
          commitMessage: settings.gitCommitMessage || '(使用默認信息)'
        });
      } else {
        UIManager.updateGitCard(false);
        logger.warn('Git不可用:', gitStatus.message);
      }
    } catch (err) {
      logger.error('檢查Git狀態失敗:', err);
      UIManager.updateGitCard(false);
    }

    // 顯示其他功能狀態
    if (settings.enableDeadCodeInjection) {
      logger.log('🔒 代碼注入已啟用');
    }
    if (settings.targetSpecificFiles) {
      logger.log('📎 指定文件模式已啟用');
    }
  },

  /**
   * 顯示設置摘要
   * @param {Object} settings - 設置對象
   */
  showSettingsSummary(settings) {
    // 顯示主要功能狀態
    logger.log(`✅ 混淆功能${settings.useObfuscation ? '已啟用' : '已停用'}`);
    logger.log(`📋 GameConfig 來源: ${settings.usePreviewTemplates ? 'preview-templates (開發版)' : 'build-templates (構建版)'}`);
    
    if (settings.gitAutoUpdate) {
      logger.log(`🌿 Git自動更新已啟用 (${settings.gitBranch})`);
      if (settings.gitTagPrefix) {
        logger.log(`🏷️ 標籤前綴: ${settings.gitTagPrefix}`);
      }
    }

    // 顯示其他功能狀態
    if (settings.enableDeadCodeInjection) {
      logger.log('🔒 代碼注入已啟用');
    }
    if (settings.targetSpecificFiles) {
      logger.log('📎 指定文件模式已啟用');
    }
    
    UIManager.showStatus('✅ 設置已同步到界面', 'success');
  },

  /**
   * 切換混淆功能狀態
   */
  async toggleObfuscation() {
    const newState = !this.settings.useObfuscation;
    UIManager.updateSwitch('mainSwitch', newState);
    await this.saveSettings();
    
    logger.log('混淆功能狀態切換:', newState ? '啟用' : '停用');
    UIManager.showStatus(
      `🔒 代碼混淆${newState ? '已啟用' : '已停用'}`,
      'success'
    );
  },

  /**
   * 切換GameConfig來源
   */
  async toggleGameConfigSource() {
    const newState = !this.settings.usePreviewTemplates;
    UIManager.updateSwitch('gameConfigSwitch', newState);
    await this.saveSettings();
    
    logger.log('GameConfig來源切換:', newState ? 'preview-templates' : 'build-templates');
    UIManager.showStatus(
      `📋 GameConfig 來源: ${newState ? 'preview-templates (開發版)' : 'build-templates (構建版)'}`,
      'success'
    );
  },

  /**
   * 切換Git自動更新
   */
  async toggleGitAutoUpdate() {
    const gitStatus = GitManager.checkGitAvailable();
    if (!gitStatus.available) {
      const errorMsg = gitStatus.message || 'Git不可用';
      logger.warn('Git不可用，無法啟用自動更新:', errorMsg);
      UIManager.updateSwitch('gitAutoUpdateSwitch', false);
      await this.saveSettings();
      UIManager.updateGitCard(false);
      UIManager.showStatus(`⚠️ Git不可用: ${errorMsg}`, 'error');
      return;
    }

    const newState = !this.settings.gitAutoUpdate;
    UIManager.updateSwitch('gitAutoUpdateSwitch', newState);
    await this.saveSettings();
    UIManager.updateGitCard(newState);
    
    if (newState) {
      logger.log('Git自動更新已啟用');
    } else {
      logger.log('Git自動更新已手動停用');
    }
    
    UIManager.showStatus(
      `🌿 Git 自動更新${newState ? '已啟用' : '已停用'}`,
      'success'
    );
  },

  /**
   * 同步標籤前綴與分支
   * @param {string} branchName - 分支名稱
   */
  syncTagPrefixWithBranch(branchName) {
    const tagPrefixInput = this.querySelector('#gitTagPrefix');
    if (tagPrefixInput) {
      tagPrefixInput.value = branchName || this.settings.gitBranch;
      this.settings.gitTagPrefix = tagPrefixInput.value;
      logger.log('標籤前綴已同步為:', tagPrefixInput.value);
    }
  },

  /**
   * 初始化事件監聽器
   */
  initializeEventListeners() {
    logger.log('初始化事件監聽器');

    // 清理舊的監聽器
    this._listeners.forEach(cleanup => cleanup());
    this._listeners = [];

    // 混淆開關
    this._listeners.push(
      UIManager.bindEvent('mainSwitch', 'click', () => {
        const newState = !this.settings.useObfuscation;
        this.settings.useObfuscation = newState;
        UIManager.updateSwitch('mainSwitch', newState);
        this.saveSettings();
        logger.log('混淆功能狀態切換:', newState ? '啟用' : '停用');
      })
    );

    // GameConfig 來源開關
    this._listeners.push(
      UIManager.bindEvent('gameConfigSwitch', 'click', () => {
        const newState = !this.settings.usePreviewTemplates;
        this.settings.usePreviewTemplates = newState;
        UIManager.updateSwitch('gameConfigSwitch', newState);
        this.saveSettings();
        logger.log('GameConfig來源切換:', newState ? 'preview-templates' : 'build-templates');
      })
    );

    // Git自動更新開關
    this._listeners.push(
      UIManager.bindEvent('gitAutoUpdateSwitch', 'click', () => {
        const newState = !this.settings.gitAutoUpdate;
        this.settings.gitAutoUpdate = newState;
        UIManager.updateSwitch('gitAutoUpdateSwitch', newState);
        this.saveSettings();
        logger.log('Git自動更新狀態切換:', newState ? '啟用' : '停用');
      })
    );

    // Git分支選擇
    this._listeners.push(
      UIManager.bindEvent('gitBranch', 'change', (event) => {
        const branchName = event.target.value;
        this.settings.gitBranch = branchName;
        // 同步標籤前綴
        this.syncTagPrefixWithBranch(branchName);
        this.saveSettings();
        logger.log('Git分支已更改:', branchName);
      })
    );

    // Git標籤前綴
    this._listeners.push(
      UIManager.bindEvent('gitTagPrefix', 'input', (event) => {
        this.settings.gitTagPrefix = event.target.value;
        this.saveSettings();
        logger.log('Git標籤前綴已更改:', event.target.value);
      })
    );

    // Git提交信息
    this._listeners.push(
      UIManager.bindEvent('gitCommitMessage', 'input', (event) => {
        this.settings.gitCommitMessage = event.target.value;
        this.saveSettings();
        logger.log('Git提交信息已更改:', event.target.value);
      })
    );

    logger.log('事件監聽器初始化完成');
  },

  /**
   * 保存設置
   */
  async saveSettings() {
    try {
      const settings = this.getCurrentSettings();
      await configManager.saveToMain(settings);
      logger.log('設置已保存');
    } catch (err) {
      logger.error('保存設置失敗:', err);
    }
  },

  /**
   * 加載設置
   * @returns {Promise<Object>} 設置對象
   */
  async loadSettings() {
    try {
      return configManager.loadSettings();
    } catch (err) {
      logger.error('加載設置失敗:', err);
      return configManager.defaultSettings;
    }
  },

  /**
   * 加載Git分支列表
   */
  async loadGitBranches() {
    try {
      logger.log('開始加載Git分支列表...');
      
      const gitStatus = GitManager.checkGitAvailable();
      if (!gitStatus.available) {
        throw new Error(gitStatus.message || 'Git不可用');
      }

      // 獲取分支列表
      const branches = GitManager.getBranches();
      logger.log('成功加載Git分支列表:', branches);
      UIManager.updateBranchList(branches, this.settings.gitBranch);
    } catch (err) {
      logger.error('加載Git分支失敗:', err.message);
      throw err; // 向上拋出錯誤，讓調用者處理
    }
  },

  /**
   * 設置默認分支選項
   */
  setDefaultBranches() {
    const defaultBranches = ['mega_h5_dev', 'main', 'mega_h5_test'];
    UIManager.updateBranchList(defaultBranches, this.settings.gitBranch);
    this.syncTagPrefixWithBranch();
  },

  /**
   * 等待Shadow DOM準備就緒
   * @returns {Promise<void>}
   */
  async waitForShadowDOM() {
    return new Promise((resolve) => {
      const checkShadowDOM = () => {
        const panel = this.shadowRoot;
        if (panel) {
          logger.log('Shadow DOM已就緒');
          resolve();
        } else {
          logger.log('等待Shadow DOM...');
          setTimeout(checkShadowDOM, 100);
        }
      };
      checkShadowDOM();
    });
  },

  /**
   * 面板就緒時調用
   */
  ready() {
    if (!this.shadowRoot) {
      logger.error('面板未準備好：找不到Shadow Root');
      return;
    }

    // 通知 UIManager
    UIManager.setShadowRoot(this.shadowRoot);
    
    // 初始化面板
    this.initialize().catch(err => {
      logger.error('面板初始化失敗:', err);
      UIManager.showStatus('初始化失敗，請重試', 'error');
    });
  },

  /**
   * 初始化面板
   */
  async initialize() {
    if (this._initialized) {
      logger.log('面板已初始化，跳過');
      return;
    }

    try {
      logger.log('開始初始化面板...');
      
      // 加載設置
      const settings = await this.loadSettings();
      if (!settings) {
        throw new Error('無法加載設置');
      }

      // 檢查Git狀態
      const gitStatus = GitManager.checkGitAvailable();
      settings.gitAvailable = gitStatus.available;
      settings.gitErrorMessage = gitStatus.message;
      
      // 確保標籤前綴有值
      if (!settings.gitTagPrefix) {
        settings.gitTagPrefix = settings.gitBranch;
      }

      // 應用設置到界面
      await this.setupUI(settings);
      
      // 如果Git可用，加載分支列表
      if (gitStatus.available) {
        await this.loadGitBranches();
      }

      // 初始化事件監聽器
      this.initializeEventListeners();

      this._initialized = true;
      logger.log('✅ 面板初始化完成');
    } catch (err) {
      logger.error('面板初始化失敗:', err);
      throw err;
    }
  },

  /**
   * 設置界面
   * @param {Object} settings - 設置對象
   */
  async setupUI(settings) {
    try {
      // 應用設置
      this.applySettings(settings);
      
      // 確保標籤前綴與分支同步
      if (!settings.gitTagPrefix) {
        this.syncTagPrefixWithBranch(settings.gitBranch);
      }
      
      // 顯示設置摘要
      this.showSettingsSummary(settings);
      
      // 檢查Git狀態並更新UI
      UIManager.updateGitCard(settings.gitAvailable);
      
      logger.log('界面設置完成');
    } catch (err) {
      logger.error('設置界面失敗:', err);
      throw err;
    }
  },

  /**
   * 面板關閉事件
   */
  close() {
    this._initialized = false;
    this._listeners.forEach(cleanup => cleanup());
    this._listeners = [];
    logger.log('面板已關閉');
  }
}); 