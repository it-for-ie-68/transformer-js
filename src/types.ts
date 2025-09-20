export type ModelStatusText =
  | "done"
  | "ready"
  | "progress"
  | "initiate"
  | "download";

export type PayloadStatusText =
  | "load_model"
  | "start_generate_text"
  | "update_text"
  | "done_generate_text";

export interface ModelStatus {
  status: ModelStatusText;
  progress: number;
  modelName: string;
}

export const languages = ["en", "th", "es", "fr"] as const;

export type Language = (typeof languages)[number];

export interface PayloadFromMain {
  inputText: string;
  srcLang: Language;
  tgtLang: Language;
}

export interface PayloadFromWorker {
  status: PayloadStatusText;
  payload: string | ModelStatus;
}
