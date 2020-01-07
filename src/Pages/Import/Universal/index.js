// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import classNames from 'classnames';
import withFiltersEditor from 'Components/HOC/withFiltersEditor';
import { Select } from 'Components/Forms/Fields';
import { showModal } from 'Actions/ModalAction';
import { FilterAttribute } from 'Types/Filter';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import gql from 'graphql-tag';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import ActionsMenu, { BULK_IMPORT } from 'Pages/Layout/ActionsMenu';
import { Col, FormGroup, Container } from 'reactstrap';
import IconButton from 'Components/IconButton';
import CheckIcon from 'icons/check.svg?inline';
import * as Actions from 'Pages/Layout/ActionsMenu/Actions';
import UniversalKeywordsInfiniteTable from 'Components/InfiniteTable/Tables/UniversalKeywordsInfiniteTable';
import Button from 'Components/Forms/Button';
import { t, tn } from 'Utilities/i18n/index';
import type { FilterBase } from 'Types/Filter';
import type { FiltersEditorProps } from 'Components/HOC/withFiltersEditor';
import Validator from 'Utilities/validation';
import '../imports.scss';
import underdash from 'Utilities/underdash';

type Props = {
  connectionId: string,
  showModal: Function,
  keyword: string,
  keywordComparison: string,
  hideExisting: boolean,
  countryName: string,
  filterData: Function,
  prepareData: Function,
  filters: FilterBase[],
} & FiltersEditorProps;

type State = {
  selected: Set<string>, // selected keywords if isAllSelected false, unselected otherwise
  isAllSelected: boolean,
  domainId: string,
};

class UniversalKeywordsImport extends Component<Props, State> {
  _table: any;

  state = {
    selected: new Set(),
    isAllSelected: false,
    domainId: undefined,
  };

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (this.props.filters !== nextProps.filters) {
      this.setState({
        selected: new Set(),
        isAllSelected: false,
      });
    }
  }

  handleSelect = ({ currentTarget: { name } }) => {
    const { selected, isAllSelected } = this.state;
    const set = new Set(selected);
    (set.has(name) ? set.delete : set.add).call(set, name);

    // (un)select all on (un)select last
    if (set.size === this.getNumResults() && set.size !== 0) {
      this.setState({
        isAllSelected: !isAllSelected,
        selected: new Set(),
      });
      return;
    }

    this.setState({
      selected: set,
    });
  };

  handleSelectAll = ({ currentTarget: { checked } }) => {
    this.setState({
      isAllSelected: checked,
      selected: new Set(),
    });
  };

  isFiltered = () => {
    const { countryName, keywordComparison } = this.props;
    return !!countryName || !!keywordComparison;
  };

  handleAddAction = () => {
    this.props.showModal({
      modalType: 'AddKeywords',
      modalTheme: 'light',
      modalProps: {
        domainId: this.state.domainId,
        gscKeywords: this.getSelectedKeywords(),
        refresh: this.handleRefresh,
      },
    });
  };

  importAll = () => {
    this.props.showModal({
      modalType: 'AddKeywords',
      modalTheme: 'light',
      modalProps: {
        domainId: this.state.domainId,
        gscKeywords: this.getKeywords(),
        refresh: this.handleRefresh,
      },
    });
  };

  getSelectedKeywords = () => {
    const { selected, isAllSelected } = this.state;
    return this.getKeywords().filter(keywordData => {
      const hasKeyword = selected.has(keywordData.id.toString());
      return isAllSelected ? !hasKeyword : hasKeyword;
    });
  };

  handleRefresh = () => {
    this.resetTable();
  };

  handleUpdate = () => {
    this.forceUpdate();
  };

  getInfiniteTableInstance = () =>
    this._table &&
    this._table
      .getWrappedInstance()
      .getWrappedInstance()
      .getWrappedInstance()
      .getWrappedInstance();

  resetTable = () => {
    const instance = this.getInfiniteTableInstance();
    return instance && instance.resetTable();
  };

  getKeywords = () => {
    const instance = this.getInfiniteTableInstance();
    return instance ? instance.getList() : [];
  };

  getNumResults = () => {
    const instance = this.getInfiniteTableInstance();
    return instance ? instance.getNumResults() : 0;
  };

  setTableRef = ref => {
    this._table = ref;
  };

  handleSubmit = values => {
    this.setState({
      domainId: values.domain.value,
    });
  };

  render() {
    if (underdash.graphqlLoading({ ...this.props }) || underdash.graphqlError({ ...this.props })) {
      return null;
    }

    const {
      connectionId,
      clientsQuery: { clients },
      invalid,
      submitting,
      handleSubmit,
    } = this.props;
    const { selected, isAllSelected } = this.state;
    const numResults = this.getNumResults();

    const selectedKeywordsSize = this.getSelectedKeywords().length;

    const domainOptions = [];
    const domains = clients.map(client =>
      client.domains.map(domain => {
        domainOptions.push({
          value: domain.id,
          label:
            (domain.displayName && `${domain.displayName} (${domain.domain})`) || domain.domain,
        });
      }),
    );

    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={BULK_IMPORT} hidePeriodFilter>
          <Actions.AddAction
            key="addSelected"
            label={tn(
              'Import selected keyword (%s)',
              'Import selected keywords (%s)',
              selectedKeywordsSize,
            )}
            onClick={selected.size || isAllSelected ? this.handleAddAction : () => {}}
            className={classNames({ disabled: !selectedKeywordsSize })}
          />
          <IconButton
            icon={CheckIcon}
            className={classNames('imports-btn', { disabled: !numResults })}
            onClick={!numResults ? () => {} : this.importAll}
          >
            {this.isFiltered() ? t('Import filtered (%s)', numResults) : t('Import all')}
          </IconButton>
        </ActionsMenu>
        {this.state.domainId ? (
          <div className="universal-keywords-table content-container">
            <div className="table-container">
              <UniversalKeywordsInfiniteTable
                connectionId={connectionId}
                handleSelect={this.handleSelect}
                handleSelectAll={this.handleSelectAll}
                selected={selected}
                isAllSelected={isAllSelected}
                onUpdate={this.handleUpdate}
                ref={this.setTableRef}
                featureAdvancedMetrics={false}
                hasAnalytics={false}
              />
            </div>
          </div>
        ) : (
          <Container className="generic-page" fluid>
            <Col lg={4}>
              <form onSubmit={handleSubmit(this.handleSubmit)}>
                <FormGroup row className="indented-form-group">
                  <Col lg={12}>
                    <div className="form-label required">{t('Domain')}</div>
                    <Field
                      defaultBehaviour
                      name="domain"
                      placeholder={t('Select a domain')}
                      component={Select}
                      validate={Validator.required}
                      options={domainOptions}
                    />
                  </Col>
                </FormGroup>

                <FormGroup className="indented-form-group">
                  <hr />
                  <div className="confirmation-button-wrapper text-right">
                    <Button theme="orange" disabled={invalid || submitting} submit>
                      {t('Continue')}
                    </Button>
                  </div>
                </FormGroup>
              </form>
            </Col>
          </Container>
        )}
      </DashboardTemplate>
    );
  }
}

const clientsQuery = gql`
  query universalKeywordsImport_clients {
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

const keywordFilterSelector = SpecificFilterSelector(FilterAttribute.KEYWORD);
const countryNameFilterSelector = SpecificFilterSelector(FilterAttribute.COUNTRY_NAME);
const connectionFilterSelector = SpecificFilterSelector(FilterAttribute.CONNECTION);

const mapStateToProps = state => {
  const keywordFilter = keywordFilterSelector(state);
  const countryNameFilter = countryNameFilterSelector(state);
  const connectionFilter = connectionFilterSelector(state);

  return {
    keyword: keywordFilter && keywordFilter.value,
    keywordComparison: keywordFilter && keywordFilter.comparison,
    countryName: countryNameFilter && countryNameFilter.value,
    connectionId: connectionFilter && connectionFilter.value,
    filters: state.filter.filterGroup.filters,
  };
};

export default compose(
  withFiltersEditor,
  connect(
    mapStateToProps,
    { showModal },
  ),
  graphql(clientsQuery, {
    name: 'clientsQuery',
  }),
)(reduxForm({ form: 'ChooseDomainForm' })(UniversalKeywordsImport));
