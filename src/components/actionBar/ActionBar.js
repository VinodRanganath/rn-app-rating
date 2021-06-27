import React, {useContext} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import styles from '../styles';
import {RNAppRatingContext} from '../../provider/RNAppRatingContext';
import {FEEDBACK, RATING, STORE_RATING_CONFIRMATION} from '../../constants';

const ActionBar = props => {
  const {
    config,
    showRateNever,
    onPositiveActionPress,
    onNeutralActionPress = () => {},
    onNegativeActionPress = () => {},
  } = props;
  const {stage} = useContext(RNAppRatingContext);

  return (
    <View style={styles.actionSection}>
      <View style={styles.actionBar}>
        <View style={styles.actionGroup}>
          <View style={styles.neutralAction}>
            {(stage === RATING || stage === STORE_RATING_CONFIRMATION) && (
              <TouchableOpacity onPress={() => onNeutralActionPress()}>
                <Text style={config.neutralButtonTextStyle}>{config.neutralButtonText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.actionGroup}>
          <View style={styles.negativeAction}>
            {(stage === FEEDBACK || showRateNever) && (
              <TouchableOpacity onPress={() => onNegativeActionPress()}>
                <Text style={config.negativeButtonTextStyle}>{config.negativeButtonText}</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.positiveAction}>
            <TouchableOpacity onPress={() => onPositiveActionPress()}>
              <Text style={config.positiveButtonTextStyle}>{config.positiveButtonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ActionBar;
