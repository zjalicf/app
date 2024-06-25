type DiffItem = {
    count: number;
    value: string;
    added?: boolean;
    removed?: boolean;
};
class Difference {
    options: any;

    diffHtml(oldHtml: string, newHtml: string) {
        const htmlDiff = this.diff(oldHtml, newHtml);
        if (!htmlDiff) return oldHtml;
        return this.constructDiffHtml(htmlDiff);
    }

    diff(previousVersion: string, newVersion: string, options: any = {}) {
        this.options = options;

        const oldString = this.removeEmpty(this.tokenize(previousVersion));
        const newString = this.removeEmpty(this.tokenize(newVersion));

        const newLen = newString.length;
        const oldLen = oldString.length;
        let editLength = 1;
        let maxEditLength = newLen + oldLen;
        if (options.maxEditLength) {
            maxEditLength = Math.min(maxEditLength, options.maxEditLength);
        }

        const bestPath: any[] = [{ newPos: -1, lastComponent: undefined }];

        // Seed editLength = 0, i.e. the content starts with the same values
        const oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);
        if (bestPath[0].newPos + 1 >= newLen && oldPos + 1 >= oldLen) {
            // Identity per the equality and tokenizer
            return [{ value: this.join(newString), count: newString.length }];
        }

        // Main worker method. checks all permutations of a given edit length for acceptance.
        const execEditLength = () => {
            for (
                let diagonalPath = -1 * editLength;
                diagonalPath <= editLength;
                diagonalPath += 2
            ) {
                let basePath;
                const addPath = bestPath[diagonalPath - 1];
                const removePath = bestPath[diagonalPath + 1];
                let oldPos =
                    (removePath ? removePath.newPos : 0) - diagonalPath;
                if (addPath) {
                    // No one else is going to attempt to use this value, clear it
                    bestPath[diagonalPath - 1] = undefined;
                }

                const canAdd = addPath && addPath.newPos + 1 < newLen;
                const canRemove = removePath && oldPos >= 0 && oldPos < oldLen;
                if (!canAdd && !canRemove) {
                    // If this path is a terminal then prune
                    bestPath[diagonalPath] = undefined;
                    continue;
                }

                // Select the diagonal that we want to branch from. We select the prior
                // path whose position in the new string is the farthest from the origin
                // and does not pass the bounds of the diff graph
                if (
                    !canAdd ||
                    (canRemove && addPath.newPos < removePath.newPos)
                ) {
                    basePath = this.addToPath(removePath, undefined, true, 0);
                } else {
                    basePath = this.addToPath(addPath, true, undefined, 1);
                }

                oldPos = this.extractCommon(
                    basePath,
                    newString,
                    oldString,
                    diagonalPath,
                );

                // If we have hit the end of both strings, then we are done
                if (basePath.newPos + 1 >= newLen && oldPos + 1 >= oldLen) {
                    return this.buildValues(
                        basePath.lastComponent,
                        newString,
                        oldString,
                    );
                } else {
                    // Otherwise track this path as a potential candidate and continue.
                    bestPath[diagonalPath] = basePath;
                }
            }

            editLength++;
        };

        // Performs the length of edit iteration. Is a bit fugly as this has to support the
        // sync and async mode which is never fun. Loops over execEditLength until a value
        // is produced, or until the edit length exceeds options.maxEditLength (if given),
        // in which case it will return undefined.

        // eslint-disable-next-line no-unmodified-loop-condition
        while (editLength <= maxEditLength) {
            const ret = execEditLength();
            if (ret) {
                return ret;
            }
        }
    }

    addToPath(
        path: any,
        added: boolean | undefined,
        removed: boolean | undefined,
        newPosInc: number,
    ) {
        const last = path.lastComponent;
        if (last && last.added === added && last.removed === removed) {
            return {
                newPos: path.newPos + newPosInc,
                lastComponent: {
                    count: last.count + 1,
                    added,
                    removed,
                    previousComponent: last.previousComponent,
                },
            };
        } else {
            return {
                newPos: path.newPos + newPosInc,
                lastComponent: {
                    count: 1,
                    added,
                    removed,
                    previousComponent: last,
                },
            };
        }
    }

    extractCommon(
        basePath: any,
        newString: any[],
        oldString: any[],
        diagonalPath: number,
    ) {
        const newLen = newString.length;
        const oldLen = oldString.length;
        let newPos = basePath.newPos;
        let oldPos = newPos - diagonalPath;

        let commonCount = 0;
        while (
            newPos + 1 < newLen &&
            oldPos + 1 < oldLen &&
            this.equals(newString[newPos + 1], oldString[oldPos + 1])
        ) {
            newPos++;
            oldPos++;
            commonCount++;
        }

        if (commonCount) {
            basePath.lastComponent = {
                count: commonCount,
                previousComponent: basePath.lastComponent,
            };
        }

        basePath.newPos = newPos;
        return oldPos;
    }

    constructDiffHtml(htmlDiff: DiffItem[]): string {
        const output = [];
        for (const item of htmlDiff) {
            if (!item.added && !item.removed) {
                output.push(item.value);
                continue;
            }
            const diffTags = this.applyDiffTags(item);
            output.push(diffTags);
        }
        return output.flat().join('');
    }

    applyDiffTags(item: DiffItem): string[] {
        const output = [];
        let rest: string | undefined = item.value;
        let wrappable = '';
        let tag = '';
        do {
            [wrappable, rest] = this.split(rest, '<');
            if (rest.length) {
                rest = '<' + rest;
            }
            if (wrappable.length) {
                output.push(
                    `<span data-type="diff" class="diff--${
                        item.added ? 'added' : 'removed'
                    }">${wrappable}</span>`,
                );
            }
            [tag, rest] = this.split(rest, '>');
            if (tag.length) {
                tag += '>';
                output.push(tag);
            }
        } while (rest);
        return output;
    }

    buildValues(lastComponent: any, newString: any[], oldString: any[]) {
        // First we convert our linked list of components in reverse order to an
        // array in the right order:
        const components = [];
        let nextComponent;
        while (lastComponent) {
            components.push(lastComponent);
            nextComponent = lastComponent.previousComponent;
            delete lastComponent.previousComponent;
            lastComponent = nextComponent;
        }
        components.reverse();

        let componentPos = 0;
        const componentLen = components.length;
        let newPos = 0;
        let oldPos = 0;

        for (; componentPos < componentLen; componentPos++) {
            const component = components[componentPos];
            if (!component.removed) {
                component.value = this.join(
                    newString.slice(newPos, newPos + component.count),
                );
                newPos += component.count;

                // Common case
                if (!component.added) {
                    oldPos += component.count;
                }
            } else {
                component.value = this.join(
                    oldString.slice(oldPos, oldPos + component.count),
                );
                oldPos += component.count;

                // Reverse add and remove so removes are output first to match common convention
                // The diffing algorithm is tied to add then remove output and this is the simplest
                // route to get the desired output with minimal overhead.
                if (componentPos && components[componentPos - 1].added) {
                    const tmp: any = components[componentPos - 1];
                    components[componentPos - 1] = components[componentPos];
                    components[componentPos] = tmp;
                }
            }
        }

        // Special case handle for when one terminal is ignored (i.e. whitespace).
        // For this case we merge the terminal into the prior string and drop the change.
        // This is only available for string mode.
        const finalComponent = components[componentLen - 1];
        if (
            componentLen > 1 &&
            typeof finalComponent.value === 'string' &&
            (finalComponent.added || finalComponent.removed) &&
            this.equals('', finalComponent.value)
        ) {
            components[componentLen - 2].value += finalComponent.value;
            components.pop();
        }

        return components;
    }

    split(text: string, sep: string): string[] {
        const index = text.indexOf(sep);
        if (index === -1) {
            return [text, ''];
        }
        return [text.slice(0, index), text.slice(index + 1)];
    }

    equals(left: any, right: any) {
        if (this.options.comparator) {
            return this.options.comparator(left, right);
        } else {
            return (
                left === right ||
                (this.options.ignoreCase &&
                    left.toLowerCase() === right.toLowerCase())
            );
        }
    }

    removeEmpty(array: any[]): any[] {
        const ret = [];
        for (let i = 0; i < array.length; i++) {
            if (array[i]) {
                ret.push(array[i]);
            }
        }
        return ret;
    }

    castInput(value: any) {
        return value;
    }

    tokenize(value: any) {
        return value.split('');
    }

    join(chars: any) {
        return chars.join('');
    }
}

export const Diff = new Difference();
