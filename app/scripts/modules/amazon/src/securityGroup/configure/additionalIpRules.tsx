import React from 'react';
import {
  ISecurityGroupDetail,
  SpinFormik,
  useLatestPromise,
  ReactSelectInput,
  FormikFormField,
  NumberInput,
} from '@spinnaker/core';
import { Form, FieldArray } from 'formik';
import { IIpObjects, IpObjectsReader } from './IpObjectsReader';

export interface IAdditionalIpRulesProps {
  securityGroupDetails: ISecurityGroupDetail;
  onChange: (value: any) => void;
}

const initialValues = {
  ipObjects: [
    {
      name: '',
      protocol: '',
      startPort: '',
      endPort: '',
    },
  ],
};

const protocol = [
  { value: 'tcp', label: 'TCP' },
  { value: 'udp', label: 'UDP' },
  { value: 'icmp', label: 'ICMP' },
];

export class AdditionalIpRules extends React.Component<IAdditionalIpRulesProps> {
  public render() {
    return <IpObjectRulesContent {...this.props} />;
  }
}

export function IpObjectRulesContent(props: IAdditionalIpRulesProps) {
  return (
    <div>
      <div className="wizard-subheading sticky-header">
        <h4>IP Objects</h4>
      </div>
      <SpinFormik
        initialValues={initialValues}
        onSubmit={values => {
          setTimeout(() => {
            alert(JSON.stringify(values, null, 2));
          }, 500);
        }}
        render={({ values }) => <IpObjectsForm {...props} values={values} />}
      />
    </div>
  );
}

export function IpObjectsForm(props: IAdditionalIpRulesProps & { values: any }) {
  const { onChange, values } = props;

  const { result: nobuObjects } = useLatestPromise(() => IpObjectsReader.getIpObjects(), []);
  React.useEffect(() => {
    onChange(values);
  }, [values]);

  const options = (nobuObjects || []).map((nobuObj: IIpObjects) => ({
    value: nobuObj.id,
    label: nobuObj.name,
  }));

  return (
    <Form>
      <FieldArray
        name="ipObjects"
        render={({ remove, push }) => (
          <div className="col-md-12">
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
                {values.ipObjects.length > 0 &&
                  values.ipObjects.map((ipObject, index) => (
                    <tr key={`ipObjects.[${index}].name`}>
                      <td>
                        <div className="col-md-12" style={{ textAlign: 'center', padding: '5px 5px' }}>
                          <FormikFormField
                            fastField={false}
                            name={`ipObjects[${index}].name`}
                            input={props => {
                              return (
                                <ReactSelectInput
                                  {...props}
                                  placeholder="Select an Object"
                                  inputClassName="form-control input-sm"
                                  mode="VIRTUALIZED"
                                  style={{ width: '250px' }}
                                  options={options}
                                />
                              );
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="col-md-12" style={{ textAlign: 'center', padding: '5px 5px' }}>
                          <FormikFormField
                            fastField={false}
                            name={`ipObjects.[${index}].protocol`}
                            input={props1 => {
                              return (
                                <ReactSelectInput
                                  {...props1}
                                  placeholder="Select protocol"
                                  mode="VIRTUALIZED"
                                  inputClassName="form-control input-sm"
                                  style={{ width: '70px' }}
                                  options={protocol}
                                />
                              );
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="col-md-12" style={{ textAlign: 'center', padding: '5px 5px' }}>
                          <FormikFormField
                            fastField={false}
                            name={`ipObjects.[${index}].startPort`}
                            input={props => {
                              return (
                                <NumberInput {...props} placeholder="7001" inputClassName="form-control input-sm" />
                              );
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="col-md-12" style={{ textAlign: 'center', padding: '5px 5px' }}>
                          <FormikFormField
                            name={`ipObjects.[${index}].endPort`}
                            input={props => {
                              return (
                                <NumberInput {...props} placeholder="7001" inputClassName="form-control input-sm" />
                              );
                            }}
                          />
                        </div>
                      </td>
                      <div className="col-md-12" style={{ textAlign: 'center', padding: '5px 15px' }}>
                        <button type="button" className="glyphicon glyphicon-trash" onClick={() => remove(index)} />
                      </div>
                    </tr>
                  ))}
              </tbody>
            </table>
            <button
              type="button"
              className="add-new col-md-12"
              onClick={() => push({ name: '', protocol: '', startPort: '', endPort: '' })}
            >
              <span className="glyphicon glyphicon-plus-sign" />
              Add new IP object rule
            </button>
          </div>
        )}
      />
      <pre>{JSON.stringify(values, null, 2)}</pre>
    </Form>
  );
}
