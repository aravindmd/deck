import React from 'react';
import {
  ISecurityGroupDetail,
  SpinFormik,
  useLatestPromise,
  ReactSelectInput,
  FormikFormField,
  NumberInput,
  Overrides,
} from '@spinnaker/core';
import { $rootScope } from 'ngimport';
import { Form, FieldArray } from 'formik';
import { IIpObject, IpObjectsReader } from './IpObjectsReader';

interface ISecurityGroupDetailNflx extends ISecurityGroupDetail {
  ipObjects: IIpObject[];
}

export interface IAdditionalIpRulesProps {
  securityGroupDetails: ISecurityGroupDetailNflx;
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
  return (
    <SpinFormik
      initialValues={{ ipObjects: securityGroupDetails.ipObjects || [] }}
      onSubmit={() => null}
      render={({ values }) => <IpObjectsForm {...props} values={values} />}
    />
  );
}

export function IpObjectsForm(formProps: IAdditionalIpRulesProps & { values: { ipObjects: IIpObject[] } }) {
  const { securityGroupDetails, values } = formProps;
  const { result: nobuObjects } = useLatestPromise(() => IpObjectsReader.getIpObjects(), []);
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
            <FieldArray
              name="ipObjects"
              render={({ remove, push, name }) =>
                values.ipObjects.map((_, index) => {
                  return (
                    <tr key={name}>
                      <td>
                        <FormikFormField
                          fastField={false}
                          name={`${name}.name`}
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
                          name={`${name}.type`}
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
                        <FormikFormField name={`${name}.startPort`} input={props => <NumberInput {...props} />} />
                      </td>
                      <td>
                        <FormikFormField name={`${name}.endPort`} input={props => <NumberInput {...props} />} />
                      </td>
                      <div className="col-md-12" style={{ textAlign: 'center', padding: '5px 15px' }}>
                        <button type="button" className="glyphicon glyphicon-trash" onClick={() => remove(index)} />
                      </div>
                    </tr>
                  );
                })
              }
            />
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
      )} />
      <pre>{JSON.stringify(values, null, 2)}</pre>
    </Form>
  );
}
