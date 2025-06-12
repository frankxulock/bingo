'use strict';

const logger = require('../../logger');

/**
 * UI管理模組
 * 處理界面元素的更新和事件綁定
 */
class UIManager {
  /** @type {ShadowRoot|null} */
  static _shadowRoot = null;

  /**
   * 設置Shadow Root
   * @param {ShadowRoot} shadowRoot 
   */
  static setShadowRoot(shadowRoot) {
    if (shadowRoot instanceof ShadowRoot) {
      this._shadowRoot = shadowRoot;
      logger.log('Shadow Root已設置');
    } else {
      logger.error('無效的Shadow Root');
    }
  }

  /**
   * 等待Shadow DOM準備就緒
   * @returns {Promise<ShadowRoot>}
   */
  static async waitForShadowDOM() {
    return new Promise((resolve, reject) => {
      const maxAttempts = 50; // 最多等待5秒
      let attempts = 0;

      const checkShadowDOM = () => {
        if (this._shadowRoot) {
          resolve(this._shadowRoot);
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          logger.error('等待Shadow Root超時');
          reject(new Error('等待Shadow Root超時'));
          return;
        }

        logger.log(`等待Shadow Root... (${attempts}/${maxAttempts})`);
        setTimeout(checkShadowDOM, 100);
      };

      checkShadowDOM();
    });
  }

  /**
   * 獲取Shadow Root
   * @returns {ShadowRoot|null}
   * @private
   */
  static _getShadowRoot() {
    return this._shadowRoot;
  }

  /**
   * 獲取DOM元素
   * @param {string} elementId - 元素ID
   * @returns {Element|null}
   * @private
   */
  static _getElement(elementId) {
    const shadowRoot = this._getShadowRoot();
    if (!shadowRoot) {
      logger.warn('找不到Shadow Root');
      return null;
    }

    // 嘗試通過ID查找
    const element = shadowRoot.getElementById(elementId) || 
                   shadowRoot.querySelector(`#${elementId}`) ||
                   shadowRoot.querySelector(`.${elementId}`);

    if (!element) {
      logger.warn(`找不到元素: ${elementId}`);
      return null;
    }

    return element;
  }

  /**
   * 更新開關狀態
   * @param {string} switchId - 開關ID
   * @param {boolean} active - 是否激活
   */
  static async updateSwitch(switchId, active) {
    await this.waitForShadowDOM();
    
    // 獲取開關容器
    const switchContainer = this._getElement(switchId);
    if (!switchContainer) {
      logger.warn(`找不到開關容器: ${switchId}`);
      return;
    }

    // 獲取開關元素
    const toggleSwitch = switchContainer.querySelector('.toggle-switch');
    if (!toggleSwitch) {
      logger.warn(`找不到開關元素: ${switchId} > .toggle-switch`);
      return;
    }

    // 更新開關狀態
    toggleSwitch.classList.toggle('active', active);
    toggleSwitch.setAttribute('aria-checked', active.toString());

    // 更新開關標籤（如果存在）
    const statusLabel = switchContainer.querySelector('.switch-status');
    if (statusLabel) {
      statusLabel.textContent = active ? '已啟用' : '已停用';
    }

    logger.log('開關狀態更新:', { 
      element: switchId, 
      active,
      container: !!switchContainer,
      toggle: !!toggleSwitch,
      status: !!statusLabel
    });
  }

  /**
   * 更新Git卡片顯示狀態
   * @param {boolean} isAvailable - Git是否可用
   */
  static async updateGitCard(isAvailable) {
    await this.waitForShadowDOM();
    
    // 獲取Git相關區域
    const gitSection = this._getElement('gitSection');
    const gitConfig = this._getElement('gitConfig');
    const gitError = this._getElement('gitError');
    const gitAutoUpdateSwitch = this._getElement('gitAutoUpdateSwitch');
    
    if (!gitSection) {
      logger.warn('找不到Git區域');
      return;
    }

    if (isAvailable) {
      // 顯示Git功能區
      gitSection.style.display = 'block';
      if (gitConfig) gitConfig.style.display = 'block';
      if (gitError) gitError.style.display = 'none';
      if (gitAutoUpdateSwitch) gitAutoUpdateSwitch.style.display = 'block';
      
      // 啟用所有輸入元素
      const inputs = gitSection.querySelectorAll('input, select');
      inputs.forEach(input => {
        input.disabled = false;
      });

      logger.log('Git功能已啟用');
    } else {
      // 隱藏Git功能區
      gitSection.style.display = 'none';
      if (gitConfig) gitConfig.style.display = 'none';
      if (gitAutoUpdateSwitch) gitAutoUpdateSwitch.style.display = 'none';
      
      // 如果有錯誤信息，顯示錯誤區域
      if (gitError) {
        gitError.style.display = 'block';
        gitError.textContent = '自動發布功能需要Git倉庫，請先構建項目並初始化Git倉庫';
      }

      logger.log('Git功能已隱藏');
    }
  }

  /**
   * 顯示狀態提示
   * @param {string} message - 提示信息
   * @param {string} type - 提示類型 ('success' | 'error')
   */
  static async showStatus(message, type = 'success') {
    await this.waitForShadowDOM();
    
    const statusDiv = this._getElement('statusDiv');
    const statusMessage = this._getElement('statusMessage');
    
    if (statusDiv && statusMessage) {
      statusMessage.textContent = message;
      statusDiv.className = `status ${type}`;
      
      // 3秒後清除消息
      setTimeout(() => {
        statusMessage.textContent = '';
        statusDiv.className = 'status';
      }, 3000);
    }

    if (type === 'error') {
      logger.error(message);
    } else {
      logger.log(message);
    }
  }

  /**
   * 綁定事件監聽器
   * @param {string} elementId - 元素ID
   * @param {string} event - 事件名稱
   * @param {Function} handler - 事件處理函數
   */
  static async bindEvent(elementId, event, handler) {
    await this.waitForShadowDOM();
    
    const element = this._getElement(elementId);
    if (element) {
      element.addEventListener(event, handler);
      logger.log('事件監聽器已綁定:', { element: elementId, event });
      return () => {
        element.removeEventListener(event, handler);
        logger.log('事件監聽器已移除:', { element: elementId, event });
      };
    }
    return () => {};
  }

  /**
   * 更新分支列表
   * @param {string[]} branches - 分支列表
   * @param {string} currentValue - 當前選中值
   * @throws {Error} 當分支列表無效時拋出錯誤
   */
  static async updateBranchList(branches, currentValue) {
    if (!Array.isArray(branches) || branches.length === 0) {
      throw new Error('無效的分支列表');
    }

    await this.waitForShadowDOM();
    
    const branchSelect = this._getElement('gitBranch');
    if (branchSelect) {
      // 清空現有選項
      branchSelect.innerHTML = '';
      
      // 添加新選項
      branches.forEach(branch => {
        const option = document.createElement('option');
        option.value = branch;
        option.textContent = branch;
        branchSelect.appendChild(option);
      });

      // 設置當前選中值
      const newValue = branches.includes(currentValue) ? currentValue : branches[0];
      branchSelect.value = newValue;
      branchSelect.disabled = false;
        
      logger.log('分支列表已更新:', { 
        branchesCount: branches.length,
        selectedBranch: newValue,
        availableBranches: branches
      });
    }
  }

  /**
   * 禁用/啟用按鈕
   * @param {string} buttonId - 按鈕ID
   * @param {boolean} disabled - 是否禁用
   */
  static async toggleButton(buttonId, disabled) {
    await this.waitForShadowDOM();
    
    const button = this._getElement(buttonId);
    if (button) {
      button.disabled = disabled;
      button.classList.toggle('disabled', disabled);
      logger.log('按鈕狀態更新:', { 
        button: buttonId, 
        disabled
      });
    }
  }

  /**
   * 獲取表單值
   * @param {Object} elements - 表單元素ID集合
   * @returns {Object} 表單值
   */
  static async getFormValues(elements) {
    await this.waitForShadowDOM();
    
    const values = {};
    for (const [key, elementId] of Object.entries(elements)) {
      const container = this._getElement(elementId);
      if (container) {
        const toggleSwitch = container.querySelector('.toggle-switch');
        if (toggleSwitch) {
          values[key] = toggleSwitch.classList.contains('active');
        } else {
          const input = container.querySelector('input, select');
          if (input) {
            values[key] = input.value;
          } else {
            values[key] = '';
          }
        }
      } else {
        values[key] = '';  // 默認空值
      }
      logger.log('獲取表單值:', { element: elementId, key, value: values[key] });
    }
    return values;
  }

  /**
   * 設置表單值
   * @param {Object} values - 要設置的值
   */
  static async setFormValues(values) {
    await this.waitForShadowDOM();

    // 設置分支選擇
    const branchSelect = this._getElement('gitBranch');
    if (branchSelect && values.gitBranch) {
      branchSelect.value = values.gitBranch;
    }

    // 設置標籤前綴
    const tagPrefixInput = this._getElement('gitTagPrefix');
    if (tagPrefixInput) {
      tagPrefixInput.value = values.gitTagPrefix || values.gitBranch || '';
    }

    // 設置提交信息
    const commitMessageInput = this._getElement('gitCommitMessage');
    if (commitMessageInput) {
      commitMessageInput.value = values.gitCommitMessage || '';
    }

    logger.log('表單值已更新:', {
      branch: values.gitBranch,
      tagPrefix: values.gitTagPrefix,
      commitMessage: values.gitCommitMessage
    });
  }
}

module.exports = UIManager; 