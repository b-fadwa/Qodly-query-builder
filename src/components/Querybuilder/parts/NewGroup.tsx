import { FC } from 'react';
import cn from 'classnames';
import NewRule from './NewRule';
import { FaRegTrashAlt } from 'react-icons/fa';

interface IQueryGroupProps {
  defaultInputs: any;
  isNewRule: boolean;
  groups: any;
  index: any;
  isAndGroupActive: any;
  setGroupAndOperator: (index: any) => void;
  isOrGroupActive: any;
  setGroupOrOperator: (index: any) => void;
  isAndActive: any;
  setAndOperator: (index: any) => void;
  isOrActive: any;
  setOrOperator: (index: any) => void;
  isExceptActive: any;
  setExceptOperator: (index: any) => void;
  generateRule: (groupIndex: number) => void;
  generateGroup: () => void;
  removeRule: (groupIndex: number, ruleIndex: number) => void;
  //rule related props:
  labelSelect: any;
  operator: any;
  updateLabel: (event: any, ruleIndex: any, groupIndex: any) => void;
  properties: any;
  selectedOperators: any;
  updateOperator: (event: any, ruleIndex: any, groupIndex: any) => void;
  inputRefs: any;
  inputValues: any;
  updateInput: (event: any, ruleIndex: any, groupIndex: any) => void;
  allProperties: any;
  selectedRelatedLabels: any;
  selectedLabels: any;
  setRelatedAttributes: (att: any) => void;
  updateRelatedLabel: (v: string, ruleIndex: number, groupIndex: number) => void;
  relatedAttributes: any;
  isCleared: boolean;
  setIsCleared: (v: boolean) => void;
}
const NewGroup: FC<IQueryGroupProps> = ({
  defaultInputs,
  isNewRule,
  groups,
  isAndGroupActive,
  setGroupAndOperator,
  isOrGroupActive,
  setGroupOrOperator,
  isAndActive,
  setAndOperator,
  isOrActive,
  setOrOperator,
  isExceptActive,
  setExceptOperator,
  generateRule,
  generateGroup,
  removeRule,
  //rule related props
  labelSelect,
  operator,
  updateLabel,
  properties,
  index,
  selectedOperators,
  updateOperator,
  inputRefs,
  inputValues,
  updateInput,
  allProperties,
  selectedRelatedLabels,
  selectedLabels,
  setRelatedAttributes,
  updateRelatedLabel,
  relatedAttributes,
  isCleared,
  setIsCleared,
}) => {
  return (
    <>
      {groups[index] && groups[index].rules && groups[index].rules.length > 0 && (
        <div className="builder-group-container flex flex-col gap-1">
          {index !== 0 && (
            <div className="builder-group-operators flex flex-row w-1/3 h-10 gap-2">
              <button
                className={
                  isAndGroupActive[index]
                    ? cn(
                        'builder-and-group',
                        'grow rounded-md border-2  border-purple-400 bg-white',
                      )
                    : cn('builder-and-group', ' grow rounded-md border-2 bg-purple-400')
                }
                onClick={() => setGroupAndOperator(index)}
              >
                And
              </button>
              <button
                className={
                  isOrGroupActive[index]
                    ? cn('builder-or-group', 'grow rounded-md border-2  border-purple-400 bg-white')
                    : cn('builder-or-group', ' grow rounded-md border-2 bg-purple-400')
                }
                onClick={() => setGroupOrOperator(index)}
              >
                Or
              </button>
            </div>
          )}
          <div
            id={'group' + index}
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
                    isAndActive[index]
                      ? cn('builder-and', 'grow rounded-md border-2 bg-purple-400')
                      : cn('builder-and', ' grow rounded-md border-2  border-purple-400 bg-white')
                  }
                  onClick={() => setAndOperator(index)}
                >
                  And
                </button>
                <button
                  className={
                    isOrActive[index]
                      ? cn('builder-or', 'grow rounded-md  border-2 bg-purple-400')
                      : cn(
                          'builder-or',
                          'grow rounded-md border-2 border-purple-400 bg-white hover:bg-sky-700',
                        )
                  }
                  onClick={() => {
                    setOrOperator(index);
                  }}
                >
                  Or
                </button>
                <button
                  className={
                    isExceptActive[index]
                      ? cn('builder-except', 'grow rounded-md  border-2 bg-purple-400')
                      : cn('builder-except', 'grow rounded-md border-2 border-purple-400 bg-white ')
                  }
                  onClick={() => {
                    setExceptOperator(index);
                  }}
                >
                  Except
                </button>
              </div>
              <div className="flex flex-row justify-start gap-1 w-1/6 h-10">
                <button
                  className={cn('builder-rule', 'grow rounded-md bg-purple-400 w-1/2')}
                  onClick={() => generateRule(index)}
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
              {/* Render defaultInputs if they exist and for the first group */}
              {defaultInputs.length > 0 && index === 0 && !isNewRule && (
                <div className="flex flex-col justify-start gap-1">
                  {defaultInputs.map((input: any, inputIndex: number) => (
                    <div className="builder-rule-line flex items-center" key={inputIndex}>
                      <NewRule
                        defaultInput={input}
                        labelSelect={labelSelect}
                        operator={operator}
                        updateLabel={updateLabel}
                        properties={properties}
                        groupIndex={index}
                        ruleIndex={inputIndex}
                        selectedOperators={selectedOperators}
                        updateOperator={updateOperator}
                        inputRefs={inputRefs}
                        inputValues={inputValues}
                        updateInput={updateInput}
                        allProperties={allProperties}
                        selectedRelatedLabels={selectedRelatedLabels}
                        selectedLabels={selectedLabels}
                        setRelatedAttributes={setRelatedAttributes}
                        updateRelatedLabel={updateRelatedLabel}
                        relatedAttributes={relatedAttributes}
                        isCleared={isCleared}
                        setIsCleared={setIsCleared}
                      />
                      <button
                        className={cn(
                          'builder-remove',
                          'bg-white h-fit p-3 rounded-md border-2 border-rose-500 text-rose-500',
                        )}
                        onClick={() => removeRule(index, inputIndex)}
                      >
                        <FaRegTrashAlt />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* Render rules from groups */}
              {(defaultInputs.length === 0 || isNewRule || index > 0) &&
                groups[index]?.rules?.map((_: any, ruleIndex: number) => (
                  <div
                    key={ruleIndex} // Ensure unique key for each rule
                    className={cn('builder-rule-line', 'flex items-center')}
                  >
                    <NewRule
                      defaultInput={null} // No default input for rules from groups
                      labelSelect={labelSelect}
                      operator={operator}
                      updateLabel={updateLabel}
                      properties={properties}
                      groupIndex={index}
                      ruleIndex={ruleIndex}
                      selectedOperators={selectedOperators}
                      updateOperator={updateOperator}
                      inputRefs={inputRefs}
                      inputValues={inputValues}
                      updateInput={updateInput}
                      allProperties={allProperties}
                      selectedRelatedLabels={selectedRelatedLabels}
                      selectedLabels={selectedLabels}
                      setRelatedAttributes={setRelatedAttributes}
                      updateRelatedLabel={updateRelatedLabel}
                      relatedAttributes={relatedAttributes}
                      isCleared={isCleared}
                      setIsCleared={setIsCleared}
                    />
                    <button
                      className={cn(
                        'builder-remove',
                        'bg-white h-fit p-3 rounded-md border-2 border-rose-500 text-rose-500',
                      )}
                      onClick={() => removeRule(index, ruleIndex)}
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

export default NewGroup;
