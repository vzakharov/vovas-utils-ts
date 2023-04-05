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

export const groupListeners: Record<string, GroupListener<any, any, any>> = {};

export class GroupListener<
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
    const handler = (arg: HandlerArg) => this.handler(arg, ...params);
    this.listeners.push([this.event, handler]);
    this.client.on(this.event, handler);
  };

  removeAll() {
    this.listeners.forEach(listener => this.client.removeListener(...listener));
  };

  static createOrAdd<
    Event extends string,
    HandlerArg,
    Params extends any[],
  >(
    slug: string,
    client: Client<Event, HandlerArg>,
    event: Event,
    handler: ParametricHandler<HandlerArg, Params>,
  ): GroupListener<Event, HandlerArg, Params> {
    return groupListeners[slug] ??= new GroupListener(client, event, handler);
  }

  static removeAll(slug: string) {
    groupListeners[slug]?.removeAll();
    delete groupListeners[slug];
  };

};
