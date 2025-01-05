import { exec } from 'child_process';
import { build } from 'esbuild';
import { Dirent } from 'fs';
import { access, copyFile, mkdir, readdir, readFile, rm, writeFile } from 'fs/promises';
import { basename, join, resolve } from 'path';

const DEFAULT_CHARSET: 'utf8' = 'utf8';

const RESULT_BUNDLE_PATH: string = resolve(__dirname, 'unpacked-extension');

const POPUP_FILE_NAME: string = 'popup';
const POPUP_SCRIPT_PATH: string = resolve(__dirname, 'src', `${POPUP_FILE_NAME}.ts`);
const POPUP_LAYOUT_FILE_NAME: string = `${POPUP_FILE_NAME}.html`;
const POPUP_STYLES_FILE_NAME: string = `${POPUP_FILE_NAME}.css`;

const BUILD_TS_CONFIG_PATH: string = resolve(__dirname, 'tsconfig.build.json');

const PACKAGE_MANIFEST_FILE_NAME: string = 'package.json';
const PACKAGE_MANIFEST_SOURCE_FILE_PATH: string = resolve(__dirname, PACKAGE_MANIFEST_FILE_NAME);

const EXTENSION_MANIFEST_FILE_NAME: string = 'manifest.json';
const EXTENSION_MANIFEST_SOURCE_FILE_PATH: string = resolve(__dirname, EXTENSION_MANIFEST_FILE_NAME);
const EXTENSION_MANIFEST_RESULT_FILE_PATH: string = resolve(RESULT_BUNDLE_PATH, EXTENSION_MANIFEST_FILE_NAME);

const SOURCE_CODE_DIRECTORY_NAME: string = 'src';
const SOURCE_CODE_DIRECTORY_PATH: string = resolve(__dirname, SOURCE_CODE_DIRECTORY_NAME);

const ROOT_LAYOUT_ENTRY_POINT: string = resolve(SOURCE_CODE_DIRECTORY_PATH, POPUP_LAYOUT_FILE_NAME);
const GLOBAL_STYLES_ENTRY_POINT: string = resolve(SOURCE_CODE_DIRECTORY_PATH, POPUP_STYLES_FILE_NAME);

const RESULT_BUNDLE_GLOBAL_STYLES_ENTRY_POINT: string = join(RESULT_BUNDLE_PATH, POPUP_STYLES_FILE_NAME);

const SOURCE_ASSETS_DIRECTORY_PATH: string = resolve(__dirname, 'node_modules/@consy/assets/');
const RESULT_BUNDLE_ASSETS_DIRECTORY_PATH: string = join(RESULT_BUNDLE_PATH, 'assets');

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

  new Set([
    POPUP_SCRIPT_PATH,
    BUILD_TS_CONFIG_PATH,
    PACKAGE_MANIFEST_SOURCE_FILE_PATH,
    GLOBAL_STYLES_ENTRY_POINT,
    EXTENSION_MANIFEST_SOURCE_FILE_PATH,
    SOURCE_ASSETS_DIRECTORY_PATH
  ]).forEach(async (entryPointPath: string) => {
    await access(entryPointPath);
  });

  const sourceCodeEntryPaths: string[] = (
    await readdir(SOURCE_CODE_DIRECTORY_PATH, {
      withFileTypes: true
    })
  )
    .filter((entry: Dirent) => entry.isFile())
    .map((entry: Dirent) => join(SOURCE_CODE_DIRECTORY_PATH, entry.name));

  const typescriptEntryPaths: string[] = sourceCodeEntryPaths.filter((entryPath: string) => entryPath.endsWith('.ts'));
  const layoutEntryPaths: string[] = sourceCodeEntryPaths.filter((entryPath: string) => entryPath.endsWith('.html'));

  await generateCss({
    globalStylesInput: GLOBAL_STYLES_ENTRY_POINT,
    globalStylesOutput: RESULT_BUNDLE_GLOBAL_STYLES_ENTRY_POINT,
    contentPaths: typescriptEntryPaths.concat(layoutEntryPaths).concat(ROOT_LAYOUT_ENTRY_POINT)
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
    keepNames: true,
    entryNames: '[dir]/[name]'
  });

  await Promise.all(
    layoutEntryPaths.map(async (layoutEntryPoint: string): Promise<void> => {
      const layoutFileName: string = basename(layoutEntryPoint);

      const rawLayoutContent: string = await readFile(layoutEntryPoint, { encoding: DEFAULT_CHARSET });
      const targetLayoutContent: string = rawLayoutContent.replaceAll(`.ts`, `.js`);

      const targetLayoutFilePath: string = join(RESULT_BUNDLE_PATH, layoutFileName);
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
