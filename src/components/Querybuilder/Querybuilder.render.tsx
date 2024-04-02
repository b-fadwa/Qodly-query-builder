import { useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { IQuerybuilderProps } from './Querybuilder.config';
import { FaRegTrashAlt } from 'react-icons/fa';
import { DataLoader } from '@ws-ui/webform-editor';

const Querybuilder: FC<IQuerybuilderProps> = ({ style, className, classNames = [] }) => {
  const { connect } = useRenderer();
  const [value, setValue] = useState<datasources.IEntity[]>([]);
  const [groups, setGroups] = useState([{ rules: [{}] }]);
  const [dsFields, setFields] = useState<string[]>([]); 
  const labelSelect = useRef<HTMLSelectElement>(null);
  const operator = useRef<HTMLSelectElement>(null);
  const inputValue = useRef<HTMLInputElement>(null);
  const [isAnd, setAnd] = useState<boolean>(false);
  const [isOr, setOr] = useState<boolean>(false);

  const {
    sources: { datasource: ds },
  } = useSources();

  useEffect(() => {
    setGroups([{ rules: [{}] }]);
  }, []);
  const loader = useMemo<DataLoader | null>(() => {
    if (!ds) {
      return null;
    }
    return DataLoader.create(ds, Object.getOwnPropertyNames(ds.dataclass).splice(1));
  }, [Object.getOwnPropertyNames(ds.dataclass).splice(1), ds]);

  const updateFromLoader = useCallback(() => {
    if (!loader) {
      return;
    }
    setValue(loader.page);
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
  };

  const generateGroup = () => {
    setGroups([...groups, { rules: [{}] }]); //generate a new group with a first rule
  };

  const NewRule = () => {
    return (
      <div className={cn('builder-new-rule', 'w-full h-fit flex flex-row p-2 gap-6')}>
        <select
          className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow')}
          ref={labelSelect}
        >
          {dsFields.map((attribute) => (
            <option value={attribute}>{attribute}</option>
          ))}
        </select>
        <select className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow')} ref={operator}>
          <option value="===">===</option>
          <option value="!=">!=</option>
          <option value="&lt;">&lt;</option>
          <option value="&gt;">&gt;</option>
          <option value="endsWith">Ends with</option>
          <option value="startsWith">Starts with</option>
          <option value="contains">Contains</option>
          <option value="between">Between</option>
          <option value="in">In</option>
        </select>
        <input
          type="text"
          placeholder="Value"
          ref={inputValue} //should make the ref related to the rule
          className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow')}
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
              className={cn('builder-and', 'grow rounded-md bg-blue-300 p-2')}
              onClick={setAndOperator}
            >
              And
            </button>
            <button
              className={cn('builder-or', 'grow rounded-md bg-blue-300 p-2')}
              onClick={setOrOperator}
            >
              Or
            </button>
          </div>
          <div>
            <button
              className={cn('builder-rule', 'grow rounded-md bg-blue-300 p-2')}
              onClick={() => generateRule(groupIndex)}
            >
              + Rule
            </button>
          </div>
          <div>
            <button
              className={cn('builder-group', 'grow rounded-md bg-blue-300 p-2')}
              onClick={generateGroup}
            >
              + Group
            </button>
          </div>
        </div>
        <div className={cn('builder-body', 'flex flex-col grow p-2')}>
          {groups[groupIndex].rules.map(({}, ruleIndex) => (
            <div key={ruleIndex} className={cn('builder-rule', 'flex items-center')}>
              <NewRule />
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
        debugger;
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
  };

  const setAndOperator = () => {
    setOr(isAnd);
    setAnd(!isAnd);
    // console.log('and ' + isAnd + ' or' + isOr);
    // query1 && query2
  };

  const setOrOperator = () => {
    setAnd(isOr);
    setOr(!isOr);
    // console.log('and ' + isAnd + ' or' + isOr);
    // query1||query2
  };

  const applyQuery = () => {
    //should return the output array??
    //check if the value = '' set it to null or empty string
    const queryOutput = [...value];
    let output: any = [];
    queryOutput.map((item) => {
      //eval not working
      // const formedQuery: string = JSON.stringify(item)+'[' + labelSelect.current?.value +'] ' + operator.current?.value +' "' + inputValue.current?.value + '"';
      // console.log(eval(formedQuery));
      // if (eval(formedQuery)) {
      //   // debugger
      //   output.push(item);
      // }
      // debugger;
      const label:string = labelSelect.current != null ? labelSelect.current.value : '';
      let query: boolean = false;
      switch (operator.current?.value) {
        case '===':
          if (labelSelect.current)
            // query=item[labelSelect.current?.value] === inputValue.current?.value
            query = item[label] === inputValue.current?.value;
          break;
        case '!=':
          query = item[label] != inputValue.current?.value;
          break;
        case 'contains':
          query = item[label].includes(inputValue.current?.value);
          break;
        case 'endsWith':
          query = item[label].endsWith(inputValue.current?.value);
          break;
        case 'startsWith':
          query = item[label].startsWith(inputValue.current?.value);
          break;
        //numbers
        case '<':
          query = Number(item[label]) < Number(inputValue.current?.value);
          break;
        case '>':
          query = Number(item[label]) > Number(inputValue.current?.value);
          break;
        case 'between':
          query = item[label] != inputValue.current?.value;
          break;
        case 'in':
          if (inputValue.current) query = inputValue.current?.value in item; //use property index instead of inputva...?
          break;
        default:
          console.log('by default test' + operator.current?.value);
      }
      if (query) {
        output.push(item);
        // ds.setValue(null, output);
      }
    });

    setValue(output);
  };

  const multipleQueries = () => {
    applyQuery;
    if (isAnd) {
      //add && between the two query
      //or get output of first query + output of second query and combine with and
    }
    if (isOr) {
      //or && between the two query
      //or get output of first query + output of second query and distinct with or
    }
  };

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
          onClick={applyQuery}//call multipleQueries here 
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

//multiple queries
//persist each input with its value when rerendering  the inputs..
//active button css
