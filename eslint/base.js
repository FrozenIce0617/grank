module.exports = {
  rules: {
    // disallow await inside of loops
    // http://eslint.org/docs/rules/no-await-in-loop
    'no-await-in-loop': 'off',

    // disallow comparing against -0
    // http://eslint.org/docs/rules/no-compare-neg-zero
    'no-compare-neg-zero': 'off',

    // disallow assignment operators in conditional expressions
    // http://eslint.org/docs/rules/no-cond-assign
    'no-cond-assign': 'error',

    // disallow the use of console
    // http://eslint.org/docs/rules/no-console
    'no-console': 'warn',

    // disallow constant expressions in conditions
    // http://eslint.org/docs/rules/no-constant-condition
    'no-constant-condition': 'warn',

    // disallow control characters in regular expressions
    // http://eslint.org/docs/rules/no-control-regex
    'no-control-regex': 'off',

    // disallow the use of debugger
    // http://eslint.org/docs/rules/no-debugger
    'no-debugger': 'error',

    // disallow duplicate arguments in function definitions
    // http://eslint.org/docs/rules/no-dupe-args
    'no-dupe-args': 'error',

    // disallow duplicate keys in object literals
    // http://eslint.org/docs/rules/no-dupe-keys
    'no-dupe-keys': 'error',

    // disallow duplicate case labels
    // http://eslint.org/docs/rules/no-duplicate-case
    'no-duplicate-case': 'error',

    // disallow empty block statements
    // http://eslint.org/docs/rules/no-empty
    'no-empty': 'warn',

    // disallow empty character classes in regular expressions
    // http://eslint.org/docs/rules/no-empty-character-class
    'no-empty-character-class': 'error',

    // disallow reassigning exceptions in catch clauses
    // http://eslint.org/docs/rules/no-ex-assign
    'no-ex-assign': 'error',

    // disallow unnecessary boolean casts
    // http://eslint.org/docs/rules/no-extra-boolean-cast
    'no-extra-boolean-cast': 'error',

    // disallow unnecessary parentheses
    // http://eslint.org/docs/rules/no-extra-parens
    'no-extra-parens': 'off',

    // disallow unnecessary semicolons
    // http://eslint.org/docs/rules/no-extra-semi
    'no-extra-semi': 'error',

    // disallow reassigning function declarations
    // http://eslint.org/docs/rules/no-func-assign
    'no-func-assign': 'error',

    // disallow variable or function declarations in nested blocks
    // http://eslint.org/docs/rules/no-inner-declarations
    'no-inner-declarations': 'error',

    // disallow invalid regular expression strings in RegExp constructors
    // http://eslint.org/docs/rules/no-invalid-regexp
    'no-invalid-regexp': 'error',

    // disallow irregular whitespace outside of strings and comments
    // http://eslint.org/docs/rules/no-irregular-whitespace
    'no-irregular-whitespace': 'error',

    // disallow calling global object properties as functions
    // http://eslint.org/docs/rules/no-obj-calls
    'no-obj-calls': 'error',

    // disallow calling some Object.prototype methods directly on objects
    // http://eslint.org/docs/rules/no-prototype-builtins
    'no-prototype-builtins': 'off',

    // disallow multiple spaces in regular expressions
    // http://eslint.org/docs/rules/no-regex-spaces
    'no-regex-spaces': 'error',

    // disallow sparse arrays
    // http://eslint.org/docs/rules/no-sparse-arrays
    'no-sparse-arrays': 'error',

    // disallow template literal placeholder syntax in regular strings
    // http://eslint.org/docs/rules/no-template-curly-in-string
    'no-template-curly-in-string': 'error',

    // disallow confusing multiline expressions
    // http://eslint.org/docs/rules/no-unexpected-multiline
    'no-unexpected-multiline': 'error',

    // disallow unreachable code after return, throw, continue, and break statements
    // http://eslint.org/docs/rules/no-unreachable
    'no-unreachable': 'warn', //Even though it is advised that this one returns an error I like to be able to stop code during dev

    // disallow control flow statements in finally blocks
    // http://eslint.org/docs/rules/no-unsafe-finally
    'no-unsafe-finally': 'error',

    // disallow negating the left operand of relational operators
    // http://eslint.org/docs/rules/no-unsafe-negation
    'no-unsafe-negation': 'error',

    // require calls to isNaN() when checking for NaN
    // http://eslint.org/docs/rules/use-isnan
    'use-isnan': 'error',

    // enforce valid JSDoc comments
    // http://eslint.org/docs/rules/valid-jsdoc
    'valid-jsdoc': 'off',

    // enforce comparing typeof expressions against valid strings
    // http://eslint.org/docs/rules/valid-typeof
    'valid-typeof': ['error', { requireStringLiterals: true }],

    // enforce getter and setter pairs in objects
    // http://eslint.org/docs/rules/accessor-pairs
    'accessor-pairs': 'off',

    // enforce return statements in callbacks of array methods
    // http://eslint.org/docs/rules/array-callback-return
    'array-callback-return': 'warn',

    // enforce the use of variables within the scope they are defined
    // http://eslint.org/docs/rules/block-scoped-var
    'block-scoped-var': 'warn',

    // enforce that class methods utilize this
    // http://eslint.org/docs/rules/class-methods-use-this
    'class-methods-use-this': ['off', {
      exceptMethods: [
        'render',
        'renderField',
        'getInitialState',
        'getDefaultProps',
        'getChildContext',
        'componentWillMount',
        'componentDidMount',
        'componentWillReceiveProps',
        'shouldComponentUpdate',
        'componentWillUpdate',
        'componentDidUpdate',
        'componentWillUnmount'
      ]
    }],

    // enforce a maximum cyclomatic complexity allowed in a program
    // http://eslint.org/docs/rules/complexity
    complexity: 'off',

    // require return statements to either always or never specify values
    // http://eslint.org/docs/rules/consistent-return
    'consistent-return': 'off',

    // enforce consistent brace style for all control statements
    // http://eslint.org/docs/rules/curly
    curly: ['warn', 'multi-line'],

    // require default cases in switch statements
    // http://eslint.org/docs/rules/default-case
    'default-case': ['error', { commentPattern: '^no default$' }], // when you really don't need a default case use the //no default comment'

    // enforce consistent newlines before and after dots
    // http://eslint.org/docs/rules/dot-location
    'dot-location': ['warn', 'property'],

    // enforce dot notation whenever possible
    // http://eslint.org/docs/rules/dot-notation
    'dot-notation': ['warn', { allowKeywords: true }],

    // require the use of === and !==
    // http://eslint.org/docs/rules/eqeqeq
    eqeqeq: ['warn', 'always', { null: 'ignore' }],

    // require for-in loops to include an if statement
    // http://eslint.org/docs/rules/guard-for-in
    'guard-for-in': 'error',

    // disallow the use of alert, confirm, and prompt
    // http://eslint.org/docs/rules/no-alert
    'no-alert': 'warn',

    // disallow the use of arguments.caller or arguments.callee
    // http://eslint.org/docs/rules/no-caller
    'no-caller': 'error',

    // disallow lexical declarations in case clauses
    // http://eslint.org/docs/rules/no-case-declarations
    'no-case-declarations': 'off',

    // disallow division operators explicitly at the beginning of regular expressions
    // http://eslint.org/docs/rules/no-div-regex
    'no-div-regex': 'off',

    // disallow else blocks after return statements in if statements
    // http://eslint.org/docs/rules/no-else-return
    'no-else-return': 'error',

    // disallow empty functions
    // http://eslint.org/docs/rules/no-empty-function
    'no-empty-function': ['error', {
      allow: [
        'arrowFunctions',
        'functions',
        'methods'
      ]
    }],

    // disallow empty destructuring patterns
    // http://eslint.org/docs/rules/no-empty-pattern
    'no-empty-pattern': 'error',

    // disallow null comparisons without type-checking operators
    // http://eslint.org/docs/rules/no-eq-null
    'no-eq-null': 'off',

    // disallow the use of eval()
    // http://eslint.org/docs/rules/no-eval
    'no-eval': 'warn',

    // disallow extending native types
    // http://eslint.org/docs/rules/no-extend-native
    'no-extend-native': 'warn',

    // disallow unnecessary calls to .bind()
    // http://eslint.org/docs/rules/no-extra-bind
    'no-extra-bind': 'error',

    // disallow unnecessary labels
    // http://eslint.org/docs/rules/no-extra-label
    'no-extra-label': 'warn',

    // disallow fallthrough of case statements
    // http://eslint.org/docs/rules/no-fallthrough
    'no-fallthrough': 'error',

    // disallow leading or trailing decimal points in numeric literals
    // http://eslint.org/docs/rules/no-floating-decimal
    'no-floating-decimal': 'warn',

    // disallow assignments to native objects or read-only global variables
    // http://eslint.org/docs/rules/no-global-assign
    'no-global-assign': 'error',

    // disallow shorthand type conversions
    // http://eslint.org/docs/rules/no-implicit-coercion
    'no-implicit-coercion': 'off',

    // disallow variable and function declarations in the global scope
    // http://eslint.org/docs/rules/no-implicit-globals
    'no-implicit-globals': 'off',

    // disallow the use of eval()-like methods
    // http://eslint.org/docs/rules/no-implied-eval
    'no-implied-eval': 'warn',

    // disallow this keywords outside of classes or class-like objects
    // http://eslint.org/docs/rules/no-invalid-this
    'no-invalid-this': 'off',

    // disallow the use of the __iterator__ property
    // http://eslint.org/docs/rules/no-iterator
    'no-iterator': 'warn',

    // disallow labeled statements
    // http://eslint.org/docs/rules/no-labels
    'no-labels': 'off',

    // disallow unnecessary nested blocks
    // http://eslint.org/docs/rules/no-lone-blocks
    'no-lone-blocks': 'off',

    // disallow function declarations and expressions inside loop statements
    // http://eslint.org/docs/rules/no-loop-func
    'no-loop-func': 'off',

    // disallow magic numbers
    // http://eslint.org/docs/rules/no-magic-numbers
    'no-magic-numbers': ['off', {
      ignore: [],
      ignoreArrayIndexes: true,
      enforceConst: true,
      detectObjects: false
    }],

    // disallow multiple spaces
    // http://eslint.org/docs/rules/no-multi-spaces
    'no-multi-spaces': 'warn',

    // disallow multiline strings
    // http://eslint.org/docs/rules/no-multi-str
    'no-multi-str': 'warn',

    // disallow new operators outside of assignments or comparisons
    // http://eslint.org/docs/rules/no-new
    'no-new': 'warn',

    // disallow new operators with the Function object
    // http://eslint.org/docs/rules/no-new-func
    'no-new-func': 'error',

    // disallow new operators with the String, Number, and Boolean objects
    // http://eslint.org/docs/rules/no-new-wrappers
    'no-new-wrappers': 'warn',

    // disallow octal literals
    // http://eslint.org/docs/rules/no-octal
    'no-octal': 'error',

    // disallow octal escape sequences in string literals
    // http://eslint.org/docs/rules/no-octal-escape
    'no-octal-escape': 'error', // As of the ECMAScript 5 specification, octal escape sequences in string literals are deprecated and should not be used. Unicode escape sequences should be used instead.

    // disallow reassigning function parameters
    // http://eslint.org/docs/rules/no-param-reassign
    'no-param-reassign': 'off',

    // disallow the use of the __proto__ property
    // http://eslint.org/docs/rules/no-proto
    'no-proto': 'warn',

    // disallow variable redeclaration
    // http://eslint.org/docs/rules/no-redeclare
    'no-redeclare': 'error',

    // disallow certain properties on certain objects
    // http://eslint.org/docs/rules/no-restricted-properties
    'no-restricted-properties': 'off',

    // disallow assignment operators in return statements
    // http://eslint.org/docs/rules/no-return-assign
    'no-return-assign': 'warn',

    // disallow unnecessary return await
    // http://eslint.org/docs/rules/no-return-await
    'no-return-await': 'warn',

    // disallow javascript: urls
    // http://eslint.org/docs/rules/no-script-url
    'no-script-url': 'error',

    // disallow assignments where both sides are exactly the same
    // http://eslint.org/docs/rules/no-self-assign
    'no-self-assign': 'error',

    // disallow comparisons where both sides are exactly the same
    // http://eslint.org/docs/rules/no-self-compare
    'no-self-compare': 'off',

    // disallow comma operators
    // http://eslint.org/docs/rules/no-sequences
    'no-sequences': 'warn',

    // disallow throwing literals as exceptions
    // http://eslint.org/docs/rules/no-throw-literal
    'no-throw-literal': 'warn',

    // disallow unmodified loop conditions
    // http://eslint.org/docs/rules/no-unmodified-loop-condition
    'no-unmodified-loop-condition': 'error',

    // disallow unused expressions
    // http://eslint.org/docs/rules/no-unused-expressions
    'no-unused-expressions': 'off',

    // disallow unused labels
    // http://eslint.org/docs/rules/no-unused-labels
    'no-unused-labels': 'error',

    // disallow unnecessary calls to .call() and .apply()
    // http://eslint.org/docs/rules/no-useless-call
    'no-useless-call': 'warn',

    // disallow unnecessary concatenation of literals or template literals
    // http://eslint.org/docs/rules/no-useless-concat
    'no-useless-concat': 'warn',

    // disallow unnecessary escape characters
    // http://eslint.org/docs/rules/no-useless-escape
    'no-useless-escape': 'warn',

    // disallow redundant return statements
    // http://eslint.org/docs/rules/no-useless-return
    'no-useless-return': 'off',

    // disallow void operators
    // http://eslint.org/docs/rules/no-void
    'no-void': 'error',

    // disallow specified warning terms in comments
    // http://eslint.org/docs/rules/no-warning-comments
    'no-warning-comments': 'off',

    // disallow with statements
    // http://eslint.org/docs/rules/no-with
    'no-with': 'error',

    // require using Error objects as Promise rejection reasons
    // http://eslint.org/docs/rules/prefer-promise-reject-errors
    'prefer-promise-reject-errors': 'off',

    // enforce the consistent use of the radix argument when using parseInt()
    // http://eslint.org/docs/rules/radix
    radix: 'warn',

    // disallow async functions which have no await expression
    // http://eslint.org/docs/rules/require-await
    'require-await': 'off',

    // require var declarations be placed at the top of their containing scope
    // http://eslint.org/docs/rules/vars-on-top
    'vars-on-top': 'warn',

    // require parentheses around immediate function invocations
    // http://eslint.org/docs/rules/wrap-iife
    'wrap-iife': 'off',

    // require or disallow “Yoda” conditions
    // http://eslint.org/docs/rules/yoda
    yoda: 'off',

    // require or disallow strict mode directives
    // http://eslint.org/docs/rules/strict
    strict: 'off',

    // require or disallow initialization in variable declarations
    // http://eslint.org/docs/rules/init-declarations
    'init-declarations': 'off',

    // disallow catch clause parameters from shadowing variables in the outer scope
    // http://eslint.org/docs/rules/no-catch-shadow
    'no-catch-shadow': 'off',

    // disallow deleting variables
    // http://eslint.org/docs/rules/no-delete-var
    'no-delete-var': 'error',

    // disallow labels that share a name with a variable
    // http://eslint.org/docs/rules/no-label-var
    'no-label-var': 'warn',

    // disallow specified global variables
    // http://eslint.org/docs/rules/no-restricted-globals
    'no-restricted-globals': 'off',

    // disallow variable declarations from shadowing variables declared in the outer scope
    // http://eslint.org/docs/rules/no-shadow
    'no-shadow': 'error',

    // disallow identifiers from shadowing restricted names
    // http://eslint.org/docs/rules/no-shadow-restricted-names
    'no-shadow-restricted-names': 'error',

    // disallow the use of undeclared variables unless mentioned in /*global */ comments
    // http://eslint.org/docs/rules/no-undef
    'no-undef': 'error',

    // disallow initializing variables to undefined
    // http://eslint.org/docs/rules/no-undef-init
    'no-undef-init': 'warn',

    // disallow the use of undefined as an identifier
    // http://eslint.org/docs/rules/no-undefined
    'no-undefined': 'off',

    // disallow unused variables
    // http://eslint.org/docs/rules/no-unused-vars
    'no-unused-vars': 'warn',

    // disallow the use of variables before they are defined
    // http://eslint.org/docs/rules/no-use-before-define
    'no-use-before-define': ['error', { functions: true, classes: true, variables: true }],

    // require return statements after callbacks
    // http://eslint.org/docs/rules/callback-return
    'callback-return': 'off',

    // require require() calls to be placed at top-level module scope
    // http://eslint.org/docs/rules/global-require
    'global-require': 'warn',

    // require error handling in callbacks
    // http://eslint.org/docs/rules/handle-callback-err
    'handle-callback-err': 'off',

    // disallow require calls to be mixed with regular variable declarations
    // http://eslint.org/docs/rules/no-mixed-requires
    'no-mixed-requires': 'off',

    // disallow new operators with calls to require
    // http://eslint.org/docs/rules/no-new-require
    'no-new-require': 'error',

    // disallow string concatenation with __dirname and __filename
    // http://eslint.org/docs/rules/no-path-concat
    'no-path-concat': 'off',

    // disallow the use of process.env
    // http://eslint.org/docs/rules/no-process-env
    'no-process-env': 'off',

    // disallow the use of process.exit()
    // http://eslint.org/docs/rules/no-process-exit
    'no-process-exit': 'off',

    // disallow specified modules when loaded by require
    // http://eslint.org/docs/rules/no-restricted-modules
    'no-restricted-modules': 'off',

    // disallow synchronous methods
    // http://eslint.org/docs/rules/no-sync
    'no-sync': 'off',

    // enforce consistent spacing inside array brackets
    // http://eslint.org/docs/rules/array-bracket-spacing
    'array-bracket-spacing': ['warn', 'never'],

    // enforce consistent spacing inside single-line blocks
    // http://eslint.org/docs/rules/block-spacing
    'block-spacing': ['warn', 'always'],

    // enforce consistent brace style for blocks
    // http://eslint.org/docs/rules/brace-style
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],

    // enforce camelcase naming convention
    // http://eslint.org/docs/rules/camelcase
    camelcase: 'off',

    // enforce or disallow capitalization of the first letter of a comment
    // http://eslint.org/docs/rules/capitalized-comments
    'capitalized-comments': 'off',

    // require or disallow trailing commas
    // http://eslint.org/docs/rules/comma-dangle
    'comma-dangle': 'off',

    // enforce consistent spacing before and after commas
    // http://eslint.org/docs/rules/comma-spacing
    'comma-spacing': 'off',

    // enforce consistent comma style
    // http://eslint.org/docs/rules/comma-style
    'comma-style': 'off',

    // enforce consistent spacing inside computed property brackets
    // http://eslint.org/docs/rules/computed-property-spacing
    'computed-property-spacing': ['warn', 'never'],

    // enforce consistent naming when capturing the current execution context
    // http://eslint.org/docs/rules/consistent-this
    'consistent-this': 'off',

    // require or disallow newline at the end of files
    // http://eslint.org/docs/rules/eol-last
    'eol-last': ['warn', 'always'],

    // require or disallow spacing between function identifiers and their invocations
    // http://eslint.org/docs/rules/func-call-spacing
    'func-call-spacing': ['warn', 'never'],

    // require function names to match the name of the variable or property to which they are assigned
    // http://eslint.org/docs/rules/func-name-matching
    'func-name-matching': 'off',

    // require or disallow named function expressions
    // http://eslint.org/docs/rules/func-names
    'func-names': 'off',

    // enforce the consistent use of either function declarations or expressions
    // http://eslint.org/docs/rules/func-style
    'func-style': 'off',

    // disallow specified identifiers
    // http://eslint.org/docs/rules/id-blacklist
    'id-blacklist': 'off',

    // enforce minimum and maximum identifier lengths
    // http://eslint.org/docs/rules/id-length
    'id-length': 'off',

    // require identifiers to match a specified regular expression
    // http://eslint.org/docs/rules/id-match
    'id-match': 'off',

    // enforce consistent indentation
    // http://eslint.org/docs/rules/indent
    indent: 'off',

    // enforce consistent spacing between keys and values in object literal properties
    // http://eslint.org/docs/rules/key-spacing
    'key-spacing': ['warn', { beforeColon: false, afterColon: true }],

    // enforce consistent spacing before and after keywords
    // http://eslint.org/docs/rules/keyword-spacing
    'keyword-spacing': ['warn', {
      before: true,
      after: true,
      overrides: {
        return: { after: true },
        throw: { after: true },
        case: { after: true }
      }
    }],

    // enforce position of line comments
    // http://eslint.org/docs/rules/line-comment-position
    'line-comment-position': 'off',

    // enforce consistent linebreak style
    // http://eslint.org/docs/rules/linebreak-style
    'linebreak-style': 'off',

    // require empty lines around comments
    // http://eslint.org/docs/rules/lines-around-comment
    'lines-around-comment': 'off',

    // require or disallow newlines around directives
    // http://eslint.org/docs/rules/lines-around-directive
    'lines-around-directive': 'off',

    // enforce a maximum depth that blocks can be nested
    // http://eslint.org/docs/rules/max-depth
    'max-depth': 'off',

    // enforce a maximum line length
    // http://eslint.org/docs/rules/max-len
    'max-len': 'off',

    // enforce a maximum number of lines per file
    // http://eslint.org/docs/rules/max-lines
    'max-lines': 'off',

    // enforce a maximum depth that callbacks can be nested
    // http://eslint.org/docs/rules/max-nested-callbacks
    'max-nested-callbacks': 'off',

    // enforce a maximum number of parameters in function definitions
    // http://eslint.org/docs/rules/max-params
    'max-params': 'off',

    // enforce a maximum number of statements allowed in function blocks
    // http://eslint.org/docs/rules/max-statements
    'max-statements': 'off',

    // enforce a maximum number of statements allowed per line
    // http://eslint.org/docs/rules/max-statements-per-line
    'max-statements-per-line': 'off',

    // enforce newlines between operands of ternary expressions
    // http://eslint.org/docs/rules/multiline-ternary
    'multiline-ternary': 'off',

    // require constructor names to begin with a capital letter
    // http://eslint.org/docs/rules/new-cap
    'new-cap': ['warn', {
      newIsCap: true,
      newIsCapExceptions: [],
      capIsNew: false,
      capIsNewExceptions: ['Immutable.Map', 'Immutable.Set', 'Immutable.List']
    }],

    // require parentheses when invoking a constructor with no arguments
    // http://eslint.org/docs/rules/new-parens
    'new-parens': 'error',

    // require or disallow an empty line after variable declarations
    // http://eslint.org/docs/rules/newline-after-var
    'newline-after-var': 'off',

    // require an empty line before return statements
    // http://eslint.org/docs/rules/newline-before-return
    'newline-before-return': 'off',

    // require a newline after each call in a method chain
    // http://eslint.org/docs/rules/newline-per-chained-call
    'newline-per-chained-call': ['error', { ignoreChainWithDepth: 4 }],

    // disallow Array constructors
    // http://eslint.org/docs/rules/no-array-constructor
    'no-array-constructor': 'error',

    // disallow bitwise operators
    // http://eslint.org/docs/rules/no-bitwise
    'no-bitwise': 'off',

    // disallow continue statements
    // http://eslint.org/docs/rules/no-continue
    'no-continue': 'warn',

    // disallow inline comments after code
    // http://eslint.org/docs/rules/no-inline-comments
    'no-inline-comments': 'off',

    // disallow if statements as the only statement in else blocks
    // http://eslint.org/docs/rules/no-lonely-if
    'no-lonely-if': 'warn',

    // disallow mixed binary operators
    // http://eslint.org/docs/rules/no-mixed-operators
    'no-mixed-operators': ['off', {
      groups: [
        ['+', '-', '*', '/', '%', '**'],
        ['&', '|', '^', '~', '<<', '>>', '>>>'],
        ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
        ['&&', '||'],
        ['in', 'instanceof']
      ],
      allowSamePrecedence: false
    }],

    // disallow mixed spaces and tabs for indentation
    // http://eslint.org/docs/rules/no-mixed-spaces-and-tabs
    'no-mixed-spaces-and-tabs': 'error',

    // disallow use of chained assignment expressions
    // http://eslint.org/docs/rules/no-multi-assign
    'no-multi-assign': 'off',

    // disallow multiple empty lines
    // http://eslint.org/docs/rules/no-multiple-empty-lines
    'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1 }],

    // disallow negated conditions
    // http://eslint.org/docs/rules/no-negated-condition
    'no-negated-condition': 'off',

    // disallow nested ternary expressions
    // http://eslint.org/docs/rules/no-nested-ternary
    'no-nested-ternary': 'off',

    // disallow Object constructors
    // http://eslint.org/docs/rules/no-new-object
    'no-new-object': 'error',

    // disallow the unary operators ++ and --
    // http://eslint.org/docs/rules/no-plusplus
    'no-plusplus': 'off',

    // disallow specified syntax
    // http://eslint.org/docs/rules/no-restricted-syntax
    'no-restricted-syntax': 'off',

    // disallow all tabs
    // http://eslint.org/docs/rules/no-tabs
    'no-tabs': 'error',

    // disallow ternary operators
    // http://eslint.org/docs/rules/no-ternary
    'no-ternary': 'off',

    // disallow trailing whitespace at the end of lines
    // http://eslint.org/docs/rules/no-trailing-spaces
    'no-trailing-spaces': 'warn',

    // disallow dangling underscores in identifiers
    // http://eslint.org/docs/rules/no-underscore-dangle
    'no-underscore-dangle': 'off',

    // disallow ternary operators when simpler alternatives exist
    // http://eslint.org/docs/rules/no-unneeded-ternary
    'no-unneeded-ternary': 'warn',

    // disallow whitespace before properties
    // http://eslint.org/docs/rules/no-whitespace-before-property
    'no-whitespace-before-property': 'warn',

    // enforce the location of single-line statements
    // http://eslint.org/docs/rules/nonblock-statement-body-position
    'nonblock-statement-body-position': 'off',

    // enforce consistent line breaks inside braces
    // http://eslint.org/docs/rules/object-curly-newline
    'object-curly-newline': 'off',

    // enforce consistent spacing inside braces
    // http://eslint.org/docs/rules/object-curly-spacing
    'object-curly-spacing': ['warn', 'always'],

    // enforce placing object properties on separate lines
    // http://eslint.org/docs/rules/object-property-newline
    'object-property-newline': ['error', {
      allowMultiplePropertiesPerLine: true
    }],

    // enforce variables to be declared either together or separately in functions
    // http://eslint.org/docs/rules/one-var
    'one-var': 'off',

    // require or disallow newlines around variable declarations
    // http://eslint.org/docs/rules/one-var-declaration-per-line
    'one-var-declaration-per-line': ['warn', 'always'],

    // require or disallow assignment operator shorthand where possible
    // http://eslint.org/docs/rules/operator-assignment
    'operator-assignment': 'off',

    // enforce consistent linebreak style for operators
    // http://eslint.org/docs/rules/operator-linebreak
    'operator-linebreak': 'off',

    // require or disallow padding within blocks
    // http://eslint.org/docs/rules/padded-blocks
    'padded-blocks': 'off',

    // require quotes around object literal property names
    // http://eslint.org/docs/rules/quote-props
    'quote-props': ['error', 'as-needed', { keywords: false, unnecessary: true, numbers: false }],

    // enforce the consistent use of either backticks, double, or single quotes
    // http://eslint.org/docs/rules/quotes
    quotes: ['warn', 'single'],

    // require JSDoc comments
    // http://eslint.org/docs/rules/require-jsdoc
    'require-jsdoc': 'off',

    // require or disallow semicolons instead of ASI
    // http://eslint.org/docs/rules/semi
    semi: ['warn', 'always'],

    // enforce consistent spacing before and after semicolons
    // http://eslint.org/docs/rules/semi-spacing
    'semi-spacing': ['error', { before: false, after: true }],

    // require object keys to be sorted
    // http://eslint.org/docs/rules/sort-keys
    'sort-keys': 'off',

    // require variables within the same declaration block to be sorted
    // http://eslint.org/docs/rules/sort-vars
    'sort-vars': 'off',

    // enforce consistent spacing before blocks
    // http://eslint.org/docs/rules/space-before-blocks
    'space-before-blocks': ['warn', 'always'],

    // enforce consistent spacing before function definition opening parenthesis
    // http://eslint.org/docs/rules/space-before-function-paren
    'space-before-function-paren': ['warn', 'never'],

    // enforce consistent spacing inside parentheses
    // http://eslint.org/docs/rules/space-in-parens
    'space-in-parens': ['warn', 'never'],

    // require spacing around infix operators
    // http://eslint.org/docs/rules/space-infix-ops
    'space-infix-ops': 'warn',

    // enforce consistent spacing before or after unary operators
    // http://eslint.org/docs/rules/space-unary-ops
    'space-unary-ops': ['error', {
      words: true,
      nonwords: false
    }],

    // enforce consistent spacing after the // or /* in a comment
    // http://eslint.org/docs/rules/spaced-comment
    'spaced-comment': 'off',

    // require or disallow spacing between template tags and their literals
    // http://eslint.org/docs/rules/template-tag-spacing
    'template-tag-spacing': 'off',

    // require or disallow Unicode byte order mark (BOM)
    // http://eslint.org/docs/rules/unicode-bom
    'unicode-bom': 'off',

    // require parenthesis around regex literals
    // http://eslint.org/docs/rules/wrap-regex
    'wrap-regex': 'warn',

    // require braces around arrow function bodies
    // http://eslint.org/docs/rules/arrow-body-style
    'arrow-body-style': ['warn', 'as-needed', {
      requireReturnForObjectLiteral: false
    }],

    // require parentheses around arrow function arguments
    // http://eslint.org/docs/rules/arrow-parens
    'arrow-parens': ['warn', 'as-needed', {
      requireForBlockBody: true
    }],

    // enforce consistent spacing before and after the arrow in arrow functions
    // http://eslint.org/docs/rules/arrow-spacing
    'arrow-spacing': ['error', { before: true, after: true }],

    // require super() calls in constructors
    // http://eslint.org/docs/rules/constructor-super
    'constructor-super': 'error',

    // enforce consistent spacing around * operators in generator functions
    // http://eslint.org/docs/rules/generator-star-spacing
    'generator-star-spacing': 'off',

    // disallow reassigning class members
    // http://eslint.org/docs/rules/no-class-assign
    'no-class-assign': 'error',

    // disallow arrow functions where they could be confused with comparisons
    // http://eslint.org/docs/rules/no-confusing-arrow
    'no-confusing-arrow': ['warn', { allowParens: true }],

    // disallow reassigning const variables
    // http://eslint.org/docs/rules/no-const-assign
    'no-const-assign': 'error',

    // disallow duplicate class members
    // http://eslint.org/docs/rules/no-dupe-class-members
    'no-dupe-class-members': 'error',

    // disallow duplicate module imports
    // http://eslint.org/docs/rules/no-duplicate-imports
    'no-duplicate-imports': 'off',

    // disallow new operators with the Symbol object
    // http://eslint.org/docs/rules/no-new-symbol
    'no-new-symbol': 'error',

    // disallow specified modules when loaded by import
    // http://eslint.org/docs/rules/no-restricted-imports
    'no-restricted-imports': 'off',

    // disallow this/super before calling super() in constructors
    // http://eslint.org/docs/rules/no-this-before-super
    'no-this-before-super': 'error',

    // disallow unnecessary computed property keys in object literals
    // http://eslint.org/docs/rules/no-useless-computed-key
    'no-useless-computed-key': 'warn',

    // disallow unnecessary constructors
    // http://eslint.org/docs/rules/no-useless-constructor
    'no-useless-constructor': 'warn',

    // disallow renaming import, export, and destructured assignments to the same name
    // http://eslint.org/docs/rules/no-useless-rename
    'no-useless-rename': ['warn', {
      ignoreDestructuring: false,
      ignoreImport: false,
      ignoreExport: false
    }],

    // require let or const instead of var
    // http://eslint.org/docs/rules/no-var
    'no-var': 'warn',

    // require or disallow method and property shorthand syntax for object literals
    // http://eslint.org/docs/rules/object-shorthand
    'object-shorthand': ['warn', 'always', {
      ignoreConstructors: false,
      avoidQuotes: true
    }],

    // require arrow functions as callbacks
    // http://eslint.org/docs/rules/prefer-arrow-callback
    'prefer-arrow-callback': ['warn', {
      allowNamedFunctions: false,
      allowUnboundThis: true
    }],

    // require const declarations for variables that are never reassigned after declared
    // http://eslint.org/docs/rules/prefer-const
    'prefer-const': ['warn', {
      destructuring: 'any',
      ignoreReadBeforeAssign: true
    }],

    // require destructuring from arrays and/or objects
    // http://eslint.org/docs/rules/prefer-destructuring
    'prefer-destructuring': 'off',

    // disallow parseInt() in favor of binary, octal, and hexadecimal literals
    // http://eslint.org/docs/rules/prefer-numeric-literals
    'prefer-numeric-literals': 'off',

    // require rest parameters instead of arguments
    // http://eslint.org/docs/rules/prefer-rest-params
    'prefer-rest-params': 'off',

    // require spread operators instead of .apply()
    // http://eslint.org/docs/rules/prefer-spread
    'prefer-spread': 'warn',

    // require template literals instead of string concatenation
    // http://eslint.org/docs/rules/prefer-template
    'prefer-template': 'warn',

    // require generator functions to contain yield
    // http://eslint.org/docs/rules/require-yield
    'require-yield': 'error',

    // enforce spacing between rest and spread operators and their expressions
    // http://eslint.org/docs/rules/rest-spread-spacing
    'rest-spread-spacing': ['warn', 'never'],

    // enforce sorted import declarations within modules
    // http://eslint.org/docs/rules/sort-imports
    'sort-imports': 'off',

    // require symbol descriptions
    // http://eslint.org/docs/rules/symbol-description
    'symbol-description': 'off',

    // require or disallow spacing around embedded expressions of template strings
    // http://eslint.org/docs/rules/template-curly-spacing
    'template-curly-spacing': ['warn', 'never'],

    // require or disallow spacing around the * in yield* expressions
    // http://eslint.org/docs/rules/yield-star-spacing
    'yield-star-spacing': 'off',
  }
};
