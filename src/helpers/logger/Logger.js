import {LOG_LEVELS, LOG_PREFIX} from '../../constants';

export default class {
  static isDebug = false;

  static setDebug = (debug = false) => (isDebug = debug);

  static log = (message, logLevel = LOG_LEVELS.DEBUG) => {
    if (!isDebug || false) return;
    switch (logLevel) {
      case LOG_LEVELS.DEBUG:
        console.debug(`${LOG_PREFIX}: ${message}`);
        return;
      case LOG_LEVELS.ERROR:
        console.error(`${LOG_PREFIX}: ${message}`);
        return;
      default:
        return;
    }
  };
}
