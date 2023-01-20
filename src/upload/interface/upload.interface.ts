export interface FileExist {
  fileHash: string
}

export interface FileInfo {
  fileHash: string
  fileName: string
  fileIndex: string
  total: string
  mimetype: string
  size: string
  suffix: string
}

export interface FileMergeInfo {
  fileHash: string
  model: string
}
