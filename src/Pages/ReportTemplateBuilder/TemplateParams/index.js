// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import TextInput from 'Components/Controls/TextInput';
import Hint from 'Components/Hint';
import ColorPicker from 'Components/Controls/ColorPicker';
import { renameTemplate, changeBrandColor } from 'Actions/ReportTemplateAction';
import { t } from 'Utilities/i18n/index';
import './template-params.scss';

type Props = {
  name: string,
  color: string,
  renameTemplate: Function,
  changeBrandColor: Function,
};

class TemplateParams extends Component<Props> {
  handleNameChange = (event: SyntheticEvent<HTMLInputElement>) => {
    this.props.renameTemplate(event.currentTarget.value);
  };

  handleColorChange = (newColor: string) => {
    this.props.changeBrandColor(newColor);
  };

  render() {
    const { name, color } = this.props;
    return (
      <div className="template-params">
        <span className="name-label">{t('Template Name')}</span>
        <TextInput
          value={name}
          placeholder={t('Enter the name of your template')}
          onChange={this.handleNameChange}
        />
        <span className="brand-label">
          {t('Brand color')}
          <Hint>{t('This color will be used for separating lines in the report.')}</Hint>
        </span>
        <ColorPicker value={color} onChange={this.handleColorChange} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  name: state.reportTemplate.name,
  color: state.reportTemplate.color,
});

export default connect(
  mapStateToProps,
  {
    renameTemplate,
    changeBrandColor,
  },
)(TemplateParams);
