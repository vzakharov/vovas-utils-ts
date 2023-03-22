import fs from 'fs';
import { ensure, logger } from "..";
import { encrypt } from './encryption';

export function encryptSecrets(filename: string = '.secrets.json') {
  // 1. Reads the `[root]/.secrets.json` file for the secrets (making sure it is git-ignored)
  // 2. Reads the (secret) process.env.ONE_ENV_KEY variable for the encryption key
  // 3. Encrypts the JSON string
  // 4. Compares the encrypted string to the (non-secret) process.env.ONE_ENV_ENCRYPTED variable
  // 5. If they are different, throws an error (so that the user can update the variable)
  // Note: If no .secrets.json file exists, gives a warning message but does not throw an error

  const secretsFilename = `${process.cwd()}/${filename}`;
  if ( !fs.existsSync(secretsFilename) ) {
    console.log(`\x1b[33mWarning: no ${secretsFilename} file found, skipping encryption`);
    return;
  }

  const gitIgnoreFilename = `${process.cwd()}/.gitignore`;
  if ( !fs.existsSync(gitIgnoreFilename) ) {
    throw new Error(`${secretsFilename} has to be git-ignored, but no ${gitIgnoreFilename} file found`);
  }
  const gitIgnore = fs.readFileSync(gitIgnoreFilename, 'utf8');
  if ( !gitIgnore.match(/^\s*\.1env\.secrets\.json\s*$/m) ) {
    throw new Error(`${secretsFilename} has to be git-ignored, but it is not in ${gitIgnoreFilename}`);
  }

  const secrets = JSON.parse(fs.readFileSync(secretsFilename, 'utf8'));
  const key = ensure(process.env.ONE_ENV_KEY);
  const encrypted = encrypt(JSON.stringify(secrets), key);

  if ( ensure(process.env.ONE_ENV_ENCRYPTED) !== encrypted ) {
    throw new Error(`ONE_ENV_ENCRYPTED variable is out of date, please update it to:\n${encrypted}`);
  }

  return encrypted;

};