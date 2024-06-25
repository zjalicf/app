import { describe, it } from 'vitest';
import { ICreateChange, IUpdateChange } from 'dexie-observable/api';
import { AcreomProtocol } from '~/workers/database/protocol/protocol';
import { ProtocolReporter } from '~/workers/database/reporter/protocol';
import { IDocument } from '~/components/document/model';

describe('protocol', () => {
    const context = {} as any;
    const reporter = new ProtocolReporter(context, 'vault-id');
    const vault = {
        id: 'vault-id',
    };
    const services: any[] = [];

    it('should add no daily docs', ({ expect }) => {
        const protocol = new AcreomProtocol(
            context,
            vault.id,
            services,
            reporter,
            reporter,
        );

        const existingDailyDocs: IDocument[] = [];
        const remoteDailyDocChanges: ICreateChange[] = [];

        const { applicableRemoteChanges, applicableLocalChanges } =
            protocol.mergeDailyDocs(existingDailyDocs, remoteDailyDocChanges);

        expect(applicableRemoteChanges).toEqual([]);
        expect(applicableLocalChanges).toEqual([]);
    });

    it('should add new daily doc', ({ expect }) => {
        const protocol = new AcreomProtocol(
            context,
            vault.id,
            services,
            reporter,
            reporter,
        );

        const existingDailyDocs: IDocument[] = [];
        const remoteDailyDocChanges: ICreateChange[] = [
            {
                type: 1,
                table: 'documents',
                key: 'doc1',
                obj: {
                    id: 'doc1',
                    dailyDoc: 'daily-doc-1',
                    content: 'content-1',
                },
            },
        ];

        const { applicableRemoteChanges, applicableLocalChanges } =
            protocol.mergeDailyDocs(existingDailyDocs, remoteDailyDocChanges);

        expect(applicableRemoteChanges).toEqual([
            {
                type: 1,
                table: 'documents',
                key: 'doc1',
                obj: {
                    id: 'doc1',
                    dailyDoc: 'daily-doc-1',
                    content: 'content-1',
                    updatedAt: (applicableRemoteChanges[0] as ICreateChange)!
                        .obj.updatedAt,
                },
                source: 'sync',
            },
        ]);
        expect(applicableLocalChanges).toEqual([]);
    });

    it('should merge two daily docs - incoming is oldest', ({ expect }) => {
        const protocol = new AcreomProtocol(
            context,
            vault.id,
            services,
            reporter,
            reporter,
        );

        const existingDailyDocs: IDocument[] = [
            {
                id: 'doc2',
                dailyDoc: 'daily-doc-1',
                content: 'content-2',
                createdAt: new Date(2023, 10, 11),
            } as any,
        ];
        const remoteDailyDocChanges: ICreateChange[] = [
            {
                type: 1,
                table: 'documents',
                key: 'doc1',
                obj: {
                    id: 'doc1',
                    dailyDoc: 'daily-doc-1',
                    content: 'content-1',
                    createdAt: new Date(2023, 10, 10),
                },
            },
        ];

        const { applicableRemoteChanges, applicableLocalChanges } =
            protocol.mergeDailyDocs(existingDailyDocs, remoteDailyDocChanges);

        expect(applicableRemoteChanges).toEqual([
            {
                type: 1,
                table: 'documents',
                key: 'doc1',
                obj: {
                    id: 'doc1',
                    dailyDoc: 'daily-doc-1',
                    content: 'content-1content-2',
                    createdAt: new Date(2023, 10, 10),
                    updatedAt: (applicableRemoteChanges[0] as ICreateChange)!
                        .obj.updatedAt,
                },
                source: '*',
            },
            {
                type: 3,
                table: 'documents',
                key: 'doc2',
                source: '*',
            },
        ]);
        expect(applicableLocalChanges).toEqual([
            {
                type: 1,
                table: 'documents',
                key: 'doc1',
                obj: {
                    id: 'doc1',
                    dailyDoc: 'daily-doc-1',
                    content: 'content-1content-2',
                    createdAt: new Date(2023, 10, 10),
                    updatedAt: (applicableLocalChanges[0] as ICreateChange)!.obj
                        .updatedAt,
                },
                source: '*',
            },
            {
                type: 3,
                table: 'documents',
                key: 'doc2',
                source: '*',
            },
        ]);
    });

    it('should not merge the same doc content, incoming is newer', ({
        expect,
    }) => {
        const protocol = new AcreomProtocol(
            context,
            vault.id,
            services,
            reporter,
            reporter,
        );
        const existingDailyDocs: IDocument[] = [
            {
                id: 'doc2',
                dailyDoc: 'daily-doc-1',
                content: 'content-2',
                createdAt: new Date(2023, 10, 11),
                updatedAt: new Date(2023, 10, 11),
            } as any,
        ];
        const remoteDailyDocChanges: ICreateChange[] = [
            {
                type: 2,
                table: 'documents',
                key: 'doc2',
                obj: {
                    id: 'doc2',
                    dailyDoc: 'daily-doc-1',
                    content: 'content-1',
                    createdAt: new Date(2023, 10, 11),
                    updatedAt: new Date(2023, 10, 12),
                },
            },
        ];

        const { applicableRemoteChanges, applicableLocalChanges } =
            protocol.mergeDailyDocs(existingDailyDocs, remoteDailyDocChanges);

        expect(applicableRemoteChanges).toEqual([
            {
                type: 2,
                table: 'documents',
                key: 'doc2',
                mods: {
                    id: 'doc2',
                    dailyDoc: 'daily-doc-1',
                    content: 'content-1',
                    createdAt: new Date(2023, 10, 11),
                    updatedAt: (applicableRemoteChanges[0] as IUpdateChange)!
                        .mods.updatedAt,
                },
                source: '*',
            },
        ]);
        expect(applicableLocalChanges).toEqual([
            {
                type: 1,
                table: 'documents',
                key: 'doc2',
                obj: {
                    id: 'doc2',
                    dailyDoc: 'daily-doc-1',
                    content: 'content-1',
                    createdAt: new Date(2023, 10, 11),
                    updatedAt: (applicableLocalChanges[0] as ICreateChange).obj
                        .updatedAt,
                },
                source: '*',
            },
        ]);
    });

    it('should not merge the same doc content, incoming is older', ({
        expect,
    }) => {
        const protocol = new AcreomProtocol(
            context,
            vault.id,
            services,
            reporter,
            reporter,
        );
        const existingDailyDocs: IDocument[] = [
            {
                id: 'doc2',
                dailyDoc: 'daily-doc-1',
                content: 'content-2',
                createdAt: new Date(2023, 10, 11),
                updatedAt: new Date(2023, 10, 12),
            } as any,
        ];
        const remoteDailyDocChanges: ICreateChange[] = [
            {
                type: 2,
                table: 'documents',
                key: 'doc2',
                obj: {
                    id: 'doc2',
                    dailyDoc: 'daily-doc-1',
                    content: 'content-1',
                    createdAt: new Date(2023, 10, 11),
                    updatedAt: new Date(2023, 10, 11),
                },
            },
        ];

        const { applicableRemoteChanges, applicableLocalChanges } =
            protocol.mergeDailyDocs(existingDailyDocs, remoteDailyDocChanges);

        expect(applicableRemoteChanges).toEqual([
            {
                type: 2,
                table: 'documents',
                key: 'doc2',
                mods: {
                    id: 'doc2',
                    dailyDoc: 'daily-doc-1',
                    content: 'content-2',
                    createdAt: new Date(2023, 10, 11),
                    updatedAt: (applicableRemoteChanges[0] as IUpdateChange)!
                        .mods.updatedAt,
                },
                source: '*',
            },
        ]);
        expect(applicableLocalChanges).toEqual([
            {
                type: 1,
                table: 'documents',
                key: 'doc2',
                obj: {
                    id: 'doc2',
                    dailyDoc: 'daily-doc-1',
                    content: 'content-2',
                    createdAt: new Date(2023, 10, 11),
                    updatedAt: (applicableLocalChanges[0] as ICreateChange)!.obj
                        .updatedAt,
                },
                source: '*',
            },
        ]);
    });

    it('should merge two daily docs - existing is oldest', ({ expect }) => {
        const protocol = new AcreomProtocol(
            context,
            vault.id,
            services,
            reporter,
            reporter,
        );

        const existingDailyDocs: IDocument[] = [
            {
                id: 'doc2',
                dailyDoc: 'daily-doc-1',
                content: 'content-2',
                createdAt: new Date(2023, 10, 11),
            } as any,
        ];
        const remoteDailyDocChanges: ICreateChange[] = [
            {
                type: 1,
                table: 'documents',
                key: 'doc1',
                obj: {
                    id: 'doc1',
                    dailyDoc: 'daily-doc-1',
                    content: 'content-1',
                    createdAt: new Date(2023, 10, 12),
                },
            },
        ];

        const { applicableRemoteChanges, applicableLocalChanges } =
            protocol.mergeDailyDocs(existingDailyDocs, remoteDailyDocChanges);

        expect(applicableRemoteChanges).toEqual([
            {
                type: 2,
                table: 'documents',
                key: 'doc2',
                mods: {
                    id: 'doc2',
                    dailyDoc: 'daily-doc-1',
                    content: 'content-2content-1',
                    createdAt: new Date(2023, 10, 11),
                    updatedAt: (applicableRemoteChanges[0] as IUpdateChange)!
                        .mods.updatedAt,
                },
                source: '*',
            },
            {
                type: 3,
                table: 'documents',
                key: 'doc1',
                source: '*',
            },
        ]);
        expect(applicableLocalChanges).toEqual([
            {
                type: 1,
                table: 'documents',
                key: 'doc2',
                obj: {
                    id: 'doc2',
                    dailyDoc: 'daily-doc-1',
                    content: 'content-2content-1',
                    createdAt: new Date(2023, 10, 11),
                    updatedAt: (applicableLocalChanges[0] as ICreateChange)!.obj
                        .updatedAt,
                },
                source: '*',
            },
            {
                type: 3,
                table: 'documents',
                key: 'doc1',
                source: '*',
            },
        ]);
    });

    it('should merge multiple daily docs - existing is oldest', ({
        expect,
    }) => {
        const protocol = new AcreomProtocol(
            context,
            vault.id,
            services,
            reporter,
            reporter,
        );

        const existingDailyDocs: IDocument[] = [
            {
                id: 'doc2',
                dailyDoc: 'daily-doc-1',
                content: 'content-2',
                createdAt: new Date(2023, 10, 11),
            } as any,
        ];
        const remoteDailyDocChanges: ICreateChange[] = [
            {
                type: 1,
                table: 'documents',
                key: 'doc1',
                obj: {
                    id: 'doc1',
                    dailyDoc: 'daily-doc-1',
                    content: 'content-1',
                    createdAt: new Date(2023, 10, 12),
                },
            },
            {
                type: 1,
                table: 'documents',
                key: 'doc3',
                obj: {
                    id: 'doc3',
                    dailyDoc: 'daily-doc-1',
                    content: 'content-3',
                    createdAt: new Date(2023, 10, 13),
                },
            },
        ];

        const { applicableRemoteChanges, applicableLocalChanges } =
            protocol.mergeDailyDocs(existingDailyDocs, remoteDailyDocChanges);

        expect(applicableRemoteChanges).toEqual([
            {
                type: 2,
                table: 'documents',
                key: 'doc2',
                mods: {
                    id: 'doc2',
                    dailyDoc: 'daily-doc-1',
                    content: 'content-2content-1content-3',
                    createdAt: new Date(2023, 10, 11),
                    updatedAt: (applicableRemoteChanges[0] as IUpdateChange)!
                        .mods.updatedAt,
                },
                source: '*',
            },
            {
                type: 3,
                table: 'documents',
                key: 'doc1',
                source: '*',
            },
            {
                type: 3,
                table: 'documents',
                key: 'doc3',
                source: '*',
            },
        ]);
        expect(applicableLocalChanges).toEqual([
            {
                type: 1,
                table: 'documents',
                key: 'doc2',
                obj: {
                    id: 'doc2',
                    dailyDoc: 'daily-doc-1',
                    content: 'content-2content-1content-3',
                    createdAt: new Date(2023, 10, 11),
                    updatedAt: (applicableLocalChanges[0] as ICreateChange)!.obj
                        .updatedAt,
                },
                source: '*',
            },
            {
                type: 3,
                table: 'documents',
                key: 'doc1',
                source: '*',
            },
            {
                type: 3,
                table: 'documents',
                key: 'doc3',
                source: '*',
            },
        ]);
    });
});
