export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.svelte$': ['svelte-jester', { preprocess: true }],
    '^.+\\.(ts|js)$': ['ts-jest', {
      useESM: true,
    }]
  },

  moduleFileExtensions: ['js', 'ts', 'svelte'],
  rootDir: './',
}