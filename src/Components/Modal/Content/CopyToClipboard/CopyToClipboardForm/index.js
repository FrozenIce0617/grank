// @flow
import React, { Component } from 'react';
import { FormGroup } from 'reactstrap';
import { t, tct } from 'Utilities/i18n';
import { TextAreaField } from 'Components/Forms/Fields';
import Button from 'Components/Forms/Button';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import Skeleton from 'Components/Skeleton';
import { isMac, copyToClipboard } from 'Utilities/underdash';
import Mousetrap from 'Utilities/mousetrap';

import './copy-to-clipboard-form.scss';
import connect from 'react-redux/es/connect/connect';

type Props = {
  hideModal: Function,
  value: string | Promise<string>,
  confirmButtonLabel?: string,
  initialize: Function,
  textAreaValue: string,
};

type State = {
  isLoading: boolean,
};

const copyShortcut = isMac() ? 'command+c' : 'ctrl+c';
const formName = 'CopyToClipboardForm';

class CopyToClipboardForm extends Component<Props, State> {
  _mounted = false;
  _textareaRef = React.createRef();

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
    };

    Promise.resolve(props.value).then(value => {
      const newState = {
        isLoading: false,
      };
      if (this._mounted) {
        this.setState(newState);
        this.props.initialize({ copyToClipboard: value });
      } else {
        this.state = newState;
      }
    });
  }

  componentDidMount() {
    this._mounted = true;

    Mousetrap.bind(copyShortcut, 'Copy to clipboard', this.handleCopy);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.textAreaValue !== this.props.textAreaValue && prevProps.textAreaValue == null) {
      setTimeout(() => {
        if (this._textareaRef.current !== null) {
          this._textareaRef.current.focus();
          this._textareaRef.current.select();
        }
      });
    }
  }

  componentWillUmount() {
    this._mounted = false;

    Mousetrap.unbind([copyShortcut]);
  }

  handleCopy = () => {
    copyToClipboard(this.props.textAreaValue);
    this.props.hideModal();
  };

  renderSkeleton() {
    return (
      <Skeleton
        linesConfig={[
          { type: 'text', options: { width: '60%' } },
          { type: 'input', options: { flex: '1', height: '200px' } },
          { type: 'button', options: { width: '15%', alignment: 'right' } },
        ]}
      />
    );
  }

  formatKeys = keys => {
    const parts = keys.split(/(\+| )/);
    return parts.map((key, idx) => {
      if (key === ' ' || key === '+') {
        return key;
      }
      return <kbd key={`${key}-${idx}`}>{key}</kbd>;
    });
  };

  render() {
    const { confirmButtonLabel } = this.props;
    const { isLoading } = this.state;
    if (isLoading) {
      return this.renderSkeleton();
    }

    return (
      <form className="copy-to-clipboard-form">
        <span className="title">
          {tct('Press [shortcut] to copy to clipboard or just click on "[confirm]" button', {
            shortcut: <span className="shortcut">{this.formatKeys(copyShortcut)}</span>,
            confirm: confirmButtonLabel,
          })}
        </span>
        <FormGroup className="indented-form-group">
          <Field getRef={this._textareaRef} component={TextAreaField} name="copyToClipboard" />
        </FormGroup>
        <FormGroup className="indented-form-group mb-0">
          <hr />
          <div className="confirmation-button-wrapper text-right">
            <Button theme="orange" onClick={this.handleCopy}>
              {confirmButtonLabel || t('Copy')}
            </Button>
          </div>
        </FormGroup>
      </form>
    );
  }
}

const selector = formValueSelector(formName);
const mapStateToProps = state => ({
  textAreaValue: selector(state, 'copyToClipboard'),
});

export default connect(
  mapStateToProps,
  null,
)(reduxForm({ form: formName })(CopyToClipboardForm));
