import React from 'react';
import {Image, Text, View} from 'react-native';
import styles from '../styles';
import ActionBar from '../actionBar/ActionBar';

const StoreRatingConfirmation = props => {
  const {config, onPositiveActionPress, onNeutralActionPress, onNegativeActionPress} = props;

  return (
    <View style={styles.modalContent}>
      <View style={styles.contentSection}>
        <View style={styles.iconContainer}>
          <Image testID="store-rating-confirmation-stage-icon" style={config.iconStyle} source={{uri: config.icon}} />
        </View>
        <View style={styles.descriptionContainer}>
          <View style={styles.descriptionTitle}>
            <Text testID="store-rating-confirmation-stage-title" style={config.titleStyle}>
              {config.title}
            </Text>
          </View>
          <View style={styles.descriptionSubtitle}>
            <Text testID="store-rating-confirmation-stage-subtitle" style={config.subtitleStyle}>
              {config.subtitle}
            </Text>
          </View>
        </View>
      </View>
      <ActionBar
        config={config}
        onPositiveActionPress={onPositiveActionPress}
        onNeutralActionPress={onNeutralActionPress}
        onNegativeActionPress={onNegativeActionPress}
      />
    </View>
  );
};

export default StoreRatingConfirmation;
