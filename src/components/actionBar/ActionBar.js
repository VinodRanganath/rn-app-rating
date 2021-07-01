import React, {useContext} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import styles from '../styles';
import {RNAppRatingContext} from '../../provider/RNAppRatingContext';
import {FEEDBACK, RATING, STORE_RATING_CONFIRMATION} from '../../constants';

const ActionBar = props => {
  const {
    config = {},
    showRateNever,
    onPositiveActionPress = () => {},
    onNeutralActionPress = () => {},
    onNegativeActionPress = () => {},
  } = props;
  const {stage} = useContext(RNAppRatingContext);

  return (
    <View testID="action-bar" style={styles.actionSection}>
      <View style={styles.actionBar}>
        <View style={styles.actionGroup}>
          <View style={styles.neutralAction}>
            {(stage === RATING || stage === STORE_RATING_CONFIRMATION) && (
              <TouchableOpacity testID="action-bar-neutral-button" onPress={() => onNeutralActionPress()}>
                <Text testID="action-bar-neutral-button-text" style={config.neutralButtonTextStyle || {}}>
                  {config.neutralButtonText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.actionGroup}>
          <View style={styles.negativeAction}>
            {(stage === FEEDBACK || showRateNever) && (
              <TouchableOpacity testID="action-bar-negative-button" onPress={() => onNegativeActionPress()}>
                <Text testID="action-bar-negative-button-text" style={config.negativeButtonTextStyle || {}}>
                  {config.negativeButtonText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.positiveAction}>
            <TouchableOpacity testID="action-bar-positive-button" onPress={() => onPositiveActionPress()}>
              <Text testID="action-bar-positive-button-text" style={config.positiveButtonTextStyle || {}}>
                {config.positiveButtonText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ActionBar;
