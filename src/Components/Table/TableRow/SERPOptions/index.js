// @flow
import React, { Component } from 'react';
import Icon from 'Pages/Keywords/Table/Icon';
import {
  Overline,
  Underline,
  Cart,
  LocalTeaserPack,
  Speechbubble,
  Comment,
  Map,
  Report,
  Link,
  Snippet,
  Movie,
  Carousel,
  ImagePack,
  Tweet,
  KnowledgePanel,
  KnowledgeCard,
} from 'Pages/Keywords/Table/Icon/Icons';
import { t } from 'Utilities/i18n/index';
import { compose } from 'react-apollo';
import { connect } from 'react-redux';

import * as Images from './SERPImages';

import { showModal } from 'Actions/ModalAction';
import './serp-options.scss';

const ADS_TOP = 'adsTop';
const ADS_BOTTOM = 'adsBottom';
const SHOPPING = 'shopping';
const MAPS_LOCAL_TEASER = 'mapsLocalTeaser';
const MAPS_LOCAL = 'mapsLocal';
const RELATED_QUESTIONS = 'relatedQuestions';
const CAROUSEL = 'carousel';
const IMAGE_PACK = 'imagePack';
const REVIEWS = 'reviews';
const TWEETS = 'tweets';
const NEWS = 'news';
const SITE_LINKS = 'siteLinks';
const FEATURE_SNIPPET = 'featureSnippet';
const KNOWLEDGE_PANEL = 'knowledgePanel';
const KNOWLEDGE_CARDS = 'knowledgeCards';
const VIDEO = 'video';

const possibleOptions = [
  ADS_TOP,
  ADS_BOTTOM,
  SHOPPING,
  MAPS_LOCAL_TEASER,
  MAPS_LOCAL,
  RELATED_QUESTIONS,
  CAROUSEL,
  IMAGE_PACK,
  REVIEWS,
  TWEETS,
  NEWS,
  SITE_LINKS,
  FEATURE_SNIPPET,
  KNOWLEDGE_PANEL,
  KNOWLEDGE_CARDS,
  VIDEO,
];

export const getIconData = () => ({
  [ADS_TOP]: {
    icon: Overline,
    label: t('Ads at the top'),
    image: Images.AdsTop,
    text: (
      <span>
        {t('AdWords results come at both the top and the bottom of the page.')}
        <br />
        {t(
          'Each Ad is identified by a green "Ad" box next to it. Ads are ranked based on their relevance to the search, bid and other factors.',
        )}
        <br />
        {t(
          'Ads push organic results down the page - this impacts Click Through Rates - in particular on mobile browsers.',
        )}
      </span>
    ),
  },
  [ADS_BOTTOM]: {
    icon: Underline,
    label: t('Ads at the bottom'),
    image: Images.AdsBottom,
    text: (
      <span>
        {t('AdWords results come at both the top and the bottom of the page.')}
        <br />
        {t(
          'Each Ad is identified by a green "Ad" box next to it. Ads are ranked based on their relevance to the search, bid and other factors.',
        )}
      </span>
    ),
  },
  [SHOPPING]: {
    icon: Cart,
    label: t('Shopping'),
    image: Images.Shopping,
    text: (
      <span>
        {t(
          'Paid shopping listings and Product Listing Ads (PLAs) are usually positioned on right hand ' +
            'side of the page.',
        )}
        <br />
        {t('Shopping listings are a form of paid placement and similar to AdWords.')}
      </span>
    ),
  },
  [MAPS_LOCAL_TEASER]: {
    icon: LocalTeaserPack,
    label: t('Local teaser'),
    image: Images.MapsLocalTeaser,
    text: (
      <span>
        {t(
          'A three pack of local business results displayed on a map with extra information such as ' +
            'business hours, reviews, images.',
        )}
        <br />
        {t(
          'Similar to a Local Pack, but largely focused on hotels and restaurants. Filter options ' +
            'available for example by price or ratings.',
        )}
      </span>
    ),
  },
  [MAPS_LOCAL]: {
    icon: Map,
    label: t('Map'),
    image: Images.MapsLocal,
    text: (
      <span>
        {t(
          'For queries that Google considers to have local intent - i.e. with a specific ' +
            'location in the query, or with “near me” included, the results will often contain ' +
            'a “Local Pack” featuring the top 3 physical locations most relevant to the query.',
        )}
        <br />
        {t('These results are particularly dominant on mobile.')}
      </span>
    ),
  },
  [RELATED_QUESTIONS]: {
    icon: Speechbubble,
    label: t('Related questions'),
    image: Images.RelatedQuestions,
    text: (
      <span>
        {t(
          '“Related Questions” shows generated questions that Google believes are related to ' +
            'the search with a snippet of an answer.',
        )}
        <br />
        {t(
          'These questions can be mixed into organic results and their position on the SERP can vary.',
        )}
      </span>
    ),
  },
  [CAROUSEL]: {
    icon: Carousel,
    label: t('Carousel'),
    image: Images.Carousel,
    text: (
      <span>
        {t(
          'Carousel results are shown when Google denotes a person is searching for options ' +
            'around a specific query.',
        )}
        <br />
        {t(
          'Shown for both informational and commercial results, when clicked Google provides a new ' +
            'SERP showing both carousel and results for the search query.',
        )}
      </span>
    ),
  },
  [IMAGE_PACK]: {
    icon: ImagePack,
    label: t('Image pack'),
    image: Images.ImagePack,
    text: (
      <span>
        {t(
          'Image pack results are displayed as a row of horizontal image links and can appear in any ' +
            'organic position. When clicked they link through to a Google Image search.',
        )}
        <br />
        {t(
          'Image packs appear for searches where Google believes that visual content will answer or add ' +
            'value to the search query.',
        )}
      </span>
    ),
  },
  [REVIEWS]: {
    icon: Comment,
    label: t('Reviews'),
    image: Images.Reviews,
    text: (
      <span>
        {t(
          'Review ratings and stars are often displayed for recipes, products and similar items. The rating, ' +
            'where relevant is shown between the URL and the snippet. Results with review stars have a ' +
            'higher click through rate.',
        )}
        <br />
        {t(
          'Rules for which results are eligible for stars differ according to factors including industry and ' +
            'verticals.',
        )}
      </span>
    ),
  },
  [TWEETS]: {
    icon: Tweet,
    label: t('Tweets'),
    image: Images.Tweets,
    text: (
      <span>
        {t(
          'As of 2015 Google began showing related tweets directly in SERP’s. Positions can vary and ' +
            'they will be mixed in with organic results.',
        )}
        <br />
        {t(
          'Twitter results in SERP’s are not considered “organic” but strengthen the awareness of brand ' +
            'and can impact upon the relevancy of the result.',
        )}
      </span>
    ),
  },
  [NEWS]: {
    icon: Report,
    label: t('News'),
    image: Images.News,
    text: (
      <span>
        {t(
          'Timely or newsworthy topics can produce a block of results from Google News - a wide variety ' +
            'of sites are considered eligible to appear in the new block.',
        )}
        <br />
        {t('Google News aims to make relevant news accessible to readers.')}
      </span>
    ),
  },
  [SITE_LINKS]: {
    icon: Link,
    label: t('Site links'),
    image: Images.SiteLinks,
    text: (
      <span>
        {t(
          'Where a search contains a exact domain or clearly suggests brand intent, the SERP may ' +
            'display an extended pack of up to 10 sitelinks.',
        )}
        <br />
        {t('A full pack of sitelinks dominates the SERP and occupies five organic positions.')}
        <br />
        {t('Site Links can generate a higher CTR and provide users with results faster.')}
      </span>
    ),
  },
  [FEATURE_SNIPPET]: {
    icon: Snippet,
    label: t('Featured snippet'),
    image: Images.FeatureSnippet,
    text: (
      <span>
        {t(
          'When Google wants to provide a result for a query not in the core Knowledge Graph they may ' +
            'try to locate the answer in the index',
        )}
        <br />
        {t(
          'This provides an organic result with information taken from the page that answers the search ' +
            'query in the most relevant way - often from a result that is on the first SERP.',
        )}
        <br />
        {t('Featured Snippets have higher click through rates than standard organic results.')}
      </span>
    ),
  },
  [KNOWLEDGE_PANEL]: {
    icon: KnowledgePanel,
    label: t('Knowledge panel'),
    image: Images.KnowledgePanel,
    text: (
      <span>
        {t(
          'Knowledge Panels or Knowledge Graphs are constructed from different sources, including ' +
            'human-edited sources such as WikiData and Google Index.',
        )}
        <br />
        {t(
          'Because Knowledge Panel results are based on human edited-data or data agreements ' +
            'appearing in Knowledge Panel results is rare.',
        )}
        <br />
        {t(
          'Knowing which keywords are affected by Knowledge Graph results can help you prioritize which ' +
            'keywords to target.',
        )}
        <br />
        {t(
          'They usually appear to the right hand side of the organic results on a desktop search.',
        )}
      </span>
    ),
  },
  [KNOWLEDGE_CARDS]: {
    icon: KnowledgeCard,
    label: t('Knowledge cards'),
    image: Images.KnowledgeCards,
    text: (
      <span>
        {t(
          'The Knowledge Cards are part of the Knowledge Graph and cover information from semantic ' +
            'data from human-edited sources to Google index to private data partnerships.',
        )}
        <br />
        {t(
          'Knowing which keywords are affected by Knowledge Graph results can help you prioritize which ' +
            'keywords to target.',
        )}
        <br />
        {t('These results appear at the top of the SERP.')}
      </span>
    ),
  },
  [VIDEO]: {
    icon: Movie,
    label: t('Video'),
    image: Images.Video,
    text: (
      <span>
        {t(
          'Video results, including YouTube, can display a thumbnail result. Considered an organic ' +
            'enhancement, they will only appear for certain keywords.',
        )}
        <br />
        {t('Video schema markup must exist on the page.')}
      </span>
    ),
  },
});

type Props = {
  pageSerpFeatures: Object,
  showModal: Function,
  currentModal: Object,
};

class SERPOptions extends Component<Props> {
  shouldComponentUpdate(nextProps) {
    return nextProps.pageSerpFeatures !== this.props.pageSerpFeatures;
  }

  handleBack = () => {
    const { currentModal } = this.props;
    this.props.showModal(currentModal);
  };

  handleSelect(option) {
    const { currentModal } = this.props;
    const descriptor = getIconData()[option];
    this.props.showModal({
      modalType: 'SERPInfo',
      modalTheme: 'light',
      modalProps: {
        image: descriptor.image,
        text: descriptor.text,
        label: descriptor.label,
        onBack: currentModal.modalType ? this.handleBack : null,
      },
    });
  }

  render() {
    const { pageSerpFeatures } = this.props;
    const iconsData = getIconData();
    const icons = [];

    if (pageSerpFeatures) {
      possibleOptions.forEach(option => {
        if (pageSerpFeatures[option]) {
          const iconData = iconsData[option] || {};
          icons.push(
            <Icon
              key={option}
              icon={iconData.icon}
              onClick={() => this.handleSelect(option)}
              tooltip={iconData.label}
            />,
          );
        }
      });
    }

    return <div className="flex-row serp-icons">{icons}</div>;
  }
}

export default compose(
  connect(
    state => ({ currentModal: state.modal }),
    { showModal },
  ),
)(SERPOptions);
