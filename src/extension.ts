import {
  ExtensionContext,
  workspace,
  ConfigurationChangeEvent,
  WorkspaceConfiguration,
  commands,
} from 'vscode';
import { watch } from 'chokidar';

let watchers: ReturnType<typeof import('chokidar').watch>[] = [];

export function activate(context: ExtensionContext) {
  onConfigChange(workspace.getConfiguration());

  context.subscriptions.push(
    workspace.onDidChangeConfiguration((configEvent: ConfigurationChangeEvent) => {
      if (configEvent.affectsConfiguration('cofc')) {
        onConfigChange(workspace.getConfiguration());
      }
    })
  );
}

async function onConfigChange(config: WorkspaceConfiguration) {
  const conf = config.get('cofc.commands');

  while (watchers.length !== 0) {
    const w = watchers.pop();
    w?.close();
  }

  if (Array.isArray(conf)) {
    for (let i = 0; i < conf.length; i++) {
      const item = conf[i] as { cmd: string; path: string };
      if (
        typeof item === 'object' &&
        typeof item.cmd === 'string' &&
        typeof item.path === 'string'
      ) {
        const watcher = watch(item.path);
        watcher.on('change', () => commands.executeCommand(item.cmd));
        watchers.push(watcher);
      }
    }
  }
}

export function deactivate() {}
