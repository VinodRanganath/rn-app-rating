import React from 'react';
import {renderHook} from '@testing-library/react-hooks';
import {RNAppRatingContext} from '../../provider';
import DEFAULT_CONFIG from '../../config/Config';
import useRuleManager from './useRuleManager';
import {INITIAL_RN_APP_RATING_STORAGE_VALUE, RN_APP_RATING_STORAGE_KEY} from '../../constants';
import moment from 'moment';

const mockGetFromStorage = jest.fn();
const mockSaveInStorage = jest.fn().mockImplementation(() => Promise.resolve());
const wrapper = ({children}) => {
  const config = {
    ...DEFAULT_CONFIG,
    rules: {
      minimumAppLaunches: 1,
      minimumAppInstalledDays: 1,
      minimumAppLaunchesSinceRateLater: 1,
      minimumDaysSinceRateLater: 1,
      minimumRateLaterClicksToShowRateNever: 2,
    },
  };

  return <RNAppRatingContext.Provider value={{config}}>{children}</RNAppRatingContext.Provider>;
};

jest.mock('../../helpers/storage/StorageHelper', () => () => ({
  getFromStorage: mockGetFromStorage,
  saveInStorage: mockSaveInStorage,
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
      expect(mockSaveInStorage).toHaveBeenCalledTimes(1);
      expect(mockSaveInStorage).toHaveBeenNthCalledWith(
        1,
        RN_APP_RATING_STORAGE_KEY,
        INITIAL_RN_APP_RATING_STORAGE_VALUE,
      );
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(2, RN_APP_RATING_STORAGE_KEY);
      expect(res).toStrictEqual(INITIAL_RN_APP_RATING_STORAGE_VALUE);
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

    it('should update launch times, launchTimesPostRateLater and store value, if value is already present and rateLater=true', async () => {
      const today = moment().utc().valueOf();
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

    it('should update launch times, reset rate later values and store value, if value is already present, rateLater=true and rate later rules are satisfied', async () => {
      const updatedValue = {
        ...INITIAL_RN_APP_RATING_STORAGE_VALUE,
        launchTimes: INITIAL_RN_APP_RATING_STORAGE_VALUE.launchTimes + 1,
      };
      const tomorrow = moment().subtract(1, 'd').utc().valueOf();
      mockGetFromStorage.mockImplementation(() =>
        Promise.resolve({...INITIAL_RN_APP_RATING_STORAGE_VALUE, rateLater: true, rateLaterOn: tomorrow}),
      );

      const {result} = renderHook(useRuleManager, {wrapper});

      const res = await result.current.initRNAppRatingStorage();

      expect(mockGetFromStorage).toHaveBeenCalledTimes(1);
      expect(mockGetFromStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY);
      expect(mockSaveInStorage).toHaveBeenCalledTimes(1);
      expect(mockSaveInStorage).toHaveBeenNthCalledWith(1, RN_APP_RATING_STORAGE_KEY, updatedValue);
      expect(res).toStrictEqual(updatedValue);
    });
  });

  describe('rulesSatisfied', () => {
    const yesterday = moment().subtract(1, 'day').utc().valueOf();
    const today = moment().utc().valueOf();

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

    it('should return false if launch times < minimumAppLaunchesSinceRateLater, when rateLater=true', async () => {
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

    it('should return false if days expired post rate later < minimumDaysSinceRateLater, when rateLater=true', async () => {
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

    it('should return true if rate later clicks is < minimumRateLaterClicksToShowRateNever', async () => {
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
