// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { showModal } from 'Actions/ModalAction';
import TemplateNavTop from '../../Layout/TemplateNavTop/index';
import './select-package.scss';

type Props = {
  showModal: Function,
};

class SelectPackage extends Component<Props> {
  componentDidMount() {
    this.props.showModal({
      modalType: 'SelectPlan',
      modalProps: {
        backLink: history.length ? () => history.back() : null,
        backToPage: true,
      },
    });
  }

  render() {
    return (
      <div className="select-package-page">
        <TemplateNavTop />
      </div>
    );
  }
}

export default withRouter(
  connect(
    null,
    { showModal },
  )(SelectPackage),
);
