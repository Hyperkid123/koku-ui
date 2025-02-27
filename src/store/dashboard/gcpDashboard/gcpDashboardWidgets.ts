import { ForecastPathsType, ForecastType } from 'api/forecasts/forecast';
import { ReportPathsType, ReportType } from 'api/reports/report';
import {
  ChartType,
  ComputedForecastItemType,
  ComputedReportItemType,
  ComputedReportItemValueType,
} from 'components/charts/common/chartDatumUtils';
import messages from 'locales/messages';
import { paths } from 'routes';
import { DashboardChartType } from 'store/dashboard/common/dashboardCommon';

import { GcpDashboardTab, GcpDashboardWidget } from './gcpDashboardCommon';

let currrentId = 0;
const getId = () => currrentId++;

export const computeWidget: GcpDashboardWidget = {
  id: getId(),
  titleKey: messages.GCPComputeTitle,
  forecastPathsType: ForecastPathsType.gcp,
  reportPathsType: ReportPathsType.gcp,
  reportType: ReportType.instanceType,
  details: {
    costKey: messages.Cost,
    showUnits: true,
    showUsageFirst: true,
    showUsageLegendLabel: true,
    usageKey: messages.Usage,
  },
  filter: {
    service: 'Compute Engine',
  },
  tabsFilter: {
    service: 'Compute Engine',
  },
  trend: {
    computedReportItem: ComputedReportItemType.usage,
    computedReportItemValue: ComputedReportItemValueType.total,
    titleKey: messages.DashboardDailyUsageComparison,
    type: ChartType.daily,
  },
  // availableTabs: [
  //   GcpDashboardTab.instanceType,
  //   GcpDashboardTab.accounts,
  //   GcpDashboardTab.regions,
  // ],
  chartType: DashboardChartType.trend,
  currentTab: GcpDashboardTab.instanceType,
};

export const costSummaryWidget: GcpDashboardWidget = {
  id: getId(),
  titleKey: messages.GCPCostTitle,
  forecastPathsType: ForecastPathsType.gcp,
  forecastType: ForecastType.cost,
  reportPathsType: ReportPathsType.gcp,
  reportType: ReportType.cost,
  details: {
    adjustContainerHeight: true,
    costKey: messages.Cost,
    showHorizontal: true,
    viewAllPath: paths.gcpDetails,
  },
  tabsFilter: {
    limit: 3,
  },
  trend: {
    computedForecastItem: ComputedForecastItemType.cost,
    computedReportItem: ComputedReportItemType.cost,
    computedReportItemValue: ComputedReportItemValueType.total,
    dailyTitleKey: messages.GCPDailyCostTrendTitle,
    titleKey: messages.GCPCostTrendTitle,
    type: ChartType.rolling,
  },
  availableTabs: [GcpDashboardTab.services, GcpDashboardTab.gcpProjects, GcpDashboardTab.regions],
  chartType: DashboardChartType.dailyTrend,
  currentTab: GcpDashboardTab.services,
};

export const databaseWidget: GcpDashboardWidget = {
  id: getId(),
  titleKey: messages.DashboardDatabaseTitle,
  reportPathsType: ReportPathsType.gcp,
  reportType: ReportType.database,
  details: {
    costKey: messages.Cost,
    showUnits: true,
  },
  filter: {
    service: 'Bigtable,Datastore,Database Migrations,Firestore,MemoryStore,Spanner,SQL',
  },
  tabsFilter: {
    service: 'Bigtable,Datastore,Database Migrations,Firestore,MemoryStore,Spanner,SQL',
  },
  trend: {
    computedReportItem: ComputedReportItemType.cost,
    computedReportItemValue: ComputedReportItemValueType.total,
    titleKey: messages.DashboardCumulativeCostComparison,
    type: ChartType.rolling,
  },
  // availableTabs: [
  //   GcpDashboardTab.services,
  //   GcpDashboardTab.accounts,
  //   GcpDashboardTab.regions,
  // ],
  chartType: DashboardChartType.trend,
  currentTab: GcpDashboardTab.services,
};

export const networkWidget: GcpDashboardWidget = {
  id: getId(),
  titleKey: messages.DashboardNetworkTitle,
  reportPathsType: ReportPathsType.gcp,
  reportType: ReportType.network,
  details: {
    costKey: messages.Cost,
    showUnits: true,
  },
  filter: {
    service:
      'VPC network,Network services,Hybrid Connectivity,Network Service Tiers,Network Security,Network Intelligence',
  },
  tabsFilter: {
    service:
      'VPC network,Network services,Hybrid Connectivity,Network Service Tiers,Network Security,Network Intelligence',
  },
  trend: {
    computedReportItem: ComputedReportItemType.cost,
    computedReportItemValue: ComputedReportItemValueType.total,
    titleKey: messages.DashboardCumulativeCostComparison,
    type: ChartType.rolling,
  },
  // availableTabs: [
  //   GcpDashboardTab.services,
  //   GcpDashboardTab.accounts,
  //   GcpDashboardTab.regions,
  // ],
  chartType: DashboardChartType.trend,
  currentTab: GcpDashboardTab.services,
};

export const storageWidget: GcpDashboardWidget = {
  id: getId(),
  titleKey: messages.DashboardStorageTitle,
  reportPathsType: ReportPathsType.gcp,
  reportType: ReportType.storage,
  details: {
    costKey: messages.Cost,
    showUnits: true,
    showUsageFirst: true,
    showUsageLegendLabel: true,
    usageKey: messages.Usage,
  },
  trend: {
    computedReportItem: ComputedReportItemType.usage,
    computedReportItemValue: ComputedReportItemValueType.total,
    titleKey: messages.DashboardDailyUsageComparison,
    type: ChartType.daily,
  },
  // availableTabs: [
  //   GcpDashboardTab.services,
  //   GcpDashboardTab.accounts,
  //   GcpDashboardTab.regions,
  // ],
  chartType: DashboardChartType.trend,
  currentTab: GcpDashboardTab.gcpProjects,
};
