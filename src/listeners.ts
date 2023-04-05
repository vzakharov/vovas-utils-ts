export type Handler<HandlerArg> = (arg: HandlerArg) => void;

export type ParametricHandler<
  HandlerArg, 
  Params extends any[]
> = (arg: HandlerArg, ...params: Params) => void;

export type Listener<Client, Event extends string, HandlerArg> = (event: Event, handler: Handler<HandlerArg>) => Client;

export interface Client<Event extends string, HandlerArg> {
  on: Listener<this, Event, HandlerArg>;
  removeListener: Listener<this, Event, HandlerArg>;
};

export class Listeners<
  Event extends string,
  HandlerArg,
  Params extends any[],
> {

  private listeners: [Event, Handler<HandlerArg>][] = [];

  constructor(
    private client: Client<Event, HandlerArg>,
    private event: Event,
    private handler: ParametricHandler<HandlerArg, Params>,
  ) { };

  add(...params: Params) {
    const listener = (arg: HandlerArg) => this.handler(arg, ...params);
    this.listeners.push([this.event, listener]);
    this.client.on(this.event, listener);
  };

  removeAll() {
    this.listeners.forEach(listener => this.client.removeListener(...listener));
  };

};
