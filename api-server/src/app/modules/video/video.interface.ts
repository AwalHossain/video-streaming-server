export type IPayload = {
  [key: string]: any;
  originalName: string;
  fileName?: string;
  recordingData?: number;
  videoLink?: string;
  viewsCount?: number;
  duration?: string;
  rawVideoLink?: string;
  history?: IHistory;
};

export type IHistory = {
  status: string;
  createdAt: number;
};

export type IVdieosFilterableFields = {
  searchTerm?: string;
  title?: string;
  category?: string;
  recordingDate?: string;
  tags?: string[];
};
