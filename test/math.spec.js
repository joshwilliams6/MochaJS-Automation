const fetch = require('node-fetch');
const assert = require('chai').should();
const baseURL = 'http://api.mathjs.org/v4/?'

describe('Math API Test Suite', () => {

    before(() => {
        // console.log('Suite setup');
    })

    beforeEach(() => {
        // console.log('Test setup');
    })

    after(() => {
        // console.log('Suite teardown');
    })

    afterEach(() => {
        // console.log('Test teardown');
    })

    it('Resolve valid expression', async () => {
        const response = await fetch(`${baseURL}expr=2*(7-3)&precision=3`, { method: 'GET' });
        const result = await response.json();
        result.should.equal(8);
    });

    it('Missing parenthesis error', async () => {
        const response = await fetch(`${baseURL}expr=2*(7`, { method: 'GET' });
        const result = await response.text();
        result.should.contain('Error: Parenthesis ) expected');
    });

    it('Unexpected end of expression error', async () => {
        const response = await fetch(`${baseURL}expr=2*(7-`, { method: 'GET' });
        const result = await response.text();
        result.should.contain('Error: Unexpected end of expression');
    });

})