import RssParser from "rss-parser";
import { IBlog } from "../interfaces";

export interface IImporterProviderConstructor {
  new (baseUrl: string): IImporterProvider;
}

export interface IImporterProvider {
  getBlogInfo(dom: CheerioStatic, rss: RssParser.Output): IBlog;
  getDom(dom: CheerioStatic): CheerioStatic;
  getTitle(dom: CheerioStatic): string;
  getContent(dom: CheerioStatic): string | null;
  getLinks(dom: CheerioStatic): string[];
  getCategory(dom: CheerioStatic): string;
  getTags(dom: CheerioStatic): string[];
  getDate(dom: CheerioStatic): string;
  isContentUrl(url: string): boolean;
  isIgnoreUrl(url: string): boolean;
}

export interface IExporterProviderConstructor<T> {
  new (engine: T): IExporterProvider;
}

export interface IExporterProvider {
}