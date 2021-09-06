import contentScript from './background-content-script';
import popup from './background-popup';

chrome.runtime.onMessage.addListener((message, sender, reply) => {
  onMessage(message, sender).then(reply);
  return true;
});

async function onMessage(message, sender) {
  try {
    if (message?.name === 'metamask-provider') {
      return { result: await contentScript(message, sender) };
    } else {
      return await popup(message, sender);
    }
  } catch (error) {
    let { code } = error;
    const { message } = error;
    code = code || 400;
    console.warn({ code, message });
    return { error: { code, message } };
  }
}

// popup({ name: 'unlock', payload: { password: 'q' } });
