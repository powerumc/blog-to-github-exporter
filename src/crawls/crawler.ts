import * as Uri from "uri-js";
import { ICrawler, CrawlingInfo, ICrawlingPageInfo } from "./interfaces";
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
      this.provider = new providerType("");
      this.importer = new importer("");
  }

  async process() {
    const dom = await this.provider.getHtml(this.baseUrl);
    if (dom === null) return;

    const rssUrl = this.provider.detectRssFeedsUrl(dom);
    const rss = await this.provider.getRss(rssUrl);

    this.recursive(this.baseUrl);
  }

  async recursive(url: string): Promise<void> {
    this.current++;
    console.log(`${url}`);

    const dom = await this.provider.getHtml(url);
    if (dom === null) return;

    const links = this.importer.getLinks(dom);
    for(const link of links) {
      const url = getNormalizeUriComponents(link, this.baseUrl);
      const urlString = Uri.serialize(url);

      if (url.host !== this.baseUriComponent.host) continue;

      if (!this.pages.urls.includes(urlString)) {

        // console.log(urlString);
        console.log(`\t- (${this.current}/${this.pages.urls.length}) ${urlString}`);

        this.pages.add(urlString, {
          url: urlString,
          title: this.importer.getTitle(dom),
          content: this.importer.getContent(dom)
        });
      }
    }

    await delay(3000);

    let next: ICrawlingPageInfo | null;
    while ((next = this.pages.pop()) !== null) {
      await this.recursive(next.url);
    }
  }
  
}