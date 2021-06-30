import React, {useContext, useEffect} from 'react';
import {render} from '@testing-library/react-native';
import {View} from 'react-native';
import {ACTION_EVENT, FEEDBACK, INITIAL_APP_RATING_RESPONSE, RATING, STORE_RATING_CONFIRMATION} from '../constants';
import RNAppRatingProvider from './RNAppRatingProvider';
import {RNAppRatingContext} from './RNAppRatingContext';
import DEFAULT_CONFIG from '../config/Config';

const mockCallback = jest.fn();
const MockConsumerComponent = props => {
  const {show = false, customConfig = {}, callback = false, event, param} = props;
  const {
    showRNAppRating,
    setShowRNAppRating,
    stage,
    fireActionEvent,
    setJourneyCompletionCallback,
    loadCustomRNAppRatingConfig,
    config,
  } = useContext(RNAppRatingContext);
  useEffect(() => {
    setShowRNAppRating(show);
    loadCustomRNAppRatingConfig(customConfig);
    if (event) {
      fireActionEvent(event, param);
    }
    if (callback) {
      setJourneyCompletionCallback(mockCallback);
    }
  }, []);
  return <View testID="mock-component" showRNAppRating={showRNAppRating} stage={stage} config={config} />;
};
const MockConsumerWrapper = props => {
  return (
    <RNAppRatingProvider>
      <MockConsumerComponent {...props} />
    </RNAppRatingProvider>
  );
};

describe('RNAppRatingProvider tests', () => {
  afterEach(() => jest.clearAllMocks());

  describe('showRNAppRating', () => {
    it('should provide default showRNAppRating value, to consumer component, as false', () => {
      const {getByTestId} = render(<MockConsumerWrapper />);

      const consumer = getByTestId('mock-component');
      expect(consumer.props.showRNAppRating).toBeFalsy();
    });

    it('should provide showRNAppRating value, to consumer component, as true if set', () => {
      const {getByTestId} = render(<MockConsumerWrapper show />);

      const consumer = getByTestId('mock-component');
      expect(consumer.props.showRNAppRating).toBeTruthy();
    });
  });

  describe('stage and fireActionEvent', () => {
    it('should provide default stage value, to consumer component, as RATING', () => {
      const {getByTestId} = render(<MockConsumerWrapper />);

      const consumer = getByTestId('mock-component');
      expect(consumer.props.stage).toStrictEqual(RATING);
    });

    it('should provide stage value, to consumer component, as FEEDBACK if SUBMIT event is fired with rating less than threshold', () => {
      const {getByTestId} = render(<MockConsumerWrapper event={ACTION_EVENT.SUBMIT} param={{rating: 2}} callback />);

      const consumer = getByTestId('mock-component');
      expect(consumer.props.stage).toStrictEqual(FEEDBACK);
    });

    it('should provide stage value, to consumer component, as STORE_RATING_CONFIRMATION if SUBMIT event is fired with rating equal to threshold', () => {
      const {getByTestId} = render(<MockConsumerWrapper event={ACTION_EVENT.SUBMIT} param={{rating: 4}} />);

      const consumer = getByTestId('mock-component');
      expect(consumer.props.stage).toStrictEqual(STORE_RATING_CONFIRMATION);
    });

    it('should provide stage value, to consumer component, as STORE_RATING_CONFIRMATION if SUBMIT event is fired with rating greater than threshold', () => {
      const {getByTestId} = render(<MockConsumerWrapper event={ACTION_EVENT.SUBMIT} param={{rating: 4}} />);

      const consumer = getByTestId('mock-component');
      expect(consumer.props.stage).toStrictEqual(STORE_RATING_CONFIRMATION);
    });

    it('should invoke custom callback with rateLater=true in response, on journey end, if RATE_LATER event is fired', () => {
      render(<MockConsumerWrapper callback event={ACTION_EVENT.RATE_LATER} />);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenNthCalledWith(1, {
        ...INITIAL_APP_RATING_RESPONSE,
        rateLater: true,
      });
    });

    it('should invoke custom callback with rateNever=true in response, on journey end, if RATE_NEVER event is fired', () => {
      render(<MockConsumerWrapper callback event={ACTION_EVENT.RATE_NEVER} />);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenNthCalledWith(1, {
        ...INITIAL_APP_RATING_RESPONSE,
        rateNever: true,
      });
    });

    it('should invoke custom callback, on journey end, if CANCEL event is fired', () => {
      render(<MockConsumerWrapper callback event={ACTION_EVENT.CANCEL} />);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenNthCalledWith(1, INITIAL_APP_RATING_RESPONSE);
    });

    it('should invoke custom callback with journeyCancelled=true in response, on journey end, if CANCEL event is fired without completing journey', () => {
      render(<MockConsumerWrapper callback event={ACTION_EVENT.CANCEL} param={{journeyCancelled: true}} />);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenNthCalledWith(1, {
        ...INITIAL_APP_RATING_RESPONSE,
        journeyCancelled: true,
      });
    });
  });

  describe('config', () => {
    it('should provide default config value to consumer component', () => {
      const {getByTestId} = render(<MockConsumerWrapper />);

      const consumer = getByTestId('mock-component');
      expect(consumer.props.config).toStrictEqual(DEFAULT_CONFIG);
    });

    it('should provide custom config value, to consumer component, if set', () => {
      const customConfig = {rating: {title: 'custom title'}};
      const {getByTestId} = render(<MockConsumerWrapper customConfig={customConfig} />);

      const consumer = getByTestId('mock-component');
      expect(consumer.props.config).toStrictEqual({
        ...DEFAULT_CONFIG,
        rating: {...DEFAULT_CONFIG.rating, ...customConfig.rating},
      });
    });
  });
});
