import axios from 'axios';

import { PagedResponse } from './api';
import { Rate, RateRequest } from './rates';

export interface CostModelProvider {
  name: string;
  uuid: string;
}

export interface CostModel {
  created_timestamp?: Date;
  currency?: string;
  description: string;
  distribution: string;
  markup: { value: string; unit: string };
  name: string;
  rates: Rate[];
  sources?: CostModelProvider[];
  source_type: string;
  updated_timestamp?: Date;
  uuid?: string;
}

export interface CostModelRequest {
  currency?: string;
  description: string;
  distribution: string;
  markup: { value: string; unit: string };
  name: string;
  rates: RateRequest[];
  source_type: string;
  source_uuids: string[];
}

export type CostModels = PagedResponse<CostModel>;

export function fetchCostModels(query = '') {
  return axios.get<CostModels>(`cost-models/${query && '?'}${query}`);
}

export function fetchCostModel(uuid: string) {
  return axios.get<CostModel>(`cost-models/${uuid}/`);
}

export function addCostModel(request: CostModelRequest) {
  return axios.post('cost-models/', request);
}

export function updateCostModel(uuid: string, request: CostModelRequest) {
  return axios.put(`cost-models/${uuid}/`, request);
}

export function deleteCostModel(uuid: string) {
  return axios.delete(`cost-models/${uuid}/`);
}
