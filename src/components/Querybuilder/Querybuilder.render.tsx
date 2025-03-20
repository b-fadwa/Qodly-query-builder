import { useDataLoader, useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useRef, useState } from 'react';

import { IQuerybuilderProps } from './Querybuilder.config';
import { FaRegTrashAlt } from 'react-icons/fa';
const Querybuilder: FC<IQuerybuilderProps> = ({ style, className, classNames = [] }) => {
  const { connect } = useRenderer();
  const [groups, setGroups] = useState([{ rules: [{}] }]);
  //query properties states
  const [builderQuery, setQuery] = useState<string | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [allProperties, setAllProperties] = useState<any[]>([]); //related + storage
  const labelSelect = useRef<HTMLSelectElement>(null);
  const operator = useRef<HTMLSelectElement>(null);
  //[][]for each rule ..
  const [selectedLabels, setSelectedLabels] = useState<string[][]>([[]]);
  const [selectedRelatedLabels, setSelectedRelatedLabels] = useState<string[][]>([[]]);
  const [relatedAttributes, setRelatedAttributes] = useState<any[][]>([]);
  const [finalLabels, setFinalLabels] = useState<string[][]>([[]]);
  const [selectedOperators, setSelectedOperators] = useState<string[][]>([[]]);
  const [inputValues, setInputValues] = useState<string[][]>([[]]);
  // and , or , except states for each group rules
  const [isAnd, setAnd] = useState<boolean>(false);
  const [isOr, setOr] = useState<boolean>(false);
  const [isExcept, setExcept] = useState<boolean>(false);
  const [isAndActive, setAndActive] = useState<boolean[]>([]);
  const [isOrActive, setOrActive] = useState<boolean[]>([]);
  const [isExceptActive, setExceptActive] = useState<boolean[]>([]);
  //and , or states for each group
  const [isAndGroup, setGroupAnd] = useState<boolean>(false);
  const [isOrGroup, setGroupOr] = useState<boolean>(false);
  const [isAndGroupActive, setAndGroupActive] = useState<boolean[]>([]);
  const [isOrGroupActive, setOrGroupActive] = useState<boolean[]>([]);
  const [groupOperators, setGroupOperators] = useState<string[]>([]);
  //input focus states
  const [focusedInput, setFocusedInput] = useState({ groupIndex: 0, ruleIndex: 0 });
  const inputRefs = useRef<{
    [groupIndex: number]: { [ruleIndex: number]: HTMLInputElement | null };
  }>({});

  const {
    sources: { datasource: ds },
  } = useSources();

  const { fetchIndex } = useDataLoader({
    source: ds,
  });

  useEffect(() => {
    if (!ds) return;
    const processedEntities = new Set(); // Set to track processed entities and prevent duplicates
    const formattedProperties = Object.values(ds.dataclass.getAllAttributes()).map((item: any) => ({
      name: item.name,
      kind: item.kind,
      type: item.type,
      isDate: item.type === 'date',
      isImage: item.type === 'image',
      isString: item.type === 'string',
      isNumber: item.type === 'long',
      isBoolean: item.type === 'bool',
      isDuration: item.type === 'duration',
      isRelated: item.kind === 'relatedEntities',
    }));

    const combinedProperties: any[] = [];

    // Recursively process related entities and their attributes
    const processAttributes = (attributes: any[], dataClassName: string, depth: number = 0) => {
      if (depth >= 5) return; // Stop at max depth to prevent infinite recursion
      attributes.forEach((item: any) => {
        const uniquePath = dataClassName + item.name;
        if (
          (item.kind === 'relatedEntities' ||
            (item.kind === 'calculated' && item.behavior === 'relatedEntities')) &&
          depth < 5
        ) {
          const dataType = item.type.replace('Selection', '');
          if (processedEntities.has(uniquePath)) return;
          processedEntities.add(uniquePath);
          // Get related entity attributes
          const relatedEntityAttributes = Object.values(
            (ds.dataclass._private.datastore as any)[dataType].getAllAttributes(),
          );
          // Push the related entity itself
          combinedProperties.push({
            name: uniquePath,
            kind: item.kind,
            type: item.type,
            isRelated: item.kind === 'relatedEntities',
          });
          relatedEntityAttributes.forEach((attr: any) => {
            if (attr.kind === 'storage' && !processedEntities.has(uniquePath + '.' + attr.name)) {
              combinedProperties.push({
                name: uniquePath + '.' + attr.name,
                kind: attr.kind,
                type: attr.type,
                isDate: attr.type === 'date',
                isImage: attr.type === 'image',
                isString: attr.type === 'string',
                isNumber: attr.type === 'long',
                isBoolean: attr.type === 'bool',
                isDuration: attr.type === 'duration',
                isRelated: attr.kind === 'relatedEntities',
              });
              processedEntities.add(uniquePath + '.' + attr.name); // Mark this attribute as processed
            }
          });
          // Recurse on the related entity attributes to find deeper related entities
          processAttributes(relatedEntityAttributes, uniquePath + '.', depth + 1);
        } else if (item.kind === 'storage' && !processedEntities.has(uniquePath)) {
          // Handle non-related entities (storage)
          combinedProperties.push({
            name: uniquePath,
            kind: item.kind,
            type: item.type,
            isDate: item.type === 'date',
            isImage: item.type === 'image',
            isString: item.type === 'string',
            isNumber: item.type === 'long',
            isBoolean: item.type === 'bool',
            isDuration: item.type === 'duration',
            isRelated: item.kind === 'relatedEntities',
          });
          processedEntities.add(uniquePath);
        }
      });
    };
    const topLevelAttributes = Object.values(ds.dataclass.getAllAttributes()).filter(
      (item) =>
        item.kind === 'relatedEntities' ||
        (item.kind === 'calculated' && item.behavior === 'relatedEntities'),
    );
    processAttributes(topLevelAttributes, '');
    setProperties(formattedProperties);
    setAllProperties([...combinedProperties, ...formattedProperties]); // add the processed properties too
    setGroups([{ rules: [{}] }]);
    setSelectedLabels([[]]);
    setSelectedRelatedLabels([[]]);
    setFinalLabels([[]]);
    setSelectedOperators([[]]);
    setInputValues([[]]);
  }, []);

  const generateRule = (groupIndex: number) => {
    setGroups((prevGroups) => {
      const updatedGroups = [...prevGroups]; //to return the old groups as well appended with the new rule
      updatedGroups[groupIndex] = {
        //add a new rule to the selected group after creating a copy of it to return old rules too
        ...updatedGroups[groupIndex],
        rules: [...updatedGroups[groupIndex].rules, {}], // Append a new rule to th
      };
      return updatedGroups;
    });
    setSelectedLabels((prevLabels) => [...prevLabels, []]);
    setSelectedOperators((prevOperators) => [...prevOperators, []]);
    setInputValues((prevInputs) => [...prevInputs, []]);
  };

  const generateGroup = () => {
    setGroups([...groups, { rules: [{}] }]); //generate a new group with a first rule
    setSelectedLabels((prevLabels) => [...prevLabels, []]);
    setSelectedOperators((prevOperators) => [...prevOperators, []]);
    setInputValues((prevInputs) => [...prevInputs, []]);
  };

  const updateLabel = (v: string, ruleIndex: number, groupIndex: number) => {
    const updatedLabels = [...selectedLabels];
    updatedLabels[groupIndex][ruleIndex] = v;
    setSelectedLabels(updatedLabels);
    updateFinalLabels(updatedLabels, selectedRelatedLabels);
  };

  const updateRelatedLabel = (v: string, ruleIndex: number, groupIndex: number) => {
    const updatedRelatedLabels = [...selectedRelatedLabels];
    updatedRelatedLabels[groupIndex][ruleIndex] = v;
    setSelectedRelatedLabels(updatedRelatedLabels);
    updateFinalLabels(updatedRelatedLabels, selectedRelatedLabels);
  };

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

  const updateOperator = (v: string, ruleIndex: number, groupIndex: number) => {
    const updatedOperators = [...selectedOperators];
    updatedOperators[groupIndex][ruleIndex] = v;
    setSelectedOperators(updatedOperators);
  };

  const updateInput = (v: string, ruleIndex: number, groupIndex: number) => {
    const updatedValues = [...inputValues];
    updatedValues[groupIndex][ruleIndex] = v;
    setInputValues(updatedValues);
    setFocusedInput({ ruleIndex, groupIndex });
  };

  useEffect(() => {
    //fix for the input text issue when loosing focus at each rerender
    if (focusedInput.groupIndex != null && focusedInput.ruleIndex != null && inputRefs) {
      const input = inputRefs.current[focusedInput.groupIndex]?.[focusedInput.ruleIndex];

      if (input) input.focus();
    }
  }, [inputValues]);

  const NewRule = ({ ruleIndex, groupIndex }: { ruleIndex: number; groupIndex: number }) => {
    const selectedProperty: any = selectedRelatedLabels[groupIndex][ruleIndex]
      ? allProperties.find((prop) => prop.name === selectedRelatedLabels[groupIndex][ruleIndex])
      : allProperties.find((prop) => prop.name === selectedLabels[groupIndex][ruleIndex]);

    //get related attributes of the selected related attribute..
    const handlePropertyChange = (v: any, ruleIndex: number, groupIndex: number) => {
      const selectedAttribute = properties.find((attribute) => attribute.name === v.target.value);
      if (selectedAttribute && selectedAttribute.isRelated) {
        const relatedEntityAttributes = allProperties
          .filter(
            (attr) =>
              attr.name.startsWith(selectedAttribute.name + '.') &&
              attr.name !== selectedAttribute.name,
          )
          .map((attr) => ({
            name: attr.name,
            type: attr.type,
            kind: attr.kind,
            isRelated: attr.isRelated,
            isString: attr.isString,
            isNumber: attr.isNumber,
            isDate: attr.isDate,
            isBoolean: attr.isBoolean,
          }));

        setRelatedAttributes((prev) => {
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
          className="builder-input bg-red-500 p-2 h-10 rounded-md grow"
          ref={labelSelect}
          value={selectedLabels[groupIndex][ruleIndex]}
          onChange={(v) => {
            updateLabel(v.target.value, ruleIndex, groupIndex);
            handlePropertyChange(v, ruleIndex, groupIndex);
          }}
        >
          <option value="" disabled selected>
            Select a property
          </option>
          {properties.map((attribute) => (
            <option value={attribute.name}>{attribute.name}</option>
          ))}
        </select>
        {/* get all properties of the related attribute */}
        {(selectedProperty?.isRelated || selectedProperty?.name?.includes('.')) && (
          <select
            className="builder-input bg-blue-400 p-2 h-10 rounded-md grow"
            ref={labelSelect}
            value={selectedRelatedLabels[groupIndex][ruleIndex]}
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
                  inputRefs.current[groupIndex][ruleIndex] = input;
                }}
                className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow')}
                value={inputValues[groupIndex][ruleIndex]}
                onChange={(v) => {
                  updateInput(v.target.value, ruleIndex, groupIndex);
                }}
              ></input>
              {selectedOperators[groupIndex][ruleIndex] === 'between' && (
                <input
                  type="date"
                  placeholder="Value"
                  ref={(input) => {
                    //to update
                    if (!inputRefs.current[groupIndex]) {
                      inputRefs.current[groupIndex] = {};
                    }
                    inputRefs.current[groupIndex][ruleIndex] = input;
                  }}
                  className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow')}
                  value={inputValues[groupIndex][ruleIndex]?.[1] || ''}
                  onChange={(v) => {
                    //to check
                    console.log(v.target.value);
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

  const NewGroup = ({ groupIndex }: { groupIndex: number }) => {
    //extract groupIndex from the newGroup
    return (
      <>
        {groups[groupIndex].rules.length > 0 && (
          <div className="builder-group-container flex flex-col gap-1">
            {groupIndex !== 0 && (
              <div className="builder-group-operators flex flex-row w-1/3 h-10 gap-2">
                <button
                  className={
                    isAndGroupActive[groupIndex]
                      ? cn(
                          'builder-and-group',
                          'grow rounded-md border-2  border-purple-400 bg-white',
                        )
                      : cn('builder-and-group', ' grow rounded-md border-2 bg-purple-400')
                  }
                  onClick={() => setGroupAndOperator(groupIndex)}
                >
                  And
                </button>
                <button
                  className={
                    isOrGroupActive[groupIndex]
                      ? cn(
                          'builder-or-group',
                          'grow rounded-md border-2  border-purple-400 bg-white',
                        )
                      : cn('builder-or-group', ' grow rounded-md border-2 bg-purple-400')
                  }
                  onClick={() => setGroupOrOperator(groupIndex)}
                >
                  Or
                </button>
              </div>
            )}
            <div
              id={'group' + groupIndex}
              className={cn(
                'builder',
                'flex flex-col gap-4 h-full border border-slate-200 rounded-lg p-2',
              )}
            >
              <div
                className={cn(
                  'builder-header',
                  'flex flex-row justify-between items-center gap-10 h-fit ',
                )}
              >
                <div className={cn('builder-andOrExcept', 'flex flex-row w-1/5 h-10 gap-2')}>
                  <button
                    className={
                      isAndActive[groupIndex]
                        ? cn('builder-and', 'grow rounded-md border-2 bg-purple-400')
                        : cn('builder-and', ' grow rounded-md border-2  border-purple-400 bg-white')
                    }
                    onClick={() => setAndOperator(groupIndex)}
                  >
                    And
                  </button>
                  <button
                    className={
                      isOrActive[groupIndex]
                        ? cn('builder-or', 'grow rounded-md  border-2 bg-purple-400')
                        : cn(
                            'builder-or',
                            'grow rounded-md border-2 border-purple-400 bg-white hover:bg-sky-700',
                          )
                    }
                    onClick={() => {
                      setOrOperator(groupIndex);
                    }}
                  >
                    Or
                  </button>
                  <button
                    className={
                      isExceptActive[groupIndex]
                        ? cn('builder-except', 'grow rounded-md  border-2 bg-purple-400')
                        : cn(
                            'builder-except',
                            'grow rounded-md border-2 border-purple-400 bg-white ',
                          )
                    }
                    onClick={() => {
                      setExceptOperator(groupIndex);
                    }}
                  >
                    Except
                  </button>
                </div>
                <div className="flex flex-row justify-start gap-1 w-1/6 h-10">
                  <button
                    className={cn('builder-rule', 'grow rounded-md bg-purple-400 w-1/2')}
                    onClick={() => generateRule(groupIndex)}
                  >
                    + Rule
                  </button>
                  <button
                    className={cn('builder-group', 'grow rounded-md bg-purple-400 w-1/2')}
                    onClick={generateGroup}
                  >
                    + Group
                  </button>
                </div>
              </div>
              <div className={cn('builder-body', 'flex flex-col grow p-2')}>
                {groups[groupIndex].rules.map(({}, ruleIndex) => (
                  <div key={ruleIndex} className={cn('builder-rule-line', 'flex items-center')}>
                    <NewRule ruleIndex={ruleIndex} groupIndex={groupIndex} />
                    <button
                      className={cn(
                        'builder-remove',
                        'bg-white h-fit p-3 rounded-md border-2 border-rose-500 text-rose-500',
                      )}
                      onClick={() => removeRule(groupIndex, ruleIndex)}
                    >
                      <FaRegTrashAlt />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const removeRule = (groupIndex: number, ruleIndex: number) => {
    if (groupIndex == 0 && ruleIndex == 0) {
      window.confirm('Cannot remove the by default rule');
      return;
    }
    setGroups((prevGroups) => {
      return prevGroups.map((group, groupId) => {
        if (groupId === groupIndex) {
          return {
            ...group,
            rules: group.rules.filter((_, ruleId) => ruleId !== ruleIndex),
          };
        }
        return group;
      });
    });
    //update the related fields
    setSelectedLabels((prevLabels) => {
      return prevLabels.map((labelGroup, groupId) => {
        if (groupId === groupIndex) {
          return labelGroup.filter((_, ruleId) => ruleId !== ruleIndex);
        }
        return labelGroup;
      });
    });
    setSelectedOperators((prevOperators) => {
      return prevOperators.map((operatorGroup, groupId) => {
        if (groupId === groupIndex) {
          return operatorGroup.filter((_, ruleId) => ruleId !== ruleIndex);
        }
        return operatorGroup;
      });
    });
    setInputValues((prevInputs) => {
      return prevInputs.map((inputGroup, groupId) => {
        if (groupId === groupIndex) {
          return inputGroup.filter((_, ruleId) => ruleId !== ruleIndex);
        }
        return inputGroup;
      });
    });
  };

  const clearBuilder = () => {
    setGroups([{ rules: [{}] }]);
    //+clear datasources binded to inputs...
    setSelectedLabels([[]]);
    setSelectedRelatedLabels([[]]);
    setFinalLabels([[]]);
    setSelectedOperators([[]]);
    setInputValues([[]]);
    setAnd(false);
    setOr(false);
    setAndActive([]);
    setOrActive([]);
    setExceptActive([]);
    setAndGroupActive([]);
    setOrGroupActive([]);
    setTimeout(() => {
      //fix to query cleaning
      setQuery(' ');
    }, 0);
  };

  const setAndOperator = (index: number) => {
    setOr(isAnd);
    setExcept(isAnd);
    setAnd(!isAnd);
    const updatedAndStates = [...isAndActive];
    updatedAndStates[index] = !updatedAndStates[index];
    setAndActive(updatedAndStates);
    const updatedOrStates = [...isOrActive];
    updatedOrStates[index] = false;
    setOrActive(updatedOrStates);
    const updatedExceptStates = [...isExceptActive];
    updatedExceptStates[index] = false;
    setExceptActive(updatedExceptStates);
  };

  const setOrOperator = (index: number) => {
    setAnd(isOr);
    setExcept(isOr);
    setOr(!isOr);
    const updatedOrStates = [...isOrActive];
    updatedOrStates[index] = !updatedOrStates[index];
    setOrActive(updatedOrStates);
    const updatedAndStates = [...isAndActive];
    updatedAndStates[index] = false;
    setAndActive(updatedAndStates);
    const updatedExceptStates = [...isExceptActive];
    updatedExceptStates[index] = false;
    setExceptActive(updatedExceptStates);
  };

  const setExceptOperator = (index: number) => {
    setAnd(isExcept);
    setOr(isExcept);
    setExcept(!isExcept);
    const updatedExceptStates = [...isExceptActive];
    updatedExceptStates[index] = !updatedExceptStates[index];
    setExceptActive(updatedExceptStates);
    const updatedAndStates = [...isAndActive];
    updatedAndStates[index] = false;
    setAndActive(updatedAndStates);
    const updatedOrStates = [...isOrActive];
    updatedOrStates[index] = false;
    setOrActive(updatedOrStates);
  };

  const setGroupAndOperator = (index: number) => {
    setGroupOr(isAndGroup);
    setGroupAnd(!isAndGroup);
    const updatedAndStates = [...isAndGroupActive];
    updatedAndStates[index] = !updatedAndStates[index];
    setAndGroupActive(updatedAndStates);
    const updatedOrStates = [...isOrGroupActive];
    updatedOrStates[index] = false;
    setOrGroupActive(updatedOrStates);
    handleGroupOperatorChange(index - 1, 'AND');
  };

  const setGroupOrOperator = (index: number) => {
    setGroupAnd(isOrGroup);
    setGroupOr(!isOrGroup);
    const updatedOrStates = [...isOrGroupActive];
    updatedOrStates[index] = !updatedOrStates[index];
    setOrGroupActive(updatedOrStates);
    const updatedAndStates = [...isAndGroupActive];
    updatedAndStates[index] = false;
    setAndGroupActive(updatedAndStates);
    handleGroupOperatorChange(index - 1, 'OR');
  };

  const handleGroupOperatorChange = (index: number, operator: string) => {
    setGroupOperators((prev) => {
      const updated = [...prev];
      updated[index] = operator;
      return updated;
    });
  };
  const formQuery = () => {
    let formedQuery: string = '';
    groups.forEach((group, groupIndex) => {
      const groupQueries = group.rules.map((_, ruleIndex) => ({
        label: finalLabels[groupIndex][ruleIndex] || '',
        operator:
          selectedOperators[groupIndex][ruleIndex] == 'contains' ||
          selectedOperators[groupIndex][ruleIndex] == 'end'
            ? '='
            : selectedOperators[groupIndex][ruleIndex] || '',
        value:
          selectedOperators[groupIndex][ruleIndex] === 'is null' ||
          selectedOperators[groupIndex][ruleIndex] === 'is not null'
            ? ''
            : selectedOperators[groupIndex][ruleIndex] === 'contains'
              ? '"@' + `${inputValues[groupIndex][ruleIndex]}@"`
              : selectedOperators[groupIndex][ruleIndex] === 'end'
                ? '"@' + inputValues[groupIndex][ruleIndex] + '"'
                : '"' + inputValues[groupIndex][ruleIndex] + '"' || '',
      }));
      groupQueries.forEach((queryPart, queryIndex) => {
        formedQuery += queryPart.label + ' ' + queryPart.operator + ' ' + queryPart.value;
        if (queryIndex < groupQueries.length - 1) {
          if (isAndActive[groupIndex]) {
            formedQuery += ' and ';
          }
          if (isOrActive[groupIndex]) {
            formedQuery += ' or ';
          }
          if (isExceptActive[groupIndex]) {
            formedQuery += ' Except ';
          }
        }
      });
      if (groupIndex < groups.length - 1) {
        formedQuery +=
          groupOperators[groupIndex] === '' ? ' And ' : ' ' + groupOperators[groupIndex] + ' ';
      }
    });
    setQuery(formedQuery);
  };

  useEffect(() => {
    if (!builderQuery) return;
    const queryString =
      builderQuery === ' ' || builderQuery?.includes('undefined') ? '' : builderQuery;
    const fetchData = async () => {
      const { entitysel } = ds as any;
      const dataSetName = entitysel?.getServerRef();
      (ds as any).entitysel = ds.dataclass.query(queryString, {
        dataSetName,
        filterAttributes: ds.filterAttributesText || entitysel._private.filterAttributes,
      });
      await fetchIndex(0);
      ds.fireEvent('changed');
    };
    fetchData();
  }, [builderQuery]);

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div
        className={cn('builder', 'flex flex-col h-full gap-4 bg-gray-800 rounded-lg p-2 min-w-fit')}
      >
        <div className={cn('builder-body', 'flex flex-col grow gap-2 p-2')}>
          {groups.map(({}, index) => (
            <div key={index}>
              <NewGroup groupIndex={index} />
            </div>
          ))}
        </div>
        <div
          className={cn('builder-footer', 'w-full flex flex-row justify-end')}
          onClick={() => formQuery()}
        >
          <div className="flex gap-1 h-10 w-1/6">
            <button
              className={cn(
                'builder-clear',
                'rounded-md border-2 border-purple-400 bg-white w-1/2',
              )}
              onClick={() => clearBuilder()}
            >
              Clear
            </button>
            <button className={cn('builder-apply', 'rounded-md bg-purple-400 w-1/2')}>Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Querybuilder;
