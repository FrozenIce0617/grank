import React, { Fragment } from 'react';

import { t } from 'Utilities/i18n/index';
import ProvidersList from './ProvidersList';

function ImportParty() {
  return (
    <Fragment>
      <h6>{t('Import from third party')}</h6>
      <p>
        {t(
          'Before you found AccuRanker you might have had an account with another rank tracker. To ease your transition to AccuRanker, we have created several importers.',
        )}'
      </p>
      <p>
        {t(
          'Depending on the integration with the third party, our importer can either import all your data or for a single domain.',
        )}
      </p>
      <p>
        {t(
          "Please contact us if you wish to import data. If we're missing a third party in the list it doesn't mean we can't import data from there. Contact us for more info.",
        )}
      </p>
      <ProvidersList />
    </Fragment>
  );
}

export default ImportParty;
