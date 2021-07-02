import {useContext} from 'react';
import {RNAppRatingContext} from '../../provider';
import useRuleManager from '../useRuleManager/useRuleManager';

const useRNAppRating = () => {
  const {
    setShowRNAppRating,
    fireActionEvent,
    setJourneyCompletionCallback,
    loadCustomRNAppRatingConfig,
    loadCustomRules,
  } = useContext(RNAppRatingContext);
  const {initRNAppRatingStorage, validateRules, validateShowRateNever} = useRuleManager();

  const initRNAppRating = customRules => {
    loadCustomRules(customRules);
    return initRNAppRatingStorage();
  };

  const showRNAppRatingPrompt = async (journeyCompletionCallback, customConfig) => {
    const rulesSatisfied = await validateRules();
    if (rulesSatisfied) {
      loadCustomRNAppRatingConfig(customConfig);
      setJourneyCompletionCallback(journeyCompletionCallback);
      setShowRNAppRating(true);
    }
    return rulesSatisfied;
  };

  const hideRNAppRatingPrompt = () => setShowRNAppRating(false);

  const triggerActionEvent = (actionEvent, param) => fireActionEvent(actionEvent, param);

  const shouldShowRateNever = () => validateShowRateNever();

  return {
    initRNAppRating,
    showRNAppRatingPrompt,
    hideRNAppRatingPrompt,
    triggerActionEvent,
    shouldShowRateNever,
  };
};

export default useRNAppRating;
