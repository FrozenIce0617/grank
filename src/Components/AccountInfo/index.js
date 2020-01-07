// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { showModal } from 'Actions/ModalAction';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import Gravatar from 'react-gravatar';
import underdash from 'Utilities/underdash';
import SimpleItemsList from 'Components/Controls/Dropdowns/SimpleItemsList';
import { t } from 'Utilities/i18n/index';
import EditProfileIcon from 'icons/edit-profile.svg?inline';
import ChangePasswordIcon from 'icons/change-password.svg?inline';
import ShortcutIcon from 'icons/keyboard.svg?inline';
import SignOutIcon from 'icons/sign-out.svg?inline';
import ReleaseIcon from 'icons/release.svg?inline';
import ApiIcon from 'icons/menu/api.svg?inline';
import AffiliateIcon from 'icons/main-menu/affiliate.svg?inline';
import './account-info.scss';
import { noop } from 'lodash';
import { redirectToExternalUrl } from 'Utilities/underdash';
import cookie from 'react-cookies';
import { withRouter } from 'react-router-dom';

type Props = {
  userLogout: Function,
  showModal: Function,
  showSwitchVersion: boolean,
  promptForReason: boolean,
  user: Object,
};

class AccountInfo extends Component<Props> {
  getNavigationMenuItems() {
    const menuItems = [
      {
        label: t('Profile'),
        link: '/profile',
        icon: <EditProfileIcon className="device-icon" />,
      },
      {
        label: t('Change Password'),
        link: '/profile/password-change',
        icon: <ChangePasswordIcon className="device-icon" />,
      },
      {
        label: t('Shortcuts'),
        onSelect: this.handleShowShortcuts,
        icon: <ShortcutIcon className="device-icon" />,
      },
      {
        label: t('Releases'),
        link: '/releases',
        icon: <ReleaseIcon className="device-icon" />,
      },
      {
        label: t('Affiliate Program'),
        onSelect: this.handleAffiliate,
        icon: <AffiliateIcon className="device-icon" />,
      },
      {
        label: t('API docs'),
        link: '/api',
        icon: <ApiIcon className="device-icon" />,
      },
      {
        label: t('Sign Out'),
        onSelect: this.handleSignOut,
        icon: <SignOutIcon className="device-icon" />,
      },
    ];

    if (this.props.showSwitchVersion) {
      menuItems.push({
        label: t('Old AccuRanker'),
        onSelect: this.handleSwitchAccount,
        icon: <SignOutIcon className="device-icon" />,
      });
    }

    return menuItems;
  }

  handleSwitchAccount = () => {
    if (this.props.promptForReason) {
      this.props.showModal({
        modalType: 'OldInterfaceReason',
      });
    } else {
      cookie.save('accuranker_version_1', true, { path: '/' });
      redirectToExternalUrl('/user/version/1/');
    }
  };

  handleShowShortcuts = () => {
    this.props.showModal({
      modalType: 'Shortcuts',
      modalTheme: 'light',
    });
  };

  handleShowFeedback = () => {
    this.props.showModal({
      modalType: 'Feedback',
      modalTheme: 'light',
      modalProps: {
        isCommonFeedback: true,
      },
    });
  };

  handleAffiliate = () => {
    if (this.props.user.isAffiliate) {
      this.props.history.push('/affiliate/overview');
    } else {
      window.open('https://www.accuranker.com/affiliate', '_blank');
    }
  };

  handleSignOut = () => {
    const { userLogout } = this.props;
    userLogout().then(() => {
      // redirect user to login
      underdash.redirectToExternalUrl(`/user/login/?next=${window.location.pathname}`);
    });
    return false;
  };

  renderAccountInfoButton() {
    let gravatarImage = <Gravatar email="" default="mm" size={45} />;
    if (
      !underdash.graphqlError({ ...this.props }) &&
      !underdash.graphqlLoading({ ...this.props }) &&
      this.props.user
    ) {
      gravatarImage = <Gravatar email={this.props.user.email} default="mm" size={40} />;
    }
    const items = this.getNavigationMenuItems();
    return (
      <UncontrolledDropdown className="account-info-button simple-dropdown">
        <DropdownToggle caret className="account-info-button">
          <div className="dropdown-arrow">
            <span className="ico-wrapper">{gravatarImage}</span>
          </div>
        </DropdownToggle>
        <DropdownMenu flip={false} right>
          <SimpleItemsList
            items={items}
            labelFunc={item => item.label}
            linkFunc={item => item.link}
            onSelect={noop}
            iconFunc={item => item.icon}
          />
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }

  render() {
    return <div className="account-info-wrapper">{this.renderAccountInfoButton()}</div>;
  }
}

const signOutMutation = gql`
  mutation accountInfo_userLogout {
    userLogout {
      success
    }
  }
`;

const mapStateToProps = state => ({
  showSwitchVersion: new Date(state.user.organization.dateAdded) < new Date(2018, 4, 10),
  promptForReason: state.user.promptForSwitchReason,
  user: state.user,
});

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    { showModal },
  ),
  graphql(signOutMutation, {
    name: 'userLogout',
  }),
)(AccountInfo);
