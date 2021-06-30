import React from 'react';
import {RNAppRatingContext} from '../provider/RNAppRatingContext';
import RNAppRatingComponent from './RNAppRatingComponent';
import {fireEvent, render} from '@testing-library/react-native';
import {ACTION_EVENT} from '../constants';

const MockFireActionEvent = jest.fn();
const DummyComponent = () => <></>;
const RNAppRatingComponentWrapper = props => {
  const {show = false, fireActionEvent} = props;

  return (
    <RNAppRatingContext.Provider value={{showRNAppRating: show, fireActionEvent: fireActionEvent}}>
      <RNAppRatingComponent />
    </RNAppRatingContext.Provider>
  );
};

jest.mock('./appRating/AppRating', () => DummyComponent);

describe('RNAppRating component tests', () => {
  afterEach(() => jest.clearAllMocks());

  it('should load modal with required config', () => {
    const {getByTestId} = render(<RNAppRatingComponentWrapper />);

    const appRatingModal = getByTestId('rn-app-rating-modal');
    expect(appRatingModal.props.animationType).toBe('slide');
    expect(appRatingModal.props.hardwareAccelerated).toBeTruthy();
    expect(appRatingModal.props.transparent).toBeTruthy();
  });

  it('should set visibility=false if show=false from context', () => {
    const {getByTestId} = render(<RNAppRatingComponentWrapper />);

    const appRatingModal = getByTestId('rn-app-rating-modal');
    expect(appRatingModal.props.visible).toBeFalsy();
  });

  it('should set visibility=true if show=true from context', () => {
    const {getByTestId} = render(<RNAppRatingComponentWrapper show />);

    const appRatingModal = getByTestId('rn-app-rating-modal');
    expect(appRatingModal.props.visible).toBeTruthy();
  });

  it('should set call onRequestClose callback if device back button is pressed', () => {
    const {getByTestId} = render(<RNAppRatingComponentWrapper show fireActionEvent={MockFireActionEvent} />);

    const appRatingModal = getByTestId('rn-app-rating-modal');
    fireEvent(appRatingModal, 'onRequestClose');

    expect(appRatingModal.props.visible).toBeTruthy();
    expect(MockFireActionEvent).toHaveBeenCalledTimes(1);
    expect(MockFireActionEvent).toHaveBeenNthCalledWith(1, ACTION_EVENT.CANCEL, {journeyCancelled: true});
  });
});
