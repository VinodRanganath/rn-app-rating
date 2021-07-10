import StorageHelper from '../../helpers/storage/StorageHelper';
import {INITIAL_RN_APP_RATING_STORAGE_VALUE, RN_APP_RATING_STORAGE_KEY} from '../../constants';
import {useContext} from 'react';
import {RNAppRatingContext} from '../../provider';
import moment from 'moment';
import Logger from '../../helpers/logger/Logger';

const useRuleManager = () => {
  const {getFromStorage, saveInStorage} = StorageHelper();
  const {
    config: {rules},
  } = useContext(RNAppRatingContext);

  const getRNAppRatingStorageValue = () => getFromStorage(RN_APP_RATING_STORAGE_KEY);

  const setRNAppRatingStorageValue = value => saveInStorage(RN_APP_RATING_STORAGE_KEY, value);

  const daysElapsed = sinceTimestamp => {
    if (moment(sinceTimestamp).isAfter(moment())) return -1;
    return moment.duration(moment().diff(moment(sinceTimestamp))).days();
  };

  const initRNAppRatingStorage = async () => {
    Logger.log('initRNAppRating: start');
    let storageValue = await getRNAppRatingStorageValue();

    // initialise values
    if (!storageValue) {
      Logger.log('initRNAppRating: no storage values found, initialising...');
      await setRNAppRatingStorageValue(INITIAL_RN_APP_RATING_STORAGE_VALUE);
      return await getRNAppRatingStorageValue();
    }

    // update values only if debug is disabled
    const {launchTimes, rateLater, launchTimesPostRateLater, rateLaterOn} = storageValue;
    const {minimumAppLaunchesSinceRateLater, minimumDaysSinceRateLater, debug} = rules;
    storageValue = {...storageValue, launchTimes: launchTimes + 1};
    if (rateLater) {
      Logger.log('initRNAppRating: rateLater=true');
      const currentLaunchTimesPostRateLater = launchTimesPostRateLater + 1;
      if (
        currentLaunchTimesPostRateLater >= minimumAppLaunchesSinceRateLater &&
        daysElapsed(rateLaterOn) >= minimumDaysSinceRateLater
      ) {
        Logger.log('initRNAppRating: rate later rules satisfied');
        storageValue = {
          ...storageValue,
          rateLater: false,
          launchTimesPostRateLater: 0,
          rateLaterOn: null,
        };
      } else {
        Logger.log('initRNAppRating: rate later rules not satisfied');
        storageValue = {
          ...storageValue,
          launchTimesPostRateLater: currentLaunchTimesPostRateLater,
        };
      }
    }
    if (!debug) await setRNAppRatingStorageValue(storageValue);

    Logger.log('initRNAppRating: done');
    return storageValue;
  };

  const rulesSatisfied = async () => {
    const {debug} = rules;
    // Return true if debug is enabled
    Logger.log('showRNAppRating: check rules');
    if (debug) return true;

    const storageValue = await getRNAppRatingStorageValue();
    // Return false if not value is found in storage or rateNever=true or ratingGiven=true
    if (!storageValue || storageValue?.rateNever || storageValue?.ratingGiven) return false;

    const {launchTimes, installedOn, rateLater, launchTimesPostRateLater, rateLaterOn} = storageValue;
    const {minimumAppLaunches, minimumAppInstalledDays, minimumAppLaunchesSinceRateLater, minimumDaysSinceRateLater} =
      rules;
    if (
      rateLater &&
      (launchTimesPostRateLater < minimumAppLaunchesSinceRateLater ||
        daysElapsed(rateLaterOn) < minimumDaysSinceRateLater)
    ) {
      return false;
    }
    if (launchTimes < minimumAppLaunches || daysElapsed(installedOn) < minimumAppInstalledDays) {
      return false;
    }

    return true;
  };

  const updateStorage = async param => {
    // Do not update if debug is enabled
    if (rules?.debug) return;

    let storageValue = await getRNAppRatingStorageValue();
    const additionalParams = param?.rateLater
      ? {rateLaterOn: moment.utc().valueOf(), rateLaterClicks: storageValue.rateLaterClicks + 1}
      : {};
    storageValue = {...storageValue, ...param, ...additionalParams};
    await setRNAppRatingStorageValue(storageValue);
  };

  const setRateLater = () => updateStorage({rateLater: true});

  const setRateNever = () => updateStorage({rateNever: true});

  const setRatingGiven = () => updateStorage({ratingGiven: true});

  const canShowRateNever = async () => {
    // Do not update if debug is enabled
    if (rules?.debug) return true;

    const storageValue = await getRNAppRatingStorageValue();
    return storageValue.rateLaterClicks >= rules.minimumRateLaterClicksToShowRateNever;
  };

  return {initRNAppRatingStorage, rulesSatisfied, setRateLater, setRateNever, setRatingGiven, canShowRateNever};
};

export default useRuleManager;
