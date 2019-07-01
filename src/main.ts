import { AxioCrawlerProvider, CrawlerProvider } from "./crawls/providers";
import { TistoryImporterProvider } from "./providers";
import { Crawler } from "./crawls/crawler";
import { getNormalizeUrl } from "./utils";
import { ICrawler } from "./crawls/interfaces";
import { HexoExporterProvider } from "./providers/exporters";
import { UpndownEngine } from "./providers/exporters/engines";

(async () => {

  const baseUrl = getNormalizeUrl("https://blog.powerumc.kr");
  const crawler: ICrawler = new Crawler(baseUrl, AxioCrawlerProvider, TistoryImporterProvider, HexoExporterProvider);
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