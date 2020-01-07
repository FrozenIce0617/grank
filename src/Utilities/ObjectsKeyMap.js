// @flow
import { uniqueId } from 'lodash';

class ObjectsKeyMap {
  keyMap: WeakMap<any, string> = new WeakMap();

  getKey = (object: any) => {
    let result = this.keyMap.get(object);
    if (!result) {
      result = uniqueId('keymap');
      this.keyMap.set(object, result);
    }
    return result;
  };
}

export default ObjectsKeyMap;
