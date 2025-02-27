import { Title, TitleSizes } from '@patternfly/react-core';
import { Providers, ProviderType } from 'api/providers';
import { getQuery, IbmQuery } from 'api/queries/ibmQuery';
import { getProvidersQuery } from 'api/queries/providersQuery';
import { IbmReport } from 'api/reports/ibmReports';
import { TagPathsType } from 'api/tags/tag';
import { AxiosError } from 'axios';
import { Currency } from 'components/currency';
import { ExportLink } from 'components/export';
import messages from 'locales/messages';
import { GroupBy } from 'pages/views/components/groupBy/groupBy';
import { filterProviders } from 'pages/views/utils/providers';
import React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';
import { createMapStateToProps, FetchStatus } from 'store/common';
import { providersQuery, providersSelectors } from 'store/providers';
import { ComputedIbmReportItemsParams, getIdKeyForGroupBy } from 'utils/computedReport/getComputedIbmReportItems';
import { getSinceDateRangeString } from 'utils/dateRange';
import { isBetaFeature } from 'utils/feature';
import { formatCurrency } from 'utils/format';

import { styles } from './detailsHeader.styles';

interface DetailsHeaderOwnProps {
  groupBy?: string;
  onGroupBySelected(value: string);
  report: IbmReport;
}

interface DetailsHeaderStateProps {
  queryString?: string;
  providers: Providers;
  providersError: AxiosError;
  providersFetchStatus: FetchStatus;
}

type DetailsHeaderProps = DetailsHeaderOwnProps & DetailsHeaderStateProps & WrappedComponentProps;

const baseQuery: IbmQuery = {
  delta: 'cost',
  filter: {
    time_scope_units: 'month',
    time_scope_value: -1,
    resolution: 'monthly',
  },
};

const groupByOptions: {
  label: string;
  value: ComputedIbmReportItemsParams['idKey'];
}[] = [
  { label: 'account', value: 'account' },
  { label: 'project', value: 'project' },
  { label: 'service', value: 'service' },
  { label: 'region', value: 'region' },
];

const tagReportPathsType = TagPathsType.ibm;

class DetailsHeaderBase extends React.Component<DetailsHeaderProps> {
  public render() {
    const { groupBy, onGroupBySelected, providers, providersError, report, intl } = this.props;
    const showContent = report && !providersError && providers && providers.meta && providers.meta.count > 0;

    const hasCost =
      report && report.meta && report.meta.total && report.meta.total.cost && report.meta.total.cost.total;

    return (
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <Title headingLevel="h1" style={styles.title} size={TitleSizes['2xl']}>
            {intl.formatMessage(messages.IBMDetailsTitle)}
          </Title>
          <div style={styles.headerContentRight}>
            {/* Todo: Show in-progress features in beta environment only */}
            {isBetaFeature() && <Currency />}
            {isBetaFeature() && <ExportLink />}
          </div>
        </div>
        <div style={styles.headerContent}>
          <div style={styles.headerContentLeft}>
            <GroupBy
              getIdKeyForGroupBy={getIdKeyForGroupBy}
              groupBy={groupBy}
              isDisabled={!showContent}
              onSelected={onGroupBySelected}
              options={groupByOptions}
              showTags
              tagReportPathsType={tagReportPathsType}
            />
          </div>
          {Boolean(showContent) && (
            <div>
              <Title headingLevel="h2" style={styles.costValue} size={TitleSizes['4xl']}>
                {formatCurrency(
                  hasCost ? report.meta.total.cost.total.value : 0,
                  hasCost ? report.meta.total.cost.total.units : 'USD'
                )}
              </Title>
              <div style={styles.dateTitle}>{getSinceDateRangeString()}</div>
            </div>
          )}
        </div>
      </header>
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mapStateToProps = createMapStateToProps<DetailsHeaderOwnProps, DetailsHeaderStateProps>((state, props) => {
  const queryString = getQuery(baseQuery);

  const providersQueryString = getProvidersQuery(providersQuery);
  const providers = providersSelectors.selectProviders(state, ProviderType.all, providersQueryString);
  const providersError = providersSelectors.selectProvidersError(state, ProviderType.all, providersQueryString);
  const providersFetchStatus = providersSelectors.selectProvidersFetchStatus(
    state,
    ProviderType.all,
    providersQueryString
  );

  return {
    providers: filterProviders(providers, ProviderType.ibm),
    providersError,
    providersFetchStatus,
    queryString,
  };
});

const DetailsHeader = injectIntl(connect(mapStateToProps, {})(DetailsHeaderBase));

export { DetailsHeader, DetailsHeaderProps };
