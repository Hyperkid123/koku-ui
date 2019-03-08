import { css } from '@patternfly/react-styles';
import { getQuery, OcpQuery, parseQuery } from 'api/ocpQuery';
import { OcpReport, OcpReportType } from 'api/ocpReports';
import { Providers, ProviderType } from 'api/providers';
import { getProvidersQuery } from 'api/providersQuery';
import { AxiosError } from 'axios';
import { ErrorState } from 'components/state/errorState/errorState';
import { LoadingState } from 'components/state/loadingState/loadingState';
import { NoProvidersState } from 'components/state/noProvidersState/noProvidersState';
import React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { createMapStateToProps, FetchStatus } from 'store/common';
import { ocpReportsActions, ocpReportsSelectors } from 'store/ocpReports';
import { ocpProvidersQuery, providersSelectors } from 'store/providers';
import { uiActions } from 'store/ui';
import {
  ComputedOcpReportItem,
  getIdKeyForGroupBy,
  getUnsortedComputedOcpReportItems,
} from 'utils/getComputedOcpReportItems';
import { DetailsHeader } from './detailsHeader';
import { DetailsTable } from './detailsTable';
import { DetailsToolbar } from './detailsToolbar';
import ExportModal from './exportModal';
import { styles, toolbarOverride } from './ocpDetails.styles';

interface OcpDetailsStateProps {
  providers: Providers;
  providersError: AxiosError;
  providersFetchStatus: FetchStatus;
  query: OcpQuery;
  queryString: string;
  report: OcpReport;
  reportFetchStatus: FetchStatus;
}

interface OcpDetailsDispatchProps {
  fetchReport: typeof ocpReportsActions.fetchReport;
  openExportModal: typeof uiActions.openExportModal;
}

interface OcpDetailsState {
  columns: any[];
  rows: any[];
  selectedItems: ComputedOcpReportItem[];
}

type OcpDetailsOwnProps = RouteComponentProps<void> & InjectedTranslateProps;

type OcpDetailsProps = OcpDetailsStateProps &
  OcpDetailsOwnProps &
  OcpDetailsDispatchProps;

const reportType = OcpReportType.cost;

const baseQuery: OcpQuery = {
  delta: 'cost',
  filter: {
    time_scope_units: 'month',
    time_scope_value: -1,
    resolution: 'monthly',
  },
  group_by: {
    project: '*',
  },
  order_by: {
    cost: 'desc',
  },
};

class OcpDetails extends React.Component<OcpDetailsProps> {
  protected defaultState: OcpDetailsState = {
    columns: [],
    rows: [],
    selectedItems: [],
  };
  public state: OcpDetailsState = { ...this.defaultState };

  constructor(stateProps, dispatchProps) {
    super(stateProps, dispatchProps);
    this.handleExportClicked = this.handleExportClicked.bind(this);
    this.handleFilterAdded = this.handleFilterAdded.bind(this);
    this.handleFilterRemoved = this.handleFilterRemoved.bind(this);
    this.handleSelected = this.handleSelected.bind(this);
    this.handleSort = this.handleSort.bind(this);
  }

  public componentDidMount() {
    this.updateReport();
  }

  public componentDidUpdate(
    prevProps: OcpDetailsProps,
    prevState: OcpDetailsState
  ) {
    const { location, report, queryString } = this.props;
    const { selectedItems } = this.state;
    if (
      prevProps.queryString !== queryString ||
      !report ||
      !location.search ||
      prevState.selectedItems !== selectedItems
    ) {
      this.updateReport();
    }
  }

  private getDetailsTable = () => {
    const { query, report } = this.props;

    return (
      <DetailsTable
        onSelected={this.handleSelected}
        onSort={this.handleSort}
        query={query}
        report={report}
      />
    );
  };

  private getExportModal = (computedItems: ComputedOcpReportItem[]) => {
    const { selectedItems } = this.state;
    const { query } = this.props;

    const groupById = getIdKeyForGroupBy(query.group_by);
    const groupByTagKey = this.getGroupByTagKey();

    return (
      <ExportModal
        isAllItems={selectedItems.length === computedItems.length}
        groupBy={groupByTagKey ? `tag:${groupByTagKey}` : groupById}
        items={selectedItems}
        query={query}
      />
    );
  };

  private getFilterFields = (groupById: string): any[] => {
    const { t } = this.props;
    if (groupById === 'cluster') {
      return [
        {
          id: 'cluster',
          title: t('ocp_details.filter.cluster_select'),
          placeholder: t('ocp_details.filter.cluster_placeholder'),
          filterType: 'text',
        },
      ];
    } else if (groupById === 'node') {
      return [
        {
          id: 'node',
          title: t('ocp_details.filter.node_select'),
          placeholder: t('ocp_details.filter.node_placeholder'),
          filterType: 'text',
        },
      ];
    } else if (groupById === 'project') {
      return [
        {
          id: 'project',
          title: t('ocp_details.filter.project_select'),
          placeholder: t('ocp_details.filter.project_placeholder'),
          filterType: 'text',
        },
      ];
    } else {
      // Default for group by project tags
      return [
        {
          id: 'tag',
          title: t('ocp_details.filter.tag_select'),
          placeholder: t('ocp_details.filter.tag_placeholder'),
          filterType: 'text',
        },
      ];
    }
    return [];
  };

  private getGroupByTagKey = () => {
    const { query } = this.props;
    let groupByTagKey;

    for (const groupBy of Object.keys(query.group_by)) {
      const tagIndex = groupBy.indexOf('tag:');
      if (tagIndex !== -1) {
        groupByTagKey = groupBy.substring(tagIndex + 4) as any;
        break;
      }
    }
    return groupByTagKey;
  };

  private getRouteForQuery(query: OcpQuery) {
    return `/ocp?${getQuery(query)}`;
  }

  private getToolbar = (computedItems: ComputedOcpReportItem[]) => {
    const { selectedItems } = this.state;
    const { query, report, t } = this.props;

    const groupById = getIdKeyForGroupBy(query.group_by);
    const groupByTagKey = this.getGroupByTagKey();
    const filterFields = this.getFilterFields(
      groupByTagKey ? 'tag' : groupById
    );

    return (
      <DetailsToolbar
        exportText={t('ocp_details.export_link')}
        filterFields={filterFields}
        isExportDisabled={selectedItems.length === 0}
        onExportClicked={this.handleExportClicked}
        onFilterAdded={this.handleFilterAdded}
        onFilterRemoved={this.handleFilterRemoved}
        report={report}
        resultsTotal={computedItems.length}
        query={query}
      />
    );
  };

  private handleExportClicked = () => {
    this.props.openExportModal();
  };

  private handleFilterAdded = (filterType: string, filterValue: string) => {
    const { history, query } = this.props;
    const newQuery = { ...JSON.parse(JSON.stringify(query)) };

    const groupByTagKey = this.getGroupByTagKey();
    const newFilterType =
      filterType === 'tag' ? `${filterType}:${groupByTagKey}` : filterType;

    if (newQuery.group_by[newFilterType]) {
      if (newQuery.group_by[newFilterType] === '*') {
        newQuery.group_by[newFilterType] = filterValue;
      } else if (!newQuery.group_by[newFilterType].includes(filterValue)) {
        newQuery.group_by[newFilterType] = [
          newQuery.group_by[newFilterType],
          filterValue,
        ];
      }
    } else {
      newQuery.group_by[filterType] = [filterValue];
    }
    const filteredQuery = this.getRouteForQuery(newQuery);
    history.replace(filteredQuery);
  };

  private handleFilterRemoved = (filterType: string, filterValue: string) => {
    const { history, query } = this.props;
    const newQuery = { ...JSON.parse(JSON.stringify(query)) };

    const groupByTagKey = this.getGroupByTagKey();
    const newFilterType =
      filterType === 'tag' ? `${filterType}:${groupByTagKey}` : filterType;

    if (filterValue === '') {
      newQuery.group_by = {
        [newFilterType]: '*',
      };
    } else if (!Array.isArray(newQuery.group_by[newFilterType])) {
      newQuery.group_by[newFilterType] = '*';
    } else {
      const index = newQuery.group_by[newFilterType].indexOf(filterValue);
      if (index > -1) {
        newQuery.group_by[newFilterType] = [
          ...query.group_by[newFilterType].slice(0, index),
          ...query.group_by[newFilterType].slice(index + 1),
        ];
      }
    }
    const filteredQuery = this.getRouteForQuery(newQuery);
    history.replace(filteredQuery);
  };

  private handleGroupByClick = groupBy => {
    const { history, query } = this.props;
    const groupByKey: keyof OcpQuery['group_by'] = groupBy as any;
    const newQuery = {
      ...JSON.parse(JSON.stringify(query)),
      group_by: {
        [groupByKey]: '*',
      },
      order_by: { cost: 'desc' },
    };
    history.replace(this.getRouteForQuery(newQuery));
    this.setState({ selectedItems: [] });
  };

  private handleSelected = (selectedItems: ComputedOcpReportItem[]) => {
    this.setState({ selectedItems });
  };

  private handleSort = (sortType: string, isSortAscending: boolean) => {
    const { history, query } = this.props;
    const newQuery = { ...JSON.parse(JSON.stringify(query)) };
    newQuery.order_by = {};
    newQuery.order_by[sortType] = isSortAscending ? 'asc' : 'desc';
    const filteredQuery = this.getRouteForQuery(newQuery);
    history.replace(filteredQuery);
  };

  private updateReport = () => {
    const { query, location, fetchReport, history, queryString } = this.props;
    if (!location.search) {
      history.replace(
        this.getRouteForQuery({
          group_by: query.group_by,
          order_by: { cost: 'desc' },
        })
      );
    } else {
      fetchReport(reportType, queryString);
    }
  };

  public render() {
    const {
      providers,
      providersError,
      providersFetchStatus,
      query,
      report,
    } = this.props;

    const groupById = getIdKeyForGroupBy(query.group_by);
    const groupByTagKey = this.getGroupByTagKey();

    const computedItems = getUnsortedComputedOcpReportItems({
      report,
      idKey: (groupByTagKey as any) || groupById,
    });

    const isLoading = providersFetchStatus === FetchStatus.inProgress;
    const noProviders =
      providers !== undefined &&
      providers.meta !== undefined &&
      providers.meta.count === 0 &&
      providersFetchStatus === FetchStatus.complete;

    return (
      <div className={css(styles.ocpDetails)}>
        <DetailsHeader onGroupByClicked={this.handleGroupByClick} />
        {Boolean(providersError) ? (
          <ErrorState error={providersError} />
        ) : Boolean(noProviders) ? (
          <NoProvidersState />
        ) : Boolean(isLoading) ? (
          <LoadingState />
        ) : (
          <div className={css(styles.content)}>
            <div className={css(styles.toolbarContainer)}>
              <div className={toolbarOverride}>
                {this.getToolbar(computedItems)}
                {this.getExportModal(computedItems)}
              </div>
            </div>
            <div className={css(styles.tableContainer)}>
              {this.getDetailsTable()}
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = createMapStateToProps<
  OcpDetailsOwnProps,
  OcpDetailsStateProps
>((state, props) => {
  const queryFromRoute = parseQuery<OcpQuery>(location.search);
  const query = {
    delta: 'cost',
    filter: {
      ...baseQuery.filter,
      ...queryFromRoute.filter,
    },
    group_by: queryFromRoute.group_by || baseQuery.group_by,
    order_by: queryFromRoute.order_by || baseQuery.order_by,
  };
  const queryString = getQuery(query);
  const report = ocpReportsSelectors.selectReport(
    state,
    reportType,
    queryString
  );
  const reportFetchStatus = ocpReportsSelectors.selectReportFetchStatus(
    state,
    reportType,
    queryString
  );

  const providersQueryString = getProvidersQuery(ocpProvidersQuery);
  const providers = providersSelectors.selectProviders(
    state,
    ProviderType.ocp,
    providersQueryString
  );
  const providersError = providersSelectors.selectProvidersError(
    state,
    ProviderType.ocp,
    providersQueryString
  );
  const providersFetchStatus = providersSelectors.selectProvidersFetchStatus(
    state,
    ProviderType.ocp,
    providersQueryString
  );

  return {
    providers,
    providersError,
    providersFetchStatus,
    query,
    queryString,
    report,
    reportFetchStatus,
  };
});

const mapDispatchToProps: OcpDetailsDispatchProps = {
  fetchReport: ocpReportsActions.fetchReport,
  openExportModal: uiActions.openExportModal,
};

export default translate()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(OcpDetails)
);
