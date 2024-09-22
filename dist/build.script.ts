import { PackageJSON } from '@npm/types';
import { build } from 'esbuild';
import { access, copyFile, readFile, rm, writeFile } from 'fs/promises';
import { resolve } from 'path';

const DEFAULT_CHARSET: 'utf8' = 'utf8';

const RESULT_BUNDLE_PATH: string = resolve(__dirname, 'bundle');

const ENTRY_POINT_FILE_NAME: string = 'index';
const ENTRY_POINT_PATH: string = resolve(__dirname, 'src', `${ENTRY_POINT_FILE_NAME}.ts`);

const TYPINGS_ENTRY_POINT_PATH: string = resolve(__dirname, 'tsc-out', 'bundle.d.ts');
const RESULT_BUNDLE_TYPINGS_PATH: string = resolve(RESULT_BUNDLE_PATH, `${ENTRY_POINT_FILE_NAME}.d.ts`);

const BUILD_TS_CONFIG_PATH: string = resolve(__dirname, 'tsconfig.build.json');

const PACKAGE_MANIFEST_FILE_NAME: string = 'package.json';
const PACKAGE_MANIFEST_SOURCE_FILE_PATH: string = resolve(__dirname, PACKAGE_MANIFEST_FILE_NAME);
const PACKAGE_MANIFEST_BUNDLE_FILE_PATH: string = resolve(RESULT_BUNDLE_PATH, PACKAGE_MANIFEST_FILE_NAME);

(async () => {
  await rm(RESULT_BUNDLE_PATH, { recursive: true, force: true });

  new Set([ENTRY_POINT_PATH, BUILD_TS_CONFIG_PATH, PACKAGE_MANIFEST_SOURCE_FILE_PATH]).forEach(
    async (entryPointPath: string) => {
      await access(entryPointPath);
    }
  );

  await build({
    entryPoints: [ENTRY_POINT_PATH],
    outdir: RESULT_BUNDLE_PATH,
    platform: 'browser',
    tsconfig: BUILD_TS_CONFIG_PATH,
    bundle: true,
    minify: true,
    splitting: true,
    format: 'esm',
    treeShaking: true,
    charset: DEFAULT_CHARSET,
    legalComments: 'external'
  });

  const { name, version }: PackageJSON = JSON.parse(
    await readFile(PACKAGE_MANIFEST_SOURCE_FILE_PATH, {
      encoding: DEFAULT_CHARSET
    })
  );

  if (name === undefined) {
    throw new Error('Package name is not defined');
  }

  if (version === undefined) {
    throw new Error('Package version is not defined');
  }

  const bundlePackageJsonContent: PackageJSON = {
    name,
    version,
    browser: `./${ENTRY_POINT_FILE_NAME}.js`,
    types: `./${ENTRY_POINT_FILE_NAME}.d.ts`,
    repository: {
      type: 'git',
      url: 'git+https://github.com/ScarletFlash/consy.git'
    },
    author: {
      email: 'scarletflash.dev@gmail.com',
      name: 'Fedor Usakov',
      url: 'https://scarletflash.github.io/'
    },
    license: 'MIT'
  };

  await writeFile(PACKAGE_MANIFEST_BUNDLE_FILE_PATH, JSON.stringify(bundlePackageJsonContent), {
    encoding: DEFAULT_CHARSET
  });

  await copyFile(TYPINGS_ENTRY_POINT_PATH, RESULT_BUNDLE_TYPINGS_PATH);
})();
