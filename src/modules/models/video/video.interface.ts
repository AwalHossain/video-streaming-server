export type IPayload = {
  [key: string]: any;
  originalName: string;
  fileName?: string;
  recordingData?: number;
  videoLink?: string;
  viewCount?: number;
  duration?: number;
};



export type IVdieosFilterableFields = {
  searchTerm?: string;
  title?: string;
  category?: string;
  recordingDate?: string;
}