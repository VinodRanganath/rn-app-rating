import {useContext} from 'react';
import {RNAppRatingContext} from '../../provider';
import {LOG_LEVELS, LOG_PREFIX} from '../../constants';

const useLogger = () => {
  const {
    config: {
      rules: {debug},
    },
  } = useContext(RNAppRatingContext);

  const log = (message, logLevel = LOG_LEVELS.DEBUG) => {
    if (!debug) return;
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

  return {log};
};

export default useLogger;
