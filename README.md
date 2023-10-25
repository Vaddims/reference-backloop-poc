# Reference Backloop (POC)

## Introduction

The **`reference-backloop-poc`** project showcases a unique approach to serializing complex object structures in TypeScript. By converting a complex object into a type-safe, structured format, it retains a tree-like navigation capability similar to the original object structure. A notable aspect of this proof of concept is its ability to traverse serialized data using a tree map, enabling the retrieval of crucial serialization metadata even before the resolution of serialization nodes. This metadata access is essential for situations necessitating future data instantiation, providing a robust mechanism for managing and navigating serialized data while maintaining structured, intuitive access to the underlying serialization metadata.

## Features

- **Type-Safe Serialization**: Serialize complex object structures into a structured, type-safe format.
- **Structured Data Navigation**: Navigate through the serialized data in a structured manner, akin to navigating the original object structure.
- **Serialization Metadata Access**: Access crucial serialization metadata necessary for future data instantiation through a representer object.
- **Backloop References**: Utilize a tree map to navigate through serialized data with backloop references, enabling a structured approach to access serialized data.

## Core Components

### `SerializationNode` Class

This class embodies the core serialization logic, providing methods to serialize data and create backloop references for structured data navigation and metadata access.

### `SerializationNode.prototype.createBackloopReference()` Method

This method is instrumental in creating a tree map to navigate through serialized data. It returns a **`tree`** for structured navigation and a **`getRepresenter`** function to access the representer object, from which serialization metadata can be accessed.

### `getRepresenter` Function

This function is used to retrieve the representer object from which serialization metadata can be accessed. This metadata provides crucial information necessary for future data instantiation.

## Usage

```tsx
import { SerializationNode } from './path-to/backloop-reference';

const entryObject = {
  text: 'Hello World',
  array: ['at index 0', 'at index 1'],
  object: {
    boolean: true,
    nll: null,
    udfn: undefined,
  }
} as const;

const serializationNode = SerializationNode.from(entryObject);
const [ tree, getRepresenter ] = serializationNode.createBackloopReference();

const textPropRepresenter = getRepresenter(tree.text);
// TypeScript Type: SerializationNode<"Hello World">
console.log(textPropRepresenter);
// Returns: SerializationNode { type: 'String', value: 'Hello World' }

const booleanPropRepresenter = getRepresenter(tree.object.boolean);
// TypeScript Type: SerializationNode<true>
console.log(booleanPropRepresenter)
// Returns: SerializationNode { type: 'Boolean', value: true }
```

## Installation

```bash
git clone https://github.com/your-username/reference-backloop-poc.git
cd reference-backloop-poc
npm install
```

## License

This project is licensed under the MIT License.

## Contact

For any inquiries, you can contact the author via email at [vadym.iefremov@gmail.com](mailto:vadym.iefremov@gmail.com).