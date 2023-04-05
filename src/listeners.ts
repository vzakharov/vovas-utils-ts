export type RawHandler<RawHandlerArg> = (arg: RawHandlerArg) => void;

export type ParametricHandler<
  GuardedArg, 
  Params extends Record<string, any>
> = (arg: GuardedArg, params: Params) => void;

export type Gatekeeper<
  RawHandlerArg, 
  Params extends Record<string, any>
> = (arg: RawHandlerArg, params: Params) => boolean;

export type Listener<Client, Event extends string, HandlerArg> = (event: Event, handler: RawHandler<HandlerArg>) => Client;

export interface Client<Event extends string, HandlerArg> {
  on: Listener<this, Event, HandlerArg>;
  removeListener: Listener<this, Event, HandlerArg>;
};

export class Listeners<
  Event extends string,
  RawHandlerArg,
  GuardedArg extends RawHandlerArg,
  GatekeeperParams extends Record<string, any>,
  HandlerParams extends Record<string, any>
> {

  private listeners: [Event, RawHandler<RawHandlerArg>][] = [];

  constructor(
    private client: Client<Event, RawHandlerArg>,
    private event: Event,
    private gatekeeper: Gatekeeper<RawHandlerArg, GatekeeperParams>,
    private handler: ParametricHandler<GuardedArg, HandlerParams>
  ) { };

  add(params: GatekeeperParams & HandlerParams) {
    const listener = (arg: RawHandlerArg) => {
      if ( this.gatekeeper(arg, params) ) {
        this.handler(arg as GuardedArg, params);
      };
    };
    this.listeners.push([this.event, listener]);
    this.client.on(this.event, listener);
  };

  removeAll() {
    this.listeners.forEach(listener => this.client.removeListener(...listener));
  };

};
