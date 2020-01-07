// @flow
import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { Container, Row, Col, FormGroup } from 'reactstrap';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';

import Button from 'Components/Forms/Button';
import Toast from 'Components/Toast';
import FormatNumber from 'Components/FormatNumber';
import Skeleton from 'Components/Skeleton';

import { t, tct } from 'Utilities/i18n/index';
import underdash from 'Utilities/underdash';
import toast from 'Components/Toast';

import './cancel-plan.scss';

type Props = {
  handleSubmit: Function,
  invalid: boolean,
  onError: Function,
  onSuccess: Function,
  submitting: boolean,
  reset: Function,
  cancelPlan: Function,
  refresh: Function,
};

type State = {
  success: boolean,
};

class CancelPlanForm extends Component<Props, State> {
  state = {
    success: false,
  };

  back = () => {
    window.location = '/app/account/billing/';
  };

  handleSubmit = () => {
    const { location } = this.props;
    const params = new URLSearchParams(location.search);

    const cancelPlanInput = {
      ignoreMinCancelationPeriod: params.get('aWdub3') === 'true' || false,
    };

    return this.props
      .cancelPlan({
        variables: {
          cancelPlanInput,
        },
      })
      .then(({ data: { cancelPlan: { errors } } }) => {
        if (errors && errors.length) {
          Toast.error(errors[0].messages[0]);
          return;
        }
        this.setState({
          success: true,
        });
      })
      .catch(error => {
        console.log('error', error);
        toast.error(t('Unable to cancel plan'));
      });
  };

  renderSkeleton() {
    return (
      <Skeleton
        className="indented-form-group form-group"
        linesConfig={[
          { type: 'text', options: { width: '30%' } },
          { type: 'input' },
          { type: 'text', options: { width: '30%' } },
          { type: 'input' },
          { type: 'text', options: { width: '30%' } },
          { type: 'text', options: { width: '45%' } },
          { type: 'text', options: { width: '25%' } },
          { type: 'text', options: { width: '40%' } },
          { type: 'text', options: { width: '25%' } },
          { type: 'button', options: { width: '45%', alignment: 'center' } },
        ]}
      />
    );
  }

  renderForm() {
    const { handleSubmit, invalid, submitting, activePlan, user } = this.props;
    const { success } = this.state;

    return (
      <DashboardTemplate showFilters={false}>
        <Container fluid className="cancel-plan-page">
          <Row className="content-row" noGutters>
            {success ? (
              <div>
                <h3>{t('Your subscription has been canceled')}</h3>
                <p>
                  {t('Your subscription has now been canceled.')}
                  <br />
                  {t('You can access your AccuRanker account until %s', activePlan.endDate)}
                  <br />
                </p>

                <p>
                  {t(
                    'If you at one point would like to come back to AccuRanker, we will be storing your data, so you won’t lose your valuable historical data.',
                  )}
                </p>
                <p>{t('Sincerely, The AccuRanker Team')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(this.handleSubmit)}>
                <h3>{t('Cancellation of your AccuRanker subscription')}</h3>
                <p>
                  {t('Hi %s', user.fullName)}
                  <br />
                  {t('You are about to cancel your subscription.')}
                </p>

                <p>
                  <strong>{t('Details')}</strong>
                  <br />
                  {t(
                    'Plan: %s with %s keywords',
                    activePlan.isFree ? activePlan.name : activePlan.category,
                    activePlan.maxKeywords,
                  )}
                  <br />

                  {tct('Price: $[price] [period]', {
                    price: (
                      <FormatNumber currency={activePlan.currency}>
                        {activePlan.billingCycleInMonths === 1
                          ? activePlan.priceMonthly
                          : activePlan.priceYearly}
                      </FormatNumber>
                    ),
                    period:
                      activePlan.billingCycleInMonths === 1 ? t('paid monthly') : t('paid yearly'),
                  })}
                  <br />

                  {t('Your subscription will be accessible until: %s', activePlan.endDate)}
                </p>

                <FormGroup className="indented-form-group">
                  <hr />
                  <div className="confirmation-button-wrapper text-right">
                    <Button theme="grey" onClick={this.back}>
                      {t('Go to billing')}
                    </Button>
                    <Button disabled={invalid || submitting} submit theme="red">
                      {t('Cancel subscription')}
                    </Button>
                  </div>
                </FormGroup>
              </form>
            )}
          </Row>
        </Container>
      </DashboardTemplate>
    );
  }

  render() {
    const shouldRenderSkeleton =
      underdash.graphqlLoading({ ...this.props }) || underdash.graphqlError({ ...this.props });

    return <div>{shouldRenderSkeleton ? this.renderSkeleton() : this.renderForm()}</div>;
  }
}

const cancelPlanMutation = gql`
  mutation cancelPlanForm_cancelPlan($cancelPlanInput: CancelPlanInput!) {
    cancelPlan(input: $cancelPlanInput) {
      errors {
        field
        messages
      }
    }
  }
`;

const mapStateToProps = state => ({
  orgId: state.user.organization.id,
  activePlan: state.user.organization.activePlan,
  user: state.user,
});

export default compose(
  connect(mapStateToProps),
  graphql(cancelPlanMutation, { name: 'cancelPlan' }),
)(reduxForm({ form: 'CancelPlan', enableReinitialize: true })(CancelPlanForm));
