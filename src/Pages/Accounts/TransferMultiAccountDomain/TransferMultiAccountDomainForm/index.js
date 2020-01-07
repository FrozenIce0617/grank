// @flow
import React, { Component } from 'react';
import { t, tct } from 'Utilities/i18n';
import { connect } from 'react-redux';
import Skeleton from 'Components/Skeleton';
import { compose, graphql } from 'react-apollo';
import { uniqWith, isEmpty } from 'lodash';
import { Row, Col, FormGroup } from 'reactstrap';
import { Field, reduxForm } from 'redux-form';
import { Select, Checkbox } from 'Components/Forms/Fields';
import Validator from 'Utilities/validation';
import LabelWithHelp from 'Components/LabelWithHelp';
import { throwSubmitErrors, throwNetworkError } from 'Utilities/errors';
import { graphqlOK } from 'Utilities/underdash';
import { formValueSelector } from 'redux-form';
import Toast from 'Components/Toast';

import Button from 'Components/Forms/Button';

import { showModal, hideModal } from 'Actions/ModalAction';
import FormErrors from 'Components/Forms/FormErrors';

import './transfer-multi-account-domain-form.scss';
import gql from 'graphql-tag';

type DomainItem = {
  organization: Object,
  group: Object,
  domain: Object,
};

type Props = {
  handleSubmit: Function,
  transferDomain: Function,
  onCancel: Function,
  showModal: Function,
  hideModal: Function,
  submitting: boolean,
  invalid: boolean,
  domainsData: Object,
  multiAccountsDomainsData: Object,
  selectedDomain: Object,
};

const formName = 'TransferMultiAccountDomainForm';
const domainFieldName = 'domain';

class TransferMultiAccountDomainForm extends Component<Props> {
  getDomainItems = organizations => {
    const result = [];
    organizations.forEach(org => {
      let item = {
        organization: {
          id: org.id,
          name: org.name,
        },
      };

      org.clients.forEach(client => {
        item = {
          ...item,
          group: {
            id: client.id,
            name: client.name,
          },
        };

        if (isEmpty(client.domains)) {
          result.push(item);
        }

        client.domains.forEach(domain => {
          result.push({
            ...item,
            domain: {
              id: domain.id,
              domain: domain.domain,
              displayName: domain.displayName,
            },
          });
        });
      });
    });
    return result;
  };

  getMultiAccountDomains = () => {
    const {
      multiAccountsDomainsData: { user },
    } = this.props;
    const organization = user.organization;
    return organization
      ? this.getDomainItems(organization.multiAccounts.map(account => account.toOrganization))
      : [];
  };

  getDomains = () => {
    const {
      domainsData: { user },
    } = this.props;
    const organization = user.organization;
    return organization ? this.getDomainItems([organization]) : [];
  };

  getDomainOptions = (domainItems: DomainItem[]) =>
    domainItems.filter(domainItem => domainItem.domain).map(item => ({
      label: `${item.organization.name} ${item.group.name} ${item.domain.displayName} ${
        item.domain.domain
      }`,
      value: {
        groupId: item.group.id,
        group: item.group.name,
        domain: item.domain.domain,
        domainId: item.domain.id,
      },
    }));

  getGroupOptions = (domainItems: DomainItem[]) => {
    const { selectedDomain } = this.props;
    if (!selectedDomain) {
      return [];
    }
    return uniqWith(
      domainItems,
      (a, b) => a.organization.id === b.organization.id && a.group.id === b.group.id,
    )
      .map(item => ({
        label: `${item.organization.name} ${item.group.name}`,
        value: {
          groupId: item.group.id,
          group: item.group.name,
          organization: item.organization.name,
          organizationId: item.organization.id,
        },
      }))
      .filter(
        option =>
          selectedDomain.value.organizationId !== option.value.organizationId &&
          selectedDomain.value.groupId !== option.value.groupId,
      );
  };

  handleSubmit = (data: Object) =>
    new Promise((resolve, reject) => {
      const {
        copy: isCopy,
        client: {
          value: { group, groupId, organization },
        },
        domain: {
          value: { domain, domainId },
        },
      } = data;
      this.props.showModal({
        modalType: 'Confirmation',
        modalProps: {
          cancelLabel: t('Cancel'),
          confirmLabel: t('OK'),
          lockDuration: 0,
          title: isCopy ? t('Copy domain?') : t('Move domain?'),
          description: isCopy
            ? tct(
                'Are you sure you want to copy the domain [domain] to the group [group] on the [organization] account?',
                {
                  domain: <strong>{domain}</strong>,
                  group: <strong>{group}</strong>,
                  organization: <strong>{organization}</strong>,
                },
              )
            : tct(
                'Are you sure you want to move the domain [domain] to the group [group] on the [organization] account?',
                {
                  domain: <strong>{domain}</strong>,
                  group: <strong>{group}</strong>,
                  organization: <strong>{organization}</strong>,
                },
              ),
          action: () => {
            this.props
              .transferDomain({
                variables: {
                  input: {
                    copy: !!isCopy,
                    toClientId: groupId,
                    domainId,
                  },
                },
              })
              .then(({ data: { transferMultiAccountDomain: { errors } } }) => {
                if (errors && errors.length) {
                  Toast.error(errors[0].messages[0]);
                  Validator.setResponseErrors(Validator.throwSubmissionError, errors);
                  reject();
                } else {
                  Toast.success(
                    isCopy ? t('Domain copy job started...') : t('Domain move job started...'),
                  );
                  resolve();
                }
              }, throwNetworkError)
              .catch(error => {
                reject(error);
              });

            this.props.hideModal();
          },
        },
      });
    });

  filterOptions = (options, filterString) => {
    const pattern = filterString.toLowerCase();
    return options.filter(opt => ~opt.label.toLowerCase().indexOf(pattern));
  };

  renderSkeleton() {
    return (
      <Skeleton
        className="indented-form-group form-group"
        linesConfig={[
          { type: 'text', options: { width: '30%' } },
          { type: 'input', marginBottom: '20px' },
          { type: 'text', options: { width: '30%' } },
          { type: 'input', marginBottom: '20px' },
          { type: 'text', options: { width: '30%', marginBottom: '20px' } },
          { type: 'button', options: { display: 'inline-block', width: '15%', float: 'right' } },
        ]}
      />
    );
  }

  render() {
    const { submitting, invalid, handleSubmit, selectedDomain } = this.props;

    if (!graphqlOK(this.props)) {
      return this.renderSkeleton();
    }

    const domainItems = this.getDomains().concat(this.getMultiAccountDomains());
    return (
      <form
        className="transfer-multi-account-domain-form"
        onSubmit={handleSubmit(this.handleSubmit)}
      >
        <Row>
          <Col lg={12}>
            <FormErrors />
          </Col>
        </Row>
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <div className="form-label required">{t('Domain')}</div>
            <Field
              defaultBehaviour
              name={domainFieldName}
              placeholder={t('Select domain to move or copy')}
              component={Select}
              options={this.getDomainOptions(domainItems)}
              filterOptions={this.filterOptions}
              validate={Validator.required}
            />
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <div className="form-label required">{t('To group')}</div>
            <Field
              defaultBehaviour
              disabled={!selectedDomain}
              name="client"
              placeholder={t('Select organization and group to move/copy domain to')}
              component={Select}
              options={this.getGroupOptions(domainItems)}
              validate={Validator.required}
            />
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <Field name="copy" component={Checkbox}>
              <LabelWithHelp
                className="form-label"
                tag="div"
                helpTitle={t('Copy Domain')}
                help={t('Check this to copy the domain instead of moving it.')}
              >
                {t('Copy domain')}
              </LabelWithHelp>
            </Field>
          </Col>
        </FormGroup>
        <div className="confirmation-button-wrapper text-right">
          <Button theme="orange" submit disabled={submitting || invalid}>
            {t('Move domain')}
          </Button>
        </div>
      </form>
    );
  }
}

const multiAccountsDomainsQuery = gql`
  query transferMultiAccountDomainForm_multiAccountsDomains {
    user {
      id
      organization {
        id
        multiAccounts {
          id
          toOrganization {
            id
            name
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
        }
      }
    }
  }
`;

const domainsQuery = gql`
  query transferMultiAccountDomainForm_domains {
    user {
      id
      organization {
        id
        name
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
    }
  }
`;

const transferMultiAccountDomainMutation = gql`
  mutation transferMultiAccountDomainForm_transferMultiAccountDomain(
    $input: TransferMultiAccountDomainInput!
  ) {
    transferMultiAccountDomain(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

const selector = formValueSelector(formName);
const mapStateToProps = state => ({
  selectedDomain: selector(state, domainFieldName),
});

export default compose(
  connect(
    mapStateToProps,
    { showModal, hideModal },
  ),
  graphql(multiAccountsDomainsQuery, {
    name: 'multiAccountsDomainsData',
    options: () => ({
      fetchPolicy: 'network-only',
    }),
  }),
  graphql(domainsQuery, {
    name: 'domainsData',
    options: () => ({
      fetchPolicy: 'network-only',
    }),
  }),
  graphql(transferMultiAccountDomainMutation, { name: 'transferDomain' }),
)(
  reduxForm({
    form: formName,
  })(TransferMultiAccountDomainForm),
);
