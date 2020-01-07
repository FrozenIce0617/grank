const prefix = 'AccuRanker_';

const formattedKey = key => `${prefix}${key}`;
const parseError = errorMessage => ({ error: errorMessage });
const _serialize = obj => JSON.stringify(obj);
const _deserialize = obj => {
  let val = '';
  try {
    val = JSON.parse(JSON.stringify(obj));
    if (val === 'false' || val === 'true') val = JSON.parse(val);
  } catch (e) {
    val = obj;
  }
  return val;
};
const updateObjectDeep = (obj, path, value) => {
  const stack = path.split(':');
  let objScope = obj;
  while (stack.length > 1) {
    objScope = objScope[stack.shift()];
  }
  const lastItem = stack.shift();
  try {
    objScope[lastItem] = value;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(parseError(`Could not set ${lastItem} on ${_serialize(obj)}`));
  }
  return obj;
};
const setItem = (storage, key, value) => {
  try {
    storage.setItem(formattedKey(key), _serialize(value));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(
      parseError(`Could not save the {${key}: ${value}}' pair, because the localStorage is full.`),
    );
  }
};
const getItem = (storage, key) => _deserialize(storage.getItem(formattedKey(key)));
const removeItem = (storage, key) => storage.removeItem(formattedKey(key));

export default {
  save: (key, value) => setItem(localStorage, key, value),
  get: key => getItem(localStorage, key),
  patch: (key, path, value) =>
    setItem(localStorage, key, updateObjectDeep(getItem(localStorage, key), path, value)),
  remove: key => removeItem(localStorage, key),

  sessionSave: (key, value) => setItem(sessionStorage, key, value),
  sessionGet: key => getItem(sessionStorage, key),
  sessionPatch: (key, path, value) =>
    setItem(sessionStorage, key, updateObjectDeep(getItem(sessionStorage, key), path, value)),
  sessionRemove: key => removeItem(sessionStorage, key),

  getFromAll: key => {
    const value = getItem(sessionStorage, key);
    if (value) {
      return value;
    }
    return getItem(localStorage, key);
  },
};
