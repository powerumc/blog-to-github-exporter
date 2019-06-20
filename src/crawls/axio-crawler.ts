import axios, { AxiosInstance } from "axios";
import cheerio from "cheerio";
import RssParser from "rss-parser";
import { ICrawler } from "./interfaces";

export class AxioCrawler implements ICrawler {
  
  private axio: AxiosInstance;

  constructor(private baseUrl: string) {
    this.axio = axios.create({
      timeout: 5000
    });
  }

  open(): void {
  }

  async getHtml(url: string): Promise<CheerioStatic> {
    try {
      const response = await this.axio.get(url);
      if (response.status !== 200) {
        throw new Error(`${url} status code is not 200 ok.`);
      }

      const html = response.data;
      const dom = cheerio.load(html, {decodeEntities: true});

      return dom;
    } catch(e) {
      throw e;
    }
  }

  detectRssFeedsUrl(dom: CheerioStatic): string | null {
    const url = dom("link[rel='alternate'][type='application/rss+xml']").attr("href");

    return url || null;
  }

  async getRss(url: string | null): Promise<RssParser.Output> {
    try {
      if (!url) return {};

      const parser = new RssParser();
      const rss = await parser.parseURL(url);

      return rss;
    } catch(e) {
      throw e;
    }
  }
}