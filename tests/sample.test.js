// sample.test.js

const sum = (a, b) => a + b;

test('sums two values', () => {
    expect(sum(1, 2)).toBe(3);
});