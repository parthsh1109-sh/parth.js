const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

loadEnvFile();

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const DANCE_SONGS_DIR = path.join(__dirname, 'assets', 'songs');
const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
const GOOGLE_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const AI_PROVIDER = (process.env.AI_PROVIDER || 'openai').toLowerCase();
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5.4-mini';
const GOOGLE_MODEL = process.env.GOOGLE_MODEL || 'gemini-2.5-flash';
const PLACEHOLDER_API_KEY = 'your_openai_api_key_here';
const PLACEHOLDER_GOOGLE_KEY = 'your_google_gemini_api_key_here';
const DANCE_YOUTUBE_LINKS = [
  {
    title: 'YouTube Song 1',
    url: 'https://youtu.be/ShPTaCJqeFo?si=RBiaUQKrSA8gH0xw'
  },
  {
    title: 'YouTube Song 2',
    url: 'https://youtu.be/XcJVcyZ2vwE?si=iJ3tiOGlWj1LlBD1'
  },
  {
    title: 'YouTube Song 3',
    url: 'https://youtu.be/_5c6EmJurxc?si=nNfxC5SHKaXW5R85'
  }
];
const SAFE_COMMANDS = {
  instagram: {
    label: 'Instagram',
    type: 'url',
    url: 'https://www.instagram.com',
    keywords: ['instagram', 'insta']
  },
  whatsapp: {
    label: 'WhatsApp',
    type: 'url',
    url: 'https://web.whatsapp.com',
    keywords: ['whatsapp', 'whats app']
  },
  vscode: {
    label: 'VS Code',
    type: 'start',
    target: 'vscode://',
    keywords: ['vs code', 'vscode', 'visual studio code', 'code editor']
  },
  spotify: {
    label: 'Spotify',
    type: 'start',
    target: 'spotify:',
    keywords: ['spotify', 'spotyfy']
  },
  chrome: {
    label: 'Google Chrome',
    type: 'start',
    target: 'chrome',
    keywords: ['chrome', 'google chrome', 'browser']
  },
  microsoftStore: {
    label: 'Microsoft Store',
    type: 'start',
    target: 'ms-windows-store:',
    keywords: ['microsoft store', 'store', 'windows store']
  },
  fileExplorer: {
    label: 'File Explorer',
    type: 'app',
    command: 'explorer.exe',
    keywords: ['file explorer', 'files', 'windows file', 'folder', 'this pc', 'my computer']
  },
  downloads: {
    label: 'Downloads',
    type: 'app',
    command: 'explorer.exe',
    args: [path.join(process.env.USERPROFILE || '', 'Downloads')],
    keywords: ['downloads', 'download folder']
  },
  documents: {
    label: 'Documents',
    type: 'app',
    command: 'explorer.exe',
    args: [path.join(process.env.USERPROFILE || '', 'Documents')],
    keywords: ['documents', 'document folder']
  },
  notepad: {
    label: 'Notepad',
    type: 'app',
    command: 'notepad.exe',
    keywords: ['notepad', 'note pad', 'notes']
  },
  calculator: {
    label: 'Calculator',
    type: 'app',
    command: 'calc.exe',
    keywords: ['calculator', 'calc', 'hisab', 'calculation']
  },
  paint: {
    label: 'Paint',
    type: 'app',
    command: 'mspaint.exe',
    keywords: ['paint', 'drawing', 'draw']
  },
  youtube: {
    label: 'YouTube',
    type: 'url',
    url: 'https://www.youtube.com',
    keywords: ['youtube', 'you tube']
  },
  google: {
    label: 'Google',
    type: 'url',
    url: 'https://www.google.com',
    keywords: ['google', 'search']
  },
  gmail: {
    label: 'Gmail',
    type: 'url',
    url: 'https://mail.google.com',
    keywords: ['gmail', 'mail', 'email']
  },
  drive: {
    label: 'Google Drive',
    type: 'url',
    url: 'https://drive.google.com',
    keywords: ['drive', 'google drive']
  },
  maps: {
    label: 'Google Maps',
    type: 'url',
    url: 'https://maps.google.com',
    keywords: ['maps', 'google maps', 'map']
  },
  settings: {
    label: 'Windows Settings',
    type: 'start',
    target: 'ms-settings:',
    keywords: ['settings', 'windows settings', 'setting']
  },
  controlPanel: {
    label: 'Control Panel',
    type: 'app',
    command: 'control.exe',
    keywords: ['control panel']
  },
  taskManager: {
    label: 'Task Manager',
    type: 'app',
    command: 'taskmgr.exe',
    keywords: ['task manager', 'taskmanager']
  },
  terminal: {
    label: 'Windows Terminal',
    type: 'start',
    target: 'wt',
    keywords: ['terminal', 'windows terminal']
  },
  commandPrompt: {
    label: 'Command Prompt',
    type: 'app',
    command: 'cmd.exe',
    keywords: ['command prompt', 'cmd']
  },
  camera: {
    label: 'Camera',
    type: 'start',
    target: 'microsoft.windows.camera:',
    keywords: ['camera']
  },
  clock: {
    label: 'Clock',
    type: 'start',
    target: 'ms-clock:',
    keywords: ['clock', 'alarm']
  },
  calendar: {
    label: 'Calendar',
    type: 'start',
    target: 'outlookcal:',
    keywords: ['calendar']
  },
  photos: {
    label: 'Photos',
    type: 'start',
    target: 'ms-photos:',
    keywords: ['photos', 'photo viewer', 'gallery']
  },
  screenshot: {
    label: 'Snipping Tool',
    type: 'start',
    target: 'ms-screenclip:',
    keywords: ['screenshot', 'screen shot', 'snipping', 'snipping tool']
  },
  bluetooth: {
    label: 'Bluetooth Settings',
    type: 'start',
    target: 'ms-settings:bluetooth',
    keywords: ['bluetooth']
  },
  wifi: {
    label: 'Wi-Fi Settings',
    type: 'start',
    target: 'ms-settings:network-wifi',
    keywords: ['wifi', 'wi fi', 'internet settings']
  },
  display: {
    label: 'Display Settings',
    type: 'start',
    target: 'ms-settings:display',
    keywords: ['display settings', 'display']
  },
  sound: {
    label: 'Sound Settings',
    type: 'start',
    target: 'ms-settings:sound',
    keywords: ['sound settings', 'volume settings', 'audio settings']
  },
  recycleBin: {
    label: 'Recycle Bin',
    type: 'app',
    command: 'explorer.exe',
    args: ['shell:RecycleBinFolder'],
    keywords: ['recycle bin', 'dustbin']
  },
  desktop: {
    label: 'Desktop',
    type: 'app',
    command: 'explorer.exe',
    args: [path.join(process.env.USERPROFILE || '', 'Desktop')],
    keywords: ['desktop']
  },
  pictures: {
    label: 'Pictures',
    type: 'app',
    command: 'explorer.exe',
    args: [path.join(process.env.USERPROFILE || '', 'Pictures')],
    keywords: ['pictures', 'photos folder', 'image folder']
  },
  musicFolder: {
    label: 'Music Folder',
    type: 'app',
    command: 'explorer.exe',
    args: [path.join(process.env.USERPROFILE || '', 'Music')],
    keywords: ['music folder', 'songs folder']
  },
  videos: {
    label: 'Videos',
    type: 'app',
    command: 'explorer.exe',
    args: [path.join(process.env.USERPROFILE || '', 'Videos')],
    keywords: ['videos', 'video folder']
  },
  linkedin: {
    label: 'LinkedIn',
    type: 'url',
    url: 'https://www.linkedin.com',
    keywords: ['linkedin', 'linked in']
  },
  github: {
    label: 'GitHub',
    type: 'url',
    url: 'https://github.com',
    keywords: ['github', 'git hub']
  },
  chatgpt: {
    label: 'ChatGPT',
    type: 'url',
    url: 'https://chatgpt.com',
    keywords: ['chatgpt', 'chat gpt']
  },
  classroom: {
    label: 'Google Classroom',
    type: 'url',
    url: 'https://classroom.google.com',
    keywords: ['classroom', 'google classroom']
  },
  meet: {
    label: 'Google Meet',
    type: 'url',
    url: 'https://meet.google.com',
    keywords: ['meet', 'google meet']
  },
  canva: {
    label: 'Canva',
    type: 'url',
    url: 'https://www.canva.com',
    keywords: ['canva']
  }
};
const SEARCH_COMMANDS = [
  {
    label: 'YouTube Search',
    triggers: ['youtube search', 'search youtube', 'youtube par', 'youtube pe'],
    url: 'https://www.youtube.com/results?search_query='
  },
  {
    label: 'Google Search',
    triggers: ['google search', 'search google', 'google par', 'google pe', 'search for'],
    url: 'https://www.google.com/search?q='
  },
  {
    label: 'Spotify Search',
    triggers: ['spotify search', 'search spotify', 'spotify par', 'spotify pe'],
    url: 'https://open.spotify.com/search/'
  },
  {
    label: 'Maps Search',
    triggers: ['maps search', 'map search', 'maps par', 'location search'],
    url: 'https://www.google.com/maps/search/'
  }
];
const PARTH_PROFILE = {
  name: 'Parth',
  signature: 'Parth Sharma',
  title: 'First-year B.Tech student and learning developer',
  intro: 'Hello, my name is Parth Sharma. I am a first-year B.Tech student at Swami Keshwanand Institute of Technology. I am learning web development, backend development, AI concepts, automation, and software creation step by step. This project is my personal assistant experiment where I am practicing HTML, CSS, JavaScript, Node.js, voice recognition, local commands, and AI integration. My goal is to improve my programming skills, build useful tools, and understand how real software works from frontend to backend.',
  focus: [
    'Web development',
    'Node.js backend',
    'Voice recognition',
    'AI assistant workflows',
    'Automation and productivity tools'
  ],
  contact: {
    phone: '+91 8955362402',
    email: 'parthsh1109@gmail.com'
  }
};

function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const envFile = fs.readFileSync(envPath, 'utf8');
  const lines = envFile.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const equalIndex = trimmed.indexOf('=');

    if (equalIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalIndex).trim();
    const value = trimmed.slice(equalIndex + 1).trim().replace(/^["']|["']$/g, '');

    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function sendCorsPreflight(res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end();
}

function hasOpenAiKey() {
  return Boolean(
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY !== PLACEHOLDER_API_KEY
  );
}

function hasGoogleKey() {
  return Boolean(
    process.env.GOOGLE_API_KEY &&
    process.env.GOOGLE_API_KEY !== PLACEHOLDER_GOOGLE_KEY
  );
}

function hasActiveProviderKey() {
  if (AI_PROVIDER === 'google') {
    return hasGoogleKey();
  }

  return hasOpenAiKey();
}

function getLocalJarvisReply(message) {
  const text = message.toLowerCase();

  if (text.includes('hello') || text.includes('hi') || text.includes('hii')) {
    return 'Hello Parth. Jarvis backend online hai.';
  }

  if (text.includes('name')) {
    return 'Mera naam Jarvis hai. Main tumhara basic backend assistant hoon.';
  }

  if (text.includes('number') || text.includes('phone')) {
    return 'Tumhara number backend me +91 8955362402 saved hai.';
  }

  if (text.includes('time')) {
    return `Current server time: ${new Date().toLocaleTimeString()}`;
  }

  if (text.includes('project')) {
    return 'Project ready hai: frontend HTML/CSS aur backend Node.js server ke saath.';
  }

  return `Parth, maine suna: "${message}". Abhi main basic Jarvis hoon, baad me mujhe AI API se smart bana sakte hain.`;
}

function getTextFromOpenAIResponse(data) {
  if (typeof data.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const outputText = data.output
    ?.flatMap((item) => item.content || [])
    ?.filter((content) => content.type === 'output_text' && content.text)
    ?.map((content) => content.text)
    ?.join('\n')
    ?.trim();

  return outputText || 'Jarvis ko response mila, lekin text empty tha.';
}

async function getJarvisReply(message) {
  if (!hasActiveProviderKey()) {
    const keyName = AI_PROVIDER === 'google' ? 'GOOGLE_API_KEY' : 'AIzaSyCbKf0nBYxyZT9uxu4gGGTaKrhbNlmIlDQ';
    return `${getLocalJarvisReply(message)}\n\nTip: real AI reply ke liye .env me ${keyName} add karo.`;
  }

  if (AI_PROVIDER === 'google') {
    return getGoogleJarvisReply(message);
  }

  return getOpenAiJarvisReply(message);
}

async function getOpenAiJarvisReply(message) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  let response;

  try {
    response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        instructions: 'You are Jarvis, a helpful assistant for Parth. Reply in simple Hinglish unless the user asks otherwise. Keep answers short and practical.',
        input: message
      })
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('OpenAI API request timeout. Internet/API response slow hai.');
    }

    throw new Error(`OpenAI API se connect nahi ho pa raha: ${error.message}`);
  } finally {
    clearTimeout(timeout);
  }

  const data = await response.json();

  if (!response.ok) {
    const apiMessage = data.error?.message || 'OpenAI API request failed.';
    throw new Error(apiMessage);
  }

  return getTextFromOpenAIResponse(data);
}

function getTextFromGoogleResponse(data) {
  const text = data.candidates
    ?.flatMap((candidate) => candidate.content?.parts || [])
    ?.filter((part) => part.text)
    ?.map((part) => part.text)
    ?.join('\n')
    ?.trim();

  return text || 'Gemini se response mila, lekin text empty tha.';
}

async function getGoogleJarvisReply(message) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const url = `${GOOGLE_API_BASE_URL}/${GOOGLE_MODEL}:generateContent`;

  let response;

  try {
    response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'x-goog-api-key': process.env.GOOGLE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: 'You are Jarvis, a helpful assistant for Parth. Reply in simple Hinglish unless the user asks otherwise. Keep answers short and practical.'
            }
          ]
        },
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: message
              }
            ]
          }
        ]
      })
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Google Gemini API request timeout. Internet/API response slow hai.');
    }

    throw new Error(`Google Gemini API se connect nahi ho pa raha: ${error.message}`);
  } finally {
    clearTimeout(timeout);
  }

  const data = await response.json();

  if (!response.ok) {
    const apiMessage = data.error?.message || 'Google Gemini API request failed.';
    throw new Error(apiMessage);
  }

  return getTextFromGoogleResponse(data);
}

function handleJarvisApi(req, res) {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const data = JSON.parse(body || '{}');
      const message = String(data.message || '').trim();

      if (!message) {
        sendJson(res, 400, { reply: 'Please message bhejo.' });
        return;
      }

      const reply = await getJarvisReply(message);
      sendJson(res, 200, { reply });
    } catch (error) {
      sendJson(res, 500, {
        reply: `Jarvis API error: ${error.message}`
      });
    }
  });
}

function handleStatusApi(res) {
  sendJson(res, 200, {
    backend: 'online',
    provider: AI_PROVIDER,
    openaiKeyLoaded: hasOpenAiKey(),
    googleKeyLoaded: hasGoogleKey(),
    activeKeyLoaded: hasActiveProviderKey(),
    model: AI_PROVIDER === 'google' ? GOOGLE_MODEL : OPENAI_MODEL
  });
}

function handleProfileApi(res) {
  sendJson(res, 200, PARTH_PROFILE);
}

function normalizeCommandText(message) {
  return message.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function getCommandCatalog() {
  return Object.entries(SAFE_COMMANDS).map(([id, command]) => ({
    id,
    label: command.label,
    type: command.type,
    keywords: command.keywords,
    sample: `${command.keywords[0]} kholo`
  }));
}

function findSafeCommand(message) {
  const text = normalizeCommandText(message);

  return Object.values(SAFE_COMMANDS).find((safeCommand) =>
    safeCommand.keywords.some((keyword) => text.includes(keyword))
  );
}

function getSearchCommand(message) {
  const text = normalizeCommandText(message);
  const searchCommand = SEARCH_COMMANDS.find((command) =>
    command.triggers.some((trigger) => text.includes(trigger))
  );

  if (!searchCommand) {
    return null;
  }

  const trigger = searchCommand.triggers.find((item) => text.includes(item));
  const query = text
    .replace(trigger, '')
    .replace(/\b(search|karo|kar do|dhundo|find|play|chalao|chala do)\b/g, '')
    .trim();

  if (!query) {
    return null;
  }

  return {
    label: searchCommand.label,
    url: `${searchCommand.url}${encodeURIComponent(query)}`,
    query
  };
}

function getSystemInfo() {
  const memoryUsed = os.totalmem() - os.freemem();

  return {
    platform: os.platform(),
    release: os.release(),
    hostname: os.hostname(),
    user: os.userInfo().username,
    cpu: os.cpus()[0]?.model || 'unknown',
    cpuCores: os.cpus().length,
    uptimeSeconds: Math.round(os.uptime()),
    memoryUsedMb: Math.round(memoryUsed / 1024 / 1024),
    memoryTotalMb: Math.round(os.totalmem() / 1024 / 1024),
    serverTime: new Date().toLocaleString()
  };
}

function openUrl(url) {
  const opener = process.platform === 'win32'
    ? { command: 'cmd.exe', args: ['/c', 'start', '', url] }
    : process.platform === 'darwin'
      ? { command: 'open', args: [url] }
      : { command: 'xdg-open', args: [url] };

  const child = spawn(opener.command, opener.args, {
    detached: true,
    stdio: 'ignore',
    windowsHide: true
  });

  child.unref();
}

function openApp(command, args = []) {
  const child = spawn(command, args, {
    detached: true,
    stdio: 'ignore',
    windowsHide: true
  });

  child.unref();
}

function openStartTarget(target) {
  if (process.platform === 'win32') {
    openApp('cmd.exe', ['/c', 'start', '', target]);
    return;
  }

  openUrl(target);
}

function runSafeCommand(safeCommand) {
  if (safeCommand.type === 'url') {
    openUrl(safeCommand.url);
    return;
  }

  if (safeCommand.type === 'start') {
    openStartTarget(safeCommand.target);
    return;
  }

  openApp(safeCommand.command, safeCommand.args || []);
}

function handleCommandApi(req, res) {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    try {
      const data = JSON.parse(body || '{}');
      const message = String(data.message || '').trim();

      if (!message) {
        sendJson(res, 400, { ok: false, reply: 'Command empty hai.' });
        return;
      }

      const searchCommand = getSearchCommand(message);

      if (searchCommand) {
        openUrl(searchCommand.url);
        sendJson(res, 200, {
          ok: true,
          reply: `${searchCommand.label} me "${searchCommand.query}" search kar raha hoon.`
        });
        return;
      }

      const safeCommand = findSafeCommand(message);

      if (!safeCommand) {
        sendJson(res, 404, {
          ok: false,
          reply: 'Ye command allowlist me nahi hai. Try: youtube, instagram, whatsapp, vs code, spotify, chrome, store, file explorer, gmail, drive.'
        });
        return;
      }

      runSafeCommand(safeCommand);
      sendJson(res, 200, {
        ok: true,
        reply: `${safeCommand.label} open kar raha hoon.`
      });
    } catch (error) {
      sendJson(res, 500, {
        ok: false,
        reply: `Command error: ${error.message}`
      });
    }
  });
}

function handleCommandsApi(res) {
  sendJson(res, 200, {
    commands: getCommandCatalog(),
    searches: SEARCH_COMMANDS.map((command) => ({
      label: command.label,
      sample: `${command.triggers[0]} your topic`
    }))
  });
}

function handleSystemInfoApi(res) {
  sendJson(res, 200, getSystemInfo());
}

function getSongTitle(fileName) {
  return path
    .basename(fileName, path.extname(fileName))
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function handleDanceWithMeApi(res) {
  if (!fs.existsSync(DANCE_SONGS_DIR)) {
    fs.mkdirSync(DANCE_SONGS_DIR, { recursive: true });
  }

  const songs = fs
    .readdirSync(DANCE_SONGS_DIR)
    .filter((file) => ['.mp3', '.m4a', '.wav', '.ogg'].includes(path.extname(file).toLowerCase()))
    .map((file) => ({
      title: getSongTitle(file),
      file,
      source: 'local',
      url: `/assets/songs/${encodeURIComponent(file)}`
    }));

  const youtubeSongs = DANCE_YOUTUBE_LINKS.map((song) => ({
    ...song,
    file: 'YouTube link',
    source: 'youtube'
  }));

  sendJson(res, 200, {
    status: 'ready',
    songs: [...youtubeSongs, ...songs]
  });
}

function serveStaticFile(req, res) {
  const requestedPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(PUBLIC_DIR, requestedPath);
  const safePath = path.normalize(filePath);

  if (!safePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(safePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(safePath);
    const contentTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.mp3': 'audio/mpeg',
      '.m4a': 'audio/mp4',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg'
    };

    res.writeHead(200, {
      'Content-Type': contentTypes[ext] || 'text/plain'
    });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    sendCorsPreflight(res);
    return;
  }

  if (req.method === 'POST' && req.url === '/api/jarvis') {
    handleJarvisApi(req, res);
    return;
  }

  if (req.method === 'POST' && req.url === '/api/command') {
    handleCommandApi(req, res);
    return;
  }

  if (req.method === 'GET' && req.url === '/api/status') {
    handleStatusApi(res);
    return;
  }

  if (req.method === 'GET' && req.url === '/api/profile') {
    handleProfileApi(res);
    return;
  }

  if (req.method === 'GET' && req.url === '/api/commands') {
    handleCommandsApi(res);
    return;
  }

  if (req.method === 'GET' && req.url === '/api/system-info') {
    handleSystemInfoApi(res);
    return;
  }

  if (req.method === 'GET' && req.url === '/api/dance-with-me') {
    handleDanceWithMeApi(res);
    return;
  }

  if (req.method === 'GET') {
    serveStaticFile(req, res);
    return;
  }

  res.writeHead(405);
  res.end('Method not allowed');
});

server.listen(PORT, () => {
  console.log(`Jarvis backend running at http://localhost:${PORT}`);
});
