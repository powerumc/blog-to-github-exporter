import * as Uri from "uri-js";

export function getNormalizeUriComponents(url: string, baseUrl?: string): Uri.URIComponents {
  if (url.endsWith("/")) {
    url = url.substring(0, url.length - 1);
  }

  let uri = Uri.parse(url);
  if (!uri.host) {
    uri = Uri.parse(Uri.resolve(baseUrl!, url));
  }

  return uri;
}

export function getNormalizeUrl(url: string, baseUrl?: string): string {
  return Uri.serialize(getNormalizeUriComponents(url, baseUrl));
}

export async function delay(ms: number): Promise<void> {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });
}