export enum LogLevels {
  All = 1 << 0,
  Error = 1 << 1,
  Success = 1 << 2,
  Warning = 1 << 3,
  Notice = 1 << 4,
  Info = 1 << 5,
  Monitor= 1 << 6,
  Debug = 1 << 7,
  Trace = 1 << 8,
}

export type LogHandlers = {
  error: (message: string, stack: string | null) => void;
  success: (message: string) => void;
  warning: (message: string) => void;
  notice: (message: string) => void;
  info: (message: string) => void;
  monitor: (message: string) => void;
  debug: (message: string) => void;
  trace: (message: string) => void;
};


export type LogLevelKeys = keyof typeof LogLevels;
export type LogLevelHandlerKeys = keyof LogHandlers;
