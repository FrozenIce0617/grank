// @flow
import React, { Component } from 'react';
import { t } from 'Utilities/i18n';
import Button from 'Components/Forms/Button';
import FormatNumber from 'Components/FormatNumber';

import './keywords-number-cell.scss';

type Props = {
  domainData: Object,
  onAddKeyword: Function,
};

class KeywordsNumberCell extends Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    return nextProps.domainData !== this.props.domainData;
  }

  renderNoKeywords() {
    const {
      domainData: { id },
      onAddKeyword,
    } = this.props;
    return (
      <div className="keywords-number-cell">
        <Button additionalClassName="" theme="orange" onClick={() => onAddKeyword(id)}>
          {t('Add keywords')}
        </Button>
      </div>
    );
  }

  render() {
    const {
      domainData: { totalKeywords },
    } = this.props;
    return totalKeywords > 0 ? (
      <FormatNumber className="keywords-number-cell-number">{totalKeywords}</FormatNumber>
    ) : (
      this.renderNoKeywords()
    );
  }
}

export default KeywordsNumberCell;
