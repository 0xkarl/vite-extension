import qs from 'query-string';

export async function get(url, query) {
  if (query) {
    url += '?' + qs.stringify(query);
  }
  return await (await fetch(url)).json();
}

export async function post(url, data) {
  return await (
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    })
  ).json();
}
