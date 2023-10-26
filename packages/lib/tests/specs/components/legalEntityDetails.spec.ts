import { test, expect } from '@playwright/test';
import { LegalEntityDetailsPage } from '../../models/external-components/legalEntityDetails.page';
import { getTranslatedKey, scriptToAddDefaultID } from '../../utils/utils';
import { LEGAL_ENTITY_INDIVIDUAL, LEGAL_ENTITY_ORGANIZATION, LEGAL_ENTITY_ORGANIZATION_WITH_TI } from '../../../../../mocks';

const testWithMockedApi = (id: string) => {
    return test.extend<{
        legalEntityDetailsPage: LegalEntityDetailsPage;
    }>({
        legalEntityDetailsPage: async ({ page }, use) => {
            const legalEntityDetailsPage = new LegalEntityDetailsPage(page);

            await scriptToAddDefaultID(page, id);

            await legalEntityDetailsPage.goto();

            await use(legalEntityDetailsPage);
        },
    });
};
test.describe('legal entity with transfer instruments', async () => {
    const testLE = testWithMockedApi(LEGAL_ENTITY_ORGANIZATION_WITH_TI.id);

    testLE('legal entity should show overview by default', async ({ legalEntityDetailsPage }) => {
        const legalEntityDetails = legalEntityDetailsPage;
        await expect(legalEntityDetails.selectedTab).toHaveText(getTranslatedKey('overview'));
        await expect(legalEntityDetails.legalEntityValues).toBeVisible();
        await expect(legalEntityDetails.id).toHaveText(LEGAL_ENTITY_ORGANIZATION_WITH_TI.id);
        await expect(legalEntityDetails.type).toHaveText(getTranslatedKey('organization'));
    });

    testLE('legal entity with transfer instruments should have enabled the TI tab and show content on click', async ({ legalEntityDetailsPage }) => {
        const legalEntityDetails = legalEntityDetailsPage;
        await expect(legalEntityDetails.transferInstruments).toBeHidden();
        await legalEntityDetails.transferInstrumentsTab.click();
        await expect(legalEntityDetails.selectedTab).toHaveText(getTranslatedKey('transferInstruments'));
        await expect(legalEntityDetails.transferInstruments).toBeVisible();
        await expect(legalEntityDetails.transferInstruments.getByLabel('transfer-instrument-id').nth(0)).toHaveText(
            LEGAL_ENTITY_ORGANIZATION_WITH_TI.transferInstruments?.[0]?.id ?? ''
        );
    });
});

test.describe('legal entity without transfer instrument', async () => {
    const testLE = testWithMockedApi(LEGAL_ENTITY_ORGANIZATION.id);
    testLE('legal entity with transfer instruments should have enabled the TI tab', async ({ legalEntityDetailsPage }) => {
        const legalEntityDetails = legalEntityDetailsPage;

        await expect(legalEntityDetails.id).toHaveText(LEGAL_ENTITY_ORGANIZATION.id);
        await expect(legalEntityDetails.type).toHaveText(getTranslatedKey('organization'));
        await expect(legalEntityDetails.transferInstruments).toBeHidden();
        await expect(legalEntityDetails.transferInstrumentsTab).toBeDisabled();
    });
});

test.describe('individual legal entity', async () => {
    const testLE = testWithMockedApi(LEGAL_ENTITY_INDIVIDUAL.id);
    testLE("individual legal entity shouldn't show tabs", async ({ legalEntityDetailsPage }) => {
        const legalEntityDetails = legalEntityDetailsPage;

        await expect(legalEntityDetails.getListValue(getTranslatedKey('id'))).toHaveText(LEGAL_ENTITY_INDIVIDUAL.id);
        await expect(legalEntityDetails.getListValue(getTranslatedKey('legalEntityType'))).toHaveText(getTranslatedKey('individual'));
        await expect(legalEntityDetails.transferInstrumentsTab).not.toBeAttached();
    });
});
