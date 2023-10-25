import { Page } from '@playwright/test';
import { LegalEntities } from '../../../src';
const getLegalEntities = async (page: Page, response: LegalEntities) => {
    await page.route(`*/**/api/legalEntities/*`, async route => {
        await route.fulfill({ json: response });
    });
};
export const legalEntitiesEndpoint = {
    getById: getLegalEntities,
};
