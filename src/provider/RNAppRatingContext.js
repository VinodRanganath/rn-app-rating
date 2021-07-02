import {createContext} from 'react';
import {RATING} from '../constants';
import DEFAULT_CONFIG from '../config/Config';

const initialState = {
  showRNAppRating: false,
  setShowRNAppRating: () => {},
  stage: RATING,
  fireActionEvent: () => {},
  setAppRatingResponse: () => {},
  setJourneyCompletionCallback: _ => {},
  loadCustomRNAppRatingConfig: _ => {},
  loadCustomRules: _ => {},
  config: DEFAULT_CONFIG,
};
const RNAppRatingContext = createContext(initialState);

export {initialState, RNAppRatingContext};
