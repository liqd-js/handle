'use strict';

class Handle extends Function
{
    static reflect( obj, method, path, args )
    {
        let handle = obj, property = method === 'set' ? path.splice( -1, 1 )[0] : undefined;

        for( let key of path )
        {
			obj = handle;
            handle = handle[key];
        }

        switch( method )
        {
            case 'construct': return new handle( ...args );
            case 'apply'    : return handle.apply( obj, args );
            case 'get'      : return handle;
            case 'set'      : return ( handle[property] = args );
        }
    }

	constructor( instance, path )
	{
		super();

		Object.defineProperty( this, 'name', { value: [ instance, ...path ].join('.') });
	}
}

function HandlePropertyProxy( instance, handler, path = [])
{
	return new Proxy( new Handle( instance, path ),
	{
		construct	: ( _, args ) => handler.construct( instance, path, args ),
		apply		: ( _, __, args ) => handler.apply( instance, path, args ),
		get			: ( _, property ) => property === '$' ? handler.get( instance, path ) : HandlePropertyProxy( instance, handler, [ ...path, property ]),
		set			: ( _, property, value ) => handler.set( instance, [ ...path, property ], value )
	});
}

module.exports = new Proxy( Handle,
{
	construct( _, [ instance, handler ])
	{
		return HandlePropertyProxy( instance, handler );
	}
});