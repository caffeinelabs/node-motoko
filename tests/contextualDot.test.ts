import mo from '../src/versions/moc';
import { asNode } from '../src/ast';
import { Scope } from '../src/file';

describe('contextual dot', () => {
    beforeAll(() => {
        mo.write(
            'lib.mo',
            'module { public func foo(self : Text) { ignore self }; public func bar(self : Text, n : Nat) : Nat { n } }',
        );
        mo.write('dot.mo', 'import Lib "lib"; let t = "world"; t.foo()');
    });

    afterAll(() => {
        mo.delete('lib.mo');
        mo.delete('dot.mo');
    });

    function parseAndNavigate() {
        const file = mo.file('dot.mo');
        const [prog, _] = file.parseMotokoTypedWithScopeCache(
            new Map<string, Scope>(),
            true,
        );
        expect(prog.ast).toBeTruthy();

        // Simplified AST: Prog -> [ImportD, LetD, ExpD]
        const expD = asNode(prog.ast.args?.[2]);
        expect(expD?.name).toBe('ExpD');

        const callE = asNode(expD?.args?.[0]);
        expect(callE?.name).toBe('CallE');

        const dotE = asNode(callE?.args?.[0]);
        expect(dotE?.name).toBe('DotE');

        const varE = asNode(dotE?.args?.[0]);
        expect(varE?.name).toBe('VarE');

        return { prog, dotE: dotE!, varE: varE! };
    }

    test('contextualDotModule resolves for dot expression', () => {
        const { dotE } = parseAndNavigate();

        const result = mo.contextualDotModule(dotE);
        expect(result).toEqual({
            funcName: 'foo',
            moduleNameOrUri: 'Lib',
        });
    });

    test('contextualDotModule returns undefined for non-dot expression', () => {
        const { varE } = parseAndNavigate();
        expect(mo.contextualDotModule(varE)).toBeUndefined();
    });

    test('contextualDotSuggestions returns suggestions for receiver', () => {
        const { prog, varE } = parseAndNavigate();

        const suggestions = mo.contextualDotSuggestions(varE, prog);
        expect(suggestions).toStrictEqual([
            {
                moduleUri: 'lib.mo',
                funcName: 'bar',
                funcType: '(self : Text, n : Nat) -> Nat',
            },
            {
                moduleUri: 'lib.mo',
                funcName: 'foo',
                funcType: '(self : Text) -> ()',
            },
        ]);
    });
});
