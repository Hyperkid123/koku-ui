jest.mock('store/reports/reportActions');

import { ReportType } from 'api/reports/report';
import { ChartType } from 'components/charts/common/chartDatumUtils';
import { createMockStoreCreator } from 'store/mockStore';
import { reportActions } from 'store/reports';

import * as actions from './azureDashboardActions';
import {
  azureDashboardStateKey,
  AzureDashboardTab,
  getGroupByForTab,
  getQueryForWidgetTabs,
} from './azureDashboardCommon';
import { azureDashboardReducer } from './azureDashboardReducer';
import * as selectors from './azureDashboardSelectors';
import {
  costSummaryWidget,
  databaseWidget,
  networkWidget,
  storageWidget,
  virtualMachineWidget,
} from './azureDashboardWidgets';

const createAzureDashboardStore = createMockStoreCreator({
  [azureDashboardStateKey]: azureDashboardReducer,
});

const fetchReportMock = reportActions.fetchReport as jest.Mock;

beforeEach(() => {
  fetchReportMock.mockReturnValue({ type: '@@test' });
});

test('default state', () => {
  const store = createAzureDashboardStore();
  const state = store.getState();
  expect(selectors.selectCurrentWidgets(state)).toEqual([
    costSummaryWidget.id,
    virtualMachineWidget.id,
    storageWidget.id,
    networkWidget.id,
    databaseWidget.id,
  ]);
  expect(selectors.selectWidget(state, costSummaryWidget.id)).toEqual(costSummaryWidget);
});

test('fetch widget reports', () => {
  const store = createAzureDashboardStore();
  store.dispatch(actions.fetchWidgetReports(costSummaryWidget.id));
  expect(fetchReportMock.mock.calls).toMatchSnapshot();
});

test('changeWidgetTab', () => {
  const store = createAzureDashboardStore();
  store.dispatch(actions.changeWidgetTab(costSummaryWidget.id, AzureDashboardTab.resource_locations));
  const widget = selectors.selectWidget(store.getState(), costSummaryWidget.id);
  expect(widget.currentTab).toBe(AzureDashboardTab.resource_locations);
  expect(fetchReportMock).toHaveBeenCalledTimes(3);
});

describe('getGroupByForTab', () => {
  test('services tab', () => {
    expect(getGroupByForTab(AzureDashboardTab.service_names)).toMatchSnapshot();
  });

  test('instance types tab', () => {
    expect(getGroupByForTab(AzureDashboardTab.instanceType)).toMatchSnapshot();
  });

  test('accounts tab', () => {
    expect(getGroupByForTab(AzureDashboardTab.subscription_guids)).toMatchSnapshot();
  });

  test('regions tab', () => {
    expect(getGroupByForTab(AzureDashboardTab.resource_locations)).toMatchSnapshot();
  });

  test('unknown tab', () => {
    expect(getGroupByForTab('unknown' as any)).toMatchSnapshot();
  });
});

test('getQueryForWidget', () => {
  const widget = {
    id: 1,
    titleKey: '',
    reportType: ReportType.cost,
    availableTabs: [AzureDashboardTab.subscription_guids],
    currentTab: AzureDashboardTab.subscription_guids,
    details: { formatOptions: {} },
    trend: {
      formatOptions: {},
      titleKey: '',
      type: ChartType.daily,
    },
    topItems: {
      formatOptions: {},
    },
  };

  [
    [
      undefined,
      'filter[time_scope_units]=month&filter[time_scope_value]=-1&filter[resolution]=daily&group_by[subscription_guid]=*',
    ],
    [{}, 'group_by[subscription_guid]=*'],
    [{ limit: 3 }, 'filter[limit]=3&group_by[subscription_guid]=*'],
  ].forEach(value => {
    expect(getQueryForWidgetTabs(widget, value[0])).toEqual(value[1]);
  });
});
