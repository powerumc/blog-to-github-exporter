import { AxioCrawlerProvider, CrawlerProvider } from "./crawls/providers";
import { TistoryImporterProvider } from "./providers";
import { Crawler } from "./crawls/crawler";
import { getNormalizeUrl } from "./utils";
import { ICrawler } from "./crawls/interfaces";
import { HexoExporterProvider } from "./providers/exporters";

(async () => {

  const baseUrl = getNormalizeUrl("https://blog.powerumc.kr");
  const crawler: ICrawler = new Crawler(baseUrl, AxioCrawlerProvider, TistoryImporterProvider, HexoExporterProvider);
  crawler.load();

  try {
    if (crawler.isDone) {
      await crawler.export(process.cwd());
    } else {
      await crawler.import();
    }
  } catch(e) {
    console.error(e);
  }
})();