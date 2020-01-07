// @flow
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Progress } from 'reactstrap';
import Button from 'Components/Forms/Button';
import gql from 'graphql-tag';
import { t } from 'Utilities/i18n';
import './save-google-account.scss';

type Props = {
  oAuthResult: Object,
  addGoogleAccount: Function,
  onSubmit: Function,
  onCancel: Function,
};

type State = {
  loading: boolean,
  error: string,
};

class SaveGoogleAccount extends React.Component<Props, State> {
  state = {
    error: '',
    loading: false,
  };

  UNSAFE_componentWillMount() {
    const oAuthResult = this.props.oAuthResult;
    const oAuthData = JSON.parse(sessionStorage.getItem('oAuthData') || '{}');
    if (oAuthResult.error) {
      this.setState({
        error: oAuthResult.error,
      });
      return;
    }
    if (oAuthData.state !== oAuthResult.state) {
      // error potential attack
      this.setState({
        error: t('Failed to verify state'),
      });
      return;
    }
    this.setState({
      loading: true,
    });
    const input = {
      code: oAuthResult.code,
      description: oAuthData.description,
      redirectUri: oAuthData.redirectUri,
      type: oAuthData.type,
    };
    this.props.addGoogleAccount({ variables: { input } }).then(
      ({ data: { addGoogleConnection } }) => {
        this.setState({
          loading: false,
        });
        this.props.onSubmit({ connectionId: addGoogleConnection.connection.id });
      },
      () => {
        this.props.onCancel();
        this.setState({
          error: t('Failed to save OAuth token'),
          loading: false,
        });
      },
    );
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
            {t('Back')}
          </Button>
        </div>
      );
    }
    return <div className="save-google-account">{content}</div>;
  }
}

const addGoogleAccountQuery = gql`
  mutation saveGoogleAccount_addGoogleConnection($input: AddGoogleConnectionInput!) {
    addGoogleConnection(input: $input) {
      connection {
        id
      }
    }
  }
`;

export default compose(graphql(addGoogleAccountQuery, { name: 'addGoogleAccount' }))(
  SaveGoogleAccount,
);
