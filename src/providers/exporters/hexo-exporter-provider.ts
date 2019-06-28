import * as fs from "fs";
import { Exporter } from "../../interfaces";
import { IExporterProvider } from "..";
import { CrawlingInfo } from "../../crawls/interfaces";
import { ILogger } from "../../logging";

@Exporter("hexo")
export class HexoExporterProvider implements IExporterProvider {
  
  constructor(private logger: ILogger) {
  }

  export(pages: CrawlingInfo, outputDirPath: string): void {

    this.valid(outputDirPath);

    for(const key of Object.keys(pages.contents)) {
      this.logger.writeLine(key);
    }
  }

  private valid(outputDirPath: string): void {
    if (!fs.existsSync(".gitignore") ||
        !fs.existsSync("._config.yml")) {
      throw new Error(`It's not hexo directory: ${outputDirPath}`);
    }
  }

}