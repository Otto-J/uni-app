import path from 'path'
import fs from 'fs-extra'
import type {
  AliasOptions,
  BuildOptions,
  Plugin,
  ResolveFn,
  ResolvedConfig,
} from 'vite'
import {
  genEncryptEasyComModuleIndex,
  parseEncryptUniModules,
} from '../uni_modules'
import { cleanUrl, normalizePath } from './plugins/vitejs/utils'
import type { CssUrlReplacer } from './plugins/vitejs/plugins/css'

export function createEncryptCssUrlReplacer(
  resolve: ResolveFn
): CssUrlReplacer {
  return async (url, importer) => {
    if (url.startsWith('/') && !url.startsWith('//')) {
      // /static/logo.png => @/static/logo.png
      url = '@' + url
    }
    const resolved = await resolve(url, importer)
    if (resolved) {
      return (
        '@/' + normalizePath(path.relative(process.env.UNI_INPUT_DIR, resolved))
      )
    }
    return url
  }
}

export function uniEncryptUniModulesPlugin(): Plugin {
  let resolvedConfig: ResolvedConfig
  return {
    name: 'uni:encrypt-uni-modules',
    apply: 'build',
    config() {
      return {
        resolve: {
          alias: initEncryptUniModulesAlias(),
        },
        build: initEncryptUniModulesBuildOptions(process.env.UNI_INPUT_DIR),
      }
    },
    configResolved(config) {
      // 编译组件时，禁用内联资源
      config.build.assetsInlineLimit = 0
      config.build.rollupOptions.external = createExternal(config)
      resolvedConfig = config
    },
    resolveId(id) {
      if (resolvedConfig.assetsInclude(cleanUrl(id))) {
        return `\0${id}`
      }
    },
  }
}

function createExternal(config: ResolvedConfig) {
  return function external(source) {
    if (config.assetsInclude(cleanUrl(source))) {
      return true
    }
    if (
      [
        'vue',
        'plugin-vue:export-helper',
        'vue-router',
        'pinia',
        'vuex',
        'vue-i18n',
      ].includes(source)
    ) {
      return true
    }
    if (source.startsWith('@vue/')) {
      return true
    }
    if (source.startsWith('@dcloudio/')) {
      return true
    }
    if (source.startsWith('@/uni_modules/')) {
      return true
    }
    return false
  }
}

function initEncryptUniModulesAlias(): AliasOptions {
  return [
    {
      find: '\0plugin-vue:export-helper',
      replacement: 'plugin-vue:export-helper',
    },
  ]
}

function initEncryptUniModulesBuildOptions(inputDir: string): BuildOptions {
  const modules = parseEncryptUniModules(inputDir, false)
  const moduleNames = Object.keys(modules)
  if (!moduleNames.length) {
    throw new Error('No encrypt uni_modules found')
  }
  // 生成入口文件
  const input: { [entryAlias: string]: string } = {}
  moduleNames.forEach((module) => {
    const indexEncryptFile = path.resolve(
      inputDir,
      'uni_modules',
      module,
      'index.encrypt.js'
    )
    // 生成 index.encrypt.js，如果 length 为 0，说明是手动指定了 index.encrypt.js
    if (modules[module].length) {
      fs.writeFileSync(
        indexEncryptFile,
        genEncryptEasyComModuleIndex(modules[module])
      )
    }
    input['uni_modules/' + module + '/index.encrypt'] = indexEncryptFile
  })
  return {
    lib: false, // 不使用 lib 模式，lib模式会直接内联资源
    cssCodeSplit: false,
    outDir: process.env.UNI_OUTPUT_DIR,
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      input,
      output: {
        format: 'es',
        banner: ``,
        entryFileNames: '[name].js',
      },
    },
  }
}
