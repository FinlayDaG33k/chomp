export type ValidationCallback = (input: any, parameters: any) => ValidationCallbackResponse;

export type ValidationCallbackResponse = ValidationCallbackSuccess|ValidationCallbackError;

export type ValidationCallbackParameters = {[key: string]: any};

export type ValidationOptions = {
  last?: boolean;
  message?: string;
  parameters?: ValidationCallbackParameters;
};

export type ValidationStep = {
  callback: ValidationCallback
  options: ValidationOptions;
};

export type ValidationCallbackSuccess = [undefined];

export type ValidationCallbackError = [string];
