const SUBSCRIBERS = {};

const port = chrome.runtime.connect({
  name: '--',
});

// port.postMessage("Hi BackGround");
port.onMessage.addListener(function (message) {
  // console.log('msg %o', message);
  const subscribers = SUBSCRIBERS[message.name];
  if (subscribers) {
    subscribers.forEach((fn) => fn(message.data));
  }
});

export function subscribe(name, fn) {
  SUBSCRIBERS[name] = SUBSCRIBERS[name] || [];
  const index = SUBSCRIBERS.length;
  SUBSCRIBERS[name].push(fn);
  return () => SUBSCRIBERS[name].splice(index, 1);
}

export function send(name, payload) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ name, payload }, (response) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response);
      }
    });
  });
}
