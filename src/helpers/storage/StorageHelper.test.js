import StorageHelper from './StorageHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {saveInStorage, getFromStorage, removeFromStorage} = StorageHelper();

describe('Storage helper tests', () => {
  afterEach(() => jest.clearAllMocks());

  describe('saveInStorage', () => {
    it('should resolve if save was successful', async () => {
      jest.spyOn(AsyncStorage, 'setItem').mockResolvedValue();

      await saveInStorage('key', {test: 1});

      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.setItem).toHaveBeenNthCalledWith(1, 'key', JSON.stringify({test: 1}));
    });

    it('should reject with error message if save fails', async () => {
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValue(new Error('error message'));

      try {
        await saveInStorage('key');
        expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
        expect(AsyncStorage.setItem).toHaveBeenNthCalledWith(1, 'key', undefined);
      } catch (err) {
        expect(err.message).toStrictEqual('error message');
      }
    });
  });

  describe('getFromStorage', () => {
    it('should resolve with value if get was successful', async () => {
      jest.spyOn(AsyncStorage, 'getItem').mockResolvedValue('{"test": 1}');

      const value = await getFromStorage('key');

      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.getItem).toHaveBeenNthCalledWith(1, 'key');
      expect(value).toStrictEqual({test: 1});
    });

    it('should resolve with null if get was successful but no value is found', async () => {
      jest.spyOn(AsyncStorage, 'getItem').mockResolvedValue();

      const value = await getFromStorage('key');

      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.getItem).toHaveBeenNthCalledWith(1, 'key');
      expect(value).toStrictEqual(null);
    });

    it('should reject with error message if get fails', async () => {
      jest.spyOn(AsyncStorage, 'getItem').mockRejectedValue(new Error('error message'));

      try {
        await getFromStorage('key');

        expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
        expect(AsyncStorage.getItem).toHaveBeenNthCalledWith(1, 'key');
      } catch (err) {
        expect(err.message).toStrictEqual('error message');
      }
    });
  });

  describe('removeFromStorage', () => {
    it('should resolve if remove was successful', async () => {
      jest.spyOn(AsyncStorage, 'removeItem').mockResolvedValue();

      await removeFromStorage('key');

      expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.removeItem).toHaveBeenNthCalledWith(1, 'key');
    });

    it('should reject with error message if remove fails', async () => {
      jest.spyOn(AsyncStorage, 'removeItem').mockRejectedValue(new Error('error message'));

      try {
        await removeFromStorage('key');

        expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(1);
        expect(AsyncStorage.removeItem).toHaveBeenNthCalledWith(1, 'key', undefined);
      } catch (err) {
        expect(err.message).toStrictEqual('error message');
      }
    });
  });
});
