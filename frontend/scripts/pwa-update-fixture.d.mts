export declare const PWA_UPDATE_FIXTURE_ROOT: string;
export declare const PWA_UPDATE_REVISIONS: Readonly<{ A: "revision-a"; B: "revision-b" }>;
export declare function pwaUpdateRevisionPath(revision: keyof typeof PWA_UPDATE_REVISIONS): string;
export declare function selectPwaFixtureRevision(revision: keyof typeof PWA_UPDATE_REVISIONS): Promise<void>;
export declare function activePwaFixtureRevision(): Promise<keyof typeof PWA_UPDATE_REVISIONS>;
