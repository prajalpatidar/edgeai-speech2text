export interface ModelConfig {
  numEncoderLayers: number;
  encoderDim: number;
  queryHeadDim: number;
  datasetPath: string;
  batchSize: number;
}

export enum View {
  DATA_PREP = 'DATA_PREP',
  TRAINING = 'TRAINING',
  EXPORT = 'EXPORT',
  INFERENCE = 'INFERENCE',
  ADVICE = 'ADVICE'
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}