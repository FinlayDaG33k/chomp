export type ValidationCallback = (input: any, parameters: any) => ValidationCallbackResponse;

export type ValidationCallbackResponse = ValidationCallbackSuccess|ValidationCallbackError;

export type ValidationCallbackParameters = ValidationParameter[];

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

export type ValidationParameter = {[key: string]: any};
