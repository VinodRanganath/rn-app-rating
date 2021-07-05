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

  const showRNAppRating = async (journeyCompletionCallback, customConfig) => {
    // TODO: Introduce debug mode and enable logs
    const rulesSatisfied = await validateRules();
    if (rulesSatisfied) {
      loadCustomRNAppRatingConfig(customConfig);
      setJourneyCompletionCallback(journeyCompletionCallback);
      setShowRNAppRating(true);
    }
    return rulesSatisfied;
  };

  const hideRNAppRating = () => setShowRNAppRating(false);

  const triggerActionEvent = (actionEvent, param) => fireActionEvent(actionEvent, param);

  const shouldShowRateNever = () => validateShowRateNever();

  return {
    initRNAppRating,
    showRNAppRating,
    hideRNAppRating,
    triggerActionEvent,
    shouldShowRateNever,
  };
};

export default useRNAppRating;
