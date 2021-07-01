import React from 'react';
import {Image, TouchableWithoutFeedback} from 'react-native';
import {RATING_VALUE} from '../../constants';

const RatingInput = props => {
  const {config = {}, rating, onRatingChange} = props;

  const fetchRatingImageStyle = ratingValue =>
    Object.assign({}, config.ratingIconStyle || {}, ratingValue <= rating ? config.ratingIconFillStyle || {} : {});

  return (
    <>
      {Object.keys(RATING_VALUE).map(ratingValueKey => (
        <TouchableWithoutFeedback
          testID="rating-input-button"
          key={ratingValueKey}
          onPress={() => onRatingChange(RATING_VALUE[ratingValueKey])}>
          <Image
            testID="rating-input-button-image"
            style={fetchRatingImageStyle(RATING_VALUE[ratingValueKey])}
            source={{uri: config.ratingIcon}}
          />
        </TouchableWithoutFeedback>
      ))}
    </>
  );
};

export default RatingInput;
