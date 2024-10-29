import { useDataLoader, useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useRef, useState } from 'react';

import { IQuerybuilderProps } from './Querybuilder.config';
import { FaRegTrashAlt } from 'react-icons/fa';
const Querybuilder: FC<IQuerybuilderProps> = ({ style, className, classNames = [] }) => {
  const { connect } = useRenderer();
  const [groups, setGroups] = useState([{ rules: [{}] }]);
  const labelSelect = useRef<HTMLSelectElement>(null);
  const operator = useRef<HTMLSelectElement>(null);
  const [isAnd, setAnd] = useState<boolean>(false);
  const [isOr, setOr] = useState<boolean>(false);
  const [isExcept, setExcept] = useState<boolean>(false);
  const [selectedLabels, setSelectedLabels] = useState<string[][]>([[]]);
  const [selectedOperators, setSelectedOperators] = useState<string[][]>([[]]);
  const [inputValues, setInputValues] = useState<string[][]>([[]]);
  const [isAndActive, setAndActive] = useState<boolean[]>(new Array(groups.length).fill(false));
  const [isOrActive, setOrActive] = useState<boolean[]>(new Array(groups.length).fill(false));
  const [isExceptActive, setExceptActive] = useState<boolean[]>(
    new Array(groups.length).fill(false),
  );
  const [query, setQuery] = useState<string>('');
  const [properties, setProperties] = useState<any[]>([{ name: '', kind: '', type: '' }]);
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
    //get ds props
    //do not display all relatedEntities
    const formattedProperties = Object.values(ds.dataclass.getAllAttributes())
      .filter((item: any) => item.kind !== 'relatedEntities')
      .map((item: any) => ({
        name: item.name,
        kind: item.kind,
        type: item.type,
      }));

    const combinedProperties = [...formattedProperties];
    //manage nested entitiesRelations
    const processAttributes = (attributes: any[], dataClassName: string) => {
      attributes.forEach((item: any) => {
        if (item.kind === 'relatedEntities') {
          const dataType = item.type.replace('Selection', '');
          const relatedEntityAttributes = Object.values(
            (ds.dataclass._private.datastore as any)[dataType].getAllAttributes(),
          );
          // Recursively process related entity attributes
          processAttributes(relatedEntityAttributes, dataClassName + item.name + '.');
        } else {
          combinedProperties.push({
            name: dataClassName + item.name,
            kind: item.kind,
            type: item.type,
          });
        }
      });
    };

    Object.values(ds.dataclass.getAllAttributes()).forEach((item: any) => {
      if (item.kind === 'relatedEntities') {
        const dataType = item.type.replace('Selection', '');
        const relatedEntityAttributes = Object.values(
          (ds.dataclass._private.datastore as any)[dataType].getAllAttributes(),
        );
        processAttributes(relatedEntityAttributes, item.name + '.');
      }
    });
    setProperties(combinedProperties);
    setGroups([{ rules: [{}] }]);
    setSelectedLabels([[]]);
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
    return (
      <div className={cn('builder-new-rule', 'w-full h-fit flex flex-row p-2 gap-6')}>
        <select
          className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow')}
          ref={labelSelect}
          value={selectedLabels[groupIndex][ruleIndex]}
          onChange={(v) => {
            updateLabel(v.target.value, ruleIndex, groupIndex);
          }}
        >
          <option value="">Property</option>
          {properties.map((attribute) => (
            <option value={attribute.name}>{attribute.name}</option>
          ))}
        </select>
        <select
          className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow')}
          ref={operator}
          value={selectedOperators[groupIndex][ruleIndex]}
          onChange={(v) => {
            updateOperator(v.target.value, ruleIndex, groupIndex);
          }}
        >
          <option value="">Operator</option>
          <option value="=">=</option>
          <option value="!=">!=</option>
          <option value="&lt;">&lt;</option>
          <option value="&gt;">&gt;</option>
          <option value="&lt;=">&lt;=</option>
          <option value="&gt;=">&gt;=</option>
          <option value="begin">Starts with</option>
        </select>
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
      </div>
    );
  };

  const NewGroup = ({ groupIndex }: { groupIndex: number }) => {
    //extract groupIndex from the newGroup
    return (
      <>
        {groups[groupIndex].rules.length > 0 && (
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
                      : cn('builder-except', 'grow rounded-md border-2 border-purple-400 bg-white ')
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
                <div key={ruleIndex} className={cn('builder-rule', 'flex items-center')}>
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
    setSelectedOperators([[]]);
    setInputValues([[]]);
    setAnd(false);
    setOr(false);
    setAndActive([]);
    setOrActive([]);
    setExceptActive([]);
    setTimeout(() => {
      //fix to query cleaning
      setQuery('');
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

  const formQuery = () => {
    let formedQuery: string = '';
    groups.forEach((group, groupIndex) => {
      const groupQueries = group.rules.map((_, ruleIndex) => ({
        label: selectedLabels[groupIndex][ruleIndex] || '',
        operator: selectedOperators[groupIndex][ruleIndex] || '',
        value: '"' + inputValues[groupIndex][ruleIndex] + '"',
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
        formedQuery += ' and ';
      }
    });
    setQuery(formedQuery);
  };

  useEffect(() => {
    const queryString = query === '' || query.includes('undefined') ? '' : query;
    const fetchData = () => {
      const { entitysel } = ds as any;
      const dataSetName = entitysel?.getServerRef();
      (ds as any).entitysel = ds.dataclass.query(queryString, {
        dataSetName,
        filterAttributes: ds.filterAttributesText || entitysel._private.filterAttributes,
      });
      fetchIndex(0);
      ds.fireEvent('changed');
    };
    fetchData();
  }, [query]);

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div className={cn('builder', 'flex flex-col h-full gap-4 bg-gray-800 rounded-lg p-2')}>
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
