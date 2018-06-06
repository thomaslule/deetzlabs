const { normalizeHandle } = require('../src/util');

test('normalizeHandle transforms the string to a correct handle', () => {
  expect(normalizeHandle('Émïliê')).toBe('emilie');
  expect(normalizeHandle('John Doe')).toBe('john_doe');
  expect(normalizeHandle('j+o-h:n d$o€e')).toBe('j_o_h_n_d_o_e');
  expect(normalizeHandle('my_name_is_100_percent_valid')).toBe('my_name_is_100_percent_valid');
});
