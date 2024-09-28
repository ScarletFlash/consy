import { exec } from 'child_process';
import { BuildContext, context, ServeResult } from 'esbuild';
import { Dirent } from 'fs';
import { access, copyFile, mkdir, readdir, readFile, rm, writeFile } from 'fs/promises';
import { basename, dirname, join, resolve } from 'path';

const DEFAULT_CHARSET: 'utf8' = 'utf8';

const SERVE_PATH: string = resolve(__dirname, 'serve');

const ENTRY_POINT_FILE_NAME: string = 'index';
const LAYOUT_ENTRY_POINT_FILE_NAME: string = `${ENTRY_POINT_FILE_NAME}.html`;
const GLOBAL_STYLES_ENTRY_POINT_FILE_NAME: string = `${ENTRY_POINT_FILE_NAME}.css`;

const BUILD_TS_CONFIG_PATH: string = resolve(__dirname, 'tsconfig.build.json');

const SOURCE_CODE_DIRECTORY_PATH: string = resolve(__dirname, 'src');

const ROOT_LAYOUT_ENTRY_POINT: string = resolve(SOURCE_CODE_DIRECTORY_PATH, LAYOUT_ENTRY_POINT_FILE_NAME);
const GLOBAL_STYLES_ENTRY_POINT: string = resolve(SOURCE_CODE_DIRECTORY_PATH, GLOBAL_STYLES_ENTRY_POINT_FILE_NAME);

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
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Tailwind CSS process exited with code ${code}`));
      }
    });
  });
}

(async () => {
  await rm(SERVE_PATH, { recursive: true, force: true });
  await mkdir(SERVE_PATH, { recursive: true });

  new Set([BUILD_TS_CONFIG_PATH, ROOT_LAYOUT_ENTRY_POINT, GLOBAL_STYLES_ENTRY_POINT]).forEach(
    async (entryPointPath: string) => {
      await access(entryPointPath);
    }
  );

  const sourceCodeNestedDirectories: Dirent[] = (
    await readdir(SOURCE_CODE_DIRECTORY_PATH, {
      withFileTypes: true
    })
  ).filter((entry: Dirent) => entry.isDirectory());

  const rawEntryPoints: string[] = (
    await Promise.all(
      sourceCodeNestedDirectories.map(async (directory: Dirent): Promise<string | null> => {
        const directoryPath: string = resolve(SOURCE_CODE_DIRECTORY_PATH, directory.name);
        const directoryFiles: string[] = await readdir(directoryPath);
        return directoryFiles.some((fileName: string) => fileName.startsWith(ENTRY_POINT_FILE_NAME))
          ? join(directoryPath, ENTRY_POINT_FILE_NAME)
          : null;
      })
    )
  ).filter((entryPointFilePath: string | null): entryPointFilePath is string => entryPointFilePath !== null);

  const layoutEntryPoints: string[] = rawEntryPoints.map((rawEntryPoint: string): string => `${rawEntryPoint}.html`);
  const typeScriptEntryPoints: string[] = rawEntryPoints.map((rawEntryPoint: string): string => `${rawEntryPoint}.ts`);

  await Promise.all(
    layoutEntryPoints.map(async (layoutEntryPoint: string): Promise<void> => {
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

  const serveRootLayoutPath: string = join(SERVE_PATH, LAYOUT_ENTRY_POINT_FILE_NAME);
  await copyFile(ROOT_LAYOUT_ENTRY_POINT, serveRootLayoutPath);

  const serveGlobalStylesPath: string = join(SERVE_PATH, GLOBAL_STYLES_ENTRY_POINT_FILE_NAME);

  await generateCss({
    globalStylesInput: GLOBAL_STYLES_ENTRY_POINT,
    globalStylesOutput: serveGlobalStylesPath,
    contentPaths: layoutEntryPoints.concat(typeScriptEntryPoints).concat(ROOT_LAYOUT_ENTRY_POINT)
  });

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

  console.log(`Serving at http://${host}:${port}/`);
})();
