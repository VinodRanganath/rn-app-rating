import React, {useEffect, useRef, useState} from 'react';
import RNAppRatingComponent from '../components/RNAppRatingComponent';
import {RNAppRatingContext} from './RNAppRatingContext';
import {ACTION_EVENT, FEEDBACK, INITIAL_APP_RATING_RESPONSE, RATING, STORE_RATING_CONFIRMATION} from '../constants';
import DEFAULT_CONFIG from '../config/Config';
import useRuleManager from '../hooks/useRuleManager/useRuleManager';
import {NativeModules, Platform} from 'react-native';
import Logger from '../helpers/logger/Logger';

const RNAppRatingProvider = props => {
  const {children} = props;
  const initialCallback = _ => {};
  const [showRNAppRating, setShowRNAppRating] = useState(false);
  const [stage, setStage] = useState(RATING);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const appRatingResponse = useRef(INITIAL_APP_RATING_RESPONSE);
  const journeyCompletionCallback = useRef(initialCallback);
  const {setRateLater, setRateNever, setRatingGiven} = useRuleManager();
  const {RnAppRating} = NativeModules;

  useEffect(() => {
    if (showRNAppRating) resetState();
    else {
      Logger.log('triggerActionEvent: hide: invoke callback with response');
      journeyCompletionCallback.current(appRatingResponse.current);
      if (appRatingResponse.current.optedForStoreRating) {
        if (Platform.OS === 'android') {
          Logger.log('triggerActionEvent: open in-app rating for android: start');
          RnAppRating.showInAppReview(config?.rules?.debug).then(_ =>
            Logger.log('triggerActionEvent: open in-app rating for android: done'),
          );
        } else if (Platform.OS === 'ios') {
          Logger.log('triggerActionEvent: open in-app rating for iOS');
          // TODO: open native in-app rating popup for ios
        }
      }
    }
  }, [showRNAppRating]);

  const setJourneyCompletionCallback = (callback = initialCallback) => (journeyCompletionCallback.current = callback);

  const resetState = () => {
    setStage(RATING);
    appRatingResponse.current = INITIAL_APP_RATING_RESPONSE;
  };

  const handleStageSubmission = (currentStage, param) => {
    appRatingResponse.current = {...appRatingResponse.current, ...param};
    switch (currentStage) {
      case RATING:
        Logger.log('triggerActionEvent: SUBMIT on RATING stage');
        if (param.rating >= config.rating.positiveRatingThreshold) {
          if (config.storeRatingConfirmation.skipStage === true) {
            Logger.log('triggerActionEvent: storeRatingConfirmation.skipStage===true');
            appRatingResponse.current = {
              ...appRatingResponse.current,
              optedForStoreRating: true,
            };
            setShowRNAppRating(false);
            setRatingGiven().then(_ => {});
            return;
          }
          Logger.log('triggerActionEvent: RATING to STORE_RATING_CONFIRMATION');
          setStage(STORE_RATING_CONFIRMATION);
          return;
        }
        Logger.log('triggerActionEvent: RATING to FEEDBACK');
        setStage(FEEDBACK);
        return;
      case FEEDBACK:
        Logger.log('triggerActionEvent: SUBMIT on FEEDBACK');
        setShowRNAppRating(false);
        setRatingGiven().then(_ => {});
        return;
      case STORE_RATING_CONFIRMATION:
        Logger.log('triggerActionEvent: SUBMIT on STORE_RATING_CONFIRMATION');
        appRatingResponse.current = {
          ...appRatingResponse.current,
          optedForStoreRating: true,
        };
        setShowRNAppRating(false);
        setRatingGiven().then(_ => {});
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
        Logger.log('triggerActionEvent: RATE_LATER');
        appRatingResponse.current = {
          ...appRatingResponse.current,
          rateLater: true,
        };
        setShowRNAppRating(false);
        setRateLater().then(_ => {});
        return;
      case ACTION_EVENT.RATE_NEVER:
        Logger.log('triggerActionEvent: RATE_NEVER');
        appRatingResponse.current = {
          ...appRatingResponse.current,
          rateNever: true,
        };
        setShowRNAppRating(false);
        setRateNever().then(_ => {});
        return;
      case ACTION_EVENT.CANCEL:
        Logger.log('triggerActionEvent: CANCEL');
        appRatingResponse.current = {...appRatingResponse.current, ...param};
        setShowRNAppRating(false);
        return;
      default:
        return;
    }
  };

  const setCustomConfig = (customConfig = {}) => {
    Logger.log('showRNAppRating: set custom config');
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

  const setCustomRules = (customRules = {}) => {
    Logger.log('initRNAppRating: set custom rules');
    setConfig({...config, rules: {...config.rules, ...customRules}});
  };

  return (
    <RNAppRatingContext.Provider
      value={{
        showRNAppRating,
        setShowRNAppRating,
        stage,
        fireActionEvent,
        setJourneyCompletionCallback,
        setCustomConfig,
        setCustomRules,
        config,
      }}>
      {children}
      <RNAppRatingComponent />
    </RNAppRatingContext.Provider>
  );
};

export default RNAppRatingProvider;
