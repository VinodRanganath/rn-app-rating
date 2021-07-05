import React from 'react';
import {View} from 'react-native';
import {fireEvent, render} from '@testing-library/react-native';
import Feedback from './Feedback';
import DEFAULT_CONFIG from '../../config/Config';

const DummyActionBar = props => <View testID="action-bar" {...props} />;

jest.mock('../actionBar/ActionBar', () => DummyActionBar);

describe('Feedback test', () => {
  afterEach(() => jest.clearAllMocks());

  it('should render feedback stage with given configurations', () => {
    const {feedback: feedbackConfig} = DEFAULT_CONFIG;

    const {getByTestId} = render(<Feedback config={{...feedbackConfig, subtitle: 'Feedback'}} />);

    const feedbackIcon = getByTestId('feedback-stage-icon');
    const feedbackTitle = getByTestId('feedback-stage-title');
    const feedbackSubtitle = getByTestId('feedback-stage-subtitle');
    const feedbackInput = getByTestId('feedback-input');
    const actionBar = getByTestId('action-bar');
    // icon
    expect(feedbackIcon.props.style).toStrictEqual(feedbackConfig.iconStyle);
    expect(feedbackIcon.props.source).toStrictEqual({uri: feedbackConfig.iconInBase64});
    // title
    expect(feedbackTitle.props.style).toStrictEqual(feedbackConfig.titleStyle);
    expect(feedbackTitle.props.children).toBe(feedbackConfig.title);
    // subtitle
    expect(feedbackSubtitle.props.style).toStrictEqual(feedbackConfig.subtitleStyle);
    expect(feedbackSubtitle.props.children).toBe('Feedback');
    // feedback input
    expect(feedbackInput.props.style).toStrictEqual(feedbackConfig.feedbackInputStyle);
    expect(feedbackInput.props.numberOfLines).toBe(feedbackConfig.feedbackInputLines);
    expect(feedbackInput.props.maxLength).toBe(feedbackConfig.feedbackInputMaxLength);
    expect(feedbackInput.props.placeholder).toBe(feedbackConfig.feedbackInputPlaceholderText);
    // action bar
    expect(actionBar).toBeDefined();
  });

  it('should render feedback stage with feedback and callbacks properly assigned and called', () => {
    const {feedback: feedbackConfig} = DEFAULT_CONFIG;
    const mockOnFeedbackChange = jest.fn();
    const mockOnPositiveActionPress = jest.fn();
    const mockOnNegativeActionPress = jest.fn();

    const {getByTestId} = render(
      <Feedback
        config={{...feedbackConfig, subtitle: 'Feedback'}}
        feedback="initial feedback value"
        onFeedbackChange={mockOnFeedbackChange}
        onPositiveActionPress={mockOnPositiveActionPress}
        onNegativeActionPress={mockOnNegativeActionPress}
      />,
    );

    const feedbackInput = getByTestId('feedback-input');
    const actionBar = getByTestId('action-bar');
    // feedback input
    expect(feedbackInput.props.value).toBe('initial feedback value');

    fireEvent.changeText(feedbackInput, 'new feedback text');
    expect(mockOnFeedbackChange).toHaveBeenCalledTimes(1);
    expect(mockOnFeedbackChange).toHaveBeenNthCalledWith(1, 'new feedback text');
    // action bar
    expect(actionBar.props.onPositiveActionPress).toBe(mockOnPositiveActionPress);
    expect(actionBar.props.onNegativeActionPress).toBe(mockOnNegativeActionPress);

    fireEvent(actionBar, 'onPositiveActionPress');
    fireEvent(actionBar, 'onNegativeActionPress');
    expect(mockOnPositiveActionPress).toHaveBeenCalledTimes(1);
    expect(mockOnNegativeActionPress).toHaveBeenCalledTimes(1);
  });
});
