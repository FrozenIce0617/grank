// @flow
import * as React from 'react';
import { compact } from 'lodash';

const themeConfig = {
  orange: {
    className: 'btn-brand-orange',
  },
  green: {
    // depricated use same styling as orange
    className: 'btn-brand-orange',
  },
  'orange-gradient': {
    className: 'btn-brand-orange-gradient',
  },
  grey: {
    className: 'btn-brand-grey',
  },
  red: {
    className: 'btn-red',
  },
  facebook: {
    className: 'btn-facebook',
  },
  google: {
    className: 'btn-google-plus',
  },
};

type Themes = 'orange-gradient' | 'orange' | 'green' | 'red' | 'grey' | 'facebook' | 'google';

type Tags = 'button';

type Props = {
  children: React.Node,
  theme: Themes,
  block: boolean,
  small: boolean,
  smallBlock: boolean,
  rounded: boolean,
  submit: boolean,
  reset: boolean,
  additionalClassName: string,
  onClick: Function,
  disabled?: boolean,
  tag: Tags,
};

class Button extends React.Component<Props> {
  static defaultProps = {
    theme: 'orange',
    block: false,
    small: false,
    smallBlock: false,
    rounded: false,
    submit: false,
    reset: false,
    additionalClassName: '',
    onClick: () => {},
    tag: 'button',
    disabled: false,
  };

  setColorClass(theme: Themes) {
    return themeConfig.hasOwnProperty(theme) ? themeConfig[theme].className : '';
  }

  setRoundedClass(rounded: boolean) {
    return rounded ? 'btn-rounded' : '';
  }

  setSizeClass(block: boolean, small: boolean, smallBlock: boolean) {
    return block ? 'btn-large' : small ? 'btn-small' : smallBlock ? 'btn-small-block' : '';
  }

  setAdditionalClassNames(theme: Themes, rounded: boolean, additionalClassName: string) {
    return additionalClassName;
  }

  setType(tag: Tags, submit: boolean, reset: boolean) {
    if (tag === 'button') {
      return { type: `${submit ? 'submit' : reset ? 'reset' : 'button'}` };
    }
    return null;
  }

  logWarnings(tag: Tags, submit: boolean, reset: boolean, block: boolean, small: boolean) {
    if (tag === 'button') {
      if (submit && reset) {
        // eslint-disable-next-line no-console
        console.warn(
          'Property submit and reset are both set on button, defaulting to submit. Please remove redundant property',
        );
      }
    }
    if (block && small) {
      // eslint-disable-next-line no-console
      console.warn(
        'Property block and small are both set on button, defaulting to block. Please remove redundant property',
      );
    }
  }

  createClassName(
    theme: Themes,
    rounded: boolean,
    additionalClassName: string,
    block: boolean,
    small: boolean,
    smallBlock: boolean,
  ) {
    const classNames = [];
    classNames.push(this.setColorClass(theme));
    classNames.push(this.setRoundedClass(rounded));
    classNames.push(this.setSizeClass(block, small, smallBlock));
    classNames.push(this.setAdditionalClassNames(theme, rounded, additionalClassName));
    return { className: `btn ${compact(classNames).join(' ')}` };
  }

  render() {
    const {
      tag,
      submit,
      reset,
      theme,
      rounded,
      additionalClassName,
      block,
      small,
      smallBlock,
      ...attributes
    } = this.props;
    this.logWarnings(tag, submit, reset, block, small);
    const ElementTag = tag;
    const className = this.createClassName(
      theme,
      rounded,
      additionalClassName,
      block,
      small,
      smallBlock,
    );
    const type = this.setType(tag, submit, reset);
    return (
      <ElementTag {...attributes} {...type} {...className}>
        {this.props.children}
      </ElementTag>
    );
  }
}

export default Button;
