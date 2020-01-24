import React from 'react';
import {
  SpinFormik,
  useLatestPromise,
  ReactSelectInput,
  FormikFormField,
  NumberInput,
  Overrides,
  SecurityGroupWriter,
} from '@spinnaker/core';
import { $rootScope } from 'ngimport';
import { Form, FieldArray } from 'formik';
import { IIpObject, IpObjectsReader, IIpObject1 } from './IpObjectsReader';
// @ts-ignore
import { ISecurityGroupDetail, IIPRangeRule } from '../../../../../core/src/securityGroup';
import { uniqWith } from 'lodash';

interface ISecurityGroupDetailNflx extends ISecurityGroupDetail {
  ipObjects1: IIpObject1[];
}

export interface IAdditionalIpRulesProps {
  securityGroupDetails: ISecurityGroupDetailNflx;
  ctrl: any;
  scope: any;
}

function mapToIpObjects(ipRangeRules: IIPRangeRule[]): any {
  let details: any[] = [];
  if (ipRangeRules != null) {
    const nobuDetails = ipRangeRules.filter(function(rangeRule) {
      return rangeRule.description != null;
    });
    details = nobuDetails.map(ipRangeRule => ({
      protocol: ipRangeRule.protocol,
      startPort: ipRangeRule.portRanges[0].startPort,
      endPort: ipRangeRule.portRanges[0].endPort,
      name: ipRangeRule.description.slice(0, 4), // First 4 chars represent IPObject id
    }));
  }
  return uniqWith(details, (ipObjectA: any, ipObjectB: any) => {
    return (
      ipObjectA.name === ipObjectB.name &&
      ipObjectA.startPort === ipObjectB.startPort &&
      ipObjectA.endPort === ipObjectB.endPort &&
      ipObjectA.protocol === ipObjectB.protocol
    );
  });
}

function filterIpRulesFromIpObjects(ipRangeRules: IIPRangeRule[]) {
  let ipIngress: any[] = [];
  if (ipRangeRules != null) {
    const nonIpObjectRules = ipRangeRules.filter(function(rangeRule) {
      return rangeRule.description == undefined;
    });
    ipIngress = nonIpObjectRules.map(ipRangeRule => ({
      type: ipRangeRule.protocol,
      startPort: ipRangeRule.portRanges[0].startPort,
      endPort: ipRangeRule.portRanges[0].endPort,
      cidr: ipRangeRule.range.ip.concat(ipRangeRule.range.cidr),
    }));
  }
  return ipIngress;
}
const protocol = [
  { value: 'tcp', label: 'TCP' },
  { value: 'udp', label: 'UDP' },
  { value: 'icmp', label: 'ICMP' },
];

@Overrides('aws.securityGroup.details.custom')
export class AdditionalIpRules extends React.Component<IAdditionalIpRulesProps> {
  public render() {
    return <IpObjectRulesContent {...this.props} />;
  }
}

export function IpObjectRulesContent(props: IAdditionalIpRulesProps) {
  const securityGroupDetails = props.securityGroupDetails;
  const val: any = mapToIpObjects(securityGroupDetails.inboundRules);

  return (
    <SpinFormik
      initialValues={{
        ipObjects: securityGroupDetails.ipObjects1 || val,
      }}
      onSubmit={() => null}
      render={({ values }) => <IpObjectsForm {...props} values={values} />}
    />
  );
}

export function IpObjectsForm(formProps: IAdditionalIpRulesProps & { values: { ipObjects: IIpObject1[] } }) {
  const { securityGroupDetails, values } = formProps;
  const { result: nobuObjects } = useLatestPromise(() => IpObjectsReader.getIpObjects(), []);
  const $scope = formProps.scope;
  function upsert() {
    const { isNew } = $scope.state;
    const application = $scope.application;
    const group: any = securityGroupDetails;
    const command = {
      credentials: group.accountName,
      name: group.name,
      description: group.description,
      vpcId: group.vpcId,
      securityGroupIngress: group.securityGroupIngress,
      ipObjects: values.ipObjects,
    };

    if (isNew) {
      // create security group modal can create multiple security groups in multiple regions
      (command as any).regions = group.regions;
      (command as any).ipIngress = group.ipIngress;
    } else {
      // edit security group modal edits a single security group in a single region
      (command as any).region = group.region;
      // for edit view filter out the ipIngress from IPObjects since they may change
      (command as any).ipIngress = filterIpRulesFromIpObjects(group.ipRangeRules);
    }
    $scope.taskMonitor.submit(function() {
      return SecurityGroupWriter.upsertSecurityGroup(command, application, isNew ? 'Create' : 'Update');
    });
  }
  formProps.ctrl.upsert = upsert;

  React.useEffect(() => {
    const details: any = securityGroupDetails ?? {};
    details.ipObjects = values.ipObjects;
    $rootScope.$digest();
  }, [securityGroupDetails, values]);

  const options = (nobuObjects || []).map(nobuObj => ({
    value: nobuObj.id,
    label: nobuObj.name,
  }));

  return (
    <Form>
      <FieldArray
        name="ipObjects"
        render={({ remove, push }) => (
          <>
            <table className="table table-condensed packed">
              <thead>
                <tr>
                  <th style={{ width: '50%' }}>IP Object</th>
                  <th style={{ width: '15%' }}>Protocol</th>
                  <th style={{ width: '15%' }}>Start Port</th>
                  <th style={{ width: '15%' }}>End Port</th>
                </tr>
              </thead>
              <tbody>
                {values.ipObjects.map((_, index) => {
                  return (
                    <tr key={`ipObjects.[${index}].name`}>
                      <td>
                        <FormikFormField
                          fastField={false}
                          name={`ipObjects[${index}].name`}
                          input={props => (
                            <ReactSelectInput
                              {...props}
                              clearable={false}
                              placeholder="Select an IP Object"
                              mode="VIRTUALIZED"
                              options={options}
                            />
                          )}
                        />
                      </td>
                      <td>
                        <FormikFormField
                          name={`ipObjects[${index}].protocol`}
                          input={props => {
                            return (
                              <ReactSelectInput
                                {...props}
                                placeholder="Select protocol"
                                clearable={false}
                                options={protocol}
                              />
                            );
                          }}
                        />
                      </td>
                      <td>
                        <FormikFormField
                          name={`ipObjects[${index}].startPort`}
                          input={props => <NumberInput {...props} />}
                        />
                      </td>
                      <td>
                        <FormikFormField
                          name={`ipObjects[${index}].endPort`}
                          input={props => <NumberInput {...props} />}
                        />
                      </td>
                      <div className="col-md-12" style={{ textAlign: 'center', padding: '5px 15px' }}>
                        <button type="button" className="glyphicon glyphicon-trash" onClick={() => remove(index)} />
                      </div>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button
              type="button"
              className="add-new col-md-12"
              onClick={() => push({ name: '', protocol: '', startPort: '', endPort: '' })}
            >
              <span className="glyphicon glyphicon-plus-sign" /> Add new IP object rule
            </button>
          </>
        )}
      />
      <pre>{JSON.stringify(values, null, 2)}</pre>
    </Form>
  );
}
