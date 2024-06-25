type WithID<T> = T & { id: string };
type Fragment<T> = Record<string, Record<string, Record<string, WithID<T>>>>;

export class EntityFragments<T> {
    private fragments: Fragment<WithID<T>> = {};

    find(id: string): Record<string, WithID<T>> | null {
        const first = id.slice(0, 2);
        const second = id.slice(2, 4);
        if (!this.fragments[first]) return null;
        if (!this.fragments[first][second]) return null;
        return this.fragments[first][second];
    }

    clear() {
        this.fragments = {};
    }

    save(entity: WithID<T>) {
        const id = entity.id;
        const first = id.slice(0, 2);
        const second = id.slice(2, 4);
        if (!this.fragments[first]) {
            this.fragments[first] = {};
        }
        if (!this.fragments[first][second]) {
            this.fragments[first][second] = {};
        }

        this.fragments[first][second][entity.id] = entity;
    }

    delete(id: string) {
        const fragment = this.find(id);
        if (!fragment || !fragment[id]) return;
        delete fragment[id];
    }

    collectToArray(): T[] {
        const firstLayer = Object.values(this.fragments);
        const secondLayer = firstLayer.reduce(
            (acc, layer) => [...acc, ...Object.values(layer)],
            [] as Record<string, T>[],
        );
        return secondLayer.reduce(
            (acc, layer) => [...acc, ...Object.values(layer)],
            [] as T[],
        );
    }
}
