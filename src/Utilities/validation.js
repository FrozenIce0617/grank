// @flow
import gql from 'graphql-tag';
import { apolloClient, store } from '../Store';
import { setVatStatus } from '../Actions/OrderPlanAction';
import { SubmissionError } from 'redux-form';
import { transform, isPlainObject } from 'lodash';
import { t } from './i18n';
import { isValidNumber } from 'libphonenumber-js';

const initialDataQuery = gql`
  mutation generic_checkVat($vatPrefix: String!, $vatNumber: String!) {
    checkVat(prefix: $vatPrefix, number: $vatNumber) {
      success
    }
  }
`;

type Errors = Array<{ field: string, messages: Array<string> }>;

type RestErrors = { [field: string]: Array<string> };

export default {
  required: (value: string): ?string => (value ? undefined : t('This field is required')),
  array: (value: Array<any>): ?string =>
    value && value.length ? undefined : t('This field is required'),
  nonEmptyArrayOrObj: (value: Array<any> | Object): ?string =>
    (Array.isArray(value) && value.length) || isPlainObject(value)
      ? undefined
      : t('This field is required'),
  string: (value: string): ?string =>
    value && /\S/.test(value) ? undefined : t('This field is required'),
  numeric: (value: string): ?string =>
    (typeof value === 'number' || value) && (!isNaN(value) && isFinite(value))
      ? undefined
      : t('This field is required'),
  phone: (value: string): ?string =>
    isValidNumber(value) ? undefined : t('Phone number is invalid'),
  email: (value: string) => {
    const regex = /^((([a-z]|\d|[!#$%&'*+\-/=?^_`{|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#$%&'*+-/=?^_`{|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
    return !value || regex.test(value) ? undefined : t('This is not a valid email');
  },
  password: (value: string): ?string =>
    value && value.length >= 6 ? undefined : t('Password needs to be at least 6 characters long'),
  passwordConfirmation: (value: string, fields: Object) =>
    fields.password && (fields.password && fields.password.length >= 6) && value === fields.password
      ? undefined
      : t('Your passwords do not match'),
  //Async validation gets (values, dispatch, props, blurredField)
  throwSubmissionError: (errors: Object) => {
    throw new SubmissionError(errors);
  },
  setRestResponseErrors: (setErrors: ({}) => any, errors: RestErrors = {}) =>
    setErrors(
      transform(
        errors,
        (acc, messages, field) => {
          acc[field] = messages.join(', ');
          return acc;
        },
        {},
      ),
    ),
  setResponseErrors: (setErrors: ({}) => any, errors: Errors = []) =>
    setErrors(
      errors.reduce(
        (errorObj, error) => ({ ...errorObj, [error.field]: error.messages.join(', ') }),
        {},
      ),
    ),
  validVatNumber: (values: Object, dispatch: Function, props: Object): Promise<void | Object> => {
    const {
      vatPrefix: { vatCode },
      vatNumber,
    } = values;

    if (!vatNumber || !vatCode) {
      props.clearAsyncError('vatPrefix');
      props.clearAsyncError('vatNumber');
      store.dispatch(setVatStatus(false));
      return Promise.resolve();
    }

    return apolloClient
      .mutate({
        mutation: initialDataQuery,
        variables: {
          vatPrefix: vatCode,
          vatNumber,
        },
      })
      .then(({ data: { checkVat: { success } } }) => {
        props.touch('vatPrefix');
        props.touch('vatNumber');
        store.dispatch(setVatStatus(success));
        if (!success)
          return Promise.reject({ vatNumber: t('Invalid VAT'), vatPrefix: t('Invalid VAT') });
        props.clearAsyncError('vatPrefix');
        props.clearAsyncError('vatNumber');
      });
  },
};
