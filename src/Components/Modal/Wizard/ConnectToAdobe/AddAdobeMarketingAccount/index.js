// @flow
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Progress } from 'reactstrap';
import Button from 'Components/Forms/Button';
import { t } from 'Utilities/i18n';
import toast from 'Components/Toast';

type Props = {
  addAdobeAccount: Function,
  onSubmit: Function,
  onCancel: Function,
  connectionId: string,
  suiteId: string,
  domainId: string,
};

type State = {
  loading: boolean,
  error: string,
};

class AddAdobeAccount extends React.Component<Props, State> {
  state = {
    error: '',
    loading: false,
  };

  UNSAFE_componentWillMount() {
    const { domainId, connectionId, suiteId } = this.props;
    this.setState({ loading: true });
    this.props
      .addAdobeAccount({
        variables: {
          input: {
            domainId,
            connectionId,
            suiteId,
          },
        },
      })
      .then(
        ({
          data: {
            addAdobeMarketingAccount: { domain: domainObj },
          },
        }) => {
          toast.success(t('Account connected'));
          this.props.onSubmit(domainObj);
        },
        () => {
          this.setState({
            error: t('Failed to connect to Adobe Analytics'),
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
    return <div className="add-adobe-account">{content}</div>;
  }
}

const addAdobeAccount = gql`
  mutation addAdobeAccount_addAdobeAccount($input: AddAdobeMarketingAccountInput!) {
    addAdobeMarketingAccount(input: $input) {
      domain {
        id
      }
    }
  }
`;

export default compose(graphql(addAdobeAccount, { name: 'addAdobeAccount' }))(AddAdobeAccount);
