import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import RatingInput from './RatingInput';
import DEFAULT_CONFIG from '../../config/Config';

describe('Rating input tests', () => {
  afterEach(() => jest.clearAllMocks());

  it('should render rating input as per configurations', () => {
    const {queryAllByTestId} = render(<RatingInput config={DEFAULT_CONFIG.rating} />);

    const ratingButtons = queryAllByTestId('rating-input-button');
    expect(ratingButtons).toHaveLength(5);
    // TODO: Test image render
  });

  it('should trigger click callback on click of rating input', () => {
    const mockOnRatingChange = jest.fn();
    const {queryAllByTestId} = render(<RatingInput config={DEFAULT_CONFIG.rating} onRatingChange={mockOnRatingChange} />);

    const ratingButtons = queryAllByTestId('rating-input-button');
    // rating value of 1
    fireEvent(ratingButtons[0], 'onPress');
    expect(mockOnRatingChange).toHaveBeenCalledTimes(1);
    expect(mockOnRatingChange).toHaveBeenNthCalledWith(1, 1);
    // TODO: Test image fill style
    // rating value of 2
    fireEvent(ratingButtons[1], 'onPress');
    expect(mockOnRatingChange).toHaveBeenCalledTimes(2);
    expect(mockOnRatingChange).toHaveBeenNthCalledWith(2, 2);
    // TODO: Test image fill style
    // rating value of 3
    fireEvent(ratingButtons[2], 'onPress');
    expect(mockOnRatingChange).toHaveBeenCalledTimes(3);
    expect(mockOnRatingChange).toHaveBeenNthCalledWith(3, 3);
    // TODO: Test image fill style
    // rating value of 4
    fireEvent(ratingButtons[3], 'onPress');
    expect(mockOnRatingChange).toHaveBeenCalledTimes(4);
    expect(mockOnRatingChange).toHaveBeenNthCalledWith(4, 4);
    // TODO: Test image fill style
    // rating value of 5
    fireEvent(ratingButtons[4], 'onPress');
    expect(mockOnRatingChange).toHaveBeenCalledTimes(5);
    expect(mockOnRatingChange).toHaveBeenNthCalledWith(5, 5);
    // TODO: Test image fill style
  });
});
