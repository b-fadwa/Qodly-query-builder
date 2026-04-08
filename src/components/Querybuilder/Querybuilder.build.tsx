import { useEnhancedNode, useI18n, useLocalization } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC } from 'react';

import { IQuerybuilderProps } from './Querybuilder.config';
import { get } from 'lodash';

const Querybuilder: FC<IQuerybuilderProps> = ({ style, className, classNames = [] }) => {
  const {
    connectors: { connect },
  } = useEnhancedNode();

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


  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div
        className={cn('builder', 'flex flex-col h-full gap-4 bg-grey-800 p-2 rounded-lg min-w-fit')}
      >
        <div className={cn('builder-container', 'flex flex-col justify-between ')}>
          <div
            className={cn(
              'builder-header',
              'flex flex-row justify-between items-center gap-10 h-fit ',
            )}
          >
            <div className={cn('builder-andOrExcept', 'flex flex-row  h-10 gap-1')}>
              <button
                className={cn('builder-and', 'grow rounded-md border-2 border-purple-400 bg-white ')}
              >
                {translation("And")}
              </button>
              <button
                className={cn('builder-or', 'grow rounded-md border-2 border-purple-400 bg-white')}
              >
                {translation("Or")}
              </button>
              <button
                className={cn(
                  'builder-except',
                  'grow rounded-md border-2 border-purple-400 bg-white',
                )}
              >
                {translation("Except")}
              </button>
            </div>
            <div className="flex flex-row justify-start gap-1 h-10">
              <button className='builder-rule min-h-10 grow rounded-md bg-purple-400 h-10 w-full'>+ {translation("Rule")}</button>
              <button className='builder-group min-h-10 grow min-w-fit rounded-md bg-purple-400 h-10 w-full'>+ {translation("Group")}</button>
            </div>
          </div>
          <div className={cn('builder-body', 'flex flex-col grow p-2')}>
            <div className={cn('builder-rule-line', 'w-full h-fit flex flex-row p-2 gap-6')}>
              <input
                type="text"
                placeholder={translation("Property")}
                className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow')}
              ></input>
              <select className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow')}>
                <option value="">{translation("Operator")}</option>
              </select>
              <input
                type="text"
                placeholder={translation("Value")}
                className={cn('builder-input', 'bg-white p-2 h-10 rounded-md grow border-black')}
              ></input>
              <button
                className={cn(
                  'builder-remove',
                  'bg-white  p-3 rounded-md border-2 border-rose-500 text-rose-500',
                )}
              >
                {translation("Remove")}
              </button>
            </div>
          </div>
        </div>
        <div className={cn('builder-footer', 'w-full flex flex-row justify-end')}>
          <div className="flex gap-1 h-10">
            <button className='builder-clear rounded-md border-2 border-purple-400 text-purple-400 bg-white grow w-full'>{translation("Clear")}</button>
            <button className='builder-apply rounded-md bg-purple-400 w-full grow'>{translation("Apply")}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Querybuilder;
