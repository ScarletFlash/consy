import { BuildContext, context, ServeResult } from 'esbuild';
import { Dirent } from 'fs';
import { access, mkdir, readdir, readFile, rm, writeFile } from 'fs/promises';
import { basename, dirname, join, resolve } from 'path';

const DEFAULT_CHARSET: 'utf8' = 'utf8';

const SERVE_PATH: string = resolve(__dirname, 'serve');

const ENTRY_POINT_FILE_NAME: string = 'index';
const TS_ENTRY_POINT_FILE_NAME: string = `${ENTRY_POINT_FILE_NAME}.ts`;
const LAYOUT_ENTRY_POINT_FILE_NAME: string = `${ENTRY_POINT_FILE_NAME}.html`;

const BUILD_TS_CONFIG_PATH: string = resolve(__dirname, 'tsconfig.build.json');

(async () => {
  await rm(SERVE_PATH, { recursive: true, force: true });
  await mkdir(SERVE_PATH, { recursive: true });

  new Set([BUILD_TS_CONFIG_PATH]).forEach(async (entryPointPath: string) => {
    await access(entryPointPath);
  });

  const nestedDirectories: Dirent[] = (
    await readdir(__dirname, {
      withFileTypes: true
    })
  ).filter((entry: Dirent) => entry.isDirectory());

  const typeScriptEntryPoints: string[] = (
    await Promise.all(
      nestedDirectories.map(async (directory: Dirent): Promise<string | null> => {
        const directoryPath: string = resolve(__dirname, directory.name);
        const directoryFiles: string[] = await readdir(directoryPath);
        return directoryFiles.includes(TS_ENTRY_POINT_FILE_NAME) ? join(directoryPath, TS_ENTRY_POINT_FILE_NAME) : null;
      })
    )
  ).filter((entryPointFilePath: string | null): entryPointFilePath is string => entryPointFilePath !== null);

  await Promise.all(
    typeScriptEntryPoints.map(async (typeScriptEntryPoint: string): Promise<void> => {
      const layoutEntryPoint: string = typeScriptEntryPoint.replace(
        TS_ENTRY_POINT_FILE_NAME,
        LAYOUT_ENTRY_POINT_FILE_NAME
      );
      await access(layoutEntryPoint);

      const serveLayoutDirectoryPath: string = join(SERVE_PATH, basename(dirname(layoutEntryPoint)));
      await mkdir(serveLayoutDirectoryPath, { recursive: true });

      const rawLayoutContent: string = await readFile(layoutEntryPoint, { encoding: DEFAULT_CHARSET });
      const serveLayoutContent: string = rawLayoutContent.replace(`src="index.ts"`, `src="index.js"`);

      const serveLayoutPath: string = join(serveLayoutDirectoryPath, LAYOUT_ENTRY_POINT_FILE_NAME);
      await writeFile(serveLayoutPath, serveLayoutContent, {
        encoding: DEFAULT_CHARSET
      });
    })
  );

  const buildContext: BuildContext = await context({
    entryPoints: typeScriptEntryPoints,
    outdir: SERVE_PATH,
    platform: 'browser',
    tsconfig: BUILD_TS_CONFIG_PATH,
    bundle: true,
    minify: true,
    splitting: true,
    format: 'esm',
    treeShaking: true,
    charset: DEFAULT_CHARSET,
    legalComments: 'none',
    keepNames: true,
    entryNames: '[dir]/[name]'
  });

  const { host, port }: ServeResult = await buildContext.serve({ servedir: SERVE_PATH });
  console.log(`Serving at ${host}:${port}`);
})();
