import mo from '../src/versions/moc';

const actor = `
persistent actor {
    public func test() : async Nat {
        123
    }
}
`;

function unboundVarDiagnostic(source: string) {
    return {
        range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 5 },
        },
        severity: 1,
        source,
        category: 'type',
        code: 'M0057',
        message: 'unbound variable Error',
    };
}

describe('virtual file system I/O', () => {
    test('write -> read', () => {
        const path = 'WriteRead.txt';
        const text = 'A\nB';
        mo.write(path, text);
        expect(mo.read(path)).toStrictEqual(text);
    });
});

describe('type checker', () => {
    test('basic example', () => {
        const path = 'Check.mo';
        mo.write(path, actor);
        expect(mo.check(path)).toStrictEqual([]);
    });

    test('long text literal', () => {
        const path = 'TextLiteral.mo';
        mo.write(path, `let s = "${'⛔'.repeat(20000)}"; s.size()`);
        expect(mo.check(path)).toStrictEqual([]);
    });

    test('diagnostic format', () => {
        const path = 'Diagnostic.mo';
        mo.write(path, `Error`);
        expect(mo.check(path)).toStrictEqual([
            unboundVarDiagnostic(path),
        ]);
    });
});

describe('type checker with scope cache', () => {
    test('returns diagnostics and scopeCache for valid code', () => {
        const path = 'CheckCache.mo';
        mo.write(path, actor);
        const result = mo.checkWithScopeCache(path, new Map());
        expect(result.diagnostics).toStrictEqual([]);
        expect(result.scopeCache).not.toBeNull();
    });

    test('returns diagnostics for invalid code', () => {
        const path = 'CheckCacheDiag.mo';
        mo.write(path, `Error`);
        const result = mo.checkWithScopeCache(path, new Map());
        expect(result.diagnostics).toStrictEqual([
            unboundVarDiagnostic(path),
        ]);
    });

    test('unchanged file should have equal caches', () => {
        const path = 'CheckCacheEqual.mo';
        mo.write(path, actor);
        const first = mo.checkWithScopeCache(path, new Map());
        expect(first.diagnostics).toStrictEqual([]);
        expect(first.scopeCache).not.toBeNull();

        const second = mo.checkWithScopeCache(path, first.scopeCache!);
        expect(second.diagnostics).toStrictEqual([]);
        expect(second.scopeCache).toStrictEqual(first.scopeCache);
    });

    test('changed file should have different diagnostics', () => {
        const path = 'CheckCacheChanged.mo';
        mo.write(path, actor);
        const first = mo.checkWithScopeCache(path, new Map());
        expect(first.diagnostics).toStrictEqual([]);

        mo.write(path, `Error`);
        const second = mo.checkWithScopeCache(path, first.scopeCache!);
        expect(second.diagnostics).toStrictEqual([
            unboundVarDiagnostic(path),
        ]);
    });
});
