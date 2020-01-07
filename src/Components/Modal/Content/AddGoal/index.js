// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { hideModal } from 'Actions/ModalAction';
import { t } from 'Utilities/i18n';
import { throwNetworkError } from 'Utilities/errors';
import { formatDate } from 'Utilities/format';

import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import toast from 'Components/Toast';
import LoadingSpinner from 'Components/LoadingSpinner';
import AddGoalForm from './form';

import type { SalesManagerType } from 'Types/SalesMetrics';

import './add-goal.scss';

type KeywordData = {
  id: string,
  keyword: string,
};

type Props = {
  domainId: string,
  keywords: KeywordData[],
  salesManager: SalesManagerType,

  refetch: Function,
  hideModal: Function,
  addGoal: Function,
};

type State = {
  inProgress: boolean,
};

class AddGoal extends Component<Props, State> {
  static defaultProps = {
    keywords: [],
  };

  state = {
    inProgress: false,
  };

  handleSubmit = ({ date, metric, note, value }) => {
    const { salesManager } = this.props;

    const input = {
      value,
      note,
      date: formatDate(date),
      metric: metric.value,
      salesManagerId: salesManager ? salesManager.id : undefined,
    };
    this.setState({ inProgress: true });

    this.props
      .addGoal({ variables: { input } })
      .then(goal => {
        this.setState({ inProgress: false });
        toast.success(t('Goal added.'));
        this.props.refetch();
        this.props.hideModal();
      }, throwNetworkError)
      .catch(error => {
        toast.error(t('There was an error creating the goal.'));
        this.setState({ inProgress: false });
        throw error;
      });
  };

  render() {
    const { salesManager } = this.props;
    const { inProgress } = this.state;

    const title = salesManager ? `${t('Add Goal for')} ${salesManager.name}` : t('Add goal');

    return (
      <ModalBorder className="add-note" title={title} onClose={this.props.hideModal}>
        <AddGoalForm
          initialValues={{ date: new Date() }}
          inProgress={inProgress}
          onCancel={this.props.hideModal}
          onSubmit={this.handleSubmit}
        />

        {inProgress ? <LoadingSpinner /> : null}
      </ModalBorder>
    );
  }
}

const addGoal = gql`
  mutation addGoal_addGoal($input: CreateAdminSalesMetricGoalInput!) {
    createAdminSalesMetricGoal(input: $input) {
      goal {
        id
      }
    }
  }
`;

export default compose(
  graphql(addGoal, { name: 'addGoal' }),
  connect(
    null,
    { hideModal },
  ),
)(AddGoal);
