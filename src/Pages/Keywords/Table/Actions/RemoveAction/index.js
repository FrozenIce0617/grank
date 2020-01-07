// @flow
import * as React from 'react';
import { showModal } from 'Actions/ModalAction';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { RemoveAction as DeleteActionView } from 'Pages/Layout/ActionsMenu/Actions';
import { t, tn } from 'Utilities/i18n/index';

type KeywordData = {
  id: string,
  keyword: string,
};

type Props = {
  keywords: KeywordData[],
  deleteKeywords: Function,
  showModal: Function,
};

class DeleteAction extends React.Component<Props> {
  handleDeleteAction = () => {
    const keywords = this.props.keywords;
    this.props.showModal({
      modalType: 'Confirmation',
      modalProps: {
        title: tn('Delete Keyword?', 'Delete Keywords?', keywords.length),
        description: tn(
          'The keyword will be permanently deleted.',
          'The keywords will be permanently deleted.',
          this.props.keywords.length,
        ),
        confirmLabel: tn('Delete keyword', 'Delete keywords', keywords.length),
        cancelLabel: t('Cancel'),
        action: () => {
          this.props.deleteKeywords({
            variables: {
              keywords: this.props.keywords.map(keywordData => keywordData.id),
            },
          });
        },
      },
    });
  };

  render() {
    return <DeleteActionView onClick={this.handleDeleteAction} />;
  }
}

const deleteKeywordsQuery = gql`
  mutation deleteAction_deleteKeywords($keywords: [ID]!) {
    updateKeywords(
      input: {
        keywords: $keywords
        starred: false
        ignoreLocalResults: false
        ignoreFeaturedSnippet: false
        ignoreInShareOfVoice: false
        delete: true
      }
    ) {
      keywords {
        id
      }
    }
  }
`;

export default compose(
  connect(
    null,
    { showModal },
  ),
  graphql(deleteKeywordsQuery, { name: 'deleteKeywords' }),
)(DeleteAction);
