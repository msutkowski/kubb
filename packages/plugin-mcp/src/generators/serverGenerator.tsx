import { createReactGenerator } from '@kubb/plugin-oas'
import { useOas, useOperationManager } from '@kubb/plugin-oas/hooks'
import { getBanner, getFooter } from '@kubb/plugin-oas/utils'
import { File, useApp } from '@kubb/react'
import { Server } from '../components/Server'
import type { PluginMcp } from '../types'
import { pluginZodName } from '@kubb/plugin-zod'
import { pluginTsName } from '@kubb/plugin-ts'

export const serverGenerator = createReactGenerator<PluginMcp>({
  name: 'operations',
  Operations({ operations, options }) {
    const { pluginManager, plugin } = useApp<PluginMcp>()
    const oas = useOas()
    const { getFile, getName, getSchemas } = useOperationManager()

    const name = 'server'
    const file = pluginManager.getFile({ name, extname: '.ts', pluginKey: plugin.key })

    const jsonFile = pluginManager.getFile({ name: '.mcp', extname: '.json', pluginKey: plugin.key })

    const operationsMapped = operations.map((operation) => {
      return {
        operationId: operation.getOperationId(),
        description: operation.getDescription(),
        mcp: {
          name: getName(operation, {
            type: 'function',
            suffix: 'handler',
          }),
          file: getFile(operation),
        },
        zod: {
          name: getName(operation, {
            type: 'function',
            pluginKey: [pluginZodName],
          }),
          schemas: getSchemas(operation, { pluginKey: [pluginZodName], type: 'function' }),
          file: getFile(operation, { pluginKey: [pluginZodName] }),
        },
        type: {
          schemas: getSchemas(operation, { pluginKey: [pluginTsName], type: 'type' }),
        },
      }
    })

    const imports = operationsMapped.flatMap(({ mcp, zod }) => {
      return [
        <File.Import key={mcp.name} name={[mcp.name]} root={file.path} path={mcp.file.path} />,
        <File.Import
          key={zod.name}
          name={[zod.schemas.request?.name, zod.schemas.pathParams?.name, zod.schemas.queryParams?.name, zod.schemas.headerParams?.name].filter(Boolean)}
          root={file.path}
          path={zod.file.path}
        />,
      ]
    })

    return (
      <>
        <File
          baseName={file.baseName}
          path={file.path}
          meta={file.meta}
          banner={getBanner({ oas, output: options.output, config: pluginManager.config })}
          footer={getFooter({ oas, output: options.output })}
        >
          <File.Import name={['McpServer']} path={'@modelcontextprotocol/sdk/server/mcp'} />
          <File.Import name={['StdioServerTransport']} path={'@modelcontextprotocol/sdk/server/stdio'} />

          {imports}
          <Server name={name} serverName={oas.api.info?.title} serverVersion={oas.getVersion()} operations={operationsMapped} />
        </File>

        <File baseName={jsonFile.baseName} path={jsonFile.path} meta={jsonFile.meta}>
          <File.Source name={name}>
            {`
          {
            "mcpServers": {
              "${oas.api.info?.title || 'server'}": {
                "type": "stdio",
                "command": "npx",
                "args": ["tsx", "${file.path}"]
              }
            }
          }
          `}
          </File.Source>
        </File>
      </>
    )
  },
})
