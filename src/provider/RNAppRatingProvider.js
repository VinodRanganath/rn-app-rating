import React, {useEffect, useRef, useState} from 'react';
import RNAppRatingComponent from '../components/RNAppRatingComponent';
import {RNAppRatingContext} from './RNAppRatingContext';
import {ACTION_EVENT, FEEDBACK, INITIAL_APP_RATING_RESPONSE, RATING, STORE_RATING_CONFIRMATION} from '../constants';
import DEFAULT_CONFIG from '../config/Config';
import useRuleManager from '../hooks/useRuleManager/useRuleManager';

const RNAppRatingProvider = props => {
  const {children} = props;
  const initialCallback = _ => {};
  const [showRNAppRating, setShowRNAppRating] = useState(false);
  // TODO: Add a thank you stage
  const [stage, setStage] = useState(RATING);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const appRatingResponse = useRef(INITIAL_APP_RATING_RESPONSE);
  const journeyCompletionCallback = useRef(initialCallback);
  const {setRateLater, setRateNever, setRatingGiven} = useRuleManager();

  useEffect(() => {
    if (showRNAppRating) resetState();
    else {
      journeyCompletionCallback.current(appRatingResponse.current);
      // TODO: if (appRatingResponse.current.optedForStoreRating) open native in-app rating popup
    }
  }, [showRNAppRating]);

  const setJourneyCompletionCallback = (callback = initialCallback) => (journeyCompletionCallback.current = callback);

  const resetState = () => {
    setStage(RATING);
    appRatingResponse.current = INITIAL_APP_RATING_RESPONSE;
  };

  // TODO: Do not show app rating popup again, if journey has completed with a rating and feedback
  const handleStageSubmission = (currentStage, param) => {
    appRatingResponse.current = {...appRatingResponse.current, ...param};
    switch (currentStage) {
      case RATING:
        if (param.rating >= config.rating.positiveRatingThreshold) {
          if (config.storeRatingConfirmation.skipStage) {
            appRatingResponse.current = {
              ...appRatingResponse.current,
              optedForStoreRating: true,
            };
            setShowRNAppRating(false);
            setRatingGiven().then(() => {});
            return;
          }
          setStage(STORE_RATING_CONFIRMATION);
          return;
        }
        setStage(FEEDBACK);
        return;
      case FEEDBACK:
        setShowRNAppRating(false);
        setRatingGiven().then(() => {});
        return;
      case STORE_RATING_CONFIRMATION:
        appRatingResponse.current = {
          ...appRatingResponse.current,
          optedForStoreRating: true,
        };
        setShowRNAppRating(false);
        setRatingGiven().then(() => {});
        return;
      default:
        return;
    }
  };

  const fireActionEvent = (actionEvent, param = {}) => {
    switch (actionEvent) {
      case ACTION_EVENT.SUBMIT:
        handleStageSubmission(stage, param);
        return;
      case ACTION_EVENT.RATE_LATER:
        appRatingResponse.current = {
          ...appRatingResponse.current,
          rateLater: true,
        };
        setShowRNAppRating(false);
        setRateLater().then(() => {});
        return;
      case ACTION_EVENT.RATE_NEVER:
        appRatingResponse.current = {
          ...appRatingResponse.current,
          rateNever: true,
        };
        setShowRNAppRating(false);
        setRateNever().then(() => {});
        return;
      case ACTION_EVENT.CANCEL:
        appRatingResponse.current = {...appRatingResponse.current, ...param};
        setShowRNAppRating(false);
        return;
      default:
        return;
    }
  };

  const loadCustomConfig = (customConfig = {}) => {
    const {rating = {}, feedback = {}, storeRatingConfirmation = {}} = customConfig;
    const tempConfig = {
      ...config,
      rating: {...config.rating, ...rating},
      feedback: {...config.feedback, ...feedback},
      storeRatingConfirmation: {
        ...config.storeRatingConfirmation,
        ...storeRatingConfirmation,
      },
    };
    setConfig(tempConfig);
  };

  const loadCustomRules = (customRules = {}) => setConfig({...config, rules: {...config.rules, ...customRules}});

  return (
    <RNAppRatingContext.Provider
      value={{
        showRNAppRating,
        setShowRNAppRating,
        stage,
        fireActionEvent,
        setJourneyCompletionCallback,
        loadCustomConfig,
        loadCustomRules,
        config,
      }}>
      {children}
      <RNAppRatingComponent />
    </RNAppRatingContext.Provider>
  );
};

export default RNAppRatingProvider;
