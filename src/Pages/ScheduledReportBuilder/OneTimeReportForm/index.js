// @flow
import React, { Component } from 'react';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { FormGroup } from 'reactstrap';
import { t } from 'Utilities/i18n';
import Validator from 'Utilities/validation';
import Button from 'Components/Forms/Button';
import type { FormProps } from 'redux-form';
import { showModal } from 'Actions/ModalAction';
import {
  PUBLIC_REPORT,
  getReportTypeOptions,
  getLanguageOptions,
  getDefaultEmailSubject,
  getDefaultEmailBody,
  PDF,
} from '../data';
import { Select } from 'Components/Forms/Fields';
import toFormField from 'Components/Forms/toFormField';
import EmailsInput from '../ScheduledReportBuilderForm/EmailsInput';
import PublicReportOptions from '../PublicReportOptions';
import gql from 'graphql-tag';
import { compose, graphql, withApollo } from 'react-apollo';
import { sortBy } from 'lodash';
import { createSelector } from 'reselect';
import Toast from 'Components/Toast';
import { FilterAttribute, stringifyFilters, DOMAINS } from 'Types/Filter';
import queryDomainInfo from 'Pages/queryDomainInfo';
import type { FilterBase, DomainsFilter } from 'Types/Filter';
import WS, { subscribeToGeneratedReport } from 'Utilities/websocket';
import { downloadFile } from 'Utilities/underdash';
import LoadingSpinner from 'Components/LoadingSpinner';
import { graphqlLoading, graphqlError } from 'Utilities/underdash';

type Props = {
  client: any,
  reportTemplates: Object,
  onSubmit: () => void,
  emailFrom: string,
  filters: FilterBase[],
  reportType?: Object,
  hasDriveAccount: boolean,
  showModal: Function,
  initialState: Object,
  submitOnInit: boolean,
} & FormProps;

type State = {
  scheduledReportId: number | null,
  submittedOnInit: boolean,
  isLoading: boolean,
  link: string | null,
};

const EmailsField = toFormField(EmailsInput);

class OneTimeReportForm extends Component<Props, State> {
  _submit: any;
  generatedReportSub: Object;

  state = {
    isLoading: false,
    scheduledReportId: null,
    link: null, // to show Download button when report is created successfully
    submittedOnInit: false,
  };

  UNSAFE_componentWillMount() {
    this.generatedReportSub = subscribeToGeneratedReport(this.handleDownload);
  }

  UNSAFE_componentWillUpdate(nextProps: Props, nextState: State) {
    if (
      this._submit &&
      nextProps.submitOnInit &&
      !nextState.submittedOnInit &&
      nextProps.hasDriveAccount &&
      !(graphqlLoading(nextProps) || graphqlError(nextProps))
    ) {
      // eslint-disable-next-line react/no-will-update-set-state
      this.setState({
        submittedOnInit: true,
      });

      // Probably not the best way to submit programmatically,
      // so if there is a better way that runs handleSubmit and set submitting, fix me
      // eslint-disable-next-line react/no-find-dom-node
      findDOMNode(this._submit).click();
    }
  }

  componentWillUnmount() {
    this.generatedReportSub.unsubscribe();
  }

  handleDownload = ({
    data: {
      action,
      other: { scheduled_report, url, report_type },
    },
  }) => {
    // // ws message example
    // const message = {
    //   "data": {
    //     "id": "530365",
    //     "obj": "GENERATED_REPORT",
    //     "action": "UPDATED",
    //     "other": {
    //       "scheduled_report": 58224,
    //       "url": "/media/generated_reports/AccuRanker_accurankercom-8_2019-01-07_ab541b17b7ad4a04b6f7b12126aa2cf3_3lTBZlb.pdf",
    //       "report_type": 1
    //     }
    //   }
    // };
    const { selectedEmails } = this.props;
    if (
      !selectedEmails.length &&
      scheduled_report === this.state.scheduledReportId &&
      action === WS.UPDATED
    ) {
      Toast.success(t('Report created'));
      this.setState({
        link: url,
        isLoading: false,
      });
      if (report_type !== 5) {
        downloadFile(url);
      }
    }
  };

  languageOptions = getLanguageOptions();
  reportTypeOptions = getReportTypeOptions();

  handleSubmit = (data: any) => {
    const domainsFilter = (this.props.filters.find(
      filter => filter.attribute === FilterAttribute.DOMAINS,
    ): any);
    if (!domainsFilter) {
      Toast.error(t('Domains list is empty'));
      Validator.throwSubmissionError({
        _error: 'Domains list is empty',
      });
      return;
    }
    const domains = (domainsFilter: DomainsFilter).value;
    const { emails, reportType, template, language } = data;
    const isGroupReport = domains.length > 1;
    const noDomainsFilters = this.props.filters.filter(filter => filter.attribute !== DOMAINS);

    const input: any = {
      isGroupReport,
      isOneTimeReport: true,
      reportType: reportType.value,
      reportFilter: {
        filters: stringifyFilters(noDomainsFilters),
      },
      reportTemplate: template ? template.value : null,
      schedule: 1,
      scheduledDay: null,
      recipients: emails ? emails : [],
      sender: this.props.emailFrom,
      emailSubject: getDefaultEmailSubject(),
      emailBody: getDefaultEmailBody(),
      language: language.value,
    };

    const { hasDriveAccount } = this.props;

    // pop the google auth flow if we dont have an account
    if (reportType.value === 5 && !hasDriveAccount) {
      this.handleMissingDriveAccount(data);
      return;
    }

    if (isGroupReport) {
      const client = this.props.clients.find(clientData =>
        clientData.domains.find(domainData => domainData.id === domains[0]),
      );
      if (client) {
        input.group = client.id;
      } else {
        Toast.error(t('Can not find group for domain'));
        Validator.throwSubmissionError({
          _error: 'Can not find group for domain',
        });
        return;
      }
    } else {
      input.domain = domains[0];
    }

    this.setState({ isLoading: true });

    return this.props.addScheduledReport({ variables: { input } }).then(
      ({
        data: {
          addScheduledReport: { errors, scheduledReport },
        },
      }) => {
        if (errors && errors.length) {
          this.setState({ isLoading: false });
          Toast.error(errors[0].messages[0]);
          Validator.throwSubmissionError(errors);
        }

        if (emails.length) {
          Toast.success(
            t(
              'Report is being generated and will be sent to %s when completed.',
              emails.join(', '),
            ),
          );
          this.props.onSubmit();
          return;
        }

        this.setState({
          scheduledReportId: Number(scheduledReport.id),
        });
      },
      () => {
        this.setState({ isLoading: false });
        Toast.error(t('Unable to create report'));
      },
    );
  };

  handleMissingDriveAccount = data => {
    const { domainId } = this.props;
    this.props.showModal({
      modalType: 'ConnectToDrive',
      modalTheme: 'light',
      modalProps: {
        message: t(
          'You do not have a Google Drive connection setup with AccuRanker. Please connect to your Google account to allow AccuRanker to create spreadsheet reports. AccuRanker will only have access to the files it creates, and cannot read other files.',
        ),
        nextModalType: 'OneTimeReport',
        lastState: data,
        domainId,
      },
    });
  };

  setSubmitRef = ref => {
    this._submit = ref;
  };

  renderGeneratingReport() {
    return <div>{t('Your report is being generated. Please wait...')}</div>;
  }

  renderLinkToReport() {
    return (
      <div className="alert alert-info">
        {t(
          "Your report is now ready, download should have started but if it haven't please click the download link below",
        )}
      </div>
    );
  }

  downloadReport = () => {
    window.open(this.state.link, '_blank');
    this.props.onSubmit();
  };

  renderForm() {
    const { submitting, reportTemplates, reportType } = this.props;
    const templateOptions = sortBy(reportTemplates, 'name').map(({ id, name }) => ({
      value: id,
      label: name,
    }));

    const reportTypeOption = reportType || {};

    return (
      <div>
        <div className="form-label required">{t('Report Type')}</div>
        <Field
          name="reportType"
          defaultBehaviour
          component={Select}
          disabled={submitting}
          options={this.reportTypeOptions}
          validate={Validator.required}
        />
        <PublicReportOptions reportType={reportTypeOption} domainId={this.props.domainId} />
        {reportTypeOption.value !== PUBLIC_REPORT && [
          reportTypeOption.value === PDF && [
            <div key="template-label" className="form-label required">
              {t('Template')}
            </div>,
            <Field
              key="template"
              name="template"
              placeholder={t('Template')}
              component={Select}
              disabled={submitting}
              defaultBehaviour
              validate={Validator.required}
              options={templateOptions}
            />,
          ],
          <div key="language-label" className="form-label required">
            {t('Language')}
          </div>,
          <Field
            key="language"
            name="language"
            defaultBehaviour
            disabled={submitting}
            placeholder={t('Language')}
            component={Select}
            options={this.languageOptions}
            validate={Validator.required}
          />,
          <div key="email-label" className="form-label">
            {t('Email to')}
          </div>,
          <Field
            key="email"
            disabled={submitting}
            name="emails"
            placeholder={t('You can enter multiple email addresses')}
            component={EmailsField}
          />,
        ]}
      </div>
    );
  }

  render() {
    const { handleSubmit, invalid, submitting, reportType } = this.props;
    const { isLoading, link } = this.state;

    const loadingSpinner = submitting || isLoading ? <LoadingSpinner /> : null;
    const reportTypeOption = reportType || {};
    const showFooter = reportTypeOption.value !== PUBLIC_REPORT;
    return (
      <form className="one-time-report-form" onSubmit={handleSubmit(this.handleSubmit)}>
        {(link && this.renderLinkToReport()) || (
          <div>{submitting || isLoading ? this.renderGeneratingReport() : this.renderForm()}</div>
        )}

        {showFooter && (
          <FormGroup className="indented-form-group">
            <hr />
            <div className="confirmation-button-wrapper text-right">
              {loadingSpinner}
              {(link && (
                <Button onClick={this.downloadReport} theme="orange">
                  {t('Download')}
                </Button>
              )) || (
                <Button
                  ref={this.setSubmitRef}
                  disabled={invalid || submitting || isLoading}
                  submit
                  theme="orange"
                >
                  {submitting || isLoading ? t('Generating') : t('Download')}
                </Button>
              )}
            </div>
          </FormGroup>
        )}
      </form>
    );
  }
}

const dataQuery = gql`
  query oneTimeReportForm_reportTemplatesData {
    user {
      id
      email
      organization {
        id
        defaultReportTemplate {
          id
          name
        }
      }
    }
    reportTemplates {
      id
      name
    }
    clients {
      id
      name
      domains {
        id
        domain
        displayName
      }
    }
  }
`;

const addScheduledReportQuery = gql`
  mutation oneTimeReportForm_addScheduledReport($input: CreateScheduledReportInput!) {
    addScheduledReport(input: $input) {
      errors {
        field
        messages
      }
      scheduledReport {
        id
        url
        preferredUrl
      }
    }
  }
`;

const ReduxForm = reduxForm({ form: 'OneTimeReportForm', enableReinitialize: true })(
  OneTimeReportForm,
);

const languageSelector = state => state.user.language;
const filtersSelector = state => state.filter.filterGroup.filters;

const initialValuesSelector = createSelector(
  [languageSelector, filtersSelector],
  (language: string) => {
    const languageOptions = getLanguageOptions();
    const reportTypes = getReportTypeOptions();
    return {
      language: languageOptions.find(languageObj => languageObj.value === language),
      reportType: reportTypes[0],
      emails: [],
    };
  },
);

const reportTypeSelector = formValueSelector('OneTimeReportForm');

const mapStateToProps = (state, { initialState }) => ({
  initialValues: initialState || initialValuesSelector(state),
  hasDriveAccount: state.user.googleConnections.length > 0,
  emailFrom: state.user.email,
  filters: state.filter.filterGroup.filters,
  reportType: reportTypeSelector(state, 'reportType'),
  selectedEmails: reportTypeSelector(state, 'emails'),
});

export default compose(
  withApollo,
  connect(
    mapStateToProps,
    { showModal },
  ),
  queryDomainInfo(),
  graphql(addScheduledReportQuery, { name: 'addScheduledReport' }),
  graphql(dataQuery, {
    props: ({ data, ownProps }) => {
      const { error, loading, user, reportTemplates, clients } = data;
      if (error || loading) {
        return {};
      }
      const {
        organization: { defaultReportTemplate },
      } = user;
      return {
        initialValues: {
          ...ownProps.initialValues,
          template: { value: defaultReportTemplate.id, label: defaultReportTemplate.name },
        },
        reportTemplates,
        clients,
      };
    },
  }),
)(ReduxForm);
