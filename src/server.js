'use strict'

const { ApolloServer } = require('apollo-server-micro')
const { UnsignedIntResolver, UnsignedIntTypeDefinition, DateTimeResolver, DateTimeTypeDefinition } = require('graphql-scalars')
const micro = require('micro')
const { resolve } = require('path')
const { readFile } = require('fs').promises
const { send, createError } = require('micro')
const { router, get, post, put, patch, del } = require('microrouter')

const KnownError = require('./utils/KnownError')
const signale = require('./utils/signale')
const isDefined = require('./utils/isDefined')
const isDemoMode = require('./utils/isDemoMode')
const isDevelopmentMode = require('./utils/isDevelopmentMode')
const customTracker = require('./utils/customTracker')
const { createMicroContext } = require('./utils/createContext')

const index = readFile(resolve(__dirname, '../dist/index.html'))
const favicon = readFile(resolve(__dirname, '../dist/favicon.ico'))
const styles = readFile(resolve(__dirname, '../dist/index.css'))
const scripts = readFile(resolve(__dirname, '../dist/index.js'))
const tracker = readFile(resolve(__dirname, '../dist/tracker.js'))

const handleMicroError = (err, res) => {

	// This part is for micro errors and errors outside of GraphQL.
	// Most errors won't be caught here, but some error can still
	// happen outside of GraphQL. In this case we distinguish
	// between unknown errors and known errors. Known errors are
	// created with the createError function while unknown errors
	// are simply errors thrown somewhere in the application.

	const isUnknownError = err.statusCode == null
	const hasOriginalError = err.originalError != null

	// Only log the full error stack when the error isn't a known response
	if (isUnknownError === true) {
		signale.fatal(err)
		return send(res, 500, err.message)
	}

	signale.warn(hasOriginalError === true ? err.originalError.message : err.message)
	send(res, err.statusCode, err.message)

}

const handleGraphError = (err) => {

	// This part is for error that happen inside GraphQL resolvers.
	// All known errors should be thrown as a KnownError as those
	// errors will only show up in the response and as a warning
	// in the console output.

	const originalError = err.originalError
	const isKnownError = originalError instanceof KnownError

	// Only log the full error stack when the error isn't a known response
	if (isKnownError === false) {
		signale.fatal(originalError)
		return err
	}

	signale.warn(err.originalError.message)
	return err

}

const catchError = (fn) => async (req, res) => {

	try {
		return await fn(req, res)
	} catch (err) {
		handleMicroError(err, res)
	}

}

const attachCorsHeaders = (fn) => async (req, res) => {

	const allowOrigin = (() => {

		if (process.env.ACKEE_ALLOW_ORIGIN === '*') return '*'

		if (process.env.ACKEE_ALLOW_ORIGIN) {
			const origins = process.env.ACKEE_ALLOW_ORIGIN.split(',')
			return origins.find((origin) => origin.includes(req.headers.origin) || origin.includes(req.headers.host))
		}

	})()

	if (allowOrigin != null) {
		res.setHeader('Access-Control-Allow-Origin', allowOrigin)
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
	}

	return fn(req, res)

}

const notFound = async (req) => {

	const err = new Error(`\`${ req.url }\` not found`)

	throw createError(404, 'Not found', err)

}

const apolloServer = new ApolloServer({
	introspection: isDemoMode === true || isDevelopmentMode === true,
	playground: isDemoMode === true || isDevelopmentMode === true,
	debug: isDevelopmentMode === true,
	formatError: handleGraphError,
	typeDefs: [
		UnsignedIntTypeDefinition,
		DateTimeTypeDefinition,
		require('./types')
	],
	resolvers: {
		UnsignedInt: UnsignedIntResolver,
		DateTime: DateTimeResolver,
		...require('./resolvers')
	},
	context: createMicroContext
})

const graphqlPath = '/api'
const graphqlHandler = apolloServer.createHandler({ path: graphqlPath })

const routes = [

	get('/', async (req, res) => {
		res.setHeader('Content-Type', 'text/html; charset=utf-8')
		res.end(await index)
	}),
	get('/index.html', async (req, res) => {
		res.setHeader('Content-Type', 'text/html; charset=utf-8')
		res.end(await index)
	}),
	get('/favicon.ico', async (req, res) => {
		res.setHeader('Content-Type', 'image/vnd.microsoft.icon')
		res.end(await favicon)
	}),
	get('/index.css', async (req, res) => {
		res.setHeader('Content-Type', 'text/css; charset=utf-8')
		res.end(await styles)
	}),
	get('/index.js', async (req, res) => {
		res.setHeader('Content-Type', 'text/javascript; charset=utf-8')
		res.end(await scripts)
	}),
	get('/tracker.js', async (req, res) => {
		res.setHeader('Content-Type', 'text/javascript; charset=utf-8')
		res.end(await tracker)
	}),
	customTracker.exists === true ? get(customTracker.url, async (req, res) => {
		res.setHeader('Content-Type', 'text/javascript; charset=utf-8')
		res.end(await tracker)
	}) : undefined,

	post(graphqlPath, graphqlHandler),
	get(graphqlPath, graphqlHandler),

	get('/*', notFound),
	post('/*', notFound),
	put('/*', notFound),
	patch('/*', notFound),
	del('/*', notFound)

].filter(isDefined)

module.exports = micro(
	attachCorsHeaders(
		catchError(
			router(...routes)
		)
	)
)