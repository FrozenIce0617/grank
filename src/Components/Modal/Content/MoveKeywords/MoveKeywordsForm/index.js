// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Col, Row, FormGroup } from 'reactstrap';
import { Field, reduxForm } from 'redux-form';

import Toast from 'Components/Toast';
import Button from 'Components/Forms/Button';
import { Select } from 'Components/Forms/Fields';
import { t } from 'Utilities/i18n/index';
import Validator from 'Utilities/validation';
import underdash from 'Utilities/underdash';
import DomainItem from 'Components/DomainItem';
import type { FilterBase } from 'Types/Filter';

import './move-keywords-form.scss';

type Props = {
  handleSubmit: Function,
  submitting: boolean,
  hideModal: Function,
  keywords: Array<any>,
  invalid: boolean,
  refresh: Function,
  domainsData: Object,
  domainId: string,
  moveKeywords: Function,
  shouldExclude: boolean,
  filters: FilterBase[],
};

class MoveKeywordsForm extends Component<Props> {
  getKeywordsInput = () => {
    const { keywords, shouldExclude, filters } = this.props;
    const ids = keywords.map(keywordData => keywordData.id);
    return shouldExclude
      ? {
          keywordsToExclude: ids,
          filters,
        }
      : {
          keywords: ids,
        };
  };

  handleSubmit = domain =>
    this.props
      .moveKeywords({
        variables: {
          input: {
            ...this.getKeywordsInput(),
            moveToDomain: domain.domain.id,
          },
        },
      })
      .then(() => {
        Toast.success(t('Updated'));
        this.props.refresh();
        this.props.hideModal();
      });

  renderSkeleton = () => null;

  renderValue = domainObj => <div>{domainObj.displayName}</div>;

  renderOption = domainObj => <DomainItem {...domainObj} />;

  filterOptions = (options, filterString) => {
    const pattern = filterString.toLowerCase();
    return options
      .filter(
        option =>
          option.header ||
          (option.domain && option.domain.toLowerCase().includes(pattern)) ||
          (option.displayName && option.displayName.toLowerCase().includes(pattern)),
      )
      .filter(
        (option, idx, opts) =>
          !(
            option.header &&
            ((opts.length > idx + 1 && opts[idx + 1].header) || opts.length === idx + 1)
          ),
      );
  };

  render() {
    if (underdash.graphqlError({ ...this.props }) || underdash.graphqlLoading({ ...this.props })) {
      return this.renderSkeleton();
    }

    const { invalid, submitting, handleSubmit, domainId } = this.props;
    const domains = this.props.domainsData.clients.reduce((acc, client) => {
      acc.push(
        { headerText: client.name, domain: client.name, header: true, disabled: true },
        ...client.domains.filter(({ id }) => id !== domainId),
      );
      return acc;
    }, []);

    return (
      <form className="move-keywords-form row" onSubmit={handleSubmit(this.handleSubmit)}>
        <Col lg={12}>
          <Row>
            <Col xs={12}>
              <div>
                <FormGroup row className="indented-form-group">
                  <Col xs={12} lg={12}>
                    <div className="form-label required">{t('Domain')}</div>
                    <Field
                      defaultBehaviour
                      name="domain"
                      placeholder={t('Domain')}
                      component={Select}
                      validate={Validator.required}
                      clearable={false}
                      searchable={true}
                      backspaceRemoves={false}
                      deleteRemoves={false}
                      options={domains}
                      filterOptions={this.filterOptions}
                      optionRenderer={this.renderOption}
                      valueRenderer={this.renderValue}
                    />
                  </Col>
                </FormGroup>
                <hr />
                <FormGroup className="indented-form-group">
                  <div className="confirmation-button-wrapper text-right">
                    <Button disabled={invalid || submitting} submit theme="orange">
                      {t('Save')}
                    </Button>
                  </div>
                </FormGroup>
              </div>
            </Col>
          </Row>
        </Col>
      </form>
    );
  }
}

const moveKeywordsQuery = gql`
  mutation moveKeywordsForm_updateKeywords($input: UpdateKeywordsInput!) {
    updateKeywords(input: $input) {
      task {
        id
      }
    }
  }
`;

const getGroupsAndDomainsQuery = gql`
  query moveKeywordsForm_groupsAndDomains {
    clients {
      id
      name
      organization {
        id
      }
      domains {
        id
        domain
        displayName
        faviconUrl
        client {
          id
          name
        }
      }
    }
  }
`;

export default compose(
  graphql(getGroupsAndDomainsQuery, { name: 'domainsData' }),
  graphql(moveKeywordsQuery, { name: 'moveKeywords' }),
)(
  reduxForm({
    form: 'MoveKeywordsForm',
  })(MoveKeywordsForm),
);
