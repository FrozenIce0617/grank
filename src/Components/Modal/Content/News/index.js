// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { hideModal } from 'Actions/ModalAction';
import { updateNews } from 'Actions/UserAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { throwNetworkError } from 'Utilities/errors';
import Button from 'Components/Forms/Button';
import { t } from 'Utilities/i18n';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo/index';

type Props = {
  hideModal: Function,
  news: Object,
  readNews: Function,
  updateNews: Function,
  onConfirm: Function,
};

type State = {
  lockDuration: number,
  isLoading: boolean,
};

class News extends Component<Props, State> {
  timerId: IntervalID;

  state = {
    lockDuration: 3,
    isLoading: false,
  };

  UNSAFE_componentWillMount() {
    this.timerId = setInterval(this.handleTimer, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerId);
  }

  handleConfirm = () => {
    const { news, onConfirm } = this.props;
    this.setState({ isLoading: true });
    this.props
      .readNews({ variables: { input: { id: news.id } } })
      .then(({ data: { newsRead: { news: newNews } } }) => {
        this.props.updateNews(newNews);
        this.props.hideModal();
      }, throwNetworkError)
      .then(() => {
        this.setState({ isLoading: false });
      });
    onConfirm && onConfirm();
  };

  handleTimer = () => {
    let newDuration = this.state.lockDuration - 1;
    if (newDuration <= 0) {
      newDuration = 0;
      clearInterval(this.timerId);
    }
    this.setState({
      lockDuration: newDuration,
    });
  };

  handleClose = () => {
    this.handleConfirm();
  };

  render() {
    const { news } = this.props;
    const { lockDuration, isLoading } = this.state;

    let confirmLabel = t('OK');
    let confirmEnabled = true;
    let handleClose = this.handleClose;
    if (lockDuration > 0) {
      confirmLabel = t('Unlocking in %s sec', lockDuration);
      confirmEnabled = false;
      handleClose = null;
    }
    return (
      <ModalBorder className="news" onClose={handleClose}>
        <ReactMarkdown source={news.body} className="markdown" />
        <div className="confirmation-button-wrapper text-right">
          <Button
            theme="orange"
            onClick={this.handleConfirm}
            disabled={!confirmEnabled || isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </ModalBorder>
    );
  }
}

const readNewsQuery = gql`
  mutation news_readNews($input: NewsReadInput!) {
    newsRead(input: $input) {
      news {
        id
        read
      }
    }
  }
`;

export default compose(
  connect(
    null,
    { hideModal, updateNews },
  ),
  graphql(readNewsQuery, { name: 'readNews' }),
)(News);
