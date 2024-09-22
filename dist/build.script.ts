import { PackageJSON } from "@npm/types";
import { generateDtsBundle } from "dts-bundle-generator";
import { build } from "esbuild";
import { access, readFile, rm, writeFile } from "fs/promises";
import { resolve } from "path";

const DEFAULT_CHARSET: "utf8" = "utf8";

const RESULT_BUNDLE_PATH: string = resolve(__dirname, "bundle");

const ENTRY_POINT_FILE_NAME: string = "index";
const ENTRY_POINT_PATH: string = resolve(
  __dirname,
  "src",
  `${ENTRY_POINT_FILE_NAME}.ts`
);
const RESULT_BUNDLE_TYPINGS_PATH: string = resolve(
  RESULT_BUNDLE_PATH,
  `${ENTRY_POINT_FILE_NAME}.d.ts`
);

const BUILD_TS_CONFIG_PATH: string = resolve(__dirname, "tsconfig.build.json");

const PACKAGE_MANIFEST_FILE_NAME: string = "package.json";
const PACKAGE_MANIFEST_SOURCE_FILE_PATH: string = resolve(
  __dirname,
  PACKAGE_MANIFEST_FILE_NAME
);
const PACKAGE_MANIFEST_BUNDLE_FILE_PATH: string = resolve(
  RESULT_BUNDLE_PATH,
  PACKAGE_MANIFEST_FILE_NAME
);

(async () => {
  await rm(RESULT_BUNDLE_PATH, { recursive: true, force: true });

  new Set([
    ENTRY_POINT_PATH,
    BUILD_TS_CONFIG_PATH,
    PACKAGE_MANIFEST_SOURCE_FILE_PATH,
  ]).forEach(async (entryPointPath: string) => {
    await access(entryPointPath);
  });

  await build({
    entryPoints: [ENTRY_POINT_PATH],
    outdir: RESULT_BUNDLE_PATH,
    platform: "browser",
    tsconfig: BUILD_TS_CONFIG_PATH,
    bundle: true,
    minify: true,
    splitting: true,
    format: "esm",
    treeShaking: true,
    charset: DEFAULT_CHARSET,
    legalComments: "external",
  });

  const { name, version, dependencies, devDependencies }: PackageJSON =
    JSON.parse(
      await readFile(PACKAGE_MANIFEST_SOURCE_FILE_PATH, {
        encoding: DEFAULT_CHARSET,
      })
    );

  if (name === undefined) {
    throw new Error("Package name is not defined");
  }

  if (version === undefined) {
    throw new Error("Package version is not defined");
  }

  const bundlePackageJsonContent: PackageJSON = {
    name,
    version,
    browser: "./public-api.js",
    repository: {
      type: "git",
      url: "git+https://github.com/ScarletFlash/consy.git",
    },
    author: {
      email: "scarletflash.dev@gmail.com",
      name: "Fedor Usakov",
      url: "https://scarletflash.github.io/",
    },
    license: "MIT",
  };

  await writeFile(
    PACKAGE_MANIFEST_BUNDLE_FILE_PATH,
    JSON.stringify(bundlePackageJsonContent),
    {
      encoding: DEFAULT_CHARSET,
    }
  );

  const typingsBundle: string = generateDtsBundle([
    {
      filePath: ENTRY_POINT_PATH,

      libraries: {
        inlinedLibraries: Array.from(
          new Set(Object.keys(dependencies ?? {})).union(
            new Set(Object.keys(devDependencies ?? {}))
          )
        ),
      },
      output: {
        sortNodes: false,
        inlineDeclareExternals: true,
        inlineDeclareGlobals: true,
        noBanner: true,
        exportReferencedTypes: false,
      },
    },
  ]).join("\n");
  await writeFile(RESULT_BUNDLE_TYPINGS_PATH, typingsBundle, {
    encoding: DEFAULT_CHARSET,
  });
})();
