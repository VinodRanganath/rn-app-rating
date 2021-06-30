import React from 'react';
import {RNAppRatingContext} from '../../provider/RNAppRatingContext';
import ActionBar from './ActionBar';
import {fireEvent, render} from '@testing-library/react-native';
import {FEEDBACK, RATING, STORE_RATING_CONFIRMATION} from '../../constants';
import DEFAULT_CONFIG from '../../config/Config';

const ActionBarWrapper = props => {
  const {stage, ...restProps} = props;

  return (
    <RNAppRatingContext.Provider value={{stage}}>
      <ActionBar {...restProps} />
    </RNAppRatingContext.Provider>
  );
};

describe('Action bar tests', () => {
  it('should render action bar, as per configuration, with neutral button if stage=RATING', () => {
    const {getByTestId} = render(<ActionBarWrapper stage={RATING} config={DEFAULT_CONFIG.rating} />);

    const positiveButton = getByTestId('action-bar-positive-button');
    const positiveButtonText = getByTestId('action-bar-positive-button-text');
    const neutralButton = getByTestId('action-bar-neutral-button');
    const neutralButtonText = getByTestId('action-bar-neutral-button-text');
    expect(getByTestId('action-bar')).toBeDefined();
    // positiveButton
    expect(positiveButton).toBeDefined();
    expect(positiveButtonText).toBeDefined();
    expect(positiveButtonText.props.style).toStrictEqual(DEFAULT_CONFIG.rating.positiveButtonTextStyle);
    expect(positiveButtonText.props.children).toBe('Submit');
    // neutralButton
    expect(neutralButton).toBeDefined();
    expect(neutralButtonText).toBeDefined();
    expect(neutralButtonText.props.style).toStrictEqual(DEFAULT_CONFIG.rating.neutralButtonTextStyle);
    expect(neutralButtonText.props.children).toBe('Rate Later');
  });

  it('should render action bar, as per configuration, with negative button if stage=RATING and showRateNever=true', () => {
    const {getByTestId} = render(<ActionBarWrapper stage={RATING} config={DEFAULT_CONFIG.rating} showRateNever />);

    const negativeButton = getByTestId('action-bar-negative-button');
    const negativeButtonText = getByTestId('action-bar-negative-button-text');
    // negativeButton
    expect(negativeButton).toBeDefined();
    expect(negativeButtonText).toBeDefined();
    expect(negativeButtonText.props.style).toStrictEqual(DEFAULT_CONFIG.rating.negativeButtonTextStyle);
    expect(negativeButtonText.props.children).toBe('Never');
  });

  it('should render action bar, as per configuration, with neutral button if stage=STORE_RATING_CONFIRMATION', () => {
    const {getByTestId} = render(
      <ActionBarWrapper stage={STORE_RATING_CONFIRMATION} config={DEFAULT_CONFIG.storeRatingConfirmation} />,
    );

    const positiveButton = getByTestId('action-bar-positive-button');
    const positiveButtonText = getByTestId('action-bar-positive-button-text');
    const neutralButton = getByTestId('action-bar-neutral-button');
    const neutralButtonText = getByTestId('action-bar-neutral-button-text');
    expect(getByTestId('action-bar')).toBeDefined();
    // positiveButton
    expect(positiveButton).toBeDefined();
    expect(positiveButtonText).toBeDefined();
    expect(positiveButtonText.props.style).toStrictEqual(DEFAULT_CONFIG.rating.positiveButtonTextStyle);
    expect(positiveButtonText.props.children).toBe('Rate Now');
    // neutralButton
    expect(neutralButton).toBeDefined();
    expect(neutralButtonText).toBeDefined();
    expect(neutralButtonText.props.style).toStrictEqual(DEFAULT_CONFIG.rating.neutralButtonTextStyle);
    expect(neutralButtonText.props.children).toBe('Rate Later');
  });

  it('should render action bar, as per configuration, with negative button if stage=STORE_RATING_CONFIRMATION and showRateNever=true', () => {
    const {getByTestId} = render(
      <ActionBarWrapper
        stage={STORE_RATING_CONFIRMATION}
        config={DEFAULT_CONFIG.storeRatingConfirmation}
        showRateNever
      />,
    );

    const negativeButton = getByTestId('action-bar-negative-button');
    const negativeButtonText = getByTestId('action-bar-negative-button-text');
    // negativeButton
    expect(negativeButton).toBeDefined();
    expect(negativeButtonText).toBeDefined();
    expect(negativeButtonText.props.style).toStrictEqual(DEFAULT_CONFIG.rating.negativeButtonTextStyle);
    expect(negativeButtonText.props.children).toBe('Never');
  });

  it('should render action bar, as per configuration, with negative button if stage=FEEDBACK', () => {
    const {getByTestId} = render(<ActionBarWrapper stage={FEEDBACK} config={DEFAULT_CONFIG.feedback} />);

    const positiveButton = getByTestId('action-bar-positive-button');
    const positiveButtonText = getByTestId('action-bar-positive-button-text');
    const negativeButton = getByTestId('action-bar-negative-button');
    const negativeButtonText = getByTestId('action-bar-negative-button-text');
    expect(getByTestId('action-bar')).toBeDefined();
    // positiveButton
    expect(positiveButton).toBeDefined();
    expect(positiveButtonText).toBeDefined();
    expect(positiveButtonText.props.style).toStrictEqual(DEFAULT_CONFIG.rating.positiveButtonTextStyle);
    expect(positiveButtonText.props.children).toBe('Submit');
    // negativeButton
    expect(negativeButton).toBeDefined();
    expect(negativeButtonText).toBeDefined();
    expect(negativeButtonText.props.style).toStrictEqual(DEFAULT_CONFIG.rating.negativeButtonTextStyle);
    expect(negativeButtonText.props.children).toBe('Cancel');
  });

  it('should trigger appropriate callbacks on each button click', () => {
    const mockPositiveButtonCallback = jest.fn();
    const mockNeutralButtonCallback = jest.fn();
    const mockNegativeButtonCallback = jest.fn();

    const {getByTestId} = render(
      <ActionBarWrapper
        stage={RATING}
        config={DEFAULT_CONFIG.rating}
        showRateNever
        onPositiveActionPress={mockPositiveButtonCallback}
        onNeutralActionPress={mockNeutralButtonCallback}
        onNegativeActionPress={mockNegativeButtonCallback}
      />,
    );

    const positiveButton = getByTestId('action-bar-positive-button');
    const neutralButton = getByTestId('action-bar-neutral-button');
    const negativeButton = getByTestId('action-bar-negative-button');
    // positiveButton
    fireEvent(positiveButton, 'onPress');
    expect(mockPositiveButtonCallback).toHaveBeenCalledTimes(1);
    // neutralButton
    fireEvent(neutralButton, 'onPress');
    expect(mockNeutralButtonCallback).toHaveBeenCalledTimes(1);
    // negativeButton
    fireEvent(negativeButton, 'onPress');
    expect(mockNegativeButtonCallback).toHaveBeenCalledTimes(1);
  });
});
