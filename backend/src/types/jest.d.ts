import '@types/jest';

declare global {
    namespace jest {
        interface Matchers<R> {
            toHaveBeenCalledWithMatch(...args: any[]): R;
        }
    }
}
