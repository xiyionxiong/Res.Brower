import localforage from "localforage";

// 304c8b34-5e85-4174-ad4f-904c7a468135

// da244b2a-2c4b-45c6-90d2-4cd76e12fe6a

// a2696992-e8da-4526-b5bd-006ebc45d02a

// 7c7c488e-bbd1-4226-b565-01aacf008480

// 1641c62f-3b25-43c9-8347-bfe0a100f27f

// e13786c3-461d-4caa-bb02-1769660effef

export enum STORAGE_KEY {
  Project = "77ac308d-a2a5-4bcf-89a8-50d031eadeb8",
  Down = "7508d20d-1571-499c-8abd-3c8bac09070f",
  Left = "cde30fa5-16fb-4c21-8888-3a20a3fee875",
  Right = "a1a3fb9c-96cc-4bfe-87b9-13a9d2d46ef5",
}

class AppStorage implements LocalForageDbMethodsCore {
  getItem<T>(
    key: string,
    callback?: ((err: any, value: T | null) => void) | undefined
  ): Promise<T | null> {
    return this.app.getItem(key, callback);
  }
  setItem<T>(
    key: string,
    value: T,
    callback?: ((err: any, value: T) => void) | undefined
  ): Promise<T> {
    return this.app.setItem(key, value, callback);
  }
  removeItem(
    key: string,
    callback?: ((err: any) => void) | undefined
  ): Promise<void> {
    return this.app.removeItem(key, callback);
  }
  clear(callback?: ((err: any) => void) | undefined): Promise<void> {
    return this.app.clear(callback);
  }
  length(
    callback?: ((err: any, numberOfKeys: number) => void) | undefined
  ): Promise<number> {
    return this.app.length(callback);
  }
  key(
    keyIndex: number,
    callback?: ((err: any, key: string) => void) | undefined
  ): Promise<string> {
    return this.app.key(keyIndex, callback);
  }
  keys(
    callback?: ((err: any, keys: string[]) => void) | undefined
  ): Promise<string[]> {
    return this.app.keys(callback);
  }
  iterate<T, U>(
    iteratee: (value: T, key: string, iterationNumber: number) => U,
    callback?: ((err: any, result: U) => void) | undefined
  ): Promise<U> {
    return this.app.iterate(iteratee, callback);
  }
  private app = localforage.createInstance({
    name: "app-config",
  });

  async push<T>(
    key: string,
    value: T[],
    unique = false,
    callback?: ((err: any, value: Array<T>) => void) | undefined
  ) {
    const values = (await this.getItem<Array<T>>(key)) ?? [];
    return this.app.setItem<Array<T>>(key, [...values, ...value], callback);
  }

  async pop<T>(
    key: string,
    valueKey: T,
    uniqueKey: string,
    callback?: ((err: any, value: Array<T>) => void) | undefined
  ) {
    const values = (await this.getItem<Array<T>>(key)) ?? [];
    // return this.app.setItem<Array<T>>(key, [...values, ...value], callback);
  }
}

const storage = new AppStorage();

export default storage;
