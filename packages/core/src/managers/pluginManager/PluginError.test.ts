import { PluginManager } from './PluginManager.ts'
import { PluginError } from './PluginError.ts'

import type { KubbConfig } from '../../types.ts'

describe('PluginError', () => {
  const config: KubbConfig = {
    root: '.',
    input: {
      path: './petStore.yaml',
    },
    output: {
      path: './src/gen',
      clean: true,
    },
    logLevel: 'info',
    plugins: [],
  }
  const onExecuteMock = vi.fn()
  const queueTaskMock = vi.fn()
  const pluginManager = new PluginManager(config, {
    onExecute: onExecuteMock,
    task: queueTaskMock,
  })

  test('can create custom Error ParallelPluginError', async () => {
    const error = new PluginError('message', { pluginManager })

    expect(error).toBeDefined()
    expect(error.pluginManager).toBe(pluginManager)
  })
})