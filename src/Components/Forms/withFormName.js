// @flow
import * as React from 'react';

// Ideally this should be provided by redux-form library
// https://github.com/erikras/redux-form/issues/3246
function withFormName<InputProps: {}>(
  Component: React.ComponentType<InputProps & { formName: string }>,
): React.ComponentType<InputProps> {
  const WithFormName = function(props: InputProps, context: any) {
    return <Component {...props} formName={context._reduxForm.form} />;
  };
  WithFormName.contextTypes = {
    _reduxForm: () => null,
  };
  return WithFormName;
}

export default withFormName;
