const sharp = require("sharp");
const glob = require("glob");
const path = require("path");
const fs = require("fs");

async function createDirectory(directoryPath) {
  const newDirPath = path.dirname(directoryPath);
  if (!fs.existsSync(newDirPath)) {
    await fs.promises.mkdir(newDirPath, { recursive: true });
  }
}

function createNewPath(path, dir) {
  const newPathArr = path.split("/");
  // remove original from the path
  newPathArr.splice(1, 1);
  // add name of the collection
  newPathArr.splice(2, 0, dir);
  const newPath = newPathArr.join("/");

  return newPath;
}

function compressImages(dir, size) {
  const imagePaths = glob.sync("public/original/images/**/*.{jpg,jpeg,png}");
  return Promise.all(
    imagePaths.map(async (path) => {
      const optimizedImageBuffer = await sharp(path)
        .rotate()
        .resize({ width: size })
        .toBuffer();

      const newPath = createNewPath(path, dir);
      await createDirectory(newPath);

      await sharp(optimizedImageBuffer)
        .toFile(newPath)
        .catch((err) => console.error(err));
    })
  );
}

async function execute(params) {
  // script code
  await compressImages("thumbs", 1024);
  await compressImages("full", 2048);
  console.log("All images optimized!");
}

module.exports = execute;
