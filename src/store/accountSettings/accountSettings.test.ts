jest.mock('api/accountSettings');

import { waitFor } from '@testing-library/react';
import { AccountSettings, fetchAccountSettings } from 'api/accountSettings';
import { FetchStatus } from 'store/common';
import { createMockStoreCreator } from 'store/mockStore';

import * as actions from './accountSettingsActions';
import { stateKey } from './accountSettingsCommon';
import { accountSettingsReducer } from './accountSettingsReducer';
import * as selectors from './accountSettingsSelectors';

const createProdvidersStore = createMockStoreCreator({
  [stateKey]: accountSettingsReducer,
});

const fetchAccountSettingsMock = fetchAccountSettings as jest.Mock;

// To do: Update for new account-settings API -- mimic cost-type API for now
const accountSettingsMock: AccountSettings = {
  data: [
    {
      code: 'unblended_cost',
      description: 'Unblended',
      name: 'Usage cost on the day you are charged',
    },
  ],
} as any;

fetchAccountSettingsMock.mockReturnValue(Promise.resolve({ data: accountSettingsMock }));

jest.spyOn(selectors, 'selectAccountSettingsFetchStatus');

test('default state', async () => {
  const store = createProdvidersStore();
  expect(selectors.selectAccountSettingsState(store.getState())).toMatchSnapshot();
});

test('fetch account settings success', async () => {
  const store = createProdvidersStore();
  store.dispatch(actions.fetchAccountSettings());
  expect(fetchAccountSettingsMock).toBeCalled();
  expect(selectors.selectAccountSettingsFetchStatus(store.getState())).toBe(FetchStatus.inProgress);
  await waitFor(() => expect(selectors.selectAccountSettingsFetchStatus).toHaveBeenCalled());
  const finishedState = store.getState();
  expect(selectors.selectAccountSettingsFetchStatus(finishedState)).toBe(FetchStatus.complete);
});

test('fetch account settings failure', async () => {
  const store = createProdvidersStore();
  const error = Symbol('getAccountSettings error');
  fetchAccountSettingsMock.mockReturnValueOnce(Promise.reject(error));
  store.dispatch(actions.fetchAccountSettings());
  expect(fetchAccountSettingsMock).toBeCalled();
  expect(selectors.selectAccountSettingsFetchStatus(store.getState())).toBe(FetchStatus.inProgress);
  await waitFor(() => expect(selectors.selectAccountSettingsFetchStatus).toHaveBeenCalled());
  const finishedState = store.getState();
  expect(selectors.selectAccountSettingsFetchStatus(finishedState)).toBe(FetchStatus.complete);
});
