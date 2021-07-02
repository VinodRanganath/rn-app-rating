import AsyncStorage from '@react-native-async-storage/async-storage';

const StorageHelper = () => {
  const {getItem, setItem, removeItem} = AsyncStorage;

  const saveInStorage = (key, value) =>
    new Promise(async (resolve, reject) => {
      try {
        await setItem(key, JSON.stringify(value));
        resolve();
      } catch (err) {
        reject(err);
      }
    });

  const getFromStorage = key =>
    new Promise(async (resolve, reject) => {
      try {
        const value = await getItem(key);
        resolve(value ? JSON.parse(value) : null);
      } catch (err) {
        reject(err);
      }
    });

  const removeFromStorage = key =>
    new Promise(async (resolve, reject) => {
      try {
        await removeItem(key);
        resolve();
      } catch (err) {
        reject(err);
      }
    });

  return {
    saveInStorage,
    getFromStorage,
    removeFromStorage,
  };
};

export default StorageHelper;
