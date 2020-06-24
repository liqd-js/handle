'use strict';

class Handle extends Function
{
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