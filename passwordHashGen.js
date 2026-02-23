#!/usr/bin/env node
/* eslint-disable no-console */
const bcrypt = require("bcryptjs");
const readline = require("readline");

const SALT_ROUNDS = 10;

async function generateHash(password) {
  const trimmed = String(password || "").trim();
  if (!trimmed) {
    throw new Error("Password cannot be empty.");
  }
  if (trimmed.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
  const hash = await bcrypt.hash(trimmed, SALT_ROUNDS);
  return hash;
}

async function fromArgv() {
  const argPassword = process.argv[2];
  if (!argPassword) return false;
  const hash = await generateHash(argPassword);
  console.log("\nGenerated bcrypt hash:\n");
  console.log(hash);
  console.log("\nUse this value in your admin password field in DB.");
  return true;
}

async function fromPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const password = await new Promise((resolve) => {
    rl.question("Enter new admin password: ", (answer) => resolve(answer));
  });
  rl.close();

  const hash = await generateHash(password);
  console.log("\nGenerated bcrypt hash:\n");
  console.log(hash);
  console.log("\nUse this value in your admin password field in DB.");
}

(async () => {
  try {
    const usedArg = await fromArgv();
    if (!usedArg) {
      await fromPrompt();
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
})();
