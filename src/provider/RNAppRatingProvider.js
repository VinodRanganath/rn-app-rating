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
  const [stage, setStage] = useState(RATING);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const appRatingResponse = useRef(INITIAL_APP_RATING_RESPONSE);
  const journeyCompletionCallback = useRef(initialCallback);
  const {setRateLater, setRateNever} = useRuleManager();

  useEffect(() => {
    if (showRNAppRating) resetState();
    else journeyCompletionCallback.current(appRatingResponse.current);
  }, [showRNAppRating]);

  const setJourneyCompletionCallback = (callback = initialCallback) => (journeyCompletionCallback.current = callback);

  const resetState = () => {
    setStage(RATING);
    appRatingResponse.current = INITIAL_APP_RATING_RESPONSE;
  };

  const fireActionEvent = (actionEvent, param = {}) => {
    switch (actionEvent) {
      case ACTION_EVENT.SUBMIT:
        appRatingResponse.current = {...appRatingResponse.current, ...param};
        if (stage === RATING) {
          if (param?.rating >= config.rating.positiveRatingThreshold) {
            if (config.storeRatingConfirmation.skipStage) {
              appRatingResponse.current = {
                ...appRatingResponse.current,
                storeRating: true,
              };
              setShowRNAppRating(false);
              // TODO: open native in-app rating popup
              return;
            }
            setStage(STORE_RATING_CONFIRMATION);
          } else setStage(FEEDBACK);
          return;
        } else {
          if (stage === STORE_RATING_CONFIRMATION) {
            appRatingResponse.current = {
              ...appRatingResponse.current,
              storeRating: true,
            };
            // TODO: open native in-app rating popup
          }
          setShowRNAppRating(false);
        }
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
        // TODO: send response
        appRatingResponse.current = {...appRatingResponse.current, ...param};
        setShowRNAppRating(false);
        return;
      default:
        return;
    }
  };

  const loadCustomRNAppRatingConfig = (customConfig = {}) => {
    const tempConfig = {
      ...config,
      rating: {...config.rating, ...customConfig.rating},
      feedback: {...config.feedback, ...customConfig.feedback},
      storeRatingConfirmation: {
        ...config.storeRatingConfirmation,
        ...customConfig.storeRatingConfirmation,
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
        loadCustomRNAppRatingConfig,
        loadCustomRules,
        config,
      }}>
      {children}
      <RNAppRatingComponent />
    </RNAppRatingContext.Provider>
  );
};

export default RNAppRatingProvider;
