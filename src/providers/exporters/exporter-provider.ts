import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import { IExporterProvider } from "..";
import { ILogger } from "../../logging";
import { IEngineConstructor, IEngine } from "./engines";
import { CrawlingInfo, ICrawlingContentInfo } from "../../crawls";

export abstract class ExporterProvider implements IExporterProvider {
  protected constructor(protected logger: ILogger) {
  }

  protected abstract validateDir(outputDirPath: string): void;

  protected validateContent(content: ICrawlingContentInfo): void {
    if (!content.url ||
      !content.content ||
      !content.date ||
      !content.title ||
      !content.url) {
      throw new Error("Not enoutgh content");
    }
  }

  protected abstract getPostDirPath(outputDirPath: string): string;
  protected abstract getPostFormat(outputDirPath: string, content: ICrawlingContentInfo): string;
  protected abstract getPostFilePath(postOutputDirPath: string, content: ICrawlingContentInfo): string;

  protected async getGeneratedPost(engine: IEngine, content: ICrawlingContentInfo): Promise<string> {
    // https://hexo.io/docs/troubleshooting.html#Escape-Contents
    let markdownPost = await engine.generate(content.content!);
    markdownPost = this.replaceEscapeContents(markdownPost);
    
    return markdownPost;
  }

  protected writePostFile(outputDirPath: string, markdownPost: string, content: ICrawlingContentInfo): void {
    const postFilePath = this.getPostFilePath(outputDirPath, content);
    fs.writeFileSync(postFilePath, markdownPost, {encoding: "utf8"});
  }

  async export(pages: CrawlingInfo, outputDirPath: string, engine: IEngineConstructor): Promise<void> {

    this.validateDir(outputDirPath);

    const e = new engine();
    const postPath = this.getPostDirPath(outputDirPath);
    
    for(const key of Object.keys(pages.contents)) {
      try {
        const content = pages.contents[key];
        this.validateContent(content);

        this.logger.write(chalk`${content.url} {gray ${content.title}}`);

        let post = this.getPostFormat(outputDirPath, content);
        let markdownPost = await this.getGeneratedPost(e, content);
        post += markdownPost;

        this.writePostFile(postPath, post, content);

        this.logger.write(chalk` - {yellow ok}`);
      } catch(e) {
        this.logger.write(chalk` - {red failed}`);
      }

      this.logger.writeLine();

    }
  }

  protected getNormalizedFileName(filename: string): string {
    filename = filename.replace(/[\=\-\!\+\~\"\'\`\@\~\#\%\&\*\:\<\>\?\/\\\{\|\}\(\)\.\,\[\] ]/g, "_");
    filename = filename.replace(/[_]+/g, "_");
    const filenameResult = /[^_\.\-].+/g.exec(filename);
    if (filenameResult && filenameResult.length > 0) {
      return filenameResult[0];
    }
    
    return filename;
  }

  protected replaceEscapeContents(markdownContents: string): string {
    const contents = markdownContents.split("\n");
    const replcaedContents: string[] = [];
    let inCodeblock = false;

    for(const content of contents) {
      if (content.startsWith("```")) {
        inCodeblock = !inCodeblock;
      }

      if (content.startsWith("\t") || content.startsWith("    ")) {
        replcaedContents.push(content);
        continue;
      }

      const escapeContentPattern = /(\{[\{\#\%].[^\}]+\}+)/g;
      if (!inCodeblock && escapeContentPattern.test(content)) {
        replcaedContents.push(content.replace(escapeContentPattern, "{% raw %}$1{% endraw %}"));
        continue;
      }
      
      replcaedContents.push(content);
    }

    return replcaedContents.join("\n");
  }
}