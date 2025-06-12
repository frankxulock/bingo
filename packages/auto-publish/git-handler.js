'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Git自动处理模块
 * 负责自动提交代码、创建标签并推送到远程仓库
 */

// 日志系统
const logger = {
  log: (...args) => {
    const prefix = '[Git-Handler]';
    if (typeof Editor !== 'undefined') {
      Editor.log(prefix, ...args);
    } else {
      console.log(prefix, ...args);
    }
  },
  
  error: (...args) => {
    const prefix = '[Git-Handler]';
    if (typeof Editor !== 'undefined') {
      Editor.error(prefix, ...args);
    } else {
      console.error(prefix, ...args);
    }
  },
  
  warn: (...args) => {
    const prefix = '[Git-Handler]';
    if (typeof Editor !== 'undefined') {
      Editor.warn(prefix, ...args);
    } else {
      console.warn(prefix, ...args);
    }
  }
};

/**
 * 执行git命令的安全包装器
 * @param {string} command git命令
 * @param {string} cwd 工作目录
 * @returns {string|null} 命令输出或null
 */
const executeGitCommand = (command, cwd) => {
  try {
    const result = execSync(command, { 
      cwd, 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return result.trim();
  } catch (error) {
    logger.error(`Git命令执行失败: ${command}`);
    logger.error(`错误信息: ${error.message}`);
    return null;
  }
};

/**
 * 生成时间戳标签
 * @param {string} prefix 标签前缀
 * @returns {string} 完整的标签名
 */
const generateTimeTag = (prefix = 'mega_h5_dev') => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  
  return `${prefix}_${year}${month}${day}${hour}${minute}`;
};

/**
 * 检查是否为git仓库
 * @param {string} dir 目录路径
 * @returns {boolean} 是否为git仓库
 */
const isGitRepository = (dir) => {
  try {
    const gitDir = path.join(dir, '.git');
    return fs.existsSync(gitDir);
  } catch (error) {
    return false;
  }
};

/**
 * 获取当前git分支
 * @param {string} cwd 工作目录
 * @returns {string|null} 当前分支名
 */
const getCurrentBranch = (cwd) => {
  return executeGitCommand('git branch --show-current', cwd);
};

/**
 * 获取所有分支列表
 * @param {string} cwd 工作目录
 * @returns {Array} 分支列表
 */
const getAllBranches = (cwd) => {
  try {
    // 获取本地分支
    const localBranches = executeGitCommand('git branch --format="%(refname:short)"', cwd);
    // 获取远程分支
    const remoteBranches = executeGitCommand('git branch -r --format="%(refname:short)"', cwd);
    
    const branches = [];
    const seenBranches = new Set();
    
    // 处理本地分支
    if (localBranches) {
      localBranches.split('\n').forEach(branch => {
        const trimmed = branch.trim();
        if (trimmed && !trimmed.startsWith('origin/')) {
          branches.push(trimmed);
          seenBranches.add(trimmed);
        }
      });
    }
    
    // 处理远程分支，但只添加本地不存在的
    if (remoteBranches) {
      remoteBranches.split('\n').forEach(branch => {
        const trimmed = branch.trim();
        if (trimmed && trimmed.startsWith('origin/')) {
          const localName = trimmed.replace('origin/', '');
          if (localName !== 'HEAD' && !seenBranches.has(localName)) {
            branches.push(localName);
            seenBranches.add(localName);
          }
        }
      });
    }
    
    // 如果没有找到任何分支，使用默认列表（build/dev 的实际分支）
    if (branches.length === 0) {
      return ['mega_h5_dev', 'main', 'mega_h5_test'];
    }
    
    return branches.sort();
  } catch (error) {
    logger.warn('获取分支列表失败:', error.message);
    return ['mega_h5_dev', 'main', 'mega_h5_test'];
  }
};

/**
 * 切换到指定分支
 * @param {string} branch 分支名
 * @param {string} cwd 工作目录
 * @returns {boolean} 是否成功
 */
const switchToBranch = (branch, cwd) => {
  logger.log(`🔄 切换到分支: ${branch}`);
  
  // 检查分支是否存在
  const branchExists = executeGitCommand(`git show-ref --verify --quiet refs/heads/${branch}`, cwd);
  
  if (branchExists === null) {
    // 分支不存在，尝试创建
    logger.log(`📝 分支 ${branch} 不存在，正在创建...`);
    const createResult = executeGitCommand(`git checkout -b ${branch}`, cwd);
    return createResult !== null;
  } else {
    // 分支存在，直接切换
    const switchResult = executeGitCommand(`git checkout ${branch}`, cwd);
    return switchResult !== null;
  }
};

/**
 * 添加文件到git
 * @param {string} filePath 文件路径（相对或绝对）
 * @param {string} cwd 工作目录
 * @returns {boolean} 是否成功
 */
const addToGit = (filePath, cwd) => {
  logger.log(`📁 添加文件到git: ${filePath}`);
  const result = executeGitCommand(`git add "${filePath}"`, cwd);
  return result !== null;
};

/**
 * 提交更改
 * @param {string} message 提交信息
 * @param {string} cwd 工作目录
 * @param {boolean} allowEmpty 是否允许空提交
 * @returns {boolean} 是否成功
 */
const commitChanges = (message, cwd, allowEmpty = false) => {
  const emptyFlag = allowEmpty ? ' --allow-empty' : '';
  logger.log(`💾 提交更改: ${message}${allowEmpty ? ' (允许空提交)' : ''}`);
  const result = executeGitCommand(`git commit${emptyFlag} -m "${message}"`, cwd);
  return result !== null;
};

/**
 * 创建标签
 * @param {string} tagName 标签名
 * @param {string} message 标签信息
 * @param {string} cwd 工作目录
 * @returns {boolean} 是否成功
 */
const createTag = (tagName, message, cwd) => {
  logger.log(`🏷️ 创建标签: ${tagName}`);
  const result = executeGitCommand(`git tag -a "${tagName}" -m "${message}"`, cwd);
  return result !== null;
};

/**
 * 推送到远程仓库
 * @param {string} branch 分支名
 * @param {string} cwd 工作目录
 * @returns {boolean} 是否成功
 */
const pushToRemote = (branch, cwd) => {
  logger.log(`🚀 推送分支到远程: ${branch}`);
  
  // 先检查分支状态
  const branchStatus = checkBranchStatus(branch, cwd);
  
  if (branchStatus.isDiverged) {
    logger.warn(`⚠️ 分支 ${branch} 与远程分支有分歧`);
    logger.log(`   本地未推送提交: ${branchStatus.unpushedCount}`);
    logger.log(`   远程未拉取提交: ${branchStatus.unpulledCount}`);
    
    // 对于自动构建，我们通常希望强制推送本地更改
    // 因为构建结果应该是最新的
    logger.log('🔄 尝试使用 --force-with-lease 安全强制推送...');
    const forceResult = executeGitCommand(`git push --force-with-lease origin ${branch}`, cwd);
    
    if (forceResult !== null) {
      logger.log('✅ 强制推送成功');
      return true;
    } else {
      logger.error('❌ 强制推送失败，可能需要手动解决冲突');
      return false;
    }
  } else if (branchStatus.unpulledCount > 0) {
    logger.log(`⬇️ 发现 ${branchStatus.unpulledCount} 个远程提交，先拉取更新...`);
    
    // 尝试拉取远程更改
    const pullResult = pullFromRemote(branch, cwd);
    if (!pullResult) {
      logger.error('❌ 拉取远程更改失败');
      return false;
    }
    
    // 拉取成功后再次尝试推送
    logger.log('🚀 重新尝试推送...');
    const pushResult = executeGitCommand(`git push origin ${branch}`, cwd);
    return pushResult !== null;
  } else {
    // 正常情况，直接推送
    const result = executeGitCommand(`git push origin ${branch}`, cwd);
    return result !== null;
  }
};

/**
 * 推送标签到远程仓库
 * @param {string} tagName 标签名
 * @param {string} cwd 工作目录
 * @returns {boolean} 是否成功
 */
const pushTagToRemote = (tagName, cwd) => {
  logger.log(`🏷️ 推送标签到远程: ${tagName}`);
  const result = executeGitCommand(`git push origin ${tagName}`, cwd);
  return result !== null;
};

/**
 * 拉取远程分支更新
 * @param {string} branch 分支名
 * @param {string} cwd 工作目录
 * @returns {boolean} 是否成功
 */
const pullFromRemote = (branch, cwd) => {
  logger.log(`⬇️ 拉取远程分支更新: ${branch}`);
  const result = executeGitCommand(`git pull origin ${branch}`, cwd);
  return result !== null;
};

/**
 * 强制推送到远程仓库（危险操作，仅在确认安全时使用）
 * @param {string} branch 分支名
 * @param {string} cwd 工作目录
 * @returns {boolean} 是否成功
 */
const forcePushToRemote = (branch, cwd) => {
  logger.log(`🚨 强制推送分支到远程: ${branch}`);
  logger.warn('⚠️ 这是强制推送操作，可能会覆盖远程更改');
  const result = executeGitCommand(`git push --force-with-lease origin ${branch}`, cwd);
  return result !== null;
};

/**
 * 检查本地和远程分支状态
 * @param {string} branch 分支名
 * @param {string} cwd 工作目录
 * @returns {Object} 分支状态信息
 */
const checkBranchStatus = (branch, cwd) => {
  try {
    // 获取本地和远程分支的最新提交
    const localCommit = executeGitCommand(`git rev-parse HEAD`, cwd);
    const remoteCommit = executeGitCommand(`git rev-parse origin/${branch}`, cwd);
    
    // 检查是否有未推送的提交
    const unpushedCommits = executeGitCommand(`git rev-list origin/${branch}..HEAD --count`, cwd);
    
    // 检查是否有未拉取的提交
    const unpulledCommits = executeGitCommand(`git rev-list HEAD..origin/${branch} --count`, cwd);
    
    return {
      localCommit: localCommit,
      remoteCommit: remoteCommit,
      unpushedCount: parseInt(unpushedCommits) || 0,
      unpulledCount: parseInt(unpulledCommits) || 0,
      isDiverged: (parseInt(unpushedCommits) || 0) > 0 && (parseInt(unpulledCommits) || 0) > 0
    };
  } catch (error) {
    logger.warn('检查分支状态失败:', error.message);
    return {
      localCommit: null,
      remoteCommit: null,
      unpushedCount: 0,
      unpulledCount: 0,
      isDiverged: false
    };
  }
};

/**
 * 主要的git处理函数
 * 自动提交构建结果、创建标签并推送
 * @param {Object} options 配置选项
 * @returns {boolean} 是否成功
 */
const handleGitUpdate = async (options) => {
  const {
    projectPath,      // 项目根路径
    buildPath,        // 构建输出路径 (如 build/dev)
    targetBranch,     // 目标分支 (如 mega_h5_dev)
    tagPrefix,        // 标签前缀 (如 mega_h5_dev)
    commitMessage,    // 提交信息
    forceCommit = false  // 是否强制提交（即使没有变更）
  } = options;

  logger.log('🚀 开始Git自动更新流程...');
  logger.log(`📁 项目路径: ${projectPath}`);
  logger.log(`📦 构建路径: ${buildPath}`);
  logger.log(`🌿 目标分支: ${targetBranch}`);

  try {
    // 1. 检查是否为git仓库
    if (!isGitRepository(projectPath)) {
      logger.error('❌ 当前目录不是Git仓库  projectPath => ', projectPath);
      return false;
    }

    // 2. 获取当前分支
    const currentBranch = getCurrentBranch(projectPath);
    logger.log(`📍 当前分支: ${currentBranch}`);

    // 3. 切换到目标分支
    if (currentBranch !== targetBranch) {
      const switched = switchToBranch(targetBranch, projectPath);
      if (!switched) {
        logger.error(`❌ 无法切换到分支: ${targetBranch}`);
        return false;
      }
    }

    // 4. 添加构建文件到git
    const relativeBuildPath = path.relative(projectPath, buildPath);
    const added = addToGit(relativeBuildPath, projectPath);
    if (!added) {
      logger.error('❌ 添加构建文件到git失败');
      return false;
    }

    // 5. 检查是否有更改需要提交
    const status = executeGitCommand('git status --porcelain', projectPath);
    if (!status || status.length === 0) {
      if (!forceCommit) {
        logger.log('ℹ️ 没有更改需要提交');
        return true;
      } else {
        logger.log('ℹ️ 没有文件更改，但设置了强制提交，将创建空提交');
      }
    }

    // 6. 提交更改
    const defaultCommitMessage = `自动构建更新 - ${new Date().toLocaleString('zh-CN')}`;
    const finalCommitMessage = commitMessage || defaultCommitMessage;
    
    // 检查是否需要空提交
    const needsEmptyCommit = (!status || status.length === 0) && forceCommit;
    if (needsEmptyCommit) {
      logger.log('📝 执行空提交...');
    }
    
    const committed = commitChanges(finalCommitMessage, projectPath, needsEmptyCommit);
    if (!committed) {
      logger.error('❌ 提交更改失败');
      return false;
    }

    // 7. 创建标签
    const tagName = generateTimeTag(tagPrefix);
    const tagMessage = `自动构建标签 - ${tagName}`;
    const tagged = createTag(tagName, tagMessage, projectPath);
    if (!tagged) {
      logger.warn('⚠️ 创建标签失败，但继续推送代码');
    }

    // 8. 推送到远程仓库
    const pushed = pushToRemote(targetBranch, projectPath);
    if (!pushed) {
      logger.error('❌ 推送到远程仓库失败');
      return false;
    }

    // 9. 推送标签到远程仓库
    if (tagged) {
      const tagPushed = pushTagToRemote(tagName, projectPath);
      if (!tagPushed) {
        logger.warn('⚠️ 推送标签到远程仓库失败');
      }
    }

    logger.log('🎉 Git自动更新完成!');
    logger.log(`✅ 分支: ${targetBranch}`);
    logger.log(`✅ 标签: ${tagName}`);
    
    return true;

  } catch (error) {
    logger.error('❌ Git自动更新过程中发生错误:', error.message);
    return false;
  }
};

module.exports = {
  handleGitUpdate,
  generateTimeTag,
  isGitRepository,
  getCurrentBranch,
  getAllBranches,
  pullFromRemote,
  forcePushToRemote,
  checkBranchStatus,
  logger
}; 