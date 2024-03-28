import { useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useRef, useState } from 'react';

import { IQuerybuilderProps } from './Querybuilder.config';
import { FaRegTrashAlt } from 'react-icons/fa';

const Querybuilder: FC<IQuerybuilderProps> = ({ name, style, className, classNames = [] }) => {
  const { connect } = useRenderer();
  const [value, setValue] = useState(() => name);
  // const [newID, setIdCount] = useState(0);
  // const [isActive, setActive] = useState<boolean>(false); //for the button active state on click css active:bg-.. not working
  const [components, setComponents] = useState([{}]);
  const [groups, setGroups] = useState([{}]);

  const ruleRef = useRef<HTMLDivElement>(null);

  const {
    sources: { datasource: ds },
  } = useSources();

  useEffect(() => {
    setComponents([]);
  }, []);

  useEffect(() => {
    if (!ds) return;

    const listener = async (/* event */) => {
      const v = await ds.getValue<string>();
      setValue(v || name);
    };

    listener();

    ds.addListener('changed', listener);

    return () => {
      ds.removeListener('changed', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ds]);

  const NewRule = () => {
    return (
      <div
        ref={ruleRef}
        // id={'rule-' + newID}
        className={cn('builder-new-rule', 'w-full h-fit flex flex-row p-2 gap-6')}
      >
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
        <button
          className={cn(
            'builder-remove',
            'bg-white  p-3 rounded-md border-2 border-rose-500 text-rose-500',
          )}
          onClick={removeRule}
        >
          <FaRegTrashAlt />
        </button>
      </div>
    );
  };

  const NewGroup = () => {
    return (
      <div
        // id={'group' + newID}
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
              onClick={generateRule}
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
          <NewRule />
          {components.map((item) => (
            <NewRule key={components.indexOf(item)} />
          ))}
        </div>
      </div>
    );
  };

  const generateRule = () => {
    // setIdCount((prevCount) => prevCount + 1);
    setComponents([...components, 'new Rule']);
  };
  const generateGroup = () => {
    // setIdCount((prevCount) => prevCount + 1);
    setGroups([...groups, 'new Group']);
  };
  const removeRule = () => {
    console.log('-remove rule ');
  };
  const clearBuilder = () => {
    setComponents([]);
    setGroups([]);
    //+clear datasources binded to inputs...
  };

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div className={cn('builder', 'flex flex-col gap-4 h-full bg-slate-200 p-2')}>
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
              onClick={generateRule}
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
          <NewRule />
          {components.map((item) => (
            <NewRule key={components.indexOf(item)} />
          ))}
          {groups.map((item) => (
            <NewGroup key={groups.indexOf(item)} />
          ))}
        </div>
        <div className={cn('builder-footer', 'flex flex-row justify-end gap-2 p-2')}>
          <button
            className={cn('builder-clear', 'rounded-md p-2 border-2 border-blue-300 bg-white')}
            onClick={clearBuilder}
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
