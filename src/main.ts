import * as Uri from "uri-js";
import * as a from "./providers";
import { importers } from "./interfaces";
import { AxioCrawlerProvider, CrawlerProvider } from "./crawls/providers";
import { TistoryImporterProvider } from "./providers";
import { Crawler } from "./crawls/crawler";

( () => {

  const baseUrl = "https://blog.powerumc.kr";
  const crawler = new Crawler(baseUrl, AxioCrawlerProvider, TistoryImporterProvider);
  crawler.load();

  try {
    crawler.process();
  } catch(e) {
    throw e;
  } finally {
    crawler.save();
  }
  
})();
