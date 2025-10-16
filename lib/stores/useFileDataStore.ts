import { create } from 'zustand';

export interface FileDataItem {
  id: string;
  data: Record<string, string>[];
}

interface FileDataStore {
  filesData: FileDataItem[];
  setFilesData: (filesData: FileDataItem[]) => void;
  clearFilesData: () => void;
}

const useFileDataStore = create<FileDataStore>((set) => ({
  filesData: [],
  
  setFilesData: (filesData) => set({ filesData }),
  
  clearFilesData: () => set({ filesData: [] }),
}));

export default useFileDataStore;

