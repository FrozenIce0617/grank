// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import gql from 'graphql-tag';
import { Col, Row, Container } from 'reactstrap';
import Button from 'Components/Forms/Button';
import Select from 'react-select';
import { t, tn } from 'Utilities/i18n/index';
import { graphqlLoading, graphqlError } from 'Utilities/underdash';
import { showModal, hideModal } from 'Actions/ModalAction';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import InfoIcon from 'Components/InfoIcon';
import Skeleton from 'Components/Skeleton';
import FormatNumber from 'Components/FormatNumber';
import cn from 'classnames';

import './select-plan.scss';

type Props = {
  history: Object,
  pricingPlansData: Object,
  user: Object,
  showModal: Function,
  hideModal: Function,
  errorMessage: string,
  backToPage: boolean,
  backLink: any,
};

type State = {
  billingCycle: number,
  selectedPlans: Object,
};

const CYCLE = {
  MONTHLY: 1,
  ANNUAL: 2,
};

class SelectPlanForm extends Component<Props, State> {
  CYCLE_NAMES: Object;

  constructor(props) {
    super(props);

    this.CYCLE_NAMES = {
      [CYCLE.MONTHLY]: t('monthly'),
      [CYCLE.ANNUAL]: t('annual'),
    };
  }

  state = {
    billingCycle: CYCLE.MONTHLY,
    selectedPlans: {}, // map: category => plan id
  };

  getSelectOptions = choices =>
    choices.map(choice => ({
      label: (
        <span>
          <FormatNumber thousandsSettings={null}>{choice.maxKeywords}</FormatNumber> {t('keywords')}
        </span>
      ),
      value: choice.id,
    }));

  getSelectedChoice = (choices, category, originalPlanId) => {
    const { selectedPlans } = this.state;
    const planId = selectedPlans[category] || originalPlanId;
    return choices.find(choice => choice.id === planId);
  };

  handleBillingCycleSelect = billingCycle => {
    this.setState({
      billingCycle,
    });
  };

  handleSelectPlan = (choices, category, originalPlanId) => {
    const {
      history,
      user: {
        organization: { numberOfUsers, domainWithHighestCompetitors },
      },
      backToPage,
      backLink,
    } = this.props;
    const { billingCycle } = this.state;

    const plan = this.getSelectedChoice(choices, category, originalPlanId);
    const hasLessUsers = plan.maxUsers < numberOfUsers && plan.maxUsers !== -1;
    const hasLessCompetitors =
      plan.maxCompetitors < domainWithHighestCompetitors && plan.maxCompetitors !== -1;

    const descriptionMessage = [];
    if (hasLessUsers) {
      descriptionMessage.push(
        t(
          'You have chosen a plan with less users then your current plan. All other users but the yours will be deleted.',
        ),
      );
    }
    if (hasLessCompetitors) {
      descriptionMessage.push(
        t(
          'You have chosen a plan with less competitors per domain then your current plan. All additional competitors will be deleted.',
        ),
      );
    }

    if (hasLessUsers || hasLessCompetitors) {
      this.props.showModal({
        modalType: 'Confirmation',
        modalProps: {
          cancelLabel: t('Cancel'),
          confirmLabel: t('Select plan'),
          lockDuration: 0,
          title: t('Select plan?'),
          description: descriptionMessage.join(' '),
          action: () => {
            history.push(`/checkout/${billingCycle}/${plan.id}`);
          },
          cancelAction: () => {
            this.props.showModal({
              modalType: 'SelectPlan',
              modalProps: {
                backToPage,
                backLink,
              },
            });
          },
        },
      });
    } else {
      history.push(`/checkout/${billingCycle}/${plan.id}`);
    }
  };

  handleSelect = (category, planId) => {
    const { selectedPlans } = this.state;
    this.setState({
      selectedPlans: {
        ...selectedPlans,
        [category]: planId,
      },
    });
  };

  getMonthPriceForAnnual = priceYearly => Math.floor(priceYearly / 12);

  renderSimplePlanFeature = (label, description) => (
    <span>
      {label}
      <InfoIcon>{description}</InfoIcon>
    </span>
  );

  renderPlanNumFeature = (choice, fieldName, label, description) => (
    <span>
      {choice[fieldName] > 0 && (
        <FormatNumber thousandsSettings={null}>{choice[fieldName]}</FormatNumber>
      )}{' '}
      {label}
      <InfoIcon
        unavailable={choice.unavailable}
        reasons={choice.unavailableReasons}
        field={fieldName}
      >
        {description}
      </InfoIcon>
    </span>
  );

  renderPlanFeatures = (plan, choice) => {
    let maxUsers = choice.maxUsers;
    if (maxUsers === -1) {
      maxUsers = t('Unlimited users');
    } else {
      maxUsers = tn('user', 'users', maxUsers);
    }

    let maxCompetitors = choice.maxCompetitors;
    if (maxCompetitors === -1) {
      maxCompetitors = t('Unlimited competitors per domain');
    } else if (maxCompetitors === 0) {
      maxCompetitors = t('No competitors');
    } else {
      maxCompetitors = tn('competitor per domain', 'competitors per domain', maxCompetitors);
    }

    let maxDomains = choice.maxDomains;
    if (maxDomains === -1) {
      maxDomains = t('Unlimited domains');
    } else {
      maxDomains = tn('domain', 'domains', maxDomains);
    }

    return (
      <div className="plan-description">
        {/* this.renderPlanNumFeature(
          choice,
          'maxKeywords',
          tn('keyword', 'keywords', choice.maxKeywords),
          t(
            'A keyword can be used for tracking your position in Google or Bing for any location and desktop or mobile device.',
          ),
        )*/}
        {this.renderPlanNumFeature(
          choice,
          'maxDomains',
          maxDomains,
          t('Add all the domains you want to track.'),
        )}
        {this.renderPlanNumFeature(
          choice,
          'maxUsers',
          maxUsers,
          t('The number of co-workers you are able to give access to your AccuRanker account.'),
        )}
        {this.renderPlanNumFeature(
          choice,
          'maxCompetitors',
          maxCompetitors,
          t('Monitor the ranks of your competitors. You can add this many competitors per domain.'),
        )}
        {this.renderSimplePlanFeature(
          t('Daily and on-demand rank updates'),
          t(
            'Once a day we will automatically refresh your rankings. If you need even fresher numbers you can manully refresh your keywords.',
          ),
        )}
        {this.renderSimplePlanFeature(
          t('Advanced reporting'),
          t(
            'Put your own logo on the reports, include the data that your client is interested in and schedule it for automatic sending on any given day of the month.',
          ),
        )}
        {this.renderSimplePlanFeature(
          t('Google & Adobe Analytics'),
          t('Integrate with either Google or Adobe Analytics to get even better metrics.'),
        )}
        {this.renderSimplePlanFeature(
          t('Google Search Console'),
          t('Import your keywords from Search Console.'),
        )}
        {this.renderSimplePlanFeature(
          t('Share of Voice'),
          t('See how much of the market do you own.'),
        )}
        {this.renderSimplePlanFeature(
          t('Landing Pages'),
          t('Combine keywords, ranks and Google Analytics data.'),
        )}
        {this.renderSimplePlanFeature(t('Tag Cloud'), t('Visualize your keywords by tag.'))}
        {choice.featureAdvancedMetrics &&
          this.renderSimplePlanFeature(
            t('Share of Voice Pro'),
            t('Show advanced Share of Voice metrics.'),
          )}
        {choice.featureAdvancedMetrics &&
          this.renderSimplePlanFeature(
            t('Advanced Metrics'),
            t('Show advanced metrics across landing pages, tag cloud and more.'),
          )}
        {choice.featureAdvancedMetrics &&
          this.renderSimplePlanFeature(
            t('SERP History'),
            t('A time machine for search result pages.'),
          )}
        {choice.featureApiAccess &&
          this.renderSimplePlanFeature(
            t('API'),
            t('Access your data through our easy-to-use REST API.'),
          )}
      </div>
    );
  };

  renderSkeleton() {
    return [...Array(4).keys()].map(item => (
      <Col xs={12} md={3} className="plan" key={item}>
        <Skeleton
          linesConfig={[
            { type: 'subtitle', options: { width: '40%', alignment: 'center' } },
            { type: 'title', options: { width: '60%', alignment: 'center' } },
            { type: 'input', options: { width: '100%', alignment: 'center' } },
            { type: 'spacer-underline', options: { width: '100%' } },
            { type: 'text', options: { width: '45%' } },
            { type: 'spacer-underline', options: { width: '100%' } },
            { type: 'text', options: { width: '55%' } },
            { type: 'spacer-underline', options: { width: '100%' } },
            { type: 'text', options: { width: '50%' } },
            { type: 'button', options: { width: '40%', marginTop: '20px', alignment: 'center' } },
          ]}
        />
      </Col>
    ));
  }

  renderBillingCycleButton(cycle) {
    const { billingCycle } = this.state;
    return (
      <span
        className={cn('btn caret-down hover-light', {
          active: cycle === billingCycle,
          label: cycle === CYCLE.ANNUAL,
        })}
        onClick={() => this.handleBillingCycleSelect(cycle)}
        data-label={cycle === CYCLE.ANNUAL && t('Save money')}
      >
        {`${this.CYCLE_NAMES[cycle]} ${t('pricing')}`}
      </span>
    );
  }

  renderBillingCycleToggle() {
    return (
      <Col xs={12} md={{ size: '5', offset: 7 }} className="no-padding">
        <div className="button-group-wrapper">
          {this.renderBillingCycleButton(CYCLE.MONTHLY)}
          {this.renderBillingCycleButton(CYCLE.ANNUAL)}
        </div>
      </Col>
    );
  }

  renderAnnualDiscount({ priceMonthly, priceYearly, currency }) {
    const { billingCycle } = this.state;
    if (billingCycle === CYCLE.ANNUAL) {
      const discount = Math.ceil(priceMonthly - this.getMonthPriceForAnnual(priceYearly));
      return discount > 0 ? (
        <span className="yearly-discount">
          {t('You save')} <FormatNumber currency={currency}>{discount}</FormatNumber>
        </span>
      ) : null;
    }
    return null;
  }

  renderPrice({ priceMonthly, priceYearly, currency }) {
    const { billingCycle } = this.state;
    const price =
      billingCycle === CYCLE.MONTHLY ? priceMonthly : this.getMonthPriceForAnnual(priceYearly);
    return price ? (
      <h4 className="plan-price">
        <FormatNumber currency={currency}>{price}</FormatNumber>
        <span className="suffix">/{t('mo')}</span>
      </h4>
    ) : (
      <h4 className="plan-price">{t('Unavailable')}</h4>
    );
  }

  renderArrow = () => <div className="dropdown-arrow" />;

  renderPlanCategory = (planCategory, hasAffiliate) => {
    const { originalPlan, choices, name: category } = planCategory;
    const selectedPlanChoice = this.getSelectedChoice(choices, category, originalPlan.id);
    const options = this.getSelectOptions(choices);

    return (
      <Col
        key={selectedPlanChoice.id}
        className={cn('plan', {
          unavailable: choices.unavailable,
          featured:
            (category === 'Professional' && !hasAffiliate) ||
            (category === 'Affiliate' && hasAffiliate),
          hasAffiliate,
        })}
        xs={12}
        md={hasAffiliate ? 2 : 3}
      >
        <h4>{category}</h4>
        {this.renderPrice(selectedPlanChoice)}
        {this.renderAnnualDiscount(selectedPlanChoice)}
        <div style={{ minHeight: '55px', marginTop: '10px' }}>
          {options.length > 0 && (
            <Select
              clearable={false}
              searchable={false}
              backspaceRemoves={false}
              deleteRemoves={false}
              options={options}
              onChange={({ value: planId }) => this.handleSelect(category, planId)}
              arrowRenderer={this.renderArrow}
              value={selectedPlanChoice.id}
            />
          )}
        </div>
        {this.renderPlanFeatures(originalPlan, selectedPlanChoice)}
        <div className="plan-select-button-container">
          <hr />
          {this.renderSelectButton(selectedPlanChoice, () =>
            this.handleSelectPlan(choices, category, originalPlan.id),
          )}
        </div>
      </Col>
    );
  };

  renderPlans = () => {
    if (graphqlLoading({ ...this.props }) || graphqlError({ ...this.props })) {
      return this.renderSkeleton();
    }
    const hasAffiliate = this.props.pricingPlansData.pricingPlansChoices.length > 4;
    return this.props.pricingPlansData.pricingPlansChoices.map(e =>
      this.renderPlanCategory(e, hasAffiliate),
    );
  };

  renderSelectButton(selectedPlanChoice, clickHandle) {
    const {
      organization: { activePlan, active },
    } = this.props.user;
    const { billingCycle } = this.state;

    const isSamePlanWithSameBillingCycle =
      activePlan &&
      activePlan.originPlan &&
      selectedPlanChoice.id === activePlan.originPlan.id &&
      ((activePlan.billingCycleInMonths === 12 && billingCycle === CYCLE.ANNUAL) ||
        (activePlan.billingCycleInMonths === 1 && billingCycle === CYCLE.MONTHLY)) &&
      active;

    // if price is 0 for the billing period = unavailable
    if (
      (billingCycle === CYCLE.MONTHLY && selectedPlanChoice.priceMonthly <= 0) ||
      (billingCycle === CYCLE.ANNUAL && selectedPlanChoice.priceYearly <= 0)
    ) {
      return (
        <Button theme="red" small disabled>
          {t('Unavailable')}
        </Button>
      );
    }

    return selectedPlanChoice.unavailable || isSamePlanWithSameBillingCycle ? (
      <Button theme="red" small disabled>
        {t('Unavailable')}
      </Button>
    ) : (
      <Button theme="orange" onClick={clickHandle}>
        {t('Select')}
      </Button>
    );
  }

  renderErrorMessage() {
    const { errorMessage } = this.props;
    if (!errorMessage) return null;
    return errorMessage && <p className="modal-main-text">{errorMessage}</p>;
  }

  renderCloseButtonHide() {
    return (
      <span className="custom-link spacing-top" onClick={this.props.hideModal}>
        {t('Back to payment page')}
      </span>
    );
  }

  renderCloseButtonBack() {
    if (!this.props.history.length) return null;
    if (this.props.backLink instanceof Function) {
      return (
        <span onClick={this.props.backLink} className="custom-link spacing-top">
          {t('Back to previous page')}
        </span>
      );
    }
    return (
      <Link to={this.props.backLink || '/account/billing'} className="custom-link spacing-top">
        {t('Back to billing overview')}
      </Link>
    );
  }

  renderCloseButton() {
    const { errorMessage, backToPage } = this.props;
    if (errorMessage) {
      return null;
    }
    return backToPage ? this.renderCloseButtonBack() : this.renderCloseButtonHide();
  }

  render() {
    return (
      <div className="select-plan plans-modal modal-content-container">
        <div className="modal-content-inner">
          <h2 className="modal-title">{t('Select a Plan')}</h2>
          {this.renderErrorMessage()}
          <Container>
            <Row>{this.renderBillingCycleToggle()}</Row>
            <Row className="plans-container">{this.renderPlans()}</Row>
            <Row>{this.renderCloseButton()}</Row>
          </Container>
        </div>
      </div>
    );
  }
}

const pricingPlansQuery = gql`
  query selectPlanForm_pricingPlansChoices {
    pricingPlansChoices {
      name
      originalPlan {
        id
        isPublicPlan
      }
      choices {
        id
        name
        currency
        priceMonthly
        priceYearly
        maxKeywords
        maxCompetitors
        maxDomains
        maxUsers
        unavailable
        unavailableReasons {
          field
          message
        }

        featureApiAccess
        featureCompetitorMonitoring
        featureAnalyticsIntegration
        featureSearchVolume
        featureWhitelabel
        featureReporting
        featureKeywordRefresh
        featureAdvancedReporting
        featureCanPause
        featureSocial
        featureAdvancedMetrics
      }
    }
  }
`;

export default compose(
  connect(
    ({ user }) => ({ user }),
    { showModal, hideModal },
  ),
  withRouter,
  graphql(pricingPlansQuery, {
    name: 'pricingPlansData',
  }),
)(SelectPlanForm);
