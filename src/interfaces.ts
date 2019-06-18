export interface IBlog {
  title: string;
  url: string;
  description: string;
  owner: string;
  feeds: IBlogFeed[];
  date: Date;
}

export interface IBlogFeed {
  title: string;
  article: string;
  tags: string[];
}

export interface IImporterProviderConstructor {
  new (url: string): IImporterProvider;
}

export interface IImporterProvider {
  name: string;
}

export interface IExporterProviderConstructor<T> {
  new (engine: T): IExporterProvider<T>;
}

export interface IExporterProvider<T> {
  name: string;
  engine: string;
}