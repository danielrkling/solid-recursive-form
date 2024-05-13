import {
  createSignal,
  createComputed,
  createMemo,
  Accessor,
  Setter,
  children,
  JSX,
  mapArray,
} from "solid-js";

export type Fields<T> = T extends Array<infer TValue>
  ? Array<Control<TValue> | undefined>
  : T extends object
  ? {
      [K in KeyOf<T>]: Control<ForceLookup<T, K>> | undefined;
    }
  : {};

// export type Fields = Control<any>[];
// export type Fields<T> = T extends object
//   ? {
//       [K in keyof T]: Control<ForceLookup<T, K>> | undefined;
//     }
//   : {};

// export type KeyOf<TParent extends object> = TParent extends Array<any>
//   ? number
//   : keyof TParent;
export type KeyOf<TParent extends object> = keyof TParent;

export type ForceLookup<T, K> = T[K & keyof T]; // no error

export type ValueOf<
  TParent extends object,
  TKey extends KeyOf<TParent>
> = TParent extends Array<infer TItem> ? TItem : ForceLookup<TParent, TKey>;

// /**
//  * Value type of signal object.
//  */
// export type Signal<T> = { get: Accessor<T>; set: Setter<T> };

// /**
//  * Creates a simple reactive state with a getter and setter.
//  */
// export function createSignalObject<T>(): Signal<T | undefined>;
// export function createSignalObject<T>(value: T): Signal<T>;
// export function createSignalObject<T>(value?: T) {
//   const [get, set] = createSignal(value);

//   return { get, set };
// }

export type ValidateMethod =
  | "onChange"
  | "onBlur"
  | "onSubmit"
  | "afterSubmit"
  | "afterBlur";

export type ValidationError =
  | void
  | false
  | undefined
  | null
  | string
  | string[];

export type Validate<T> = (value: T) => ValidationError;

export type Control<T> = {
  /** Field Map if initial value is object else array */
  fields: Accessor<Fields<T>>;
  /** Array of fields */
  fieldList: Accessor<Control<any>[]>
  /** Reactive Value */
  value: Accessor<T>;
  setValue: Setter<T>;
  initialValue: T;
  error: Accessor<ValidationError>;
  errorList: Accessor<ValidationError[]>;
  isDirty: Accessor<boolean>;
  isPristine: Accessor<boolean>;
  isValid: Accessor<boolean>;
  isInvalid: Accessor<boolean>;
  isSubmitted: Accessor<boolean>;
  ref: any;
  focusError: () => boolean;
  isTouched: Accessor<boolean>;
  setIsTouched: Setter<boolean>;
  registerField<TKey extends keyof T>(
    name: TKey,
    control: Control<T[TKey]>
  ): void;
  unregisterField<TKey extends keyof T>(name: TKey): void;
  
};

export function createControl<T>(
  value: Accessor<T>,
  setValue: Setter<T>,
  isSubmitted: Accessor<boolean>,
  validate?: Validate<T>
): Control<T> {
  const initialValue = value();
  const [fields, setFields] = createSignal<Fields<T>>(
    (Array.isArray(initialValue) ? [] : {}) as Fields<T>
  );
  const fieldList : Accessor<Control<any>[]> = createMemo(()=>{
    const f = fields()
    if (Array.isArray(f)){
      return f
    }else{
      return Object.values(f)
    }
  })

  const error = createMemo(() => validate?.(value()));
  const isPristine = createMemo(() => initialValue === value());
  const isDirty = createMemo(() => !isPristine());
  const isInvalid = createMemo(() => {
    return (
      Boolean(error()) ||
      fieldList().some((f) => f.isInvalid())
    );
  });
  const isValid = createMemo(() => !isInvalid());
  const [getRef, ref] = createSignal<any>();
  const [isTouched, setIsTouched] = createSignal(false);

  const errorList = createMemo(()=>{
    const list = [error()]
    for (const field of fieldList()) {
      list.push(...field.errorList())
    }
    return list.filter(Boolean)
  })

  const focusError = (): boolean => {
    if (getRef() && isInvalid()) {
      getRef().focus();
      return true;
    }

    for (const field of fieldList()) {
      if (field.focusError()) return true;
    }
    return false;
  };

  const registerField = <TKey extends keyof T>(
    name: TKey,
    control: Control<T[TKey]>
  ) =>
    setFields((prev) => {
      if (Array.isArray(prev)) {
        const array = [...prev];
        array[Number(name)] = control;
        return array as Fields<T>;
      } else {
        const obj = { ...prev };
        //@ts-expect-error
        obj[name] = control;
        return obj;
      }
    });
  const unregisterField = <TKey extends keyof T>(name: TKey) =>
    setFields((prev) => {
      if (Array.isArray(prev)) {
        const array = [...prev];
        delete array[Number(name)];
        return array as Fields<T>;
      } else {
        const obj = { ...prev };
        //@ts-expect-error
        delete obj[name];
        return obj;
      }
    });

  return {
    fields,
    value,
    setValue,
    initialValue,
    error,
    errorList,
    isDirty,
    isPristine,
    isValid,
    isInvalid,
    isTouched,
    isSubmitted,
    ref,
    focusError,
    setIsTouched,
    registerField,
    unregisterField,
    fieldList
  };
}

export type ArrayMethods<TItem> = {
  append(item: TItem): void;
  prepend(item: TItem): void;
  insert(index: number, item: TItem): void;
  replace(index: number, item: TItem): void;
  swap(indexA: number, indexB: number): void;
  remove(index: number): void;
};

export function createArrayMethods<TItem>(
  setValue: Setter<TItem[]>
): ArrayMethods<TItem> {
  function append(item: TItem) {
    setValue((p) => [...p, item]);
  }

  function prepend(item: TItem) {
    setValue((p) => [item, ...p]);
  }

  function insert(index: number, item: TItem) {
    setValue((p) => {
      const array = [...p];
      array.splice(index, 0, item);
      return array;
    });
  }

  function replace(index: number, item: TItem) {
    setValue((p) => {
      const array = [...p];
      array.splice(index, 1, item);
      return array;
    });
  }

  function remove(index: number) {
    setValue((p) => {
      const array = [...p];
      array.splice(index, 1);
      return array;
    });
  }

  function swap(indexA: number, indexB: number) {
    setValue((p) => {
      const array = [...p];
      const a = array[indexA];
      const b = array[indexB];
      array[indexA] = b;
      array[indexB] = a;
      return array;
    });
  }

  return {
    append,
    prepend,
    insert,
    replace,
    remove,
    swap,
  };
}
