export function isFunction(val: any): val is Record<any, any> {
    return typeof val === 'function';
}
export function isString(val: any): val is Record<any, any> {
    return typeof val === 'string';
}
export function getType(val: any) {
    return Object.prototype.toString.call(val).slice(8, -1);
}
export function isObject(val: any): val is Record<any, any> {
    return getType(val) === 'Object';
}
