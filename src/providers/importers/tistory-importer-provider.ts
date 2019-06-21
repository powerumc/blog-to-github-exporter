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

  getTitle(dom: CheerioStatic): string {
    return dom(".titleWrap h2 a").text();
  }

  getContent(dom: CheerioStatic): string | null {
    return dom(".article").html();
  }

  getLinks(dom: CheerioStatic): string[] {
    const anchors: string[] = [];
    const $anchors = dom("a[href]");
    
    for(const a of $anchors.toArray()) {
      const url = a.attribs["href"];
      if (this.isIgnoreUrl(url)) continue;

      anchors.push(url);
    }

    return anchors;
  }

  isIgnoreUrl(url: string): boolean {
    return url.includes("attachment/") ||
      url.includes("upload/") ||
      url.includes("#");
  }
}