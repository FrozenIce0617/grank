// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { submit } from 'redux-form';
import { Container, Col } from 'reactstrap';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { withRouter } from 'react-router';

import Button from 'Components/Forms/Button';
import { showModal } from 'Actions/ModalAction';
import CompanyInfoWidget from '../CompanyInfoWidget/index';
import { t } from 'Utilities/i18n';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import ActionsMenu, { ACCOUNT_BILLING } from 'Pages/Layout/ActionsMenu';

import LoadingSpinner from 'Components/LoadingSpinner';

type Props = {
  dispatch: Function,
  updateCompanyInfo: Function,
  showModal: Function,
  history: Object,
  backLink?: string,
};

type State = {
  showVatFields: boolean,
  formSubmitting: boolean,
  formValid: boolean,
};

class UpdatePaymentInfo extends Component<Props, State> {
  handleSubmit: Function;
  getFormValidStatus: Function;

  static defaultProps = {
    backLink: '/account/billing',
  };

  constructor(props) {
    super(props);
    this.state = {
      showVatFields: true,
      formSubmitting: false,
      formValid: true,
    };
  }

  getFormValidStatus = valid => {
    this.setState({
      formValid: valid,
    });
  };

  handleSubmit = ({
    companyName,
    street,
    zipcode,
    city,
    state,
    country: { countryCode },
    vatPrefix,
    vatNumber,
    emailInvoiceTo,
  }) => {
    const { history } = this.props;
    this.setState({
      formSubmitting: true,
    });
    this.props
      .updateCompanyInfo({
        variables: {
          companyName,
          street,
          zipcode,
          city,
          state,
          countryIso: countryCode,
          vatPrefix: vatPrefix ? vatPrefix.vatCode : null,
          vatNumber: vatNumber ? vatNumber.trim() : null,
          emailInvoiceTo,
        },
      })
      .then(({ data: { setPaymentContact: { error, success } } }) => {
        if (!success) {
          this.setState({
            formSubmitting: false,
          });
          this.props.showModal({
            modalType: 'GeneralError',
            modalProps: {
              title: t('We could not update your company information'),
              errorType: error,
              link: '/billing/',
            },
          });
          return;
        }

        history.push('/account/billing');
      });
  };

  handleBack = () => {
    const { history, backLink } = this.props;
    history.push(backLink);
  };

  render() {
    const { dispatch } = this.props;
    const { formSubmitting, formValid } = this.state;
    const loadingSpinner = formSubmitting ? <LoadingSpinner /> : '';
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={ACCOUNT_BILLING} />
        <Container
          fluid
          className="checkout-container on-subscriptions-page content-container with-padding"
        >
          <form className="row">
            <Col md={6} xs={12}>
              <strong className="form-title not-numbered">{t('Company Details')}</strong>
              <CompanyInfoWidget
                onSubmit={this.handleSubmit}
                setFormValidStatus={this.getFormValidStatus}
              />
              <div className="text-right confirmation-button-wrapper">
                {loadingSpinner}
                <Button additionalClassName="back-button" theme="grey" onClick={this.handleBack}>
                  {t('Back')}
                </Button>
                <Button
                  disabled={formSubmitting || !formValid}
                  theme="orange"
                  onClick={() => dispatch(submit('CompanyInfoForm'))}
                >
                  {t('Update')}
                </Button>
              </div>
            </Col>
          </form>
        </Container>
      </DashboardTemplate>
    );
  }
}

const updateCompanyInfoMutation = gql`
  mutation updatePaymentInfo_updateCompanyInfo(
    $companyName: String!
    $street: String!
    $city: String!
    $zipcode: String!
    $countryIso: String!
    $state: String
    $vatPrefix: String
    $vatNumber: String
    $emailInvoiceTo: String
  ) {
    setPaymentContact(
      companyName: $companyName
      street: $street
      city: $city
      zipcode: $zipcode
      countryIso: $countryIso
      state: $state
      vatPrefix: $vatPrefix
      vatNumber: $vatNumber
      emailInvoiceTo: $emailInvoiceTo
    ) {
      success
      error
    }
  }
`;

export default withRouter(
  compose(
    withRouter,
    graphql(updateCompanyInfoMutation, { name: 'updateCompanyInfo' }),
    connect(
      null,
      dispatch => ({
        ...bindActionCreators({ showModal }, dispatch),
        dispatch,
      }),
    ),
  )(UpdatePaymentInfo),
);
