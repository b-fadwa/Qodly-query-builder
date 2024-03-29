import { useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useState } from 'react';

import { IQuerybuilderProps } from './Querybuilder.config';
import { FaRegTrashAlt } from 'react-icons/fa';

const Querybuilder: FC<IQuerybuilderProps> = ({ style, className, classNames = [] }) => {
  const { connect } = useRenderer();
  const [value, setValue] = useState();
  const [groups, setGroups] = useState([{ rules: [{}] }]);

  const {
    sources: { datasource: ds },
  } = useSources();

  useEffect(() => {
    setGroups([{ rules: [{}] }]);
  }, []);

  useEffect(() => {
    if (!ds) return;

    const listener = async (/* event */) => {
      const v = await ds.getValue();
      setValue(v);
    };

    listener();

    ds.addListener('changed', listener);

    return () => {
      ds.removeListener('changed', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ds]);

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
        <input
          type="text"
          placeholder="Property"
          className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow')}
        ></input>
        <select className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow')}>
          <option value="==">==</option>
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
            <button className={cn('builder-and', 'grow rounded-md bg-blue-300 p-2')}>And</button>
            <button className={cn('builder-or', 'grow rounded-md bg-blue-300 p-2')}>Or</button>
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
        <div className={cn('builder-footer', 'flex flex-row justify-end gap-2 p-2')}>
          <button
            className={cn('builder-clear', 'rounded-md p-2 border-2 border-blue-300 bg-white')}
            onClick={() => clearBuilder()}
          >
            Clear
          </button>
          <button className={cn('builder-apply', 'rounded-md bg-blue-300 p-2')}>Apply</button>
        </div>
      </div>
    </div>
  );
};

export default Querybuilder;
