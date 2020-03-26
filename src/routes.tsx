import { MoneyBillIcon, TachometerAltIcon } from '@patternfly/react-icons';
import React from 'react';
import { Redirect, Route, RouteProps, Switch } from 'react-router-dom';
import { asyncComponent } from './utils/asyncComponent';

const NotFound = asyncComponent(() =>
  import(/* webpackChunkName: "notFound" */ './pages/notFound')
);

const AwsDetails = asyncComponent(() =>
  import(/* webpackChunkName: "aws" */ './pages/details/awsDetails')
);

const AzureDetails = asyncComponent(() =>
  import(/* webpackChunkName: "azure" */ './pages/details/azureDetails')
);

const OcpDetails = asyncComponent(() =>
  import(/* webpackChunkName: "ocp" */ './pages/details/ocpDetails')
);

const OcpCloudDetails = asyncComponent(() =>
  import(/* webpackChunkName: "ocp-cloud" */ './pages/details/ocpCloudDetails')
);

const Overview = asyncComponent(() =>
  import(/* webpackChunkName: "home" */ './pages/overview')
);

const CostModelsDetails = asyncComponent(() =>
  import(
    /* webpackChunkName: "cost-models" */ './pages/costModels/costModelsDetails'
  )
);

export interface AppRoute extends RouteProps {
  labelKey: string;
  icon: any;
}

const routes: AppRoute[] = [
  // Todo: remove old paths per https://github.com/project-koku/koku-ui/issues/1389
  {
    path: '/aws',
    labelKey: 'navigation.aws_details',
    component: AwsDetails,
    exact: true,
    icon: MoneyBillIcon,
  },
  {
    path: '/azure',
    labelKey: 'navigation.azure_details',
    component: AzureDetails,
    exact: true,
    icon: MoneyBillIcon,
  },
  {
    path: '/ocp',
    labelKey: 'navigation.ocp_details',
    component: OcpDetails,
    exact: true,
    icon: MoneyBillIcon,
  },
  {
    path: '/ocp-cloud',
    labelKey: 'navigation.ocp_cloud_details',
    component: OcpCloudDetails,
    exact: true,
    icon: MoneyBillIcon,
  },
  // New paths per https://github.com/project-koku/koku-ui/issues/1389
  {
    path: '/',
    labelKey: 'navigation.overview',
    component: Overview,
    exact: true,
    icon: TachometerAltIcon,
  },
  {
    path: '/details/infrastructure/aws',
    labelKey: 'navigation.aws_details',
    component: AwsDetails,
    exact: true,
    icon: MoneyBillIcon,
  },
  {
    path: '/details/infrastructure/azure',
    labelKey: 'navigation.azure_details',
    component: AzureDetails,
    exact: true,
    icon: MoneyBillIcon,
  },
  {
    path: '/details/infrastructure/ocp-cloud',
    labelKey: 'navigation.ocp_cloud_details',
    component: OcpCloudDetails,
    exact: true,
    icon: MoneyBillIcon,
  },
  {
    path: '/details/ocp',
    labelKey: 'navigation.ocp_details',
    component: OcpDetails,
    exact: true,
    icon: MoneyBillIcon,
  },
  {
    path: '/cost-models',
    labelKey: 'navigation.cost_models',
    component: CostModelsDetails,
    exact: true,
    icon: MoneyBillIcon,
  },
];

const Routes = () => (
  <Switch>
    {routes.map(route => (
      <Route key={route.path as any} {...route} />
    ))}
    <Redirect
      exact
      from="/details/infrastructure"
      to="/details/infrastructure/aws"
    />
    <Route component={NotFound} />
  </Switch>
);

export { Routes, routes };
