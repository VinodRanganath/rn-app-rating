import {useContext} from 'react';
import {RNAppRatingContext} from '../../provider';
import useRuleManager from '../useRuleManager/useRuleManager';

const useRNAppRating = () => {
  const {setShowRNAppRating, fireActionEvent, setJourneyCompletionCallback, loadCustomConfig, loadCustomRules} =
    useContext(RNAppRatingContext);
  const {initRNAppRatingStorage, rulesSatisfied, canShowRateNever} = useRuleManager();

  const initRNAppRating = customRules => {
    loadCustomRules(customRules);
    return initRNAppRatingStorage();
  };

  const showRNAppRating = async (journeyCompletionCallback, customConfig) => {
    // TODO: Introduce debug mode and enable logs
    const res = await rulesSatisfied();
    if (res) {
      loadCustomConfig(customConfig);
      setJourneyCompletionCallback(journeyCompletionCallback);
      setShowRNAppRating(true);
    }
    return res;
  };

  const hideRNAppRating = () => setShowRNAppRating(false);

  const triggerActionEvent = (actionEvent, param) => fireActionEvent(actionEvent, param);

  const shouldShowRateNever = () => canShowRateNever();

  return {
    initRNAppRating,
    showRNAppRating,
    hideRNAppRating,
    triggerActionEvent,
    shouldShowRateNever,
  };
};

export default useRNAppRating;
