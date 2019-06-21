import RssParser from "rss-parser";

export interface ICrawlerProviderConstructor<TProvider extends ICrawlerProvider> {
  new (baseUrl: string): TProvider
}

export interface ICrawlerProvider {
  open(): void;
  getHtml(url: string): Promise<CheerioStatic | null>;
  getRss(url: string | null): Promise<RssParser.Output>;
  detectRssFeedsUrl(dom: CheerioStatic): string | null;
}

