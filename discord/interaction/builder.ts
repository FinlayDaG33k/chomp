import {ApplicationCommandOptionTypes, ApplicationCommandTypes} from "../mod.ts";

type OptionTypes =
  | ((command: InteractionSubcommandBuilder) => void)
  | ((option: InteractionOptionBuilder) => void)

type CommandTypes = keyof typeof ApplicationCommandTypes;
type CommandOptionTypes = keyof typeof ApplicationCommandOptionTypes;

export class InteractionBuilder {
  private _name: string = undefined!;
  private _description: string = undefined!;
  private _type: ApplicationCommandTypes = ApplicationCommandTypes.ChatInput;
  private _options: Array<OptionTypes> = [];

  public setName(name: string): InteractionBuilder {
    this._name = name;

    return this;
  }

  public setDescription(description: string): InteractionBuilder {
    this._description = description;

    return this;
  }
  
  public setType(type: CommandTypes): InteractionBuilder {
    this._type = ApplicationCommandTypes[type];
    
    return this;
  }

  public addSubcommand(command: (command: InteractionSubcommandBuilder) => InteractionSubcommandBuilder): InteractionBuilder {
    // @ts-ignore TODO: Figure out why this throws an error during tests
    this._options.push(command(new InteractionSubcommandBuilder()));

    return this;
  }

  public addOption(option: (option: InteractionOptionBuilder) => void): InteractionBuilder {
    // @ts-ignore TODO: Figure out why this throws an error during tests
    this._options.push(option(new InteractionOptionBuilder()));

    return this;
  }
  
  public toJSON() {
    // Create object for our interaction
    const data = {
      name: this._name,
      description: this._description,
      type: this._type,
      options: []
    };
    
    // Add data for our options
    for(const option of this._options) {
      // @ts-ignore TODO: Figure out why this throws an error during tests
      data.options.push(option.toJSON());
    }
    
    return data;
  }
}

export class InteractionSubcommandBuilder {
  protected _name: string = undefined!;
  protected _description: string = undefined!;
  private _type: ApplicationCommandOptionTypes = ApplicationCommandOptionTypes.SubCommand;
  protected _options: Array<OptionTypes> = [];

  public setName(name: string): InteractionSubcommandBuilder {
    this._name = name;

    return this;
  }

  public setDescription(description: string): InteractionSubcommandBuilder {
    this._description = description;

    return this;
  }

  public setType(type: CommandOptionTypes): InteractionSubcommandBuilder {
    this._type = ApplicationCommandOptionTypes[type];

    return this;
  }

  public addOption(option: (option: InteractionOptionBuilder) => void): InteractionSubcommandBuilder {
    // @ts-ignore TODO: Figure out why this throws an error during tests
    this._options.push(option(new InteractionOptionBuilder()));

    return this;
  }
  
  public toJSON() {
    // Create object for our subcommand
    const data = {
      name: this._name,
      description: this._description,
      type: this._type,
      options: []
    };

    // Add data for our options
    for(const option of this._options) {
      // @ts-ignore TODO: Figure out why this throws an error during tests
      data.options.push(option.toJSON());
    }
    
    return data;
  }
}

export class InteractionOptionBuilder {
  private _name: string = undefined!;
  private _description: string = undefined!;
  private _required = false;
  private _autocomplete: boolean = false;
  private _type: ApplicationCommandOptionTypes = undefined!;

  public setName(name: string): InteractionOptionBuilder {
    this._name = name;

    return this;
  }

  public setDescription(description: string): InteractionOptionBuilder {
    this._description = description;

    return this;
  }
  
  public setType(type: CommandOptionTypes): InteractionOptionBuilder {
    this._type = ApplicationCommandOptionTypes[type];
    
    return this;
  }

  public setRequired(required: boolean): InteractionOptionBuilder {
    this._required = required;

    return this;
  }

  public setAutocomplete(autocomplete: boolean): InteractionOptionBuilder {
    this._autocomplete = autocomplete;

    return this;
  }

  public toJSON() {
    // Create object for our option
    return {
      name: this._name,
      description: this._description,
      type: this._type,
      required: this._required,
      autocomplete: this._autocomplete,
    };
  }
}
