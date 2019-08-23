/**
 * commitlint: https://commitlint.js.org/#/reference-configuration
 * @commitlint/config-conventional: https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional
 */
module.exports = {
  // extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        ':sparkles: feat',
        ':bug: fix',
        ':pencil: docs',
        ':lipstick: style',
        ':recycle: refactor',
        ':zap: perf',
        ':white_check_mark: test',
        ':wrench: chore',
        ':rewind: revert',
        ':construction: WIP',
        ':twisted_rightwards_arrows: merge'
      ]
    ],
    'body-leading-blank': [2, 'always'],
    // 'footer-leading-blank': [2, 'always'],
    'header-max-length': [2, 'always', 72],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'always', ['sentence-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', ['.']],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never']
  },
  parserPreset: {
    parserOpts: {
      headerPattern: /^(:\w*:\s\w*)(?:\((.*?)\))?((?:.*(?=\())|.*)/,
      headerCorrespondence: ['type', 'scope', 'subject']
    }
  }
}
