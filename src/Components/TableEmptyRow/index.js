// @flow
import React, { Component } from 'react';
import './table-empty-row.scss';
import Button from 'Components/Forms/Button';

type Props = {
  title?: string,
  subTitle?: string,
  onBtnClick?: Function,
  btnTitle?: string,
  onSubBtnClick?: Function,
  subBtnTitle?: string,
};
class TableEmptyRow extends Component<Props> {
  render() {
    return (
      <tr>
        <td colSpan={'100%'}>
          <div className="table-empty-row text-center p-5">
            <span className="title">{this.props.title}</span>
            <br />
            <span className="sub-title">{this.props.subTitle}</span>
            <br />
            {this.props.onBtnClick && (
              <Button theme="orange" onClick={this.props.onBtnClick}>
                {this.props.btnTitle}
              </Button>
            )}

            {this.props.onSubBtnClick && (
              <p>
                <span className="sub-btn" onClick={this.props.onSubBtnClick}>
                  {this.props.subBtnTitle}
                </span>
              </p>
            )}
          </div>
        </td>
      </tr>
    );
  }
}

export default TableEmptyRow;
