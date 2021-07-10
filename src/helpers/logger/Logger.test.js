import {LOG_LEVELS} from '../../constants';
import Logger from './Logger';

describe('Logger tests', () => {
  it('should log message at DEBUG level by default, if debug is enabled', () => {
    const spy = jest.spyOn(console, 'debug').mockImplementation(_ => {});

    Logger.setDebug(true);
    Logger.log('log message');

    expect(console.debug).toHaveBeenCalledTimes(1);
    expect(console.debug).toHaveBeenNthCalledWith(1, 'rn-app-rating: log message');

    spy.mockRestore();
  });

  it('should log message at DEBUG level, if log level is DEBUG and debug is enabled', () => {
    const spy = jest.spyOn(console, 'debug').mockImplementation(_ => {});

    Logger.setDebug(true);
    Logger.log('log message', LOG_LEVELS.DEBUG);

    expect(console.debug).toHaveBeenCalledTimes(1);
    expect(console.debug).toHaveBeenNthCalledWith(1, 'rn-app-rating: log message');

    spy.mockRestore();
  });

  it('should log message at ERROR level, if log level is ERROR and debug is enabled', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(_ => {});

    Logger.setDebug(true);
    Logger.log('log message', LOG_LEVELS.ERROR);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenNthCalledWith(1, 'rn-app-rating: log message');

    spy.mockRestore();
  });

  it('should not log message, if debug is disabled', () => {
    const spy = jest.spyOn(console, 'debug').mockImplementation(_ => {});

    Logger.setDebug(false);
    Logger.log('log message');

    expect(console.debug).toHaveBeenCalledTimes(0);

    spy.mockRestore();
  });
});
