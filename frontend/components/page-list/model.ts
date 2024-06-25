import { PageListEntityType, PageStatus } from '~/constants';
import { IDocument } from '~/components/document/model';

export type PageListHeader = {
    id: string;
    type: PageListEntityType;
    count: number;
    editing: boolean;
};
export type PageListSectionHeader = {
    id: string;
    type: PageListEntityType;
    isSelectable: boolean;
    groupId: PageStatus | string | null;
    name: string;
    collapsed: boolean;
    count: number;
};
export type PageListPage = {
    id: string;
    type: PageListEntityType;
    order: number;
    isSelectable: boolean;
    groupId: PageStatus | string | null;
    page: IDocument;
};
export type PageListTask = {
    id: string;
    type: PageListEntityType;
    isSelectable: boolean;
};
export type PageListPageAdder = {
    id: string;
    type: PageListEntityType;
    order: number;
    isSelectable: boolean;
    groupId: PageStatus | string | null;
};
