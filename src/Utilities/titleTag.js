import { startsWith } from 'lodash';

let titleTagPrefix = '';
let titleTagContent = 'AccuRanker';

let prevLocationPath = window.location.pathname;

const shouldClearPrefix = () => {
  const currentLocationPath = window.location.pathname;

  return !(
    (startsWith(prevLocationPath, '/app/keywords') || startsWith(prevLocationPath, '/app/notes')) &&
    (startsWith(currentLocationPath, '/app/keywords') ||
      startsWith(currentLocationPath, '/app/notes'))
  );
};

export const updateTitleTag = ({ prefix, content }) => {
  if (prefix || (prefix === '' && shouldClearPrefix(titleTagPrefix, prefix))) {
    titleTagPrefix = prefix;
  }
  if (content || content === '') {
    titleTagContent = content;
  }

  document.title = `${titleTagPrefix ? `${titleTagPrefix} / ` : ''}${titleTagContent} - AccuRanker`;
  prevLocationPath = window.location.pathname;
};
