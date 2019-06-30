import RssParser from "rss-parser";
import { IBlog } from "../interfaces";
import { CrawlingInfo } from "../crawls/interfaces";
import { ILogger } from "../logging";
import { IEngineConstructor } from "./exporters/engines";

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
  getDate(dom: CheerioStatic): Date | null;
  isContentUrl(url: string): boolean;
  isIgnoreUrl(url: string): boolean;
}

export interface IExporterProviderConstructor {
  new (logger: ILogger): IExporterProvider;
}

export interface IExporterProvider {
  export(pages: CrawlingInfo, outputDirPath: string, engine: IEngineConstructor): Promise<void>;
}