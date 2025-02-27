import { EmptyState, EmptyStateBody, EmptyStateIcon, Title, TitleSizes } from '@patternfly/react-core';
import { DollarSignIcon } from '@patternfly/react-icons/dist/esm/icons/dollar-sign-icon';
import { CostModel } from 'api/costModels';
import { EmptyFilterState } from 'components/state/emptyFilterState/emptyFilterState';
import messages from 'locales/messages';
import { addMultiValueQuery, removeMultiValueQuery } from 'pages/costModels/components/filterLogic';
import SourcesTable from 'pages/costModels/costModel/sourcesTable';
import React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';
import { createMapStateToProps } from 'store/common';
import { rbacSelectors } from 'store/rbac';

import { SourcesToolbar } from './sourcesToolbar';
import { styles } from './table.styles';

interface Props extends WrappedComponentProps {
  isWritePermission: boolean;
  rows: string[];
  onDelete: (item: any) => void;
  onDeleteText?: string;
  onAdd: () => void;
  current: CostModel;
}

interface PaginationQuery {
  page: number;
  perPage: number;
}

interface State {
  query: { name: string[] };
  currentFilter: string;
  filter: string;
  pagination: PaginationQuery;
}

class TableBase extends React.Component<Props, State> {
  public state = {
    query: { name: [] },
    currentFilter: '',
    filter: '',
    pagination: { page: 1, perPage: 10 },
  };
  public render() {
    const {
      pagination: { page, perPage },
    } = this.state;

    const { current, intl, isWritePermission, onAdd, rows } = this.props;

    const filteredRows = rows
      .filter(uuid => {
        if (!this.state.query.name) {
          return true;
        }
        return this.state.query.name.every(fName => uuid.includes(fName));
      })
      .map(uuid => [uuid]);
    const res = filteredRows.slice((page - 1) * perPage, page * perPage);

    // Note: Removed pagination props because the /cost-models/{cost_model_uuid}/ API does not support pagination
    // See https://issues.redhat.com/browse/COST-2097
    return (
      <>
        <Title headingLevel="h2" size={TitleSizes.md} style={styles.sourceTypeTitle}>
          {intl.formatMessage(messages.CostModelsSourceType)}: {current.source_type}
        </Title>
        <SourcesToolbar
          actionButtonProps={{
            isDisabled: !isWritePermission,
            onClick: onAdd,
            children: intl.formatMessage(messages.CostModelsAssignSources, { count: 1 }),
          }}
          filter={{
            onClearAll: () =>
              this.setState({
                pagination: { ...this.state.pagination, page: 1 },
                query: { name: [] },
              }),
            onRemove: (_category, chip) => {
              this.setState({
                pagination: { ...this.state.pagination, page: 1 },
                query: removeMultiValueQuery(this.state.query)('name', chip),
              });
            },
            query: this.state.query,
            categoryNames: { name: intl.formatMessage(messages.Names, { count: 1 }) },
          }}
          filterInputProps={{
            id: 'sources-tab-toolbar',
            onChange: (value: string) =>
              this.setState({
                currentFilter: value,
              }),
            onSearch: () => {
              this.setState({
                query: addMultiValueQuery(this.state.query)('name', this.state.currentFilter),
                currentFilter: '',
                filter: this.state.currentFilter,
                pagination: { ...this.state.pagination, page: 1 },
              });
            },
            value: this.state.currentFilter,
            placeholder: intl.formatMessage(messages.CostModelsFilterPlaceholder),
          }}
        />
        {res.length > 0 && (
          <SourcesTable
            showDeleteDialog={(rowId: number) => {
              this.props.onDelete(res[rowId]);
            }}
          />
        )}
        {rows.length === 0 && (
          <div style={styles.emptyState}>
            <EmptyState>
              <EmptyStateIcon icon={DollarSignIcon} />
              <Title headingLevel="h2" size={TitleSizes.lg}>
                {intl.formatMessage(messages.CostModelsSourceEmptyStateDesc)}
              </Title>
              <EmptyStateBody>{intl.formatMessage(messages.CostModelsSourceEmptyStateTitle)}</EmptyStateBody>
            </EmptyState>
          </div>
        )}
        {filteredRows.length === 0 && rows.length > 0 && (
          <EmptyFilterState filter={this.state.filter} subTitle={messages.EmptyFilterSourceStateSubtitle} />
        )}
      </>
    );
  }
}

export default injectIntl(
  connect(
    createMapStateToProps(state => ({
      isWritePermission: rbacSelectors.isCostModelWritePermission(state),
    }))
  )(TableBase)
);
