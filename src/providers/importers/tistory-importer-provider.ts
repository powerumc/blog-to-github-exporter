import RssParser from "rss-parser";
import * as Uri from "uri-js";
import { Importer, IBlog } from "../../interfaces";
import { IImporterProvider } from "..";

@Importer("tistory")
export class TistoryImporterProvider implements IImporterProvider {

  getBlogInfo(dom: CheerioStatic, rss: RssParser.Output): IBlog {
    try {
      const info: IBlog = {
        url: Uri.parse(rss.link || ""),
        title: dom(`meta[property='og:title']`).attr("content"),
        description: dom(`meta[property='og:description']`).attr("content"),
        date: new Date(),
        feeds: [],
        owner: rss["managingEditor"]
      };

      return info;
    } catch(e) {
      throw e;
    }
  }
}