import {Algorand} from './Algorand.js';

describe('Algorand', () => {
  describe('Initialization', () => {
    test('Algorand TestNet initialization', async () => {
      const algorand = new Algorand();
  
      expect(algorand.network).toBe('TestNet');
    });
    test('Algorand MainNet initialization', async () => {
      const algorand = new Algorand('MainNet');
  
      expect(algorand.network).toBe('MainNet');
    });
  });
  describe('REST API', () => {
  });
});