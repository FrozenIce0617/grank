// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import AddNoteForm from './AddNoteForm';
import toast from 'Components/Toast';
import './add-note.scss';
import type { FilterBase } from 'Types/Filter';
import { isEmpty } from 'lodash';
import { formatDate } from 'Utilities/format';

type KeywordData = {
  id: string,
  keyword: string,
};

type Props = {
  hideModal: Function,
  addNote: Function,
  domainId: string,
  keywords: KeywordData[],
  shouldExclude: boolean,
  filters: FilterBase[],
  refresh: Function,
  enableAddingKeywords: boolean,
};

type State = {
  inProgress: boolean,
};

class AddNote extends Component<Props, State> {
  static defaultProps = {
    keywords: [],
  };

  state = {
    inProgress: false,
  };

  getIds = keywords => keywords.map(keywordData => keywordData.id);

  getKeywordsInput = (ids, exclude) => {
    const { keywords, shouldExclude } = this.props;
    ids = ids || this.getIds(keywords);
    exclude = exclude || shouldExclude;
    if (isEmpty(ids) && !exclude) {
      return {};
    }

    return {
      keywordsToExclude: exclude ? ids : [],
      keywords: !exclude ? ids : [],
    };
  };

  handleSubmit = (values: any) => {
    this.setState({ inProgress: true });
    this.props
      .addNote({
        variables: {
          input: {
            ...this.getKeywordsInput(
              values.keywords.map(({ value }) => value),
              values.forAllKeywords,
            ),
            note: values.note,
            createdAt: formatDate(values.createdAt),
            domain: this.props.domainId,
          },
        },
      })
      .then(
        () => {
          toast.success(t('Updated'));
          this.props.refresh();
        },
        () => {
          toast.error(t('Failed to add note'));
        },
      )
      .then(() => {
        this.setState({ inProgress: false });
        this.props.hideModal();
      });
  };

  render() {
    const { inProgress } = this.state;
    const { keywords, shouldExclude, enableAddingKeywords } = this.props;
    return (
      <ModalBorder className="add-note" title={t('Add Note')} onClose={this.props.hideModal}>
        <AddNoteForm
          keywords={keywords}
          shouldExclude={shouldExclude}
          initialValues={{ note: '', createdAt: new Date() }}
          inProgress={inProgress}
          onCancel={this.props.hideModal}
          onSubmit={this.handleSubmit}
          enableAddingKeywords={enableAddingKeywords}
        />
      </ModalBorder>
    );
  }
}

const addNoteQuery = gql`
  mutation addNote_addNote($input: AddNoteInput!) {
    addNote(input: $input) {
      note {
        id
      }
    }
  }
`;

const mapStateToProps = state => ({
  filters: state.filter.filterGroup.filters,
});

export default compose(
  graphql(addNoteQuery, { name: 'addNote' }),
  connect(
    mapStateToProps,
    { hideModal },
  ),
)(AddNote);
