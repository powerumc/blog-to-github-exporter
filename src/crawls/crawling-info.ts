import * as fs from "fs";
import { ICrawlingContentInfo } from "./interfaces";

export class CrawlingInfo {
  urls: string[] = [];
  completedUrls: string[] = [];
  contents: {
    [url: string]: ICrawlingContentInfo;
  } = {};
  
  constructor() {
  }

  isIncludesQueue(url: string): boolean {
    return this.urls.includes(url) ||
      this.completedUrls.includes(url);
  }

  addQueue(url: string): void {
    this.urls.push(url);
  }

  popQueue(): string | null {
    const popUrls = this.urls.splice(0, 1);
    if (popUrls.length > 0) {
      return popUrls[0];
    }
    return null;
  }

  addCompleted(url: string): void {
    this.completedUrls.push(url);
  }

  addContent(info: ICrawlingContentInfo): void {
    this.contents[info.url] = info;
  }

  load(filename: string): boolean {
    if (!fs.existsSync(filename))
      return false;
    const data = JSON.parse(fs.readFileSync(filename).toString("utf8"));
    this.urls = data.urls;
    this.completedUrls = data.completedUrls;
    this.contents = data.contents;

    return true;
  }

  save(filename: string): void {
    fs.writeFileSync(filename, JSON.stringify({
      urls: this.urls,
      completedUrls: this.completedUrls,
      contents: this.contents
    }, null, 2));
  }
}
