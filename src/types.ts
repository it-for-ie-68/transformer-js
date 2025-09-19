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

export interface PayloadFromMain {
  inputText: string;
  context: string;
}

export interface PayloadFromWorker {
  status: PayloadStatusText;
  payload: string | ModelStatus;
}
