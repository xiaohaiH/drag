module.exports = {
    root: true,
    env: {
        node: true,
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        // 四个空格
        indent: [2, 4, { SwitchCase: 1 }],
        // 结尾分号
        semi: [0],
        // 允许函数的返回值不主动声明
        '@typescript-eslint/explicit-module-boundary-types': [0],
        // 允许 ts 注释
        '@typescript-eslint/ban-ts-comment': [0],
        // vue 选项摆放顺序
        'vue/component-tags-order': [0],
        // 结尾单引号
        'comma-dangle': [2, 'always-multiline'],
        // 允许无用声明
        'no-unused-vars': [0],
        'no-undefined': [0],
        // 禁用无声明引用, 防止与类型声明起冲突
        'no-undef': [0],
        'spaced-comment': [0],
        // 箭头函数返回赋值
        'no-return-assign': [1],
        // 允许使用 any
        '@typescript-eslint/no-explicit-any': [0],
        // 允许使用禁用 ts 注释
        '@typescript-eslint/ban-ts-ignore': [0],
        // 允许无用的声明
        '@typescript-eslint/no-unused-vars': [1],
        // 允许无用的表达式 - 可选链
        'no-unused-expressions': [0],
        // 允许 ts 在声明前使用变量
        'no-use-before-define': [0],
        // 允许空的 interface 声明
        '@typescript-eslint/no-empty-interface': [0],
        // 允许在 promise 中使用 async
        'no-async-promise-executor': [0],
        // 允许重复导入(与 import/no-duplicates 冲突)
        'no-duplicate-imports': [0],
        // 禁止无用的声明
        // '@typescript-eslint/no-unused-vars': [2, {
        //     'vars': 'all',
        //     'args': 'after-used',
        //     'caughtErrors': 'none',
        //     'ignoreRestSiblings': true
        // }],
        // 禁止尖括号的类型断言
        // '@typescript-eslint/no-angle-bracket-type-assertion': [2],
        // 双斜杠注释后空格, 防止与 ts reference 起冲突.
        '@typescript-eslint/no-non-null-assertion': [0],
        // 允许下划线命名.
        '@typescript-eslint/camelcase': [0],
        // 允许使用三斜杠引入声明.
        '@typescript-eslint/triple-slash-reference': [0],
        // 允许使用命名空间.
        '@typescript-eslint/no-namespace': [0],
        // 方法最大支持的参数
        'max-params': [0],
        'prettier/prettier': [
            1,
            {
                printWidth: 120,
                singleQuote: true,
                tabWidth: 4,
                trailingComma: 'all',
                useEditorConfig: false,
                htmlWhitespaceSensitivity: 'ignore',
                arrowParens: 'always',
                endOfLine: 'auto',
            },
            {
                fileInfoOptions: {
                    withNodeModules: true,
                },
            },
        ],
    },
    overrides: [
        {
            files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
            env: {
                jest: true,
            },
        },
    ],
};
