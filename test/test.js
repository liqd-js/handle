'use strict';

const assert = require('assert');
const Handle = require('../lib/handle');

describe( 'Tests', () =>
{
    describe( 'Handle', () =>
    {
        it( 'should create handle', () =>
        {
            let handle = new Handle( 'my-handle', {});

            assert.ok( handle instanceof Function );
            assert.ok( handle instanceof Handle );
        });

        it( 'should create handle property', () =>
        {
            let handle = new Handle( 'my-handle', {});
            let handle_foo = handle.foo;

            assert.ok( handle_foo instanceof Function );
            assert.ok( handle_foo instanceof Handle );

            assert.ok( handle_foo.bar instanceof Function );
            assert.ok( handle_foo.bar instanceof Handle );
        });

        it( 'should call handler constructor for handle', () =>
        {
            let handler = 
            {
                construct: ( id, path, args ) => ({ id: id + '[' + path.join('.') +  '](' + args.map( JSON.stringify ).join(',') + ')' })
            }

            let handle = new Handle( 'my-handle', handler );
            let handle2 = new Handle( 'my-handle-2', handler );

            assert.deepStrictEqual( new handle, { id: 'my-handle[]()' });
            assert.deepStrictEqual( new handle(), { id: 'my-handle[]()' });
            assert.deepStrictEqual( new handle2(), { id: 'my-handle-2[]()' });
            assert.deepStrictEqual( new handle.foo.bar( 'foobar', 1 ), { id: 'my-handle[foo.bar]("foobar",1)' });
        });

        it( 'should call handler executor for handle', () =>
        {
            let handler = 
            {
                apply: ( id, path, args ) => id + '[' + path.join('.') +  '](' + args.map( JSON.stringify ).join(',') + ')'
            }

            let handle = new Handle( 'my-handle', handler );
            let handle2 = new Handle( 'my-handle-2', handler );

            assert.equal( handle(), 'my-handle[]()' );
            assert.equal( handle2(), 'my-handle-2[]()' );
            assert.equal( handle.foo.bar( 'foobar', 1 ), 'my-handle[foo.bar]("foobar",1)' );
        });

        it( 'should call handler getter for handle', () =>
        {
            let handler = 
            {
                get: ( id, path ) => id + '[' + path.join('.') +  '] : ' + 42
            }

            let handle = new Handle( 'my-handle', handler );
            let handle2 = new Handle( 'my-handle-2', handler );

            assert.equal( handle.$, 'my-handle[] : 42' );
            assert.equal( handle2.$, 'my-handle-2[] : 42' );
            assert.equal( handle.foo.bar.$, 'my-handle[foo.bar] : 42' );
        });

        it( 'should call handler setter for handle', () =>
        {
            let values = {};
            let handler = 
            {
                set: ( id, path, value ) => ( values[ id + '[' + path.join('.') +  ']' ] = value )
            }

            let handle = new Handle( 'my-handle', handler );
            let handle2 = new Handle( 'my-handle-2', handler );

            assert.equal( handle.foo = 1, values['my-handle[foo]'] );
            assert.equal( handle2.foo.bar = 2, values['my-handle-2[foo.bar]'] );
        });
    });

    describe( 'Reflect', () =>
    {
        it( 'should reflect constructor', () =>
        {
            class A
            {
                constructor( id )
                {
                    this.id = 'A:' + id;
                    this.b = B;
                }
            }

            class B
            {
                constructor( id )
                {
                    this.id = 'B:' + id;
                }
            }

            let a = Handle.reflect( A, 'construct', [], [ 1 ]);

            assert.ok( a instanceof A );
            assert.equal( a.id, 'A:1' );

            let b = Handle.reflect( B, 'construct', [], [ 1 ]);

            assert.ok( b instanceof B );
            assert.equal( b.id, 'B:1' );

            let b2 = Handle.reflect( a, 'construct', [ 'b' ], [ 2 ]);

            assert.ok( b2 instanceof B );
            assert.equal( b2.id, 'B:2' );
        });

        it( 'should reflect executor', () =>
        {
            let a = ( id ) => 'A:' + id;
            let foo = { bar: ( id ) => 'foobar:' + id };

            assert.equal( Handle.reflect( a, 'apply', [], [ 1 ]), 'A:1' );
            assert.equal( Handle.reflect( foo, 'apply', [ 'bar' ], [ 2 ]), 'foobar:2' );
        });

        it( 'should reflect getter', () =>
        {
            let a = 'A';
            let foo = { bar: 'foobar' };

            assert.equal( Handle.reflect( a, 'get', []), 'A' );
            assert.equal( Handle.reflect( foo, 'get', [ 'bar' ]), 'foobar' );
        });

        it( 'should reflect setter', () =>
        {
            let foo = { bar: 'foobar', foobar: { foo: 'bar' }};

            assert.equal( Handle.reflect( foo, 'set', [ 'bar' ], 'barfoo' ), 'barfoo' );
            assert.equal( foo.bar, 'barfoo' );

            assert.equal( Handle.reflect( foo, 'set', [ 'foobar', 'foo' ], 'foo' ), 'foo' );
            assert.equal( foo.foobar.foo, 'foo' );
        });
    });
});