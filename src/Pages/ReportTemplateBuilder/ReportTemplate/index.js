// @flow
import React, { Component } from 'react';
import { compose } from 'react-apollo';
import { connect } from 'react-redux';
import { pick, omit, transform } from 'lodash';
import { withRouter } from 'react-router-dom';
import { t } from 'Utilities/i18n/index';
import Button from 'Components/Forms/Button';
import ElementsList from '../ElementsList';
import {
  removeElement,
  resetTemplate,
  moveElement,
  replaceElement,
  loadTemplate,
} from 'Actions/ReportTemplateAction';
import type { ReportElement } from 'Types/ReportElement';
import './report-template.scss';

type Props = {
  elements: Array<ReportElement>,
  removeElement: Function,
  resetTemplate: Function,
  moveElement: Function,
  replaceElement: Function,

  handleSave: Function,
  name: String,
  color: String,
  history: Object,
  backLink?: string,
};

const transformElement = element => {
  const settings = transform(
    omit(element, ['id', 'type']),
    (result, value, key) => (result[key] = { value }),
    {},
  );
  return {
    ...pick(element, ['type']),
    settings,
  };
};

class ReportTemplate extends Component<Props> {
  static defaultProps = {
    backLink: '/reports/templates',
  };

  handleSave = () => {
    const { name, color, elements } = this.props;
    this.props.handleSave(name, color, JSON.stringify(elements.map(transformElement)));
  };

  handleBack = () => {
    const { history, backLink } = this.props;
    history.push(backLink);
  };

  render() {
    const { elements } = this.props;
    return (
      <div className="report-template">
        <div className="title">{t('Report Elements')}</div>
        <ElementsList
          elements={elements}
          onRemove={this.props.removeElement}
          onMove={this.props.moveElement}
          onReplace={this.props.replaceElement}
        />
        <div className="actions">
          <Button additionalClassName="back-button" theme="grey" onClick={this.handleBack}>
            {t('Back')}
          </Button>
          <Button theme="grey" onClick={this.props.resetTemplate}>
            {t('Clear template')}
          </Button>
          <Button theme="orange" onClick={this.handleSave}>
            {t('Save template')}
          </Button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  elements: state.reportTemplate.elements,
  name: state.reportTemplate.name,
  color: state.reportTemplate.color,
});

export default withRouter(
  compose(
    connect(
      mapStateToProps,
      {
        removeElement,
        resetTemplate,
        moveElement,
        replaceElement,
        loadTemplate,
      },
    ),
  )(ReportTemplate),
);
