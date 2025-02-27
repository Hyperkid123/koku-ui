import { createMockStoreCreator } from 'store/mockStore';

import { uiSelectors } from '.';
import * as actions from './uiActions';
import { stateKey, uiReducer } from './uiReducer';
import * as selectors from './uiSelectors';

const createUIStore = createMockStoreCreator({
  [stateKey]: uiReducer,
});

test('default state', async () => {
  const store = createUIStore();
  expect(selectors.selectUIState(store.getState())).toMatchSnapshot();
});

test('close export drawer', async () => {
  const store = createUIStore();
  store.dispatch(actions.closeExportDrawer());
  expect(uiSelectors.selectIsExportDrawerOpen(store.getState())).toBe(false);
});

test('open export drawer', async () => {
  const store = createUIStore();
  store.dispatch(actions.openExportDrawer());
  expect(uiSelectors.selectIsExportDrawerOpen(store.getState())).toBe(true);
});
