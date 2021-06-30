import {useContext} from 'react';
import {RNAppRatingContext} from '../provider/RNAppRatingContext';

const useRNAppRating = () => {
  const {setShowRNAppRating, fireActionEvent, setJourneyCompletionCallback, loadCustomRNAppRatingConfig} =
    useContext(RNAppRatingContext);

  const initRNAppRating = () => console.log('init RnAppRating');

  const showRNAppRatingPrompt = (journeyCompletionCallback, customConfig) => {
    loadCustomRNAppRatingConfig(customConfig);
    setJourneyCompletionCallback(journeyCompletionCallback);
    setShowRNAppRating(true);
  };

  const hideRNAppRatingPrompt = () => setShowRNAppRating(false);

  const triggerActionEvent = (actionEvent, param) => fireActionEvent(actionEvent, param);

  return {initRNAppRating, showRNAppRatingPrompt, hideRNAppRatingPrompt, triggerActionEvent};
};

export default useRNAppRating;
