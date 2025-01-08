import { exec } from 'child_process';
import { build } from 'esbuild';
import { Dirent } from 'fs';
import { access, copyFile, mkdir, readdir, readFile, rm, writeFile } from 'fs/promises';
import { basename, join, resolve } from 'path';

const DEFAULT_CHARSET: 'utf8' = 'utf8';

const RESULT_BUNDLE_PATH: string = resolve(__dirname, 'unpacked-extension');

const DIALOG_FILE_NAME: string = 'index';
const DIALOG_DIRECTORY_PATH: string = resolve(__dirname, 'src', 'dialog');
const DIALOG_SCRIPT_PATH: string = resolve(DIALOG_DIRECTORY_PATH, `${DIALOG_FILE_NAME}.ts`);
const DIALOG_STYLES_FILE_NAME: string = `${DIALOG_FILE_NAME}.css`;
const DIALOG_LAYOUT_FILE_PATH: string = join(DIALOG_DIRECTORY_PATH, `${DIALOG_FILE_NAME}.html`);
const RESULT_BUNDLE_DIALOG_DIRECTORY_PATH: string = join(RESULT_BUNDLE_PATH, 'dialog');

const BUILD_TS_CONFIG_PATH: string = resolve(__dirname, 'tsconfig.build.json');

const PACKAGE_MANIFEST_FILE_NAME: string = 'package.json';
const PACKAGE_MANIFEST_SOURCE_FILE_PATH: string = resolve(__dirname, PACKAGE_MANIFEST_FILE_NAME);

const EXTENSION_MANIFEST_FILE_NAME: string = 'manifest.json';
const EXTENSION_MANIFEST_SOURCE_FILE_PATH: string = resolve(__dirname, EXTENSION_MANIFEST_FILE_NAME);
const EXTENSION_MANIFEST_RESULT_FILE_PATH: string = resolve(RESULT_BUNDLE_PATH, EXTENSION_MANIFEST_FILE_NAME);

const SOURCE_CODE_DIRECTORY_NAME: string = 'src';
const SOURCE_CODE_DIRECTORY_PATH: string = resolve(__dirname, SOURCE_CODE_DIRECTORY_NAME);

const GLOBAL_STYLES_ENTRY_POINT: string = resolve(DIALOG_DIRECTORY_PATH, DIALOG_STYLES_FILE_NAME);

const RESULT_BUNDLE_GLOBAL_STYLES_ENTRY_POINT: string = join(
  RESULT_BUNDLE_DIALOG_DIRECTORY_PATH,
  DIALOG_STYLES_FILE_NAME
);

const SOURCE_ASSETS_DIRECTORY_PATH: string = resolve(__dirname, 'node_modules/@consy/assets/');
const RESULT_BUNDLE_ASSETS_DIRECTORY_PATH: string = join(RESULT_BUNDLE_PATH, 'assets');

async function getAllNestedDirectoryPaths(entryPath: string): Promise<string[]> {
  const nestedPaths: string[] = [];
  const unwrappedNestedEntries: string[] = [entryPath];

  while (unwrappedNestedEntries.length !== 0) {
    const currentEntry: string | undefined = unwrappedNestedEntries.pop();
    if (currentEntry === undefined) {
      throw new Error('Unexpected undefined value.');
    }

    const nestedEntries: Dirent[] = await readdir(currentEntry, { withFileTypes: true });
    const nestedDirectories: Dirent[] = nestedEntries.filter((nestedEntry: Dirent) => nestedEntry.isDirectory());

    const nestedDirectoryPaths: string[] = nestedDirectories.map((nestedDirectory: Dirent) =>
      join(currentEntry, nestedDirectory.name)
    );
    nestedPaths.push(...nestedDirectoryPaths);
    unwrappedNestedEntries.push(...nestedDirectoryPaths);
  }

  return nestedPaths;
}

async function getNestedFilePaths(directoryPath: string): Promise<string[]> {
  return (await readdir(directoryPath, { withFileTypes: true }))
    .filter((entry: Dirent) => entry.isFile())
    .map((entry: Dirent) => join(directoryPath, entry.name));
}

interface GenerateCssParams {
  globalStylesInput: string;
  globalStylesOutput: string;
  contentPaths: string[];
}

async function generateCss({ contentPaths, globalStylesOutput, globalStylesInput }: GenerateCssParams) {
  return new Promise<void>((resolve: () => void, reject: (error: Error) => void) => {
    exec(
      `tailwindcss --input ${globalStylesInput} --output ${globalStylesOutput} --minify --no-autoprefixer --content ${contentPaths.join(',')}`
    ).on('close', (code: number) => {
      code === 0 ? resolve() : reject(new Error(`Tailwind CSS process exited with code ${code}`));
    });
  });
}

(async () => {
  await rm(RESULT_BUNDLE_PATH, { recursive: true, force: true });
  await mkdir(RESULT_BUNDLE_PATH, { recursive: true });
  await mkdir(RESULT_BUNDLE_DIALOG_DIRECTORY_PATH, { recursive: true });

  new Set([
    DIALOG_SCRIPT_PATH,
    BUILD_TS_CONFIG_PATH,
    PACKAGE_MANIFEST_SOURCE_FILE_PATH,
    GLOBAL_STYLES_ENTRY_POINT,
    EXTENSION_MANIFEST_SOURCE_FILE_PATH,
    SOURCE_ASSETS_DIRECTORY_PATH
  ]).forEach(async (entryPointPath: string) => {
    await access(entryPointPath);
  });

  const sourceCodeEntryFilePaths: string[] = (await getNestedFilePaths(SOURCE_CODE_DIRECTORY_PATH)).concat(
    DIALOG_SCRIPT_PATH
  );

  const typescriptEntryPaths: string[] = sourceCodeEntryFilePaths.filter(
    (entryPath: string) => entryPath.endsWith('.ts') || entryPath.endsWith('.tsx')
  );
  const layoutEntryPaths: string[] = [DIALOG_LAYOUT_FILE_PATH];

  const dialogFilePaths: string[] = (
    await Promise.all(
      [DIALOG_DIRECTORY_PATH]
        .concat(await getAllNestedDirectoryPaths(DIALOG_DIRECTORY_PATH))
        .map(async (directoryPath: string) => await getNestedFilePaths(directoryPath))
    )
  ).flat();

  await generateCss({
    globalStylesInput: GLOBAL_STYLES_ENTRY_POINT,
    globalStylesOutput: RESULT_BUNDLE_GLOBAL_STYLES_ENTRY_POINT,
    contentPaths: typescriptEntryPaths.concat(layoutEntryPaths).concat(DIALOG_DIRECTORY_PATH).concat(dialogFilePaths)
  });

  await build({
    entryPoints: typescriptEntryPaths,
    outdir: RESULT_BUNDLE_PATH,
    platform: 'browser',
    tsconfig: BUILD_TS_CONFIG_PATH,
    bundle: true,
    minify: true,
    splitting: false,
    format: 'iife',
    treeShaking: true,
    charset: DEFAULT_CHARSET,
    legalComments: 'none',
    keepNames: false,
    entryNames: '[dir]/[name]',
    loader: { '.ts': 'tsx' }
  });

  await Promise.all(
    layoutEntryPaths.map(async (layoutEntryPoint: string): Promise<void> => {
      const layoutFileName: string = basename(layoutEntryPoint);

      const rawLayoutContent: string = await readFile(layoutEntryPoint, { encoding: DEFAULT_CHARSET });
      const targetLayoutContent: string = rawLayoutContent.replaceAll(`.ts`, `.js`);

      const targetLayoutFilePath: string = join(RESULT_BUNDLE_DIALOG_DIRECTORY_PATH, layoutFileName);
      await writeFile(targetLayoutFilePath, targetLayoutContent, {
        encoding: DEFAULT_CHARSET
      });
    })
  );

  const rawManifestContent: string = await readFile(EXTENSION_MANIFEST_SOURCE_FILE_PATH, { encoding: DEFAULT_CHARSET });
  const modifiedManifestContent: string = rawManifestContent
    .replaceAll(`${SOURCE_CODE_DIRECTORY_NAME}/`, '')
    .replaceAll('node_modules/@consy/assets/', 'assets/')
    .replaceAll('.ts"', '.js"')
    .replace(`"$schema": "https://json.schemastore.org/chrome-manifest",`, '');

  await writeFile(EXTENSION_MANIFEST_RESULT_FILE_PATH, modifiedManifestContent, { encoding: DEFAULT_CHARSET });

  const iconsPaths: string[] = (
    await readdir(SOURCE_ASSETS_DIRECTORY_PATH, {
      withFileTypes: true
    })
  )
    .filter((assetsEntry: Dirent) => assetsEntry.isFile() && assetsEntry.name.includes('icon-'))
    .map((assetsEntry: Dirent) => join(SOURCE_ASSETS_DIRECTORY_PATH, assetsEntry.name));

  await mkdir(RESULT_BUNDLE_ASSETS_DIRECTORY_PATH, { recursive: true });
  await Promise.all(
    iconsPaths.map(async (iconPath: string): Promise<void> => {
      const iconFileName: string = basename(iconPath);

      const targetIconPath: string = join(RESULT_BUNDLE_ASSETS_DIRECTORY_PATH, iconFileName);
      await copyFile(iconPath, targetIconPath);
    })
  );
})();
