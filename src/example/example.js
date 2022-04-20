import { HTTP_RPC } from '@vite/vitejs-http';
import { ViteAPI } from '@vite/vitejs';
import BigNumber from 'bignumber.js';
import './example.css';
import CONTRACT_ABI from './data/HelloWorld.abi.json';

let client,
  chainId,
  connectedContainer,
  connectButton,
  networkLabel,
  accountLabel,
  balanceLabel,
  form,
  accountAddress,
  unsubs = [];

window.onload = main;

async function main() {
  document.body.style.opacity = 1;
  connectedContainer = document.getElementById('connected-container');
  connectButton = document.getElementById('connect-wallet');
  networkLabel = document.getElementById('network-label');
  accountLabel = document.getElementById('account-label');
  balanceLabel = document.getElementById('balance-label');
  form = document.querySelector('form');

  connectButton.addEventListener('click', onConnect);
  form.addEventListener('submit', onSend);

  loadConnectedWallet();
}

async function loadConnectedWallet() {
  if (!window.vite) {
    return console.warn('window.vite not injected');
  }
  const [account] = await window.vite.request({
    method: 'vite_accounts',
  });
  if (!account) {
    return;
  }
  loadAccount(account);
}

async function onConnect() {
  if (!window.vite) {
    return alert('window.vite not injected');
  }
  const [account] = await window.vite.request({
    method: 'vite_requestAccounts',
  });
  if (!account) {
    return;
  }
  loadAccount(account);
}

async function loadAccount(account) {
  accountAddress = account;
  accountLabel.innerText = account;
  connectedContainer.classList.remove('hidden');
  connectButton.classList.add('hidden');

  await setupClient();
  window.vite.on('chainChanged', setupClient);
}

async function setupClient() {
  unsubs.forEach((u) => u());
  unsubs = [];

  chainId = parseInt(
    await window.vite.request({
      method: 'vite_chainId',
    })
  );
  networkLabel.innerText =
    chainId === 1 ? 'mainnet' : chainId === 2 ? 'testnet' : 'local';
  const provider = new HTTP_RPC(
    chainId === 1
      ? 'https://node.vite.net/gvite'
      : chainId === 2
      ? 'https://buidl.vite.net/gvite'
      : 'http://127.0.0.1:23456'
  );
  client = new ViteAPI(provider);
  subscribeToAccountBalanceChanges();
}

async function onSend(e) {
  e.preventDefault();

  const amount = form.amount.value;
  const address = form.address.value;

  sendBalance(address, amount);
}

async function subscribeToAccountBalanceChanges() {
  const loadBalance = async () => {
    const balanceInfo = await client.getBalanceInfo(accountAddress);
    const balance = !balanceInfo.balance.balanceInfoMap
      ? new BigNumber(0)
      : Object.values(balanceInfo.balance.balanceInfoMap).reduce(
          (balance, entry) => balance.plus(new BigNumber(entry.balance)),
          new BigNumber(0)
        );
    balanceLabel.innerText = balance.div(1e18).toFormat();
  };

  const subscribeToBalanceChanges = async () => {
    const eventName = 'newAccountBlocks';
    const event = await client.subscribe(eventName);
    event.on(loadBalance);
    unsubs.push(() => client.unsubscribe(event));
  };

  loadBalance();
  subscribeToBalanceChanges();
}

async function sendBalance(toAddress, amount) {
  console.log('sending', { fromAdress: accountAddress, toAddress, amount });

  const smartContractAddress =
    chainId === 1
      ? 'vite_06b7688d6a6c11f60a03aac65c1b8647de73058caa8f2cbcb3'
      : chainId === 2
      ? 'vite_e1b8547340961a0971573b8467c31fa70af9c1e7576f81eb1a'
      : 'vite_11f552d518819276128570232d65d6b3f72dc182aa68c5418b';

  const result = await window.vite.request({
    method: 'vite_createAccountBlock',
    params: {
      type: 'callContract',
      params: JSON.stringify({
        abi: CONTRACT_ABI,
        methodName: 'sayHello',
        amount: Number(amount * 1e18).toString(),
        toAddress: smartContractAddress,
        params: [toAddress],
      }),
    },
  });

  console.log({ result });
}
