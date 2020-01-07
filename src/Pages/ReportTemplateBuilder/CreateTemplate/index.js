// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { resetTemplate } from 'Actions/ReportTemplateAction';
import TemplateBuilder from '../';
import { t } from 'Utilities/i18n';
import Toast from 'Components/Toast';

type Props = {
  saveTemplate: Function,
  userOrg: Object,
  history: Object,
  resetTemplate: () => void,
};

class CreateTemplate extends Component<Props> {
  constructor(props) {
    super(props);
    this.props.resetTemplate();
  }

  handleSave = (name, color, elements) => {
    const {
      userOrg: {
        user: {
          organization: { id },
        },
      },
    } = this.props;
    const input = {
      organization: id,
      brandColor: color,
      name,
      template: elements,
    };
    return this.props
      .saveTemplate({
        variables: {
          input,
        },
      })
      .then(({ data: { addReportTemplate: { errors } } }) => {
        if (errors.length) {
          Toast.error(t('Unable to save template: %s', errors));
        } else {
          Toast.success(t('Template saved'));
          this.props.history.push('/reports/templates');
        }
      });
  };

  render() {
    return <TemplateBuilder handleSave={this.handleSave} />;
  }
}

const userOrgQuery = gql`
  query createTemplate_userOrg {
    user {
      id
      organization {
        id
      }
    }
  }
`;

const saveTemplateQuery = gql`
  mutation createTemplate_addReportTemplate($input: AddReportTemplateInput!) {
    addReportTemplate(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

export default compose(
  graphql(saveTemplateQuery, { name: 'saveTemplate' }),
  graphql(userOrgQuery, { name: 'userOrg', options: { fetchPolicy: 'network-only' } }),
  connect(
    null,
    {
      resetTemplate,
    },
  ),
)(CreateTemplate);
