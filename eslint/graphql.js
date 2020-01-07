module.exports = {
  plugins: [
    'graphql'
  ],
  parser: 'babel-eslint',
  rules: {
    'graphql/template-strings': ['warn', {
      // Import default settings for your GraphQL client. Supported values:
      // 'apollo', 'relay', 'lokka', 'literal'
      env: 'apollo',

      // Import your schema JSON here
      schemaJson: require('../schema.json'),
    }]
  }
};
