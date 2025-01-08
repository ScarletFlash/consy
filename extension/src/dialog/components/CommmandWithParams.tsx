import { CommandParams, CommandParamsDefinition, CommandParamType } from '@consy/declarations';
import { isCommandParamDefinition } from '@consy/utilities';
import { Field, Fieldset, Input, Label, Switch } from '@headlessui/react';
import { ChangeEvent, Dispatch, ReactNode, SetStateAction, useState } from 'react';
import { CommandExecuteButton } from './CommandExecuteButton';

interface CommmandWithParamsParams {
  paramsDefinition: CommandParamsDefinition;
  commandName: string;
  instanceKey: string;
}

export function CommmandWithParams<D extends CommandParamsDefinition>({
  paramsDefinition,
  commandName,
  instanceKey
}: CommmandWithParamsParams): ReactNode {
  const [value, setValue]: [Partial<CommandParams<D>>, Dispatch<SetStateAction<Partial<CommandParams<D>>>>] = useState<
    Partial<CommandParams<D>>
  >({});

  return (
    <Fieldset className="flex flex-col gap-4">
      {Object.entries(paramsDefinition)
        .sort(([paramNameA]: [string, unknown], [paramNameB]: [string, unknown]) =>
          paramNameA.localeCompare(paramNameB)
        )
        .map(([paramName, paramDefinition]: [string, unknown]): ReactNode => {
          if (!isCommandParamDefinition(paramDefinition)) {
            throw new Error('Invalid param definition');
          }

          switch (paramDefinition.type) {
            case CommandParamType.String: {
              return (
                <Field key={paramName}>
                  <Label className="text-sm/6 font-medium text-white">{paramName}</Label>
                  <Input
                    type="text"
                    className={
                      'mt-3 block w-full rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-white focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
                    }
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setValue((currentValue: Partial<CommandParams<D>>) => ({
                        ...currentValue,
                        [paramName]: event.target.value
                      }))
                    }
                  />
                </Field>
              );
            }

            case CommandParamType.Toggle: {
              return (
                <Switch
                  key={paramName}
                  className="group relative flex h-7 w-14 cursor-pointer rounded-full bg-white/10 p-1 transition-colors duration-200 ease-in-out focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white data-[checked]:bg-white/10"
                  onChange={(checked: boolean) =>
                    setValue((currentValue: Partial<CommandParams<D>>) => ({
                      ...currentValue,
                      [paramName]: checked
                    }))
                  }
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none inline-block size-5 translate-x-0 rounded-full bg-white ring-0 shadow-lg transition duration-200 ease-in-out group-data-[checked]:translate-x-7"
                  />
                </Switch>
              );
            }

            // case CommandParamType.Select: {
            // }
            default: {
              throw new Error(`Unsupported param type: ${paramDefinition.type}`);
            }
          }
        })}

      <CommandExecuteButton
        commandName={commandName}
        instanceKey={instanceKey}
        params={value}
      />
    </Fieldset>
  );
}
