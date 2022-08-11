export type Nullable<T> = T | null | undefined;
export type Overwrite<T, U> = Omit<T, keyof U> & U;
