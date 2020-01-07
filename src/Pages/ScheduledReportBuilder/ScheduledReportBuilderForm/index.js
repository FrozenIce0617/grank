// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { Field, reduxForm, formValueSelector, change as changeFormValue } from 'redux-form';
import { Container, Col, FormGroup } from 'reactstrap';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { range, sortBy } from 'lodash';
import { graphqlLoading, graphqlError } from 'Utilities/underdash';

import FiltersInput from 'Components/Filters/FiltersInput';
import FakeFiltersContext from 'Components/Filters/FakeFiltersContext';
import { Checkbox, TextField, Select, SelectGroups, TextAreaField } from 'Components/Forms/Fields';
import toFormField from 'Components/Forms/toFormField';
import EmailsInput from './EmailsInput';

import { t } from 'Utilities/i18n';
import Validator from 'Utilities/validation';
import underdash from 'Utilities/underdash';
import Button from 'Components/Forms/Button';
import {
  getScheduledReportTypeOptions,
  getLanguageOptions,
  getDefaultEmailSubject,
  getDefaultEmailBody,
} from '../data';
import PublicReportOptions from 'Pages/ScheduledReportBuilder/PublicReportOptions';

import Skeleton from './Skeleton';
import { KEYWORDS_FILTER_SET } from 'Types/FilterSet';
import { findDOMNode } from 'react-dom';

type ReportTemplate = {
  id: string,
  name: string,
};

type Props = {
  formValues: {
    isGroupReport: boolean,
    schedule: Number,
    domain: Object,
    group: Object,
    reportTemplate: ReportTemplate,
  },
  initialValues: Object,
  clients: Object,
  data: Object,
  reportTemplates: Array<Object>,
  reportType: Object,
  resetFormValue: Function,
  history: Object,
  backLink: string,
  submitOnInit: boolean,

  handleSubmit: Function,
  submitting: boolean,
  invalid: boolean,
};

type State = {
  submittedOnInit: false,
};

const EmailsField = toFormField(EmailsInput);
const FiltersField = toFormField(FiltersInput);

const SCHEDULE_WEEKLY = 2;
const SCHEDULE_MONTHLY = 3;

const validateScheduleDay = (value, props: { schedule: Number }) => {
  if (props.schedule === SCHEDULE_WEEKLY || props.schedule === SCHEDULE_MONTHLY) {
    return Validator.numeric(value);
  }
};

class ScheduledReportBuilderForm extends Component<Props, State> {
  _submit: any;

  static defaultProps = {
    backLink: '/reports/scheduled',
  };

  state = {
    submittedOnInit: false,
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      formValues: { schedule, isGroupReport },
    } = this.props;
    const {
      formValues: { schedule: nextSchedule, isGroupReport: nextIsGroupReport },
    } = nextProps;
    if (schedule && schedule !== nextSchedule) {
      this.props.resetFormValue('ScheduleReport', 'scheduledDay');
    }
    if (isGroupReport !== nextIsGroupReport) {
      this.props.resetFormValue('ScheduleReport', 'domain');
      this.props.resetFormValue('ScheduleReport', 'group');
    }
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

  handleBack = () => {
    const { history, backLink } = this.props;
    history.push(backLink);
  };

  reportTypeOptions = getScheduledReportTypeOptions();

  scheduleOptions = [
    { value: 1, label: t('Daily') },
    { value: SCHEDULE_WEEKLY, label: t('Weekly') },
    { value: SCHEDULE_MONTHLY, label: t('Monthly') },
  ];

  scheduleWeeklyOptions = [
    { value: 0, label: t('Monday') },
    { value: 1, label: t('Tuesday') },
    { value: 2, label: t('Wednesday') },
    { value: 3, label: t('Thursday') },
    { value: 4, label: t('Friday') },
    { value: 5, label: t('Saturday') },
    { value: 6, label: t('Sunday') },
  ];

  languageOptions = getLanguageOptions();

  scheduleMonthlyOptions = range(1, 32).map(value => ({
    value,
    label: value >= 29 ? `${value}*` : `${value}`,
  }));

  setSubmitRef = ref => {
    this._submit = ref;
  };

  /*
   * Get domain id selected by group and domain selections
   */
  getDomainId = (): string[] | string | null => {
    const {
      formValues: { isGroupReport, domain, group },
      clients,
    } = this.props;

    let domainId;
    if (isGroupReport) {
      const client = group ? clients.find(clientItem => clientItem.id === group.value) : null;
      domainId = client ? client.domains.map(({ id }) => id) : null;
    } else {
      domainId = domain ? domain.value : null;
    }

    return domainId;
  };

  renderDomainSelect = () => {
    const { clients } = this.props;
    return (
      <FormGroup row className="indented-form-group">
        <Col lg={12}>
          <div className="form-label required">{t('Domain')}</div>
          <Field
            name="domain"
            placeholder={t('Select a domain')}
            component={SelectGroups}
            defaultBehaviour
            useFirstOptionAsDefault={false}
            validate={Validator.required}
            groups={clients.map(client => ({
              label: client.name,
              options: client.domains.map(({ id, domain, displayName }) => ({
                value: id,
                label: (displayName && `${displayName} (${domain})`) || domain,
              })),
            }))}
          />
        </Col>
      </FormGroup>
    );
  };

  renderGroupSelect = () => {
    const { clients } = this.props;
    return (
      <FormGroup row className="indented-form-group">
        <Col lg={12}>
          <div className="form-label required">{t('Group')}</div>
          <Field
            name="group"
            placeholder={t('Select a group')}
            component={Select}
            defaultBehaviour
            useFirstOptionAsDefault={false}
            validate={Validator.required}
            options={clients.map(({ id, name }) => ({ value: id, label: name }))}
          />
        </Col>
      </FormGroup>
    );
  };

  renderScheduleSelect = () => {
    const {
      formValues: { schedule },
    } = this.props;
    let secondDropdownOptions = null;
    let isRequired = false;
    if (schedule === SCHEDULE_WEEKLY) {
      secondDropdownOptions = this.scheduleWeeklyOptions;
      isRequired = true;
    }
    if (schedule === SCHEDULE_MONTHLY) {
      secondDropdownOptions = this.scheduleMonthlyOptions;
      isRequired = true;
    }
    const secondDropdown = (
      <Col>
        <div className={`form-label ${isRequired ? 'required' : ''}`}>{t('Day')}</div>
        <Field
          disabled={!secondDropdownOptions}
          name="scheduledDay"
          defaultBehaviour
          placeholder={t('Day')}
          component={Select}
          parse={scheduleItem => scheduleItem.value}
          options={secondDropdownOptions}
          validate={validateScheduleDay}
        />
        {schedule &&
          schedule.value === 3 && (
            <span className="small">
              {t(
                "* If the month doesn't have that many days it's treated as the last day of the month",
              )}
            </span>
          )}
      </Col>
    );

    return (
      <FormGroup row className="indented-form-group">
        <Col>
          <div className="form-label required">{t('Schedule')}</div>
          <Field
            name="schedule"
            defaultBehaviour
            placeholder={t('Schedule')}
            parse={scheduleItem => scheduleItem.value}
            component={Select}
            options={this.scheduleOptions}
            validate={Validator.required}
          />
          <span className="small">
            {t('Reports are generated and sent after the daily ranking check on the chosen day')}
          </span>
        </Col>
        <Col>{secondDropdown}</Col>
      </FormGroup>
    );
  };

  renderEmailFields = () => (
    <div>
      <FormGroup row className="indented-form-group">
        <Col lg={12}>
          <div className="form-label required">{t('Send email from')}</div>
          <Field name="sender" component={TextField} validate={Validator.required} />
        </Col>
      </FormGroup>
      <FormGroup row className="indented-form-group">
        <Col lg={12}>
          <div className="form-label required">{t('Email subject')}</div>
          <Field name="emailSubject" component={TextField} validate={Validator.required} />
        </Col>
      </FormGroup>
      <FormGroup row className="indented-form-group">
        <Col lg={12}>
          <div className="form-label required">{t('Email body')}</div>
          <Field name="emailBody" component={TextAreaField} validate={Validator.required} />
        </Col>
      </FormGroup>
    </div>
  );

  renderPublicReportOptions = () => {
    const {
      reportType,
      formValues: { isGroupReport, domain, group },
    } = this.props;

    const props = {
      ...(group && isGroupReport ? { groupId: group.value } : {}),
      ...(domain ? { domainId: domain.value } : {}),
    };

    return <PublicReportOptions {...props} reportType={reportType} />;
  };

  renderReportTypeField = () => (
    <FormGroup row className="indented-form-group">
      <Col lg={12}>
        <div className="form-label required">{t('Report Type')}</div>
        <Field
          name="reportType"
          defaultBehaviour
          component={Select}
          options={
            this.props.formValues.isGroupReport
              ? this.reportTypeOptions.slice(0, 1)
              : this.reportTypeOptions
          }
          validate={Validator.required}
        />
      </Col>
    </FormGroup>
  );

  renderForm() {
    const {
      handleSubmit,
      invalid,
      submitting,
      reportTemplates,
      initialValues,
      formValues: { isGroupReport },
    } = this.props;

    const templateOptions = sortBy(reportTemplates, 'name').map(({ id, name }) => ({
      value: id,
      label: name,
    }));
    return (
      <Container className="scheduled-report-builder">
        <div onSubmit={handleSubmit}>
          <FormGroup row className="indented-form-group">
            <Col lg={12}>
              <div className="form-label">{t('Name')}</div>
              <Field name="name" component={TextField} />
            </Col>
          </FormGroup>

          <FormGroup row className="indented-form-group">
            <Col lg={12}>
              <div className="form-label">{t('Description')}</div>
              <Field name="description" component={TextAreaField} />
            </Col>
          </FormGroup>

          {isGroupReport ? this.renderGroupSelect() : this.renderDomainSelect()}
          <FormGroup row className="indented-form-group">
            <Col lg={12}>
              <Field
                name="isGroupReport"
                component={Checkbox}
                defaultChecked={initialValues.isGroupReport}
                onChange={() => this.props.resetFormValue('ScheduleReport', 'reportType')}
              >
                {t('Create for all domains in a group')}
              </Field>
            </Col>
          </FormGroup>
          {this.renderReportTypeField()}
          {this.renderPublicReportOptions()}
          <FormGroup row className="indented-form-group">
            <Col lg={12}>
              <div className="form-label required">{t('Language')}</div>
              <Field
                name="language"
                defaultBehaviour
                placeholder={t('Language')}
                component={Select}
                options={this.languageOptions}
                validate={Validator.required}
              />
            </Col>
          </FormGroup>
          <FormGroup row className="indented-form-group">
            <Col lg={12}>
              <div className="form-label required">{t('Template')}</div>
              <Field
                name="template"
                placeholder={t('Template')}
                component={Select}
                defaultBehaviour
                validate={Validator.required}
                options={templateOptions}
              />
            </Col>
          </FormGroup>
          {this.renderScheduleSelect()}
          <FormGroup row className="indented-form-group">
            <Col lg={12}>
              <div className="form-label">{t('Email Report To')}</div>
              <Field
                name="emails"
                placeholder={t('You can enter multiple email addresses')}
                component={EmailsField}
              />
            </Col>
          </FormGroup>
          {this.renderEmailFields()}
          <FakeFiltersContext.Provider
            value={{
              domainId: this.getDomainId(),
            }}
          >
            <Field name="filters" filterSet={KEYWORDS_FILTER_SET} component={FiltersField} />
          </FakeFiltersContext.Provider>
          <FormGroup className="indented-form-group">
            <hr />
            <div className="confirmation-button-wrapper text-right">
              <Button theme="grey" onClick={this.handleBack}>
                {t('Back')}
              </Button>
              <Button
                ref={this.setSubmitRef}
                disabled={invalid || submitting}
                onClick={handleSubmit}
                theme="orange"
              >
                {t('Save')}
              </Button>
            </div>
          </FormGroup>
        </div>
      </Container>
    );
  }

  render() {
    if (underdash.graphqlLoading({ ...this.props }) || underdash.graphqlError({ ...this.props })) {
      return <Skeleton />;
    }
    return this.renderForm();
  }
}

const dataQuery = gql`
  query scheduledReportBuilderForm_reportTemplatesData {
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

const formValuesSelector = formValueSelector('ScheduleReport');
const mapStateToProps = (state, ownProps) => ({
  formValues: formValuesSelector(state, 'isGroupReport', 'schedule', 'domain', 'group'),
  reportType: formValuesSelector(state, 'reportType'),
  initialValues: {
    language: {
      value: state.user.language,
      label: state.user.language === 'da' ? t('Danish') : t('English'),
    },
    schedule: { value: 1, label: t('Daily') },
    scheduledDay: null,
    reportType: { value: 1, label: t('PDF') },
    sender: state.user.email,
    emailSubject: getDefaultEmailSubject(),
    emailBody: getDefaultEmailBody(),
    filters: [],
    ...ownProps.initialValues,
  },
});

const mapDispatchToProps = dispatch => ({
  resetFormValue: (formName, fieldName) => dispatch(changeFormValue(formName, fieldName, '')),
});

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  graphql(dataQuery, {
    options: () => ({
      fetchPolicy: 'network-only',
    }),
    props: ({
      data,
      data: { error, loading, user, reportTemplates, clients },
      ownProps: { initialValues, submitOnInit },
    }) => {
      if (error || loading) {
        return { data, initialValues };
      }
      const {
        organization: {
          defaultReportTemplate: { id, name },
        },
      } = user;

      const template = initialValues.reportTemplate;
      return {
        data,
        initialValues: submitOnInit
          ? initialValues
          : {
              ...initialValues,
              template: template
                ? { value: template.id, label: template.name }
                : { value: id, label: name },
            },
        clients,
        reportTemplates,
      };
    },
  }),
)(reduxForm({ form: 'ScheduleReport', enableReinitialize: true })(ScheduledReportBuilderForm));
