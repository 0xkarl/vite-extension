import LocalMessageDuplexStream from 'post-message-stream';

try {
  const container = document.head || document.documentElement;
  const scriptTag = document.createElement('script');
  scriptTag.setAttribute('async', 'false');
  scriptTag.src = chrome.runtime.getURL('./injected-script.js');
  container.insertBefore(scriptTag, container.children[0]);
  container.removeChild(scriptTag);
} catch (error) {
  console.error('provider injection failed.', error);
}

const CONTENT_SCRIPT = 'vite-contentscript';
const IN_PAGE = 'vite-injectedscript';

// setup a stream to process messages from injected script
// relay them to background script for processing
// pipe the result back to the background script
const stream = new LocalMessageDuplexStream({
  name: CONTENT_SCRIPT,
  target: IN_PAGE,
});

stream.on('data', (request) => {
  const { id, method, jsonrpc } = request.data;
  console.log('--> %s', method);

  // relay message to background script
  // relay result to injected script
  chrome.runtime.sendMessage(request, (response) => {
    if (!(response && (response.result || response.error))) {
      return;
    }
    console.log('<-- %s %o', method, response.result || response.error);
    stream.write({
      name: 'metamask-provider',
      data: {
        id,
        jsonrpc,
        ...response,
      },
    });
  });
});

// receive messages from injected script and,
// pipe them to the stream above
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (message?.target === 'vite-contentscript') {
    stream.write(message.data);
  }
  reply({});
});
