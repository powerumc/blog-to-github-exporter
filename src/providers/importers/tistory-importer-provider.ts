import moment from "moment";
import cheerio from "cheerio";
import RssParser from "rss-parser";
import * as Uri from "uri-js";
import { Importer, IBlog } from "../../interfaces";
import { IImporterProvider } from "..";

@Importer("tistory")
export class TistoryImporterProvider implements IImporterProvider {

  private defaultPattern = (url: string) => `${url}\/([0-9]+$|(entry\/.+$))`;
  private contentUrlPattern: RegExp;
  private datePattern = /[0-9]{4}\.[0-9]{2}\.[0-9]{2} [0-9]{2}:[0-9]{2}/;
  private ignoreContentUrlPattern = /category=[0-9]+$/;

  constructor(private baseUrl: string) {
    console.log(`baseUrl=${baseUrl}`);
    this.contentUrlPattern = new RegExp(this.defaultPattern(baseUrl));
  }

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

  getDom(dom: CheerioStatic): CheerioStatic {
    dom(".tt-calendar").remove();

    return dom;
  }

  getTitle(dom: CheerioStatic): string {
    return dom(".tit_post a").text();
  }

  getContent(dom: CheerioStatic): string | null {
    return dom(".area_view")
            .clone()
            .remove("div[class^=container]")
            .remove("div[class*=plugin]")
            .remove(".another_category")
            .remove("div[style='text-align:left; padding-top:10px;clear:both']>iframe")
            .html();
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

  getCategory(dom: CheerioStatic): string {
    return dom(".tit_category a").text();
  }

  getTags(dom: CheerioStatic): string[] {
    const tags = dom(".desc_tag").text().split(",").map(o => o.trim());

    return (tags.length === 1 && tags[0] === "") 
      ? []:
      tags;
  }

  getDate(dom: CheerioStatic): Date | null {
    const text = dom(".txt_detail.my_post").text();
    const result = this.datePattern.exec(text);
    if (result && result.length > 0) {
      return moment(result[0], "YYYY.MM.DD HH:mm").toDate();
    }

    return null;
  }

  isContentUrl(url: string): boolean {
    return this.contentUrlPattern.test(url);
  }

  isIgnoreUrl(url: string): boolean {
    return url.includes("attachment/") ||
      url.includes("upload/") ||
      url.includes("#") ||
      this.ignoreContentUrlPattern.test(url);
  }
}