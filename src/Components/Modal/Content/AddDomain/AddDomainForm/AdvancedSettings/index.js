// @flow
import React, { Component } from 'react';
import { Col, FormGroup } from 'reactstrap';
import { Field } from 'redux-form';
import { LocationField, Checkbox } from 'Components/Forms/Fields';
import { t } from 'Utilities/i18n/index';

type Props = {
  onChange: Function,
  initialValues?: Object,
  showAdvancedSettings: boolean,
};

class AdvancedSettings extends Component<Props> {
  handleChange = ({ currentTarget: { checked, name } }: SyntheticEvent<HTMLInputElement>) => {
    this.props.onChange(name, checked);
  };

  render() {
    const { showAdvancedSettings, initialValues } = this.props;
    if (!showAdvancedSettings) return null;
    const { includeSubdomains, exactMatch, shareOfVoicePercentage } = initialValues || {};
    return (
      <div>
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <Field
              name="includeSubdomains"
              component={Checkbox}
              onChange={this.handleChange}
              defaultChecked={includeSubdomains}
              helpText={t(
                'Include results from *.domain.com. If not checked, we only include results for www.domain.com and domain.com.',
              )}
            >
              {t('Include subdomains')}
            </Field>
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <Field
              name="exactMatch"
              component={Checkbox}
              onChange={this.handleChange}
              defaultChecked={exactMatch}
              helpText={t(
                'Only include results where the URL found is an exact match to what is entered in domain name',
              )}
            >
              {t('Exact match')}
            </Field>
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <div className="form-label">{t('Default location')}</div>
            <Field
              name="defaultLocation"
              placeholder={t('Default location')}
              component={LocationField}
              helpText={t(
                'This should only be used if you target a specific area. Bing only supports locations in the US.',
              )}
            />
          </Col>
        </FormGroup>
      </div>
    );
  }
}

export default AdvancedSettings;
