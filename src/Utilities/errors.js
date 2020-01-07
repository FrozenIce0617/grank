// @flow
import { SubmissionError } from 'redux-form';
import { camelCase } from 'lodash';

type ErrorsFromServer = { field: string, messages: string[] }[];

export const ErrorKind = {
  NETWORK_ERROR: '__network_error__',
  ALL_ERRORS: '__all__',
  DOMAIN_PLAN_ERROR: '__domain_plan__',
  ORG_PLAN_ERROR: '__org_plan__',
};

const parseErrors = (errors: ErrorsFromServer) =>
  errors.reduce((errorMap, error) => {
    if (error) {
      errorMap[error.field] = error.messages.join(', ');
      errorMap[camelCase(error.field)] = error.messages.join(', ');
    }
    return errorMap;
  }, {});

const nonFieldErrorKinds = new Set(Object.values(ErrorKind));
export const isFieldError = (errorType: string) => !nonFieldErrorKinds.has(errorType);

export type FormSubmitErrors = {
  [type: string]: string,
};

export const throwSubmitErrors = (errorsFromServer: ErrorsFromServer) => {
  const errorsMap = parseErrors(errorsFromServer);
  throw new SubmissionError(errorsMap);
};

export const throwNetworkError = (error: { message: string }) => {
  throw new SubmissionError({ [ErrorKind.NETWORK_ERROR]: error.message });
};
