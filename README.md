# solid-recursive-form
Form helper for solid js. Uses recursive render props for nested fields and arrays. 
## Features
- Recursive typing for deeply nested fields and arrays
- Easy typing for custom components
- Optional ArrayField component
- Validation at each recrusive level
- 
## Example
```tsx
function Example() {
  const { Field, handleSubmit, control, error } = createForm({
    initialValue: {
      firstName: "",
      lastName: "",
      age: 0,
      address: {
        street: "",
        city: "",
      },
    },
  });

  return (
    <form>
      <TextField control={control} name={"firstName"} />
      <Field name="lastName">
        {({ value, setValue, ref }) => (
          <>
            <input
              type="number"
              value={value()}
              oninput={(e) => setValue(e.target.value)}
              ref={ref}
            ></input>
          </>
        )}
      </Field>
      <Field name="address">
        {({ Field, control }) => (
          <>
            <TextField control={control} name={"street"} />
            <TextField control={control} name={"city"} />
          </>
        )}
      </Field>
      <Field name="age">
        {({ value, setValue, ref }) => (
          <>
            <input
              type="number"
              value={value()}
              oninput={(e) => setValue((p) => e.target.valueAsNumber ?? p)}
              ref={ref}
            ></input>
          </>
        )}
      </Field>

      <button
        type="button"
        onClick={(e) =>
          handleSubmit(console.log, (c) => console.error(c.errorList()))
        }
      >
        Submit
      </button>
    </form>
  );
}
```

## Resuable Components
```tsx
function TextField<T>(props: FieldProps<T, keyof T, string>) {
  const { value, setValue, isSubmitted, isValid, isInvalid, error, ref } =
    createField(props);

  return (
    <>
      <input
        classList={{
          "error": isSubmitted() && isInvalid(),
          "success": isSubmitted() && isValid(),
        }}
        value={value()}
        oninput={(e) => setValue(e.target.value)}
        ref={ref}
      ></input>
    </>
  );
}
```


## Array Fields
the ArrayField component allows
```tsx
function ArrayFieldExample() {
  const { Field, handleSubmit, control, error } = createForm({
    initialValue: {
      fruits: ["apple", "banana"],
    },
  });

  return (
    <form>
      <ArrayField control={control} name={"fruits"}>
        {({ Fields, append }) => (
          <>
            <Fields>
              {({ value, setValue, ref }) => (
                <>
                  <>
                    <input
                      value={value()}
                      oninput={(e) => setValue(e.target.value)}
                      ref={ref}
                    ></input>
                  </>
                </>
              )}
            </Fields>
            <button
              type="button"
              onClick={(e) =>
                handleSubmit(console.log, (c) => console.error(c.errorList()))
              }
            >
              Add New Fruit
            </button>
          </>
        )}
      </ArrayField>

      <button
        type="button"
        onClick={(e) =>
          handleSubmit(console.log, (c) => console.error(c.errorList()))
        }
      >
        Submit
      </button>
    </form>
  );
}
```
