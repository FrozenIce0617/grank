// @flow
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { FormGroup } from 'reactstrap';
import { t } from 'Utilities/i18n';
import Validator from 'Utilities/validation';
import Button from 'Components/Forms/Button';
import { Select } from 'Components/Forms/Fields';
import gql from 'graphql-tag';
import { compose, graphql, withApollo } from 'react-apollo';
import Toast from 'Components/Toast';
import queryDomainInfo from 'Pages/queryDomainInfo';
import { downloadFile } from 'Utilities/underdash';
import { isEmpty } from 'lodash';
import { graphqlLoading, graphqlError } from 'Utilities/underdash';
import LoadingSpinner from 'Components/LoadingSpinner';
import FormErrors from 'Components/Forms/FormErrors';
import { throwNetworkError } from 'Utilities/errors';
import { LATEST } from 'Components/PeriodFilter/model';
import { FilterAttribute } from 'Types/Filter';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import CloseIcon from 'icons/close-2.svg?inline';
import { parsePeriodFilterValue } from 'Components/PeriodFilter/model';
import { formatDate } from 'Utilities/format';
import './competitors-ranks-report-form.scss';
import { showModal } from 'Actions/ModalAction';

type Props = {
  competitorsData: Object,
  domainId: string,
  domainInfo: Object,
  invalid: boolean,
  submitting: boolean,
  generateReport: Function,
  showModal: Function,
  handleSubmit: Function,
  hasDriveAccount: boolean,
  endDate: string,
  onSubmit: () => void,
  submitOnInit: boolean,
  initialState: Object,
};

type State = {
  link: string | null,
  submittedOnInit: boolean,
};

const getReportTypeOptions = () => [
  { value: 2, label: t('Excel') },
  { value: 3, label: t('CSV') },
  { value: 5, label: t('Google Sheets') },
];

class CompetitorsRanksReportForm extends Component<Props, State> {
  _submit: any;

  state = {
    link: null,
    submittedOnInit: false,
  };

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

  getCompetitorsOptions = () => {
    const { competitorsData } = this.props;
    if (!competitorsData.keywords) {
      return [];
    }
    return competitorsData.keywords.competitors.competitors.map(({ id, domain }) => ({
      label: domain,
      value: id,
    }));
  };

  handleSubmit = (data: any) => {
    const { domainId, endDate, hasDriveAccount } = this.props;
    const { competitors, reportType } = data;
    const competitorsArr = Array.isArray(competitors) ? competitors : [competitors];

    // pop the google auth flow if we dont have an account
    if (reportType.value === 5 && !hasDriveAccount) {
      this.handleMissingDriveAccount(data);
      return;
    }

    return this.props
      .generateReport({
        variables: {
          input: {
            id: domainId,
            competitors: competitorsArr.map(option => option.value),
            endDate: endDate === LATEST ? formatDate(new Date()) : endDate,
            reportType: reportType.value,
          },
        },
      })
      .then(({ data: { exportCsvDomainWithCompetitors: { errors, generatedReport } } }) => {
        if (!isEmpty(errors)) {
          Validator.throwSubmissionError(errors);
        }
        Toast.success(t('Report created'));
        this.setState({
          link: generatedReport.url,
        });
        if (reportType.value !== 5) {
          downloadFile(generatedReport.url);
          this.props.onSubmit();
        }
      }, throwNetworkError)
      .catch(error => {
        Toast.error(t('Unable to create report'));
        throw error;
      });
  };

  setSubmitRef = ref => {
    this._submit = ref;
  };

  valueComponent = ({ value, children, onClick, onRemove }) => (
    <span className="value-item" onClick={onClick}>
      <span>
        {children}
        <CloseIcon onClick={() => onRemove(value)} />
      </span>
    </span>
  );

  handleMissingDriveAccount = data => {
    const { domainId } = this.props;
    this.props.showModal({
      modalType: 'ConnectToDrive',
      modalTheme: 'light',
      modalProps: {
        message: t(
          'You do not have a Google Drive connection setup with AccuRanker. Please connect to your Google account to allow AccuRanker to create spreadsheet reports. AccuRanker will only have access to the files it creates, and cannot read other files.',
        ),
        nextModalType: 'CompetitorsRanksReport',
        lastState: data,
        domainId,
      },
    });
  };

  renderLinkToReport() {
    return <div className="alert alert-info">{t('Your report is now ready!')}</div>;
  }

  renderGeneratingReport() {
    return <div>{t('Your report is being generated. Please wait...')}</div>;
  }

  renderForm() {
    return (
      <div>
        <FormErrors />

        <div className="form-label required">{t('Report Type')}</div>
        <Field
          name="reportType"
          defaultBehaviour
          component={Select}
          options={getReportTypeOptions()}
          validate={Validator.required}
        />
        <div className="form-label required">{t('Competitors')}</div>
        <Field
          autofocus
          multi
          name="competitors"
          placeholder={t('Competitors')}
          component={Select}
          defaultBehaviour
          validate={Validator.nonEmptyArrayOrObj}
          options={this.getCompetitorsOptions()}
          valueComponent={this.valueComponent}
          clearRenderer={() => <CloseIcon />}
        />
      </div>
    );
  }

  render() {
    const { handleSubmit, invalid, submitting } = this.props;

    const loadingSpinner = submitting ? <LoadingSpinner /> : null;

    return (
      <form
        className="competitors-ranks-report-form"
        onSubmit={handleSubmit(this.handleSubmit)}
        ref={this.setFormRef}
      >
        {this.state.link ? (
          this.renderLinkToReport()
        ) : (
          <div>{submitting ? this.renderGeneratingReport() : this.renderForm()}</div>
        )}

        <FormGroup className="indented-form-group">
          <hr />
          <div className="confirmation-button-wrapper text-right">
            {loadingSpinner}
            {this.state.link ? (
              <Button onClick={() => window.open(this.state.link, '_blank')} theme="orange">
                {t('Open report')}
              </Button>
            ) : (
              <Button
                ref={this.setSubmitRef}
                disabled={invalid || submitting}
                submit
                theme="orange"
              >
                {submitting ? t('Generating') : t('Download')}
              </Button>
            )}
          </div>
        </FormGroup>
      </form>
    );
  }
}

const competitorsRanksReportMutation = gql`
  mutation competitorsRanksReportForm_competitorsRanksReport(
    $input: ExportCSVDomainWithCompetitorsInput!
  ) {
    exportCsvDomainWithCompetitors(input: $input) {
      generatedReport {
        url
      }
    }
  }
`;

const competitorsDataQuery = gql`
  query competitorsRanksReportForm_competitors(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
    $fakeOrdering: OrderingInput!
    $fakePagination: PaginationInput!
  ) {
    keywords(filters: $filters, pagination: $fakePagination, ordering: $fakeOrdering) {
      competitors(pagination: $pagination, ordering: $ordering) {
        competitors {
          id
          domain
        }
      }
    }
  }
`;

const ReduxForm = reduxForm({ form: 'CompetitorsRanksReportForm', enableReinitialize: true })(
  CompetitorsRanksReportForm,
);

const periodFilterSelector = SpecificFilterSelector(FilterAttribute.PERIOD);

const mapStateToProps = (state, { initialState }) => {
  const periodFilter = periodFilterSelector(state);
  const initialValues = initialState || {
    reportType: getReportTypeOptions()[1],
  };

  return {
    initialValues,
    hasDriveAccount: state.user.googleConnections.length > 0,
    filters: state.filter.filterGroup.filters,
    endDate: periodFilter && formatDate(parsePeriodFilterValue(periodFilter).to),
  };
};

export default compose(
  withApollo,
  connect(
    mapStateToProps,
    { showModal },
  ),
  queryDomainInfo(),
  graphql(competitorsRanksReportMutation, { name: 'generateReport' }),
  graphql(competitorsDataQuery, {
    name: 'competitorsData',
    options: props => {
      const { filters } = props;
      return {
        fetchPolicy: 'network-only',
        variables: {
          filters,
          fakePagination: {
            page: 1,
            results: 5,
          },
          fakeOrdering: {
            order: 'ASC',
            orderBy: 'keyword',
          },
          pagination: {
            page: 1,
            results: 100,
          },
          ordering: {
            order: 'ASC',
            orderBy: 'domain',
          },
        },
      };
    },
  }),
)(ReduxForm);
