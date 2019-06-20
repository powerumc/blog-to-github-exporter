import RssParser from "rss-parser";
import { IBlog } from "../interfaces";

export interface IImporterProviderConstructor {
  new (url: string): IImporterProvider;
}

export interface IImporterProvider {
  getBlogInfo(dom: CheerioStatic, rss: RssParser.Output): IBlog;
}

export interface IExporterProviderConstructor<T> {
  new (engine: T): IExporterProvider;
}

export interface IExporterProvider {
}