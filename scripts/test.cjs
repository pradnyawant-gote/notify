// Compile pure domain tests without tsx's OS account lookup, which is unavailable
// in some Windows sandboxes. No application or browser state is touched.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'artifacts', 'test');
const sources = ['src/domain', 'tests'];
const files = [
  'src/store/seed.ts',
  'src/store/validation.ts',
  'src/services/notifications.native.ts',
  'src/services/expo-local-notifications.native.ts',
];
for (const dir of sources)
  for (const file of fs.readdirSync(path.join(root, dir)))
    if (file.endsWith('.ts')) files.push(`${dir}/${file}`);
for (const file of files) {
  const dest = path.join(output, file.replace(/\.ts$/, '.js'));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const code = ts.transpileModule(
    fs.readFileSync(path.join(root, file), 'utf8'),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
      },
    },
  ).outputText;
  fs.writeFileSync(dest, code);
}
const result = spawnSync(
  process.execPath,
  [
    '--test',
    ...files
      .filter((file) => file.startsWith('tests/'))
      .map((file) => path.join(output, file.replace(/\.ts$/, '.js'))),
  ],
  { stdio: 'inherit' },
);
if (result.error) {
  console.error(result.error.message);
  process.exitCode = 1;
} else process.exitCode = result.status ?? 1;
