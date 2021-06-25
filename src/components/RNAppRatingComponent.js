import React, {useContext, useEffect} from 'react';
import {Modal, View} from 'react-native';
import {RNAppRatingContext} from '../provider/RNAppRatingContext';
import styles from './styles';
import AppRating from './appRating/AppRating';
import {ACTION_EVENT} from '../constants';

const RNAppRatingComponent = () => {
  const {showRNAppRating, fireActionEvent} = useContext(RNAppRatingContext);

  useEffect(() => {
    console.log('RNAppRatingPrompt component');
  }, [showRNAppRating]);

  return (
    <Modal
      animationType="slide"
      hardwareAccelerated={true}
      transparent={true}
      visible={showRNAppRating}
      onRequestClose={() => fireActionEvent(ACTION_EVENT.CANCEL, {journeyCancelled: true})}>
      <View style={styles.modalContentWrapper}>
        <View style={styles.modalContentContainer}>
          <AppRating />
        </View>
      </View>
    </Modal>
  );
};

export default RNAppRatingComponent;
