import fs from 'node:fs/promises';
import path from 'node:path';

const LOCAL_FILE = path.join(process.cwd(), 'data', 'content.json');

function getGitHubConfig() {
  const token = process.env.GITHUB_DATA_TOKEN;
  const repo = process.env.GITHUB_DATA_REPO;
  const dataPath = process.env.GITHUB_DATA_PATH || 'content.json';
  return { token, repo, dataPath };
}

function useGitHub() {
  const { token, repo } = getGitHubConfig();
  return Boolean(token && repo);
}

function githubHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    'User-Agent': 'panwei-portfolio'
  };
}

function fileUrl(repo, dataPath) {
  const encodedPath = dataPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `https://api.github.com/repos/${repo}/contents/${encodedPath}`;
}

async function readGitHub({ token, repo, dataPath }) {
  const response = await fetch(fileUrl(repo, dataPath), {
    headers: githubHeaders(token),
    cache: 'no-store'
  });

  if (response.status === 404) {
    throw new Error('DATA_FILE_NOT_FOUND');
  }
  if (!response.ok) {
    throw new Error(`GITHUB_READ_${response.status}`);
  }

  const data = await response.json();
  const text = Buffer.from(data.content, 'base64').toString('utf8');
  return {
    content: JSON.parse(text),
    sha: data.sha
  };
}

async function writeGitHub(content, { token, repo, dataPath }) {
  const serialized = `${JSON.stringify(content, null, 2)}\n`;
  const payload = {
    message: `chore: update site content (${new Date().toISOString()})`,
    content: Buffer.from(serialized, 'utf8').toString('base64')
  };

  let sha = null;
  try {
    const current = await readGitHub({ token, repo, dataPath });
    sha = current.sha;
  } catch (error) {
    if (error.message !== 'DATA_FILE_NOT_FOUND') throw error;
  }

  if (sha) payload.sha = sha;

  let response = await fetch(fileUrl(repo, dataPath), {
    method: 'PUT',
    headers: githubHeaders(token),
    body: JSON.stringify(payload)
  });

  if (response.status === 409 && sha) {
    const latest = await readGitHub({ token, repo, dataPath });
    payload.sha = latest.sha;
    response = await fetch(fileUrl(repo, dataPath), {
      method: 'PUT',
      headers: githubHeaders(token),
      body: JSON.stringify(payload)
    });
  }

  if (!response.ok) {
    throw new Error(`GITHUB_WRITE_${response.status}`);
  }

  return content;
}

async function readLocal() {
  const raw = await fs.readFile(LOCAL_FILE, 'utf8');
  return JSON.parse(raw);
}

async function writeLocal(content) {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
  return content;
}

export async function readContent() {
  if (useGitHub()) {
    const { content } = await readGitHub(getGitHubConfig());
    return content;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATA_STORE_NOT_CONFIGURED');
  }
  return readLocal();
}

export async function writeContent(content) {
  if (useGitHub()) {
    return writeGitHub(content, getGitHubConfig());
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATA_STORE_NOT_CONFIGURED');
  }
  return writeLocal(content);
}

export function storageMode() {
  if (useGitHub()) return 'github';
  if (process.env.NODE_ENV === 'production') return 'unconfigured';
  return 'local';
}
