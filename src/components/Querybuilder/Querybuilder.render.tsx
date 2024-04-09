import { useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { IQuerybuilderProps } from './Querybuilder.config';
import { FaRegTrashAlt } from 'react-icons/fa';
import { DataLoader } from '@ws-ui/webform-editor';

const Querybuilder: FC<IQuerybuilderProps> = ({ style, className, classNames = [] }) => {
  const { connect } = useRenderer();
  const [value, setValue] = useState<datasources.IEntity[]>([]);
  const [initDS, setDS] = useState<datasources.IEntity[]>([]);
  const [groups, setGroups] = useState([{ rules: [{}] }]);
  const [dsFields, setFields] = useState<string[]>([]);
  const labelSelect = useRef<HTMLSelectElement>(null);
  const operator = useRef<HTMLSelectElement>(null);
  const inputValue = useRef<HTMLInputElement>(null);
  const [isAnd, setAnd] = useState<boolean>(false);
  const [isOr, setOr] = useState<boolean>(false);
  const [selectedLabels, setSelectedLabels] = useState<string[][]>([[]]);
  const [selectedOperators, setSelectedOperators] = useState<string[][]>([[]]);
  const [inputValues, setInputValues] = useState<string[][]>([[]]);
  const [isAndActive, setAndActive] = useState<boolean[]>(new Array(groups.length).fill(false));
  const [isOrActive, setOrActive] = useState<boolean[]>(new Array(groups.length).fill(false));
  const [query, setQuery] = useState<string>('');

  const {
    sources: { datasource: ds },
  } = useSources();

  useEffect(() => {
    setGroups([{ rules: [{}] }]);
    setSelectedLabels([[]]);
    setSelectedOperators([[]]);
    setInputValues([[]]);
  }, []);

  const loader = useMemo<DataLoader | null>(() => {
    if (!ds) {
      return null;
    }
    return DataLoader.create(ds, Object.getOwnPropertyNames(ds.dataclass).splice(1));
  }, [Object.getOwnPropertyNames(ds?.dataclass).splice(1), ds]);

  const updateFromLoader = useCallback(() => {
    if (!loader) {
      return;
    }
    setValue(loader.page);
    setDS(loader.page);
    setFields(loader.attributes);
  }, [loader]);

  useEffect(() => {
    if (!loader || !ds) return;
    loader.sourceHasChanged().then(updateFromLoader);
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
  };

  useEffect(() => {
    if (inputValue.current) {
      inputValue.current.focus();
    }
  }, [inputValue.current]);

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
          {dsFields.map((attribute) => (
            <option value={attribute}>{attribute}</option>
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
          <option value="endsWith">Ends with (not handled in $filter?)</option>
          <option value="contains">Contains (not handled in $filter?)</option>
          <option value="between">Between(not handled in $filter?)</option>
          <option value="in">In (not handled in $filter?)</option>
        </select>
        <input
          type="text"
          placeholder="Value"
          ref={inputValue}
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
      <div
        id={'group' + groupIndex}
        className={cn('builder', 'flex flex-col gap-4 h-full bg-slate-200 p-2')}
      >
        <div
          className={cn('builder-header', 'flex flex-row justify-start items-center gap-10 h-fit')}
        >
          <div className={cn('builder-andOr', 'flex flex-row w-40 gap-2 ')}>
            <button
              className={
                isAndActive[groupIndex]
                  ? cn('builder-and', 'grow rounded-md bg-white border-2 w-3/6 border-blue-300')
                  : cn(
                      'builder-and',
                      'grow rounded-md bg-blue-300 w-3/6 p-2 hover:bg-white border-2 border-blue-300',
                    )
              }
              onClick={() => setAndOperator(groupIndex)}
            >
              And
            </button>
            <button
              className={
                isOrActive[groupIndex]
                  ? cn('builder-or', 'grow rounded-md bg-white border-2 w-3/6 border-blue-300')
                  : cn(
                      'builder-or',
                      'grow rounded-md bg-blue-300 p-2 w-3/6 hover:bg-white border-2 border-blue-300',
                    )
              }
              onClick={() => {
                setOrOperator(groupIndex);
              }}
            >
              Or
            </button>
          </div>
          <div>
            <button
              className={cn(
                'builder-rule',
                'grow rounded-md bg-blue-300 p-2 hover:bg-white border-2 border-blue-300',
              )}
              onClick={() => generateRule(groupIndex)}
            >
              + Rule
            </button>
          </div>
          <div>
            <button
              className={cn(
                'builder-group',
                'grow rounded-md bg-blue-300 p-2 hover:bg-white border-2 border-blue-300',
              )}
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
              <span>{ruleIndex}</span>
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
    );
  };

  const removeRule = (groupIndex: number, ruleIndex: number) => {
    if (ruleIndex != 0) {
      // let updatedGroups = [...groups];
      // updatedGroups[groupIndex].rules.splice(ruleIndex, 1);
      // setGroups(updatedGroups);
      setGroups((prevGroups) => {
        let updatedGroups = [...prevGroups];
        updatedGroups[groupIndex].rules.splice(ruleIndex, 1); //logically correct but visually no (it gets executed twice)
        //remove inputs
        updateInput('', ruleIndex, groupIndex);
        updateLabel('', ruleIndex, groupIndex);
        updateOperator('', ruleIndex, groupIndex);
        return updatedGroups;
      });
    } else {
      window.confirm('Cannot remove the by default rule');
    }
    return;
  };

  const clearBuilder = () => {
    setGroups([{ rules: [{}] }]);
    //+clear datasources binded to inputs...
    setSelectedLabels([[]]);
    setSelectedOperators([[]]);
    setInputValues([[]]);
    setValue(initDS);
    setAnd(false);
    setOr(false);
    setAndActive([]);
    setOrActive([]);
  };

  const setAndOperator = (index: number) => {
    setOr(isAnd);
    setAnd(!isAnd);
    const updatedAndStates = [...isAndActive];
    updatedAndStates[index] = !updatedAndStates[index];
    setAndActive(updatedAndStates);
    const updatedOrStates = [...isOrActive];
    updatedOrStates[index] = !updatedAndStates[index];
    setOrActive(updatedOrStates);
  };

  const setOrOperator = (index: number) => {
    setAnd(isOr);
    setOr(!isOr);
    const updatedOrStates = [...isOrActive];
    updatedOrStates[index] = !updatedOrStates[index];
    setOrActive(updatedOrStates);
    const updatedAndStates = [...isAndActive];
    updatedAndStates[index] = !updatedOrStates[index];
    setAndActive(updatedAndStates);
  };

  const formQuery = () => {
    //rest path http://localhost:7080/rest/User?$filter="ID=65 OR name begin User1"
    //need to get the dataclass of the entity selection {dataclass} api
    //get group 1 queries and combine with operator+group between the group queries with and
    let formedQuery: string = '/rest/User?$filter=';
    groups.forEach((group, groupIndex) => {
      const groupQueries = group.rules.map((_, ruleIndex) => ({
        label: selectedLabels[groupIndex][ruleIndex] || '',
        operator: selectedOperators[groupIndex][ruleIndex] || '',
        value: inputValues[groupIndex][ruleIndex] || '',
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
        }
      });
      if (groupIndex < groups.length - 1) {
        formedQuery += ' and ';
      }
    });
    setQuery(formedQuery);
  };

  useEffect(() => {
    fetch(query)
      .then((response) => response.json())
      .then((data) => {
        setValue(data), console.log(data);
      })
      .catch((error) => console.log(error));
    console.log(value);
  }, [query]);

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div className={cn('builder', 'flex flex-col gap-4 h-full bg-slate-200 p-2')}>
        <div className={cn('builder-body', 'flex flex-col grow p-2')}>
          {groups.map(({}, index) => (
            <div key={index}>
              <NewGroup groupIndex={index} />
            </div>
          ))}
        </div>
        <div
          className={cn('builder-footer', 'flex flex-row justify-end gap-2 p-2')}
          onClick={() => formQuery()}
        >
          <button
            className={cn('builder-clear', 'rounded-md p-2 border-2 border-blue-300 bg-white')}
            onClick={() => clearBuilder()}
          >
            Clear
          </button>
          <button className={cn('builder-apply', 'rounded-md bg-blue-300 p-2')}>Apply</button>
        </div>
      </div>
      {/* to test will be removed!!!!!!!!!!!!!!!! */}
      <div>{JSON.stringify(value)}</div>
    </div>
  );
};

export default Querybuilder;

//set the output/value in the ds/loader..
