// @flow
import React, { Component } from 'react';
import { compose } from 'react-apollo';
import { formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import { t } from 'Utilities/i18n';

type Props = {
  formValues: Object,
};

type State = {};

class ScheduledReportPreview extends Component<Props, State> {
  hasRendered = false;

  shouldComponentUpdate(nextProps: Props) {
    const {
      formValues: { language, template, domain, group, isGroupReport, reportType },
    } = this.props;
    const {
      formValues: {
        language: nextLanguage,
        template: nextTemplate,
        domain: nextDomain,
        group: nextGroup,
        isGroupReport: nextIsGroupReport,
        reportType: nextReportType,
      },
    } = nextProps;
    if (!this.hasRendered) {
      return true;
    }

    const hasUpdated = (val, nextVal) => {
      if (!val) return !!nextVal;
      if (!nextVal) return true;
      return val.value !== nextVal.value;
    };

    return (
      isGroupReport !== nextIsGroupReport ||
      hasUpdated(language, nextLanguage) ||
      hasUpdated(template, nextTemplate) ||
      hasUpdated(reportType, nextReportType) ||
      hasUpdated(domain, nextDomain) ||
      hasUpdated(group, nextGroup)
    );
  }
  buildPreviewUrl = () => {
    const {
      formValues: { isGroupReport, domain, group, language, template },
    } = this.props;
    const domainOrGroup = isGroupReport ? group : domain;
    return `/reports/${isGroupReport ? 'pdf_group_report' : 'pdf_report'}/${domainOrGroup.value ||
      domainOrGroup}/?preview=1&template_id=${template.value ||
      template}&language=${language.value || language}&_=${Date.now()}&tags_filter_type=1`;
  };

  render() {
    const {
      formValues: { domain, group, reportType, template },
    } = this.props;
    const previewReady =
      (domain || group) && template && reportType && (reportType.value || reportType) === 1;
    this.hasRendered = this.hasRendered || previewReady;
    return previewReady ? (
      <embed type="application/pdf" width="100%" height="100%" src={this.buildPreviewUrl()} />
    ) : (
      <div className="empty-preview">
        {(reportType && (reportType.value || reportType)) === 1 ? (
          <p className="alert alert-info">{t('Please fill out the form to view the preview.')}</p>
        ) : (
          <p className="alert alert-info">{t('You can only preview PDF reports.')}</p>
        )}
      </div>
    );
  }
}

const formValuesSelector = formValueSelector('ScheduleReport');
const mapStateToProps = state => ({
  formValues: formValuesSelector(
    state,
    'isGroupReport',
    'domain',
    'group',
    'language',
    'template',
    'reportType',
  ),
});

export default compose(connect(mapStateToProps))(ScheduledReportPreview);
