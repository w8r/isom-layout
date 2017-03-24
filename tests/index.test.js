import { describe, it } from 'mocha';
import { assert }       from 'chai';

import som from '../src/index';

describe('som', () => {

  it ('should be exposed', () => {
    assert.isFunction(som);
    assert.isFunction(som.randomize);
  });

});
