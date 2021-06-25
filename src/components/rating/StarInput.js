import React from 'react';
import {Image, TouchableWithoutFeedback} from 'react-native';
import {RATING_VALUE} from '../../constants';
import styles from '../styles';

const StarInput = props => {
  const {config, rating, onRatingChange} = props;

  const fetchStarRatingStyle = ratingValue => {
    let fillStyle = {};
    if (ratingValue <= rating) fillStyle = styles.starRatingFill;
    return Object.assign({}, config.ratingIconStyle, fillStyle);
  };

  return (
    <>
      {Object.keys(RATING_VALUE).map(ratingValueKey => (
        <TouchableWithoutFeedback key={ratingValueKey} onPress={() => onRatingChange(RATING_VALUE[ratingValueKey])}>
          <Image style={fetchStarRatingStyle(RATING_VALUE[ratingValueKey])} source={{uri: config.ratingIcon}} />
        </TouchableWithoutFeedback>
      ))}
    </>
  );
};

export default StarInput;
