import React from 'react';
import useRNAppRating from './useRNAppRating';
import { renderHook } from '@testing-library/react-hooks';
import { RNAppRatingContext } from '../../provider';
import { ACTION_EVENT } from '../../constants';

const mockSetDebug = jest.fn();
const mockSetShowRNAppRating = jest.fn();
const mockFireActionEvent = jest.fn();
const mockSetJourneyCompletionCallback = jest.fn();
const mockSetCustomConfig = jest.fn();
const mockSetCustomRules = jest.fn();
const mockInitRNAppRatingStorage = jest.fn();
const mockRulesSatisfied = jest.fn();
const mockCanShowRateNever = jest.fn();
const wrapper = ({ children }) => (
  <RNAppRatingContext.Provider
    value={{
      setShowRNAppRating: mockSetShowRNAppRating,
      fireActionEvent: mockFireActionEvent,
      setJourneyCompletionCallback: mockSetJourneyCompletionCallback,
      setCustomConfig: mockSetCustomConfig,
      setCustomRules: mockSetCustomRules,
    }}>
    {children}
  </RNAppRatingContext.Provider>
);

jest.mock('../useRuleManager/useRuleManager', () => () => ({
  initRNAppRatingStorage: mockInitRNAppRatingStorage,
  rulesSatisfied: mockRulesSatisfied,
  canShowRateNever: mockCanShowRateNever,
}));
jest.mock('../../helpers/logger/Logger', () => ({
  setDebug: isDebug => mockSetDebug(isDebug),
}));

describe('RNAppRating tests', () => {
  afterEach(() => jest.clearAllMocks());

  describe('initRNAppRating', () => {
    it('should initialise RNAppRating, set debug=false and load custom rules, if given and if debug!==true', async () => {
      const customRules = {
        minimumAppLaunches: 1,
        minimumAppInstalledDays: 2,
      };
      mockInitRNAppRatingStorage.mockReturnValue({ launchTimes: 1 });

      const { result } = renderHook(useRNAppRating, { wrapper });
      const res = await result.current.initRNAppRating(customRules);

      expect(mockSetDebug).toHaveBeenCalledTimes(1);
      expect(mockSetDebug).toHaveBeenNthCalledWith(1, false);
      expect(res).toStrictEqual({ launchTimes: 1 });
      expect(mockSetCustomRules).toHaveBeenCalledTimes(1);
      expect(mockSetCustomRules).toHaveBeenNthCalledWith(1, customRules);
    });

    it('should initialise RNAppRating, set debug=true and load custom rules, if given and if debug===true', async () => {
      const customRules = {
        minimumAppLaunches: 1,
        minimumAppInstalledDays: 2,
        debug: true,
      };
      mockInitRNAppRatingStorage.mockReturnValue({ launchTimes: 1 });

      const { result } = renderHook(useRNAppRating, { wrapper });
      const res = await result.current.initRNAppRating(customRules);

      expect(mockSetDebug).toHaveBeenCalledTimes(1);
      expect(mockSetDebug).toHaveBeenNthCalledWith(1, true);
      expect(res).toStrictEqual({ launchTimes: 1 });
      expect(mockSetCustomRules).toHaveBeenCalledTimes(1);
      expect(mockSetCustomRules).toHaveBeenNthCalledWith(1, customRules);
    });
  });

  describe('showRNAppRating', () => {
    it('should set showRNAppRating=true, load custom config and set journey completion callback, when showRNAppRatingPrompt is called and rules are satisfied', async () => {
      const customCallback = jest.fn();
      const customConfig = {};
      mockRulesSatisfied.mockReturnValue(true);

      const { result } = renderHook(useRNAppRating, { wrapper });
      const res = await result.current.showRNAppRating(customCallback, customConfig);

      expect(res).toBeTruthy();
      expect(mockSetShowRNAppRating).toHaveBeenCalledTimes(1);
      expect(mockSetShowRNAppRating).toHaveBeenNthCalledWith(1, true);
      expect(mockSetJourneyCompletionCallback).toHaveBeenCalledTimes(1);
      expect(mockSetJourneyCompletionCallback).toHaveBeenNthCalledWith(1, customCallback);
      expect(mockSetCustomConfig).toHaveBeenCalledTimes(1);
      expect(mockSetCustomConfig).toHaveBeenNthCalledWith(1, customConfig);
    });

    it('should not show app rating, when showRNAppRatingPrompt is called and rules are not satisfied', async () => {
      mockRulesSatisfied.mockReturnValue(false);

      const { result } = renderHook(useRNAppRating, { wrapper });
      const res = await result.current.showRNAppRating();

      expect(res).toBeFalsy();
      expect(mockSetShowRNAppRating).toHaveBeenCalledTimes(0);
      expect(mockSetJourneyCompletionCallback).toHaveBeenCalledTimes(0);
      expect(mockSetCustomConfig).toHaveBeenCalledTimes(0);
    });
  }); ``;

  describe('hideRNAppRating', () => {
    it('should set showRNAppRating=false when hideRNAppRatingPrompt is called', () => {
      const { result } = renderHook(useRNAppRating, { wrapper });
      result.current.hideRNAppRating();

      expect(mockSetShowRNAppRating).toHaveBeenCalledTimes(1);
      expect(mockSetShowRNAppRating).toHaveBeenNthCalledWith(1, false);
    });
  });

  describe('triggerActionEvent', () => {
    it('should call fireActionEvent, with the given event and param, when triggerActionEvent is called', () => {
      const event = ACTION_EVENT.CANCEL;
      const param = { journeyCancelled: true };

      const { result } = renderHook(useRNAppRating, { wrapper });
      result.current.triggerActionEvent(event, param);

      expect(mockFireActionEvent).toHaveBeenCalledTimes(1);
      expect(mockFireActionEvent).toHaveBeenNthCalledWith(1, event, param);
    });
  });

  describe('canShowRateNever', () => {
    it('should check and return if rate never button should be shown, based on configured rule conditions', () => {
      const { result } = renderHook(useRNAppRating, { wrapper });
      result.current.shouldShowRateNever();

      expect(mockCanShowRateNever).toHaveBeenCalledTimes(1);
    });
  });
});
