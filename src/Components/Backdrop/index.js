// @flow
import * as React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Logo from 'icons/logo.svg';
import { connect } from 'react-redux';
import { showModal } from 'Actions/ModalAction';
import { withRouter } from 'react-router';
import { parse } from 'qs';
import ReactDOM from 'react-dom';
import './backdrop.scss';

type Props = {
  children: React.Element<any>,
  shown: boolean,
  showLogo: boolean,
  className: string,
  theme: 'light' | 'dark',
  location: Object,
  showModal: Function,
};

type State = {
  scrollElement: any,
};

class Backdrop extends React.Component<Props, State> {
  static defaultProps = {
    showLogo: true,
    theme: 'dark',
  };

  state = {
    scrollElement: null,
  };

  componentDidMount() {
    this.handleQueryAndModal();
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.search && this.props.location.search !== prevProps.location.search)
      this.handleQueryAndModal();
  }

  setScrollContainer = ref => {
    // eslint-disable-next-line
    const element = ReactDOM.findDOMNode(ref);
    this.setState({
      scrollElement: element,
    });
  };

  setBodyClass() {
    if (document.body) {
      document.body.classList.toggle('no-scroll', this.props.shown);
    }
  }

  handleQueryAndModal() {
    const {
      location: { search },
    } = this.props;
    const qs = parse(search.substr(1));
    if (!qs.hasOwnProperty('m')) return;
    const modalProps = qs.hasOwnProperty('p') ? JSON.parse(qs.p) : {};
    this.props.showModal({
      modalType: qs.m,
      modalTheme: 'light',
      modalProps,
    });
  }

  renderContent() {
    if (!this.props.shown) return null;
    return (
      <div
        key="overlay-backdrop"
        ref={this.setScrollContainer}
        className={`overlay-backdrop ${this.props.theme}`}
      >
        {this.props.showLogo && (
          <div className="logo">
            <a href="https://app.accuranker.com/" target="_blank" rel="noopener noreferrer">
              <img src={Logo} alt={'AccuRanker'} />
            </a>
          </div>
        )}
        {this.state.scrollElement && (
          <div className="overlay-content">
            {React.cloneElement(this.props.children, { scrollElement: this.state.scrollElement })}
          </div>
        )}
      </div>
    );
  }
  render() {
    this.setBodyClass();
    if (this.props.theme === 'dark') {
      return (
        <ReactCSSTransitionGroup
          transitionName="fade"
          transitionAppear={true}
          transitionLeave={true}
          transitionEnterTimeout={200}
          transitionAppearTimeout={200}
          transitionLeaveTimeout={200}
          component="div"
          className={this.props.className}
        >
          {this.renderContent()}
        </ReactCSSTransitionGroup>
      );
    } else if (this.props.theme === 'light') {
      return (
        <ReactCSSTransitionGroup
          transitionName="popup"
          transitionEnterTimeout={300}
          transitionLeaveTimeout={200}
          component="div"
          className={this.props.className}
        >
          {this.renderContent()}
        </ReactCSSTransitionGroup>
      );
    }
  }
}

export default withRouter(
  connect(
    null,
    { showModal },
  )(Backdrop),
);
