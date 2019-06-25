import { AxioCrawlerProvider, CrawlerProvider } from "./crawls/providers";
import { TistoryImporterProvider } from "./providers";
import { Crawler } from "./crawls/crawler";
import { getNormalizeUrl } from "./utils";

(async () => {

  const baseUrl = getNormalizeUrl("https://b2g-blog.tistory.com");
  const crawler = new Crawler(baseUrl, AxioCrawlerProvider, TistoryImporterProvider);
  crawler.load();

  try {
    await crawler.process();
  } catch(e) {
    throw e;
  } finally {
    crawler.save();
  }
  
})();
