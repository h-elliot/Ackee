'use strict'

const test = require('ava')

const isDemo = require('../../src/utils/isDemo')

test('return boolean', async (t) => {

	t.true(typeof isDemo === 'boolean')

})