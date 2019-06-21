import { URIComponents } from "uri-js";

export interface ICrawler {
  
}

export class CrawlingInfo {
  urls: string[] = [];
  completedUrls: string[] = [];
  objects: {
    [url: string]: ICrawlingPageInfo
  } = {};

  constructor() {
  }

  add(url: string, info: ICrawlingPageInfo): void {
    if (this.urls.includes(url)) return;
    if (this.completedUrls.includes(url)) return;

    this.urls.push(url);
    this.objects[url] = info;
  }

  addCompleted(url: string) {
    this.completedUrls.push(url);
  }

  pop(): ICrawlingPageInfo | null {
    const popUrls = this.urls.splice(0, 1);
    if (popUrls.length > 0) {
      return this.objects[popUrls[0]];
    }
    
    return null;
  }
}

export interface ICrawlingPageInfo {
  title: string;
  url: string;
  content: string | null;
}