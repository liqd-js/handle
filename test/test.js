'use strict';

const assert = require('assert');
const Handle = require('../lib/handle');

describe( 'Tests', () =>
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