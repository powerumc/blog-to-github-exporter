import process from "process";
import * as Uri from "uri-js";
import chalk from "chalk";
import { URIComponents } from "uri-js";
import { ICrawler } from ".";
import { CrawlingInfo } from "./crawling-info";
import { CrawlerProvider, ICrawlerProviderConstructor } from "./providers"
import { IImporterProviderConstructor, IImporterProvider, IExporterProviderConstructor, IExporterProvider } from "../providers";
import { getNormalizedUriComponents, delay } from "../utils";
import { ILogger, ConsoleLogger } from "../logging";
import { IEngineConstructor } from "../providers/exporters/engines";

export class Crawler<TProvider extends CrawlerProvider> implements ICrawler {

  private readonly baseUriComponent: URIComponents;
  private readonly provider: CrawlerProvider;
  private readonly pages = new CrawlingInfo();
  private readonly importer: IImporterProvider;
  private readonly exporter: IExporterProvider;
  private readonly logger: ILogger;
  private current: number = 0;
  private isLoadedFile = false;

  constructor(private baseUrl: string,
    providerType: ICrawlerProviderConstructor<TProvider>,
    importer: IImporterProviderConstructor,
    exporter: IExporterProviderConstructor) {
    this.logger = new ConsoleLogger();
    this.baseUriComponent = Uri.parse(baseUrl);
    this.provider = new providerType(baseUrl);
    this.importer = new importer(baseUrl);
    this.exporter = new exporter(this.logger);

    process.on("SIGINT", (signal) => {
      console.log("Interrupted");
      process.removeAllListeners();
      this.save();
      process.exit();
    });
  }

  async import(): Promise<void> {
    try {
      const dom = await this.provider.getHtml(this.baseUrl);
      if (dom === null) return;

      const rssUrl = this.provider.detectRssFeedsUrl(dom);
      const rss = await this.provider.getRss(rssUrl);

      await this.importCore(this.baseUrl);
    } catch(e) {
      throw e;
    } finally {
      this.save();
    }
  }

  async export(outputDirPath: string, engine: IEngineConstructor): Promise<void> {
    try {
      await this.exporter.export(this.pages, outputDirPath, engine);
    } catch(e) {
      throw e;
    }
  }

  async importCore(url: string): Promise<void> {
    this.logger.write(`(${this.current}) ${url}`);

    let dom = await this.provider.getHtml(url);
    if (dom === null) {
      this.logger.writeLine("  - skip");
      return;
    }

    dom = this.importer.getDom(dom);

    this.pages.addCompleted(url);
    if (this.importer.isContentUrl(url)) {
      this.pages.addContent({
        url: url,
        title: this.importer.getTitle(dom),
        content: this.importer.getContent(dom),
        category: this.importer.getCategory(dom),
        tags: this.importer.getTags(dom),
        date: this.importer.getDate(dom)
      });
      this.logger.write(chalk`  {yellow - success}`)
    }

    this.logger.writeLine();

    const links = this.importer.getLinks(dom);
    for (const link of links) {
      const url = getNormalizedUriComponents(link, this.baseUrl);
      const urlString = Uri.serialize(url);

      if (url.host !== this.baseUriComponent.host) continue;
      if (this.importer.isIgnoredUrl(urlString)) continue;
      if (this.pages.isIncludesQueue(urlString)) continue;

      const queueNumber = this.pages.urls.length + this.pages.completedUrls.length;
      this.logger.writeLine(chalk`\t{gray - detected (${queueNumber.toString()}): ${urlString}}`);
      this.pages.addQueue(urlString);
    }

    await delay(3000);
    this.current++;

    let next: string | null;
    while ((next = this.pages.popQueue()) !== null) {
      await this.importCore(next);
    }
  }

  load(): void {
    this.isLoadedFile = this.pages.load(this.baseUriComponent.host + ".json");
    this.current = this.pages.completedUrls.length;
  }

  save(): void {
    this.pages.save(this.baseUriComponent.host + ".json");
  }

  get isDone(): boolean {
    return this.isLoadedFile && this.pages.urls.length === 0;
  }

}