const Table = require('cli-table');
const axios = require('axios');
const path = require('path');
const readline = require('readline');
const yargs = require('yargs');
const { LocalStorage } = require('node-localstorage');

const API_URL = 'https://api.kocity.xyz';
const configDir = process.env.XDG_CONFIG_HOME || path.join(require('os').homedir(), '.config');
const localStorage = new LocalStorage(path.join(configDir, 'kocxyz'));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const validLangOptions = ['de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'pl', 'pt', 'ru', 'zh'];

async function register(username, code) {
  const response = await axios.post(`${API_URL}/auth/register/`, { username, code });
  return response;
}

async function login(code) {
  try {
    const response = await axios.post(`${API_URL}/auth/login/`, { code });
    return response;
  } catch (error) {
    if (error.response && error.response.status === 400 && error.response.data.type === 'no_account_found') {
      console.log('User not found. Registering a new user...');
      return await doRegister(code);
    } else {
      throw new Error(error.response.data.message);
    }
  }
}

function setLocalStorageValues(username, authToken) {
  localStorage.setItem('username', username);
  localStorage.setItem('authToken', authToken);
}

async function doRegister(code) {
  const username = await askQuestion('Enter Username, note: once registered you CANNOT change the username: ');
  const response = await register(username, code);

  if (response.status === 200) {
    const { username, authToken } = response.data;
    setLocalStorageValues(username, authToken);
    console.log(`You are registered and logged in as: ${localStorage.getItem('username')}`);
  }
}

async function doLogin() {
  console.log(`Open the following link to login: ${API_URL}/web/discord`);
  const code = await askQuestion('Enter Code: ');
  const response = await login(code);

  if (response && response.status === 200) {
    const { username, authToken } = response.data;
    setLocalStorageValues(username, authToken);
    console.log(`You are logged in as: ${localStorage.getItem('username')}`);
  } else {
    console.error('Login failed.');
  }
}

function displayTable(jsonData) {
  const head = Object.keys(jsonData[0]).map(header => header.toUpperCase());
  const table = new Table({ head });

  jsonData.forEach(row => table.push(Object.values(row)));

  console.log(table.toString());
}

async function getServers() {
  try {
    const response = await axios.get(`${API_URL}/stats/servers/`);
    const jsonData = response.data;
    displayTable(jsonData);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function getKey(server) {
  const { username, authToken } = localStorage;
  try {
    const response = await axios.post(`${API_URL}/auth/getkey`, { username, authToken, server });
    return response.data.authkey;
  } catch (error) {
    throw error;
  }
}

async function generateGameArgs(server) {
  const lang = yargs.argv.lang;
  const key = await getKey(server);
  const args = `-lang=${lang} -username=${key} -backend=${server}`;
  console.log(args);
}

async function askQuestion(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

(async () => {
  try {
    const customUsage = [
      'Usage: $0 [options]\n',
      'Examples:',
      '  $0 --auth',
      '    Perform login or register if not registered yet.\n',
      '  $0 --server',
      '    View available server(s).\n',
      '  $0 --lang fr --server fra-01.ko.hosmatic.com:23600',
      '    Generate launch arguments for the game executable.',
    ].join('\n');

    const argv = yargs
      .wrap(null)
      .usage(customUsage)
      .option('auth', {
        describe: 'Perform authentication',
        type: 'boolean',
        alias: 'a',
      })
      .option('lang', {
        describe: 'Preferred language',
        type: 'string',
        alias: 'l',
        default: 'en',
        choices: validLangOptions,
      })
      .option('server', {
        alias: 's',
        describe: 'Enter a server\'s IP address or domain, or leave it empty to view available servers.',
      })
      .conflicts('auth', 'server')
      .help('h')
      .alias('h', 'help')
      .alias('v', 'version')
      .strict()
      .argv;

    if (argv.auth) {
      await doLogin();
    } else if (typeof argv.server === 'string' && argv.server !== '') {
      await generateGameArgs(argv.server);
    } else if (typeof argv.server === 'boolean' && argv.server) {
      await getServers();
    } else if (!argv.lang || !argv.server) {
      yargs.showHelp();
      process.exit(1);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    rl.close();
  }
})();
