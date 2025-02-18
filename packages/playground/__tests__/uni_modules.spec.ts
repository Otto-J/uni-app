import fs from 'fs'
import path from 'path'
import execa from 'execa'
import { sync } from 'fast-glob'

const projectDir = path.resolve(__dirname, '../uni_modules')

describe('uni_modules playground', () => {
  jest.setTimeout(50 * 1000)
  const modes = {
    'uni-app': [
      'build:app',
      'build:h5',
      //   'build:mp-alipay',
      //   'build:mp-baidu',
      //   'build:mp-kuaishou',
      //   'build:mp-lark',
      //   'build:mp-qq',
      //   'build:mp-toutiao',
      //   'build:mp-weixin',
    ],
    'uni-app-x': [
      // "build:app-android",
      'build:app-ios',
      'build:h5',
      //   'build:mp-alipay',
      //   'build:mp-baidu',
      //   'build:mp-kuaishou',
      //   'build:mp-lark',
      //   'build:mp-qq',
      //   'build:mp-toutiao',
      //   'build:mp-weixin',
    ],
  }
  Object.keys(modes).forEach((mode) => {
    const scripts = modes[mode]
    scripts.forEach((script) => {
      test(`${mode} ${script}`, async () => {
        const outDir = path.resolve(
          projectDir,
          'dist',
          'build',
          mode,
          script.replace('build:', '')
        )
        await execa('npm', ['run', script], {
          cwd: projectDir,
          env: {
            ...process.env,
            UNI_OUTPUT_DIR: outDir,
            UNI_COMPILE_TARGET: 'uni_modules',
          },
        })
        sync('**/*', { cwd: outDir, absolute: true }).forEach((file) => {
          expect(fs.readFileSync(file, 'utf-8')).toMatchSnapshot()
        })
      })
    })
  })
})
