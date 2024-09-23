import {
  CommandParamDefinition,
  CommandParams,
  CommandParamsDefinition,
  CommandParamType,
  ParameterizableCommand
} from '@consy/declarations';

interface IsParameterizableCalledCorrectlyParams<D extends CommandParamsDefinition = CommandParamsDefinition> {
  commandDefinition: ParameterizableCommand<D>;
  callParams: unknown[];
}

function isCommandParams<D extends CommandParamsDefinition>(
  params: object,
  expectedKeys: string[]
): params is CommandParams<D> {
  return expectedKeys.every((key: string) => key in params);
}

export function getValidatedParameterizableCommandParams<D extends CommandParamsDefinition>({
  commandDefinition,
  callParams
}: IsParameterizableCalledCorrectlyParams<D>): CommandParams<D> {
  if (callParams.length !== 1) {
    throw new Error(
      `Command params are expected to be passed as a single object. Received ${callParams.length} arguments.`
    );
  }

  const [params]: unknown[] = callParams;
  if (typeof params !== 'object' || params === null) {
    throw new Error(`Command params are expected to be an object. Received ${typeof params} instead.`);
  }

  const expectedParamNames: string[] = Object.keys(commandDefinition.params);

  Object.entries(params).forEach(([paramKey, paramValue]: [string, unknown]) => {
    const paramDefinition: CommandParamDefinition | undefined = commandDefinition.params[paramKey];
    if (paramDefinition === undefined) {
      throw new Error(
        `Unexpected command param "${paramKey}" received. Supported params: ${expectedParamNames.join(', ')}.`
      );
    }

    switch (paramDefinition.type) {
      case CommandParamType.Select: {
        if (!Array.isArray(paramValue) || paramValue.some((option: unknown) => typeof option !== 'string')) {
          throw new Error(
            `Command param "${paramKey}" is expected to be an array of strings. Received ${typeof paramValue} instead.`
          );
        }
        return;
      }

      case CommandParamType.String: {
        if (typeof paramValue !== 'string') {
          throw new Error(
            `Command param "${paramKey}" is expected to be a string. Received ${typeof paramValue} instead.`
          );
        }
        return;
      }

      case CommandParamType.Toggle: {
        if (typeof paramValue !== 'boolean') {
          throw new Error(
            `Command param "${paramKey}" is expected to be a boolean. Received ${typeof paramValue} instead.`
          );
        }
        return;
      }

      default: {
        throw new Error(`Unsupported command param definition: ${JSON.stringify(paramDefinition)}`);
      }
    }
  });

  if (isCommandParams<D>(params, expectedParamNames)) {
    return params;
  }

  throw new Error(`Some of the expected command params are missing: ${expectedParamNames.join(', ')}.`);
}
