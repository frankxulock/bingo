'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const logger = require('./logger');  // 使用共享的 logger 模塊

/**
 * Git自动处理模块
 * 负责自动提交代码、创建标签并推送到远程仓库
 * 
 * 主要功能：
 * 1. 检查git可用性
 * 2. 分支管理（切换/创建）
 * 3. 自动提交更改
 * 4. 创建和推送标签
 * 5. 处理冲突情况
 * 
 * @module git-handler
 */

/**
 * Git管理器
 * 處理Git相關操作
 */
class GitManager {
  /**
   * 獲取構建目錄路徑
   * @returns {string} 構建目錄的完整路徑
   * @private
   */
  static _getBuildPath() {
    try {
      // 使用 __dirname 獲取當前文件的目錄路徑
      const currentFileDir = __dirname;
      
      // 從 auto-publish 目錄向上導航到項目根目錄
      const projectRoot = path.resolve(currentFileDir, '..', '..');
      const buildDevPath = path.join(projectRoot, 'build', 'dev');

      // 驗證路徑
      if (!projectRoot.includes('mi-bingo-clinet')) {
        throw new Error('無法找到項目根目錄，請確保在正確的項目結構中運行');
      }

      logger.log('路徑信息:', {
        當前文件目錄: currentFileDir,
        項目根目錄: projectRoot,
        構建目錄: buildDevPath
      });

      return buildDevPath;
    } catch (err) {
      logger.error('獲取構建目錄路徑失敗:', err);
      throw err; // 向上傳遞錯誤，而不是返回 process.cwd()
    }
  }

  /**
   * 檢查Git倉庫是否存在且有效
   * @returns {{isValid: boolean, error?: string}} 檢查結果
   * @private
   */
  static _checkRepository() {
    try {
      const buildPath = this._getBuildPath();
      const gitDir = path.join(buildPath, '.git');
      
      // 檢查構建目錄是否存在
      if (!fs.existsSync(buildPath)) {
        const error = `構建目錄不存在:\n` +
                     `期望的構建目錄: ${buildPath}\n` +
                     `請先構建項目`;
        logger.error(error);
        return { isValid: false, error };
      }

      // 檢查是否為Git倉庫
      const exists = fs.existsSync(gitDir);
      if (!exists) {
        const error = `Git倉庫不存在，請確保以下路徑存在且已初始化為Git倉庫:\n` +
                     `當前文件位置: ${__dirname}\n` +
                     `項目根目錄: ${path.resolve(__dirname, '..', '..')}\n` +
                     `期望的倉庫位置: ${buildPath}\n` +
                     `期望的.git目錄: ${gitDir}\n\n` +
                     `請執行以下步驟：\n` +
                     `1. 檢查 ${buildPath} 目錄是否存在\n` +
                     `2. 如果不存在，請先構建項目\n` +
                     `3. 執行: cd "${buildPath}"\n` +
                     `4. 執行: git init`;
        logger.error(error);
        return { isValid: false, error };
      }

      // 檢查是否為有效的 Git 倉庫
      try {
        execSync('git rev-parse --git-dir', { 
          cwd: buildPath,
          stdio: 'ignore'
        });
        
        // 檢查是否有未提交的更改
        const status = execSync('git status --porcelain', { 
          cwd: buildPath,
          encoding: 'utf8'
        });

        if (status.trim()) {
          logger.log('檢測到未提交的更改:', status.trim());
        }

        logger.log('Git倉庫檢查通過:', {
          倉庫路徑: buildPath,
          Git目錄: gitDir,
          有更改: !!status.trim()
        });

        return { isValid: true };
      } catch (err) {
        const error = `目錄存在但不是有效的Git倉庫:\n` +
                     `倉庫路徑: ${buildPath}\n` +
                     `錯誤信息: ${err.message}\n` +
                     `請執行:\n` +
                     `cd "${buildPath}"\n` +
                     `git init`;
        logger.error(error);
        return { isValid: false, error };
      }
    } catch (err) {
      const error = `檢查Git倉庫失敗:\n` +
                   `錯誤信息: ${err.message}\n` +
                   `當前文件位置: ${__dirname}\n` +
                   `請確保在正確的項目結構中運行`;
      logger.error(error);
      return { isValid: false, error };
    }
  }

  /**
   * 檢查Git是否可用
   * @returns {{available: boolean, message?: string}} Git可用性狀態
   */
  static checkGitAvailable() {
    try {
      // 首先檢查 git 命令
      execSync('git --version', { stdio: 'ignore' });
      
      // 然後檢查倉庫
      const repoCheck = this._checkRepository();
      if (!repoCheck.isValid) {
        return { 
          available: false, 
          message: repoCheck.error
        };
      }

      return { available: true };
    } catch (err) {
      return { 
        available: false, 
        message: '未安裝Git或Git命令不可用'
      };
    }
  }

  /**
   * 執行git命令
   * @param {string} command - git命令
   * @param {Object} options - 執行選項
   * @returns {string|null} 命令輸出
   * @private
   */
  static _executeGitCommand(command, options = {}) {
    try {
      // 檢查倉庫狀態
      const repoCheck = this._checkRepository();
      if (!repoCheck.isValid) {
        throw new Error(repoCheck.error);
      }

      const buildPath = this._getBuildPath();
      const defaultOptions = {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: buildPath
      };

      // 合併選項，確保 cwd 不被覆蓋
      const finalOptions = {
        ...defaultOptions,
        ...options,
        cwd: buildPath
      };

      try {
        const result = execSync(command, finalOptions);
        logger.log('Git命令執行成功:', {
          命令: command,
          工作目錄: buildPath,
          輸出: result.toString().trim()
        });
        return result.toString().trim();
      } catch (cmdError) {
        // Git 命令執行錯誤
        const error = `Git命令執行失敗:\n` +
                     `命令: ${command}\n` +
                     `工作目錄: ${buildPath}\n` +
                     `錯誤信息: ${cmdError.message}\n` +
                     `錯誤輸出: ${cmdError.stderr?.toString() || '無'}\n` +
                     `標準輸出: ${cmdError.stdout?.toString() || '無'}`;
        throw new Error(error);
      }
    } catch (err) {
      // 如果是倉庫檢查錯誤，直接拋出
      if (err.message.includes('Git倉庫不存在')) {
        throw err;
      }
      
      logger.error(err.message);
      throw err;
    }
  }

  /**
   * 獲取Git分支列表
   * @returns {string[]} 分支列表
   * @throws {Error} 當無法獲取分支列表時拋出錯誤
   */
  static getBranches() {
    try {
      // 獲取遠程分支列表
      const remoteBranches = this._executeGitCommand('git branch -r');
      if (!remoteBranches) {
        throw new Error('無法獲取遠程分支列表');
      }

      // 解析分支名稱
      const branches = remoteBranches
        .split('\n')
        .map(branch => branch.trim())
        .filter(branch => branch && !branch.includes('HEAD'))
        .map(branch => branch.replace('origin/', ''))
        .filter(branch => branch);

      // 如果沒有分支，拋出錯誤
      if (branches.length === 0) {
        throw new Error('未找到有效的Git分支');
      }

      return branches;
    } catch (err) {
      // 將所有錯誤向上拋出
      throw err;
    }
  }

  /**
   * 切換分支
   * @param {string} branch - 目標分支
   * @returns {boolean} 是否成功
   */
  static switchBranch(branch) {
    try {
      this._executeGitCommand(`git checkout ${branch}`);
      return true;
    } catch (err) {
      logger.error(`切換到分支 ${branch} 失敗:`, err);
      return false;
    }
  }

  /**
   * 添加所有更改到暫存區
   * @returns {Promise<void>}
   */
  static async add() {
    try {
      this._executeGitCommand('git add .');
      logger.log('成功添加更改到暫存區');
    } catch (err) {
      throw new Error('添加更改失敗: ' + err.message);
    }
  }

  /**
   * 提交更改
   * @param {string} message - 提交信息
   * @returns {Promise<void>}
   */
  static async commit(message) {
    try {
      const commitMessage = message || '🚀 Auto publish update';
      this._executeGitCommand(`git commit -m "${commitMessage}"`);
      logger.log('成功提交更改:', commitMessage);
    } catch (err) {
      throw new Error('提交更改失敗: ' + err.message);
    }
  }

  /**
   * 推送到遠程
   * @returns {Promise<void>}
   */
  static async push() {
    try {
      const currentBranch = this._executeGitCommand('git rev-parse --abbrev-ref HEAD');
      this._executeGitCommand(`git push origin ${currentBranch}`);
      logger.log('成功推送到遠程:', currentBranch);
    } catch (err) {
      throw new Error('推送到遠程失敗: ' + err.message);
    }
  }

  /**
   * 創建標籤
   * @param {string} tagName - 標籤名稱
   * @param {string} message - 標籤信息
   * @returns {boolean} 是否成功
   */
  static createTag(tagName, message) {
    try {
      this._executeGitCommand(`git tag -a "${tagName}" -m "${message}"`);
      return true;
    } catch (err) {
      logger.error('創建標籤失敗:', err);
      return false;
    }
  }

  /**
   * 生成時間戳標籤
   * @param {string} prefix - 標籤前綴
   * @returns {string} 標籤名稱
   */
  static generateTimeTag(prefix = 'mega_h5_dev') {
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/[-:]/g, '')
      .replace(/\..+/, '')
      .replace('T', '');
    return `${prefix}_${timestamp}`;
  }

  /**
   * 處理Git更新
   * @param {string} message - 提交信息
   * @returns {Promise<void>}
   */
  static async handleGitUpdate(message) {
    try {
      // 檢查倉庫狀態
      const repoCheck = this._checkRepository();
      if (!repoCheck.isValid) {
        throw new Error(repoCheck.error);
      }

      const buildPath = this._getBuildPath();

      // 獲取當前分支名
      const currentBranch = this._executeGitCommand('git rev-parse --abbrev-ref HEAD');
      
      // 獲取最後一次提交的分支名
      let lastBranch = '';
      try {
        lastBranch = this._executeGitCommand('git rev-parse --abbrev-ref @{-1}');
      } catch (err) {
        logger.log('無法獲取上一個分支信息，可能是首次提交');
      }

      // 檢查工作目錄狀態
      const status = this._executeGitCommand('git status --porcelain');
      
      // 如果沒有更改且在同一分支，跳過提交
      if (!status && currentBranch === lastBranch) {
        logger.log('沒有檢測到更改且在同一分支，跳過Git操作', {
          當前分支: currentBranch,
          上次分支: lastBranch
        });
        return;
      }

      // 如果有更改或分支不同，執行Git操作
      if (status || currentBranch !== lastBranch) {
        const reason = status ? '檢測到文件更改' : '分支發生變化';
        logger.log(`需要執行Git操作: ${reason}`, {
          當前分支: currentBranch,
          上次分支: lastBranch,
          更改狀態: status || '無更改'
        });

        // 添加所有更改
        await this.add();
        
        // 提交更改
        await this.commit(message);
        
        // 推送到遠程
        await this.push();
        
        logger.log('Git操作完成', {
          分支: currentBranch,
          提交信息: message
        });
      }
    } catch (err) {
      logger.error('Git更新過程中發生錯誤:', err);
      throw new Error('Git更新過程中發生錯誤: ' + err.message);
    }
  }
}

module.exports = GitManager; 