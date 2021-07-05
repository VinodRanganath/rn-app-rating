import React from 'react';
import {View} from 'react-native';
import {fireEvent, render} from '@testing-library/react-native';
import Rating from './Rating';
import DEFAULT_CONFIG from '../../config/Config';

const DummyRatingInput = props => <View testID="rating-input" {...props} />;
const DummyActionBar = props => <View testID="action-bar" {...props} />;

jest.mock('../ratingInput/RatingInput', () => DummyRatingInput);
jest.mock('../actionBar/ActionBar', () => DummyActionBar);

describe('Rating tests', () => {
  afterEach(() => jest.clearAllMocks());

  it('should render rating stage with given configurations', () => {
    const {rating: ratingConfig} = DEFAULT_CONFIG;

    const {getByTestId} = render(<Rating config={ratingConfig} />);

    const ratingIcon = getByTestId('rating-stage-icon');
    const ratingTitle = getByTestId('rating-stage-title');
    const ratingSubtitle = getByTestId('rating-stage-subtitle');
    const ratingInput = getByTestId('rating-input');
    const actionBar = getByTestId('action-bar');
    // icon
    expect(ratingIcon.props.style).toStrictEqual(ratingConfig.iconStyle);
    expect(ratingIcon.props.source).toStrictEqual({uri: ratingConfig.iconInBase64});
    // title
    expect(ratingTitle.props.style).toStrictEqual(ratingConfig.titleStyle);
    expect(ratingTitle.props.children).toBe(ratingConfig.title);
    // subtitle
    expect(ratingSubtitle.props.style).toStrictEqual(ratingConfig.subtitleStyle);
    expect(ratingSubtitle.props.children).toBe(ratingConfig.subtitle);
    // rating input
    expect(ratingInput).toBeDefined();
    // action bar
    expect(actionBar).toBeDefined();
    expect(actionBar.props.showRateNever).toBeFalsy();
  });

  it('should set showRateNever=true in action bar if showRateNever prop is true', async () => {
    const {rating: ratingConfig} = DEFAULT_CONFIG;

    const {getByTestId} = render(<Rating config={ratingConfig} showRateNever />);

    const actionBar = getByTestId('action-bar');

    expect(actionBar).toBeDefined();
    expect(actionBar.props.showRateNever).toBeTruthy();
  });

  it('should render rating stage with rating and callbacks properly assigned and called', () => {
    const {rating: ratingConfig} = DEFAULT_CONFIG;
    const mockOnRatingChange = jest.fn();
    const mockOnPositiveActionPress = jest.fn();
    const mockOnNeutralActionPress = jest.fn();
    const mockOnNegativeActionPress = jest.fn();

    const {getByTestId} = render(
      <Rating
        config={ratingConfig}
        rating={4}
        onRatingChange={mockOnRatingChange}
        onPositiveActionPress={mockOnPositiveActionPress}
        onNeutralActionPress={mockOnNeutralActionPress}
        onNegativeActionPress={mockOnNegativeActionPress}
      />,
    );

    const ratingInput = getByTestId('rating-input');
    const actionBar = getByTestId('action-bar');
    // rating input
    expect(ratingInput.props.rating).toBe(4);
    expect(ratingInput.props.onRatingChange).toBe(mockOnRatingChange);

    fireEvent(ratingInput, 'onRatingChange');
    expect(mockOnRatingChange).toHaveBeenCalledTimes(1);
    // action bar
    expect(actionBar.props.onPositiveActionPress).toBe(mockOnPositiveActionPress);
    expect(actionBar.props.onNeutralActionPress).toBe(mockOnNeutralActionPress);
    expect(actionBar.props.onNegativeActionPress).toBe(mockOnNegativeActionPress);

    fireEvent(actionBar, 'onPositiveActionPress');
    fireEvent(actionBar, 'onNeutralActionPress');
    fireEvent(actionBar, 'onNegativeActionPress');
    expect(mockOnPositiveActionPress).toHaveBeenCalledTimes(1);
    expect(mockOnNeutralActionPress).toHaveBeenCalledTimes(1);
    expect(mockOnNegativeActionPress).toHaveBeenCalledTimes(1);
  });
});
