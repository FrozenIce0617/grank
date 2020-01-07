// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import { t } from 'Utilities/i18n';
import Spinner from 'Components/Spinner';
import IconButton from 'Components/IconButton';
import RefreshIcon from 'icons/refresh.svg?inline';
import LocaleSelector from 'Selectors/LocaleSelector';
import toast from 'Components/Toast';
import { showModal } from 'Actions/ModalAction';
import './refresh-keywords.scss';

type Props = {
  lastManualRefreshAt: Date,
  refreshKeywords: Function,
  domainId: string,
  canRefresh: boolean,
  keywordRefreshDisabled: boolean,
  fullLocale: string,
  showModal: Function,
};

type State = {
  refreshInProgress: boolean,
};

class RefreshKeywords extends Component<Props, State> {
  state = {
    refreshInProgress: false,
  };

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.lastManualRefreshAt) {
      // if lastManualRefreshAt has year 1970 then its null
      const lastManualRefreshAt = moment(nextProps.lastManualRefreshAt);

      if (lastManualRefreshAt.year() <= 1970) {
        this.setState({ refreshInProgress: true });
      } else if (nextProps.lastManualRefreshAt !== this.props.lastManualRefreshAt) {
        this.setState({ refreshInProgress: false });
      }
    } else {
      this.setState({ refreshInProgress: true });
    }
  }

  handleRefresh = () => {
    const { keywordRefreshDisabled } = this.props;
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

    this.setState({ refreshInProgress: true });
    this.props
      .refreshKeywords({
        variables: {
          domainId: this.props.domainId,
        },
      })
      .then(
        data => {
          if (data.data.scrapeDomain.queued) {
            this.setState({ refreshInProgress: true });
          } else {
            toast.error(data.data.scrapeDomain.reason);
            this.setState({ refreshInProgress: false });
          }
        },
        () => {
          this.setState({ refreshInProgress: false });
        },
      );
  };

  renderUpdateButton() {
    if (this.props.domainId) {
      const { canRefresh } = this.props;
      const now = moment(Date.now()).locale(this.props.fullLocale || 'en');
      const oldDate = moment(this.props.lastManualRefreshAt).locale(this.props.fullLocale || 'en');
      const MINUTES_IN_TWO_HOURS = 120;
      const diff = MINUTES_IN_TWO_HOURS - moment.duration(now.diff(oldDate)).asMinutes();
      const tooltip =
        canRefresh || diff <= 0
          ? t('Refresh all keywords now')
          : t('Next refresh available in %s minutes', Math.ceil(diff));

      return (
        <IconButton
          onClick={this.handleRefresh}
          brand="orange"
          tooltip={tooltip}
          showTooltip={true}
          icon={<RefreshIcon />}
          disabled={!canRefresh}
        />
      );
    }
  }

  render() {
    const lastManualRefreshAt = moment(this.props.lastManualRefreshAt);

    // if lastManualRefreshAt has year 1970 then its null
    if (this.state.refreshInProgress || lastManualRefreshAt.year() <= 1970) {
      return (
        <span className="refresh-keywords">
          {t('Refreshing data')}
          <Spinner />
        </span>
      );
    } else if (this.props.lastManualRefreshAt) {
      return <span className="refresh-keywords">{this.renderUpdateButton()}</span>;
    }
    return null;
  }
}

const mapStateToProps = state => ({
  fullLocale: LocaleSelector(state),
  keywordRefreshDisabled: state.user.organization.errors.keywordRefreshDisabled,
});

const refreshKeywordsQuery = gql`
  mutation refreshKeywords_refreshKeywords($domainId: ID!) {
    scrapeDomain(input: { id: $domainId }) {
      domain {
        id
      }
      queued
      reason
    }
  }
`;

export default compose(
  connect(
    mapStateToProps,
    {
      showModal,
    },
  ),
  graphql(refreshKeywordsQuery, { name: 'refreshKeywords' }),
)(RefreshKeywords);
