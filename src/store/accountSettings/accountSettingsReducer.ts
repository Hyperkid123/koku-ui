import { AccountSettings } from 'api/accountSettings';
import { AxiosError } from 'axios';
import { FetchStatus } from 'store/common';
import { resetState } from 'store/ui/uiActions';
import { ActionType, getType } from 'typesafe-actions';
import {
  invalidateCostType,
  invalidateCurrency,
  isCostTypeAvailable,
  isCurrencyAvailable,
  setAccountCurrency,
  setCostType,
  setCurrency,
} from 'utils/localStorage';

import {
  fetchAccountSettingsFailure,
  fetchAccountSettingsRequest,
  fetchAccountSettingsSuccess,
} from './accountSettingsActions';

export type AccountSettingsState = Readonly<{
  byId: Map<string, AccountSettings>;
  errors: Map<string, AxiosError>;
  fetchStatus: Map<string, FetchStatus>;
}>;

export const defaultState: AccountSettingsState = {
  byId: new Map(),
  errors: new Map(),
  fetchStatus: new Map(),
};

export type AccountSettingsAction = ActionType<
  | typeof fetchAccountSettingsFailure
  | typeof fetchAccountSettingsRequest
  | typeof fetchAccountSettingsSuccess
  | typeof resetState
>;

export function accountSettingsReducer(state = defaultState, action: AccountSettingsAction): AccountSettingsState {
  switch (action.type) {
    case getType(resetState):
      state = defaultState;
      return state;

    case getType(fetchAccountSettingsRequest):
      return {
        ...state,
        fetchStatus: new Map(state.fetchStatus).set(action.payload.reportId, FetchStatus.inProgress),
      };
    case getType(fetchAccountSettingsSuccess):
      initCostType(action.payload.data.cost_type);
      initCurrency(action.payload.data.currency);

      return {
        ...state,
        fetchStatus: new Map(state.fetchStatus).set(action.meta.reportId, FetchStatus.complete),
        byId: new Map(state.byId).set(action.meta.reportId, {
          ...action.payload,
        }),
        errors: new Map(state.errors).set(action.meta.reportId, null),
      };
    case getType(fetchAccountSettingsFailure):
      return {
        ...state,
        fetchStatus: new Map(state.fetchStatus).set(action.meta.reportId, FetchStatus.complete),
        errors: new Map(state.errors).set(action.meta.reportId, action.payload),
      };
    default:
      return state;
  }
}

// Initialize cost type in local storage
function initCostType(value: string) {
  // Clear local storage value if current session is not valid
  invalidateCostType();

  if (!isCostTypeAvailable()) {
    setCostType(value);
  }
}

// Initialize currency in local storage
function initCurrency(value: string) {
  // Clear local storage value if current session is not valid
  invalidateCurrency();

  if (!isCurrencyAvailable()) {
    setCurrency(value);
  }
  setAccountCurrency(value);
}
