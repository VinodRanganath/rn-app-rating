import React from 'react';
import {Image, Text, View} from 'react-native';
import styles from '../styles';
import ActionBar from '../actionBar/ActionBar';
import RatingInput from '../ratingInput/RatingInput';

const Rating = props => {
  const {
    config,
    rating,
    showRateNever,
    onRatingChange,
    onPositiveActionPress,
    onNeutralActionPress,
    onNegativeActionPress,
  } = props;

  return (
    <View style={styles.modalContent}>
      <View style={styles.contentSection}>
        <View style={styles.iconContainer}>
          <Image testID="rating-stage-icon" style={config.iconStyle} source={{uri: config.iconInBase64}} />
        </View>
        <View style={styles.descriptionContainer}>
          <View style={styles.descriptionTitle}>
            <Text testID="rating-stage-title" style={config.titleStyle}>
              {config.title}
            </Text>
          </View>
          <View style={styles.descriptionSubtitle}>
            <Text testID="rating-stage-subtitle" style={config.subtitleStyle}>
              {config.subtitle}
            </Text>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <RatingInput config={config} rating={rating} onRatingChange={onRatingChange} />
        </View>
      </View>
      <ActionBar
        config={config}
        showRateNever={showRateNever}
        onPositiveActionPress={onPositiveActionPress}
        onNeutralActionPress={onNeutralActionPress}
        onNegativeActionPress={onNegativeActionPress}
      />
    </View>
  );
};

export default Rating;
