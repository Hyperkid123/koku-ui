import { ToolbarChipGroup } from '@patternfly/react-core';
import { AzureQuery, getQuery } from 'api/queries/azureQuery';
import { tagKey } from 'api/queries/query';
import { ResourcePathsType } from 'api/resources/resource';
import { AzureTag } from 'api/tags/azureTags';
import { TagPathsType, TagType } from 'api/tags/tag';
import messages from 'locales/messages';
import { DataToolbar } from 'pages/views/components/dataToolbar/dataToolbar';
import React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';
import { createMapStateToProps, FetchStatus } from 'store/common';
import { tagActions, tagSelectors } from 'store/tags';
import { ComputedReportItem } from 'utils/computedReport/getComputedReportItems';
import { isEqual } from 'utils/equal';

interface DetailsToolbarOwnProps {
  isAllSelected?: boolean;
  isExportDisabled: boolean;
  items?: ComputedReportItem[];
  itemsPerPage?: number;
  itemsTotal?: number;
  groupBy: string;
  onBulkSelected(action: string);
  onExportClicked();
  onFilterAdded(filterType: string, filterValue: string);
  onFilterRemoved(filterType: string, filterValue?: string);
  pagination?: React.ReactNode;
  query?: AzureQuery;
  queryString?: string;
  selectedItems?: ComputedReportItem[];
}

interface DetailsToolbarStateProps {
  tagReport?: AzureTag;
  tagReportFetchStatus?: FetchStatus;
}

interface DetailsToolbarDispatchProps {
  fetchTag?: typeof tagActions.fetchTag;
}

interface DetailsToolbarState {
  categoryOptions?: ToolbarChipGroup[];
}

type DetailsToolbarProps = DetailsToolbarOwnProps &
  DetailsToolbarStateProps &
  DetailsToolbarDispatchProps &
  WrappedComponentProps;

const tagReportType = TagType.tag;
const tagReportPathsType = TagPathsType.azure;

export class DetailsToolbarBase extends React.Component<DetailsToolbarProps> {
  protected defaultState: DetailsToolbarState = {};
  public state: DetailsToolbarState = { ...this.defaultState };

  public componentDidMount() {
    const { fetchTag, queryString, tagReportFetchStatus } = this.props;

    this.setState(
      {
        categoryOptions: this.getCategoryOptions(),
      },
      () => {
        if (tagReportFetchStatus !== FetchStatus.inProgress) {
          fetchTag(tagReportPathsType, tagReportType, queryString);
        }
      }
    );
  }

  public componentDidUpdate(prevProps: DetailsToolbarProps) {
    const { fetchTag, query, queryString, tagReport, tagReportFetchStatus } = this.props;

    if (!isEqual(tagReport, prevProps.tagReport)) {
      this.setState(
        {
          categoryOptions: this.getCategoryOptions(),
        },
        () => {
          if (tagReportFetchStatus !== FetchStatus.inProgress) {
            fetchTag(tagReportPathsType, tagReportType, queryString);
          }
        }
      );
    } else if (query && !isEqual(query, prevProps.query)) {
      if (tagReportFetchStatus !== FetchStatus.inProgress) {
        fetchTag(tagReportPathsType, tagReportType, queryString);
      }
    }
  }

  private getCategoryOptions = (): ToolbarChipGroup[] => {
    const { intl, tagReport } = this.props;

    const options = [
      {
        name: intl.formatMessage(messages.FilterByValues, { value: 'subscription_guid' }),
        key: 'subscription_guid',
      },
      { name: intl.formatMessage(messages.FilterByValues, { value: 'service_name' }), key: 'service_name' },
      {
        name: intl.formatMessage(messages.FilterByValues, { value: 'resource_location' }),
        key: 'resource_location',
      },
    ];

    if (tagReport && tagReport.data && tagReport.data.length) {
      options.push({ name: intl.formatMessage(messages.FilterByValues, { value: tagKey }), key: tagKey });
    }
    return options;
  };

  public render() {
    const {
      groupBy,
      isAllSelected,
      isExportDisabled,
      itemsPerPage,
      itemsTotal,
      onBulkSelected,
      onExportClicked,
      onFilterAdded,
      onFilterRemoved,
      pagination,
      query,
      selectedItems,
      tagReport,
    } = this.props;
    const { categoryOptions } = this.state;

    return (
      <DataToolbar
        categoryOptions={categoryOptions}
        groupBy={groupBy}
        isAllSelected={isAllSelected}
        isExportDisabled={isExportDisabled}
        itemsPerPage={itemsPerPage}
        itemsTotal={itemsTotal}
        onBulkSelected={onBulkSelected}
        onExportClicked={onExportClicked}
        onFilterAdded={onFilterAdded}
        onFilterRemoved={onFilterRemoved}
        pagination={pagination}
        query={query}
        resourcePathsType={ResourcePathsType.azure}
        selectedItems={selectedItems}
        showBulkSelect
        showExport
        showFilter
        tagReport={tagReport}
        tagReportPathsType={tagReportPathsType}
      />
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mapStateToProps = createMapStateToProps<DetailsToolbarOwnProps, DetailsToolbarStateProps>((state, props) => {
  // Omitting key_only to share a single, cached request -- although the header doesn't need key values, the toolbar does
  const queryString = getQuery({
    filter: {
      resolution: 'monthly',
      time_scope_units: 'month',
      time_scope_value: -1,
    },
    key_only: true,
  });
  const tagReport = tagSelectors.selectTag(state, tagReportPathsType, tagReportType, queryString);
  const tagReportFetchStatus = tagSelectors.selectTagFetchStatus(state, tagReportPathsType, tagReportType, queryString);
  return {
    queryString,
    tagReportFetchStatus,
    tagReport,
  };
});

const mapDispatchToProps: DetailsToolbarDispatchProps = {
  fetchTag: tagActions.fetchTag,
};

const DetailsToolbarConnect = connect(mapStateToProps, mapDispatchToProps)(DetailsToolbarBase);
const DetailsToolbar = injectIntl(DetailsToolbarConnect);

export { DetailsToolbar, DetailsToolbarProps };
