// @flow
import React, { Component } from 'react';
import { Col, FormGroup } from 'reactstrap';
import { reduxForm } from 'redux-form';
import CopyIcon from 'icons/copy.svg?inline';
import Button from 'Components/Forms/Button';
import copy from 'copy-to-clipboard';
import toast from 'Components/Toast';
import { t, tct } from 'Utilities/i18n';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Skeleton from 'Components/Skeleton';

import './get-affiliate-link.scss';

type Props = {
  link: string,
  placement: string,
  campaign: string,

  onBack: Function,
  onClose: Function,
  loading: boolean,
  error: Object,
};

class GetAffiliateLink extends Component<Props, State> {
  linkInput: ?HTMLInputElement;
  urlInput: ?HTMLInputElement;

  handleBack = () => {
    const { onBack } = this.props;
    onBack();
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
          { type: 'button', options: { width: '15%', alignment: 'right' } },
        ]}
      />
    );
  }

  renderUrlInput = () => {
    return (
      <input
        value={this.props.initialValues.generatedUrl}
        disabled
        ref={ref => (this.urlInput = ref)}
      />
    );
  };

  handleUrlCopy = () => {
    const value = this.urlInput ? this.urlInput.value : '';
    copy(value);
    toast.success(t('URL copied to clipboard'));
  };

  renderLinkInput = () => {
    return (
      <input
        value={this.props.initialValues.generatedLink}
        disabled
        ref={ref => (this.linkInput = ref)}
      />
    );
  };

  handleLinkCopy = () => {
    const value = this.linkInput ? this.linkInput.value : '';
    copy(value);
    toast.success(t('Link copied to clipboard'));
  };

  render() {
    const { loading, error } = this.props;
    if (loading || error) {
      return this.renderSkeleton();
    }

    return (
      <form className="get-affiliate-link-form">
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <p>
              {t(
                'Your affiliate link has been generated. Use it to link to the AccuRanker website to track your referrals.',
              )}
            </p>

            <p>
              {tct(
                "You can track additional parameters such as 'campaign', 'placement' and 'unique'. Simply use the query parameters 'c', 'p', and 'u'. (e.g. '[link]&c=test-campaign&p=test-position&u=123')",
                {
                  link: this.props.initialValues.generatedUrl,
                },
              )}
            </p>
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <div className="form-label">{t('Affiliate URL')}</div>
            <div className="public-report-options__input-container">
              {this.renderUrlInput()}
              <span className="copy-button" onClick={this.handleUrlCopy}>
                <CopyIcon />
              </span>
            </div>
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <div className="form-label">{t('Affiliate Link')}</div>
            <div className="public-report-options__input-container">
              {this.renderLinkInput()}
              <span className="copy-button" onClick={this.handleLinkCopy}>
                <CopyIcon />
              </span>
            </div>
          </Col>
        </FormGroup>
        <FormGroup className="indented-form-group">
          <div className="confirmation-button-wrapper text-right">
            <Button reset onClick={this.handleBack} theme="grey">
              {t('Get another link')}
            </Button>
          </div>
        </FormGroup>
      </form>
    );
  }
}

const affiliateDetailsQuery = gql`
  query getAffiliateLink_details {
    affiliate {
      details {
        affiliateId
      }
    }
  }
`;

export default compose(
  graphql(affiliateDetailsQuery, {
    props: ({ ownProps, data: { loading, error, affiliate } }) => ({
      loading,
      error,
      initialValues: affiliate
        ? (() => {
            let generatedUrl = `${ownProps.link}?aaid=${affiliate.details.affiliateId}`;

            if (ownProps.placement) {
              generatedUrl = `${generatedUrl}&p=${ownProps.placement}`;
            }

            if (ownProps.campaign) {
              generatedUrl = `${generatedUrl}&c=${ownProps.campaign}`;
            }

            return {
              generatedUrl,
              generatedLink: `<a rel='nofollow' href="${generatedUrl}">AccuRanker</a>`,
            };
          })()
        : null,
    }),
  }),
)(
  reduxForm({
    form: 'GetAffiliateLink',
    enableReinitialize: true,
  })(GetAffiliateLink),
);
