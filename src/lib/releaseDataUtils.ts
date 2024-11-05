export const fileTypeMap = {
    zip: "ZIP Archive",
    dmg: "Disk Image",
    exe: "Installer",
    msi: "Windows Installer",
    "tar.gz": "Tarball",
    sha1: "SHA1 Checksum",
    sha256: "SHA256 Checksum",
    AppImage: "AppImage",
    deb: "Debian Package",
    rpm: "RPM Package",
    zsync: "ZSync File",
};

export const filePriority = {
    macos: ['dmg', 'zip', 'tar.gz', 'reh'],
    windows: ['exe', 'msi', 'zip', 'reh'],
    linux: ['AppImage', 'tar.gz', 'zip', 'reh']
};

export interface ReleaseFile {
    name: string;
    url: string;
    size?: string;
    date?: string;
}

export interface ParsedRelease {
    version?: string;
    files: {
        macos: ReleaseFile[];
        windows: ReleaseFile[];
        linux: ReleaseFile[];
    };
}

export function mapFileToUserFriendlyName(file: ReleaseFile): { name: string; type: string; arch: string } {
    const extension = Object.keys(fileTypeMap).find((ext) => file.name.toLowerCase().endsWith(ext));
    const fileType = extension ? fileTypeMap[extension as keyof typeof fileTypeMap] : "File";

    let arch = "Universal";
    const fileName = file.name.toLowerCase();

    if (fileName.includes("arm64")) {
        arch = "ARM64";
    } else if (fileName.includes("armhf")) {
        arch = "ARM (32-bit)";
    } else if (fileName.includes("riscv64")) {
        arch = "RISC-V 64";
    } else if (fileName.includes("ppc64le")) {
        arch = "PowerPC 64 LE";
    } else if (fileName.includes("x64") || fileName.includes("x86_64") || fileName.includes("amd64")) {
        arch = "64-bit";
    }

    let type = fileType;
    if (fileName.includes("reh")) {
        type = "Remote Extension Host";
    }

    let name = file.name;
    if (fileName.includes("usersetup")) {
        name = "User Install";
    } else if (fileName.includes("setup")) {
        name = "System Install";
    } else if (fileName.includes("updates-disabled")) {
        name = "System Install (No Updates)";
    }

    return { name, type, arch };
}

export function parseReleaseData(assets: any[]): ParsedRelease {
    const files: ParsedRelease['files'] = {
        macos: [],
        windows: [],
        linux: []
    };

    assets.forEach(asset => {
        const fileName = asset.name.toLowerCase();
        let os: keyof ParsedRelease['files'] | null = null;

        if (fileName.includes('darwin') ||
            fileName.match(/\.dmg$/) ||
            fileName.match(/mac(os)?/i)) {
            os = 'macos';
        } else if (fileName.includes('win32') ||
            fileName.match(/\.(exe|msi)$/) ||
            fileName.includes('windows')) {
            os = 'windows';
        } else if (fileName.includes('linux') ||
            fileName.match(/\.(deb|rpm|appimage)$/) ||
            (fileName.includes('tar.gz') && !fileName.includes('darwin') && !fileName.includes('win32'))) {
            os = 'linux';
        }

        if (os && asset.browser_download_url) {
            files[os].push({
                name: asset.name,
                url: asset.browser_download_url,
                size: asset.size?.toString() || undefined,
                date: asset.created_at || undefined
            });
        }
    });

    return {
        version: undefined,
        files
    };
}

function getFileExtension(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ext === 'gz' ? 'tar.gz' : (ext || '');
}

function formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
    }
    return `${bytes.toFixed(2)} ${units[i]}`;
}

// Add any other utility functions you need here