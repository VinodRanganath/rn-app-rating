import {useContext} from 'react';
import Logger from '../../helpers/logger/Logger';
import {RNAppRatingContext} from '../../provider';
import useRuleManager from '../useRuleManager/useRuleManager';

const useRNAppRating = () => {
  const {setShowRNAppRating, fireActionEvent, setJourneyCompletionCallback, setCustomConfig, setCustomRules} =
    useContext(RNAppRatingContext);
  const {initRNAppRatingStorage, rulesSatisfied, canShowRateNever} = useRuleManager();

  const initRNAppRating = customRules => {
    Logger.setDebug(customRules?.debug === true);
    setCustomRules(customRules);
    return initRNAppRatingStorage();
  };

  const showRNAppRating = async (journeyCompletionCallback, customConfig) => {
    const res = await rulesSatisfied();
    if (res) {
      setCustomConfig(customConfig);
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
