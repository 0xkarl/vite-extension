const SUBSCRIBERS = {};

establishConnToBg();

function establishConnToBg() {
  const port = chrome.runtime.connect({
    name: Date.now().toString(),
  });

  port.onDisconnect.addListener(onPortDisconnect);

  port.onMessage.addListener(processSubscriptions);

  async function onPortDisconnect() {
    port.onMessage.removeListener(processSubscriptions);

    console.log(chrome.runtime.lastError);
  }
}

function processSubscriptions(message) {
  const subscribers = SUBSCRIBERS[message.name];
  if (subscribers) {
    subscribers.forEach((fn) => fn(message.data));
  }
}

export function subscribe(name, fn) {
  SUBSCRIBERS[name] = SUBSCRIBERS[name] || [];
  const index = SUBSCRIBERS.length;
  SUBSCRIBERS[name].push(fn);
  return () => SUBSCRIBERS[name].splice(index, 1);
}

export function send(name, payload) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ name, payload }, (response) => {
      if (chrome.runtime.lastError) {
        return;
      }
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response);
      }
    });
  });
}
