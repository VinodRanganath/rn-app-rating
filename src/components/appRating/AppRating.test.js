import React from 'react';
import {View} from 'react-native';
import {RNAppRatingContext} from '../../provider';
import DEFAULT_CONFIG from '../../config/Config';
import AppRating from './AppRating';
import {ACTION_EVENT, FEEDBACK, RATING, STORE_RATING_CONFIRMATION} from '../../constants';
import {fireEvent, render} from '@testing-library/react-native';

const DummyRatingComponent = props => <View testID="rating-stage" {...props} />;
const DummyFeedbackComponent = props => <View testID="feedback-stage" {...props} />;
const DummyStoreRatingConfirmationComponent = props => <View testID="store-rating-confirmation-stage" {...props} />;
const mockFireActionEvent = jest.fn();
const AppRatingWrapper = props => {
  const {stage = RATING, customConfig = DEFAULT_CONFIG} = props;

  return (
    <RNAppRatingContext.Provider value={{stage, fireActionEvent: mockFireActionEvent, config: customConfig}}>
      <AppRating />
    </RNAppRatingContext.Provider>
  );
};

jest.mock('../rating/Rating', () => DummyRatingComponent);
jest.mock('../feedback/Feedback', () => DummyFeedbackComponent);
jest.mock('../storeRatingConfirmation/StoreRatingConfirmation', () => DummyStoreRatingConfirmationComponent);

describe('App rating tests', () => {
  afterEach(() => jest.clearAllMocks());

  describe('rating', () => {
    it('should render app rating component, with rating stage, with given configurations', () => {
      const {getByTestId} = render(<AppRatingWrapper />);

      const ratingStage = getByTestId('rating-stage');
      expect(ratingStage.props.config).toStrictEqual(DEFAULT_CONFIG.rating);
      expect(ratingStage.props.rating).toBe(0);
    });

    it('should set showRateNever=true if showRateNever is enabled in config', () => {
      const config = {...DEFAULT_CONFIG, rating: {...DEFAULT_CONFIG.rating, showRateNever: true}};

      const {getByTestId} = render(<AppRatingWrapper customConfig={config} />);

      const ratingStage = getByTestId('rating-stage');
      expect(ratingStage.props.showRateNever).toBeTruthy();
    });

    it('should set showRateNever=false if showRateNever is disabled in config', () => {
      const config = {...DEFAULT_CONFIG, rating: {...DEFAULT_CONFIG.rating, showRateNever: false}};

      const {getByTestId} = render(<AppRatingWrapper customConfig={config} />);

      const ratingStage = getByTestId('rating-stage');
      expect(ratingStage.props.showRateNever).toBeFalsy();
    });

    it('should call appropriate callbacks and update states accordingly', () => {
      const {getByTestId} = render(<AppRatingWrapper />);

      const ratingStage = getByTestId('rating-stage');
      expect(ratingStage.props.rating).toBe(0);
      // positive button press without rating value
      fireEvent(ratingStage, 'onPositiveActionPress');
      expect(mockFireActionEvent).toHaveBeenCalledTimes(0);
      // rating change
      fireEvent(ratingStage, 'onRatingChange', 3);
      expect(ratingStage.props.rating).toBe(3);
      // positive button press with rating value
      fireEvent(ratingStage, 'onPositiveActionPress');
      expect(mockFireActionEvent).toHaveBeenCalledTimes(1);
      expect(mockFireActionEvent).toHaveBeenNthCalledWith(1, ACTION_EVENT.SUBMIT, {rating: 3, storeRating: false});
      // neutral button press
      fireEvent(ratingStage, 'onNeutralActionPress');
      expect(mockFireActionEvent).toHaveBeenCalledTimes(2);
      expect(mockFireActionEvent).toHaveBeenNthCalledWith(2, ACTION_EVENT.RATE_LATER);
      // negative button press
      fireEvent(ratingStage, 'onNegativeActionPress');
      expect(mockFireActionEvent).toHaveBeenCalledTimes(3);
      expect(mockFireActionEvent).toHaveBeenNthCalledWith(3, ACTION_EVENT.RATE_NEVER);
    });

    it('should render custom rating component instead of default, if given', () => {
      const {rating: ratingConfig} = DEFAULT_CONFIG;
      const CustomRatingComponent = () => <View testID="custom-rating-stage" />;
      const config = {...DEFAULT_CONFIG, rating: {...ratingConfig, component: CustomRatingComponent}};

      const {queryByTestId} = render(<AppRatingWrapper customConfig={config} />);

      expect(queryByTestId('rating-stage')).toBeNull();
      expect(queryByTestId('custom-rating-stage')).not.toBeNull();
    });
  });

  describe('feedback', () => {
    it('should render app rating component, with feedback stage, with given configurations', () => {
      const {getByTestId} = render(<AppRatingWrapper stage={FEEDBACK} />);

      const feedbackStage = getByTestId('feedback-stage');
      expect(feedbackStage.props.config).toStrictEqual(DEFAULT_CONFIG.feedback);
      expect(feedbackStage.props.feedback).toBe('');
    });

    it('should call appropriate callbacks and update states accordingly', () => {
      const {getByTestId} = render(<AppRatingWrapper stage={FEEDBACK} />);

      const feedbackStage = getByTestId('feedback-stage');
      expect(feedbackStage.props.feedback).toBe('');
      // positive button press without feedback value
      fireEvent(feedbackStage, 'onPositiveActionPress');
      expect(mockFireActionEvent).toHaveBeenCalledTimes(0);
      // feedback change
      fireEvent(feedbackStage, 'onFeedbackChange', 'new feedback text');
      expect(feedbackStage.props.feedback).toBe('new feedback text');
      // positive button press with feedback value
      fireEvent(feedbackStage, 'onPositiveActionPress');
      expect(mockFireActionEvent).toHaveBeenCalledTimes(1);
      expect(mockFireActionEvent).toHaveBeenNthCalledWith(1, ACTION_EVENT.SUBMIT, {feedback: 'new feedback text'});
      // negative button press
      fireEvent(feedbackStage, 'onNegativeActionPress');
      expect(mockFireActionEvent).toHaveBeenCalledTimes(2);
      expect(mockFireActionEvent).toHaveBeenNthCalledWith(2, ACTION_EVENT.CANCEL);
    });

    it('should render custom feedback component instead of default, if given', () => {
      const {feedback: feedbackConfig} = DEFAULT_CONFIG;
      const CustomFeedbackComponent = () => <View testID="custom-feedback-stage" />;
      const config = {...DEFAULT_CONFIG, feedback: {...feedbackConfig, component: CustomFeedbackComponent}};

      const {queryByTestId} = render(<AppRatingWrapper stage={FEEDBACK} customConfig={config} />);

      expect(queryByTestId('feedback-stage')).toBeNull();
      expect(queryByTestId('custom-feedback-stage')).not.toBeNull();
    });
  });

  describe('storeRatingConfirmation', () => {
    it('should render app rating component, with storeRatingConfirmation stage, with given configurations', () => {
      const {getByTestId} = render(<AppRatingWrapper stage={STORE_RATING_CONFIRMATION} />);

      const storeRatingConfirmationStage = getByTestId('store-rating-confirmation-stage');
      expect(storeRatingConfirmationStage.props.config).toStrictEqual(DEFAULT_CONFIG.storeRatingConfirmation);
    });

    it('should set showRateNever=true if showRateNever is enabled in config', () => {
      const config = {
        ...DEFAULT_CONFIG,
        storeRatingConfirmation: {...DEFAULT_CONFIG.storeRatingConfirmation, showRateNever: true},
      };

      const {getByTestId} = render(<AppRatingWrapper stage={STORE_RATING_CONFIRMATION} customConfig={config} />);

      const storeRatingConfirmationStage = getByTestId('store-rating-confirmation-stage');
      expect(storeRatingConfirmationStage.props.showRateNever).toBeTruthy();
    });

    it('should set showRateNever=false if showRateNever is disabled in config', () => {
      const config = {
        ...DEFAULT_CONFIG,
        storeRatingConfirmation: {...DEFAULT_CONFIG.storeRatingConfirmation, showRateNever: false},
      };

      const {getByTestId} = render(<AppRatingWrapper stage={STORE_RATING_CONFIRMATION} customConfig={config} />);

      const storeRatingConfirmationStage = getByTestId('store-rating-confirmation-stage');
      expect(storeRatingConfirmationStage.props.showRateNever).toBeFalsy();
    });

    it('should call appropriate callbacks and update states accordingly', () => {
      const {getByTestId} = render(<AppRatingWrapper stage={STORE_RATING_CONFIRMATION} />);

      const storeRatingConfirmationStage = getByTestId('store-rating-confirmation-stage');
      // positive button press
      fireEvent(storeRatingConfirmationStage, 'onPositiveActionPress');
      expect(mockFireActionEvent).toHaveBeenCalledTimes(1);
      expect(mockFireActionEvent).toHaveBeenNthCalledWith(1, ACTION_EVENT.SUBMIT, {storeRating: true});
      // neutral button press
      fireEvent(storeRatingConfirmationStage, 'onNeutralActionPress');
      expect(mockFireActionEvent).toHaveBeenCalledTimes(2);
      expect(mockFireActionEvent).toHaveBeenNthCalledWith(2, ACTION_EVENT.RATE_LATER);
      // negative button press
      fireEvent(storeRatingConfirmationStage, 'onNegativeActionPress');
      expect(mockFireActionEvent).toHaveBeenCalledTimes(3);
      expect(mockFireActionEvent).toHaveBeenNthCalledWith(3, ACTION_EVENT.RATE_NEVER);
    });

    it('should render custom storeRatingConfirmation component instead of default, if given', () => {
      const {storeRatingConfirmation: storeRatingConfirmationConfig} = DEFAULT_CONFIG;
      const CustomStoreRatingConfirmationComponent = () => <View testID="custom-store-rating-confirmation-stage" />;
      const config = {
        ...DEFAULT_CONFIG,
        storeRatingConfirmation: {...storeRatingConfirmationConfig, component: CustomStoreRatingConfirmationComponent},
      };

      const {queryByTestId} = render(<AppRatingWrapper stage={STORE_RATING_CONFIRMATION} customConfig={config} />);

      expect(queryByTestId('store-rating-confirmation-stage')).toBeNull();
      expect(queryByTestId('custom-store-rating-confirmation-stage')).not.toBeNull();
    });
  });
});
