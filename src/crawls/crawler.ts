import process from "process";
import * as Uri from "uri-js";
import chalk from "chalk";
import { ICrawler, CrawlingInfo, ICrawlingContentInfo } from "./interfaces";
import { CrawlerProvider, ICrawlerProviderConstructor } from "./providers"
import { IImporterProviderConstructor, IImporterProvider } from "../providers";
import { getNormalizeUrl } from "..";
import { getNormalizeUriComponents, delay } from "../utils";
import { URIComponents } from "uri-js";
import { ILogger, ConsoleLogger } from "../logging";

export class Crawler<TProvider extends CrawlerProvider> implements ICrawler {

  private baseUriComponent: URIComponents;
  private provider: CrawlerProvider;
  private pages = new CrawlingInfo();
  private importer: IImporterProvider;
  private current: number = 0;
  private logger: ILogger;

  constructor(private baseUrl: string,
    providerType: ICrawlerProviderConstructor<TProvider>,
    importer: IImporterProviderConstructor) {
    this.baseUriComponent = Uri.parse(baseUrl);
    this.provider = new providerType(baseUrl);
    this.importer = new importer(baseUrl);
    this.logger = new ConsoleLogger();

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
    this.logger.write(`(${this.current}) ${url}`);

    let dom = await this.provider.getHtml(url);
    if (dom === null) {
      this.logger.writeLine("  - skip");
      return;
    };

    dom = this.importer.getDom(dom);

    this.pages.addCompleted(url);
    if (this.importer.isContentUrl(url)) {
      this.pages.addContent({
        url: url,
        title: this.importer.getTitle(dom),
        content: this.importer.getContent(dom),
        category: this.importer.getCategory(dom),
        date: this.importer.getDate(dom)
      });
      this.logger.write(chalk`  {yellow - success}`)
    }

    this.logger.writeLine();

    const links = this.importer.getLinks(dom);
    for (const link of links) {
      const url = getNormalizeUriComponents(link, this.baseUrl);
      const urlString = Uri.serialize(url);

      if (url.host !== this.baseUriComponent.host) continue;
      if (this.importer.isIgnoreUrl(urlString)) continue;
      if (this.pages.isIncludesQueue(urlString)) continue;

      const queueNumber = this.pages.urls.length + this.pages.completedUrls.length;
      this.logger.writeLine(chalk`\t{gray - detected (${queueNumber.toString()}): ${urlString}}`);
      this.pages.addQueue(urlString);
    }

    await delay(3000);
    this.current++;

    let next: string | null;
    while ((next = this.pages.popQueue()) !== null) {
      await this.recursive(next);
    }
  }

  load() {
    this.pages.load(this.baseUriComponent.host + ".json");
    this.current = this.pages.completedUrls.length;
  }

  save() {
    this.pages.save(this.baseUriComponent.host + ".json");
  }

}