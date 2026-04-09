import { FC, useEffect, useState } from 'react';
import cn from 'classnames';
import { useI18n, useLocalization } from '@ws-ui/webform-editor';
import { get } from 'lodash';

interface IQueryRuleProps {
  defaultInput: any;
  labelSelect: any;
  operator: any;
  properties: any;
  ruleIndex: any;
  groupIndex: any;
  selectedOperators: any;
  inputRefs: any;
  inputValues: any;
  allProperties: any;
  selectedRelatedLabels: any;
  selectedLabels: any;
  setRelatedAttributes: (att: any) => void;
  relatedAttributes: any;
  isCleared: boolean;
  setIsCleared: (v: boolean) => void;
  setInputValues: (v: any) => void;
  setSelectedLabels: (v: any) => void;
  setSelectedRelatedLabels: (v: any) => void;
  setFinalLabels: (v: any) => void;
  setSelectedOperators: (v: any) => void;
}

const NewRule: FC<IQueryRuleProps> = ({
  defaultInput,
  labelSelect,
  operator,
  properties,
  ruleIndex,
  groupIndex,
  selectedOperators,
  inputRefs,
  inputValues,
  allProperties,
  selectedRelatedLabels,
  selectedLabels,
  setRelatedAttributes,
  relatedAttributes,
  isCleared,
  setIsCleared,
  setInputValues,
  setSelectedLabels,
  setSelectedRelatedLabels,
  setFinalLabels,
  setSelectedOperators,
}) => {
  const { i18n } = useI18n();
  const { selected: lang } = useLocalization();

  const translation = (key: string): string => {
    const formattedKey = key.replace(/\s+/g, "_");
    return get(
      i18n,
      `keys.queryBuilder_${formattedKey}.${lang}`,
      get(i18n, `keys.queryBuilder_${formattedKey}.default`, key)
    );
  };

  const [property, setProperty] = useState<any>(); //if default exists else selected one setup
  const selectedKey =
    selectedRelatedLabels?.[groupIndex]?.[ruleIndex] !== undefined
      ? selectedRelatedLabels[groupIndex][ruleIndex]
      : selectedLabels?.[groupIndex]?.[ruleIndex];

  const selectedProperty: any = selectedKey
    ? allProperties.find((prop: any) => prop.name === selectedKey)
    : null;

  useEffect(() => {
    if (selectedProperty) {
      setProperty(selectedProperty);
      return;
    }
    if (defaultInput) {
      const parts = defaultInput.source.split('.'); //case if relatedpath exists in dataAttributes ..
      const selectedKeyFromInput = parts[0];
      const relatedPropertyFromInput = parts.slice(1).join('.');
      const propertyFromInput = allProperties.find(
        (prop: any) => prop.name === selectedKeyFromInput,
      );
      //setting the first select
      if (propertyFromInput) {
        setProperty(propertyFromInput);
        updateLabel(selectedKeyFromInput, ruleIndex, groupIndex);
        if (propertyFromInput.isRelated) {
          handlePropertyChange({ target: { value: selectedKeyFromInput } }, ruleIndex, groupIndex);
        }
        // If there's a related property, set it in the second select
        if (relatedPropertyFromInput) {
          updateRelatedLabel(
            selectedKeyFromInput + '.' + relatedPropertyFromInput,
            ruleIndex,
            groupIndex,
          );
        }
      }
    }
  }, [defaultInput, selectedProperty]);

  useEffect(() => {
    if (isCleared) {
      setProperty(null);
    }
    setIsCleared(false);
  }, [isCleared]);

  //get related attributes of the selected related attribute..
  const handlePropertyChange = (v: any, ruleIndex: number, groupIndex: number) => {
    const selectedAttribute = properties.find(
      (attribute: any) => attribute.name === v.target.value,
    );
    if (!selectedAttribute) return;
    if (selectedAttribute.isRelated) {
      const relatedEntityAttributes = allProperties
        .filter(
          (attr: any) =>
            attr.name.startsWith(selectedAttribute.name + '.') &&
            attr.name !== selectedAttribute.name &&
            !attr.isRelated,
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
      setProperty(selectedAttribute);
      return;
    }
    // Non related
    setRelatedAttributes((prev: any) => {
      const updated = [...prev];
      updated[groupIndex] = updated[groupIndex] || [];
      updated[groupIndex][ruleIndex] = [];
      return updated;
    });
    setProperty(selectedAttribute);
    updateLabel(selectedAttribute.name, ruleIndex, groupIndex);
    updateRelatedLabel('', ruleIndex, groupIndex);
    updateOperator('', ruleIndex, groupIndex);
    updateInput('', ruleIndex, groupIndex);
  };


  const updateInput = (v: any, ruleIndex: number, groupIndex: number) => {
    setInputValues((prevValues: any) => {
      const updatedValues = [...prevValues];
      updatedValues[groupIndex] = [...(updatedValues[groupIndex] || [])];
      v === ''
        ? updatedValues[groupIndex].splice(ruleIndex, 1)
        : (updatedValues[groupIndex][ruleIndex] = v);
      return updatedValues;
    });
  };

  const updateLabel = (v: any, ruleIndex: number, groupIndex: number) => {
    setSelectedLabels((prev: any) =>
      prev.map((group: any, gIndex: number) => {
        if (gIndex !== groupIndex) return group;

        const updatedGroup = [...(group || [])];
        updatedGroup[ruleIndex] = v;
        return updatedGroup;
      })
    );
  };

  const updateRelatedLabel = (v: string, ruleIndex: number, groupIndex: number) => {
    setSelectedRelatedLabels((prev: any) => {
      const updatedRelatedLabels = [...prev];
      if (!updatedRelatedLabels[groupIndex]) {
        updatedRelatedLabels[groupIndex] = [];
      }
      v === ''
        ? updatedRelatedLabels[groupIndex].splice(ruleIndex, 1)
        : (updatedRelatedLabels[groupIndex][ruleIndex] = v);
      return updatedRelatedLabels;
    });
  };

  const updateOperator = (v: string, ruleIndex: number, groupIndex: number) => {
    setSelectedOperators((prev: any) =>
      prev.map((group: any, gIndex: number) => {
        if (gIndex !== groupIndex) return group;

        const updatedGroup = [...(group || [])];
        if (v === '') {
          updatedGroup.splice(ruleIndex, 1);
        } else {
          updatedGroup[ruleIndex] = v;
        }

        return updatedGroup;
      })
    );
  };

  useEffect(() => {
    updateFinalLabels(selectedLabels, selectedRelatedLabels);
  }, [selectedLabels, selectedRelatedLabels]);

  //final labels(storage and related by rule)
  const updateFinalLabels = (updatedLabels: string[][], updatedRelatedLabels: string[][]) => {
    const updatedFinalLabels = updatedLabels.map((groupLabels, groupIndex) => {
      return groupLabels.map((label, ruleIndex) => {
        const relatedLabel = updatedRelatedLabels[groupIndex]?.[ruleIndex];
        return relatedLabel ? relatedLabel : label;
      });
    });
    setFinalLabels(updatedFinalLabels);
  };

  return (
    <div className={cn('builder-new-rule', 'w-full h-fit flex flex-row p-2 gap-6')}>
      {/* first select will all the attributes without recursion ..*/}
      <select
        className="builder-input p-2 h-10 rounded-md grow w-1/4"
        ref={labelSelect}
        value={selectedLabels?.[groupIndex]?.[ruleIndex] ?? ''}
        onChange={(v) => {
          updateLabel(v.target.value, ruleIndex, groupIndex);
          handlePropertyChange(v, ruleIndex, groupIndex);
        }}
      >
        <option value="" disabled>
          {translation("Select a property")}
        </option>
        {properties.map((attribute: any) => (
          <option value={attribute.name}>{translation(attribute.name)}</option>
        ))}
      </select>
      {/* get all properties of the related attribute */}
      {(property?.isRelated || property?.name?.includes('.')) &&
        relatedAttributes?.[groupIndex]?.[ruleIndex].length > 0 && (
          <select
            className="builder-input p-2 h-10 rounded-md grow w-1/4"
            ref={labelSelect}
            value={selectedRelatedLabels?.[groupIndex]?.[ruleIndex] ?? ''}
            onChange={(v) => {
              updateRelatedLabel(v.target.value, ruleIndex, groupIndex);
              handlePropertyChange(v, ruleIndex, groupIndex);
            }}
          >
            <option value="" disabled>
              {translation("Select a related property")}
            </option>
            {Array.isArray(relatedAttributes[groupIndex]?.[ruleIndex]) &&
              (relatedAttributes[groupIndex]?.[ruleIndex]).map((attr: any) => {
                //removing the prefix process
                const baseName = attr.name.split('.').shift()
                  ? attr.name.replace(new RegExp(`^${attr.name.split('.').shift()}\.`), '')
                  : attr.name;
                return (
                  <option key={attr.name} value={attr.name}>
                    {translation(baseName)}
                  </option>
                );
              })}
          </select>
        )}
      {/* {* handle each type operators */}
      {/* no property selected */}
      {!property && (
        <select className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow w-1/4')}>
          <option value="" disabled>
            {translation("Operator")}
          </option>
        </select>
      )}
      {/* image case */}
      {property?.isImage && (
        <select
          className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow w-1/4')}
          ref={operator}
          value={selectedOperators[groupIndex][ruleIndex] ?? ''}
          onChange={(v) => {
            updateOperator(v.target.value, ruleIndex, groupIndex);
          }}
        >
          <option value="" disabled >
            {translation("Operator")}
          </option>
          <option value="is null">{translation("Is null")}</option>
          <option value="is not null">{translation("is not null")}</option>
        </select>
      )}
      {/* string case */}
      {property?.isString && (
        <select
          className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow w-1/4')}
          ref={operator}
          value={selectedOperators[groupIndex][ruleIndex] ?? ''}
          onChange={(v) => {
            updateOperator(v.target.value, ruleIndex, groupIndex);
          }}
        >
          <option value="" disabled>
            {translation("Operator")}
          </option>
          <option value="=">=</option>
          <option value="!=">!=</option>
          <option value="contains">{translation("contains")}</option>
          <option value="begin">{translation("Starts with")}</option>
          <option value="end">{translation("Ends with")}</option>
          <option value="is null">{translation("is null")}</option>
          <option value="is not null">{translation("is not null")}</option>
        </select>
      )}
      {/* number case */}
      {property?.isNumber && (
        <select
          className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow w-1/4')}
          ref={operator}
          value={selectedOperators[groupIndex][ruleIndex] ?? ''}
          onChange={(v) => {
            updateOperator(v.target.value, ruleIndex, groupIndex);
          }}
        >
          <option value="" disabled>
            {translation("Operator")}
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
      {(property?.isDate || property?.isDuration) && (
        <select
          className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow w-1/4')}
          ref={operator}
          value={selectedOperators[groupIndex][ruleIndex] ?? ''}
          onChange={(v) => {
            updateOperator(v.target.value, ruleIndex, groupIndex);
          }}
        >
          <option value="" disabled>
            {translation("Operator")}
          </option>
          <option value="=">=</option>
          <option value="!=">!=</option>
          <option value="&lt;">&lt;</option>
          <option value=">;=">&lt;=</option>
          <option value="&gt;">&gt;</option>
          <option value="<=">&gt;=</option>
          <option value="between">{translation("between")}</option>
          <option value="is null">{translation("is null")}</option>
          <option value="is not null">{translation("is not null")}</option>
        </select>
      )}
      {/* boolean case */}
      {property?.isBoolean && (
        <select
          className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow w-1/4')}
          ref={operator}
          value={selectedOperators[groupIndex][ruleIndex] ?? ''}
          onChange={(v) => {
            updateOperator(v.target.value, ruleIndex, groupIndex);
          }}
        >
          <option value="" disabled>
            {translation("Operator")}
          </option>
          <option value="is true">{translation("is true")}</option>
          <option value="is false">{translation("is false")}</option>
          <option value="is null">{translation("is null")}</option>
        </select>
      )}
      {/* handle each type inputs */}
      {/* no property selected */}
      {!property &&
        selectedOperators[groupIndex][ruleIndex] !== 'is null' &&
        selectedOperators[groupIndex][ruleIndex] !== 'is not null' && (
          <input
            type="text"
            placeholder={translation("Value")}
            readOnly
            className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow w-1/4')}
          />
        )}
      {/* date input */}
      {property?.isDate &&
        selectedOperators[groupIndex][ruleIndex] !== 'is null' &&
        selectedOperators[groupIndex][ruleIndex] !== 'is not null' && (
          <>
            <input
              type="date"
              placeholder={translation("Value")}
              ref={(input) => {
                if (!inputRefs.current[groupIndex]) {
                  inputRefs.current[groupIndex] = {};
                }
                if (!inputRefs.current[groupIndex][ruleIndex]) {
                  inputRefs.current[groupIndex][ruleIndex] = [];
                }
                inputRefs.current[groupIndex][ruleIndex][0] = input; // Store first date input
              }}
              className="builder-input bg-white p-2 h-10 rounded-md grow w-1/4"
              defaultValue={inputValues[groupIndex][ruleIndex]?.[0] || ''}
              onBlur={(v) => {
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
                placeholder={translation("Value")}
                ref={(input) => {
                  if (!inputRefs.current[groupIndex]) {
                    inputRefs.current[groupIndex] = {};
                  }
                  if (!inputRefs.current[groupIndex][ruleIndex]) {
                    inputRefs.current[groupIndex][ruleIndex] = [];
                  }
                  inputRefs.current[groupIndex][ruleIndex][1] = input; // Store second date input
                }}
                className="builder-input bg-white p-2 h-10 rounded-md grow w-1/4"
                defaultValue={inputValues[groupIndex][ruleIndex]?.[1] || ''}
                onBlur={(v) => {
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
      {property?.isDuration &&
        selectedOperators[groupIndex][ruleIndex] !== 'is null' &&
        selectedOperators[groupIndex][ruleIndex] !== 'is not null' && (
          <>
            <input
              type="time"
              step="60"
              placeholder={translation("Value")}
              ref={(input) => {
                if (!inputRefs.current[groupIndex]) {
                  inputRefs.current[groupIndex] = {};
                }
                inputRefs.current[groupIndex][ruleIndex] = input;
              }}
              className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow w-1/4')}
              value={inputValues[groupIndex][ruleIndex]?.[0] || ''}
              onChange={(v) => {
                updateInput(
                  [v.target.value, inputValues[groupIndex][ruleIndex]?.[1] || ''],
                  ruleIndex,
                  groupIndex,
                );
              }}
            ></input>
            {selectedOperators[groupIndex][ruleIndex] === 'between' && (
              <input
                type="time"
                step="60"
                placeholder={translation("Value")}
                ref={(input) => {
                  if (!inputRefs.current[groupIndex]) {
                    inputRefs.current[groupIndex] = {};
                  }
                  if (!inputRefs.current[groupIndex][ruleIndex]) {
                    inputRefs.current[groupIndex][ruleIndex] = [];
                  }
                  inputRefs.current[groupIndex][ruleIndex][1] = input; // Store second date input
                }}
                className="builder-input bg-white p-2 h-10 rounded-md grow w-1/4"
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
      {/* number input */}
      {property?.isNumber &&
        selectedOperators[groupIndex][ruleIndex] !== 'is null' &&
        selectedOperators[groupIndex][ruleIndex] !== 'is not null' && (
          <input
            type="number"
            min={0}
            placeholder={translation("Value")}
            ref={(input) => {
              if (!inputRefs.current[groupIndex]) {
                inputRefs.current[groupIndex] = {};
              }
              inputRefs.current[groupIndex][ruleIndex] = input;
            }}
            className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow w-1/4')}
            value={inputValues[groupIndex][ruleIndex] ?? ''}
            onChange={(v) => {
              updateInput(v.target.value, ruleIndex, groupIndex);
            }}
          ></input>
        )}
      {/* string input */}
      {property?.isString &&
        selectedOperators[groupIndex][ruleIndex] !== 'is null' &&
        selectedOperators[groupIndex][ruleIndex] !== 'is not null' && (
          <input
            type="text"
            placeholder={translation("Value")}
            ref={(input) => {
              if (!inputRefs.current[groupIndex]) {
                inputRefs.current[groupIndex] = {};
              }
              inputRefs.current[groupIndex][ruleIndex] = input;
            }}
            className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow w-1/4')}
            value={inputValues[groupIndex][ruleIndex] ?? ''}
            onChange={(v) => {
              updateInput(v.target.value, ruleIndex, groupIndex);
            }}
          ></input>
        )}
    </div>
  );
};

export default NewRule;
