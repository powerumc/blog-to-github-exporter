import { AxioCrawlerProvider, CrawlerProvider } from "./crawls/providers";
import { TistoryImporterProvider } from "./providers";
import { Crawler } from "./crawls/crawler";
import { getNormalizedUrl } from "./utils";
import { ICrawler } from "./crawls/interfaces";
import { HexoExporterProvider, JekyllExporterProvider } from "./providers/exporters";
import { UpndownEngine } from "./providers/exporters/engines";

(async () => {

  const baseUrl = getNormalizedUrl("https://blog.powerumc.kr");
  const crawler: ICrawler = new Crawler(baseUrl, AxioCrawlerProvider, TistoryImporterProvider, JekyllExporterProvider);
  crawler.load();

  try {
    if (crawler.isDone) {
      await crawler.export(process.cwd(), UpndownEngine);
    } else {
      await crawler.import();
      await crawler.export(process.cwd(), UpndownEngine);
    }
  } catch(e) {
    console.error(e);
  }
})();