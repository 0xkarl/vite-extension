import { HTTP_RPC } from '@vite/vitejs-http';
import { ViteAPI } from '@vite/vitejs';
import BigNumber from 'bignumber.js';
import './example.css';
import CONTRACT_ABI from './data/HelloWorld.abi.json';

const provider = new HTTP_RPC('http://127.0.0.1:23456');
const client = new ViteAPI(provider);

let connectedContainer,
  connectButton,
  accountLabel,
  balanceLabel,
  form,
  accountAddress;

window.onload = main;

async function main() {
  document.body.style.opacity = 1;
  connectedContainer = document.getElementById('connected-container');
  connectButton = document.getElementById('connect-wallet');
  accountLabel = document.getElementById('account-label');
  balanceLabel = document.getElementById('balance-label');
  form = document.querySelector('form');

  connectButton.addEventListener('click', onConnect);
  form.addEventListener('submit', onSend);

  loadConnectedWallet();
}
async function onConnect() {
  if (!window.vite) {
    return console.warn('window.vite not injected');
  }
  const [account] = await window.vite.request({
    method: 'eth_requestAccounts',
  });
  if (!account) {
    return;
  }
  accountAddress = account;
  accountLabel.innerText = account;
  connectedContainer.classList.remove('hidden');
  connectButton.classList.add('hidden');

  subscribeToAccountBalance(account);
}

async function onSend(e) {
  e.preventDefault();

  const amount = form.amount.value;
  const address = form.address.value;

  sendBalance(address, amount);
}

async function loadConnectedWallet() {
  if (!window.vite) {
    return console.warn('window.vite not injected');
  }
  const [account] = await window.vite.request({
    method: 'eth_accounts',
  });
  if (!account) {
    return;
  }
  accountAddress = account;
  accountLabel.innerText = account;
  connectedContainer.classList.remove('hidden');
  connectButton.classList.add('hidden');

  subscribeToAccountBalance(account);
}

async function subscribeToAccountBalance(accountAddress) {
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
  };

  loadBalance();
  subscribeToBalanceChanges();
}

async function sendBalance(toAddress, amount) {
  console.log('sending', { fromAdress: accountAddress, toAddress, amount });

  const smartContractAddress =
    'vite_0e56e42f1fa342647b877d37cd02f64b388b1b307820f26098';

  const result = await window.vite.request({
    method: 'eth_createAccountBlock',
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
