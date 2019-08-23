module.exports = {
  // git commit gitmoji 语义参考：https://gitmoji.carloscuesta.me/
  types: [
    { value: ':sparkles: feat', name: '✨     feat:     新功能/特性' },
    { value: ':bug: fix', name: '🐛      fix:     bug 修复' },
    { value: ':pencil: docs', name: '📝     docs:     文档或注释更新' },
    {
      value: ':lipstick: style',
      name:
        '💄    style:     格式\n                 (white-space, formatting, missing semi-colons, etc)',
    },
    {
      value: ':recycle: refactor',
      name: '♻️ refactor:     重构，即不是新增功能，也不是修改 bug 的代码变动',
    },
    {
      value: ':zap: perf',
      name: '⚡️     perf:     提升性能',
    },
    { value: ':white_check_mark: test', name: '✅     test:     测试' },
    {
      value: ':wrench: chore',
      name:
        '🔧     chore:    其他修改\n                  例如构建工具、依赖升级、merge代码',
    },
    { value: ':rewind: revert', name: '⏪    revert:    revert 提交' },
    { value: ':construction: WIP', name: '🚧      WIP:     进行中（临时提交）' },
    { value: ':twisted_rightwards_arrows: merge', name: '🔀     merge:      合并分支' },
  ],

  scopes: [{ name: '$article' }, { name: '$blog' }, { name: '$home' }, { name: '$song' }, { name: '$image' }, { name: '$category' }, { name: 'basic' }, { name: 'compile' }, { name: 'merge' }],

  // issues 相关
  allowTicketNumber: false,
  isTicketNumberRequired: false,
  ticketNumberPrefix: 'TICKET-',
  ticketNumberRegExp: '\\d{1,5}',

  // it needs to match the value for field type. Eg.: 'fix'
  /*
  scopeOverrides: {
    fix: [
      {name: 'merge'},
      {name: 'style'},
      {name: 'e2eTest'},
      {name: 'unitTest'}
    ]
  },
  */
  // override the messages, defaults are as follows
  messages: {
    type: "选择 commit 类型:",
    scope: '\n更改的范围 (可选):',
    // used if allowCustomScopes is true
    customScope: '请填写本次修改的范围:',
    subject: '简述（总结）本次的更改:\n',
    body: '详细描述，【如果有业务特殊逻辑请在代码注释中标明】 (用 "|" 换行):\n',
    breaking: '特殊的业务逻辑说明 (可选):\n',
    footer: '本次提交修正的相关 issues. E.g.: #31, #34:\n',
    confirmCommit: '请确定是否提交?',
  },

  allowCustomScopes: true,
  /**
   * 说明时候显示 breaking
   */
  allowBreakingChanges: [':sparkles: feat', ':bug: fix', ':recycle: refactor', ':construction: WIP'],
  // 需要跳过的问题
  skipQuestions: ['footer'],
  // limit subject length
  subjectLimit: 100,
  breakingPrefix: '特殊的业务逻辑说明: ',
  // breaklineChar: '|', // It is supported for fields body and footer.
  footerPrefix : 'ISSUES CLOSED:'
  // askForBreakingChangeFirst : true, // default is false
};