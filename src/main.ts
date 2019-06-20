import * as a from "./providers";
import { importers } from "./interfaces";
import { AxioCrawler } from "./crawls";
import { TistoryImporterProvider } from "./providers";

(async () => {

  const baseUrl = "https://blog.powerumc.kr";
  const crawler = new AxioCrawler(baseUrl);
  const dom = await crawler.getHtml(baseUrl);
  const rssUrl = crawler.detectRssFeedsUrl(dom);
  const rss = await crawler.getRss(rssUrl);
  
  const importer = new TistoryImporterProvider();
  const info = importer.getBlogInfo(dom, rss);

  console.log(info);
})();
