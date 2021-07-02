import React from 'react';
import {View} from 'react-native';
import {fireEvent, render} from '@testing-library/react-native';
import StoreRatingConfirmation from './StoreRatingConfirmation';
import DEFAULT_CONFIG from '../../config/Config';

const DummyActionBar = props => <View testID="action-bar" {...props} />;

jest.mock('../actionBar/ActionBar', () => DummyActionBar);

describe('Store rating confirmation tests', () => {
  afterEach(() => jest.clearAllMocks());

  it('should render storeRatingConfirmation stage with given configurations', () => {
    const {storeRatingConfirmation: storeRatingConfirmationConfig} = DEFAULT_CONFIG;

    const {getByTestId} = render(<StoreRatingConfirmation config={storeRatingConfirmationConfig} />);

    const storeRatingConfirmationIcon = getByTestId('store-rating-confirmation-stage-icon');
    const storeRatingConfirmationTitle = getByTestId('store-rating-confirmation-stage-title');
    const storeRatingConfirmationSubtitle = getByTestId('store-rating-confirmation-stage-subtitle');
    const actionBar = getByTestId('action-bar');
    // icon
    expect(storeRatingConfirmationIcon.props.style).toStrictEqual(storeRatingConfirmationConfig.iconStyle);
    expect(storeRatingConfirmationIcon.props.source).toStrictEqual({uri: storeRatingConfirmationConfig.icon});
    // title
    expect(storeRatingConfirmationTitle.props.style).toStrictEqual(storeRatingConfirmationConfig.titleStyle);
    expect(storeRatingConfirmationTitle.props.children).toBe(storeRatingConfirmationConfig.title);
    // subtitle
    expect(storeRatingConfirmationSubtitle.props.style).toStrictEqual(storeRatingConfirmationConfig.subtitleStyle);
    expect(storeRatingConfirmationSubtitle.props.children).toBe(storeRatingConfirmationConfig.subtitle);
    // action bar
    expect(actionBar).toBeDefined();
    expect(actionBar.props.showRateNever).toBeFalsy();
  });

  it('should set showRateNever=true in action bar if showRateNever prop is true', () => {
    const {storeRatingConfirmation: storeRatingConfirmationConfig} = DEFAULT_CONFIG;

    const {getByTestId} = render(<StoreRatingConfirmation config={storeRatingConfirmationConfig} showRateNever />);

    const actionBar = getByTestId('action-bar');
    expect(actionBar).toBeDefined();
    expect(actionBar.props.showRateNever).toBeTruthy();
  });

  it('should render rating stage with rating and callbacks properly assigned and called', () => {
    const {storeRatingConfirmation: storeRatingConfirmationConfig} = DEFAULT_CONFIG;
    const mockOnPositiveActionPress = jest.fn();
    const mockOnNeutralActionPress = jest.fn();
    const mockOnNegativeActionPress = jest.fn();

    const {getByTestId} = render(
      <StoreRatingConfirmation
        config={storeRatingConfirmationConfig}
        onPositiveActionPress={mockOnPositiveActionPress}
        onNeutralActionPress={mockOnNeutralActionPress}
        onNegativeActionPress={mockOnNegativeActionPress}
      />,
    );

    const actionBar = getByTestId('action-bar');
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
