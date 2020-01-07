// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { Table, UncontrolledTooltip } from 'reactstrap';
import { uniqueId, some, orderBy } from 'lodash';
import { Link } from 'react-router-dom';

import CheckIcon from 'icons/check.svg?inline';

import { showModal } from 'Actions/ModalAction';
import Toast from 'Components/Toast';
import Skeleton from 'Components/Skeleton';
import SkeletonTableBody from 'Components/Skeleton/TableBody';
import Icon from './Icon';
import Sticky from 'Components/Sticky';
import StickyContainer from 'Components/Sticky/Container';
import { StickyIDs } from 'Types/Sticky';
import cn from 'classnames';

import underdash from 'Utilities/underdash';
import { t } from 'Utilities/i18n';
import OptionsDropdown from 'Components/Controls/Dropdowns/OptionsDropdown';

import EditIcon from 'icons/edit.svg?inline';
import DeleteIcon from 'icons/remove.svg?inline';

type Props = {
  reportTemplates: Object,
  showModal: Function,
  reportWidgets: Object,
  defaultReportTemplate: Object,

  updateTemplate: Function,
};

type State = {};

class ReportTemplatesTable extends Component<Props, State> {
  reportWidgets = null;
  hasDefault = false;

  addTooltip = (button, text) => {
    const id = uniqueId('report');
    return (
      <span key={id}>
        <UncontrolledTooltip delay={{ show: 0, hide: 0 }} placement="top" target={id}>
          {text}
        </UncontrolledTooltip>
        <span id={id}>{button}</span>
      </span>
    );
  };

  getDropdownOptions = template => {
    const {
      user: {
        organization: { defaultReportTemplate },
      },
    } = this.props.defaultReportTemplate;
    const hasDefault = !!defaultReportTemplate;
    const defaultId = defaultReportTemplate && defaultReportTemplate.id;

    return [
      ((!hasDefault && !template.defaultSystemTemplate) || template.id !== defaultId) && {
        className: 'dropdown-item-no-icon',
        label: t('Set as default'),
        onSelect: () => this.handleSetAsDefault(template),
      },
      {
        label: t('Edit'),
        disabled: !!template.systemTemplate,
        link: `/reports/templates/builder/edit/${template.id}`,
        icon: <EditIcon />,
      },
      {
        className: 'dropdown-item-no-icon',
        label: t('Clone'),
        link: `/reports/templates/builder/clone/${template.id}`,
      },
      {
        label: t('Delete'),
        disabled: !!template.systemTemplate,
        onSelect: () => this.handleDelete(template),
        icon: <DeleteIcon />,
      },
    ];
  };

  handleDelete = ({ id, name }) => {
    this.props.showModal({
      modalType: 'Confirmation',
      modalProps: {
        cancelLabel: t('Cancel'),
        confirmLabel: t('Delete'),
        lockDuration: 0,
        title: t("Delete Template '%s'?", name),
        description: t(
          'Please note that all scheduled reports using this template will be removed as well',
        ),
        action: () => {
          const input = {
            id,
            brandColor: '000000',
            name: '~~DELETE~~',
            template: '[{}]',
            delete: true,
            default: false,
          };
          this.props
            .updateTemplate({ variables: { input } })
            .then(({ data: { updateReportTemplate: { errors } } }) => {
              if (errors && errors.length) {
                Toast.error(t('Unable to remove template'));
              } else {
                Toast.success(t('Template removed'));
                this.props.reportTemplates.refetch();
              }
            });
        },
      },
    });
  };

  handleSetAsDefault = ({ id, brandColor, name, template }) => {
    const input = {
      id,
      brandColor,
      name,
      template,
      delete: false,
      default: true,
    };
    this.props
      .updateTemplate({ variables: { input } })
      .then(({ data: { updateReportTemplate: { errors } } }) => {
        if (errors && errors.length) {
          Toast.error(t('Unable to set template as default'));
        } else {
          this.props.defaultReportTemplate.refetch();
        }
      });
  };

  renderBody = () => {
    if (underdash.graphqlLoading({ ...this.props }) || underdash.graphqlError({ ...this.props })) {
      return this.renderSkeleton();
    }
    const {
      reportTemplates: { reportTemplates },
    } = this.props;
    this.hasDefault = some(reportTemplates, 'default');
    return (
      <StickyContainer name={StickyIDs.containers.REPORT_TEMPLATES} tag="tbody">
        {orderBy(reportTemplates, ['systemTemplate', 'name'], ['desc', 'asc']).map(this.renderRow)}
      </StickyContainer>
    );
  };

  renderRow = template => {
    const {
      user: {
        organization: { defaultReportTemplate },
      },
    } = this.props.defaultReportTemplate;
    const hasDefault = !!defaultReportTemplate;
    const defaultId = defaultReportTemplate && defaultReportTemplate.id;
    return (
      <tr key={template.id}>
        <td>
          {template.systemTemplate ? (
            template.name
          ) : (
            <Link to={`/reports/templates/builder/edit/${template.id}`}>{template.name}</Link>
          )}
        </td>
        <td className="report-elements-cell">{this.renderElementNames(template)}</td>
        <td>
          {template.systemTemplate && <Icon icon={CheckIcon} tooltip={t('System template')} />}
        </td>
        <td>
          {(template.id === defaultId || (!hasDefault && template.defaultSystemTemplate)) && (
            <Icon icon={CheckIcon} tooltip={t('Default template')} />
          )}
        </td>
        <td className="text-right">
          <OptionsDropdown items={this.getDropdownOptions(template)} />
        </td>
      </tr>
    );
  };

  renderElementLabel = elementType => {
    if (this.reportWidgets === null) {
      this.reportWidgets = JSON.parse(this.props.reportWidgets.reportWidgets).reduce(
        (acc, widget) => ({ ...acc, [widget.type]: widget }),
        {},
      );
    }
    return this.reportWidgets[elementType].label;
  };

  renderElementNames = template => {
    const parsed = JSON.parse(template.template);
    return parsed.map(({ type }) => this.renderElementLabel(type)).join(', ');
  };

  renderHead = () => (
    <Sticky
      containerName={StickyIDs.containers.REPORT_TEMPLATES}
      name={StickyIDs.items.TABLE_HEADER}
      stickToTopContainer={StickyIDs.containers.DASHBOARD}
      stickToTopItem={StickyIDs.items.HEADER}
      showPlaceholder
      tag="thead"
    >
      {({ isSticky, style, getRef }) => (
        <tr className={cn({ sticky: isSticky })} ref={getRef} style={style}>
          <th>{t('Name')}</th>
          <th>{t('Elements')}</th>
          <th>{t('System Template')}</th>
          <th>{t('Default Template')}</th>
          <th />
        </tr>
      )}
    </Sticky>
  );

  renderSkeleton = () => (
    <SkeletonTableBody>
      <Skeleton linesConfig={[{ type: 'text' }]} />
      <Skeleton linesConfig={[{ type: 'text' }]} />
      <Skeleton linesConfig={[{ type: 'text' }]} />
      <Skeleton linesConfig={[{ type: 'text' }]} />
      <Skeleton linesConfig={[{ type: 'text' }]} />
    </SkeletonTableBody>
  );

  render() {
    return (
      <div className="report-templates-table">
        <div className="table-container">
          <Table className="data-table table">
            {this.renderHead()}
            {this.renderBody()}
          </Table>
        </div>
      </div>
    );
  }
}

const reportTemplatesQuery = gql`
  query reportTemplatesTable_reportTemplates {
    reportTemplates {
      id
      brandColor
      name
      template
      systemTemplate
      defaultSystemTemplate
    }
  }
`;

const reportWidgetsQuery = gql`
  query reportTemplatesTable_reportWidgets {
    reportWidgets
  }
`;

const defaultReportTemplateQuery = gql`
  query reportTemplatesTable_defaultTemplate {
    user {
      id
      organization {
        id
        defaultReportTemplate {
          id
        }
      }
    }
  }
`;

const updateTemplateQuery = gql`
  mutation reportTemplatesTable_updateReportTemplate($input: UpdateReportTemplateInput!) {
    updateReportTemplate(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

export default compose(
  connect(
    null,
    { showModal },
  ),
  graphql(reportTemplatesQuery, {
    name: 'reportTemplates',
    options: { fetchPolicy: 'network-only' },
  }),
  graphql(reportWidgetsQuery, { name: 'reportWidgets' }),
  graphql(defaultReportTemplateQuery, { name: 'defaultReportTemplate' }),
  graphql(updateTemplateQuery, { name: 'updateTemplate' }),
)(ReportTemplatesTable);
