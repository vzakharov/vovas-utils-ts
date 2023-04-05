export type Handler<HandlerArg> = (arg: HandlerArg) => void;
export type ParametricHandler<HandlerArg, Params extends any[]> = (arg: HandlerArg, ...params: Params) => void;

export type Gatekeeper<
  HandlerArg, 
  Params extends any[]
> = (arg: HandlerArg, ...params: Params) => boolean;

export type Listener<Client, Event extends string, HandlerArg> = (event: Event, handler: Handler<HandlerArg>) => Client;

export interface Client<Event extends string, HandlerArg> {
  on: Listener<this, Event, HandlerArg>;
  removeListener: Listener<this, Event, HandlerArg>;
};

export class Listeners<Event extends string, HandlerArg, GuardedArg extends HandlerArg, Params extends any[]> {

  private listeners: [Event, Handler<HandlerArg>][] = [];

  constructor(
    private client: Client<Event, HandlerArg>,
    private event: Event,
    private gatekeeper: Gatekeeper<HandlerArg, Params>,
    private handler: ParametricHandler<GuardedArg, Params>
  ) { };

  add(...params: Params) {
    const listener = (arg: HandlerArg) => {
      if ( this.gatekeeper(arg, ...params) ) {
        this.handler.call(this, arg as GuardedArg, ...params);
      };
    };
    this.listeners.push([this.event, listener]);
    this.client.on(this.event, listener);
  };

  removeAll() {
    this.listeners.forEach(listener => this.client.removeListener(...listener));
  };

};
