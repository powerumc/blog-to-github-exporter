import * as Uri from "uri-js";

export function getNormalizeUriComponents(url: string, baseUrl?: string): Uri.URIComponents {
  let uri = Uri.parse(url);
  if (!uri.host) {
    uri = Uri.parse(Uri.resolve(baseUrl!, url));
  }

  return uri;
}

export function getNormalizeUrl(url: string, baseUrl?: string): string {
  return removeEndsWith(Uri.serialize(getNormalizeUriComponents(url, baseUrl)), "/");
}

export async function delay(ms: number): Promise<void> {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });
}

function removeEndsWith(str: string, c: string) {
  if (str.endsWith(c)) {
    return str.substring(0, str.length - c.length);
  }

  return str;
}