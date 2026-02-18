import { selectResolver, useEnhancedEditor, useEnhancedNode } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC } from 'react';
import { Element } from '@ws-ui/craftjs-core';

import { IQuerybuilderProps } from './Querybuilder.config';
import { FaRegTrashAlt } from 'react-icons/fa';

const Querybuilder: FC<IQuerybuilderProps> = ({ style, className, classNames = [] }) => {
  const {
    connectors: { connect },
  } = useEnhancedNode();
  const { resolver } = useEnhancedEditor(selectResolver);

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div
        className={cn('builder', 'flex flex-col h-full gap-4 bg-grey-800 p-2 rounded-lg min-w-fit')}
      >
        <div
          className={cn(
            'builder-header',
            'flex flex-row justify-between items-center gap-10 h-fit ',
          )}
        >
          <div className={cn('builder-andOrExcept', 'flex flex-row w-1/5 h-10 gap-1')}>
            <button
              className={cn('builder-and', 'grow rounded-md border-2 border-purple-400 bg-white ')}
            >
              And
            </button>
            <button
              className={cn('builder-or', 'grow rounded-md border-2 border-purple-400 bg-white')}
            >
              Or
            </button>
            <button
              className={cn(
                'builder-except',
                'grow rounded-md border-2 border-purple-400 bg-white',
              )}
            >
              Except
            </button>
          </div>
          <div className="flex flex-row justify-start gap-1 w-1/6 h-10">
            <Element
              id="builder-rule"
              is={resolver.Button}
              text="+ Rule"
              classNames={["builder-rule min-h-10 grow rounded-md bg-purple-400 h-10 w-full !important"]}
            />
            <Element
              id="builder-group"
              is={resolver.Button}
              text="+ Group"
              classNames={["builder-group min-h-10 grow min-w-fit rounded-md bg-purple-400 h-10 w-full !important"]}
            />
          </div>
        </div>
        <div className={cn('builder-body', 'flex flex-col grow p-2')}>
          <div className={cn('builder-rule-line', 'w-full h-fit flex flex-row p-2 gap-6')}>
            <input
              type="text"
              placeholder="Property"
              className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow')}
            ></input>
            <select className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow')}>
              <option value="">Operator</option>
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
        <div className={cn('builder-footer', 'w-full flex flex-row justify-end')}>
          <div className="flex gap-1 h-10 w-1/6">
            <Element
              id="builder-clear"
              is={resolver.Button}
              text="Clear"
              classNames={['builder-clear rounded-md border-2 border-purple-400 text-purple-400 bg-white grow w-full !important']}
            />
            <Element
              id="builder-apply"
              is={resolver.Button}
              text="Apply"
              classNames={[' builder-apply rounded-md bg-purple-400 w-full grow !important']}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Querybuilder;
