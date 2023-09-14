import { $throw } from ".";

export type Class<T = {}, Args extends any[] = any[]> = new (...args: Args) => T;

export class MixinBuilder<Base, Args extends any[]> {
  constructor(private Base: Class<Base, Args>) { }

  mixin<Mixin>(MixinFactory: (BaseClass: Class<Base, Args>) => Class<Mixin, Args>): MixinBuilder<Base & Mixin, Args> {
    const MixedClass = MixinFactory(this.Base);
    this.Base = MixedClass as Class<Base & Mixin, Args>;
    return this as MixinBuilder<Base & Mixin, Args>;
  }

  create(...args: Args) {
    return new this.Base(...args);
  }
}

export function mixinable<Base, Args extends any[]>(BaseClass: Class<Base, Args>) {
  return new MixinBuilder(BaseClass);
}

// Test

// Define the base class
class Chair<C extends 'red' | 'blue'> {
  constructor(public color: C) {}

  sit() {
    console.log(`You sit on the ${this.color} chair.`);
  }
}

// Define the Funny mixin
function FunnyMixin<Base extends Class<Chair<any>>>(BaseClass: Base) {
  return class extends BaseClass {
    joke() {
      console.log(`Why don't ${this.color} chairs ever tell secrets? Because they can't stand up for themselves!`);
    }
  };
}

// Define the Breakable mixin
function BreakableMixin<Base extends Class<Chair<any>>>(BaseClass: Base) {
  return class extends BaseClass {
    break() {
      console.log(`The ${this.color} chair breaks!`);
    }
  };
}

// Create a factory for funny, breakable chairs
const FunnyBreakableChair = mixinable(Chair as Class<Chair<any>, ['red' | 'blue']>)
  .mixin(FunnyMixin)
  .mixin(BreakableMixin);

// Now you can use the factory function to create funny, breakable chairs
const redFunnyBreakableChair = FunnyBreakableChair.create("red");
const blueFunnyBreakableChair = FunnyBreakableChair.create("blue");

redFunnyBreakableChair.sit(); // You sit on the red chair.
blueFunnyBreakableChair.joke(); // Why don't blue chairs ever tell secrets? Because they can't stand up for themselves!
redFunnyBreakableChair.break(); // The red chair breaks!