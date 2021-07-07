import {StyleSheet} from 'react-native';

const Styles = StyleSheet.create({
  modalContentWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  modalContentContainer: {
    width: '90%',
    minHeight: '70%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    elevation: 2,
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 1,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentSection: {
    flex: 5,
    width: '100%',
  },
  iconContainer: {
    flex: 2,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  appRatingPromptIcon: {
    width: 150,
    height: 150,
  },
  descriptionContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  descriptionTitle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    marginRight: 16,
  },
  descriptionTitleText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20,
  },
  descriptionSubtitle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    marginRight: 16,
  },
  descriptionSubtitleText: {
    textAlign: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  starRating: {
    width: 50,
    height: 50,
    marginLeft: 5,
    marginRight: 5,
  },
  starRatingFill: {
    backgroundColor: '#F9C74F',
  },
  feedbackInput: {
    width: '90%',
    borderWidth: 0.5,
    borderColor: '#444',
    borderRadius: 10,
    color: '#444',
  },
  actionSection: {
    flex: 1,
    width: '100%',
  },
  actionBar: {
    flex: 1,
    flexDirection: 'row',
    height: 30,
    alignItems: 'center',
  },
  actionGroup: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    marginRight: 16,
  },
  positiveAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  positiveActionText: {
    color: '#4D908E',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  neutralAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  neutralActionText: {
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  negativeAction: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  negativeActionText: {
    color: '#FF595E',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
});

export default Styles;
