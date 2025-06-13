# File Organizer TypeScript

A powerful file organization utility written in TypeScript that automatically sorts files into categories based on their extensions or creation dates.

## Features

- **Automatic categorization** by file extension (images, videos, audio, documents, etc.)
- **Date-based organization** (YYYY/YYYY-MM folder structure)
- **Dry run mode** to preview changes before execution
- **Hidden file handling** with skip option
- **Duplicate file resolution** with automatic renaming
- **Comprehensive reporting** with statistics and error tracking
- **Command-line interface** for easy usage

## Installation

```bash
npm install
```

## Usage

### Command Line Interface

```bash
# Organize files by category
npm run organize /path/to/directory

# Preview changes without moving files
npm run organize /path/to/directory -- --dry-run

# Organize files by creation date
npm run organize /path/to/directory -- --by-date

# Include hidden files
npm run organize /path/to/directory -- --include-hidden

# Don't create category subfolders
npm run organize /path/to/directory -- --no-subfolders
```

### Programmatic Usage

```typescript
import { FileOrganizer } from "./src/index";

const organizer = new FileOrganizer({
  createSubfolders: true,
  skipHiddenFiles: true,
  dryRun: false,
});

// Organize by file type
const report = await organizer.organizeDirectory("/path/to/directory");
organizer.printReport(report);

// Organize by date
const dateReport = await organizer.organizeFilesByDate("/path/to/directory");
organizer.printReport(dateReport);
```

## File Categories

The organizer automatically categorizes files into the following folders:

- **images**: jpg, jpeg, png, gif, bmp, svg, webp, ico
- **videos**: mp4, avi, mov, wmv, flv, webm, mkv, m4v
- **audio**: mp3, wav, flac, aac, ogg, wma, m4a
- **documents**: pdf, doc, docx, txt, rtf, odt
- **spreadsheets**: xls, xlsx, csv, ods
- **presentations**: ppt, pptx, odp
- **archives**: zip, rar, 7z, tar, gz, bz2, xz
- **code**: js, ts, py, java, cpp, c, cs, php, rb, go, rs, swift, html, css, scss, json, xml, yaml, yml
- **executables**: exe, msi, deb, rpm, dmg, app
- **others**: any other file types

## API

### FileOrganizer Class

#### Constructor Options

```typescript
interface FileOrganizerOptions {
  createSubfolders?: boolean; // Create category folders (default: true)
  preserveOriginalStructure?: boolean; // Preserve original folder structure (default: false)
  skipHiddenFiles?: boolean; // Skip files starting with . (default: true)
  dryRun?: boolean; // Preview mode (default: false)
}
```

#### Methods

- `organizeDirectory(directoryPath: string)`: Organize files by category
- `organizeFilesByDate(directoryPath: string)`: Organize files by creation date
- `getFileInfo(filePath: string)`: Get detailed file information
- `printReport(report: OrganizationReport)`: Print organization results

### Organization Report

```typescript
interface OrganizationReport {
  totalFiles: number;
  organizedFiles: number;
  skippedFiles: number;
  categories: Map<string, number>;
  errors: string[];
}
```

## Development

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## Examples

### Basic Organization

```bash
# Organize Downloads folder
npm run organize ~/Downloads

# Preview changes first
npm run organize ~/Downloads -- --dry-run
```

### Date-based Organization

```bash
# Organize photos by date (creates YYYY/YYYY-MM structure)
npm run organize ~/Pictures -- --by-date
```

### Custom Options

```typescript
import { FileOrganizer } from "./src/index";

const organizer = new FileOrganizer({
  createSubfolders: true,
  skipHiddenFiles: false, // Include hidden files
  dryRun: true, // Preview mode
});

const report = await organizer.organizeDirectory("./messy-folder");
console.log(
  `Organized ${report.organizedFiles} out of ${report.totalFiles} files`
);
```

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Safety Features

- **Dry run mode**: Always test with `--dry-run` first
- **Duplicate handling**: Automatically renames conflicting files
- **Error recovery**: Continues processing even if individual files fail
- **Comprehensive logging**: Detailed reports of all operations