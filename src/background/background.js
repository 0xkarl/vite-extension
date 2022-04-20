import contentScript from './background-content-script';
import popup from './background-popup';

// receive messages from either content script or popup
// process them and,
// relay result back to the sender
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  onMessage(message, sender).then(reply);
  return true;
});

async function onMessage(message, sender) {
  console.log('---');
  try {
    if (message?.name === 'metamask-provider') {
      return { result: await contentScript(message, sender) };
    } else {
      return await popup(message, sender);
    }
  } catch (error) {
    if (error.error) {
      return error;
    }
    let { code } = error;
    const { message } = error;
    code = code || 400;
    console.warn(error);
    console.trace();
    return { error: { code, message } };
  }
}

// popup({ name: 'unlock', payload: { password: 'q' } });
