import {
  createSignal,
  createComputed,
  createMemo,
  Accessor,
  Setter,
  children,
  JSX,
  createEffect,
  onMount,
  onCleanup,
} from "solid-js";

import {
  Control,
  Fields,
  KeyOf,
  Validate,
  ValidateMethod,
  createControl,
  createArrayMethods,
  ArrayMethods,

} from "./";

export type FieldProps<
  TParent,
  TKey extends keyof TParent = keyof TParent,
  TValue extends any = TParent[TKey]
> = {
  control: Control<TParent>;
  name: TKey;
  validate?: Validate<TValue>;
};

export type FieldApi<
  TParent,
  TKey extends keyof TParent = keyof TParent,
  TValue extends any = TParent[TKey]
> = Control<TValue> & {
  control: Control<TValue>;
  name: TKey;
  Field: FieldComponent<TValue>;
};

export function createField<
  TParent,
  TKey extends keyof TParent = keyof TParent,
  TValue extends any = TParent[TKey]
>(props: FieldProps<TParent, TKey, TValue>): FieldApi<TParent, TKey, TValue> {
  const value = createMemo(() => props.control.value()[props.name] as TValue);
  //@ts-expect-error
  const setValue: Setter<TValue> = (value: TValue) =>
    props.control.setValue((prev: TParent) => {
      const newValue: TValue =
        typeof value === "function" ? value(prev[props.name]) : value;
      if (Array.isArray(prev)) {
        const array = [...prev];
        array.splice(Number(props.name), 1, newValue);
        return array as TParent;
      } else {
        return {
          ...prev,
          [props.name]: newValue,
        };
      }
    });

  const control = createControl(
    value,
    setValue,
    props.control.isSubmitted,
    props.validate
  );

  onMount(() =>
    props.control.registerField(props.name, control as Control<TParent[TKey]>)
  );
  onCleanup(() => props.control.unregisterField(props.name));

  // createEffect(()=>console.log(props.name, control.fields(), control.getFields()))

  return {
    control,
    ...control,
    name: props.name,
    Field: createFieldComponent(control),
  };
}

export function Field<
  TParent,
  TKey extends keyof TParent = keyof TParent,
  TValue extends any = TParent[TKey]
>(
  props: FieldProps<TParent, TKey, TValue> & {
    children: (field: FieldApi<TParent, TKey, TValue>) => JSX.Element;
  }
): JSX.Element {
  return props.children?.(createField<TParent, TKey, TValue>(props));
}

export type FieldComponent<TValue> = <
  TChildKey extends keyof TValue,
  TChildValue extends unknown = TValue[TChildKey]
>(
  props: Omit<FieldProps<TValue, TChildKey, TChildValue>, "control"> & {
    children: (field: FieldApi<TValue, TChildKey, TChildValue>) => JSX.Element;
  }
) => JSX.Element;

export function createFieldComponent<TValue>(
  control: Control<TValue>
): FieldComponent<TValue> {
  return <
    TChildKey extends keyof TValue,
    TChildValue extends any = TValue[TChildKey]
  >(
    props: Omit<FieldProps<TValue, TChildKey, TChildValue>, "control"> & {
      children: (
        field: FieldApi<TValue, TChildKey, TChildValue>
      ) => JSX.Element;
    }
  ) =>
    props.children?.(
      createField<TValue, TChildKey, TChildValue>({
        ...props,
        control,
      })
    );
}
