// @flow
import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import CreateSalesPlanForm from './CreateSalesPlanForm';
import CreatePlanSuccess from './CreatePlanSuccess';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import ActionsMenu, { SALES_PLANS } from 'Pages/Layout/ActionsMenu';
import { withRouter } from 'react-router-dom';
import SalesPlanChoicesInfiniteTable from 'Components/InfiniteTable/Tables/SalesPlanChoicesInfiniteTable';

type Props = {
  history: Object,
  categories: Object[],
};

type State = {
  basePlan: Object | null,
  planId: string,
};

class SalesCreatePlan extends Component<Props, State> {
  state = {
    basePlan: null,
    planId: '',
  };

  handleSelect = (plan: Object) => {
    this.setState({
      basePlan: plan,
    });
  };

  handleDone = () => {
    this.setState({
      planId: '',
    });
    this.props.history.push('/sales/plans');
  };

  handleCreatePlan = (planId: string) => {
    this.setState({
      basePlan: null,
      planId,
    });
  };

  handleCancelCreate = () => {
    this.setState({
      basePlan: null,
    });
    this.props.history.push('/sales/plans');
  };

  renderForm = () => {
    const baseValues = this.state.basePlan || {};
    const planCategory = this.props.categories.find(
      categoryData => categoryData.label === baseValues.category,
    );
    const initialValues = {
      name: baseValues.name,
      category: planCategory ? planCategory.id : null,
      comment: baseValues.comment,
      message: baseValues.message,
      priceMonthly: baseValues.priceMonthly,
      priceYearly: baseValues.priceYearly,
      signonDiscount: baseValues.signonDiscount,
      signonDiscountMonths: baseValues.signonDiscountMonths,
      dealStartDate: baseValues.dealStartDate,
      dealEndDate: baseValues.dealEndDate,
      showCountdown: baseValues.showCountdown,
      maxKeywords: baseValues.maxKeywords,
      maxCompetitors: baseValues.maxCompetitors,
      featureApiAccess: baseValues.featureApiAccess,
      featureAdvancedMetrics: baseValues.featureAdvancedMetrics,
      validForNewOnly: baseValues.validForNewOnly,
    };
    return (
      <Container className="generic-page" fluid>
        <CreateSalesPlanForm
          categories={this.props.categories}
          onCreate={this.handleCreatePlan}
          onCancel={this.handleCancelCreate}
          initialValues={initialValues}
        />
      </Container>
    );
  };

  renderTable = () => (
    <div className="sales-plans-table content-container">
      <div className="table-container">
        <SalesPlanChoicesInfiniteTable onPlanSelect={this.handleSelect} />
      </div>
    </div>
  );

  render() {
    let content = null;
    if (this.state.planId) {
      content = <CreatePlanSuccess onClose={this.handleDone} planId={this.state.planId} />;
    } else {
      content = this.state.basePlan ? this.renderForm() : this.renderTable();
    }
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={SALES_PLANS} />
        {content}
      </DashboardTemplate>
    );
  }
}

const planCategoriesQuery = gql`
  query salesCreatePlan_adminPlanCategories {
    adminPlanCategories {
      id
      name
    }
  }
`;

export default compose(
  withRouter,
  graphql(planCategoriesQuery, {
    props: ({ data }) => {
      const categories = (data.adminPlanCategories || []).map(adminPlanCategory => ({
        label: adminPlanCategory.name,
        id: adminPlanCategory.id,
      }));
      return { categories };
    },
  }),
)(SalesCreatePlan);
