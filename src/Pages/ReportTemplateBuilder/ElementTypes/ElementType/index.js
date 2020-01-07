// @flow
import React, { Component } from 'react';
import { Button } from 'reactstrap';
import { t } from 'Utilities/i18n/index';
import ArrowIcon from 'icons/arrow-right.svg?inline';
import './element-type.scss';

type Props = {
  type: string,
  title: string,
  description: string,
  onAdd: Function,
};

class ElementType extends Component<Props> {
  addHandler = () => {
    this.props.onAdd(this.props.type);
  };

  render() {
    const { title, description } = this.props;
    return (
      <div className="element-type">
        <div className="title">{title}</div>
        <div className="description">{description}</div>
        <div className="actions">
          <Button onClick={this.addHandler} className="btn-brand-orange">
            <div className="add-button-label">
              {t('Add')}
              <ArrowIcon className="arrow-icon" />
            </div>
          </Button>
        </div>
      </div>
    );
  }
}

export default ElementType;
