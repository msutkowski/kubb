import { createMockedPluginManager, matchFiles } from '@kubb/core/mocks'

import path from 'node:path'
import type { Plugin } from '@kubb/core'
import type { HttpMethod } from '@kubb/oas'
import { parse } from '@kubb/oas'
import { OperationGenerator } from '@kubb/plugin-oas'
import { MutationKey, QueryKey } from '../components'
import type { PluginReactQuery } from '../types.ts'
import { queryGenerator } from './queryGenerator.tsx'

describe('queryGenerator operation', async () => {
  const testData = [
    {
      name: 'findByTags',
      input: '../../mocks/petStore.yaml',
      path: '/pet/findByTags',
      method: 'get',
      options: {},
    },
    {
      name: 'findByTagsPathParamsObject',
      input: '../../mocks/petStore.yaml',
      path: '/pet/findByTags',
      method: 'get',
      options: {
        pathParamsType: 'object',
      },
    },
    {
      name: 'findByTagsWithZod',
      input: '../../mocks/petStore.yaml',
      path: '/pet/findByTags',
      method: 'get',
      options: {
        parser: 'zod',
      },
    },
    {
      name: 'findByTagsWithCustomQueryKey',
      input: '../../mocks/petStore.yaml',
      path: '/pet/findByTags',
      method: 'get',
      options: {
        query: {
          methods: ['get'],
          importPath: '@tanstack/react-query',
        },
        queryKey(props) {
          const keys = QueryKey.getTransformer(props)
          return ['"test"', ...keys]
        },
      },
    },
    {
      name: 'clientGetImportPath',
      input: '../../mocks/petStore.yaml',
      path: '/pet/findByTags',
      method: 'get',
      options: {
        client: {
          dataReturnType: 'data',
          importPath: 'axios',
        },
      },
    },
    {
      name: 'clientDataReturnTypeFull',
      input: '../../mocks/petStore.yaml',
      path: '/pet/findByTags',
      method: 'get',
      options: {
        client: {
          dataReturnType: 'full',
          importPath: '@kubb/plugin-client/clients/axios',
        },
      },
    },
    {
      name: 'postAsQuery',
      input: '../../mocks/petStore.yaml',
      path: '/pet/{pet_id}',
      method: 'post',
      options: {
        query: {
          importPath: 'custom-query',
          methods: ['post'],
        },
      },
    },
    {
      name: 'findByTagsObject',
      input: '../../mocks/petStore.yaml',
      path: '/pet/findByTags',
      method: 'get',
      options: {
        paramsType: 'object',
        pathParamsType: 'object',
      },
    },
    {
      name: 'getPetIdCamelCase',
      input: '../../mocks/petStore.yaml',
      path: '/pet/{pet_id}',
      method: 'get',
      options: {
        paramsCasing: 'camelcase',
      },
    },
  ] as const satisfies Array<{
    input: string
    name: string
    path: string
    method: HttpMethod
    options: Partial<PluginReactQuery['resolvedOptions']>
  }>

  test.each(testData)('$name', async (props) => {
    const oas = await parse(path.resolve(__dirname, props.input))

    const options: PluginReactQuery['resolvedOptions'] = {
      client: {
        dataReturnType: 'data',
        importPath: '@kubb/plugin-client/clients/axios',
      },
      parser: 'zod',
      paramsCasing: undefined,
      paramsType: 'inline',
      pathParamsType: 'inline',
      queryKey: QueryKey.getTransformer,
      mutationKey: MutationKey.getTransformer,
      query: {
        importPath: '@tanstack/react-query',
        methods: ['get'],
      },
      mutation: {
        methods: ['post'],
        importPath: '@tanstack/react-query',
      },
      suspense: false,
      infinite: false,
      output: {
        path: '.',
      },
      group: undefined,
      ...props.options,
    }
    const plugin = { options } as Plugin<PluginReactQuery>
    const instance = new OperationGenerator(options, {
      oas,
      include: undefined,
      pluginManager: createMockedPluginManager(props.name),
      plugin,
      contentType: undefined,
      override: undefined,
      mode: 'split',
      exclude: [],
    })
    await instance.build(queryGenerator)

    const operation = oas.operation(props.path, props.method)
    const files = await queryGenerator.operation?.({
      operation,
      options,
      instance,
    })

    await matchFiles(files)
  })
})
