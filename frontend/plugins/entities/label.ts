import { EntityController } from '~/plugins/entities/controller';
import { ILabel } from '~/@types';
import { labelRegexp, negativeLabelRegexpBase } from '~/constants/regexp';
import { TrackingAction, TrackingType } from '~/@types/tracking';

export const getLabelName = (label: string) => {
    return '#' + label.replace('#', '');
};

export const normalize = (label: string) => {
    // trim spaces
    const trimmedLabel = label.trim();

    // replace inner spaces with dashes
    const removedWhiteSpace = trimmedLabel.replace(/\s+/g, '-');

    // remove special characters
    const withoutSpecialCharacters = removedWhiteSpace.replace(
        negativeLabelRegexpBase,
        '',
    );

    // remove leading and trailing dashes
    return withoutSpecialCharacters.replace(/^-+|-+$/g, '');
};

export const labelsFromText = (text: string): ILabel[] => {
    if (!text) return [];

    const codeTags: { open: number; close: number; type: string }[] = [];
    const matches = text.matchAll(/<code>|<\/code>|```/g);
    if (matches) {
        for (const match of matches) {
            const tag = match[0];
            if (tag === '<code>') {
                codeTags.push({
                    open: match.index!,
                    close: match.index!,
                    type: tag,
                });
            }
            if (tag === '</code>') {
                if (codeTags.length === 0 || !codeTags[codeTags.length - 1])
                    continue;
                codeTags[codeTags.length - 1].close = match.index!;
            }
            if (tag === '```') {
                if (!codeTags.length) {
                    codeTags.push({
                        open: match.index!,
                        close: match.index!,
                        type: tag,
                    });
                    continue;
                }
                const lastTag = codeTags[codeTags.length - 1];
                if (
                    lastTag &&
                    lastTag.open === lastTag.close &&
                    lastTag.type === '```'
                ) {
                    lastTag.close = match.index!;
                    continue;
                }
                codeTags.push({
                    open: match.index!,
                    close: match.index!,
                    type: tag,
                });
            }
        }
    }

    const clearText = text.replaceAll(
        labelRegexp,
        (fullMatch: string, _match: string, index: number) => {
            const isInCode = codeTags.some(
                tag => tag.open < index && tag.close > index,
            );
            if (!isInCode) return fullMatch;

            return fullMatch.replace(labelRegexp, '');
        },
    );

    const search = clearText.matchAll(labelRegexp);
    const labelsMatch = [...search].map(match => match[1]);
    return [...new Set<string>(labelsMatch)];
};

export class LabelController extends EntityController<ILabel> {
    protected storeEntity: string = 'label';
    protected dbTable: string = 'labels';

    updateEntityBatch(toProcess: any[], type: string) {
        const addLabels: { id: string; labels: string[] }[] = [];
        const removeLabels: { id: string; labels: string[] }[] = [];

        toProcess.forEach(({ id, oldLabels, newLabels }) => {
            const { toAdd, toRemove } = this.computeDiff(oldLabels, newLabels);
            if (toAdd.length) {
                addLabels.push({ id, labels: toAdd });
            }
            if (toRemove.length) {
                removeLabels.push({ id, labels: toRemove });
            }
        });

        if (addLabels.length) {
            this.addLabelsBatch(addLabels, type);
        }
        if (removeLabels.length) {
            this.removeLabelsBatch(removeLabels, type);
        }
    }

    updateEntity(
        id: string,
        oldLabels: string[],
        newLabels: string[],
        type: 'tasks' | 'pages',
    ) {
        const { toAdd, toRemove } = this.computeDiff(oldLabels, newLabels);
        if (toAdd.length) {
            this.addLabels(id, toAdd, type);
        }
        if (toRemove.length) {
            this.removeLabels(id, toRemove, type);
        }
    }

    addLabels(id: string, labels: string[], type: string) {
        if (!labels.length) return;
        return this.context.store.dispatch('label/updateLabelsMap', {
            id,
            labels,
            type,
        });
    }

    addLabelsBatch(
        toProcess: { id: string; labels: string[] }[],
        type: string,
    ) {
        this.context.store.dispatch('label/updateLabelsMapBatch', {
            toProcess,
            type,
        });
    }

    removeLabels(id: string, labels: string[], type: string) {
        if (!labels.length) return;
        return this.context.store.dispatch('label/removeLabelsMap', {
            id,
            labels,
            type,
        });
    }

    removeLabelsBatch(
        toProcess: { id: string; labels: string[] }[],
        type: string,
    ) {
        this.context.store.dispatch('label/removeLabelsMapBatch', {
            toProcess,
            type,
        });
    }

    computeDiff(
        oldLabels: string[],
        newLabels: string[],
    ): {
        toAdd: string[];
        toRemove: string[];
    } {
        const toAdd = newLabels.filter(e => !oldLabels.includes(e));
        const toRemove = oldLabels.filter(e => !newLabels.includes(e));
        return {
            toAdd,
            toRemove,
        };
    }

    updateLabelsMap(id: string, labels: string[], type: string) {
        return this.context.store.dispatch('label/updateLabelsMap', {
            id,
            labels,
            type,
        });
    }

    exists(name: string) {
        return this.context.store.getters['label/exists'](getLabelName(name));
    }

    async delete(label: string) {
        this.merge(label, null);
    }

    normalize(label: string) {
        return normalize(label);
    }

    merge(from: ILabel, to: ILabel | null) {
        const currentLabelsMap = this.context.store.getters['label/labelsMap'];
        const pagesToUpdate = currentLabelsMap[from]?.pages ?? [];

        if (to) {
            this.context.$tracking.trackEventV2(TrackingType.SETTINGS, {
                action: TrackingAction.RENAME_LABEL,
            });
        } else {
            this.context.$tracking.trackEventV2(TrackingType.SETTINGS, {
                action: TrackingAction.DELETE_LABEL,
            });
        }

        [...pagesToUpdate].forEach((page: string) => {
            const fullPage = this.context.$entities.page.byId(page);
            if (!fullPage) return;
            this.context.$entities.page.updateLabel(page, from, to);
        });
    }
}
