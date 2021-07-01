import DEFAULT_CONFIG from './Config';
import {
  APP_RATING_PROMPT_ICON,
  FEEDBACK_ICON,
  POSITIVE_RATING_THRESHOLD,
  RATING_STAR_ICON,
  STORE_RATING_ICON,
} from '../constants';
import styles from '../components/styles';

const expectedConfig = {
  rating: {
    component: null,
    icon: APP_RATING_PROMPT_ICON,
    iconStyle: styles.appRatingPromptIcon,
    title: 'Rate Your Experience',
    titleStyle: styles.descriptionTitleText,
    subtitle: 'How would you rate your experience so far?',
    subtitleStyle: styles.descriptionSubtitleText,
    positiveRatingThreshold: POSITIVE_RATING_THRESHOLD,
    ratingIcon: RATING_STAR_ICON,
    ratingIconStyle: styles.starRating,
    ratingIconFillStyle: styles.starRatingFill,
    positiveButtonText: 'Submit',
    positiveButtonTextStyle: styles.positiveActionText,
    neutralButtonText: 'Rate Later',
    neutralButtonTextStyle: styles.neutralActionText,
    negativeButtonText: 'Never',
    negativeButtonTextStyle: styles.negativeActionText,
  },
  feedback: {
    component: null,
    icon: FEEDBACK_ICON,
    iconStyle: styles.appRatingPromptIcon,
    title: 'Would you mind giving us your valuable feedback?',
    titleStyle: styles.descriptionTitleText,
    subtitleStyle: styles.descriptionSubtitleText,
    feedbackInputStyle: styles.feedbackInput,
    feedbackInputPlaceholderText: 'Please provide your feedback here',
    feedbackInputLines: 10,
    feedbackInputMaxLength: 500,
    positiveButtonText: 'Submit',
    positiveButtonTextStyle: styles.positiveActionText,
    neutralButtonText: '',
    neutralButtonTextStyle: {},
    negativeButtonText: 'Cancel',
    negativeButtonTextStyle: styles.negativeActionText,
  },
  storeRatingConfirmation: {
    component: null,
    skipStage: false,
    icon: STORE_RATING_ICON,
    iconStyle: styles.appRatingPromptIcon,
    title: 'Rate us on the store',
    titleStyle: styles.descriptionTitleText,
    subtitle: 'Would you mind spending a moment to rate us on the store? Thank you.',
    subtitleStyle: styles.descriptionSubtitleText,
    positiveButtonText: 'Rate Now',
    positiveButtonTextStyle: styles.positiveActionText,
    neutralButtonText: 'Rate Later',
    neutralButtonTextStyle: styles.neutralActionText,
    negativeButtonText: 'Never',
    negativeButtonTextStyle: styles.negativeActionText,
  },
};

describe('Config tests', () => {
  it('should have default configurations', () => {
    const actualConfig = DEFAULT_CONFIG;

    expect(actualConfig).toStrictEqual(expectedConfig);
  });
});