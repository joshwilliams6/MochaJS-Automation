// eslint-disable-next-line no-unused-vars
const should = require('chai').should();
const fetch = require('node-fetch');
const env = require('../env.json');

const baseURL = env[process.env.STAGE].mathURL;

const MISSING_PARENTHESIS_ERROR = 'Error: Parenthesis ) expected';
const UNEXPECTED_END_ERROR = 'Error: Unexpected end of expression';

const resolveExpressionWithGET = async (expression) => {
  const response = await fetch(`${baseURL}?expr=${expression}`, { method: 'GET' });
  return await response.text();
};

const resolveExpressionWithPOST = async (body) => {
  const response = await fetch(`${baseURL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return await response.json();
};

describe('Math API Test Suite', () => {
  it('GET - Resolve valid and invalid expressions', async () => {
    const valid = '2*(7-3)';
    const missingParenthesis = '2*(7-3';
    const unexpectedEnding = '2*(7-';

    (await resolveExpressionWithGET(valid)).should.equal('8');
    (await resolveExpressionWithGET(missingParenthesis)).should.contain(MISSING_PARENTHESIS_ERROR);
    (await resolveExpressionWithGET(unexpectedEnding)).should.contain(UNEXPECTED_END_ERROR);
  });

  it('POST - Resolve valid and invalid expressions', async () => {
    const allValidExpressions = {
      expr: [
        '2 / 3',
        'a = 1.2 * (2 + 4.5)',
        'a / 2',
        'b = [-1, 2; 3, 1]',
        'det(b)',
      ],
      precision: 14,
    };
    const oneInvalidExpression = {
      expr: [
        '2 / 3',
        'a = 1.2 * (2 + 4.5',
        'a / 2',
        'b = [-1, 2; 3, 1]',
        'det(b)',
      ],
      precision: 6,
    };

    const validResult = await resolveExpressionWithPOST(allValidExpressions);
    validResult.result.length.should.equal(5);
    validResult.result[0].length.should.equal(16);

    const invalidResult = await resolveExpressionWithPOST(oneInvalidExpression);
    invalidResult.error.should.contain(MISSING_PARENTHESIS_ERROR);
  });
});
