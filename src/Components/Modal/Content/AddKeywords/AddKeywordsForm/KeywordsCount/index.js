// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { t } from 'Utilities/i18n';
import type { SearchEngine } from '../types';

type Props = {
  count: number,
};

class KeywordsCount extends React.Component<Props> {
  render() {
    return (
      <div className="keywords-count">
        {t('Keywords to be added: ')}
        <strong>{this.props.count}</strong>
      </div>
    );
  }
}

const selector = formValueSelector('AddKeywordsForm');
export const mapStateToProps = state => {
  try {
    /* The form is not always loaded when calling this function
    *  It is okay to return 0, as you can not really have any
    *  keywords when the form hasn't loaded
    */
    const keywordsCount = selector(state, 'keywords')
      .map(el => el.trim())
      .filter(el => el.length !== 0).length;

    const locationsCount = Math.max(selector(state, 'locations').filter(x => !!x).length, 1);
    const searchEngines: SearchEngine[] = selector(state, 'searchEngines');
    const searchCount = searchEngines.reduce(
      (acc, searchEngine) => acc + searchEngine.searchTypes.length,
      0,
    );
    return { count: keywordsCount * locationsCount * searchCount };
  } catch (e) {
    return { count: 0 };
  }
};

export default connect(mapStateToProps)(KeywordsCount);
