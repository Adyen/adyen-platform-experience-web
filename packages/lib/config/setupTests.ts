import matchers from '@testing-library/jest-dom/matchers';
import { beforeEach, expect } from 'vitest';
import { cleanup } from '@testing-library/preact';

expect.extend(matchers);

beforeEach(cleanup);
