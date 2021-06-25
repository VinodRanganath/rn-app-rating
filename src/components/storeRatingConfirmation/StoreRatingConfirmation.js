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
          <Image style={config.iconStyle} source={{uri: config.icon}} />
        </View>
        <View style={styles.descriptionContainer}>
          <View style={styles.descriptionTitle}>
            <Text style={config.titleStyle}>{config.title}</Text>
          </View>
          <View style={styles.descriptionSubtitle}>
            <Text style={config.subtitleStyle}>{config.subtitle}</Text>
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
