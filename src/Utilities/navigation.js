export const getGroupOrDomainLink = path => {
  const keywordsPaths = [
    '/keywords/overview/:filter?',
    '/keywords/list/:filter?',
    '/keywords/competitors/:filter?',
    '/keywords/rankings/:filter?',
    '/keywords/landing-pages/:filter?',
    '/keywords/tags/:filter?',
    '/notes/:domain',
  ];

  if (~keywordsPaths.indexOf(path)) {
    return path.replace(/\/(:([\w\d]+)\?)(?:$|\/$)/, '') || '/';
  }

  return '/keywords/overview';
};
