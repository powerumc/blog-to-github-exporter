import moment from "moment";
import cheerio from "cheerio";
import RssParser from "rss-parser";
import * as Uri from "uri-js";
import {IBlog, Importer} from "../../interfaces";
import {IImporterProvider} from "..";

@Importer("tistory")
export class TistoryImporterProvider implements IImporterProvider {

  private readonly defaultPattern = (url: string) => `${url}\/([0-9]+$|(entry\/.+$))`;
  private readonly contentUrlPattern: RegExp;
  private readonly datePattern = /[0-9]{4}\.[0-9]{2}\.[0-9]{2} [0-9]{2}:[0-9]{2}/;
  private readonly ignoredContentUrlPattern = /category=[0-9]+$/;

  constructor(private baseUrl: string) {
    this.contentUrlPattern = new RegExp(this.defaultPattern(baseUrl));
  }

  getBlogInfo(dom: CheerioStatic, rss: RssParser.Output): IBlog {
    try {
      return {
        url: Uri.parse(rss.link || ""),
        title: dom(`meta[property='og:title']`).attr("content"),
        description: dom(`meta[property='og:description']`).attr("content"),
        date: new Date(),
        feeds: [],
        owner: rss["managingEditor"]
      };
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
    const element = dom(".area_view");

    element.find(".another_category").remove();
    element.find("div>iframe").parent().remove();
    this.domElementAction(element.find("div[class]"), e => e.attribs["class"].split(" ").filter( o => o.startsWith("container_")).length > 0, e => e.remove());
    this.domElementAction(element.find("div[class]"), e => e.attribs["class"].split(" ").filter( o => o.endsWith("plugin")).length > 0, e => e.remove());

    return element.html();
  }

  getLinks(dom: CheerioStatic): string[] {
    const anchors: string[] = [];
    const $anchors = dom("a[href]");
    
    for(const a of $anchors.toArray()) {
      const url = a.attribs["href"];
      if (this.isIgnoredUrl(url)) continue;

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
      ? []
      : tags;
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

  isIgnoredUrl(url: string): boolean {
    return url.includes("attachment/") ||
      url.includes("upload/") ||
      url.includes("#") ||
      this.ignoredContentUrlPattern.test(url);
  }

  private domElementAction(dom: Cheerio, predicate: (e: CheerioElement) => boolean, then: (e: Cheerio) => void): void {
    dom.each((i, e) => {
      if (predicate(e)) {
        then(cheerio(e));
      }
    });
  }
}