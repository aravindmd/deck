import React from 'react';
import { Overridable } from '@spinnaker/core';
import { ISecurityGroupDetail } from '@spinnaker/core';
import './nflx/additionalIpRules.nflx';

export interface IAdditionalIpRulesProps {
  securityGroupDetails: ISecurityGroupDetail;
}

@Overridable('aws.securityGroup.details.custom')
export class SecurityGroupDetailsCustom extends React.Component<IAdditionalIpRulesProps> {
  public render(): any {
    return null;
  }
}
