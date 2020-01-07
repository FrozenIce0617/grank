// @flow
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Progress } from 'reactstrap';
import Button from 'Components/Forms/Button';
import { t } from 'Utilities/i18n';

type Props = {
  addGoogleAnalyticsAccount: Function,
  onSubmit: Function,
  onCancel: Function,
  connectionId: string,
  accountId: string,
  propertyId: string,
  profileId: string,
  domainId: string,
};

type State = {
  loading: boolean,
  error: string,
};

class AddGAAccount extends React.Component<Props, State> {
  state = {
    error: '',
    loading: false,
  };

  UNSAFE_componentWillMount() {
    this.setState({ loading: true });
    const addGoogleAnalyticsAccountInput = {
      domainId: this.props.domainId,
      connectionId: this.props.connectionId,
      gaAccountId: this.props.accountId,
      gaPropertyId: this.props.propertyId,
      gaProfileId: this.props.profileId,
    };
    this.props
      .addGoogleAnalyticsAccount({ variables: { addGoogleAnalyticsAccountInput } })
      .then(
        ({
          data: {
            addGoogleAnalyticsAccount: { domain: domainObj },
          },
        }) => {
          this.props.onSubmit(domainObj);
        },
        () => {
          this.setState({
            error: t('Failed to connect to Google Analytics'),
          });
        },
      )
      .then(() => {
        this.setState({ loading: false });
      });
  }

  render() {
    const { loading, error } = this.state;
    let content = null;
    if (loading) {
      content = <Progress animated value={100} />;
    }
    if (error) {
      content = (
        <div>
          <p>{error}</p>
          <Button theme="orange" onClick={this.props.onCancel}>
            {t('Close')}
          </Button>
        </div>
      );
    }
    return <div className="save-google-account">{content}</div>;
  }
}

const addGoogleAnalyticsAccount = gql`
  mutation addGAAccount_addGoogleAnalyticsAccount(
    $addGoogleAnalyticsAccountInput: AddGoogleAnalyticsAccountInput!
  ) {
    addGoogleAnalyticsAccount(input: $addGoogleAnalyticsAccountInput) {
      domain {
        id
      }
    }
  }
`;

export default compose(graphql(addGoogleAnalyticsAccount, { name: 'addGoogleAnalyticsAccount' }))(
  AddGAAccount,
);
