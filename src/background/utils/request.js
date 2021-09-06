import qs from 'query-string';

export async function request(url, query) {
  if (query) {
    url += '?' + qs.stringify(query);
  }
  return await (await fetch(url)).json();
}
