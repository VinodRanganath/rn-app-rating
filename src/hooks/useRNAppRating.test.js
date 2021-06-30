import React from 'react';
import useRNAppRating from './useRNAppRating';
import {renderHook} from '@testing-library/react-hooks';
import {RNAppRatingContext} from '../provider/RNAppRatingContext';
import {ACTION_EVENT} from '../constants';

const mockSetShowRNAppRating = jest.fn();
const mockFireActionEvent = jest.fn();
const mockSetJourneyCompletionCallback = jest.fn();
const mockLoadCustomRNAppRatingConfig = jest.fn();

const wrapper = ({children}) => (
  <RNAppRatingContext.Provider
    value={{
      setShowRNAppRating: mockSetShowRNAppRating,
      fireActionEvent: mockFireActionEvent,
      setJourneyCompletionCallback: mockSetJourneyCompletionCallback,
      loadCustomRNAppRatingConfig: mockLoadCustomRNAppRatingConfig,
    }}>
    {children}
  </RNAppRatingContext.Provider>
);

describe('RNAppRating tests', () => {
  afterEach(() => jest.clearAllMocks());

  describe('showRNAppRatingPrompt', () => {
    it('should set showRNAppRating=true, load custom config and set journey completion callback, when showRNAppRatingPrompt is called', () => {
      const customCallback = jest.fn();
      const customConfig = {};
      const {result} = renderHook(useRNAppRating, {wrapper});
      result.current.showRNAppRatingPrompt(customCallback, customConfig);

      expect(mockSetShowRNAppRating).toHaveBeenCalledTimes(1);
      expect(mockSetShowRNAppRating).toHaveBeenNthCalledWith(1, true);
      expect(mockSetJourneyCompletionCallback).toHaveBeenCalledTimes(1);
      expect(mockSetJourneyCompletionCallback).toHaveBeenNthCalledWith(1, customCallback);
      expect(mockLoadCustomRNAppRatingConfig).toHaveBeenCalledTimes(1);
      expect(mockLoadCustomRNAppRatingConfig).toHaveBeenNthCalledWith(1, customConfig);
    });
  });

  describe('hideRNAppRatingPrompt', () => {
    it('should set showRNAppRating=false when hideRNAppRatingPrompt is called', () => {
      const {result} = renderHook(useRNAppRating, {wrapper});
      result.current.hideRNAppRatingPrompt();

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
});
