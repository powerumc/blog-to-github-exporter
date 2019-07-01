export interface ILogger {
    write(message: any): void;
    writeLine(message?: any): void;
}