module.exports = {
  meta: {
    docs: {
      description: 'disallow template literals inside translation methods',
      category: 'Possible Errors',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
      },
    ],
  },
  create: context => ({
    TemplateLiteral: node => {
      if (
        node.parent.type === 'CallExpression' &&
        ['t', 'tn', 'tct'].includes(node.parent.callee.name)
      ) {
        context.report({
          node,
          message: 'No template literal inside translate functions',
        });
      }
    },
  }),
};
