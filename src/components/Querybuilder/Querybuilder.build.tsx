import { useEnhancedNode } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC } from 'react';

import { IQuerybuilderProps } from './Querybuilder.config';
import { FaRegTrashAlt } from 'react-icons/fa';

const Querybuilder: FC<IQuerybuilderProps> = ({ style, className, classNames = [] }) => {
  const {
    connectors: { connect },
  } = useEnhancedNode();

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div className={cn('builder', 'flex flex-col h-full gap-4 bg-slate-200 p-2')}>
        <div
          className={cn('builder-header', 'flex flex-row justify-start items-center gap-10 h-fit ')}
        >
          <div className={cn('builder-andOr', 'flex flex-row w-40 gap-2 ')}>
            <button
              className={cn('builder-and', 'grow rounded-md bg-blue-300 active:bg-blue-600 p-2')}
            >
              And
            </button>
            <button
              className={cn('builder-or', 'grow rounded-md bg-blue-300 p-2 active:bg-blue-800')}
            >
              Or
            </button>
          </div>
          <div>
            <button className={cn('builder-rule', 'grow rounded-md bg-blue-300 p-2')}>
              + Rule
            </button>
          </div>
          <div>
            <button className={cn('builder-group', 'grow rounded-md bg-blue-300 p-2')}>
              + Group
            </button>
          </div>
        </div>
        <div className={cn('builder-body', 'flex flex-col grow p-2')}>
          <div className={cn('builder-rule', 'w-full h-fit flex flex-row p-2 gap-6')}>
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
              <option value="in">In</option>z
            </select>
            <input
              type="text"
              placeholder="Value"
              className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow border-black')}
            ></input>
            <button
              className={cn(
                'builder-remove',
                'bg-white  p-3 rounded-md border-2 border-rose-500 text-rose-500',
              )}
            >
              <FaRegTrashAlt />
            </button>
          </div>
        </div>
        <div className={cn('builder-footer', 'flex flex-row justify-end gap-2 p-2')}>
          <button className={cn('builder-clear', 'rounded-md p-2 border-2 border-blue-300 bg-white')}>Clear</button>
          <button className={cn('builder-apply', 'rounded-md bg-blue-300 p-2')}>Apply</button>
        </div>
      </div>
    </div>
  );
};

export default Querybuilder;
