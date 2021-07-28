export function makeSureTrailingSlashInURL(url: string) {
  let returnURL = '';
  if (url.endsWith('/')) {
    returnURL = url;
  } else {
    returnURL = url + '/';
  }
  return returnURL;
}
