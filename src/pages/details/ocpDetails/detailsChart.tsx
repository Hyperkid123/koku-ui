import { ChartBullet } from '@patternfly/react-charts';
import {
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
} from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import {
  Skeleton,
  SkeletonSize,
} from '@redhat-cloud-services/frontend-components/components/Skeleton';
import { getQuery, OcpQuery } from 'api/queries/ocpQuery';
import { OcpReport, OcpReportType } from 'api/reports/ocpReports';
import React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { connect } from 'react-redux';
import { createMapStateToProps, FetchStatus } from 'store/common';
import {
  ocpReportsActions,
  ocpReportsSelectors,
} from 'store/reports/ocpReports';
import { ComputedReportItem } from 'utils/computedReport/getComputedReportItems';
import { formatValue, unitLookupKey } from 'utils/formatValue';
import { styles } from './detailsChart.styles';

export interface ChartDatum {
  legend: any[];
  limit: any;
  ranges: any[];
  usage: any[];
}

interface DetailsChartOwnProps {
  groupBy: string;
  item: ComputedReportItem;
}

interface DetailsChartStateProps {
  cpuReport?: OcpReport;
  cpuReportFetchStatus?: FetchStatus;
  memoryReport?: OcpReport;
  memoryReportFetchStatus?: FetchStatus;
  queryString?: string;
}

interface DetailsChartDispatchProps {
  fetchReport?: typeof ocpReportsActions.fetchReport;
}

interface State {
  width: number;
}

type DetailsChartProps = DetailsChartOwnProps &
  DetailsChartStateProps &
  DetailsChartDispatchProps &
  InjectedTranslateProps;

const cpuReportType = OcpReportType.cpu;
const memoryReportType = OcpReportType.memory;

class DetailsChartBase extends React.Component<DetailsChartProps> {
  private containerRef = React.createRef<HTMLDivElement>();
  public state: State = {
    width: 0,
  };

  public componentDidMount() {
    const { fetchReport, queryString } = this.props;
    fetchReport(cpuReportType, queryString);
    fetchReport(memoryReportType, queryString);

    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }

  public componentDidUpdate(prevProps: DetailsChartProps) {
    const { fetchReport, queryString } = this.props;
    if (prevProps.queryString !== this.props.queryString) {
      fetchReport(cpuReportType, queryString);
      fetchReport(memoryReportType, queryString);
    }
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  private handleResize = () => {
    if (this.containerRef.current && this.containerRef.current.clientWidth) {
      this.setState({ width: this.containerRef.current.clientWidth });
    }
  };

  private getChartDatum(report: OcpReport, labelKey: string): ChartDatum {
    const { t } = this.props;
    const datum: ChartDatum = {
      legend: [],
      limit: {},
      ranges: [],
      usage: [],
    };

    // Always show bullet chart legends https://github.com/project-koku/koku-ui/issues/963
    const hasTotal = report && report.meta && report.meta.total;

    const hasLimit =
      hasTotal && report.meta.total.limit && report.meta.total.limit !== null;
    const limit = Math.trunc(hasLimit ? report.meta.total.limit.value : 0);
    const limitUnits = t(
      `units.${unitLookupKey(hasLimit ? report.meta.total.limit.units : '')}`
    );
    datum.limit = {
      legend: t(`ocp_details.bullet.${labelKey}_limit`, {
        value: limit,
        units: limitUnits,
      }),
      tooltip: t(`ocp_details.bullet.${labelKey}_limit`, {
        value: limit,
        units: limitUnits,
      }),
      value: Math.trunc(limit),
    };

    const hasRequest =
      hasTotal &&
      report.meta.total.request &&
      report.meta.total.request !== null;
    const request = Math.trunc(
      hasRequest ? report.meta.total.request.value : 0
    );
    const requestUnits = t(
      `units.${unitLookupKey(
        hasRequest ? report.meta.total.request.units : ''
      )}`
    );
    datum.ranges = [
      {
        legend: t(`ocp_details.bullet.${labelKey}_requests`, {
          value: request,
          units: requestUnits,
        }),
        tooltip: t(`ocp_details.bullet.${labelKey}_requests`, {
          value: request,
          units: requestUnits,
        }),
        value: Math.trunc(request),
      },
    ];

    const hasUsage =
      hasTotal && report.meta.total.usage && report.meta.total.usage !== null;
    const usage = Math.trunc(hasUsage ? report.meta.total.usage.value : 0);
    const usageUnits = t(
      `units.${unitLookupKey(hasUsage ? report.meta.total.usage.units : '')}`
    );
    datum.usage = [
      {
        legend: t(`ocp_details.bullet.${labelKey}_usage`, {
          value: usage,
          units: usageUnits,
        }),
        tooltip: t(`ocp_details.bullet.${labelKey}_usage`, {
          value: usage,
          units: usageUnits,
        }),
        value: Math.trunc(usage),
      },
    ];
    return datum;
  }

  private getChartDatumWithCapacity(
    report: OcpReport,
    labelKey: string
  ): ChartDatum {
    const { t } = this.props;
    const datum: ChartDatum = {
      legend: [],
      limit: {},
      ranges: [],
      usage: [],
    };

    // Always show bullet chart legends https://github.com/project-koku/koku-ui/issues/963
    const hasTotal = report && report.meta && report.meta.total;

    const hasLimit =
      hasTotal && report.meta.total.limit && report.meta.total.limit !== null;
    const limit = Math.trunc(hasLimit ? report.meta.total.limit.value : 0);
    const limitUnits = t(
      `units.${unitLookupKey(hasLimit ? report.meta.total.limit.units : '')}`
    );
    datum.limit = {
      legend: t(`ocp_details.bullet.${labelKey}_limit`, {
        value: limit,
        units: limitUnits,
      }),
      tooltip: t(`ocp_details.bullet.${labelKey}_limit`, {
        value: limit,
        units: limitUnits,
      }),
      value: Math.trunc(limit),
    };

    const hasCapacity =
      hasTotal &&
      report.meta.total.request &&
      report.meta.total.request !== null;
    const capacity = Math.trunc(
      hasCapacity ? report.meta.total.capacity.value : 0
    );
    const capacityUnits = t(
      `units.${unitLookupKey(
        hasCapacity ? report.meta.total.capacity.units : ''
      )}`
    );
    datum.ranges = [
      {
        legend: t(`ocp_details.bullet.${labelKey}_capacity`, {
          value: capacity,
          units: capacityUnits,
        }),
        tooltip: t(`ocp_details.bullet.${labelKey}_capacity`, {
          value: capacity,
          units: capacityUnits,
        }),
        value: Math.trunc(capacity),
      },
    ];

    const hasRequest =
      hasTotal &&
      report.meta.total.request &&
      report.meta.total.request !== null;
    const hasUsage =
      hasTotal && report.meta.total.usage && report.meta.total.usage !== null;
    const request = Math.trunc(
      hasRequest ? report.meta.total.request.value : 0
    );
    const requestUnits = t(
      `units.${unitLookupKey(
        hasRequest ? report.meta.total.request.units : ''
      )}`
    );
    const usage = Math.trunc(hasUsage ? report.meta.total.usage.value : 0);
    const usageUnits = t(
      `units.${unitLookupKey(hasUsage ? report.meta.total.usage.units : '')}`
    );
    datum.usage = [
      {
        legend: t(`ocp_details.bullet.${labelKey}_usage`, {
          value: usage,
          units: usageUnits,
        }),
        tooltip: t(`ocp_details.bullet.${labelKey}_usage`, {
          value: usage,
          units: usageUnits,
        }),
        value: Math.trunc(usage),
      },
      {
        legend: t(`ocp_details.bullet.${labelKey}_requests`, {
          value: request,
          units: requestUnits,
        }),
        tooltip: t(`ocp_details.bullet.${labelKey}_requests`, {
          value: request,
          units: requestUnits,
        }),
        value: Math.trunc(request),
      },
    ];
    return datum;
  }

  private getCpuChart = () => {
    const { cpuReportFetchStatus, cpuReport, groupBy, t } = this.props;
    const { width } = this.state;

    const cpuDatum =
      groupBy === 'cluster'
        ? this.getChartDatumWithCapacity(cpuReport, 'cpu')
        : this.getChartDatum(cpuReport, 'cpu');

    if (!cpuReport || cpuDatum.usage.length === 0) {
      return null;
    }

    return (
      <div>
        {cpuReportFetchStatus === FetchStatus.inProgress ? (
          this.getSkeleton()
        ) : (
          <>
            <ChartBullet
              comparativeErrorMeasureData={
                cpuDatum.limit.value
                  ? [
                      {
                        tooltip: cpuDatum.limit.tooltip,
                        y: cpuDatum.limit.value,
                      },
                    ]
                  : []
              }
              comparativeErrorMeasureLegendData={
                cpuDatum.limit.value ? [{ name: cpuDatum.limit.legend }] : []
              }
              height={200}
              labels={({ datum }) => `${datum.tooltip}`}
              legendPosition="bottom-left"
              legendItemsPerRow={this.getItemsPerRow()}
              maxDomain={this.isDatumEmpty(cpuDatum) ? 100 : undefined}
              minDomain={0}
              padding={{
                bottom: 75,
                left: 10,
                right: 50,
                top: 50,
              }}
              primarySegmentedMeasureData={
                cpuDatum.usage.length
                  ? cpuDatum.usage.map(datum => {
                      return {
                        tooltip: datum.tooltip,
                        y: datum.value,
                      };
                    })
                  : []
              }
              primarySegmentedMeasureLegendData={
                cpuDatum.usage.length
                  ? cpuDatum.usage.map(datum => {
                      return {
                        name: datum.legend,
                      };
                    })
                  : []
              }
              qualitativeRangeData={
                cpuDatum.ranges.length
                  ? [
                      {
                        tooltip: cpuDatum.ranges[0].tooltip,
                        y: cpuDatum.ranges[0].value,
                      },
                    ]
                  : []
              }
              qualitativeRangeLegendData={
                cpuDatum.ranges.length
                  ? [{ name: cpuDatum.ranges[0].legend }]
                  : []
              }
              title={t('ocp_details.bullet.cpu_label')}
              titlePosition="top-left"
              width={width}
            />
            {Boolean(groupBy === 'cluster') &&
              this.getFreeSpace(cpuReport, 'cpu')}
          </>
        )}
      </div>
    );
  };

  private getFreeSpace(report: OcpReport, labelKey: string) {
    const { t } = this.props;
    const hasTotal = report && report.meta && report.meta.total;
    const hasCapacity =
      hasTotal &&
      report.meta.total.request &&
      report.meta.total.request !== null;
    const hasRequest =
      hasTotal &&
      report.meta.total.request &&
      report.meta.total.request !== null;
    const hasUsage =
      hasTotal && report.meta.total.usage && report.meta.total.usage !== null;

    const capacity = Math.trunc(
      hasCapacity ? report.meta.total.capacity.value : 0
    );
    const request = Math.trunc(
      hasRequest ? report.meta.total.request.value : 0
    );
    const requestUnits = t(
      `units.${unitLookupKey(
        hasRequest ? report.meta.total.request.units : ''
      )}`
    );
    const usage = Math.trunc(hasUsage ? report.meta.total.usage.value : 0);
    const usageUnits = t(
      `units.${unitLookupKey(hasUsage ? report.meta.total.usage.units : '')}`
    );

    // Show negative values https://github.com/project-koku/koku-ui/issues/1214
    const unusedRequestCapacity = capacity - request;
    const unusedUsageCapacity = capacity - usage;

    let unusedRequestCapacityPercentage =
      request > 0 ? (request / capacity) * 100 : 0;
    if (unusedRequestCapacityPercentage > 100) {
      unusedRequestCapacityPercentage = 100 - unusedRequestCapacityPercentage;
    }
    let unusedUsageCapacityPercentage =
      capacity > usage ? (usage / capacity) * 100 : 0;
    if (unusedUsageCapacityPercentage > 100) {
      unusedUsageCapacityPercentage = 100 - unusedUsageCapacityPercentage;
    }

    return (
      <TextContent className={css(styles.freeSpace)}>
        <TextList component={TextListVariants.dl}>
          <TextListItem component={TextListItemVariants.dt}>
            {t(`ocp_details.bullet.${labelKey}_usage_unused_label`)}
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {t(`ocp_details.bullet.${labelKey}_usage_unused`, {
              percentage: formatValue(
                unusedUsageCapacityPercentage,
                usageUnits
              ),
              value: unusedUsageCapacity,
              units: usageUnits,
            })}
          </TextListItem>
          <TextListItem component={TextListItemVariants.dt}>
            {t(`ocp_details.bullet.${labelKey}_requests_unused_label`)}
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {t(`ocp_details.bullet.${labelKey}_requests_unused`, {
              percentage: formatValue(
                unusedRequestCapacityPercentage,
                requestUnits
              ),
              value: unusedRequestCapacity,
              units: requestUnits,
            })}
          </TextListItem>
        </TextList>
      </TextContent>
    );
  }

  private getItemsPerRow = () => {
    const { width } = this.state;
    return width > 600 ? 3 : width > 450 ? 2 : 1;
  };

  private getMemoryChart = () => {
    const { memoryReportFetchStatus, memoryReport, groupBy, t } = this.props;
    const { width } = this.state;

    const memoryDatum =
      groupBy === 'cluster'
        ? this.getChartDatumWithCapacity(memoryReport, 'memory')
        : this.getChartDatum(memoryReport, 'memory');

    if (!memoryReport || memoryDatum.usage.length === 0) {
      return null;
    }

    return (
      <div>
        {memoryReportFetchStatus === FetchStatus.inProgress ? (
          this.getSkeleton()
        ) : (
          <>
            <ChartBullet
              comparativeErrorMeasureData={
                memoryDatum.limit.value
                  ? [
                      {
                        tooltip: memoryDatum.limit.tooltip,
                        y: memoryDatum.limit.value,
                      },
                    ]
                  : []
              }
              comparativeErrorMeasureLegendData={
                memoryDatum.limit.value
                  ? [{ name: memoryDatum.limit.legend }]
                  : []
              }
              height={200}
              labels={({ datum }) => `${datum.tooltip}`}
              legendPosition="bottom-left"
              legendItemsPerRow={this.getItemsPerRow()}
              maxDomain={this.isDatumEmpty(memoryDatum) ? 100 : undefined}
              minDomain={0}
              padding={{
                bottom: 75,
                left: 10,
                right: 50,
                top: 50,
              }}
              primarySegmentedMeasureData={
                memoryDatum.usage.length
                  ? memoryDatum.usage.map(datum => {
                      return {
                        tooltip: datum.tooltip,
                        y: datum.value,
                      };
                    })
                  : []
              }
              primarySegmentedMeasureLegendData={
                memoryDatum.usage.length
                  ? memoryDatum.usage.map(datum => {
                      return {
                        name: datum.legend,
                      };
                    })
                  : []
              }
              qualitativeRangeData={
                memoryDatum.ranges.length
                  ? [
                      {
                        tooltip: memoryDatum.ranges[0].tooltip,
                        y: memoryDatum.ranges[0].value,
                      },
                    ]
                  : []
              }
              qualitativeRangeLegendData={
                memoryDatum.ranges.length
                  ? [{ name: memoryDatum.ranges[0].legend }]
                  : []
              }
              title={t('ocp_details.bullet.memory_label')}
              titlePosition="top-left"
              width={width}
            />
            {Boolean(groupBy === 'cluster') &&
              this.getFreeSpace(memoryReport, 'memory')}
          </>
        )}
      </div>
    );
  };

  private getSkeleton = () => {
    return (
      <>
        <Skeleton
          className={css(styles.chartSkeleton)}
          size={SkeletonSize.md}
        />
        <Skeleton
          className={css(styles.legendSkeleton)}
          size={SkeletonSize.xs}
        />
      </>
    );
  };

  private isDatumEmpty = (datum: ChartDatum) => {
    let hasRange = false;
    for (const range of datum.ranges) {
      if (range.value) {
        hasRange = true;
        break;
      }
    }
    let hasUsage = false;
    for (const usage of datum.usage) {
      if (usage.value) {
        hasUsage = true;
        break;
      }
    }
    return !(datum.limit.value || hasRange || hasUsage);
  };

  public render() {
    return (
      <div ref={this.containerRef}>
        {this.getCpuChart()}
        {this.getMemoryChart()}
      </div>
    );
  }
}

const mapStateToProps = createMapStateToProps<
  DetailsChartOwnProps,
  DetailsChartStateProps
>((state, { groupBy, item }) => {
  const query: OcpQuery = {
    filter: {
      time_scope_units: 'month',
      time_scope_value: -1,
      resolution: 'monthly',
      limit: 3,
    },
    group_by: {
      [groupBy]: item.label || item.id,
    },
  };
  const queryString = getQuery(query);
  const cpuReport = ocpReportsSelectors.selectReport(
    state,
    cpuReportType,
    queryString
  );
  const cpuReportFetchStatus = ocpReportsSelectors.selectReportFetchStatus(
    state,
    cpuReportType,
    queryString
  );
  const memoryReport = ocpReportsSelectors.selectReport(
    state,
    memoryReportType,
    queryString
  );
  const memoryReportFetchStatus = ocpReportsSelectors.selectReportFetchStatus(
    state,
    memoryReportType,
    queryString
  );
  return {
    cpuReport,
    cpuReportFetchStatus,
    memoryReport,
    memoryReportFetchStatus,
    queryString,
  };
});

const mapDispatchToProps: DetailsChartDispatchProps = {
  fetchReport: ocpReportsActions.fetchReport,
};

const DetailsChart = translate()(
  connect(mapStateToProps, mapDispatchToProps)(DetailsChartBase)
);

export { DetailsChart, DetailsChartProps };
