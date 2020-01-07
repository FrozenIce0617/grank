import React, { Fragment } from 'react';
import { sortBy } from 'lodash';

import thirdPartyImport from './providersConfig';

function ProvidersList() {
  return (
    <Fragment>
      {sortBy(thirdPartyImport(), 'party').map(({ party, label }) => (
        <p key={party}>
          <strong>- {party}</strong>
          <br />
          {label}
        </p>
      ))}
    </Fragment>
  );
}

export default ProvidersList;
