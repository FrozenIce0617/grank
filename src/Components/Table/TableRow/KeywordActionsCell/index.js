// @flow
import React, { Component } from 'react';
import Icon from 'Pages/Keywords/Table/Icon';
import { merge } from 'lodash';
import RefreshIcon from 'icons/refresh.svg?inline';
import { t } from 'Utilities/i18n/index';
import { compose, graphql } from 'react-apollo';
import Toast from 'Components/Toast';
import gql from 'graphql-tag';
import { SearchIcon } from 'Pages/Keywords/Table/Icon/Icons';
import { showModal } from 'Actions/ModalAction';
import { connect } from 'react-redux';
import './keyword-actions-cell.scss';

type Props = {
  keywordData: Object,
  scrapeKeywords: Function,
  optimisticUpdate: Function,
  showModal: Function,
  keywordRefreshDisabled: boolean,
};

type State = {
  refreshInProgress: boolean,
};

class KeywordActionsCell extends Component<Props, State> {
  state = {
    refreshInProgress: false,
  };

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.keywordsData !== this.props.keywordsData || nextState !== this.state;
  }

  handleRefresh = () => {
    const { keywordData, optimisticUpdate, keywordRefreshDisabled } = this.props;
    if (keywordRefreshDisabled) {
      this.props.showModal({
        modalType: 'Confirmation',
        modalProps: {
          title: t('Degraded Performance'),
          lockDuration: 0,
          description: (
            <div style={{ textAlign: 'left' }}>
              <p>{t('Dear Customer')}</p>
              <p>
                {t(
                  'Due to degraded performance, manual keyword refresh has been temporarily disabled.',
                )}
                <br />
                {t('Your keywords will still get automatically updated daily.')}
              </p>
              <p>{t('We apologize for any inconvenience caused by this.')}</p>
            </div>
          ),
          showCancelLabel: false,
          confirmLabel: t('OK'),
        },
      });
      return;
    }

    if (this.state.refreshInProgress || (keywordData.rank && keywordData.rank.rank === -1)) return;
    this.setState({ refreshInProgress: true });

    const onRealUpdate = optimisticUpdate({
      ids: [this.props.keywordData.id],
      item: {
        rank: {
          rank: -1,
        },
      },
      merger: merge,
      isExcluded: false,
    });

    this.props
      .scrapeKeywords({
        variables: {
          input: {
            keywords: [this.props.keywordData.id],
            scrape: true,
          },
        },
      })
      .then(() => {
        Toast.success(t('The keyword has been added to the queue.'));
      })
      .catch(() => {
        onRealUpdate();
        Toast.success(t('Could not refresh keyword'));
      });
  };

  render() {
    const { refreshInProgress } = this.state;
    const { keywordData } = this.props;

    return (
      <div className="flex-row keyword-actions-cell">
        <Icon
          key="serp-icon"
          icon={SearchIcon}
          onClick={() => {
            window.open(keywordData.latestSerpHistoryUrl);
          }}
          tooltip={t('Show latest SERP result')}
        />

        <div
          className={
            refreshInProgress || (keywordData.rank && keywordData.rank.rank === -1)
              ? 'refreshing'
              : ''
          }
        >
          <Icon
            key="keyword-actions-cell"
            icon={RefreshIcon}
            onClick={this.handleRefresh}
            tooltip={
              refreshInProgress || (keywordData.rank && keywordData.rank.rank === -1)
                ? t('This keyword is currently being refreshed.')
                : t('Refresh this keyword')
            }
          />
        </div>
      </div>
    );
  }
}

const scrapeKeywordsQuery = gql`
  mutation keywordActionsCell_updateKeywords($input: UpdateKeywordsInput!) {
    updateKeywords(input: $input) {
      task {
        id
      }
    }
  }
`;

const mapStateToProps = state => ({
  keywordRefreshDisabled: state.user.organization.errors.keywordRefreshDisabled,
});

export default compose(
  connect(
    mapStateToProps,
    {
      showModal,
    },
  ),
  graphql(scrapeKeywordsQuery, { name: 'scrapeKeywords' }),
)(KeywordActionsCell);
