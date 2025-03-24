import { FC } from 'react';
import cn from 'classnames';

interface IQueryRuleProps {
  labelSelect: any;
  operator: any;
  updateLabel: (event: any, ruleIndex: any, groupIndex: any) => void;
  properties: any;
  ruleIndex: any;
  groupIndex: any;
  selectedOperators: any;
  updateOperator: (event: any, ruleIndex: any, groupIndex: any) => void;
  inputRefs: any;
  inputValues: any;
  updateInput: (event: any, ruleIndex: any, groupIndex: any) => void;
  allProperties: any;
  selectedRelatedLabels: any;
  selectedLabels: any;
  setRelatedAttributes: (att: any) => void;
  updateRelatedLabel: (v: string, ruleIndex: number, groupIndex: number) => void;
  relatedAttributes: any;
}

const NewRule: FC<IQueryRuleProps> = ({
  labelSelect,
  operator,
  updateLabel,
  properties,
  ruleIndex,
  groupIndex,
  selectedOperators,
  updateOperator,
  inputRefs,
  inputValues,
  updateInput,
  allProperties,
  selectedRelatedLabels,
  selectedLabels,
  setRelatedAttributes,
  updateRelatedLabel,
  relatedAttributes,
}) => {
  const selectedKey =
    selectedRelatedLabels?.[groupIndex]?.[ruleIndex] !== undefined
      ? selectedRelatedLabels[groupIndex][ruleIndex]
      : selectedLabels?.[groupIndex]?.[ruleIndex];

  const selectedProperty: any = selectedKey
    ? allProperties.find((prop: any) => prop.name === selectedKey)
    : null;

  //get related attributes of the selected related attribute..
  const handlePropertyChange = (v: any, ruleIndex: number, groupIndex: number) => {
    const selectedAttribute = properties.find(
      (attribute: any) => attribute.name === v.target.value,
    );
    if (selectedAttribute && selectedAttribute.isRelated) {
      const relatedEntityAttributes = allProperties
        .filter(
          (attr: any) =>
            attr.name.startsWith(selectedAttribute.name + '.') &&
            attr.name !== selectedAttribute.name,
        )
        .map((attr: any) => ({
          name: attr.name,
          type: attr.type,
          kind: attr.kind,
          isRelated: attr.isRelated,
          isString: attr.isString,
          isNumber: attr.isNumber,
          isDate: attr.isDate,
          isBoolean: attr.isBoolean,
        }));

      setRelatedAttributes((prev: any) => {
        const updated = [...prev];
        updated[groupIndex] = updated[groupIndex] || [];
        updated[groupIndex][ruleIndex] = relatedEntityAttributes;
        return updated;
      });
    }
  };

  return (
    <div className={cn('builder-new-rule', 'w-full h-fit flex flex-row p-2 gap-6')}>
      {/* first select will all the attributes without recursion ..*/}
      <select
        className="builder-input p-2 h-10 rounded-md grow"
        ref={labelSelect}
        value={selectedLabels?.[groupIndex]?.[ruleIndex]}
        onChange={(v) => {
          updateLabel(v.target.value, ruleIndex, groupIndex);
          handlePropertyChange(v, ruleIndex, groupIndex);
        }}
      >
        <option value="" disabled selected>
          Select a property
        </option>
        {properties.map((attribute: any) => (
          <option value={attribute.name}>{attribute.name}</option>
        ))}
      </select>
      {/* get all properties of the related attribute */}
      {(selectedProperty?.isRelated || selectedProperty?.name?.includes('.')) && (
        <select
          className="builder-input p-2 h-10 rounded-md grow"
          ref={labelSelect}
          value={selectedRelatedLabels?.[groupIndex]?.[ruleIndex]}
          onChange={(v) => {
            updateRelatedLabel(v.target.value, ruleIndex, groupIndex);
            handlePropertyChange(v, ruleIndex, groupIndex);
          }}
        >
          <option value="" disabled selected>
            Select a related property
          </option>
          {(relatedAttributes[groupIndex]?.[ruleIndex]).map((attr: any) => {
            //removing the prefix process
            const baseName = attr.name.split('.').shift()
              ? attr.name.replace(new RegExp(`^${attr.name.split('.').shift()}\.`), '')
              : attr.name;
            return (
              <option key={attr.name} value={attr.name}>
                {baseName}
              </option>
            );
          })}
        </select>
      )}
      {/* {* handle each type operators */}
      {/* no property selected */}
      {!selectedProperty && (
        <select className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow')}>
          <option value="" disabled selected>
            Operator
          </option>
        </select>
      )}
      {/* image case */}
      {selectedProperty?.isImage && (
        <select
          className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow')}
          ref={operator}
          value={selectedOperators[groupIndex][ruleIndex]}
          onChange={(v) => {
            updateOperator(v.target.value, ruleIndex, groupIndex);
          }}
        >
          <option value="" disabled selected>
            Operator
          </option>
          <option value="is null">Is null</option>
          <option value="is not null">is not null</option>
        </select>
      )}
      {/* string case */}
      {selectedProperty?.isString && (
        <select
          className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow')}
          ref={operator}
          value={selectedOperators[groupIndex][ruleIndex]}
          onChange={(v) => {
            updateOperator(v.target.value, ruleIndex, groupIndex);
          }}
        >
          <option value="" disabled selected>
            Operator
          </option>
          <option value="=">=</option>
          <option value="!=">!=</option>
          <option value="contains">contains</option>
          <option value="begin">Starts with</option>
          <option value="end">Ends with</option>
          <option value="is null">is null</option>
          <option value="is not null">is not null</option>
        </select>
      )}
      {/* number case */}
      {selectedProperty?.isNumber && (
        <select
          className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow')}
          ref={operator}
          value={selectedOperators[groupIndex][ruleIndex]}
          onChange={(v) => {
            updateOperator(v.target.value, ruleIndex, groupIndex);
          }}
        >
          <option value="" disabled selected>
            Operator
          </option>
          <option value="=">=</option>
          <option value="!=">!=</option>
          <option value="&lt;">&lt;</option>
          <option value="&gt;">&gt;</option>
          <option value="&lt;=">&lt;=</option>
          <option value="&gt;=">&gt;=</option>
        </select>
      )}
      {/* date case */}
      {(selectedProperty?.isDate || selectedProperty?.isDuration) && (
        <select
          className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow')}
          ref={operator}
          value={selectedOperators[groupIndex][ruleIndex]}
          onChange={(v) => {
            updateOperator(v.target.value, ruleIndex, groupIndex);
          }}
        >
          <option value="" disabled selected>
            Operator
          </option>
          <option value="=">=</option>
          <option value="!=">!=</option>
          <option value="&lt;">&lt;</option>
          <option value="&gt;">&gt;</option>
          <option value="between">between</option>
          <option value="is null">is null</option>
          <option value="is not null">is not null</option>
        </select>
      )}
      {/* boolean case */}
      {selectedProperty?.isBoolean && (
        <select
          className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow')}
          ref={operator}
          value={selectedOperators[groupIndex][ruleIndex]}
          onChange={(v) => {
            updateOperator(v.target.value, ruleIndex, groupIndex);
          }}
        >
          <option value="" disabled selected>
            Operator
          </option>
          <option value="is true">is true</option>
          <option value="is false">is false</option>
          <option value="is null">is null</option>
        </select>
      )}
      {/* handle each type inputs */}
      {/* no property selected */}
      {!selectedProperty &&
        selectedOperators[groupIndex][ruleIndex] !== 'is null' &&
        selectedOperators[groupIndex][ruleIndex] !== 'is not null' && (
          <input
            type="text"
            placeholder="Value"
            className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow')}
          />
        )}
      {/* date input */}
      {selectedProperty?.isDate &&
        selectedOperators[groupIndex][ruleIndex] !== 'is null' &&
        selectedOperators[groupIndex][ruleIndex] !== 'is not null' && (
          <>
            <input
              type="date"
              placeholder="Value"
              ref={(input) => {
                if (!inputRefs.current[groupIndex]) {
                  inputRefs.current[groupIndex] = {};
                }
                if (!inputRefs.current[groupIndex][ruleIndex]) {
                  inputRefs.current[groupIndex][ruleIndex] = [];
                }
                inputRefs.current[groupIndex][ruleIndex][0] = input; // Store first date input
              }}
              className="builder-input bg-white p-2 h-10 rounded-md grow"
              value={inputValues[groupIndex][ruleIndex]?.[0] || ''}
              onChange={(v) => {
                updateInput(
                  [v.target.value, inputValues[groupIndex][ruleIndex]?.[1] || ''],
                  ruleIndex,
                  groupIndex,
                );
              }}
            />
            {selectedOperators[groupIndex][ruleIndex] === 'between' && (
              <input
                type="date"
                placeholder="Value"
                ref={(input) => {
                  if (!inputRefs.current[groupIndex]) {
                    inputRefs.current[groupIndex] = {};
                  }
                  if (!inputRefs.current[groupIndex][ruleIndex]) {
                    inputRefs.current[groupIndex][ruleIndex] = [];
                  }
                  inputRefs.current[groupIndex][ruleIndex][1] = input; // Store second date input
                }}
                className="builder-input bg-white p-2 h-10 rounded-md grow"
                value={inputValues[groupIndex][ruleIndex]?.[1] || ''}
                onChange={(v) => {
                  updateInput(
                    [inputValues[groupIndex][ruleIndex]?.[0] || '', v.target.value],
                    ruleIndex,
                    groupIndex,
                  );
                }}
              />
            )}
          </>
        )}
      {/* duration input */}
      {selectedProperty?.isDuration &&
        selectedOperators[groupIndex][ruleIndex] !== 'is null' &&
        selectedOperators[groupIndex][ruleIndex] !== 'is not null' && (
          <input
            type="time"
            step="60"
            placeholder="Value"
            ref={(input) => {
              if (!inputRefs.current[groupIndex]) {
                inputRefs.current[groupIndex] = {};
              }
              inputRefs.current[groupIndex][ruleIndex] = input;
            }}
            className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow')}
            value={inputValues[groupIndex][ruleIndex]}
            onChange={(v) => {
              updateInput(v.target.value, ruleIndex, groupIndex);
            }}
          ></input>
        )}
      {/* number input */}
      {selectedProperty?.isNumber &&
        selectedOperators[groupIndex][ruleIndex] !== 'is null' &&
        selectedOperators[groupIndex][ruleIndex] !== 'is not null' && (
          <input
            type="number"
            placeholder="Value"
            ref={(input) => {
              if (!inputRefs.current[groupIndex]) {
                inputRefs.current[groupIndex] = {};
              }
              inputRefs.current[groupIndex][ruleIndex] = input;
            }}
            className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow')}
            value={inputValues[groupIndex][ruleIndex]}
            onChange={(v) => {
              updateInput(v.target.value, ruleIndex, groupIndex);
            }}
          ></input>
        )}
      {/* string input */}
      {selectedProperty?.isString &&
        selectedOperators[groupIndex][ruleIndex] !== 'is null' &&
        selectedOperators[groupIndex][ruleIndex] !== 'is not null' && (
          <input
            type="text"
            placeholder="Value"
            ref={(input) => {
              if (!inputRefs.current[groupIndex]) {
                inputRefs.current[groupIndex] = {};
              }
              inputRefs.current[groupIndex][ruleIndex] = input;
            }}
            className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow')}
            value={inputValues[groupIndex][ruleIndex]}
            onChange={(v) => {
              updateInput(v.target.value, ruleIndex, groupIndex);
            }}
          ></input>
        )}
    </div>
  );
};

export default NewRule;
