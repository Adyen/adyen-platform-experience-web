const fileNameMappings = {
    'image/png': 'PNG',
    'image/jpeg': 'JPEG',
    'image/jpg': 'JPG',
    'application/pdf': 'PDF',
};

export const getHumanReadableFileName = (fileName: string): string => {
    return fileNameMappings[fileName as keyof typeof fileNameMappings] || fileName;
};
