// import log from 'loglevel';
import LocalMessageDuplexStream from 'post-message-stream';
import { initializeProvider } from '@metamask/inpage-provider';

// log.setDefaultLevel(process.env.METAMASK_DEBUG ? 'debug' : 'warn');

const CONTENT_SCRIPT = 'vite-contentscript';
const IN_PAGE = 'vite-injectedscript';

const stream = new LocalMessageDuplexStream({
  name: IN_PAGE,
  target: CONTENT_SCRIPT,
});

initializeProvider({
  connectionStream: stream,
  // logger: log,
  shouldShimWeb3: true,
});

window.vite = window.ethereum;

// todo: clone @metamask/inpage-provider
delete window.ethereum;
