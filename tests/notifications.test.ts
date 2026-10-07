import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { createInitialState } from '../src/store/seed';
import { addDays, dateKey } from '../src/domain/dates';

const root = process.cwd();
const sdkRoot = path.join(root, 'node_modules/expo-notifications/build');
const compiled = path.join(root, 'artifacts/test/src/services');
const pushError = 'Android Push notifications are unavailable in Expo Go.';

function loadModule(file: string, requireModule: (id: string) => unknown) {
  const module = { exports: {} as Record<string, unknown> };
  const run = vm.runInNewContext(
    `(function (require, module, exports) { ${fs.readFileSync(file, 'utf8')}\n})`,
    { Date, Promise, console },
    { filename: file },
  );
  run(requireModule, module, module.exports);
  return module.exports;
}

function nativeHarness(granted = true) {
  const calls: { name: string; args: any[] }[] = [];
  const imports: string[] = [];
  let responseListener: ((value: any) => void) | undefined;
  let removed = false;
  const record =
    (name: string, result: unknown) =>
    async (...args: any[]) => {
      calls.push({ name, args });
      return result;
    };
  const sdk = {
    AndroidImportance: { DEFAULT: 3 },
    SchedulableTriggerInputTypes: { DATE: 'date' },
    setNotificationChannelAsync: record('channel', null),
    getPermissionsAsync: record('permissions', { granted }),
    requestPermissionsAsync: record('request', { granted }),
    setNotificationCategoryAsync: record('category', null),
    setNotificationHandler: (handler: unknown) =>
      calls.push({ name: 'handler', args: [handler] }),
    getAllScheduledNotificationsAsync: record('pending', [
      { identifier: 'dayflow-obsolete' },
      { identifier: 'another-app' },
    ]),
    cancelScheduledNotificationAsync: record('cancel', null),
    scheduleNotificationAsync: record('schedule', 'scheduled-id'),
    addNotificationResponseReceivedListener: (
      listener: (value: any) => void,
    ) => {
      responseListener = listener;
      return {
        remove: () => {
          removed = true;
        },
      };
    },
    getLastNotificationResponseAsync: async () => null,
    clearLastNotificationResponseAsync: async () => {},
  };
  const facade = loadModule(
    path.join(compiled, 'expo-local-notifications.native.js'),
    (id) => {
      imports.push(id);
      if (id === 'expo-notifications') throw new Error(pushError);
      if (id.startsWith('expo-notifications/build/')) return sdk;
      throw new Error(`Unexpected SDK import: ${id}`);
    },
  );
  const service = loadModule(
    path.join(compiled, 'notifications.native.js'),
    (id) => {
      imports.push(id);
      if (id === 'expo-notifications') throw new Error(pushError);
      if (id === './expo-local-notifications.native') return facade;
      if (id === 'react-native') return { Platform: { OS: 'android' } };
      if (id === '../domain/reminders')
        return require('../src/domain/reminders');
      throw new Error(`Unexpected service import: ${id}`);
    },
  ) as typeof import('../src/services/notifications.native');
  return {
    service,
    calls,
    imports,
    emit: (value: any) => responseListener?.(value),
    removed: () => removed,
  };
}

test('Android local service loads without importing the Expo Go-incompatible push barrel', () => {
  const harness = nativeHarness();
  assert.equal(harness.imports.includes('expo-notifications'), false);
  assert.equal(
    harness.calls.length,
    0,
    'importing the service must not prompt or schedule',
  );
  assert.equal(
    typeof harness.service.requestNotificationPermission,
    'function',
  );
});

test('actual SDK local import graph excludes push registration and push-token APIs', () => {
  const source = ts.createSourceFile(
    'facade.ts',
    fs.readFileSync(
      path.join(root, 'src/services/expo-local-notifications.native.ts'),
      'utf8',
    ),
    ts.ScriptTarget.Latest,
    true,
  );
  const roots = source.statements
    .filter(ts.isExportDeclaration)
    .filter((item) => !item.isTypeOnly)
    .map((item) => (item.moduleSpecifier as ts.StringLiteral).text);
  const seen = new Set<string>();
  function resolve(base: string) {
    const file = ['.android.js', '.native.js', '.js']
      .map((ext) => base + ext)
      .find(fs.existsSync);
    assert.ok(file, `SDK module exists: ${base}`);
    return file;
  }
  function visit(file: string) {
    if (seen.has(file)) return;
    seen.add(file);
    assert.doesNotMatch(
      path.basename(file),
      /^(index|DevicePushTokenAutoRegistration\.fx|TokenEmitter|getDevicePushTokenAsync|getExpoPushTokenAsync|warnOfExpoGoPushUsage|ServerRegistrationModule).*\.js$/,
    );
    const ast = ts.createSourceFile(
      file,
      fs.readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.JS,
    );
    for (const item of ast.statements) {
      if (!ts.isImportDeclaration(item) && !ts.isExportDeclaration(item))
        continue;
      if (!item.moduleSpecifier || !ts.isStringLiteral(item.moduleSpecifier))
        continue;
      const id = item.moduleSpecifier.text;
      assert.notEqual(
        id,
        'expo-notifications',
        'a local SDK dependency must not re-import the barrel',
      );
      if (id.startsWith('.'))
        visit(resolve(path.resolve(path.dirname(file), id)));
    }
  }
  roots.forEach((id) =>
    visit(
      resolve(path.join(sdkRoot, id.replace('expo-notifications/build/', ''))),
    ),
  );
  assert.ok(
    seen.size > 10,
    'inspect transitive SDK modules, not only the facade',
  );
});

test('local permission flow creates the Android channel and completion category', async () => {
  const { service, calls } = nativeHarness();
  assert.equal(await service.requestNotificationPermission(), true);
  assert.deepEqual(
    calls.map((c) => c.name),
    ['channel', 'permissions', 'category'],
  );
  assert.equal(calls[0].args[0], 'dayflow-calm');
  assert.equal(calls[2].args[1][0].identifier, 'COMPLETE');
  const denied = nativeHarness(false);
  assert.equal(await denied.service.requestNotificationPermission(), false);
  assert.equal(
    denied.calls.some((c) => c.name === 'category'),
    false,
  );
});

test('local reconciliation schedules reminders and focus completion while preserving other queues', async () => {
  const { service, calls } = nativeHarness();
  const state = createInitialState();
  state.preferences = {
    ...state.preferences,
    demo: false,
    notifications: true,
    review: false,
  };
  state.activities = [
    {
      ...state.activities[0],
      id: 'future-task',
      type: 'task',
      date: addDays(dateKey(), 1),
      time: '09:00',
      completedOn: [],
      leadMinutes: 5,
    },
  ];
  state.focus = {
    activityId: null,
    title: 'Focus',
    duration: 1500,
    remaining: 1500,
    startedAt: Date.now(),
    deadline: Date.now() + 1500000,
  };
  await service.reconcileNotifications(state);
  assert.deepEqual(
    calls.filter((c) => c.name === 'cancel').map((c) => c.args[0]),
    ['dayflow-obsolete'],
  );
  const notifications = calls
    .filter((c) => c.name === 'schedule')
    .map((c) => c.args[0]);
  assert.ok(
    notifications.some((n) => n.content.data.activityId === 'future-task'),
  );
  assert.ok(notifications.some((n) => n.identifier === 'dayflow-focus-finish'));
  assert.ok(
    notifications.every(
      (n) => n.trigger.type === 'date' && n.trigger.date.getTime() > Date.now(),
    ),
  );
});

test('local notification actions complete the correct occurrence and unsubscribe cleanly', () => {
  const harness = nativeHarness(),
    completions: string[][] = [];
  const stop = harness.service.listenForNotifications((id, date) =>
    completions.push([id, date]),
  );
  harness.emit({
    actionIdentifier: 'COMPLETE',
    notification: {
      request: {
        content: { data: { activityId: 'water', date: '2026-10-07' } },
      },
    },
  });
  harness.emit({
    actionIdentifier: 'OPEN',
    notification: {
      request: {
        content: { data: { activityId: 'water', date: '2026-10-08' } },
      },
    },
  });
  assert.deepEqual(completions, [['water', '2026-10-07']]);
  stop();
  assert.equal(harness.removed(), true);
});
