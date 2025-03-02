import archiver from "archiver";
import path from "node:path";
import fs from "node:fs";
import { format, logger } from "ihorizon-tools";

interface BackupConfig {
    sourcePath: string;
    filesToBackup: string[];
    outputDir: string;
    enableVerbose: boolean
}

export class BackupSystem {
    private config: BackupConfig;
    private archive: archiver.Archiver;
    private verbose: boolean;

    constructor(config: BackupConfig) {
        this.verbose = config.enableVerbose;
        this.config = config;
        this.archive = archiver('zip', {
            zlib: { level: 9 },
            forceLocalTime: true
        });
    }

    private log(...args: any): void {
        if (this.verbose) {
            logger.log(args)
        }
    }

    private getBackupFileName(): string {
        return `${format(new Date(), "YYYY-MM-DD - HH:mm - OWNIHRZ BACKUP")}.zip`;
    }

    private setupArchive(): Promise<void> {
        return new Promise((resolve, reject) => {
            const outputPath = path.join(this.config.outputDir, this.getBackupFileName());
            this.log('Création du fichier de backup:', outputPath);

            const output = fs.createWriteStream(outputPath);

            output.on('close', () => {
                this.log(`✅ Backup finnished: ${outputPath}`);
                this.log(`📦 Total size: ${(this.archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
                resolve();
            });

            output.on('error', (err) => {
                reject(err);
            });

            this.archive.on('error', (err) => {
                reject(err);
            });

            this.archive.pipe(output);
        });
    }

    private async backupDirectory(botCode: string, dirPath: string): Promise<void> {
        try {
            this.log(`📂 Bot File Analysis ${botCode}: ${dirPath}`);
            const items = await fs.promises.readdir(dirPath);

            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                const stat = await fs.promises.stat(fullPath);

                if (stat.isDirectory()) {
                    const dirName = path.basename(fullPath);
                    if (this.config.filesToBackup.includes(`d:${dirName}`)) {
                        this.log(`📁 Adding the folder: ${botCode}/files/${dirName}`);
                        const files = await fs.promises.readdir(fullPath);
                        for (const file of files) {
                            const filePath = path.join(fullPath, file);
                            if (fs.statSync(filePath).isFile()) {
                                this.log(`📄 Adding the file: ${botCode}/files/${dirName}/${file}`);
                                this.archive.file(filePath, {
                                    name: path.join(botCode, "files", dirName, file)
                                });
                            }
                        }
                    }
                } else {
                    const fileName = path.basename(fullPath);
                    if (this.config.filesToBackup.includes(fileName)) {
                        this.log(`📄 Adding the file: ${botCode}/files/${fileName}`);
                        this.archive.file(fullPath, {
                            name: path.join(botCode, "files", fileName)
                        });
                    }
                }
            }
        } catch (error) {
            throw error;
        }
    }

    public async createBackup(): Promise<void> {
        try {
            const setupPromise = this.setupArchive();

            this.log(`🔍 Scan du dossier source: ${this.config.sourcePath}`);
            const ownihrzs = await fs.promises.readdir(this.config.sourcePath);

            for (const botCode of ownihrzs) {
                const ownihrz_path = path.join(this.config.sourcePath, botCode);
                const stat = await fs.promises.stat(ownihrz_path);

                if (stat.isDirectory()) {
                    this.log(`📁 Backuping bot: ${botCode}`);
                    const files_path = path.join(ownihrz_path, "src", "files");

                    if (fs.existsSync(files_path)) {
                        await this.backupDirectory(botCode, files_path);
                    }
                }
            }

            await this.archive.finalize();
            await setupPromise;

        } catch (error) {
            throw error;
        }
    }
}

export async function create_ownihrz_backup(log: boolean) {
    // Verify that the file exists
    if (!fs.existsSync(path.join(process.cwd(), "ownihrz"))) {
        logger.log("❌ The ownihrz folder does not exist");
        return;
    }

    const config: BackupConfig = {
        sourcePath: path.join(process.cwd(), "ownihrz"),
        filesToBackup: ["d:backups", "config.ts", "db.sqlite", "d:giveaways"],
        outputDir: process.cwd(),
        enableVerbose: log
    };

    const backupSystem = new BackupSystem(config);

    try {
        await backupSystem.createBackup();
    } catch (error) {
        throw error;
    }
}