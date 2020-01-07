// @flow
import React, { Component } from 'react';
import Button from 'Components/Forms/Button';
import { connect } from 'react-redux';
import { Navbar } from 'reactstrap';
import MessagesDropdown from 'Components/MessagesDropdown';
import Status from 'Components/Status';
import AccountInfo from 'Components/AccountInfo';
import LinkedAccountsDropdown from 'Components/LinkedAccountsDropdown';
import ImpersonateDropdown from 'Components/ImpersonateDropdown';
import QuickNavigation from 'Components/QuickNavigation';
import { t } from 'Utilities/i18n/index';
import MeetingIcon from 'icons/calendar.svg?inline';
import './top-navbar.scss';
import BlackFridayImage from 'icons/black-friday-horizontal.png';

type Props = {
  showHubspot: boolean,
  user: Object,
};

type State = {
  fakeLoading: boolean,
  beginX: number,
};

class TopNavbar extends Component<Props, State> {
  state = {
    fakeLoading: false,
    beginX: 0,
  };

  render() {
    const { user } = this.props;
    const isBlackFriday =
      new Date() >= new Date('2018-11-09') &&
      new Date() < new Date('2018-11-27') &&
      user.organization.activePlan &&
      user.organization.activePlan.originPlan &&
      !user.organization.activePlan.isTrial &&
      [
        'da6de4cd-89f3-45bc-b42f-5fa2e3fbdc87',
        'e539981c-ccf9-44a2-86df-7014bef09197',
        'a5beefbb-7140-404c-b6b4-e37ba11d3084',
        'f0ab02d5-9d5f-48d1-87b5-4845159f0760',
        '66a961bb-db7d-4a45-a359-edd9e4186529',
        '33c42b0c-b316-4990-8d54-6dd954f7e4be',
        '5c5dbb84-e529-48dc-83c8-67e2b49bf70f',
        '96cda3c3-c9ad-44cc-b468-8dc6518fee73',
      ].includes(user.organization.activePlan.originPlan.id) &&
      new Date(user.organization.dateAdded) < new Date('2018-11-09');

    const showHubspot =
      this.props.showHubspot &&
      user.organization &&
      user.organization.salesManager &&
      user.organization.salesManager.meetingLink;

    return (
      <Navbar className="main-navbar">
        {isBlackFriday && (
          <a href="/app/black-friday" className="black-friday">
            <img src={BlackFridayImage} />
          </a>
        )}

        {showHubspot && (
          <a href={user.organization.salesManager.meetingLink} target="_blank">
            <Button theme="orange-gradient">
              <MeetingIcon />
              <span>{t('Book a demo')}</span>
            </Button>
          </a>
        )}

        <div className="spacer" />
        <ImpersonateDropdown />
        <LinkedAccountsDropdown />
        <QuickNavigation />
        {/* <SearchInput dark /> */}
        <Status />
        <MessagesDropdown />
        <AccountInfo />
      </Navbar>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
});

export default connect(mapStateToProps)(TopNavbar);
