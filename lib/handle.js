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

	constructor( id, path )
	{
		super();

		Object.defineProperty( this, 'name', { value: [ id, ...path ].join('.') });
	}
}

function HandlePropertyProxy( id, handler, path = [])
{
	return new Proxy( new Handle( id, path ),
	{
		construct	: ( _, args ) => handler.construct( id, path, args ),
		apply		: ( _, __, args ) => handler.apply( id, path, args ),
		get			: ( _, property ) => property === '$' ? handler.get( id, path ) : HandlePropertyProxy( id, handler, [ ...path, property ]),
		set			: ( _, property, value ) => handler.set( id, [ ...path, property ], value )
	});
}

module.exports = new Proxy( Handle,
{
	construct( _, [ id, handler ])
	{
		return HandlePropertyProxy( id, handler );
	}
});