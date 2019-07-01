import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import moment from "moment";
import { Exporter } from "../..";
import { IExporterProvider } from "..";
import { CrawlingInfo } from "../../crawls";
import { ILogger } from "../../logging";
import { IEngineConstructor } from "./engines";

@Exporter("hexo")
export class HexoExporterProvider implements IExporterProvider {
  
  constructor(private logger: ILogger) {
  }

  async export(pages: CrawlingInfo, outputDirPath: string, engine: IEngineConstructor): Promise<void> {

    this.valid(outputDirPath);

    const e = new engine();
    const postPath = path.join(path.resolve(outputDirPath), "source/_posts");
    
    for(const key of Object.keys(pages.contents)) {
      try {
        const content = pages.contents[key];
        if (!content.url ||
            !content.content ||
            !content.date ||
            !content.title ||
            !content.url) {
              throw new Error("Not enoutgh content");
            }

        this.logger.write(chalk`${content.url} {gray ${content.title}}`);

        const title = content.title.replace(/\"/g, "\\\"");
        const date = moment(content.date.toString()).format("YYYY-MM-DD HH:mm:ss");
        const tags = JSON.stringify(content.tags) || [];

        let post = `---
title: "${title}"
date: ${date}
tags: ${tags}
---
`;
        const filename = this.getNormalizedFileName(content.title) + ".md";
        const postFilePath = path.join(postPath, filename);
        // https://hexo.io/docs/troubleshooting.html#Escape-Contents
        const replacedContent = content.content.replace(/(?!(\`{3}\w+(.|\n)*))(\{\{?.?[\. \w]+\}?\})(?!((.|\n)\`{3}$))/gm, "{% raw %}$3{% endraw %}");
        const markdownPost = (await e.generate(replacedContent));
        post += markdownPost;

        fs.writeFileSync(postFilePath, post, {encoding: "utf8"});

        this.logger.write(chalk` - {yellow ok}`);
      } catch(e) {
        this.logger.write(chalk` - {red failed}`);
      }

      this.logger.writeLine();

    }
  }

  private valid(outputDirPath: string): void {
    const basePath = path.resolve(outputDirPath);

    if (!fs.existsSync(path.join(basePath, ".gitignore")) ||
        !fs.existsSync(path.join(basePath, "_config.yml")) ||
        !fs.existsSync(path.join(basePath, "source/_posts")) ||
        !fs.existsSync(path.join(basePath, "scaffolds/post.md"))) {
      throw new Error(`It's not hexo directory: ${outputDirPath}`);
    }
  }

  private getNormalizedFileName(filename: string): string {
    filename = filename.replace(/[\=\-\!\+\~\"\'\`\@\~\#\%\&\*\:\<\>\?\/\\\{\|\}\(\)\.\,\[\] ]/g, "_");
    filename = filename.replace(/[_]+/g, "_");
    const filenameResult = /[^_\.\-].+/g.exec(filename);
    if (filenameResult && filenameResult.length > 0) {
      return filenameResult[0];
    }
    
    return filename;
  }

}