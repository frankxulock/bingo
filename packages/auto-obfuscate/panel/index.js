'use strict';

/**
 * 简化的 Auto-Obfuscate 面板
 * 只提供启用/禁用功能，其他设置固定为最佳配置
 */
Editor.Panel.extend({
  // 简洁的样式
  style: `
    :host {
      margin: 20px;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8f9fa;
      border-radius: 12px;
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      text-align: center;
      font-weight: 600;
      font-size: 18px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .content {
      padding: 30px;
      background: white;
    }
    
    .main-switch {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
      border: 2px solid #e9ecef;
      margin-bottom: 20px;
      transition: all 0.3s ease;
    }
    
    .main-switch.enabled {
      border-color: #28a745;
      background: #d4edda;
    }
    
    .switch-info {
      flex: 1;
    }
    
    .switch-title {
      font-size: 16px;
      font-weight: 600;
      color: #495057;
      margin-bottom: 5px;
    }
    
    .switch-description {
      font-size: 14px;
      color: #6c757d;
      line-height: 1.4;
    }
    
    .toggle-switch {
      position: relative;
      width: 60px;
      height: 30px;
      background: #ccc;
      border-radius: 15px;
      cursor: pointer;
      transition: background 0.3s ease;
    }
    
    .toggle-switch.active {
      background: #28a745;
    }
    
    .toggle-slider {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 24px;
      height: 24px;
      background: white;
      border-radius: 50%;
      transition: transform 0.3s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .toggle-switch.active .toggle-slider {
      transform: translateX(30px);
    }
    
    .features {
      background: #e3f2fd;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    
    .features-title {
      font-size: 14px;
      font-weight: 600;
      color: #1565c0;
      margin-bottom: 15px;
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
      margin-bottom: 8px;
      font-size: 13px;
      color: #1976d2;
    }
    
    .feature-item:last-child {
      margin-bottom: 0;
    }
    
    .feature-icon {
      margin-right: 8px;
      font-size: 12px;
    }
    
    .status {
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      font-size: 14px;
      font-weight: 500;
      display: none;
      transition: all 0.3s ease;
      margin-top: 20px;
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
    
    .footer {
      padding: 15px 30px;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
      font-size: 12px;
      color: #6c757d;
      text-align: center;
    }
  `,

  // 简化的模板 - 只有一个开关
  template: `
    <div class="header">
      🔒 代码保护插件
    </div>
    
    <div class="content">
      <div class="main-switch" id="mainSwitch">
        <div class="switch-info">
          <div class="switch-title">启用代码混淆</div>
          <div class="switch-description">
            开启后将对代码进行混淆处理，文件检查和配置处理始终进行
          </div>
        </div>
        <div class="toggle-switch" id="toggleSwitch">
          <div class="toggle-slider"></div>
        </div>
      </div>
      
      <div class="main-switch" id="gameConfigSwitch">
        <div class="switch-info">
          <div class="switch-title">使用开发版 GameConfig</div>
          <div class="switch-description">
            开启时从 preview-templates 拷贝，关闭时从 build-templates 拷贝
          </div>
        </div>
        <div class="toggle-switch" id="gameConfigToggle">
          <div class="toggle-slider"></div>
        </div>
      </div>
      
      <div class="features">
        <div class="features-title">
          ⚙️ 始终启用的功能
        </div>
        <ul class="feature-list">
          <li class="feature-item">
            <span class="feature-icon">📋</span>
            GameConfig 文件拷贝 - 从指定目录获取配置
          </li>
          <li class="feature-item">
            <span class="feature-icon">⚙️</span>
            环境配置自动替换 - 根据构建路径检测环境
          </li>
          <li class="feature-item">
            <span class="feature-icon">🔄</span>
            HTML 引用自动更新 - 确保文件路径正确
          </li>
          <li class="feature-item">
            <span class="feature-icon">🗜️</span>
            基本代码优化 - 移除注释和多余空白
          </li>
          <li class="feature-item">
            <span class="feature-icon">🔒</span>
            代码混淆处理 - 根据上方开关决定是否启用
          </li>
        </ul>
      </div>
    </div>
    
    <div class="footer">
      文件检查和配置处理始终进行，混淆功能和配置来源可选
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
    processGameConfig: true      // 固定启用配置处理
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
    const useObfuscation = toggleSwitch ? toggleSwitch.classList.contains('active') : false;
    const usePreviewTemplates = gameConfigToggle ? gameConfigToggle.classList.contains('active') : true;
    
    return {
      ...this.settings,        // 使用固定的最佳设置
      useObfuscation: useObfuscation,           // 混淆功能可以改变
      usePreviewTemplates: usePreviewTemplates  // GameConfig来源可以改变
    };
  },

  /**
   * 应用设置到界面
   * @param {Object} settings 设置对象
   */
  applySettings(settings) {
    const toggleSwitch = this.querySelector('#toggleSwitch');
    const gameConfigToggle = this.querySelector('#gameConfigToggle');
    const mainSwitch = this.querySelector('#mainSwitch');
    const gameConfigSwitch = this.querySelector('#gameConfigSwitch');
    
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
          const pluginPath = Editor.url('packages://auto-obfuscate/');
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
          Editor.Ipc.sendToMain('auto-obfuscate:save-settings', settings);
          console.log('📤 已通过 Editor.Ipc.sendToMain 发送保存请求');
        } else if (typeof Editor.sendToMain === 'function') {
          Editor.sendToMain('auto-obfuscate:save-settings', settings);
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
          const pluginPath = Editor.url('packages://auto-obfuscate/');
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
          Editor.Ipc.sendToMain('auto-obfuscate:load-settings');
          console.log('📤 已通过 Editor.Ipc.sendToMain 请求设置');
        } else if (typeof Editor.sendToMain === 'function') {
          Editor.sendToMain('auto-obfuscate:load-settings');
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
      const mainSwitch = this.querySelector('#mainSwitch');
      const gameConfigSwitch = this.querySelector('#gameConfigSwitch');
      
      this.addListener(toggleSwitch, 'click', () => {
        this.toggleObfuscation();
      });
      
      this.addListener(gameConfigToggle, 'click', () => {
        this.toggleGameConfigSource();
      });
      
      this.addListener(mainSwitch, 'click', () => {
        this.toggleObfuscation();
      });
      
      this.addListener(gameConfigSwitch, 'click', () => {
        this.toggleGameConfigSource();
      });

      // 加载设置
      this.loadSettings();
    }, 100);
    
    // 监听主进程消息 - 兼容不同版本的IPC API
    if (typeof Editor !== 'undefined') {
      try {
        // 尝试使用 Editor.Ipc.on
        if (Editor.Ipc && typeof Editor.Ipc.on === 'function') {
          Editor.Ipc.on('auto-obfuscate:settings-loaded', (event, settings) => {
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

          Editor.Ipc.on('auto-obfuscate:settings-saved', (event, success) => {
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
          Editor.on('auto-obfuscate:settings-loaded', (event, settings) => {
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

          Editor.on('auto-obfuscate:settings-saved', (event, success) => {
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
          Editor.Ipc.off('auto-obfuscate:settings-loaded');
          Editor.Ipc.off('auto-obfuscate:settings-saved');
        }
        // 尝试使用 Editor.off (旧版本API)
        else if (typeof Editor.off === 'function') {
          Editor.off('auto-obfuscate:settings-loaded');
          Editor.off('auto-obfuscate:settings-saved');
        }
      } catch (err) {
        console.warn('清理IPC监听器失败:', err);
      }
    }
  }
}); 