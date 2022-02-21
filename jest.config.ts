import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  roots: ['<rootDir>/test'],
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/test/**/*.ts'],
  coverageDirectory: 'coverage',
  transform: {
    '.+\\.ts$': 'ts-jest'
  }
}
export default config
