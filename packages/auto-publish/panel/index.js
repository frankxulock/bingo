'use strict';

/**
 * Auto Publish Suite Panel
 * Automated publishing with code protection and Git integration
 */
Editor.Panel.extend({
  // 优化的样式 - 添加滚动和更好的布局
  style: `
    :host {
      margin: 0;
      display: flex;
      flex-direction: column;
      height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8f9fa;
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 20px;
      text-align: center;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      flex-shrink: 0;
    }
    
    .scrollable-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }
    
    .content {
      padding: 20px;
      background: white;
    }
    
    .main-switch {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 2px solid #e9ecef;
      margin-bottom: 15px;
      transition: all 0.3s ease;
    }
    
    .main-switch.enabled {
      border-color: #28a745;
      background: #d4edda;
    }
    
    .switch-info {
      flex: 1;
      padding-right: 15px;
    }
    
    .switch-title {
      font-size: 14px;
      font-weight: 600;
      color: #495057;
      margin-bottom: 4px;
    }
    
    .switch-description {
      font-size: 12px;
      color: #6c757d;
      line-height: 1.3;
    }
    
    .toggle-switch {
      position: relative;
      width: 50px;
      height: 26px;
      background: #ccc;
      border-radius: 13px;
      cursor: pointer;
      transition: background 0.3s ease;
      flex-shrink: 0;
    }
    
    .toggle-switch.active {
      background: #28a745;
    }
    
    .toggle-slider {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 22px;
      height: 22px;
      background: white;
      border-radius: 50%;
      transition: transform 0.3s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .toggle-switch.active .toggle-slider {
      transform: translateX(24px);
    }
    
    .git-config {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      transition: all 0.3s ease;
    }
    
    .config-section {
      margin-bottom: 12px;
    }
    
    .config-section:last-child {
      margin-bottom: 0;
    }
    
    .config-title {
      font-size: 13px;
      font-weight: 600;
      color: #856404;
      margin-bottom: 6px;
    }
    
    .config-input, .config-select {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 13px;
      color: #495057;
      background: white;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
    }
    
    .config-input:focus, .config-select:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }
    
    .config-input::placeholder {
      color: #6c757d;
    }
    
    .refresh-btn {
      width: 32px;
      height: 32px;
      padding: 0;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      color: #495057;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      flex-shrink: 0;
    }
    
    .refresh-btn:hover {
      background: #f8f9fa;
      border-color: #007bff;
      color: #007bff;
    }
    
    .refresh-btn:active {
      background: #e9ecef;
    }
    
    .refresh-btn:disabled {
      background: #e9ecef;
      color: #6c757d;
      cursor: not-allowed;
    }
    
    .features {
      background: #e3f2fd;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 15px;
    }
    
    .features-title {
      font-size: 13px;
      font-weight: 600;
      color: #1565c0;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
    }
    
    .feature-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .feature-item {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      font-size: 12px;
      color: #1976d2;
    }
    
    .feature-item:last-child {
      margin-bottom: 0;
    }
    
    .feature-icon {
      margin-right: 6px;
      font-size: 11px;
      width: 16px;
      text-align: center;
    }
    
    .footer {
      padding: 12px 20px;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
      font-size: 11px;
      color: #6c757d;
      text-align: center;
      flex-shrink: 0;
    }
    
    .status {
      padding: 12px;
      border-radius: 6px;
      text-align: center;
      font-size: 13px;
      font-weight: 500;
      display: none;
      transition: all 0.3s ease;
      margin: 15px 20px;
      position: fixed;
      bottom: 60px;
      left: 0;
      right: 0;
      z-index: 1000;
    }
    
    .status.success {
      background: #d1edff;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }
    
    .status.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    
    .status.show {
      display: block;
    }
    
    /* 滚动条样式 */
    .scrollable-content::-webkit-scrollbar {
      width: 6px;
    }
    
    .scrollable-content::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    
    .scrollable-content::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }
    
    .scrollable-content::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  `,

  // 更新的模板 - 中文界面
  template: `
    <div class="header">
      🚀 自动发布套件
    </div>
    
    <div class="scrollable-content">
      <div class="content">
        <div class="main-switch" id="mainSwitch">
          <div class="switch-info">
            <div class="switch-title">代码混淆</div>
            <div class="switch-description">
              启用 JavaScript 代码混淆保护
            </div>
          </div>
          <div class="toggle-switch" id="toggleSwitch">
            <div class="toggle-slider"></div>
          </div>
        </div>
        
        <div class="main-switch" id="gameConfigSwitch">
          <div class="switch-info">
            <div class="switch-title">使用开发版配置</div>
            <div class="switch-description">
              从 preview-templates 复制配置而非 build-templates
            </div>
          </div>
          <div class="toggle-switch" id="gameConfigToggle">
            <div class="toggle-slider"></div>
          </div>
        </div>
        
        <div class="main-switch" id="gitAutoUpdateSwitch">
          <div class="switch-info">
            <div class="switch-title">Git 自动发布</div>
            <div class="switch-description">
              构建完成后自动提交代码并创建标签
            </div>
          </div>
          <div class="toggle-switch" id="gitAutoUpdateToggle">
            <div class="toggle-slider"></div>
          </div>
        </div>
        
        <div class="git-config" id="gitConfig" style="display: none;">
          <div class="config-section">
            <div class="config-title">目标分支</div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <select id="gitBranch" class="config-select" style="flex: 1;">
                <option value="mega_h5_dev">mega_h5_dev</option>
              </select>
              <button id="refreshBranches" class="refresh-btn" title="刷新分支列表">🔄</button>
            </div>
          </div>
          <div class="config-section">
            <div class="config-title">标签前缀</div>
            <input type="text" id="gitTagPrefix" placeholder="mega_h5_dev" value="mega_h5_dev" class="config-input">
          </div>
          <div class="config-section">
            <div class="config-title">提交信息（可选）</div>
            <input type="text" id="gitCommitMessage" placeholder="留空则使用默认信息" class="config-input">
          </div>
        </div>
        
        <div class="features">
          <div class="features-title">
            ⚙️ 默认启用功能
          </div>
          <ul class="feature-list">
            <li class="feature-item">
              <span class="feature-icon">📋</span>
              GameConfig 文件复制和环境检测
            </li>
            <li class="feature-item">
              <span class="feature-icon">🔄</span>
              HTML 引用文件版本号自动更新
            </li>
            <li class="feature-item">
              <span class="feature-icon">🗜️</span>
              基础代码优化和清理
            </li>
            <li class="feature-item">
              <span class="feature-icon">🔒</span>
              代码混淆（需在上方启用）
            </li>
            <li class="feature-item">
              <span class="feature-icon">🚀</span>
              Git 自动发布并生成时间戳标签
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <div class="footer">
      文件处理功能始终启用 • 代码混淆和 Git 发布可选
    </div>
    
    <div class="status" id="statusDiv">
      <span id="statusMessage"></span>
    </div>
  `,

  // 固定的最佳设置
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

  // 事件监听器存储
  _listeners: [],

  /**
   * 安全的DOM查询方法
   * @param {string} selector CSS选择器
   * @returns {Element|null} DOM元素
   */
  querySelector(selector) {
    try {
      // 优先使用shadowRoot
      if (this.shadowRoot) {
        return this.shadowRoot.querySelector(selector);
      }
      // 回退到this.$el
      if (this.$el) {
        return this.$el.querySelector(selector);
      }
      // 最后回退到document
      return document.querySelector(selector);
    } catch (err) {
      console.warn('DOM查询失败:', selector, err);
      return null;
    }
  },

  /**
   * 获取当前设置（混淆功能和GameConfig来源可变）
   * @returns {Object} 当前设置对象
   */
  getCurrentSettings() {
    const toggleSwitch = this.querySelector('#toggleSwitch');
    const gameConfigToggle = this.querySelector('#gameConfigToggle');
    const gitAutoUpdateToggle = this.querySelector('#gitAutoUpdateToggle');
    const gitBranch = this.querySelector('#gitBranch');
    const gitTagPrefix = this.querySelector('#gitTagPrefix');
    const gitCommitMessage = this.querySelector('#gitCommitMessage');
    
    const useObfuscation = toggleSwitch ? toggleSwitch.classList.contains('active') : false;
    const usePreviewTemplates = gameConfigToggle ? gameConfigToggle.classList.contains('active') : true;
    const gitAutoUpdate = gitAutoUpdateToggle ? gitAutoUpdateToggle.classList.contains('active') : true;
    
    return {
      ...this.settings,        // 使用固定的最佳设置
      useObfuscation: useObfuscation,           // 混淆功能可以改变
      usePreviewTemplates: usePreviewTemplates, // GameConfig来源可以改变
      gitAutoUpdate: gitAutoUpdate,             // git自动更新可以改变
      gitBranch: gitBranch ? gitBranch.value || 'mega_h5_dev' : 'mega_h5_dev',
      gitTagPrefix: gitTagPrefix ? gitTagPrefix.value || 'mega_h5_dev' : 'mega_h5_dev',
      gitCommitMessage: gitCommitMessage ? gitCommitMessage.value || '' : ''
    };
  },

  /**
   * 应用设置到界面
   * @param {Object} settings 设置对象
   */
  applySettings(settings) {
    const toggleSwitch = this.querySelector('#toggleSwitch');
    const gameConfigToggle = this.querySelector('#gameConfigToggle');
    const gitAutoUpdateToggle = this.querySelector('#gitAutoUpdateToggle');
    const mainSwitch = this.querySelector('#mainSwitch');
    const gameConfigSwitch = this.querySelector('#gameConfigSwitch');
    const gitAutoUpdateSwitch = this.querySelector('#gitAutoUpdateSwitch');
    const gitConfig = this.querySelector('#gitConfig');
    const gitBranch = this.querySelector('#gitBranch');
    const gitTagPrefix = this.querySelector('#gitTagPrefix');
    const gitCommitMessage = this.querySelector('#gitCommitMessage');
    
    if (toggleSwitch && mainSwitch) {
      if (settings.useObfuscation) {
        toggleSwitch.classList.add('active');
        mainSwitch.classList.add('enabled');
      } else {
        toggleSwitch.classList.remove('active');
        mainSwitch.classList.remove('enabled');
      }
    }
    
    if (gameConfigToggle && gameConfigSwitch) {
      if (settings.usePreviewTemplates) {
        gameConfigToggle.classList.add('active');
        gameConfigSwitch.classList.add('enabled');
      } else {
        gameConfigToggle.classList.remove('active');
        gameConfigSwitch.classList.remove('enabled');
      }
    }
    
    if (gitAutoUpdateToggle && gitAutoUpdateSwitch && gitConfig) {
      if (settings.gitAutoUpdate) {
        gitAutoUpdateToggle.classList.add('active');
        gitAutoUpdateSwitch.classList.add('enabled');
        gitConfig.style.display = 'block';
      } else {
        gitAutoUpdateToggle.classList.remove('active');
        gitAutoUpdateSwitch.classList.remove('enabled');
        gitConfig.style.display = 'none';
      }
    }
    
    // 设置输入框的值
    if (gitBranch) gitBranch.value = settings.gitBranch || 'mega_h5_dev';
    if (gitTagPrefix) gitTagPrefix.value = settings.gitTagPrefix || 'mega_h5_dev';
    if (gitCommitMessage) gitCommitMessage.value = settings.gitCommitMessage || '';
    
    // 如果Git自动更新已启用，延迟刷新分支列表
    if (settings.gitAutoUpdate && gitConfig && gitConfig.style.display !== 'none') {
      setTimeout(() => {
        this.loadGitBranches();
      }, 100);
    }
  },

  /**
   * 切换混淆功能状态
   */
  toggleObfuscation() {
    const currentSettings = this.getCurrentSettings();
    const newSettings = {
      ...currentSettings,
      useObfuscation: !currentSettings.useObfuscation
    };
    
    this.applySettings(newSettings);
    this.settings = newSettings;
    this.saveSettings();
    
    const status = newSettings.useObfuscation ? '已启用' : '已禁用';
    this.showStatus(`🔒 代码混淆${status}`, 'success');
  },

  /**
   * 切换GameConfig来源
   */
  toggleGameConfigSource() {
    const currentSettings = this.getCurrentSettings();
    const newSettings = {
      ...currentSettings,
      usePreviewTemplates: !currentSettings.usePreviewTemplates
    };
    
    this.applySettings(newSettings);
    this.settings = newSettings;
    this.saveSettings();
    
    const source = newSettings.usePreviewTemplates ? 'preview-templates (开发版)' : 'build-templates (构建版)';
    this.showStatus(`📋 GameConfig 来源: ${source}`, 'success');
  },

  /**
   * 切换Git自动更新
   */
  toggleGitAutoUpdate() {
    const currentSettings = this.getCurrentSettings();
    const newSettings = {
      ...currentSettings,
      gitAutoUpdate: !currentSettings.gitAutoUpdate
    };
    
    this.applySettings(newSettings);
    this.settings = newSettings;
    this.saveSettings();
    
    const status = newSettings.gitAutoUpdate ? '已启用' : '已禁用';
    this.showStatus(`🔧 Git自动更新${status}`, 'success');
    
    // 如果启用了Git自动更新，加载分支列表
    if (newSettings.gitAutoUpdate) {
      setTimeout(() => {
        this.loadGitBranches();
      }, 100);
    }
  },

  /**
   * 直接保存设置到文件（备用方案）
   */
  saveSettingsToFile(settings) {
    console.log('📁 尝试直接保存设置到文件...');
    
    try {
      // 尝试通过 Editor.require 保存设置
      if (typeof Editor !== 'undefined' && Editor.require) {
        try {
          const fs = Editor.require('fs');
          const path = Editor.require('path');
          
          // 获取插件路径
          const pluginPath = Editor.url('packages://auto-publish/');
          const settingsPath = path.join(pluginPath, 'settings.json');
          
          // 写入设置文件
          const settingsContent = JSON.stringify(settings, null, 2);
          fs.writeFileSync(settingsPath, settingsContent, 'utf8');
          
          console.log('📄 设置已直接保存到文件:', settings);
          this.showStatus('✅ 设置保存成功！', 'success');
          return true;
          
        } catch (err) {
          console.warn('❌ 通过 Editor.require 保存设置失败:', err.message);
          this.showStatus('❌ 设置保存失败！', 'error');
          return false;
        }
      }
      
      console.warn('⚠️ Editor.require 不可用，无法直接保存设置');
      this.showStatus('⚠️ 设置保存功能不可用', 'error');
      return false;
      
    } catch (err) {
      console.error('❌ 保存设置文件失败:', err.message);
      this.showStatus('❌ 设置保存失败！', 'error');
      return false;
    }
  },

  /**
   * 保存设置到主进程
   */
  saveSettings() {
    const settings = this.getCurrentSettings();
    console.log('💾 开始保存设置:', settings);
    
    // 设置保存超时处理
    let settingsSaved = false;
    const saveTimeout = setTimeout(() => {
      if (!settingsSaved) {
        console.warn('⏰ IPC 设置保存超时，尝试直接保存到文件...');
        this.saveSettingsToFile(settings);
      }
    }, 1500); // 1.5秒超时
    
    // 兼容不同版本的IPC API
    if (typeof Editor !== 'undefined') {
      try {
        if (Editor.Ipc && typeof Editor.Ipc.sendToMain === 'function') {
          Editor.Ipc.sendToMain('auto-publish:save-settings', settings);
          console.log('📤 已通过 Editor.Ipc.sendToMain 发送保存请求');
        } else if (typeof Editor.sendToMain === 'function') {
          Editor.sendToMain('auto-publish:save-settings', settings);
          console.log('📤 已通过 Editor.sendToMain 发送保存请求');
        } else {
          console.warn('IPC发送不可用，直接保存到文件');
          clearTimeout(saveTimeout);
          settingsSaved = true;
          this.saveSettingsToFile(settings);
        }
      } catch (err) {
        console.warn('IPC 保存请求失败，直接保存到文件:', err);
        clearTimeout(saveTimeout);
        settingsSaved = true;
        this.saveSettingsToFile(settings);
      }
    } else {
      console.warn('非编辑器环境，无法保存设置');
      clearTimeout(saveTimeout);
      settingsSaved = true;
      this.showStatus('⚠️ 非编辑器环境，无法保存设置', 'error');
    }
    
    // 存储超时处理器和标志
    this._saveTimeout = saveTimeout;
    this._settingsSaved = () => {
      settingsSaved = true;
      clearTimeout(saveTimeout);
    };
  },

  /**
   * 显示状态消息
   * @param {string} message 消息内容
   * @param {string} type 消息类型 ('success' | 'error')
   */
  showStatus(message, type = 'success') {
    const statusDiv = this.querySelector('#statusDiv');
    const statusMessage = this.querySelector('#statusMessage');
    
    if (statusMessage) statusMessage.textContent = message;
    if (statusDiv) statusDiv.className = `status ${type} show`;
    
    // 3秒后自动隐藏
    setTimeout(() => {
      if (statusDiv) statusDiv.className = 'status';
    }, 3000);
  },

  /**
   * 直接从文件加载设置（备用方案）
   */
  loadSettingsFromFile() {
    console.log('📁 尝试直接从文件加载设置...');
    
    try {
      // 尝试通过 Editor.require 加载设置
      if (typeof Editor !== 'undefined' && Editor.require) {
        try {
          const fs = Editor.require('fs');
          const path = Editor.require('path');
          
          // 获取插件路径
          const pluginPath = Editor.url('packages://auto-publish/');
          const settingsPath = path.join(pluginPath, 'settings.json');
          
          if (fs.existsSync(settingsPath)) {
            const settingsContent = fs.readFileSync(settingsPath, 'utf8');
            const fileSettings = JSON.parse(settingsContent);
            
            console.log('📄 从文件加载的设置:', fileSettings);
            
            // 合并默认设置和文件设置
            const mergedSettings = { ...this.settings, ...fileSettings };
            this.settings = mergedSettings;
            this.applySettings(mergedSettings);
            
            console.log('✅ 设置已从文件加载并应用');
            return true;
          } else {
            console.log('⚠️ 设置文件不存在，使用默认设置');
          }
        } catch (err) {
          console.warn('❌ 通过 Editor.require 加载设置失败:', err.message);
        }
      }
      
      // 如果上面的方法失败，使用默认设置
      console.log('🔄 使用默认设置');
      this.applySettings(this.settings);
      return false;
      
    } catch (err) {
      console.error('❌ 加载设置文件失败:', err.message);
      this.applySettings(this.settings);
      return false;
    }
  },

  /**
   * 从主进程加载设置
   */
  loadSettings() {
    console.log('🔄 面板开始加载设置...');
    
    // 设置加载超时处理
    let settingsLoaded = false;
    const loadTimeout = setTimeout(() => {
      if (!settingsLoaded) {
        console.warn('⏰ IPC 设置加载超时，尝试直接从文件加载...');
        this.loadSettingsFromFile();
      }
    }, 1500); // 减少到1.5秒超时
    
    // 兼容不同版本的IPC API
    if (typeof Editor !== 'undefined') {
      try {
        if (Editor.Ipc && typeof Editor.Ipc.sendToMain === 'function') {
          Editor.Ipc.sendToMain('auto-publish:load-settings');
          console.log('📤 已通过 Editor.Ipc.sendToMain 请求设置');
        } else if (typeof Editor.sendToMain === 'function') {
          Editor.sendToMain('auto-publish:load-settings');
          console.log('📤 已通过 Editor.sendToMain 请求设置');
        } else {
          console.warn('IPC发送不可用，直接从文件加载设置');
          clearTimeout(loadTimeout);
          settingsLoaded = true;
          this.loadSettingsFromFile();
        }
      } catch (err) {
        console.warn('IPC 请求失败，直接从文件加载设置:', err);
        clearTimeout(loadTimeout);
        settingsLoaded = true;
        this.loadSettingsFromFile();
      }
    } else {
      // 如果不在编辑器环境中，使用默认设置
      console.log('非编辑器环境，使用默认设置');
      clearTimeout(loadTimeout);
      settingsLoaded = true;
      this.applySettings(this.settings);
    }
    
    // 存储超时处理器和标志，以便在收到设置时清理
    this._loadTimeout = loadTimeout;
    this._settingsLoaded = () => {
      settingsLoaded = true;
      clearTimeout(loadTimeout);
    };
  },

  /**
   * 添加事件监听器的安全方法
   * @param {Element} element DOM元素
   * @param {string} event 事件名称
   * @param {Function} handler 事件处理函数
   */
  addListener(element, event, handler) {
    if (element && typeof element.addEventListener === 'function') {
      element.addEventListener(event, handler);
      this._listeners.push({ element, event, handler });
    }
  },

  /**
   * 面板就绪事件
   */
  ready() {
    // 等待DOM准备就绪
    setTimeout(() => {
      // 绑定开关点击事件
      const toggleSwitch = this.querySelector('#toggleSwitch');
      const gameConfigToggle = this.querySelector('#gameConfigToggle');
      const gitAutoUpdateToggle = this.querySelector('#gitAutoUpdateToggle');
      const mainSwitch = this.querySelector('#mainSwitch');
      const gameConfigSwitch = this.querySelector('#gameConfigSwitch');
      const gitAutoUpdateSwitch = this.querySelector('#gitAutoUpdateSwitch');
      const gitBranch = this.querySelector('#gitBranch');
      const gitTagPrefix = this.querySelector('#gitTagPrefix');
      const gitCommitMessage = this.querySelector('#gitCommitMessage');
      const refreshBranches = this.querySelector('#refreshBranches');
      
      this.addListener(toggleSwitch, 'click', () => {
        this.toggleObfuscation();
      });
      
      this.addListener(gameConfigToggle, 'click', () => {
        this.toggleGameConfigSource();
      });
      
      this.addListener(gitAutoUpdateToggle, 'click', () => {
        this.toggleGitAutoUpdate();
      });
      
      this.addListener(mainSwitch, 'click', () => {
        this.toggleObfuscation();
      });
      
      this.addListener(gameConfigSwitch, 'click', () => {
        this.toggleGameConfigSource();
      });
      
      this.addListener(gitAutoUpdateSwitch, 'click', () => {
        this.toggleGitAutoUpdate();
      });
      
      // 绑定输入框变化事件
      this.addListener(gitBranch, 'change', () => {
        // 当分支改变时，自动同步标签前缀
        this.syncTagPrefixWithBranch();
        this.saveSettings();
      });
      
      this.addListener(gitTagPrefix, 'input', () => {
        this.saveSettings();
      });
      
      this.addListener(gitCommitMessage, 'input', () => {
        this.saveSettings();
      });

      // 刷新分支按钮事件
      this.addListener(refreshBranches, 'click', () => {
        const btn = this.querySelector('#refreshBranches');
        if (btn) {
          btn.disabled = true;
          btn.textContent = '⏳';
        }
        
        this.loadGitBranches();
        
        setTimeout(() => {
          if (btn) {
            btn.disabled = false;
            btn.textContent = '🔄';
          }
        }, 1000);
      });

      // 加载设置
      this.loadSettings();
      
      // 延迟加载Git分支列表，确保设置已加载
      setTimeout(() => {
        this.loadGitBranches();
      }, 300);
    }, 100);
    
    // 监听主进程消息 - 兼容不同版本的IPC API
    if (typeof Editor !== 'undefined') {
      try {
        // 尝试使用 Editor.Ipc.on
        if (Editor.Ipc && typeof Editor.Ipc.on === 'function') {
          Editor.Ipc.on('auto-publish:settings-loaded', (event, settings) => {
            console.log('📥 收到设置数据:', settings);
            
            // 清理超时处理
            if (this._settingsLoaded) {
              this._settingsLoaded();
            }
            
            if (settings) {
              this.settings = { ...this.settings, ...settings };
              this.applySettings(this.settings);
              console.log('✅ 设置已应用到界面:', this.settings);
            } else {
              console.log('⚠️ 收到空设置，使用默认设置');
              this.applySettings(this.settings);
            }
          });

          Editor.Ipc.on('auto-publish:settings-saved', (event, success) => {
            console.log('💾 设置保存结果:', success);
            
            // 清理超时处理
            if (this._settingsSaved) {
              this._settingsSaved();
            }
            
            if (success) {
              this.showStatus('✅ 设置保存成功！', 'success');
            } else {
              this.showStatus('❌ 设置保存失败！', 'error');
            }
          });
        }
        // 尝试使用 Editor.on (旧版本API)
        else if (typeof Editor.on === 'function') {
          Editor.on('auto-publish:settings-loaded', (event, settings) => {
            console.log('📥 收到设置数据 (旧API):', settings);
            
            // 清理超时处理
            if (this._settingsLoaded) {
              this._settingsLoaded();
            }
            
            if (settings) {
              this.settings = { ...this.settings, ...settings };
              this.applySettings(this.settings);
              console.log('✅ 设置已应用到界面 (旧API):', this.settings);
            } else {
              console.log('⚠️ 收到空设置，使用默认设置 (旧API)');
              this.applySettings(this.settings);
            }
          });

          Editor.on('auto-publish:settings-saved', (event, success) => {
            console.log('💾 设置保存结果 (旧API):', success);
            
            // 清理超时处理
            if (this._settingsSaved) {
              this._settingsSaved();
            }
            
            if (success) {
              this.showStatus('✅ 设置保存成功！', 'success');
            } else {
              this.showStatus('❌ 设置保存失败！', 'error');
            }
          });
        }
      } catch (err) {
        console.warn('设置IPC监听失败:', err);
      }
    }
  },

  /**
   * 面板关闭事件
   */
  close() {
    // 清理事件监听器
    this._listeners.forEach(({ element, event, handler }) => {
      if (element && typeof element.removeEventListener === 'function') {
        element.removeEventListener(event, handler);
      }
    });
    this._listeners = [];
    
    // 清理IPC监听器（兼容不同版本）
    if (typeof Editor !== 'undefined') {
      try {
        // 尝试使用 Editor.Ipc.off
        if (Editor.Ipc && typeof Editor.Ipc.off === 'function') {
          Editor.Ipc.off('auto-publish:settings-loaded');
          Editor.Ipc.off('auto-publish:settings-saved');
        }
        // 尝试使用 Editor.off (旧版本API)
        else if (typeof Editor.off === 'function') {
          Editor.off('auto-publish:settings-loaded');
          Editor.off('auto-publish:settings-saved');
        }
      } catch (err) {
        console.warn('清理IPC监听器失败:', err);
      }
    }
  },

  /**
   * 加载Git分支列表
   */
  loadGitBranches() {
    console.log('🌿 开始加载Git分支列表...');
    
    try {
      // 尝试通过 Editor.require 获取git-handler
      if (typeof Editor !== 'undefined' && Editor.require) {
        try {
          const path = Editor.require('path');
          const pluginPath = Editor.url('packages://auto-publish/');
          const gitHandlerPath = path.join(pluginPath, 'git-handler.js');
          
          // 删除require缓存以确保获取最新版本
          delete require.cache[gitHandlerPath];
          const gitHandler = require(gitHandlerPath);
          
          // 获取项目根路径，然后指向 build/dev 目录
          const projectPath = Editor.Project && Editor.Project.path ? Editor.Project.path : process.cwd();
          const buildDevPath = path.join(projectPath, 'build', 'dev');
          
          console.log('📁 检查 build/dev 目录的Git分支:', buildDevPath);
          
          // 获取分支列表
          const branches = gitHandler.getAllBranches(buildDevPath);
          
          console.log('📋 获取到的分支列表:', branches);
          
          // 更新分支选择框
          const gitBranch = this.querySelector('#gitBranch');
          if (gitBranch && branches && branches.length > 0) {
            // 保存当前选中的值
            const currentValue = gitBranch.value || 'mega_h5_dev';
            
            // 清空现有选项
            gitBranch.innerHTML = '';
            
            // 添加分支选项
            branches.forEach(branch => {
              const option = document.createElement('option');
              option.value = branch;
              option.textContent = branch;
              gitBranch.appendChild(option);
            });
            
            // 恢复之前选中的值，如果不存在则选择第一个
            if (branches.includes(currentValue)) {
              gitBranch.value = currentValue;
            } else if (branches.includes('mega_h5_dev')) {
              gitBranch.value = 'mega_h5_dev';
            } else if (branches.length > 0) {
              gitBranch.value = branches[0];
            }
            
            // 同步标签前缀与所选分支
            this.syncTagPrefixWithBranch();
            
            console.log('✅ 分支列表已更新，当前选中:', gitBranch.value);
            this.showStatus('✅ 分支列表已更新', 'success');
          } else {
            console.warn('⚠️ 分支选择框未找到或分支列表为空');
            this.showStatus('⚠️ 无法获取分支列表', 'error');
          }
          
        } catch (err) {
          console.warn('❌ 加载Git分支失败:', err.message);
          this.showStatus('❌ 加载分支列表失败', 'error');
          this.setDefaultBranches();
        }
      } else {
        console.warn('⚠️ Editor.require 不可用，使用默认分支');
        this.setDefaultBranches();
      }
    } catch (err) {
      console.error('❌ 加载Git分支过程中发生错误:', err.message);
      this.setDefaultBranches();
    }
  },

  /**
   * 设置默认分支选项（备用方案）
   */
  setDefaultBranches() {
    const gitBranch = this.querySelector('#gitBranch');
    if (gitBranch) {
      const defaultBranches = ['mega_h5_dev', 'main', 'mega_h5_test'];
      const currentValue = gitBranch.value || 'mega_h5_dev';
      
      gitBranch.innerHTML = '';
      
      defaultBranches.forEach(branch => {
        const option = document.createElement('option');
        option.value = branch;
        option.textContent = branch;
        gitBranch.appendChild(option);
      });
      
      // 恢复选中值
      if (defaultBranches.includes(currentValue)) {
        gitBranch.value = currentValue;
      } else {
        gitBranch.value = 'mega_h5_dev';
      }
      
      // 同步标签前缀与所选分支
      this.syncTagPrefixWithBranch();
      
      console.log('🔄 已设置默认分支列表');
    }
  },

  /**
   * 当分支改变时，自动同步标签前缀
   */
  syncTagPrefixWithBranch() {
    const gitBranch = this.querySelector('#gitBranch');
    const gitTagPrefix = this.querySelector('#gitTagPrefix');
    
    if (gitBranch && gitTagPrefix) {
      const selectedBranch = gitBranch.value;
      
      if (selectedBranch && selectedBranch !== gitTagPrefix.value) {
        gitTagPrefix.value = selectedBranch;
        console.log(`🏷️ 标签前缀已自动更新为: ${selectedBranch}`);
        this.showStatus(`🏷️ 标签前缀已更新为: ${selectedBranch}`, 'success');
      }
    }
  }
}); 