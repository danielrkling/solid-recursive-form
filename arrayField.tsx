import {
  createSignal,
  createComputed,
  createMemo,
  Accessor,
  Setter,
  children,
  JSX,
  createEffect,
  Index,
  For,
  onMount,
  onCleanup
} from "solid-js";

import {
  Control,
  Fields,
  KeyOf,
  Validate,
  ValidateMethod,
  createControl,
  createFieldComponent,
  FieldProps,
  FieldApi,
  createField,
  createArrayMethods,
  ArrayMethods,
} from ".";

export type ArrayFieldProps<
  TParent,
  TKey extends keyof TParent = keyof TParent,
  //@ts-expect-error
  TItem extends any = TParent[TKey][number]
> =  {
  control: Control<TParent>;
  name: TKey;
  validate?: Validate<TItem[]>;
};

export type ArrayFieldApi<
  TParent,
  TKey extends keyof TParent = keyof TParent,
  //@ts-expect-error
  TItem extends any = TParent[TKey][number]
> = Control<TItem[]> & ArrayMethods<TItem> & {
  control: Control<TItem[]>;
  name: TKey;
  Fields: FieldsComponent<TItem>;
};

export type FieldsComponent<TItem> = (
    props: {
      validate?: Validate<TItem>;
      children: (field: FieldsApi<TItem>) => JSX.Element;
    }
  ) => JSX.Element;

export type FieldsApi<TItem> = Omit<FieldApi<TItem[],number>,'name'> & {
  index: number
}

export function createArrayField<
  TParent,
  TKey extends keyof TParent = keyof TParent,
  //@ts-expect-error
  TItem extends any = TParent[TKey][number]
>(props: ArrayFieldProps<TParent, TKey, TItem>): ArrayFieldApi<TParent, TKey, TItem> {
    const field = createField(props)
    const methods = createArrayMethods(field.setValue)

    const Fields: FieldsComponent<TItem> = (
        props: {
          validate?: Validate<TItem>
          children: (field: FieldsApi<TItem>) => JSX.Element;
        }
      )=>{
        return (
          <Index each={field.value()}>
            {(item, index) => {
              const value =  createMemo(() => field.value()[index])
                //@ts-expect-error
              const setValue: Setter<TItem> = (val: TItem) =>
                  field.setValue((prev: TItem[]) => {
                    const array = [...prev];
                    array.splice(
                      index,
                      1,
                      typeof val === "function" ? val(prev[index]) : val
                    );
                    return array;
                  })
              
      
              const control: Control<TItem> = createControl(
                value,
                setValue,
                field.isSubmitted,
                props.validate
              );
      
              onMount(()=>field.registerField(index, control))
              onCleanup(()=>field.unregisterField(index))

              // createEffect(()=>console.log(index, control.fields(), control.getFields()))
      
              return props.children?.({
                control,
                ...control,
                Field: createFieldComponent(control),
                index,
              });
            }}
          </Index>
        );
      }

    return {
        ...field,
        ...methods, 
        Fields
    }
}

export function ArrayField<
  TParent,
  TKey extends keyof TParent = keyof TParent,
  //@ts-expect-error
  TItem extends any = TParent[TKey][number]
>(
  props: ArrayFieldProps<TParent, TKey, TItem> & {
    children: (field: ArrayFieldApi<TParent, TKey, TItem>) => JSX.Element;
  }
): JSX.Element {
  return props.children?.(createArrayField<TParent, TKey, TItem>(props));
}
