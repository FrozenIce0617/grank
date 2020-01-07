// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { t } from 'Utilities/i18n';

// actions
import { showModal, hideModal } from 'Actions/ModalAction';

// components
import Wizard from 'Components/Modal/Wizard';

// steps
import EnterLink from './EnterLink';
import GetAffiliateLink from './GetAffiliateLink';

export const STEPS = {
  ENTER_LINK: 'enterLink',
  GET_AFFILIATE_LINK: 'getAffiliateLink',
};

type Props = {
  // automatic
  showModal: Function,
  hideModal: Function,
};

class CreateAffiliateLink extends Component<Props> {
  render() {
    return (
      <Wizard
        className="create-affiliate-link"
        defaultStep={STEPS.ENTER_LINK}
        steps={{
          [STEPS.ENTER_LINK]: {
            title: t('Create affiliate link'),
            component: ({ stepTo }) => (
              <EnterLink onSubmit={data => stepTo(STEPS.GET_AFFILIATE_LINK, data)} />
            ),
          },
          [STEPS.GET_AFFILIATE_LINK]: {
            title: t('Get affiliate link'),
            component: ({
              stepTo,
              data: {
                [STEPS.ENTER_LINK]: { link, placement, campaign },
              },
            }) => (
              <GetAffiliateLink
                link={link}
                campaign={campaign}
                placement={placement}
                onBack={() => stepTo(STEPS.ENTER_LINK)}
              />
            ),
          },
        }}
      />
    );
  }
}

export default connect(
  null,
  { showModal, hideModal },
)(CreateAffiliateLink);
