import React from 'react';
import useRNAppRating from './useRNAppRating';
import {renderHook} from '@testing-library/react-hooks';
import {RNAppRatingContext} from '../../provider';
import {ACTION_EVENT} from '../../constants';

const mockSetShowRNAppRating = jest.fn();
const mockFireActionEvent = jest.fn();
const mockSetJourneyCompletionCallback = jest.fn();
const mockLoadCustomConfig = jest.fn();
const mockLoadCustomRules = jest.fn();
const mockInitRNAppRatingStorage = jest.fn();
const mockRulesSatisfied = jest.fn();
const mockCanShowRateNever = jest.fn();
const wrapper = ({children}) => (
  <RNAppRatingContext.Provider
    value={{
      setShowRNAppRating: mockSetShowRNAppRating,
      fireActionEvent: mockFireActionEvent,
      setJourneyCompletionCallback: mockSetJourneyCompletionCallback,
      loadCustomConfig: mockLoadCustomConfig,
      loadCustomRules: mockLoadCustomRules,
    }}>
    {children}
  </RNAppRatingContext.Provider>
);

jest.mock('../useRuleManager/useRuleManager', () => () => ({
  initRNAppRatingStorage: mockInitRNAppRatingStorage,
  rulesSatisfied: mockRulesSatisfied,
  canShowRateNever: mockCanShowRateNever,
}));

describe('RNAppRating tests', () => {
  afterEach(() => jest.clearAllMocks());

  describe('initRNAppRating', () => {
    it('should initialise RNAppRating and load custom rules, if given', async () => {
      const customRules = {
        minimumAppLaunches: 1,
        minimumAppInstalledDays: 2,
      };
      mockInitRNAppRatingStorage.mockReturnValue({launchTimes: 1});

      const {result} = renderHook(useRNAppRating, {wrapper});
      const res = await result.current.initRNAppRating(customRules);

      expect(res).toStrictEqual({launchTimes: 1});
      expect(mockLoadCustomRules).toHaveBeenCalledTimes(1);
      expect(mockLoadCustomRules).toHaveBeenNthCalledWith(1, customRules);
    });
  });

  describe('showRNAppRating', () => {
    it('should set showRNAppRating=true, load custom config and set journey completion callback, when showRNAppRatingPrompt is called and rules are satisfied', async () => {
      const customCallback = jest.fn();
      const customConfig = {};
      mockRulesSatisfied.mockReturnValue(true);

      const {result} = renderHook(useRNAppRating, {wrapper});
      const res = await result.current.showRNAppRating(customCallback, customConfig);

      expect(res).toBeTruthy();
      expect(mockSetShowRNAppRating).toHaveBeenCalledTimes(1);
      expect(mockSetShowRNAppRating).toHaveBeenNthCalledWith(1, true);
      expect(mockSetJourneyCompletionCallback).toHaveBeenCalledTimes(1);
      expect(mockSetJourneyCompletionCallback).toHaveBeenNthCalledWith(1, customCallback);
      expect(mockLoadCustomConfig).toHaveBeenCalledTimes(1);
      expect(mockLoadCustomConfig).toHaveBeenNthCalledWith(1, customConfig);
    });

    it('should not show app rating, when showRNAppRatingPrompt is called and rules are not satisfied', async () => {
      mockRulesSatisfied.mockReturnValue(false);

      const {result} = renderHook(useRNAppRating, {wrapper});
      const res = await result.current.showRNAppRating();

      expect(res).toBeFalsy();
      expect(mockSetShowRNAppRating).toHaveBeenCalledTimes(0);
      expect(mockSetJourneyCompletionCallback).toHaveBeenCalledTimes(0);
      expect(mockLoadCustomConfig).toHaveBeenCalledTimes(0);
    });
  });

  describe('hideRNAppRating', () => {
    it('should set showRNAppRating=false when hideRNAppRatingPrompt is called', () => {
      const {result} = renderHook(useRNAppRating, {wrapper});
      result.current.hideRNAppRating();

      expect(mockSetShowRNAppRating).toHaveBeenCalledTimes(1);
      expect(mockSetShowRNAppRating).toHaveBeenNthCalledWith(1, false);
    });
  });

  describe('triggerActionEvent', () => {
    it('should call fireActionEvent, with the given event and param, when triggerActionEvent is called', () => {
      const event = ACTION_EVENT.CANCEL;
      const param = {journeyCancelled: true};

      const {result} = renderHook(useRNAppRating, {wrapper});
      result.current.triggerActionEvent(event, param);

      expect(mockFireActionEvent).toHaveBeenCalledTimes(1);
      expect(mockFireActionEvent).toHaveBeenNthCalledWith(1, event, param);
    });
  });

  describe('canShowRateNever', () => {
    it('should check and return if rate never button should be shown, based on configured rule conditions', () => {
      const {result} = renderHook(useRNAppRating, {wrapper});
      result.current.shouldShowRateNever();

      expect(mockCanShowRateNever).toHaveBeenCalledTimes(1);
    });
  });
});
