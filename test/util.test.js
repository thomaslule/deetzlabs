const { normalizeHandle } = require('../src/util');

test('normalizeHandle transforms the string to a correct handle', () => {
  expect(normalizeHandle('Émïliê')).toBe('emilie');
  expect(normalizeHandle('John Doe')).toBe('john_doe');
  expect(normalizeHandle('j+o-h:n d$o€e')).toBe('john_doe');
  expect(normalizeHandle('my_name_is_100_percent_valid')).toBe('my_name_is_100_percent_valid');
});
