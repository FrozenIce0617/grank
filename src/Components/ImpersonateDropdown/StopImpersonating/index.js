// @flow
import React, { Component } from 'react';
import Button from 'Components/Forms/Button';
import { t } from 'Utilities/i18n';
import { redirectToExternalUrl } from 'Utilities/underdash';
import { connect } from 'react-redux';
import { clearEverything } from 'Actions/ResetAction';

type Props = {
  clearEverything: Function,
};

class StopImpersonating extends Component<Props> {
  handleButtonClick = () => {
    this.props.clearEverything();
    redirectToExternalUrl('/accuranker_admin/impersonate/stop/');
  };

  render() {
    return (
      <Button onClick={this.handleButtonClick} theme="red">
        {t('Stop impersonating')}
      </Button>
    );
  }
}

export default connect(
  null,
  { clearEverything },
)(StopImpersonating);
