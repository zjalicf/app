interface AppState {
    documents: any[];
}

export const state: () => AppState = () => ({
    documents: [],
});

export const getters = {
    byId: (state: AppState) => (_id: string) => {
        const document = state.documents.find(({ id }) => id === _id);
        return document;
    },
};

export const mutations = {
    addDocuments: (state: AppState, documents: any[]) => {
        state.documents = documents.map(doc => ({ ...doc }));
    },
};
