import {
  createSignal,
  createComputed,
  createMemo,
  Accessor,
  Setter,
  children,
  JSX,
  batch,
  createEffect,
} from "solid-js";

import {
  createField,
  Control,
  Fields,
  FieldApi,
  Validate,
  ValidateMethod,
  FieldProps,
  createControl,
  FieldComponent,
  createFieldComponent,
} from ".";


export type FormProps<TValue extends object> = {
  initialValue: TValue;
  validate?: Validate<TValue>;
  method?: ValidateMethod;
};

export type FormApi<TValue extends object> = Control<TValue> & {
  control: Control<TValue>;
  Field: FieldComponent<TValue>;
  handleSubmit: (onSuccess?: (value: TValue) => any, onError?: (control: Control<TValue>)=>any) => void;
};

/** 
 * Creates a reactive recursive form object
 * ```ts
 * const {Field, handleSubmit} = createForm({
 *  initialValue: {firstName: "", lastName: ""}
 * })
 * ```
 */
export function createForm<TValue extends object>(
  props: FormProps<TValue>
): FormApi<TValue> {
  const [value, setValue] = createSignal(props.initialValue);
  const [isSubmitted, setIsSubmitted] = createSignal(false);

  const control = createControl(value,setValue, isSubmitted, props.validate);

  const handleSubmit = (onSuccess?: (value: TValue) => any,onError?: (control: Control<TValue>)=>any ) => {
    setIsSubmitted(true);
    if (control.isValid()){
      onSuccess?.(value());
    }else{
      control.focusError()
      onError?.(control)
    }
    
  };

  return {
    control,
    ...control,
    handleSubmit,
    Field: createFieldComponent(control),
  };
}

export function Form<TValue extends object>(
  props: FormProps<TValue> & {
    children: (field: FormApi<TValue>) => JSX.Element;
  }
): JSX.Element {
  return props.children?.(createForm<TValue>(props));
}
