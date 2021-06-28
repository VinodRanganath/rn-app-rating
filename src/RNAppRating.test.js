import React from 'react';
import RNAppRating from './RNAppRating';

const {showRNAppRatingPrompt} = RNAppRating();
const mockLoadCustomRNAppRatingConfig = jest.fn();
const mockSetJourneyCompletionCallback = jest.fn();
const mockShowRNAppRatingPrompt = jest.fn();
jest.spyOn(React, 'useContext').mockImplementation(() => () => ({
  loadCustomRNAppRatingConfig: mockLoadCustomRNAppRatingConfig,
  setJourneyCompletionCallback: mockSetJourneyCompletionCallback,
  showRNAppRatingPrompt: mockShowRNAppRatingPrompt,
}));

describe('RNAppRating tests', () => {
  describe('showRNAppRatingPrompt', () => {
    it('should set showRNAppRating=true, load custom config and set journey completion callback, when showRNAppRatingPrompt is called', () => {
      showRNAppRatingPrompt();

      expect(showRNAppRatingPrompt).toHaveBeenCalledTimes(1);
      expect(showRNAppRatingPrompt).toHaveBeenNthCalledWith(1, true);
    });
  });
});
