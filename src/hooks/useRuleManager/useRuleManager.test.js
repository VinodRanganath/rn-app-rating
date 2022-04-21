import React from 'react';
import {renderHook} from '@testing-library/react-hooks';
import {RNAppRatingContext} from '../../provider';
import DEFAULT_CONFIG from '../../config/Config';
import useRuleManager from './useRuleManager';
import {INITIAL_RN_APP_RATING_STORAGE_VALUE, RN_APP_RATING_STORAGE_KEY} from '../../constants';
import moment from 'moment';

const mockGetFromStorage = jest.fn();
const mockSaveInStorage = jest.fn().mockImplementation(() => Promise.resolve());
const mockLog = jest.fn();
const yesterday = moment().subtract(1, 'day').utc().valueOf();
const today = moment().utc().valueOf();
const tomorrow = moment().add(1, 'd').utc().valueOf();
const wrapper = ({debug, children}) => {
  const config = {
    ...DEFAULT_CONFIG,
    rules: {
      minimumAppLaunches: 1,
      minimumAppInstalledDays: 1,
      minimumAppLaunchesSinceRateLater: 1,
      minimumDaysSinceRateLater: 1,
      minimumRateLaterClicksToShowRateNever: 2,
      debug,
    },
  };

  return <RNAppRatingContext.Provider value={{config}}>{children}</RNAppRatingContext.Provider>;
};

jest.mock('../../helpers/storage/StorageHelper', () => () => ({
  getFromStorage: mockGetFromStorage,
  saveInStorage: mockSaveInStorage,
}));
jest.mock('../../helpers/logger/Logger', () => ({
  log: message => mockLog(message),
}));

describe('useRuleManager tests', () => {
  afterEach(() => jest.clearAllMocks());

  describe('initRNAppRatingStorage', () => {
    it('should initialise storage with default values, if value is not already present', async () => {
      mockGetFromStorage.mockImplementationOnce(() => Promise.resolve());
      mockGetFromStorage.mockImplementationOnce(() => Promise.resolve(INITIAL_RN_APP_RATING_STORAGE_VALUE));

      const {result} = renderHook(useRuleManager, {wrapper});

      const res = await result.current.initRNAppRatingStorage();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(2);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(2, RN_APP_RATING_STORAGE_KEY);
      expect(mockSaveInStorage).toHaveBeenCalledTimes(1);
      expect(mockSaveInStorage).toHaveBeenNthCalledWith(
        1,
        RN_APP_RATING_STORAGE_KEY,
        INITIAL_RN_APP_RATING_STORAGE_VALUE,
      );
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(2, RN_APP_RATING_STORAGE_KEY);
      expect(res).toStrictEqual(INITIAL_RN_APP_RATING_STORAGE_VALUE);
    });

    it('should log details and initialise storage with default values, if value is not already present and debug=true', async () => {
      mockGetFromStorage.mockImplementationOnce(() => Promise.resolve());
      mockGetFromStorage.mockImplementationOnce(() => Promise.resolve(INITIAL_RN_APP_RATING_STORAGE_VALUE));

      const {result} = renderHook(useRuleManager, {wrapper, initialProps: {debug: true}});

      const res = await result.current.initRNAppRatingStorage();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(2);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(2, RN_APP_RATING_STORAGE_KEY);
      expect(mockSaveInStorage).toHaveBeenCalledTimes(1);
      expect(mockSaveInStorage).toHaveBeenNthCalledWith(
        1,
        RN_APP_RATING_STORAGE_KEY,
        INITIAL_RN_APP_RATING_STORAGE_VALUE,
      );
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(2, RN_APP_RATING_STORAGE_KEY);
      expect(res).toStrictEqual(INITIAL_RN_APP_RATING_STORAGE_VALUE);
      // logs
      expect(mockLog).toHaveBeenCalledTimes(2);
      expect(mockLog).toHaveBeenNthCalledWith(1, 'initRNAppRating: start');
      expect(mockLog).toHaveBeenNthCalledWith(2, 'initRNAppRating: no storage values found, initialising...');
    });

    it('should update launch times and store value, if value is already present', async () => {
      const updatedValue = {
        ...INITIAL_RN_APP_RATING_STORAGE_VALUE,
        launchTimes: INITIAL_RN_APP_RATING_STORAGE_VALUE.launchTimes + 1,
      };
      mockGetFromStorage.mockImplementation(() => Promise.resolve(INITIAL_RN_APP_RATING_STORAGE_VALUE));

      const {result} = renderHook(useRuleManager, {wrapper});

      const res = await result.current.initRNAppRatingStorage();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(mockSaveInStorage).toHaveBeenCalledTimes(1);
      expect(mockSaveInStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY, updatedValue);
      expect(res).toStrictEqual(updatedValue);
    });

    it('should log details and must not update launch times, if value is already present and debug=true', async () => {
      mockGetFromStorage.mockImplementation(() => Promise.resolve(INITIAL_RN_APP_RATING_STORAGE_VALUE));

      const {result} = renderHook(useRuleManager, {wrapper, initialProps: {debug: true}});

      const res = await result.current.initRNAppRatingStorage();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(mockSaveInStorage).toHaveBeenCalledTimes(0);
      expect(res).toStrictEqual({...INITIAL_RN_APP_RATING_STORAGE_VALUE, launchTimes: 2});
      // logs
      expect(mockLog).toHaveBeenCalledTimes(2);
      expect(mockLog).toHaveBeenNthCalledWith(1, 'initRNAppRating: start');
      expect(mockLog).toHaveBeenNthCalledWith(2, 'initRNAppRating: done');
    });

    it('should update launch times, launchTimesPostRateLater and store value, if value is already present, rateLater=true, currentLaunchTimesPostRateLater < minimumAppLaunchesSinceRateLater and daysElapsed >= minimumDaysSinceRateLater', async () => {
      const updatedValue = {
        ...INITIAL_RN_APP_RATING_STORAGE_VALUE,
        launchTimes: INITIAL_RN_APP_RATING_STORAGE_VALUE.launchTimes + 1,
        launchTimesPostRateLater: 0,
        rateLater: true,
        rateLaterOn: tomorrow,
      };
      mockGetFromStorage.mockImplementation(() =>
        Promise.resolve({...INITIAL_RN_APP_RATING_STORAGE_VALUE, launchTimesPostRateLater: -1, rateLater: true, rateLaterOn: tomorrow}),
      );

      const {result} = renderHook(useRuleManager, {wrapper});

      const res = await result.current.initRNAppRatingStorage();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(mockSaveInStorage).toHaveBeenCalledTimes(1);
      expect(mockSaveInStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY, updatedValue);
      expect(res).toStrictEqual(updatedValue);
    });

    it('should update launch times, launchTimesPostRateLater and store value, if value is already present, rateLater=true, currentLaunchTimesPostRateLater >= minimumAppLaunchesSinceRateLater and daysElapsed < minimumDaysSinceRateLater', async () => {
      const updatedValue = {
        ...INITIAL_RN_APP_RATING_STORAGE_VALUE,
        launchTimes: INITIAL_RN_APP_RATING_STORAGE_VALUE.launchTimes + 1,
        launchTimesPostRateLater: INITIAL_RN_APP_RATING_STORAGE_VALUE.launchTimesPostRateLater + 1,
        rateLater: true,
        rateLaterOn: today,
      };
      mockGetFromStorage.mockImplementation(() =>
        Promise.resolve({...INITIAL_RN_APP_RATING_STORAGE_VALUE, rateLater: true, rateLaterOn: today}),
      );

      const {result} = renderHook(useRuleManager, {wrapper});

      const res = await result.current.initRNAppRatingStorage();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(mockSaveInStorage).toHaveBeenCalledTimes(1);
      expect(mockSaveInStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY, updatedValue);
      expect(res).toStrictEqual(updatedValue);
    });

    it('should update launch times, launchTimesPostRateLater and store value, if value is already present, rateLater=true and rules are not satisfied', async () => {
      const updatedValue = {
        ...INITIAL_RN_APP_RATING_STORAGE_VALUE,
        launchTimes: INITIAL_RN_APP_RATING_STORAGE_VALUE.launchTimes + 1,
        launchTimesPostRateLater: 0,
        rateLater: true,
        rateLaterOn: today,
      };
      mockGetFromStorage.mockImplementation(() =>
        Promise.resolve({...INITIAL_RN_APP_RATING_STORAGE_VALUE, launchTimesPostRateLater: -1, rateLater: true, rateLaterOn: today}),
      );

      const {result} = renderHook(useRuleManager, {wrapper});

      const res = await result.current.initRNAppRatingStorage();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(mockSaveInStorage).toHaveBeenCalledTimes(1);
      expect(mockSaveInStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY, updatedValue);
      expect(res).toStrictEqual(updatedValue);
    });

    it('should log details and must not update launch times, launchTimesPostRateLater and store value, if value is already present, rateLater=true, rate later rules are not satisfied and debug=true', async () => {
      const updatedValue = {
        ...INITIAL_RN_APP_RATING_STORAGE_VALUE,
        launchTimes: INITIAL_RN_APP_RATING_STORAGE_VALUE.launchTimes + 1,
        launchTimesPostRateLater: INITIAL_RN_APP_RATING_STORAGE_VALUE.launchTimesPostRateLater + 1,
        rateLater: true,
        rateLaterOn: today,
      };
      mockGetFromStorage.mockImplementation(() =>
        Promise.resolve({...INITIAL_RN_APP_RATING_STORAGE_VALUE, rateLater: true, rateLaterOn: today}),
      );

      const {result} = renderHook(useRuleManager, {wrapper, initialProps: {debug: true}});

      const res = await result.current.initRNAppRatingStorage();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(mockSaveInStorage).toHaveBeenCalledTimes(0);
      expect(res).toStrictEqual(updatedValue);
      // logs
      expect(mockLog).toHaveBeenCalledTimes(4);
      expect(mockLog).toHaveBeenNthCalledWith(1, 'initRNAppRating: start');
      expect(mockLog).toHaveBeenNthCalledWith(2, 'initRNAppRating: rateLater=true');
      expect(mockLog).toHaveBeenNthCalledWith(3, 'initRNAppRating: rate later rules not satisfied');
      expect(mockLog).toHaveBeenNthCalledWith(4, 'initRNAppRating: done');
    });

    it('should update launch times, reset rate later values and store value, if value is already present, rateLater=true and rate later rules are satisfied', async () => {
      const updatedValue = {
        ...INITIAL_RN_APP_RATING_STORAGE_VALUE,
        launchTimes: INITIAL_RN_APP_RATING_STORAGE_VALUE.launchTimes + 1,
      };
      mockGetFromStorage.mockImplementation(() =>
        Promise.resolve({...INITIAL_RN_APP_RATING_STORAGE_VALUE, rateLater: true, rateLaterOn: yesterday}),
      );

      const {result} = renderHook(useRuleManager, {wrapper});

      const res = await result.current.initRNAppRatingStorage();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(mockSaveInStorage).toHaveBeenCalledTimes(1);
      expect(mockSaveInStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY, updatedValue);
      expect(res).toStrictEqual(updatedValue);
    });

    it('should log details and must not update launch times, reset rate later values and store value, if value is already present, rateLater=true, rate later rules are satisfied and debug=true', async () => {
      const updatedValue = {
        ...INITIAL_RN_APP_RATING_STORAGE_VALUE,
        launchTimes: INITIAL_RN_APP_RATING_STORAGE_VALUE.launchTimes + 1,
      };
      mockGetFromStorage.mockImplementation(() =>
        Promise.resolve({...INITIAL_RN_APP_RATING_STORAGE_VALUE, rateLater: true, rateLaterOn: yesterday}),
      );

      const {result} = renderHook(useRuleManager, {wrapper, initialProps: {debug: true}});

      const res = await result.current.initRNAppRatingStorage();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(mockSaveInStorage).toHaveBeenCalledTimes(0);
      expect(res).toStrictEqual(updatedValue);
      // logs
      expect(mockLog).toHaveBeenCalledTimes(4);
      expect(mockLog).toHaveBeenNthCalledWith(1, 'initRNAppRating: start');
      expect(mockLog).toHaveBeenNthCalledWith(2, 'initRNAppRating: rateLater=true');
      expect(mockLog).toHaveBeenNthCalledWith(3, 'initRNAppRating: rate later rules satisfied');
      expect(mockLog).toHaveBeenNthCalledWith(4, 'initRNAppRating: done');
    });
  });

  describe('rulesSatisfied', () => {
    it('should return true if all rules are satisfied, when rateLater=false', async () => {
      const storageValue = {
        launchTimes: 1,
        installedOn: yesterday,
        rateLater: false,
      };
      mockGetFromStorage.mockImplementation(() => Promise.resolve(storageValue));

      const {result} = renderHook(useRuleManager, {wrapper});

      const res = await result.current.rulesSatisfied();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(res).toBeTruthy();
    });

    it('should return true if all rules are satisfied, when rateLater=true', async () => {
      const storageValue = {
        launchTimes: 1,
        installedOn: yesterday,
        rateLater: true,
        launchTimesPostRateLater: 1,
        rateLaterOn: yesterday,
      };
      mockGetFromStorage.mockImplementation(() => Promise.resolve(storageValue));

      const {result} = renderHook(useRuleManager, {wrapper});

      const res = await result.current.rulesSatisfied();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(res).toBeTruthy();
    });

    it('should log details and return true if debug=true', async () => {
      const {result} = renderHook(useRuleManager, {wrapper, initialProps: {debug: true}});

      const res = await result.current.rulesSatisfied();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(0);
      expect(res).toBeTruthy();
      // logs
      expect(mockLog).toHaveBeenCalledTimes(1);
      expect(mockLog).toHaveBeenNthCalledWith(1, 'showRNAppRating: check rules');
    });

    it('should return false if launch times < minimumAppLaunches', async () => {
      const storageValue = {
        launchTimes: 0,
      };
      mockGetFromStorage.mockImplementation(() => Promise.resolve(storageValue));

      const {result} = renderHook(useRuleManager, {wrapper});

      const res = await result.current.rulesSatisfied();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(res).toBeFalsy();
    });

    it('should return false if days expired post install < minimumAppInstalledDays', async () => {
      const storageValue = {
        launchTimes: 1,
        installedOn: today,
      };
      mockGetFromStorage.mockImplementation(() => Promise.resolve(storageValue));

      const {result} = renderHook(useRuleManager, {wrapper});

      const res = await result.current.rulesSatisfied();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(res).toBeFalsy();
    });

    it('should return false if days expired post install (invalid date - tomorrow) < minimumAppInstalledDays', async () => {
      const storageValue = {
        launchTimes: 1,
        installedOn: tomorrow,
      };
      mockGetFromStorage.mockImplementation(() => Promise.resolve(storageValue));

      const {result} = renderHook(useRuleManager, {wrapper});

      const res = await result.current.rulesSatisfied();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(res).toBeFalsy();
    });

    it('should return false if launchTimesPostRateLater < minimumAppLaunchesSinceRateLater, when rateLater=true', async () => {
      const storageValue = {
        launchTimes: 1,
        installedOn: yesterday,
        rateLater: true,
        launchTimesPostRateLater: 0,
      };
      mockGetFromStorage.mockImplementation(() => Promise.resolve(storageValue));

      const {result} = renderHook(useRuleManager, {wrapper});

      const res = await result.current.rulesSatisfied();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(res).toBeFalsy();
    });

    it('should return false if launchTimesPostRateLater >= minimumAppLaunchesSinceRateLater and days expired post rate later < minimumDaysSinceRateLater, when rateLater=true', async () => {
      const storageValue = {
        launchTimes: 1,
        installedOn: yesterday,
        rateLater: true,
        launchTimesPostRateLater: 1,
        rateLaterOn: today,
      };
      mockGetFromStorage.mockImplementation(() => Promise.resolve(storageValue));

      const {result} = renderHook(useRuleManager, {wrapper});

      const res = await result.current.rulesSatisfied();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(res).toBeFalsy();
    });

    it('should return false if initialisation was not done and storage value is null', async () => {
      mockGetFromStorage.mockImplementation(() => Promise.resolve());

      const {result} = renderHook(useRuleManager, {wrapper});

      const res = await result.current.rulesSatisfied();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(res).toBeFalsy();
    });

    it('should return false, when rateNever=true', async () => {
      const storageValue = {
        rateNever: true,
      };
      mockGetFromStorage.mockImplementation(() => Promise.resolve(storageValue));

      const {result} = renderHook(useRuleManager, {wrapper});

      const res = await result.current.rulesSatisfied();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(res).toBeFalsy();
    });

    it('should return false, when ratingGiven=true', async () => {
      const storageValue = {
        ratingGiven: true,
      };
      mockGetFromStorage.mockImplementation(() => Promise.resolve(storageValue));

      const {result} = renderHook(useRuleManager, {wrapper});

      const res = await result.current.rulesSatisfied();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(res).toBeFalsy();
    });
  });

  describe('setRateLater', () => {
    it('should set rateLater=true, rateLaterOn and increment rateLaterClicks', async () => {
      mockGetFromStorage.mockImplementation(() => Promise.resolve(INITIAL_RN_APP_RATING_STORAGE_VALUE));

      const {result} = renderHook(useRuleManager, {wrapper});

      await result.current.setRateLater();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(mockSaveInStorage).toHaveBeenCalledTimes(1);
      expect(mockSaveInStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY, {
        ...INITIAL_RN_APP_RATING_STORAGE_VALUE,
        rateLater: true,
        rateLaterOn: expect.any(Number),
        rateLaterClicks: INITIAL_RN_APP_RATING_STORAGE_VALUE.rateLaterClicks + 1,
      });
    });

    it('should not set rateLater, rateLaterOn or rateLaterClicks if debug=true', async () => {
      const {result} = renderHook(useRuleManager, {wrapper, initialProps: {debug: true}});

      await result.current.setRateLater();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(0);
      expect(mockSaveInStorage).toHaveBeenCalledTimes(0);
    });
  });

  describe('setRateNever', () => {
    it('should set rateNever=true', async () => {
      mockGetFromStorage.mockImplementation(() => Promise.resolve(INITIAL_RN_APP_RATING_STORAGE_VALUE));

      const {result} = renderHook(useRuleManager, {wrapper});

      await result.current.setRateNever();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(mockSaveInStorage).toHaveBeenCalledTimes(1);
      expect(mockSaveInStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY, {
        ...INITIAL_RN_APP_RATING_STORAGE_VALUE,
        rateNever: true,
      });
    });

    it('should not set rateNever if debug=true', async () => {
      const {result} = renderHook(useRuleManager, {wrapper, initialProps: {debug: true}});

      await result.current.setRateNever();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(0);
      expect(mockSaveInStorage).toHaveBeenCalledTimes(0);
    });
  });

  describe('setRatingGiven', () => {
    it('should set ratingGiven=true', async () => {
      mockGetFromStorage.mockImplementation(() => Promise.resolve(INITIAL_RN_APP_RATING_STORAGE_VALUE));

      const {result} = renderHook(useRuleManager, {wrapper});

      await result.current.setRatingGiven();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(mockSaveInStorage).toHaveBeenCalledTimes(1);
      expect(mockSaveInStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY, {
        ...INITIAL_RN_APP_RATING_STORAGE_VALUE,
        ratingGiven: true,
      });
    });

    it('should not set ratingGiven if debug=true', async () => {
      const {result} = renderHook(useRuleManager, {wrapper, initialProps: {debug: true}});

      await result.current.setRatingGiven();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(0);
      expect(mockSaveInStorage).toHaveBeenCalledTimes(0);
    });
  });

  describe('canShowRateNever', () => {
    it('should return true if rate later clicks >= minimumRateLaterClicksToShowRateNever', async () => {
      mockGetFromStorage.mockImplementation(() =>
        Promise.resolve({...INITIAL_RN_APP_RATING_STORAGE_VALUE, rateLaterClicks: 2}),
      );

      const {result} = renderHook(useRuleManager, {wrapper});

      const res = await result.current.canShowRateNever();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(res).toBeTruthy();
    });

    it('should return true if debug=true', async () => {
      const {result} = renderHook(useRuleManager, {wrapper, initialProps: {debug: true}});

      const res = await result.current.canShowRateNever();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(0);
      expect(res).toBeTruthy();
    });

    it('should return false if rate later clicks is < minimumRateLaterClicksToShowRateNever', async () => {
      mockGetFromStorage.mockImplementation(() =>
        Promise.resolve({...INITIAL_RN_APP_RATING_STORAGE_VALUE, rateLaterClicks: 1}),
      );

      const {result} = renderHook(useRuleManager, {wrapper});

      const res = await result.current.canShowRateNever();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(res).toBeFalsy();
    });
  });
});
