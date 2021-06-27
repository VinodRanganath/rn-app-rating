import React, {useEffect, useRef, useState} from 'react';
import RNAppRatingComponent from '../components/RNAppRatingComponent';
import {RNAppRatingContext} from './RNAppRatingContext';
import {ACTION_EVENT, FEEDBACK, RATING, STORE_RATING_CONFIRMATION} from '../constants';
import DEFAULT_CONFIG from '../config/Config';

const RNAppRatingProvider = props => {
  const {children} = props;
  const initialAppRatingResponse = {
    rating: 0,
    feedback: '',
    storeRating: false,
    rateLater: false,
    rateNever: false,
    journeyCancelled: false,
  };
  const initialCallback = _ => {};
  const [showRNAppRating, setShowRNAppRating] = useState(false);
  const [stage, setStage] = useState(RATING);
  const [appRatingResponse, setAppRatingResponse] = useState(initialAppRatingResponse);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const journeyCompletionCallback = useRef(initialCallback);

  useEffect(() => {
    if (showRNAppRating) resetState();
    else journeyCompletionCallback.current(appRatingResponse);
  }, [showRNAppRating]);

  const setJourneyCompletionCallback = (callback = initialCallback) => (journeyCompletionCallback.current = callback);

  const resetState = () => {
    setStage(RATING);
    setAppRatingResponse(initialAppRatingResponse);
  };

  const fireActionEvent = (actionEvent, param = {}) => {
    switch (actionEvent) {
      case ACTION_EVENT.SUBMIT:
        setAppRatingResponse({...appRatingResponse, ...param});
        if (stage === RATING) {
          if (param?.rating >= config.rating.positiveRatingThreshold) setStage(STORE_RATING_CONFIRMATION);
          else setStage(FEEDBACK);
          return;
        } else setShowRNAppRating(false);
        return;
      case ACTION_EVENT.RATE_LATER:
        // TODO: send response if on STORE_RATING_CONFIRMATION stage
        setAppRatingResponse({...appRatingResponse, rateLater: true});
        setShowRNAppRating(false);
        return;
      case ACTION_EVENT.RATE_NEVER:
        setAppRatingResponse({...appRatingResponse, rateNever: true});
        setShowRNAppRating(false);
        return;
      case ACTION_EVENT.CANCEL:
        // TODO: send response
        setAppRatingResponse({...appRatingResponse, ...param});
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
      storeRatingConfirmation: {...config.storeRatingConfirmation, ...customConfig.storeRatingConfirmation},
    };
    setConfig(tempConfig);
  };

  return (
    <RNAppRatingContext.Provider
      value={{
        showRNAppRating,
        setShowRNAppRating,
        stage,
        fireActionEvent,
        setJourneyCompletionCallback,
        loadCustomRNAppRatingConfig,
        config,
      }}>
      {children}
      <RNAppRatingComponent />
    </RNAppRatingContext.Provider>
  );
};

export default RNAppRatingProvider;
