// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import AddTagsForm from 'Components/Modal/Content/AddTags/AddTagsForm';
import toast from 'Components/Toast';
import './add-tags.scss';

type Props = {
  hideModal: Function,
  addLandingPageTags: Function,
  landingPages: Array<Object>,
};

type State = {
  inProgress: boolean,
};

class AddLandingPageTags extends Component<Props, State> {
  state = {
    inProgress: false,
  };

  handleSubmit = (values: any) => {
    const input = {
      landingPages: this.props.landingPages.map(lp => lp.id),
      tags: values.tags,
    };
    this.setState({ inProgress: true });
    this.props
      .addLandingPageTags({ variables: { input } })
      .then(
        () => {
          this.props.hideModal();
        },
        () => {
          toast.error(t('Failed to add tags'));
        },
      )
      .then(() => {
        this.setState({ inProgress: false });
      });
  };

  render() {
    const inProgress = this.state.inProgress;
    return (
      <ModalBorder className="add-tags" title={t('Add Tags')} onClose={this.props.hideModal}>
        <AddTagsForm
          initialValues={{ tags: [] }}
          inProgress={inProgress}
          onCancel={this.props.hideModal}
          onSubmit={this.handleSubmit}
        />
      </ModalBorder>
    );
  }
}

const addTagsQuery = gql`
  mutation addLandingPageTags_addLandingPageTags($input: AddLandingPageTagsInput!) {
    addLandingPageTags(input: $input) {
      landingPages {
        id
      }
    }
  }
`;

export default compose(
  graphql(addTagsQuery, { name: 'addLandingPageTags' }),
  connect(
    null,
    { hideModal },
  ),
)(AddLandingPageTags);
