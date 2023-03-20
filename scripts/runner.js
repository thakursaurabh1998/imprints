// import path from "path";
// import fs from "fs";
// import { loadEnvConfig } from "@next/env";

const path = require("path");
const fs = require("fs");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const runAsync = async () => {
  // find all scripts in subfolder
  const files = fs
    .readdirSync(path.join(__dirname, "image"))
    .filter((file) => file.endsWith(".js"))
    .sort();
  for (const file of files) {
    const {
      default: defaultFunc,
    }=  await import(
      `./image/${file}`
    );
    try {
      console.log(`Running pre-build script '${file}'`);
      await defaultFunc({ env: process.env });
    } catch (e) {
      console.error(
        `SCRIPT RUNNER: failed to execute pre-build script '${file}'`
      );
      console.error(e);
    }
  }
};

// Self-invocation async function
(async () => {
  await runAsync();
})().catch((err) => {
  console.error(err);
  throw err;
});
