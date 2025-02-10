import antfu from '@antfu/eslint-config';

export default antfu(
    {
        'formatters': {
            css: true,
            html: true,
            markdown: true,
            graphql: true,
            // astro: true,
            // slidev: true,
        },
        // 'unocss': { strict: true },
        'typescript': { tsconfigPath: 'tsconfig.json' },
        // Enable the ESlint flat config support
        // (remove this if your ESLint extension above v3.0.5)
        // "eslint.experimental.useFlatConfig": true,

        // Disable the default formatter, use eslint instead
        'prettier.enable': false,
        'editor.formatOnSave': false,

        // Auto fix
        'editor.codeActionsOnSave': {
            'source.fixAll.eslint': 'explicit',
            'source.organizeImports': 'never',
        },

        'vue': {},
        'stylistic': {
            indent: 4,
            semi: true,
        },
        'rules': {
            /** 不允许出现 tab */
            'no-tabs': ['error', { allowIndentationTabs: false }],
            /** switch 冒号后面加空格 */
            'switch-colon-spacing': ['error', { after: true }],
            /** switch 冒号后面加空格 */
            'style/switch-colon-spacing': ['error', { after: true }],
            /** 调整导入顺序 */
            'perfectionist/sort-imports': [
                'error',
                {
                    groups: [
                        ['builtin-type', 'builtin'],
                        ['external-type', 'external'],
                        ['internal-type', 'internal'],
                        ['parent-type', 'parent'],
                        ['sibling-type', 'sibling'],
                        ['index-type', 'index'],
                        'object',
                        'side-effect',
                        'unknown',
                    ],
                    newlinesBetween: 'ignore',
                    internalPattern: ['^~/.*', '^@/.*'],
                },
            ],
            /** 必须存在分号 */
            'semi': ['error', 'always'],
            /** 必须存在分号 */
            'style/semi': ['warn', 'always'],
            // /** 4 个空格 */
            // 'indent': ['off'],
            // /** 4 个空格 */
            // 'ts/indent': ['error', 4, { SwitchCase: 1 }],
            // /** 尾随逗号 */
            // 'style/comma-dangle': ['error', 'always'],
            // /** 尾随逗号 */
            // 'comma-dangle': ['error', 'always'],
            /** 允许使用 const 进行枚举 */
            'no-restricted-syntax': ['off'],
            /** 允许 let 声明的变量不会被重赋值 */
            'prefer-const': ['off'],
            /** 允许 jsonc 出现尾随逗号 */
            'jsonc/comma-dangle': ['error', 'always-multiline'],
            /** 允许出现无用的 return */
            'no-useless-return': 'off',
            /** 箭头函数参数需要花括号包裹 */
            'style/arrow-parens': ['warn', 'always'],
            'arrow-parens': ['warn', 'always'],
            /** 每行语句数不能超过 1 句 */
            'style/max-statements-per-line': ['error', { max: 1 }],
            /** 每行语句数不能超过 1 句 */
            'max-statements-per-line': ['error', { max: 1 }],
            /** 不允许混合二进制运算符 */
            'no-mixed-operators': ['error'],
            /** 允许包含块内只有一句语句时, 省略包含块 */
            'curly': ['error', 'multi-line'],
            /** 允许语句与 if 同行 */
            'antfu/if-newline': ['off'],
            /** 导入语句后非导入语句时必须接空行 */
            'import/newline-after-import': ['error', { considerComments: false }],
            'no-unused-vars': ['off'],
            /** 声明变量未使用 */
            'unused-imports/no-unused-vars': 'off',
            /** 导入变量未使用 */
            'unused-imports/no-unused-imports': 'off',
            'no-console': 'warn',
            /** 不允许有空的代码块 */
            'no-empty': ['warn'],
            /** vue 组件未使用 */
            'vue/no-unused-components': ['warn'],
            /** vue 模块摆放顺序 */
            'vue/block-order': [
                'error',
                {
                    order: ['template', 'script', 'style'],
                },
            ],
            /** vue 属性是否必须以 - 连接(全小写以-分隔) */
            'vue/attribute-hyphenation': ['off'],
            'no-constant-condition': ['error', { checkLoops: false }],
            'no-constant-binary-expression': ['error'],
            /** 防止函数在变量上方时, 函数内部引用变量提示报错 */
            'ts/no-use-before-define': 'off',
            /** promise 函数定义后执行必须加上 await 或 .then */
            'ts/no-floating-promises': ['off'],
            /** 不允许 any 类型作为形参(eg: a: any; b(a)) */
            'ts/no-unsafe-argument': ['off'],
            /** 不允许将值转为 any(eg: a = 1 as any) */
            'ts/no-unsafe-assignment': ['off'],
            /** 禁止访问类型为 any 下的值(eg: (a as any).aa) */
            'ts/no-unsafe-member-access': ['off'],
            /** 不允许调用类型为 any 的值(eg: (a as any).join(')) */
            'ts/no-unsafe-call': ['off'],
            /** 禁止返回值类型为 any(eg: const a = () => '' as any */
            'ts/no-unsafe-return': ['off'],
            /** 允许空值和null之类的混用做判断(eg: []?.length) */
            'ts/strict-boolean-expressions': [
                'off',
                {
                    allowAny: true,
                    allowNullableBoolean: true,
                    allowNullableEnum: true,
                    allowNullableNumber: true,
                    allowNullableString: true,
                },
            ],
            /** 允许类型中使用空对象(eg: null as unknown as {}) */
            'ts/no-empty-object-type': ['off'],
        },
    },
    // {
    //     files: ['src/**/*.ts', 'scripts/**/*.ts', '*.ts', 'src/**/*.tsx', 'scripts/**/*.tsx', '*.tsx'],
    //     rules: {
    //         /** 允许在判断中字符串与null之类的空值混用 */
    //         'ts/strict-boolean-expressions': ['off', {}],
    //         /** 允许空对象声明 */
    //         'ts/no-empty-object-type': ['error', {
    //             allowInterfaces: 'always',
    //             allowObjectTypes: 'always',
    //         }],
    //     },
    // },
    {
        files: ['src/**/*.json', 'packages/**/*.json', '*.json'],
        rules: {
            /** jsonc 尾随逗号会应用到 json 文件中, 忽视项目中的 json */
            'jsonc/comma-dangle': ['error', 'never'],
        },
    },
    {
        ignores: ['.github/**/*.yml'],
    },
);
