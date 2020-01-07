// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import Toast from 'Components/Toast';

import { loadTemplate } from 'Actions/ReportTemplateAction';
import TemplateBuilder from '../';
import underdash from 'Utilities/underdash';
import { t } from 'Utilities/i18n';

type Props = {
  loadTemplate: Function,
  match: Object,
  templateQuery: Object,
  saveTemplate: Function,
  userOrg: Object,
  history: Object,
};

class EditTemplate extends Component<Props> {
  UNSAFE_componentWillReceiveProps(nextProps) {
    const error = underdash.graphqlError({ ...this.props });
    const nextError = underdash.graphqlError({ ...nextProps });
    const loading = underdash.graphqlLoading({ ...this.props });
    const nextLoading = underdash.graphqlLoading({ ...nextProps });

    if (!(error || nextError) && loading && !nextLoading) {
      const {
        templateQuery: {
          reportTemplate: { name, brandColor, template },
        },
      } = nextProps;
      this.props.loadTemplate(t('Copy of %s', name), brandColor, JSON.parse(template));
    }
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

const templateQuery = gql`
  query editTemplate_reportTemplate($id: ID!) {
    reportTemplate(id: $id) {
      id
      name
      systemTemplate
      name
      brandColor
      template
    }
  }
`;

const saveTemplateQuery = gql`
  mutation editTemplate_addReportTemplate($input: AddReportTemplateInput!) {
    addReportTemplate(input: $input) {
      reportTemplate {
        id
      }
      errors {
        field
        messages
      }
    }
  }
`;

const userOrgQuery = gql`
  query editTemplate_userOrg {
    user {
      id
      organization {
        id
      }
    }
  }
`;

export default compose(
  graphql(saveTemplateQuery, { name: 'saveTemplate' }),
  graphql(templateQuery, {
    name: 'templateQuery',
    options: props => ({ variables: { id: props.match.params.id } }),
  }),
  graphql(userOrgQuery, { name: 'userOrg', options: { fetchPolicy: 'network-only' } }),
  connect(
    null,
    {
      loadTemplate,
    },
  ),
)(EditTemplate);
