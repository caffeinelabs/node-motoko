import mo from '../src/versions/moc';

describe('fetchPackage', () => {
    // test('fetch core library', async () => {
    //     const pkg = (await mo.fetchPackage(
    //         'core',
    //         'dfinity/motoko-core/main/src',
    //     ))!;
    //     expect(pkg).toBeTruthy();
    //     expect(pkg.name).toStrictEqual('core');
    //     expect(Object.keys(pkg.files)).toContain('Debug.mo');
    // });

    test('load core library', () => {
        mo.loadPackage(require('../packages/latest/core.json'));

        const file = mo.file('Test.mo');
        file.write('import Debug "mo:core/Debug"; Debug.print(debug_show 123)');
        file.run();
    });
});
