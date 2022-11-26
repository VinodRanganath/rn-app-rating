import React, {useContext} from 'react';
import {RNAppRatingContext} from './RNAppRatingContext';
import {NativeModules, Platform, View} from 'react-native';
import RNAppRatingProvider from './RNAppRatingProvider';
import {fireEvent, render} from '@testing-library/react-native';
import {ACTION_EVENT, FEEDBACK, INITIAL_APP_RATING_RESPONSE, RATING, STORE_RATING_CONFIRMATION} from '../constants';
import DEFAULT_CONFIG from '../config/Config';

const mockCallback = jest.fn();
const mockSetRateLater = jest.fn().mockImplementation(() => Promise.resolve());
const mockSetRateNever = jest.fn().mockImplementation(() => Promise.resolve());
const mockSetRatingGiven = jest.fn().mockImplementation(() => Promise.resolve());
const mockShowInAppReview = jest.fn().mockImplementation(() => Promise.resolve());
const MockConsumerComponent = () => {
  const {
    showRNAppRating,
    setShowRNAppRating,
    stage,
    fireActionEvent,
    setJourneyCompletionCallback,
    setCustomConfig,
    setCustomRules,
    config,
  } = useContext(RNAppRatingContext);

  return (
    <View
      testID="mock-component"
      showRNAppRating={showRNAppRating}
      stage={stage}
      config={config}
      onSetShowRNAppRating={show => setShowRNAppRating(show)}
      onSetCallback={() => setJourneyCompletionCallback(mockCallback)}
      onFireEvent={(event, param) => fireActionEvent(event, param)}
      onSetCustomRules={customRules => setCustomRules(customRules)}
      onSetCustomConfig={customConfig => setCustomConfig(customConfig)}
    />
  );
};
const MockConsumerWrapper = () => {
  return (
    <RNAppRatingProvider>
      <MockConsumerComponent />
    </RNAppRatingProvider>
  );
};

jest.mock('../hooks/useRuleManager/useRuleManager', () => () => ({
  setRateLater: mockSetRateLater,
  setRateNever: mockSetRateNever,
  setRatingGiven: mockSetRatingGiven,
}));
jest.mock('../helpers/logger/Logger', () => ({
  log: jest.fn(),
}));
NativeModules.RnAppRating = {
  showInAppReview: mockShowInAppReview,
};

describe('RNAppRatingProvider tests', () => {
  afterEach(() => jest.clearAllMocks());

  describe('showRNAppRating', () => {
    it('should default to showRNAppRating=false initially', () => {
      const {getByTestId} = render(<MockConsumerWrapper />);

      expect(getByTestId('mock-component').props.showRNAppRating).toBeFalsy();
    });

    it('should set showRNAppRating=true if set', () => {
      const {getByTestId} = render(<MockConsumerWrapper />);

      const mockComponent = getByTestId('mock-component');

      expect(mockComponent.props.showRNAppRating).toBeFalsy();
      // show
      fireEvent(mockComponent, 'onSetShowRNAppRating', true);
      expect(mockComponent.props.showRNAppRating).toBeTruthy();
    });
  });

  describe('setJourneyCompletionCallback', () => {
    it('should set journeyCompletionCallback if passed, and must be invoked, with response, on showRNAppRating=false', () => {
      const {getByTestId} = render(<MockConsumerWrapper />);

      const mockComponent = getByTestId('mock-component');

      // show
      fireEvent(mockComponent, 'onSetShowRNAppRating', true);
      expect(mockComponent.props.showRNAppRating).toBeTruthy();
      // set callback
      fireEvent(mockComponent, 'onSetCallback');
      // hide
      fireEvent(mockComponent, 'onSetShowRNAppRating', false);
      expect(mockComponent.props.showRNAppRating).toBeFalsy();
      // invoke callback with response
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenNthCalledWith(1, INITIAL_APP_RATING_RESPONSE);
    });
  });

  describe('stage and fireActionEvent', () => {
    it('should have default stage as RATING', () => {
      const {getByTestId} = render(<MockConsumerWrapper />);

      const mockComponent = getByTestId('mock-component');

      expect(mockComponent.props.stage).toEqual(RATING);
    });

    describe('SUBMIT', () => {
      it('should set stage as FEEDBACK if event=SUBMIT, stage=RATING and rating<positiveRatingThreshold', () => {
        const {getByTestId} = render(<MockConsumerWrapper />);

        const mockComponent = getByTestId('mock-component');

        // show
        fireEvent(mockComponent, 'onSetShowRNAppRating', true);
        expect(mockComponent.props.stage).toEqual(RATING);
        // submit rating
        fireEvent(mockComponent, 'onFireEvent', ACTION_EVENT.SUBMIT, {rating: 3});
        expect(mockComponent.props.showRNAppRating).toBeTruthy();
        expect(mockComponent.props.stage).toEqual(FEEDBACK);
      });

      it('should set stage as STORE_RATING_CONFIRMATION if event=SUBMIT, stage=RATING, rating===positiveRatingThreshold and skipStage=false', () => {
        const {getByTestId} = render(<MockConsumerWrapper />);

        const mockComponent = getByTestId('mock-component');

        // show
        fireEvent(mockComponent, 'onSetShowRNAppRating', true);
        expect(mockComponent.props.stage).toEqual(RATING);
        // submit rating
        fireEvent(mockComponent, 'onFireEvent', ACTION_EVENT.SUBMIT, {rating: 4});
        expect(mockComponent.props.showRNAppRating).toBeTruthy();
        expect(mockComponent.props.stage).toEqual(STORE_RATING_CONFIRMATION);
      });

      it('should set stage as STORE_RATING_CONFIRMATION if event=SUBMIT, stage=RATING, rating>positiveRatingThreshold and skipStage=false', () => {
        const {getByTestId} = render(<MockConsumerWrapper />);

        const mockComponent = getByTestId('mock-component');

        // show
        fireEvent(mockComponent, 'onSetShowRNAppRating', true);
        expect(mockComponent.props.stage).toEqual(RATING);
        // submit rating
        fireEvent(mockComponent, 'onFireEvent', ACTION_EVENT.SUBMIT, {rating: 5});
        expect(mockComponent.props.showRNAppRating).toBeTruthy();
        expect(mockComponent.props.stage).toEqual(STORE_RATING_CONFIRMATION);
      });

      it('should hide popup, with appropriate response, if event=SUBMIT, stage=RATING, rating>=positiveRatingThreshold and skipStage=true', () => {
        const {getByTestId} = render(<MockConsumerWrapper />);

        const mockComponent = getByTestId('mock-component');

        // show
        fireEvent(mockComponent, 'onSetShowRNAppRating', true);
        expect(mockComponent.props.stage).toEqual(RATING);
        // set skipStage=true
        fireEvent(mockComponent, 'onSetCustomConfig', {storeRatingConfirmation: {skipStage: true}});
        // set callback
        fireEvent(mockComponent, 'onSetCallback');
        // submit rating
        fireEvent(mockComponent, 'onFireEvent', ACTION_EVENT.SUBMIT, {rating: 4});
        expect(mockComponent.props.showRNAppRating).toBeFalsy();
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenNthCalledWith(1, {
          ...INITIAL_APP_RATING_RESPONSE,
          rating: 4,
          optedForStoreRating: true,
        });
        expect(mockSetRatingGiven).toHaveBeenCalledTimes(1);
      });

      it('should open native android in-app review dialog, if event=SUBMIT, stage=RATING, rating>=positiveRatingThreshold, skipStage=true and OS=android', () => {
        Platform.OS = 'android';

        const {getByTestId} = render(<MockConsumerWrapper />);

        const mockComponent = getByTestId('mock-component');

        // show
        fireEvent(mockComponent, 'onSetShowRNAppRating', true);
        // set skipStage=true
        fireEvent(mockComponent, 'onSetCustomConfig', {storeRatingConfirmation: {skipStage: true}});
        // set callback
        fireEvent(mockComponent, 'onSetCallback');
        // submit rating
        fireEvent(mockComponent, 'onFireEvent', ACTION_EVENT.SUBMIT, {rating: 4});
        expect(mockShowInAppReview).toHaveBeenCalledTimes(1);
      });

      it('should hide popup, with appropriate response, if event=SUBMIT, stage=FEEDBACK', () => {
        const {getByTestId} = render(<MockConsumerWrapper />);

        const mockComponent = getByTestId('mock-component');

        // show
        fireEvent(mockComponent, 'onSetShowRNAppRating', true);
        expect(mockComponent.props.stage).toEqual(RATING);
        // set callback
        fireEvent(mockComponent, 'onSetCallback');
        // submit rating
        fireEvent(mockComponent, 'onFireEvent', ACTION_EVENT.SUBMIT, {rating: 2});
        // submit feedback
        fireEvent(mockComponent, 'onFireEvent', ACTION_EVENT.SUBMIT, {feedback: 'custom feedback'});
        expect(mockComponent.props.showRNAppRating).toBeFalsy();
        expect(mockComponent.props.stage).toEqual(FEEDBACK);
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenNthCalledWith(1, {
          ...INITIAL_APP_RATING_RESPONSE,
          rating: 2,
          feedback: 'custom feedback',
        });
        expect(mockSetRatingGiven).toHaveBeenCalledTimes(1);
      });

      it('should hide popup, with appropriate response, if event=SUBMIT, stage=STORE_RATING_CONFIRMATION', () => {
        const {getByTestId} = render(<MockConsumerWrapper />);

        const mockComponent = getByTestId('mock-component');

        // show
        fireEvent(mockComponent, 'onSetShowRNAppRating', true);
        expect(mockComponent.props.stage).toEqual(RATING);
        // set callback
        fireEvent(mockComponent, 'onSetCallback');
        // submit rating
        fireEvent(mockComponent, 'onFireEvent', ACTION_EVENT.SUBMIT, {rating: 5});
        // opt for store rating
        fireEvent(mockComponent, 'onFireEvent', ACTION_EVENT.SUBMIT);
        expect(mockComponent.props.showRNAppRating).toBeFalsy();
        expect(mockComponent.props.stage).toEqual(STORE_RATING_CONFIRMATION);
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenNthCalledWith(1, {
          ...INITIAL_APP_RATING_RESPONSE,
          rating: 5,
          optedForStoreRating: true,
        });
        expect(mockSetRatingGiven).toHaveBeenCalledTimes(1);
      });

      it('should open native android in-app review dialog with false, if event=SUBMIT, stage=STORE_RATING_CONFIRMATION, OS=android and debug=false', () => {
        Platform.OS = 'android';

        const {getByTestId} = render(<MockConsumerWrapper />);

        const mockComponent = getByTestId('mock-component');

        // show
        fireEvent(mockComponent, 'onSetShowRNAppRating', true);
        // set callback
        fireEvent(mockComponent, 'onSetCallback');
        // submit rating
        fireEvent(mockComponent, 'onFireEvent', ACTION_EVENT.SUBMIT, {rating: 5});
        // opt for store rating
        fireEvent(mockComponent, 'onFireEvent', ACTION_EVENT.SUBMIT);
        expect(mockShowInAppReview).toHaveBeenCalledTimes(1);
        expect(mockShowInAppReview).toHaveBeenNthCalledWith(1, false);
      });

      it('should open native android in-app review dialog with false, if event=SUBMIT, stage=STORE_RATING_CONFIRMATION, OS=android and debug=true', () => {
        Platform.OS = 'android';

        const {getByTestId} = render(<MockConsumerWrapper />);

        const mockComponent = getByTestId('mock-component');

        // load custom rules
        fireEvent(mockComponent, 'onSetCustomRules', {debug: true});

        // show
        fireEvent(mockComponent, 'onSetShowRNAppRating', true);
        // set callback
        fireEvent(mockComponent, 'onSetCallback');
        // submit rating
        fireEvent(mockComponent, 'onFireEvent', ACTION_EVENT.SUBMIT, {rating: 5});
        // opt for store rating
        fireEvent(mockComponent, 'onFireEvent', ACTION_EVENT.SUBMIT);
        expect(mockShowInAppReview).toHaveBeenCalledTimes(1);
        expect(mockShowInAppReview).toHaveBeenNthCalledWith(1, true);
      });

      it('should open native android in-app review dialog without params, if event=SUBMIT, stage=STORE_RATING_CONFIRMATION, OS=ios', () => {
        Platform.OS = 'ios';

        const {getByTestId} = render(<MockConsumerWrapper />);

        const mockComponent = getByTestId('mock-component');

        // show
        fireEvent(mockComponent, 'onSetShowRNAppRating', true);
        // set callback
        fireEvent(mockComponent, 'onSetCallback');
        // submit rating
        fireEvent(mockComponent, 'onFireEvent', ACTION_EVENT.SUBMIT, {rating: 5});
        // opt for store rating
        fireEvent(mockComponent, 'onFireEvent', ACTION_EVENT.SUBMIT);
        expect(mockShowInAppReview).toHaveBeenCalledTimes(1);
        expect(mockShowInAppReview).toHaveBeenNthCalledWith(1);
      });
    });

    describe('RATE_LATER', () => {
      it('should hide popup, with appropriate response, if event=RATE_LATER and stage=RATING', () => {
        const {getByTestId} = render(<MockConsumerWrapper />);

        const mockComponent = getByTestId('mock-component');

        // show
        fireEvent(mockComponent, 'onSetShowRNAppRating', true);
        expect(mockComponent.props.stage).toEqual(RATING);
        // set callback
        fireEvent(mockComponent, 'onSetCallback');
        // rate later
        fireEvent(mockComponent, 'onFireEvent', ACTION_EVENT.RATE_LATER);
        expect(mockComponent.props.showRNAppRating).toBeFalsy();
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenNthCalledWith(1, {
          ...INITIAL_APP_RATING_RESPONSE,
          rating: 0,
          rateLater: true,
        });
        expect(mockSetRateLater).toHaveBeenCalledTimes(1);
      });

      it('should hide popup, with appropriate response, if event=RATE_LATER and stage=STORE_RATING_CONFIRMATION', () => {
        const {getByTestId} = render(<MockConsumerWrapper />);

        const mockComponent = getByTestId('mock-component');

        // show
        fireEvent(mockComponent, 'onSetShowRNAppRating', true);
        expect(mockComponent.props.stage).toEqual(RATING);
        // set callback
        fireEvent(mockComponent, 'onSetCallback');
        // submit rating
        fireEvent(mockComponent, 'onFireEvent', ACTION_EVENT.SUBMIT, {rating: 5});
        expect(mockComponent.props.stage).toEqual(STORE_RATING_CONFIRMATION);
        // rate later
        fireEvent(mockComponent, 'onFireEvent', ACTION_EVENT.RATE_LATER);
        expect(mockComponent.props.showRNAppRating).toBeFalsy();
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenNthCalledWith(1, {
          ...INITIAL_APP_RATING_RESPONSE,
          rating: 5,
          rateLater: true,
        });
        expect(mockSetRateLater).toHaveBeenCalledTimes(1);
      });
    });

    describe('RATE_NEVER', () => {
      it('should hide popup, with appropriate response, if event=RATE_NEVER and stage=RATING', () => {
        const {getByTestId} = render(<MockConsumerWrapper />);

        const mockComponent = getByTestId('mock-component');

        // show
        fireEvent(mockComponent, 'onSetShowRNAppRating', true);
        expect(mockComponent.props.stage).toEqual(RATING);
        // set callback
        fireEvent(mockComponent, 'onSetCallback');
        // rate never
        fireEvent(mockComponent, 'onFireEvent', ACTION_EVENT.RATE_NEVER);
        expect(mockComponent.props.showRNAppRating).toBeFalsy();
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenNthCalledWith(1, {
          ...INITIAL_APP_RATING_RESPONSE,
          rating: 0,
          rateNever: true,
        });
        expect(mockSetRateNever).toHaveBeenCalledTimes(1);
      });

      it('should hide popup, with appropriate response, if event=RATE_NEVER and stage=STORE_RATING_CONFIRMATION', () => {
        const {getByTestId} = render(<MockConsumerWrapper />);

        const mockComponent = getByTestId('mock-component');

        // show
        fireEvent(mockComponent, 'onSetShowRNAppRating', true);
        expect(mockComponent.props.stage).toEqual(RATING);
        // set callback
        fireEvent(mockComponent, 'onSetCallback');
        // submit rating
        fireEvent(mockComponent, 'onFireEvent', ACTION_EVENT.SUBMIT, {rating: 5});
        expect(mockComponent.props.stage).toEqual(STORE_RATING_CONFIRMATION);
        // rate never
        fireEvent(mockComponent, 'onFireEvent', ACTION_EVENT.RATE_NEVER);
        expect(mockComponent.props.showRNAppRating).toBeFalsy();
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenNthCalledWith(1, {
          ...INITIAL_APP_RATING_RESPONSE,
          rating: 5,
          rateNever: true,
        });
        expect(mockSetRateNever).toHaveBeenCalledTimes(1);
      });
    });

    describe('CANCEL', () => {
      it('should hide popup, with appropriate response, if event=CANCEL and stage=FEEDBACK', () => {
        const {getByTestId} = render(<MockConsumerWrapper />);

        const mockComponent = getByTestId('mock-component');

        // show
        fireEvent(mockComponent, 'onSetShowRNAppRating', true);
        expect(mockComponent.props.stage).toEqual(RATING);
        // set callback
        fireEvent(mockComponent, 'onSetCallback');
        // submit rating
        fireEvent(mockComponent, 'onFireEvent', ACTION_EVENT.SUBMIT, {rating: 2});
        // cancel feedback
        fireEvent(mockComponent, 'onFireEvent', ACTION_EVENT.CANCEL);
        expect(mockComponent.props.showRNAppRating).toBeFalsy();
        expect(mockComponent.props.stage).toEqual(FEEDBACK);
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenNthCalledWith(1, {
          ...INITIAL_APP_RATING_RESPONSE,
          rating: 2,
        });
      });
    });
  });

  describe('setCustomConfig', () => {
    it('should load custom config if given', () => {
      const {rating} = DEFAULT_CONFIG;

      const {getByTestId} = render(<MockConsumerWrapper />);

      const mockComponent = getByTestId('mock-component');

      expect(mockComponent.props.config).toStrictEqual(DEFAULT_CONFIG);
      // load custom config
      fireEvent(mockComponent, 'onSetCustomConfig', {rating: {title: 'custom title'}});
      expect(mockComponent.props.config).toStrictEqual({...DEFAULT_CONFIG, rating: {...rating, title: 'custom title'}});
    });
  });

  describe('setCustomRules', () => {
    it('should load custom rules if given', () => {
      const {rules} = DEFAULT_CONFIG;

      const {getByTestId} = render(<MockConsumerWrapper />);

      const mockComponent = getByTestId('mock-component');

      expect(mockComponent.props.config).toStrictEqual(DEFAULT_CONFIG);
      // load custom rules
      fireEvent(mockComponent, 'onSetCustomRules', {minimumAppLaunches: 4});
      expect(mockComponent.props.config).toStrictEqual({...DEFAULT_CONFIG, rules: {...rules, minimumAppLaunches: 4}});
    });
  });
});
