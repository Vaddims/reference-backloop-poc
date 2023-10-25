import { SerializationNode } from '../src/index';

describe('Representer metadata tests', () => {
  const entryObject = {
    text: 'Hello World',
    array: ['at index 0', 'at index 1'],
    object: {
      boolean: true,
      nll: null,
      udfn: undefined,
    }
  } as const;
  // Use const to infer all primitive data

  const serializationNode = SerializationNode.from(entryObject);
  const [ tree, getRepresenter ] = serializationNode.createBackloopReference();

  test('tree.text', () => {
    const textPropRepresenter = getRepresenter(tree.text);
    // Typescript Type: SerializationNode<"Hello World">

    expect(textPropRepresenter).toEqual(
      expect.objectContaining({ type: 'String', value: 'Hello World' })
    );
  });

  test('tree.array', () => {
    const arrayPropRepresenter = getRepresenter(tree.array);
    /* Typescript Type:
      array: {
        0: BackloopEndPoint<SerializationNode<"at index 0">>;
        1: BackloopEndPoint<SerializationNode<"at index 1">>;
      }
    */

    expect(arrayPropRepresenter).toEqual(
      expect.objectContaining({ type: 'Array', value: expect.any(Array) })
    );
  });

  test('tree.array[0]', () => {
    const arrayIndex0Representer = getRepresenter(tree.array[0]);
    // Typescript Type: SerializationNode<"at index 0">

    expect(arrayIndex0Representer).toEqual(
      expect.objectContaining({ type: 'String', value: 'at index 0' })
    );
  });

  test('tree.array[1]', () => {
    const arrayIndex1Representer = getRepresenter(tree.array[1]);
    // Typescript Type: SerializationNode<"at index 1">

    expect(arrayIndex1Representer).toEqual(
      expect.objectContaining({ type: 'String', value: 'at index 1' })
    );
  });

  test('tree.object', () => {
    const objectPropRepresenter = getRepresenter(tree.object);
    /* Typescript Type:
      SerializationNode<{
        boolean: SerializationNode<true>;
        nll: SerializationNode<null>;
        udfn: SerializationNode<undefined>;
      }>
    */

    expect(objectPropRepresenter).toEqual(
      expect.objectContaining({
        type: 'Object',
        value: expect.objectContaining({
          boolean: expect.objectContaining({ type: 'Boolean', value: true }),
          nll: expect.objectContaining({ type: undefined, value: null }),
          udfn: expect.objectContaining({ type: undefined, value: undefined }),
        })
      })
    );
  });

  test('tree.object.boolean', () => {
    const booleanPropRepresenter = getRepresenter(tree.object.boolean);
    // Typescript Type: SerializationNode<true>

    expect(booleanPropRepresenter).toEqual(
      expect.objectContaining({ type: 'Boolean', value: true })
    );
  });

  test('tree.object.nll', () => {
    const nullPropRepresenter = getRepresenter(tree.object.nll);
    // Typescript Type: SerializationNode<null>

    expect(nullPropRepresenter).toEqual(
      expect.objectContaining({ type: undefined, value: null })
    );
  });

  test('tree.object.udfn', () => {
    const undefinedPropRepresenter = getRepresenter(tree.object.udfn);
    // Typescript Type: SerializationNode<undefined>

    expect(undefinedPropRepresenter).toEqual(
      expect.objectContaining({ type: undefined, value: undefined })
    );
  });
});