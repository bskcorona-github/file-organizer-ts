import * as fs from "fs";
import * as path from "path";

export interface FileOrganizerOptions {
  createSubfolders?: boolean;
  preserveOriginalStructure?: boolean;
  skipHiddenFiles?: boolean;
  dryRun?: boolean;
}

export interface FileInfo {
  name: string;
  path: string;
  extension: string;
  size: number;
  category: string;
}

export interface OrganizationReport {
  totalFiles: number;
  organizedFiles: number;
  skippedFiles: number;
  categories: Map<string, number>;
  errors: string[];
}

export class FileOrganizer {
  private readonly extensionCategories: Map<string, string> = new Map([
    // Images
    [".jpg", "images"],
    [".jpeg", "images"],
    [".png", "images"],
    [".gif", "images"],
    [".bmp", "images"],
    [".svg", "images"],
    [".webp", "images"],
    [".ico", "images"],

    // Videos
    [".mp4", "videos"],
    [".avi", "videos"],
    [".mov", "videos"],
    [".wmv", "videos"],
    [".flv", "videos"],
    [".webm", "videos"],
    [".mkv", "videos"],
    [".m4v", "videos"],

    // Audio
    [".mp3", "audio"],
    [".wav", "audio"],
    [".flac", "audio"],
    [".aac", "audio"],
    [".ogg", "audio"],
    [".wma", "audio"],
    [".m4a", "audio"],

    // Documents
    [".pdf", "documents"],
    [".doc", "documents"],
    [".docx", "documents"],
    [".txt", "documents"],
    [".rtf", "documents"],
    [".odt", "documents"],

    // Spreadsheets
    [".xls", "spreadsheets"],
    [".xlsx", "spreadsheets"],
    [".csv", "spreadsheets"],
    [".ods", "spreadsheets"],

    // Presentations
    [".ppt", "presentations"],
    [".pptx", "presentations"],
    [".odp", "presentations"],

    // Archives
    [".zip", "archives"],
    [".rar", "archives"],
    [".7z", "archives"],
    [".tar", "archives"],
    [".gz", "archives"],
    [".bz2", "archives"],
    [".xz", "archives"],

    // Code
    [".js", "code"],
    [".ts", "code"],
    [".py", "code"],
    [".java", "code"],
    [".cpp", "code"],
    [".c", "code"],
    [".cs", "code"],
    [".php", "code"],
    [".rb", "code"],
    [".go", "code"],
    [".rs", "code"],
    [".swift", "code"],
    [".html", "code"],
    [".css", "code"],
    [".scss", "code"],
    [".json", "code"],
    [".xml", "code"],
    [".yaml", "code"],
    [".yml", "code"],

    // Executables
    [".exe", "executables"],
    [".msi", "executables"],
    [".deb", "executables"],
    [".rpm", "executables"],
    [".dmg", "executables"],
    [".app", "executables"],
  ]);

  constructor(private options: FileOrganizerOptions = {}) {
    this.options = {
      createSubfolders: true,
      preserveOriginalStructure: false,
      skipHiddenFiles: true,
      dryRun: false,
      ...options,
    };
  }

  public async organizeDirectory(
    directoryPath: string
  ): Promise<OrganizationReport> {
    const report: OrganizationReport = {
      totalFiles: 0,
      organizedFiles: 0,
      skippedFiles: 0,
      categories: new Map(),
      errors: [],
    };

    try {
      if (!fs.existsSync(directoryPath)) {
        throw new Error(`Directory does not exist: ${directoryPath}`);
      }

      const files = await this.scanDirectory(directoryPath);
      report.totalFiles = files.length;

      console.log(`Found ${files.length} files to organize...`);

      for (const file of files) {
        try {
          if (await this.organizeFile(file, directoryPath)) {
            report.organizedFiles++;
            const count = report.categories.get(file.category) || 0;
            report.categories.set(file.category, count + 1);
          } else {
            report.skippedFiles++;
          }
        } catch (error) {
          const errorMessage = `Failed to organize ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`;
          report.errors.push(errorMessage);
          console.error(errorMessage);
        }
      }

      return report;
    } catch (error) {
      const errorMessage = `Failed to organize directory: ${error instanceof Error ? error.message : "Unknown error"}`;
      report.errors.push(errorMessage);
      throw new Error(errorMessage);
    }
  }

  public async organizeFilesByDate(
    directoryPath: string
  ): Promise<OrganizationReport> {
    const report: OrganizationReport = {
      totalFiles: 0,
      organizedFiles: 0,
      skippedFiles: 0,
      categories: new Map(),
      errors: [],
    };

    try {
      const files = await this.scanDirectory(directoryPath);
      report.totalFiles = files.length;

      for (const file of files) {
        try {
          const stats = fs.statSync(file.path);
          const date = stats.mtime;
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, "0");

          const targetFolder = path.join(
            directoryPath,
            `${year}`,
            `${year}-${month}`
          );

          if (!this.options.dryRun && !fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder, { recursive: true });
          }

          const targetPath = path.join(targetFolder, file.name);

          if (!this.options.dryRun) {
            fs.renameSync(file.path, targetPath);
          }

          report.organizedFiles++;
          const dateKey = `${year}-${month}`;
          const count = report.categories.get(dateKey) || 0;
          report.categories.set(dateKey, count + 1);

          console.log(`Moved ${file.name} to ${dateKey}`);
        } catch (error) {
          const errorMessage = `Failed to organize ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`;
          report.errors.push(errorMessage);
          console.error(errorMessage);
        }
      }

      return report;
    } catch (error) {
      const errorMessage = `Failed to organize by date: ${error instanceof Error ? error.message : "Unknown error"}`;
      report.errors.push(errorMessage);
      throw new Error(errorMessage);
    }
  }

  public getFileInfo(filePath: string): FileInfo {
    const stats = fs.statSync(filePath);
    const fileName = path.basename(filePath);
    const extension = path.extname(fileName).toLowerCase();
    const category = this.extensionCategories.get(extension) || "others";

    return {
      name: fileName,
      path: filePath,
      extension,
      size: stats.size,
      category,
    };
  }

  public printReport(report: OrganizationReport): void {
    console.log("\n=== File Organization Report ===");
    console.log(`Total files: ${report.totalFiles}`);
    console.log(`Organized: ${report.organizedFiles}`);
    console.log(`Skipped: ${report.skippedFiles}`);

    if (report.categories.size > 0) {
      console.log("\nCategories:");
      for (const [category, count] of report.categories.entries()) {
        console.log(`  ${category}: ${count} files`);
      }
    }

    if (report.errors.length > 0) {
      console.log("\nErrors:");
      report.errors.forEach((error) => console.log(`  - ${error}`));
    }
  }

  private async scanDirectory(directoryPath: string): Promise<FileInfo[]> {
    const files: FileInfo[] = [];
    const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directoryPath, entry.name);

      if (entry.isFile()) {
        // Skip hidden files if option is set
        if (this.options.skipHiddenFiles && entry.name.startsWith(".")) {
          continue;
        }

        files.push(this.getFileInfo(fullPath));
      }
    }

    return files;
  }

  private async organizeFile(
    file: FileInfo,
    baseDirectory: string
  ): Promise<boolean> {
    try {
      if (!this.options.createSubfolders) {
        return false;
      }

      const targetFolder = path.join(baseDirectory, file.category);

      // Create target folder if it doesn't exist
      if (!this.options.dryRun && !fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
      }

      // Generate target path
      let targetPath = path.join(targetFolder, file.name);

      // Handle duplicate files
      if (fs.existsSync(targetPath)) {
        const baseName = path.parse(file.name).name;
        const extension = path.parse(file.name).ext;
        let counter = 1;

        while (fs.existsSync(targetPath)) {
          const newName = `${baseName}_${counter}${extension}`;
          targetPath = path.join(targetFolder, newName);
          counter++;
        }
      }

      // Move file
      if (!this.options.dryRun) {
        fs.renameSync(file.path, targetPath);
      }

      console.log(`${this.options.dryRun ? "[DRY RUN] " : ""}Moved ${file.name} to ${file.category}`);
      return true;
    } catch (error) {
      throw new Error(
        `Failed to organize file ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage: npm run organize <directory> [options]");
    console.log("Options:");
    console.log("  --dry-run        Preview changes without moving files");
    console.log("  --by-date        Organize by creation date");
    console.log("  --include-hidden Include hidden files");
    console.log("  --no-subfolders  Don't create category subfolders");
    return;
  }

  const directory = args[0];
  const options: FileOrganizerOptions = {
    dryRun: args.includes("--dry-run"),
    skipHiddenFiles: !args.includes("--include-hidden"),
    createSubfolders: !args.includes("--no-subfolders"),
  };

  const organizer = new FileOrganizer(options);

  if (args.includes("--by-date")) {
    organizer
      .organizeFilesByDate(directory)
      .then((report) => {
        organizer.printReport(report);
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
  } else {
    organizer
      .organizeDirectory(directory)
      .then((report) => {
        organizer.printReport(report);
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
  }
}

if (require.main === module) {
  main();
}

export default FileOrganizer;