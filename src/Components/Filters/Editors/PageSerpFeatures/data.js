// @flow
import Icon from 'icons/window-checked.svg?inline';
import { FilterComparison, FilterAttribute, FilterValueType } from 'Types/Filter';
import type { PageSerpFeaturesFilter } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';
import ColumnChecklistEditor from 'Components/Filters/Common/ColumnChecklistEditor';
import { someOfOptions } from 'Components/Filters/Common/labelFunc';
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

export const defaultValue: PageSerpFeaturesFilter = {
  attribute: FilterAttribute.PAGE_SERP_FEATURES,
  type: FilterValueType.ARRAY,
  comparison: FilterComparison.ALL,
  value: [],
};

const getData = () => {
  const items = [
    { value: 'ads_top', label: t('Ads top'), Icon: Overline },
    { value: 'ads_bottom', label: t('Ads bottom'), Icon: Underline },
    { value: 'shopping', label: t('Shopping'), Icon: Cart },
    { value: 'maps_local_teaser', label: t('Maps local teaser'), Icon: LocalTeaserPack },
    { value: 'maps_local', label: t('Maps local'), Icon: Map },
    { value: 'related_questions', label: t('Related questions'), Icon: Speechbubble },
    { value: 'carousel', label: t('Carousel'), Icon: Carousel },
    { value: 'image_pack', label: t('Image pack'), Icon: ImagePack },
    { value: 'reviews', label: t('Reviews'), Icon: Comment },
    { value: 'tweets', label: t('Tweets'), Icon: Tweet },
    { value: 'news', label: t('News'), Icon: Report },
    { value: 'site_links', label: t('Site links'), Icon: Link },
    { value: 'feature_snippet', label: t('Featured snippet'), Icon: Snippet },
    { value: 'knowledge_panel', label: t('Knowledge panel'), Icon: KnowledgePanel },
    { value: 'knowledge_cards', label: t('Knowledge cards'), Icon: KnowledgeCard },
    { value: 'video', label: t('Video'), Icon: Movie },
  ];
  return {
    defaultValue,
    title: t('Page SERP Features'),
    icon: Icon,
    editor: ColumnChecklistEditor,
    editorProps: { items },
    labelFunc: someOfOptions(items),
  };
};

export default getData;
