// @flow
import * as React from 'react';

const withProps = (newProps: Object) => <ComponentProps: {}>(
  Component: React.ComponentType<ComponentProps>,
) => (props: ComponentProps) => <Component {...props} {...newProps} />;

export default withProps;
