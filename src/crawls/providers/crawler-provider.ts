import RssParser from "rss-parser";
import { ICrawlerProvider } from "./interfaces";
export class CrawlerProvider implements ICrawlerProvider {
  open(): void {
    throw new Error("Method not implemented.");
  }
  getHtml(url: string): Promise<CheerioStatic | null> {
    throw new Error("Method not implemented.");
  }
  getRss(url: string | null): Promise<RssParser.Output> {
    throw new Error("Method not implemented.");
  }
  detectRssFeedsUrl(dom: CheerioStatic): string | null {
    throw new Error("Method not implemented.");
  }
}
