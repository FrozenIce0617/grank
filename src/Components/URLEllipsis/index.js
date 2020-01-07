/* eslint-disable react/no-did-mount-set-state */
// @flow
import React, { Component } from 'react';
import { forEachRight } from 'lodash';

type Props = {
  // Max length of the text (used as fallback)
  maxLength: number,
  // Max width of the text
  maxWidth: number,
  // Passed url
  url: string,
};

type State = {
  font: string | null,
};

export default class URLEllipsis extends Component<Props, State> {
  canvas: Object;
  urlText: Object;
  hellipWidth: number;

  static defaultProps = {
    maxLength: 20,
  };

  state = {
    font: null,
  };

  componentDidMount() {
    if (!this.urlText) {
      return;
    }
    const { maxWidth } = this.props;
    const style = getComputedStyle(this.urlText);

    if (maxWidth != null) {
      this.setState({
        font: `${style.getPropertyValue('font-weight')} ${style.getPropertyValue(
          'font-size',
        )} ${style.getPropertyValue('font-family')}`,
      });
    }
  }

  getHellipWidth(font: string) {
    if (!this.hellipWidth) {
      // use canvas(most performant way) to determine width of the rendered text
      const canvas = this.canvas || (this.canvas = document.createElement('canvas'));
      const context = canvas.getContext('2d');
      context.font = font;
      const metrics = context.measureText('\u2026');
      this.hellipWidth = metrics.width;
    }

    return this.hellipWidth;
  }

  getTextWidth(text: string, font: string) {
    // use canvas(most performant way) to determine width of the rendered text
    const canvas = this.canvas || (this.canvas = document.createElement('canvas'));
    const context = canvas.getContext('2d');
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  }

  getStringByWidth = (url: string, font: string, maxWidth: number) => {
    let resultStr = '';
    forEachRight(url, (str, idx) => {
      const newResultStr = `${str}${resultStr}`;
      const width = this.getTextWidth(newResultStr, font);

      if (width > maxWidth - this.getHellipWidth() && idx !== url.length - 1) {
        return false;
      }

      resultStr = newResultStr;
    });

    return resultStr;
  };

  getStringByLength = (url: string, maxLength: number) => {
    const urlResultArr = [];
    const urlSplit = url.split('/');
    let strLen = 0;
    forEachRight(urlSplit, (str, idx) => {
      strLen += str.length + 1;
      if (strLen > maxLength && idx !== urlSplit.length - 1) {
        return false;
      }

      urlResultArr.push(str);
    });

    return `${urlSplit.length !== urlResultArr.length ? '/' : ''}${urlResultArr.join('/')}`;
  };

  urlTextRef = (ref: Object | null) => {
    if (ref) {
      this.urlText = ref;
    }
  };

  render() {
    const { maxLength, maxWidth, url } = this.props;
    if (!url) {
      return <span>-</span>;
    }

    const { font } = this.state;
    const newUrl = font
      ? this.getStringByWidth(url, font, maxWidth)
      : this.getStringByLength(url, maxLength);
    const hellip = newUrl !== url ? '\u2026' : '';
    return (
      <span ref={this.urlTextRef}>
        {hellip}
        {newUrl}
      </span>
    );
  }
}
