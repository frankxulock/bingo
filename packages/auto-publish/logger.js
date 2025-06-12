'use strict';

/**
 * 统一的日志系统
 * 兼容 Cocos Creator 编辑器和命令行环境
 */
class Logger {
  constructor(prefix = '[auto-publish]') {
    this.prefix = prefix;
  }

  /**
   * 输出普通日志
   * @param  {...any} args 日志参数
   */
  log(...args) {
    if (typeof Editor !== 'undefined') {
      Editor.log(this.prefix, ...args);
    } else {
      console.log(this.prefix, ...args);
    }
  }

  /**
   * 输出错误日志
   * @param  {...any} args 日志参数
   */
  error(...args) {
    if (typeof Editor !== 'undefined') {
      Editor.error(this.prefix, ...args);
    } else {
      console.error(this.prefix, ...args);
    }
  }

  /**
   * 输出警告日志
   * @param  {...any} args 日志参数
   */
  warn(...args) {
    if (typeof Editor !== 'undefined') {
      Editor.warn(this.prefix, ...args);
    } else {
      console.warn(this.prefix, ...args);
    }
  }
}

module.exports = new Logger(); 