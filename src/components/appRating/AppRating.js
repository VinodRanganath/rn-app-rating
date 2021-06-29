import React, {useContext, useState} from 'react';
import Rating from '../rating/Rating';
import {RNAppRatingContext} from '../../provider/RNAppRatingContext';
import {ACTION_EVENT, RATING, FEEDBACK, STORE_RATING_CONFIRMATION} from '../../constants';
import StoreRatingConfirmation from '../storeRatingConfirmation/StoreRatingConfirmation';
import Feedback from '../feedback/Feedback';

const AppRating = () => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const {stage, fireActionEvent, config} = useContext(RNAppRatingContext);
  const {
    rating: ratingConfig,
    feedback: feedbackConfig,
    storeRatingConfirmation: storeRatingConfirmationConfig,
  } = config;
  const ratingStage = ratingConfig.component || (
    <Rating
      config={ratingConfig}
      rating={rating}
      onRatingChange={ratingValue => setRating(ratingValue)}
      onPositiveActionPress={() => rating > 0 && fireActionEvent(ACTION_EVENT.SUBMIT, {rating})}
      onNeutralActionPress={() => fireActionEvent(ACTION_EVENT.RATE_LATER)}
      onNegativeActionPress={() => fireActionEvent(ACTION_EVENT.RATE_NEVER)}
    />
  );
  const feedbackStage = feedbackConfig.component || (
    <Feedback
      config={feedbackConfig}
      feedback={feedback}
      onFeedbackChange={feedbackValue => setFeedback(feedbackValue)}
      onPositiveActionPress={() => feedback?.length > 0 && fireActionEvent(ACTION_EVENT.SUBMIT, {feedback})}
      onNegativeActionPress={() => fireActionEvent(ACTION_EVENT.CANCEL)}
    />
  );
  const storeRatingConfirmationStage = storeRatingConfirmationConfig.component || (
    <StoreRatingConfirmation
      config={storeRatingConfirmationConfig}
      onPositiveActionPress={() => fireActionEvent(ACTION_EVENT.SUBMIT, {storeRating: true})}
      onNeutralActionPress={() => fireActionEvent(ACTION_EVENT.RATE_LATER)}
      onNegativeActionPress={() => fireActionEvent(ACTION_EVENT.RATE_NEVER)}
    />
  );

  const renderStage = () => {
    switch (stage) {
      case RATING:
        return ratingStage;
      case FEEDBACK:
        return feedbackStage;
      case STORE_RATING_CONFIRMATION:
        return storeRatingConfirmationStage;
      default:
        return ratingStage;
    }
  };

  return renderStage();
};

export default AppRating;
