/**
 * Logger utility class that handles debug logging based on noita-together/nt-app/.env
 * Usage: import { Logger } from '@/utils/Logger';
 *        const logger = new Logger('ComponentName');
 *        logger.debug('This is a debug message');
 * 
 * Global Vue usage: this.$logger.debug('This is a debug message');
 */
export class Logger {
    constructor(context) {
      this.context = context || 'App';
      // Check if debug is enabled
      this.isDebugMode = process.env.VUE_APP_DEBUG === 'true';
    }
  
    /**
     * Log debug messages only when in debug mode
     * @param {...any} args - Arguments to log
     */
    debug(...args) {
      if (this.isDebugMode) {
        console.log(`[DEBUG][${this.context}]`, ...args);
      }
    }
  
    /**
     * Log info messages
     * @param {...any} args - Arguments to log
     */
    info(...args) {
      console.info(`[INFO][${this.context}]`, ...args);
    }
  
    /**
     * Log warning messages
     * @param {...any} args - Arguments to log
     */
    warn(...args) {
      console.warn(`[WARN][${this.context}]`, ...args);
    }
  
    /**
     * Log error messages
     * @param {...any} args - Arguments to log
     */
    error(...args) {
      console.error(`[ERROR][${this.context}]`, ...args);
    }
  }
  
  // Create a default instance
  export const logger = new Logger();
  
  // Vue plugin to make logger available in all components
  // Reports as [App]
  export const LoggerPlugin = {
    install(Vue) {
      Vue.prototype.$logger = logger;
    }
  };
  