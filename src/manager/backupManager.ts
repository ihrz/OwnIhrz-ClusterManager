import archiver from "archiver";
import path from "node:path";
import fs, { createWriteStream } from "node:fs";
import { format, logger } from "ihorizon-tools";

const ownihrz_home_folder = path.join(process.cwd(), "ownihrz");
const need_to_backup_files: string[] = ["d:backups", "config.ts", "db.sqlite", "d:giveaways"];

export async function create_ownihrz_backup() {
    logger.log("[Backuper] Backup all OWNIHRZ inside this cluster...".green);

    let ownihrzs = fs.readdirSync(ownihrz_home_folder);
    let archive = archiver('zip', { zlib: { level: 9 } });

    ownihrzs.forEach(code => {
        if (fs.statSync(path.join(ownihrz_home_folder, code)).isDirectory()) {
            let output = createWriteStream(path.join(process.cwd(), `${format(new Date(), "YYYY-MM-DD - HH:mm - OWNIHRZ BACKUP")}.zip`));

            archive.pipe(output);

            let result: string[] = [];
            let ownihrz_files_path = path.join(ownihrz_home_folder, code, "src", "files");
            try {
                result = fs.readdirSync(ownihrz_files_path)
            } catch { }

            result.forEach(link => {
                if (fs.statSync(path.join(ownihrz_files_path, link)).isDirectory()) {

                    let link_path = path.join(ownihrz_files_path, link);
                    let link_type = fs.statSync(link_path);

                    if (link_type.isDirectory() && need_to_backup_files.includes("d:" + link)) {
                        let inside_the_folder = fs.readdirSync(link_path);

                        inside_the_folder.forEach(file => {
                            let file_path = path.join(link_path, file);
                            archive.file(file_path, { name: path.join(code, "files", file) });
                        });
                    } else if (need_to_backup_files.includes(link)) {
                        archive.file(link_path, { name: path.join(code, "files", link) });
                    }
                }
            });
        }
    });

    archive.finalize();
}