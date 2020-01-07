// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container } from 'reactstrap';
import gql from 'graphql-tag';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import ActionsMenu, { INTEGRATIONS } from 'Pages/Layout/ActionsMenu';
import { showModal } from 'Actions/ModalAction';
import { t, tct } from 'Utilities/i18n';
import { Link } from 'react-router-dom';
import { compose, graphql } from 'react-apollo';
import Button from 'Components/Forms/Button';
import './integrations.scss';

import GoogleDataStudioImage from './images/GoogleDataStudio.png';
import GoogleAnalyticsImage from './images/GoogleAnalytics.png';
import AdobeAnalyticsImage from './images/AdobeAnalytics.png';
import GoogleSearchConsoleImage from './images/GoogleSearchConsole.png';
import GoogleSheetsImage from './images/GoogleSheets.png';
import HubspotImage from './images/Hubspot.png';
import DataboxImage from './images/Databox.png';
import RequestImage from './images/Request.png';
import TapClicksImage from './images/tapclicks.png';
import CSVImage from './images/csv.png';
import ThirdPartyImage from './images/third_party.png';
import ApiImage from './images/third_party.png';

type Props = {
  showModal: Function,
  integrationTapclicks: Object,
};

const DEFAULT_CATEGORY = 'default';
const CUSTOM_CATEGORY = 'custom';

class IntegrationsPage extends Component<Props> {
  updateTapClicks = (active, driveConnectionId) => {
    this.props
      .editIntegrationTapclicks({
        variables: {
          input: {
            active,
            driveConnectionId,
          },
        },
      })
      .then(({ data }) => {
        // this is a temp implementation of TapClicks untill we get api
        window.location.reload();
      });
  };

  getIntegrations = category =>
    [
      {
        isPopular: false,
        category: DEFAULT_CATEGORY,
        image: GoogleAnalyticsImage,
        modalTitle: t('Google Analytics'),
        modalContent: (
          <div>
            <p>
              {t(
                'Google Analytics is the most popular digital analytics tool offered by Google that helps you to keep track of your customer’s journey by analysing visitor traffic.',
              )}
            </p>
            <p>
              {t(
                'Connecting AccuRanker to your Google Analytics account will provide more in-depth data such as Est. visitors per keyword and Landing pages/Tag cloud data for professional users.',
              )}
            </p>
            <p>
              {t(
                'Integration with Google Analytics is completely free of charge and our customer service team will be happy to help you if you have any questions.',
              )}
            </p>
            <p className="alert alert-info">
              {tct('Learn how to connect to Google Analytics with our [link:Step by step guide]', {
                link: (
                  <a
                    className="btn btn-brand-orange"
                    href="https://www.accuranker.com/help/integrations/connect-to-google-analytics"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
              })}
            </p>
          </div>
        ),
      },
      {
        category: CUSTOM_CATEGORY,
        image: AdobeAnalyticsImage,
        modalTitle: t('Adobe Analytics'),
        modalContent: (
          <div>
            <p>
              {t(
                'Adobe Analytics (formerly known as Omniture) is a widely popular analytics tool used for applying real-time analytics and detailed segmentation across all of your marketing channels. ',
              )}
            </p>
            <p>
              {t(
                'Connecting AccuRanker to your Adobe Analytics account will provide more in-depth data such as organic traffic, goals and where the traffic is coming from.',
              )}
            </p>
            <p className="alert alert-info">
              {tct('Learn how to connect to Adobe Analytics with our [link:Step by step guide]', {
                link: (
                  <a
                    className="btn btn-brand-orange"
                    href="https://www.accuranker.com/help/integrations/adobe-analytics"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
              })}
            </p>
          </div>
        ),
      },
      {
        isPopular: false,
        category: DEFAULT_CATEGORY,
        image: GoogleSearchConsoleImage,
        modalTitle: t('Google Search Console'),
        modalContent: (
          <div>
            <p>
              {t(
                'Google Search Console (formerly known as Google Webmaster Tools) is a free web service by Google, that allows to check indexing status and optimize visibility of the website.',
              )}
            </p>
            <p>
              {t(
                'Connecting AccuRanker to your Google Search Console account will enable you to easily import your keywords. Connecting both Google Analytics and Google Search Console in your AccuRanker Account will allow you to see estimated visitors per keyword and keywords potential. Integration with Google Search Console is completely free of charge and our customer service team will be happy to help you if you have any questions.',
              )}
            </p>
            <p className="alert alert-info">
              {tct(
                'Learn how to connect to Google Search Console with our [link:Step by step guide]',
                {
                  link: (
                    <a
                      className="btn btn-brand-orange"
                      href="https://www.accuranker.com/help/integrations/connect-to-google-search-console"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                },
              )}
            </p>
          </div>
        ),
      },
      {
        category: CUSTOM_CATEGORY,
        isPopular: false,
        image: GoogleSheetsImage,
        modalTitle: t('Google Sheets'),
        modalContent: (
          <div>
            <p>
              {t(
                'Google Sheets is another integration that can help you streamline your reporting.',
              )}
            </p>
            <p>
              {t(
                'Connecting Google Drive Account with AccuRanker will enable you to export your reports directly into Google Sheets.',
              )}
            </p>
            <p className="alert alert-info">
              {tct(
                'Learn how to export AccuRanker data into Google Spreadsheets with our [link:Step by step guide]',
                {
                  link: (
                    <a
                      className="btn btn-brand-orange"
                      href="https://www.accuranker.com/help/reports/google-spreadsheet-reports"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                },
              )}
            </p>
          </div>
        ),
      },
      {
        category: CUSTOM_CATEGORY,
        isPopular: false,
        image: GoogleDataStudioImage,
        modalTitle: t('Google Data Studio'),
        modalContent: (
          <div>
            <p>
              {t(
                'Google Data Studio is a dashboard tool with that turns your data into informative dashboards and reports that are easy to read and share.',
              )}
            </p>
            <p className="alert alert-info">
              {tct(
                'To use the AccuRanker Google Data Studio data source use the following [link:link]',
                {
                  link: (
                    <a
                      className="btn btn-brand-orange"
                      href="https://datastudio.google.com/datasources/create?connectorId=AKfycbxH-df9mzmbZCw-tryDNrab81PYMq8hkrroBuvCii5n"
                      // v1: https://datastudio.google.com/datasources/create?connectorId=AKfycbw-9hFu8pPR08TWwiGbomf4fqX0rOdaK1cEFFh4H-Gv
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                },
              )}
            </p>
            <p>
              {t(
                'Connecting Google Data Studio with AccuRanker will enable you to show advanced AccuRanker data on Google Data Studio dashboard in a simple and sleek way.',
              )}
            </p>
            <p>
              {t(
                'Integration with Google Data Studio is completely free of charge and our customer service team will be happy to help you if you have any questions.',
              )}
            </p>
            <p className="alert alert-info">
              {tct(
                'Learn how to export AccuRanker data into Google Data Studio with our [link:Step by step guide]',
                {
                  link: (
                    <a
                      className="btn btn-brand-orange"
                      href="http://help.accuranker.com/integrations/connect-to-google-data-studio"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                },
              )}
            </p>
          </div>
        ),
      },
      // {
      //   category: CUSTOM_CATEGORY,
      //   image: HubspotImage,
      //   modalTitle: t('HubSpot'),
      //   modalContent: (
      //     <div>
      //       <p>
      //         {t(
      //           'With our HubSpot integration you are able to easily import your keywords from HubSpot to AccuRanker.',
      //         )}
      //       </p>
      //       <p className="alert alert-info">
      //         {tct(
      //           'To use the HubSpot integration go to the importer and select [link:Import from third party]',
      //           {
      //             link: <Link className="btn btn-brand-orange" to={'/import/bulk'} />,
      //           },
      //         )}
      //       </p>
      //     </div>
      //   ),
      // },
      // {
      //   category: CUSTOM_CATEGORY,
      //   comingSoon: true,
      //   image: TapClicksImage,
      //   modalTitle: t('TapClicks'),
      //   modalContent: (
      //     <div>
      //       {this.props.integrationTapclicks.loading ? (
      //         <div>{t('Loading...')}</div>
      //       ) : (
      //         <div>
      //           <p>
      //             {t(
      //               'With the TapClicks integration you can display your data from AccuRanker on your TapClicks dashboards.',
      //             )}
      //           </p>
      //           {this.props.integrationTapclicks.integrationTapclicks &&
      //           this.props.integrationTapclicks.integrationTapclicks.active ? (
      //             <div>
      //               <p className="alert alert-success">
      //                 {t(
      //                   'Integration is active and is using the Google Drive Connection connected to your user.',
      //                 )}
      //               </p>
      //               <Button
      //                 theme="orange"
      //                 onClick={() =>
      //                   this.updateTapClicks(
      //                     false,
      //                     this.props.integrationTapclicks.integrationTapclicks.driveConnection,
      //                   )
      //                 }
      //               >
      //                 {t('Disable')}
      //               </Button>
      //             </div>
      //           ) : (
      //             <div>
      //               {this.props.user.googleConnections.length <= 0 ? (
      //                 <p className="alert alert-warning">
      //                   {tct(
      //                     'Please setup a Google Drive Connection [link:here], to use the TapClicks integration.',
      //                     {
      //                       link: <Link to={'/profile'} />,
      //                     },
      //                   )}
      //                 </p>
      //               ) : (
      //                 <p>
      //                   <Button
      //                     theme="orange"
      //                     onClick={() =>
      //                       this.updateTapClicks(true, this.props.user.googleConnections[0].id)
      //                     }
      //                   >
      //                     {t('Enable')}
      //                   </Button>
      //                 </p>
      //               )}
      //             </div>
      //           )}
      //         </div>
      //       )}
      //     </div>
      //   ),
      // },
      {
        category: DEFAULT_CATEGORY,
        image: CSVImage,
        modalTitle: t('CSV Importer'),
        modalContent: (
          <div>
            <p>{t('With our bulk importer you are able to import data from a CSV file.')}</p>
            <p className="alert alert-info">
              {tct(
                'To use the AccuRanker CSV importer go to the the importer and select [link:Upload CSV]',
                {
                  link: <Link className="btn btn-brand-orange" to={'/import/bulk'} />,
                },
              )}
            </p>
          </div>
        ),
      },
      {
        category: DEFAULT_CATEGORY,
        image: ThirdPartyImage,
        modalTitle: t('Third-party Importer'),
        modalContent: (
          <div>
            <p>
              {t(
                'With our third-party importers we can import your data from a range of other rank tracking tools. Contact our support and we will be happy to help you import your data into AccuRanker from a third-party tool.',
              )}
            </p>
          </div>
        ),
      },
      {
        category: CUSTOM_CATEGORY,
        image: DataboxImage,
        modalTitle: t('Databox'),
        modalContent: (
          <div>
            <p>
              {t(
                'With the Databox integration you can display your data from AccuRanker on your Databox dashboard.',
              )}
            </p>
            <p className="alert alert-info">
              {tct('You can read more and enable the integration [link:here].', {
                link: (
                  <a
                    className="btn btn-brand-orange"
                    href="https://databox.com/templates#AccuRanker"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
              })}
            </p>
          </div>
        ),
      },
      {
        category: CUSTOM_CATEGORY,
        image: ApiImage,
        modalTitle: t('API'),
        modalContent: (
          <div>
            <p>
              {t(
                'Using this API you will be able to retrieve metrics from your AccuRanker account.',
              )}
            </p>
            <p className="alert alert-info">
              {tct('To learn more about the API please refer to the [link:API documentation].', {
                link: <Link className="btn btn-brand-orange" to={'/api'} />,
              })}
            </p>
          </div>
        ),
      },
      {
        category: CUSTOM_CATEGORY,
        image: RequestImage,
        modalTitle: t('Request Integration'),
        modalContent: (
          <div>
            <p className="alert alert-info">
              {t(
                'If you wish to request an integration, please send an email to hj@accuranker.com',
              )}
            </p>
          </div>
        ),
      },
    ].filter(item => item.category === category);

  openIntegrationsModal = integration => {
    this.props.showModal({
      modalType: 'Integration',
      modalTheme: 'light',
      modalProps: {
        content: integration.modalContent,
        title: integration.modalTitle,
      },
    });
  };

  renderCard(integration) {
    return (
      <div className="card">
        {integration.isPopular && (
          <span className="card-header-badge badge badge-success">{t('Popular')}</span>
        )}
        {integration.comingSoon && (
          <span className="card-header-badge badge badge-warning">{t('Coming Soon')}</span>
        )}
        {integration.isBeta && (
          <span className="card-header-badge badge badge-info">{t('BETA')}</span>
        )}
        <img
          className="card-img-top"
          src={integration.image}
          alt={integration.modalTitle || null}
        />

        <div className="title">{integration.modalTitle}</div>
        {integration.comingSoon ? (
          <button className="btn btn-primary">{t('Coming Soon')}</button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => this.openIntegrationsModal(integration)}
          >
            {t('Read more')}
          </button>
        )}
      </div>
    );
  }

  renderDefaultCategory() {
    return (
      <div className="integrations-category">
        <div className="integrations-title">{t('Standard integrations')}</div>
        <div className="integrations-list">
          {this.getIntegrations(DEFAULT_CATEGORY).map((integration, index) => (
            <div key={index} className="integration">
              {this.renderCard(integration)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  renderCustomCategory() {
    return (
      <div className="integrations-category">
        <div className="integrations-title">{t('Advanced integrations')}</div>
        <div className="integrations-subtitle">
          {tct(
            'These integrations requires API. API is part of the [link1:Professional], [link2:Expert] and [link3:Enterprise] plans.',
            {
              link1: <Link to={'/billing/package/select'} />,
              link2: <Link to={'/billing/package/select'} />,
              link3: <Link to={'/billing/package/select'} />,
            },
          )}
        </div>
        <div className="integrations-list">
          {this.getIntegrations(CUSTOM_CATEGORY).map((integration, index) => (
            <div key={index} className="integration">
              {this.renderCard(integration)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  render() {
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={INTEGRATIONS} />
        <Container fluid className="integrations content-container multi">
          {this.renderDefaultCategory()}
          {this.renderCustomCategory()}
        </Container>
      </DashboardTemplate>
    );
  }
}

const integrationTapclicksQuery = gql`
  query integrations_getintegrationTapclicks {
    integrationTapclicks {
      id
      active
      driveConnection
    }
  }
`;

const editIntegrationTapclicksQuery = gql`
  mutation integrations_editIntegrationTapclicks($input: EditIntegrationTapclicksInput!) {
    editIntegrationTapclicks(input: $input) {
      integrationTapclicks {
        id
        active
        driveConnection
      }
    }
  }
`;

const mapStateToProps = ({ user }) => ({
  user,
});

export default compose(
  graphql(integrationTapclicksQuery, {
    name: 'integrationTapclicks',
  }),
  graphql(editIntegrationTapclicksQuery, {
    name: 'editIntegrationTapclicks',
  }),
  connect(
    mapStateToProps,
    { showModal },
  ),
)(IntegrationsPage);
