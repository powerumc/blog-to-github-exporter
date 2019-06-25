import process from "process";
import fs from "fs";
import * as Uri from "uri-js";
import { ICrawler, CrawlingInfo, ICrawlingContentInfo } from "./interfaces";
import { CrawlerProvider, ICrawlerProviderConstructor } from "./providers"
import { IImporterProviderConstructor, IImporterProvider } from "../providers";
import { getNormalizeUrl } from "..";
import { getNormalizeUriComponents, delay } from "../utils";
import { URIComponents } from "uri-js";

export class Crawler<TProvider extends CrawlerProvider> implements ICrawler {

  private baseUriComponent: URIComponents;
  private provider: CrawlerProvider;
  private pages = new CrawlingInfo();
  private importer: IImporterProvider;
  private current: number = 0;

  constructor(private baseUrl: string, 
    providerType: ICrawlerProviderConstructor<TProvider>,
    importer: IImporterProviderConstructor) {
      this.baseUriComponent = Uri.parse(baseUrl);
      this.provider = new providerType(baseUrl);
      this.importer = new importer(baseUrl);

      process.on("SIGINT", (signal) => {
        console.log("Interrupted");
        process.removeAllListeners();
        this.save();
        process.exit();
      });
  }

  async process() {
    const dom = await this.provider.getHtml(this.baseUrl);
    if (dom === null) return;

    const rssUrl = this.provider.detectRssFeedsUrl(dom);
    const rss = await this.provider.getRss(rssUrl);

    await this.recursive(this.baseUrl);
  }

  async recursive(url: string): Promise<void> {
    this.current++;
    console.log(`(${this.current}) ${url}`);

    const dom = await this.provider.getHtml(url);
    if (dom === null) return;

    this.pages.addCompleted(url);
    if (this.importer.isContentUrl(url)) {
      this.pages.addContent({
        url: url,
        title: this.importer.getTitle(dom),
        content: this.importer.getContent(dom),
        category: this.importer.getCategory(dom),
        date: this.importer.getDate(dom)
      });
    }

    const links = this.importer.getLinks(dom);
    for(const link of links) {
      const url = getNormalizeUriComponents(link, this.baseUrl);
      const urlString = Uri.serialize(url);

      if (url.host !== this.baseUriComponent.host) continue;
      if (this.importer.isIgnoreUrl(urlString)) continue;
      if (this.pages.isIncludesQueue(urlString)) continue;

      console.log(`\t- detected (${this.pages.urls.length}): ${urlString}`);
      this.pages.addQueue(urlString);
    }

    await delay(3000);

    let next: string | null;
    while ((next = this.pages.popQueue()) !== null) {
      await this.recursive(next);
    }
  }

  load() {
    this.pages.load(this.baseUriComponent.host + ".json");
  }

  save() {
    this.pages.save(this.baseUriComponent.host + ".json");
  }
  
}