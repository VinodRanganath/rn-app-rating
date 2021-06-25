import React, {useEffect, useState} from 'react';
import {Image, Keyboard, Text, TextInput, View} from 'react-native';
import styles from '../styles';
import ActionBar from '../actionBar/ActionBar';

const Feedback = props => {
  const {config, feedback, onFeedbackChange, onPositiveActionPress, onNegativeActionPress} = props;
  const [hideIcon, setHideIcon] = useState(false);

  useEffect(() => {
    const keyboardDidShowEvent = Keyboard.addListener('keyboardDidShow', () => setHideIcon(true));
    const keyboardDidHideEvent = Keyboard.addListener('keyboardDidHide', () => setHideIcon(false));
    return () => {
      keyboardDidShowEvent.remove();
      keyboardDidHideEvent.remove();
    };
  }, []);

  const fetchIconStyle = () => {
    let hideIconStyle = {};
    if (hideIcon) hideIconStyle = {width: 100, height: 100};
    return Object.assign({}, config.iconStyle, hideIconStyle);
  };

  return (
    <View style={styles.modalContent}>
      <View style={styles.contentSection}>
        <View style={styles.iconContainer}>
          <Image style={fetchIconStyle()} source={{uri: config.icon}} />
        </View>
        <View style={styles.descriptionContainer}>
          <View style={styles.descriptionTitle}>
            <Text style={config.titleStyle}>{config.title}</Text>
          </View>
          {config.subtitle && (
            <View style={styles.descriptionSubtitle}>
              <Text style={config.subtitleStyle}>{config.subtitle}</Text>
            </View>
          )}
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={config.feedbackInputStyle}
            multiline
            numberOfLines={config.feedbackInputLines}
            maxLength={config.feedbackInputMaxLength}
            value={feedback}
            onChangeText={text => onFeedbackChange(text)}
            placeholder={config.feedbackInputPlaceholderText}
          />
        </View>
      </View>
      <ActionBar
        config={config}
        onPositiveActionPress={onPositiveActionPress}
        onNegativeActionPress={onNegativeActionPress}
      />
    </View>
  );
};

export default Feedback;
