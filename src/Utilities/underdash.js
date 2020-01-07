import config from 'config';
import { isError, attempt, last, isArray } from 'lodash';

export const typeStr = val =>
  Object.prototype.toString
    .call(val)
    .slice(8, -1)
    .toLowerCase();

export const stringToPascalCase = val =>
  val
    .replace(/^([a-z])/, (all, letter) => letter.toUpperCase())
    .replace(/-([a-z])/g, (all, letter) => letter.toUpperCase());

export const graphqlError = (props, exceptions = []) => {
  let error = false;

  for (const prop in props) {
    if (props.hasOwnProperty(prop) && typeStr(props[prop]) === 'object') {
      if (!~exceptions.indexOf(prop) && props[prop].hasOwnProperty('error') && props[prop].error) {
        error = true;
      }
    }
  }
  return error;
};

export const graphqlLoading = (props, exceptions = []) => {
  let loading = false;
  for (const prop in props) {
    if (props.hasOwnProperty(prop) && typeStr(props[prop]) === 'object') {
      if (
        !~exceptions.indexOf(prop) &&
        props[prop].hasOwnProperty('loading') &&
        props[prop].loading
      ) {
        loading = true;
      }
    }
  }
  return loading;
};

export const graphqlOK = (props, loadingExceptions = [], errorExceptions = []) =>
  !graphqlLoading(props, loadingExceptions) && !graphqlError(props, errorExceptions);

export const redirectToExternalUrl = (url = '/') => {
  if (url) window.location = `${config.baseUrl}${url}`;
};

export const capitalizeFirstChar = string => string.charAt(0).toUpperCase() + string.slice(1);

//Encoding / Decoding stuff
export const utf8ToBinaryString = str => encodeURIComponent(str);

export const utf8ToBase64 = str => btoa(utf8ToBinaryString(str));

export const binaryStringToUtf8 = binstr => decodeURIComponent(binstr);

export const base64ToUtf8 = b64 => binaryStringToUtf8(atob(b64));

export const bufferToBinaryString = buf =>
  Array.prototype.map.call(buf, ch => String.fromCharCode(ch)).join('');

export const bufferToBase64 = arr => btoa(bufferToBinaryString(arr));

export const bufferToUtf8 = buf => binaryStringToUtf8(bufferToBinaryString(buf));

export const binaryStringToBuffer = binstr => {
  let buf;

  if ('undefined' !== typeof Uint8Array) {
    buf = new Uint8Array(binstr.length);
  } else {
    buf = [];
  }

  Array.prototype.forEach.call(binstr, (ch, i) => {
    buf[i] = ch.charCodeAt(0);
  });

  return buf;
};

export const utf8ToBuffer = str => binaryStringToBuffer(utf8ToBinaryString(str));

export const base64ToBuffer = base64 => binaryStringToBuffer(atob(base64));

export const encodeBase64 = toEncode => bufferToBase64(utf8ToBuffer(toEncode));

export const decodeBase64 = toDecode => bufferToUtf8(base64ToBuffer(toDecode));

export const isValidJSON = toCheck => {
  if (typeStr(toCheck) === 'string') return !isError(attempt(JSON.parse, toCheck));
  return !isError(attempt(JSON.stringify, toCheck));
};

export const base64IsValidJSON = str => {
  try {
    const decoded = decodeBase64(str);
    return isValidJSON(decoded);
  } catch (err) {
    return false;
  }
};

export const downloadFile = (url, name) => {
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.href = url;
  a.download = name || last(url.split('/'));
  a.target = '_self';
  a.click();
};

// TODO we should not have this strange method
// as BE should return what JSON.stringify creates but it doesn't now
export const singleQuotesStringsToArray = str => {
  if (!str || !isValidJSON(str)) {
    return [];
  }

  const doubleQuoted = JSON.parse(str).replace(/'/g, '"');
  if (!isValidJSON(doubleQuoted)) {
    return [];
  }

  return JSON.parse(doubleQuoted);
};

export const toArray = value => (isArray(value) ? value : [value]);

export const isMac = () => ~navigator.platform.toLowerCase().indexOf('mac');

export const removeInitialLoader = () => {
  const loaderEl = document.getElementById('start-loader');
  if (loaderEl) {
    loaderEl.innerHTML = '';
  }
};

// add this method as copy-to-clipboard cannot copy multiline properly
// see https://github.com/sudodoki/copy-to-clipboard/issues/56
export const copyToClipboard = text => {
  if (window.clipboardData && window.clipboardData.setData) {
    // IE specific code path to prevent textarea being shown while dialog is visible.
    return window.clipboardData.setData('Text', text);
  } else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
    const textarea = document.createElement('textarea');
    textarea.textContent = text;
    textarea.style.position = 'fixed'; // Prevent scrolling to bottom of page in MS Edge.
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand('copy'); // Security exception may be thrown by some browsers.
    } catch (ex) {
      console.warn('Copy to clipboard failed.', ex);
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
};

export default {
  typeStr,
  stringToPascalCase,
  graphqlError,
  graphqlLoading,
  redirectToExternalUrl,
  capitalizeFirstChar,
  utf8ToBinaryString,
  utf8ToBase64,
  binaryStringToUtf8,
  base64ToUtf8,
  bufferToBinaryString,
  bufferToBase64,
  bufferToUtf8,
  binaryStringToBuffer,
  utf8ToBuffer,
  base64ToBuffer,
  encodeBase64,
  decodeBase64,
  isValidJSON,
  base64IsValidJSON,
};
