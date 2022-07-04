type Primitives = string | number | boolean | null | undefined;
type ExistingInferValue = undefined | null | Object;

interface ImplicitArray<T = any> { [key: number]: T }
type ExtractIndexes<T extends ImplicitArray> = Extract<keyof T, `${number}`>;
interface BackloopEndPoint<_> {} // Generic type is used only for type saving

type ValueProp = 'value';

type SerializationNodeValue<T> = T extends Primitives ? T :
  T extends (infer U)[] | readonly [...any[]] ?
    U extends ExistingInferValue ? // The U will be ExistingInferValue type only if the T is not a readonly array
      readonly SerializationNode<SerializationNodeValue<U>>[] : 
      { [K in ExtractIndexes<T>]: SerializationNode<SerializationNodeValue<T[K]>> } & 
      Omit<readonly SerializationNode<SerializationNodeValue<T[ExtractIndexes<T>]>>[], number> :
    { [K in keyof T]: SerializationNode<SerializationNodeValue<T[K]>> }


type BackloopReference<T extends SerializationNode<any>> = T[ValueProp] extends Primitives ? 
  BackloopEndPoint<T> :
  T[ValueProp] extends (infer U)[] | readonly [...any] ? 
    U extends ExistingInferValue & SerializationNode<any> ? 
      ImplicitArray<BackloopReference<U>> : 
      { [K in ExtractIndexes<T[ValueProp]>]: BackloopReference<T[ValueProp][K]> } :
    { [K in keyof T[ValueProp]]: BackloopReference<T[ValueProp][K]> };

type BackloopReferenceResolve<T extends Object> = T extends BackloopEndPoint<infer U> ?
  U extends SerializationNode ? U : BackloopObjectResolve<T> :
  never;  

type BackloopObjectResolve<T> = T extends ImplicitArray<infer U> ?
  U extends BackloopEndPoint<infer U2> ?
    {} extends T ? 
      SerializationNode<readonly U2[]> : 
      SerializationNode<{ [K in keyof T]: BackloopReferenceResolve<T[K]> } 
      & Omit<readonly BackloopReferenceResolve<T[keyof T]>[], number>> :
    SerializationNode<{ [K in keyof T]: BackloopReferenceResolve<T[K]> }>: 
  never;
  
// SerializationNode is just a serialized representation of a value 
class SerializationNode<T extends SerializationNodeValue<any> = any> {
  private constructor (readonly type: string | undefined, readonly value: T) {}

  public createBackloopReference() {
    type Representer = {} | []; // Is actual equal with the final type of BackloopReference type
    const representerMap = new Map<Representer, SerializationNode<any>>();

    const getRepresenterSerializationNode = <T extends BackloopReference<any>>(representer: T) => {
      const typedValue = representerMap.get(representer);
      if (!typedValue) {
        throw new Error('Reference not found.');
      }

      return typedValue as BackloopReferenceResolve<T>;
    }

    const createReference = <T extends SerializationNode<SerializationNodeValue<any>>>(typedValue: T): BackloopReference<T> => {
      if (typeof typedValue.value !== 'object' || typedValue.value === null) {
        const representer = {};
        representerMap.set(representer, typedValue);
        return representer as BackloopReference<T>;
      }

      if (Array.isArray(typedValue.value)) {
        const representer = typedValue.value.map(createReference);
        representerMap.set(representer, typedValue);
        return representer as any as BackloopReference<T>;
      }

      const representer = {} as any;
      for (const key in typedValue.value) {
        representer[key] = createReference(typedValue.value[key]);
      }

      representerMap.set(representer, typedValue);
      return representer as BackloopReference<T>;
    }
    
    const tree: BackloopReference<typeof this> = createReference(this); // TS requires explicit type here
    return [tree, getRepresenterSerializationNode] as const;
  }

  // Create a SerializationNode tree from a value (testing purposes)
  public static from<T>(value: T): SerializationNode<SerializationNodeValue<T>> {
    const unsignedValue = value as any; // To by pass the TS strange behaviour

    if (typeof value === 'undefined') {
      return new SerializationNode(undefined, unsignedValue);
    }

    if (value === null) {
      return new SerializationNode(undefined, unsignedValue);
    }

    const { name } = (<Object>value).constructor;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return new SerializationNode(name, unsignedValue);
    }
    
    if (Array.isArray(unsignedValue)) {
      return new SerializationNode<SerializationNodeValue<T>>(name, unsignedValue.map(v => SerializationNode.from(v)) as any);
    }

    const object = {} as { [key in keyof T]: SerializationNode<SerializationNodeValue<any>> };
    for (const key in value) {
      object[key] = SerializationNode.from(value[key] as any) as any;
    }
    return new SerializationNode(name, object) as any;
  }
}

const myObject = {
  a: 'Hello World',
  b: ['at index 0', 'at index 1'],
  c: {
    d: true,
    e: null,
    f: undefined,
  }
} as const;

const typedValue = SerializationNode.from(myObject);
const [ tree, getRepresenter ] = typedValue.createBackloopReference();
const representerResult = getRepresenter(tree.c.d);
console.log(representerResult);