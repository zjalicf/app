import transform from 'lodash/transform';
import isEqual from 'lodash/isEqual';
import isObject from 'lodash/isObject';

export const getMods = (
    newObj: Record<string, any>,
    origObj: Record<string, any>,
) => {
    function changes(
        newObj: Record<string, any>,
        origObj: Record<string, any>,
    ) {
        return transform(
            newObj,
            (result: Record<string, any>, value: any, key: string) => {
                if (!isEqual(value, origObj[key])) {
                    const resultKey = key;
                    result[resultKey] =
                        isObject(value) &&
                        isObject(origObj[key]) &&
                        !Array.isArray(value)
                            ? changes(value, origObj[key])
                            : value;
                }
            },
        );
    }
    return changes(newObj, origObj);
};
