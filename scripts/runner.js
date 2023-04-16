const path = require("path");
const fs = require("fs");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

async function main() {
  // get all the subfolders
  const subfolders = fs
    .readdirSync(path.join(__dirname), {
      withFileTypes: true,
    })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  // get all the script files in all the subfolders
  const filesPath = subfolders.reduce((filesList, subfolder) => {
    const dirFiles = fs
      .readdirSync(path.join(__dirname, subfolder))
      .filter((file) => file.endsWith(".js"))
      .map((fileName) => `./${subfolder}/${fileName}`);

    return filesList.concat(dirFiles);
  }, []);

  // run all the scripts one by one
  for (const filePath of filesPath) {
    const { default: defaultFunc } = await import(filePath);
    try {
      console.log(`Running pre-build script '${path.basename(filePath)}'`);
      await defaultFunc({ env: process.env });
    } catch (e) {
      console.error(
        `SCRIPT RUNNER: failed to execute pre-build script '${path.basename(filePath)}'`
      );
      console.error(e);
    }
  }
}

main().catch((err) => {
  console.error(err);
  throw err;
});
