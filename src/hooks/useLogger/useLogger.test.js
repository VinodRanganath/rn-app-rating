import React from 'react';
import {RNAppRatingContext} from '../../provider';
import DEFAULT_CONFIG from '../../config/Config';
import {renderHook} from '@testing-library/react-hooks';
import useLogger from './useLogger';
import {LOG_LEVELS} from '../../constants';

const wrapper = ({debug, children}) => {
  const config = {...DEFAULT_CONFIG, rules: {...DEFAULT_CONFIG.rules, debug}};
  return <RNAppRatingContext.Provider value={{config}}>{children}</RNAppRatingContext.Provider>;
};

describe('Logger tests', () => {
  it('should log message at DEBUG level by default, if debug is enabled', () => {
    const spy = jest.spyOn(console, 'debug').mockImplementation(() => {});

    const {result} = renderHook(useLogger, {wrapper, initialProps: {debug: true}});

    result.current.log('log message');

    expect(console.debug).toHaveBeenCalledTimes(1);
    expect(console.debug).toHaveBeenNthCalledWith(1, 'rn-app-rating: log message');

    spy.mockRestore();
  });

  it('should log message at DEBUG level, if log level is DEBUG and debug is enabled', () => {
    const spy = jest.spyOn(console, 'debug').mockImplementation(() => {});

    const {result} = renderHook(useLogger, {wrapper, initialProps: {debug: true}});

    result.current.log('log message', LOG_LEVELS.DEBUG);

    expect(console.debug).toHaveBeenCalledTimes(1);
    expect(console.debug).toHaveBeenNthCalledWith(1, 'rn-app-rating: log message');

    spy.mockRestore();
  });

  it('should log message at ERROR level, if log level is ERROR and debug is enabled', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const {result} = renderHook(useLogger, {wrapper, initialProps: {debug: true}});

    result.current.log('log message', LOG_LEVELS.ERROR);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenNthCalledWith(1, 'rn-app-rating: log message');

    spy.mockRestore();
  });

  it('should log message at ERROR level, if log level is ERROR and debug is enabled', () => {
    const spy = jest.spyOn(console, 'debug').mockImplementation(() => {});

    const {result} = renderHook(useLogger, {wrapper});

    result.current.log('log message');

    expect(console.debug).toHaveBeenCalledTimes(0);

    spy.mockRestore();
  });
});
